#!/bin/bash

# Script to fix light theme issues across all standardized dashboard pages

echo "Fixing light theme issues in dashboard pages..."

# Define the pages that need fixing
PAGES=(
  "/Users/homepc/CRM-3/apps/frontend/src/app/dashboard/calendars/page.tsx"
  "/Users/homepc/CRM-3/apps/frontend/src/app/dashboard/sales/page.tsx"
  "/Users/homepc/CRM-3/apps/frontend/src/app/dashboard/analytics/page.tsx"
)

# Backup original files
for page in "${PAGES[@]}"; do
  if [ -f "$page" ]; then
    cp "$page" "$page.backup"
    echo "Backed up $page"
  fi
done

# Function to apply common theme fixes
apply_theme_fixes() {
  local file="$1"
  
  # Replace common hardcoded text color classes
  sed -i '' 's/text-gray-900 dark:text-white/theme-text/g' "$file"
  sed -i '' 's/text-gray-800 dark:text-white/theme-text/g' "$file"
  sed -i '' 's/text-gray-700 dark:text-white/theme-text/g' "$file"
  sed -i '' 's/text-gray-600 dark:text-gray-400/theme-text-muted/g' "$file"
  sed -i '' 's/text-gray-500 dark:text-gray-400/theme-text-muted/g' "$file"
  sed -i '' 's/text-gray-400 dark:text-gray-300/theme-text-faint/g' "$file"
  
  # Replace background classes
  sed -i '' 's/bg-white dark:bg-gray-800/theme-surface-1/g' "$file"
  sed -i '' 's/bg-gray-50 dark:bg-gray-800/theme-surface-2/g' "$file"
  sed -i '' 's/bg-gray-100 dark:bg-gray-800/theme-surface-2/g' "$file"
  sed -i '' 's/bg-gray-200 dark:bg-gray-700/theme-surface-3/g' "$file"
  
  # Replace border classes
  sed -i '' 's/border-gray-200 dark:border-gray-600/theme-border/g' "$file"
  sed -i '' 's/border-gray-300 dark:border-gray-600/theme-border/g' "$file"
  sed -i '' 's/border-gray-200 dark:border-gray-700/theme-border/g' "$file"
  
  # Replace form input classes
  sed -i '' 's/bg-white dark:bg-gray-800 text-gray-900 dark:text-white/theme-input/g' "$file"
  
  echo "Applied theme fixes to $file"
}

# Apply fixes to each page
for page in "${PAGES[@]}"; do
  if [ -f "$page" ]; then
    apply_theme_fixes "$page"
  else
    echo "Warning: $page not found"
  fi
done

echo "Theme fixes completed!"
echo "To restore original files, use: cp *.backup [original_name]"
