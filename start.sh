#!/bin/bash
# UniRAG Startup Script

echo "Starting UniRAG..."

# Define paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"


# Start backend
echo "Starting backend API..."
cd "$BACKEND_DIR"
uvicorn main:app --reload --port 8001 > backend.log 2>&1 &
BACKEND_PID=$!
echo "   Backend started (PID: $BACKEND_PID) - logs: backend/backend.log"

# Wait a moment for backend to initialize
sleep 2

# Start frontend
echo "Starting frontend..."
cd "$FRONTEND_DIR"
npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!
echo "   Frontend started (PID: $FRONTEND_PID) - logs: frontend/frontend.log"

# Wait for frontend to be ready
sleep 3

echo ""
echo "UniRAG is running!"
echo "   Backend:  http://localhost:8001"
echo "   Frontend: http://localhost:5173"
echo ""
echo "To stop the servers, run: ./stop.sh"
echo "Or run: pkill -f 'uvicorn main:app' && pkill -f 'vite'"
