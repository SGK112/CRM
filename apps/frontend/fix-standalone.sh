#!/bin/bash
# Post-build script to fix standalone mode static assets

echo "🔧 Fixing standalone mode static assets..."

# Check if we're in standalone mode
if [ -d ".next/standalone" ] && [ -d ".next/static" ]; then
  echo "📁 Copying static assets to standalone build..."
  
  # Create the target directory if it doesn't exist
  mkdir -p .next/standalone/apps/frontend/.next
  
  # Copy static files
  cp -r .next/static .next/standalone/apps/frontend/.next/
  echo "✅ Static files copied successfully"
  
  # Also copy public files if they exist
  if [ -d "public" ]; then
    cp -r public .next/standalone/apps/frontend/
    echo "✅ Public files copied successfully"
  fi
  
  echo "🎉 Standalone mode static assets are ready!"
else
  echo "⚠️  Not a standalone build or static files missing"
fi
