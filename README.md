# UniRAG Web App

UniRAG is a full-stack RAG (Retrieval-Augmented Generation) chat application that provides intelligent answers with citations to policy documents. Features a modern Chat-GPT inspired sage green themed interface.

## Quick Start

### 1. Create and Set Up Virtual Environment

**Create and Activate a Python virtual environment:**
```bash
# Navigate to the project directory
cd chatbot_UniRAG

# Create virtual environment
python3 -m venv venv

# Activate venv
source venv/bin/activate
```

### 2. Install Dependencies

**Backend:**
```bash

cd backend
pip install fastapi uvicorn langchain langchain-openai langchain-community psycopg2-binary chromadb
```

**Frontend:**
```bash
cd ../frontend
npm install
```

### 3. Run the Application


```bash
# Ensure you are in the project root and venv is active
cd chatbot_UniRAG
source venv/bin/activate

# Run the start script
./start.sh
```

This will start both the backend and frontend. Open your browser to **http://localhost:5173**

**To stop:**
```bash
./stop.sh
```

---

## Manual Start (Alternative)

If you prefer to run each service yourself:

**Terminal 1 - Backend:**
```bash
cd chatbot_UniRAG
source venv/bin/activate
cd backend
uvicorn main:app --reload --port 8001
```

**Terminal 2 - Frontend:**
```bash
cd chatbot_UniRAG/frontend
npm run dev
```

---

## Requirements

- **Python 3.10+** (will create virtual environment in project directory)
- **Node.js 18+** with npm
- **ChromaDB Cloud** account (vector database for document retrieval)
- **PostgreSQL** (Supabase) for chat history persistence

## Features

- 💬 Persistent chat history across sessions
- 📚 Source citations from policy documents
- 🗑️ Delete individual chat threads
- 🎨 Custom Sage Green theme
- 📱 Responsive design

## Troubleshooting

**Backend won't start:**
- Make sure you activated the virtual environment: `source venv/bin/activate` (from the `chat_app` directory)
- Verify all dependencies are installed: `pip list | grep fastapi`

**No citations appearing:**
- Verify ChromaDB Cloud credentials in `backend/agent.py`
- Check that the collection "rag_collection" exists in your ChromaDB Cloud account

**500 errors:**
- Check backend logs: `tail -f backend/backend.log`
