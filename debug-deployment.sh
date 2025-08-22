#!/bin/bash

echo "🚀 Quick Deployment Fix"
echo "======================"

# Test if we can build locally first
echo "🔧 Testing local builds..."

# Backend build test
echo "Testing backend build..."
cd apps/backend
npm install
npm run build
if [ $? -eq 0 ]; then
    echo "✅ Backend builds successfully"
else
    echo "❌ Backend build failed"
    exit 1
fi

cd ../..

# Frontend build test
echo "Testing frontend build..."
cd apps/frontend
npm install
npm run build
if [ $? -eq 0 ]; then
    echo "✅ Frontend builds successfully"
else
    echo "❌ Frontend build failed"
    exit 1
fi

cd ../..

echo ""
echo "✅ All builds successful locally!"
echo ""
echo "The issue is likely with the Render deployment configuration."
echo "Let's try deploying each service separately..."
