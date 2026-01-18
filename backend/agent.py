from langchain_openai import ChatOpenAI
from langchain_core.tools import tool
import langgraph
from langchain.agents import create_agent
from langgraph.checkpoint.postgres import PostgresSaver
import os
import chromadb
from typing import Any, Dict, List
import psycopg
from dotenv import load_dotenv

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
os.environ["OPENAI_API_KEY"] = OPENAI_API_KEY

DB_URI = os.getenv("DB_URI")
os.environ["DB_URI"] = DB_URI

CHROMA_API_KEY = os.getenv("CHROMA_API_KEY")
CHROMA_TENANT = os.getenv("CHROMA_TENANT")
CHROMA_DATABASE = os.getenv("CHROMA_DATABASE")


SYSTEM_PROMPT = "You are a helpful assistant. Remember context. When answering questions based on policy documents, ALWAYS cite your sources using the format [Source: filename] at the end of the relevant sentence or paragraph. Use the information provided by the search tool."


@tool
def search_policies_v1(query: str, n_results: int = 4) -> str:
    """
    Search policy documents in ChromaDB.

    Use this when users ask about company policies, procedures, or guidelines.

    Args:
        query: The user's question about policies
        n_results: Number of documents to retrieve (default: 4)

    Returns:
        Formatted string with relevant policy information
    """
    # ChromaDB client config
    client = chromadb.CloudClient(
        api_key=CHROMA_API_KEY,
        tenant=CHROMA_TENANT,
        database=CHROMA_DATABASE
    )
    collection = client.get_collection(name="rag_collection")

    results = collection.query(query_texts=[query], n_results=n_results)

    if not results['documents'] or not results['documents'][0]:
        return "No relevant policy information found."

    # Format results with content and metadata (source)
    formatted_results = []
    documents = results['documents'][0]
    metadatas = results['metadatas'][0] if 'metadatas' in results and results['metadatas'] else []

    for i, doc in enumerate(documents):
        source = "Unknown"
        if i < len(metadatas) and metadatas[i]:
            source = metadatas[i].get('source', 'Unknown')

        formatted_results.append(f"Content: {doc}\nSource: {source}")

    return "\n\n---\n\n".join(formatted_results)


def get_chat_response(message: str, thread_id: str) -> str:
    """
    Invokes agent interactions for a given message and thread_id.
    """
    config = {"configurable": {"thread_id": thread_id}}

    with PostgresSaver.from_conn_string(DB_URI) as saver:

        llm = create_agent(
            model="openai:gpt-4o-mini",
            tools=[search_policies_v1],
            system_prompt=SYSTEM_PROMPT,
            checkpointer=saver,
            name="policy_agent"
        )

        try:
            result = llm.invoke(
                {"messages": [{"role": "user", "content": message}]},
                config
            )
            response_content = result['messages'][-1].content

            # Filter out empty or whitespace responses
            if not response_content or not response_content.strip():
                return "Sorry, but I couldn't generate a proper response. Please try rephrasing your question."

            return response_content
        except Exception as e:
            print(f"Error invoking agent: {e}")
            raise e


def get_history(thread_id: str) -> List[Dict]:
    """
    Retrieve message history for a thread.
    """
    config = {"configurable": {"thread_id": thread_id}}
    print(f"DEBUG: Fetching history for thread_id: {thread_id}")

    with PostgresSaver.from_conn_string(DB_URI) as saver:
        # Need graph to access get_state 
        llm = create_agent(
            model="openai:gpt-4o-mini",
            tools=[search_policies_v1],
            system_prompt=SYSTEM_PROMPT,
            checkpointer=saver,
            name="policy_agent"
        )

        state = llm.get_state(config)
        print(f"DEBUG: State retrieved: {state}")

        if not state or not state.values:
            print("DEBUG: No state found.")
            return []

        messages = state.values.get("messages", [])
        print(f"DEBUG: Found {len(messages)} messages.")

        return [
            {
                "role": "user" if msg.type in ["human", "user"] else "assistant" if msg.type == "ai" else msg.type,
                "content": msg.content
            }
            for msg in messages
            if msg.type in ["human", "user", "ai"] and msg.content and msg.content.strip()
        ]


def delete_history(thread_id: str) -> None:
    """
    Delete message history for a thread.
    """
    print(f"DEBUG: Deleting history for thread_id: {thread_id}")
    try:
        with psycopg.connect(DB_URI) as conn:
            with conn.cursor() as cur:
                #Delete from standard LangGraph tables
                cur.execute(
                    "DELETE FROM checkpoints WHERE thread_id = %s", (thread_id,))
                cur.execute(
                    "DELETE FROM checkpoint_writes WHERE thread_id = %s", (thread_id,))
                # Also delete from checkpoint_blobs if exists
                cur.execute(
                    "DELETE FROM checkpoint_blobs WHERE thread_id = %s", (thread_id,))
            conn.commit()
            print(f"DEBUG: Successfully deleted history for {thread_id}")
    except Exception as e:
        print(f"ERROR: Failed to delete history for {thread_id}: {e}")
        #Don't raise, just log error if table doesn't exist 
