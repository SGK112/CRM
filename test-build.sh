#!/bin/bash

echo "Testing local build and optimization..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf apps/frontend/.next
rm -rf apps/backend/dist

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build backend
echo "🔧 Building backend..."
time npm run build --workspace=@remodely-crm/backend

# Build frontend
echo "🎨 Building frontend..."
time npm run build --workspace=@remodely-crm/frontend

# Test Docker build for frontend
echo "🐳 Testing Docker build for frontend..."
time docker build -f apps/frontend/Dockerfile -t remodely-frontend-test .

echo "✅ Build test completed!"
echo ""
echo "To test the Docker container:"
echo "docker run -p 3000:3000 -e NODE_ENV=production remodely-frontend-test"
