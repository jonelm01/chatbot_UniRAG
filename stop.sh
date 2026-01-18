#!/bin/bash
# UniRAG Stop Script

echo "Stopping UniRAG..."

#Kill backend
if pkill -f "uvicorn main:app"; then
    echo "   Backend stopped"
else
    echo "   ℹ Backend was not running"
fi

#Kill frontend
if pkill -f "vite"; then
    echo "   Frontend stopped"
else
    echo "   ℹ Frontend was not running"
fi

echo ""
echo "UniRAG has been stopped"
