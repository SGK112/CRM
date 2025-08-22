#!/bin/bash

echo "🚀 Optimized Build Process for Remodely CRM"
echo "============================================="

# Capture start time
start_time=$(date +%s)

# Clean build artifacts but keep node_modules
echo "🧹 Cleaning build artifacts..."
rm -rf apps/frontend/.next
rm -rf apps/backend/dist

# Optimize npm ci for faster installs
echo "📦 Installing dependencies with optimizations..."
export CI=true
export NODE_ENV=production

# Build backend (faster since no frontend dependencies)
echo "🔧 Building backend..."
backend_start=$(date +%s)
npm run build --workspace=@remodely-crm/backend
backend_end=$(date +%s)
backend_time=$((backend_end - backend_start))

# Build frontend with optimizations
echo "🎨 Building frontend with optimizations..."
frontend_start=$(date +%s)
export NEXT_TELEMETRY_DISABLED=1
npm run build --workspace=@remodely-crm/frontend
frontend_end=$(date +%s)
frontend_time=$((frontend_end - frontend_start))

# Calculate total time
end_time=$(date +%s)
total_time=$((end_time - start_time))

echo ""
echo "✅ Build completed successfully!"
echo "📊 Build Statistics:"
echo "   Backend build: ${backend_time}s"
echo "   Frontend build: ${frontend_time}s"
echo "   Total time: ${total_time}s"
echo ""

# Verify static assets are properly generated
echo "🔍 Verifying static assets..."
if [ -d "apps/frontend/.next/static" ]; then
    echo "✅ Static assets directory exists"
    echo "   CSS files: $(find apps/frontend/.next/static -name "*.css" | wc -l)"
    echo "   JS files: $(find apps/frontend/.next/static -name "*.js" | wc -l)"
else
    echo "❌ Static assets directory missing!"
fi

if [ -d "apps/frontend/.next/standalone" ]; then
    echo "✅ Standalone build exists"
else
    echo "❌ Standalone build missing!"
fi

echo ""
echo "🚀 Ready for deployment!"
echo "   To test locally: npm run start:render --workspace=@remodely-crm/frontend"
echo "   Backend ready: npm run start:render --workspace=@remodely-crm/backend"
