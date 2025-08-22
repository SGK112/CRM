#!/bin/bash
# Deployment verification script for Render

set -e

echo "🔍 Verifying deployment configuration..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Run this from the root directory."
    exit 1
fi

# Check required files
echo "📋 Checking required files..."
files=("apps/frontend/package.json" "apps/backend/package.json" "apps/frontend/next.config.js")
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file missing"
        exit 1
    fi
done

# Verify build commands work locally
echo "🔨 Testing build commands..."

echo "Building backend..."
if npm run build --workspace=@remodely-crm/backend; then
    echo "✅ Backend build successful"
else
    echo "❌ Backend build failed"
    exit 1
fi

echo "Building frontend..."
if npm run build --workspace=@remodely-crm/frontend; then
    echo "✅ Frontend build successful"
else
    echo "❌ Frontend build failed"
    exit 1
fi

echo "🎉 All checks passed! Ready for deployment."
echo ""
echo "📝 Deployment checklist:"
echo "1. Set environment variables in Render dashboard:"
echo "   Frontend: NEXT_PUBLIC_API_URL, NEXT_PUBLIC_FRONTEND_URL"
echo "   Backend: MONGODB_URI, JWT_SECRET, FRONTEND_URL, CORS_ORIGINS"
echo "2. Configure Google OAuth with production URLs"
echo "3. Deploy backend service first, then frontend"
echo "4. Test the /health endpoint on backend"
echo "5. Test the login flow on frontend"
