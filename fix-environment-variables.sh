#!/bin/bash

# Script to replace NEXT_PUBLIC_BACKEND_URL with NEXT_PUBLIC_API_URL in all TypeScript files

echo "Replacing NEXT_PUBLIC_BACKEND_URL with NEXT_PUBLIC_API_URL in all TypeScript route files..."

# Find all TypeScript files and replace the environment variable
find apps/frontend -name "*.ts" -type f | xargs grep -l "NEXT_PUBLIC_BACKEND_URL" | while read file; do
    echo "Updating $file"
    sed -i '' 's/process\.env\.NEXT_PUBLIC_BACKEND_URL/process.env.NEXT_PUBLIC_API_URL/g' "$file"
done

echo "✅ Environment variable standardization complete!"
