#!/bin/bash

echo "🔧 Fixing backend URL configuration..."

# Define the standard backend URL pattern
STANDARD_BACKEND_URL="const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL || 'http://localhost:3001';"

# Find all route.ts files with hardcoded localhost URLs
find apps/frontend/app/api -name "route.ts" -type f | while read file; do
    echo "Processing: $file"
    
    # Create a temporary file
    temp_file=$(mktemp)
    
    # Replace hardcoded BACKEND_URL patterns with the standard one
    # This handles various patterns like:
    # const BACKEND_URL = "http://localhost:3001"
    # const BACKEND_URL = 'http://localhost:3001'
    # const backendUrl = "http://localhost:3001"
    sed -E "s|const (BACKEND_URL\|backendUrl) = ['\"][^'\"]*['\"];|$STANDARD_BACKEND_URL|g" "$file" > "$temp_file"
    
    # Check if the file was modified
    if ! cmp -s "$file" "$temp_file"; then
        mv "$temp_file" "$file"
        echo "  ✅ Updated $file"
    else
        rm "$temp_file"
        echo "  ⏭️  No changes needed for $file"
    fi
done

echo "✅ Backend URL configuration fixed!"
echo "🔍 All API routes now use: $STANDARD_BACKEND_URL"