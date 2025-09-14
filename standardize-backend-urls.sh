#!/bin/bash
# Script to standardize backend URL configuration across all API routes

echo "🔧 Standardizing backend URL configuration..."

# Define the standard backend URL pattern
STANDARD_PATTERN="const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL || 'http://localhost:3001';"

# Find all route.ts files in the API directory
find apps/frontend/app/api -name "route.ts" -type f | while read -r file; do
  echo "Processing: $file"
  
  # Replace various patterns with the standard one
  sed -i '' -E "s|const BACKEND_URL = [^;]+;|$STANDARD_PATTERN|g" "$file"
  sed -i '' -E "s|const backendUrl = [^;]+;|$STANDARD_PATTERN|g" "$file"
  sed -i '' -E "s|process\.env\.NEXT_PUBLIC_.*_URL \|\| 'http://localhost:3001'|process.env.NEXT_PUBLIC_API_URL \|\| process.env.BACKEND_URL \|\| 'http://localhost:3001'|g" "$file"
done

echo "✅ Backend URL configuration standardized!"
echo "🔍 All API routes now use: $STANDARD_PATTERN"