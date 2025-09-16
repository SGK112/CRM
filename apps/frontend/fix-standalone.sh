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
    mkdir -p .next/standalone/apps/frontend/public
    cp -r public/* .next/standalone/apps/frontend/public/
    echo "✅ Public files copied successfully"
    
    # Specifically ensure manifest.json is copied
    if [ -f "public/manifest.json" ]; then
      cp public/manifest.json .next/standalone/apps/frontend/public/
      echo "✅ manifest.json copied to standalone build"
    fi
    
    # Ensure favicon.svg is copied
    if [ -f "public/favicon.svg" ]; then
      cp public/favicon.svg .next/standalone/apps/frontend/public/
      echo "✅ favicon.svg copied to standalone build"
    fi
  fi
  
  # List contents to verify
  echo "📋 Verifying standalone build structure:"
  ls -la .next/standalone/apps/frontend/public/ 2>/dev/null || echo "⚠️  Public directory not found in standalone build"
  
  echo "🎉 Standalone mode static assets are ready!"
else
  echo "⚠️  Not a standalone build or static files missing"
fi
