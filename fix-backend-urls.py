#!/usr/bin/env python3
import os
import re
import glob

def fix_backend_urls():
    print("🔧 Fixing backend URL configuration with Python...")
    
    # Standard backend URL pattern
    standard_url = "const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL || 'http://localhost:3001';"
    
    # Find all route.ts files
    pattern = "apps/frontend/app/api/**/route.ts"
    files = glob.glob(pattern, recursive=True)
    
    updated_count = 0
    
    for file_path in files:
        print(f"Processing: {file_path}")
        
        try:
            with open(file_path, 'r') as f:
                content = f.read()
            
            original_content = content
            
            # Replace various BACKEND_URL patterns
            patterns = [
                r"const BACKEND_URL = ['\"][^'\"]*['\"];",
                r"const backendUrl = ['\"][^'\"]*['\"];",
            ]
            
            for pattern in patterns:
                content = re.sub(pattern, standard_url, content)
            
            # Check if file was modified
            if content != original_content:
                with open(file_path, 'w') as f:
                    f.write(content)
                print(f"  ✅ Updated {file_path}")
                updated_count += 1
            else:
                print(f"  ⏭️  No changes needed for {file_path}")
                
        except Exception as e:
            print(f"  ❌ Error processing {file_path}: {e}")
    
    print(f"✅ Backend URL configuration fixed! Updated {updated_count} files.")
    print(f"🔍 All API routes now use: {standard_url}")

if __name__ == "__main__":
    fix_backend_urls()