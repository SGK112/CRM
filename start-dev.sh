#!/bin/bash

# Remodely CRM Development Startup Script

echo "🏗️  Starting Remodely CRM Development Environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm and try again."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if MongoDB is running (optional check)
echo "🔍 Checking MongoDB connection..."
if ! timeout 5 bash -c 'echo > /dev/tcp/localhost/27017' 2>/dev/null; then
    echo "⚠️  Warning: MongoDB is not running on localhost:27017"
    echo "   You can:"
    echo "   1. Start MongoDB locally"
    echo "   2. Use MongoDB Atlas (cloud)"
    echo "   3. Run: docker-compose up mongodb"
    echo ""
fi

# Create environment file if it doesn't exist
if [ ! -f "apps/backend/.env" ]; then
    echo "📝 Creating backend environment file..."
    cp apps/backend/.env apps/backend/.env.example 2>/dev/null || echo "Environment file template not found"
fi

if [ ! -f "apps/frontend/.env.local" ]; then
    echo "📝 Creating frontend environment file..."
    cat > apps/frontend/.env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=Remodely CRM
NEXT_PUBLIC_APP_DESCRIPTION=Enterprise CRM for Construction Companies
EOF
fi

echo ""
echo "🚀 Starting development servers..."
echo ""
echo "Backend will run on: http://localhost:3001"
echo "Frontend will run on: http://localhost:3000"
echo "API Docs will be at: http://localhost:3001/api/docs"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Start both servers concurrently
npm run backend:dev &
BACKEND_PID=$!

sleep 3

npm run frontend:dev &
FRONTEND_PID=$!

# Function to kill both processes
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set trap to cleanup on exit
trap cleanup SIGINT SIGTERM

# Wait for processes
wait
