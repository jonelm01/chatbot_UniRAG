from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import ChatRequest, ChatResponse
from agent import get_chat_response, get_history, delete_history
import uvicorn
from typing import List, Dict

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        response_text = get_chat_response(request.message, request.thread_id)
        print(
            f"DEBUG: Returning response: {response_text} for thread: {request.thread_id}")
        return ChatResponse(response=response_text, thread_id=request.thread_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/history/{thread_id}", response_model=List[Dict])
async def history(thread_id: str):
    try:
        messages = get_history(thread_id)
        return messages
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/history/{thread_id}")
async def delete_chat_history(thread_id: str):
    try:
        delete_history(thread_id)
        return {"status": "deleted", "thread_id": thread_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health():
    return {"status": "ok"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
