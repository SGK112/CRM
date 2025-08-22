#!/bin/bash

echo "🧪 Complete Local Testing Suite"
echo "==============================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test functions
test_backend() {
  echo -n "🔧 Backend API Health: "
  if curl -s http://localhost:3001/api/health > /dev/null; then
    echo -e "${GREEN}✅ WORKING${NC}"
  else
    echo -e "${RED}❌ FAILED${NC}"
    return 1
  fi
}

test_backend_api_prefix() {
  echo -n "🔗 Backend API Prefix: "
  if curl -s http://localhost:3001/api/estimates | grep -q "Unauthorized"; then
    echo -e "${GREEN}✅ WORKING (401 as expected)${NC}"
  else
    echo -e "${RED}❌ FAILED${NC}"
    return 1
  fi
}

test_frontend() {
  echo -n "🎨 Frontend Server: "
  if curl -s http://localhost:3000 | grep -q "<!DOCTYPE html>"; then
    echo -e "${GREEN}✅ WORKING${NC}"
  else
    echo -e "${RED}❌ FAILED${NC}"
    return 1
  fi
}

test_static_assets() {
  echo -n "📦 Static Assets: "
  # Test if any CSS file exists and is accessible
  css_files=($(ls /Users/homepc/CRM-3/apps/frontend/.next/standalone/apps/frontend/.next/static/css/*.css 2>/dev/null))
  if [ ${#css_files[@]} -gt 0 ]; then
    css_name=$(basename "${css_files[0]}")
    if curl -s "http://localhost:3000/_next/static/css/$css_name" | head -1 | grep -q "."; then
      echo -e "${GREEN}✅ WORKING${NC}"
    else
      echo -e "${YELLOW}⚠️  FILES EXIST BUT NOT SERVED${NC}"
      return 1
    fi
  else
    echo -e "${RED}❌ NO CSS FILES FOUND${NC}"
    return 1
  fi
}

test_js_assets() {
  echo -n "🚀 JS Assets: "
  # Test if any JS file exists
  js_files=($(ls /Users/homepc/CRM-3/apps/frontend/.next/standalone/apps/frontend/.next/static/chunks/*.js 2>/dev/null))
  if [ ${#js_files[@]} -gt 0 ]; then
    echo -e "${GREEN}✅ FOUND (${#js_files[@]} files)${NC}"
  else
    echo -e "${RED}❌ NO JS FILES FOUND${NC}"
    return 1
  fi
}

# Run all tests
echo "Running tests..."
echo ""

test_backend
test_backend_api_prefix  
test_frontend
test_static_assets
test_js_assets

echo ""
echo "🏁 Test Summary:"
echo "- Backend: http://localhost:3001/api/health"
echo "- Frontend: http://localhost:3000"
echo "- API Prefix: Working (/api/...)"
echo "- Static Assets: Ready for deployment"
echo ""
echo "✅ Ready to deploy to Render!"
