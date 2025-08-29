#!/bin/bash

# Quick deployment verification script
# This script checks if the deployment is ready and functional

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }

# Configuration
BACKEND_URL="${BACKEND_URL:-http://localhost:3001}"
FRONTEND_URL="${FRONTEND_URL:-http://localhost:3000}"
TIMEOUT=10

echo "🔍 Remodely CRM Deployment Verification"
echo "========================================"

# Check if required commands exist
check_command() {
    if ! command -v $1 &> /dev/null; then
        log_error "$1 is not installed"
        return 1
    fi
    return 0
}

# Test HTTP endpoint
test_endpoint() {
    local url=$1
    local description=$2
    local expected_status=${3:-200}
    
    log_info "Testing $description: $url"
    
    if check_command curl; then
        response=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$url" 2>/dev/null || echo "000")
        
        if [ "$response" = "$expected_status" ]; then
            log_success "$description is responding (HTTP $response)"
            return 0
        else
            log_error "$description failed (HTTP $response)"
            return 1
        fi
    else
        log_warning "curl not available, skipping HTTP test for $description"
        return 1
    fi
}

# Test service connectivity
test_service() {
    local host=$1
    local port=$2
    local description=$3
    
    log_info "Testing $description connectivity: $host:$port"
    
    if check_command nc; then
        if nc -z "$host" "$port" 2>/dev/null; then
            log_success "$description is accessible"
            return 0
        else
            log_error "$description is not accessible"
            return 1
        fi
    elif check_command telnet; then
        if timeout $TIMEOUT telnet "$host" "$port" </dev/null 2>/dev/null | grep -q Connected; then
            log_success "$description is accessible"
            return 0
        else
            log_error "$description is not accessible"
            return 1
        fi
    else
        log_warning "nc and telnet not available, skipping connectivity test for $description"
        return 1
    fi
}

# Check file existence
check_file() {
    local file=$1
    local description=$2
    
    if [ -f "$file" ]; then
        log_success "$description exists: $file"
        return 0
    else
        log_error "$description missing: $file"
        return 1
    fi
}

# Check directory existence
check_directory() {
    local dir=$1
    local description=$2
    
    if [ -d "$dir" ]; then
        log_success "$description exists: $dir"
        return 0
    else
        log_error "$description missing: $dir"
        return 1
    fi
}

# Main verification
main() {
    local errors=0
    
    log_info "Starting verification checks..."
    echo ""
    
    # 1. Check build files
    log_info "📦 Checking build artifacts..."
    check_file "apps/backend/dist/src/main.js" "Backend build" || ((errors++))
    check_directory "apps/frontend/.next" "Frontend build" || ((errors++))
    check_file "apps/frontend/.next/standalone/apps/frontend/server.js" "Frontend standalone build" || ((errors++))
    echo ""
    
    # 2. Check package files
    log_info "📋 Checking package configurations..."
    check_file "package.json" "Root package.json" || ((errors++))
    check_file "apps/backend/package.json" "Backend package.json" || ((errors++))
    check_file "apps/frontend/package.json" "Frontend package.json" || ((errors++))
    echo ""
    
    # 3. Check environment setup
    log_info "🔧 Checking environment setup..."
    if [ -z "$MONGODB_URI" ]; then
        log_warning "MONGODB_URI not set"
        ((errors++))
    else
        log_success "MONGODB_URI is configured"
    fi
    
    if [ -z "$JWT_SECRET" ]; then
        log_warning "JWT_SECRET not set"
        ((errors++))
    else
        log_success "JWT_SECRET is configured"
    fi
    echo ""
    
    # 4. Test backend API (if running)
    log_info "🔌 Testing backend API..."
    test_endpoint "$BACKEND_URL/api/health" "Backend health check" 200
    test_endpoint "$BACKEND_URL/api/auth/profile" "Backend auth endpoint" 401
    echo ""
    
    # 5. Test frontend (if running)
    log_info "🌐 Testing frontend..."
    test_endpoint "$FRONTEND_URL" "Frontend homepage" 200
    echo ""
    
    # 6. Check for common issues
    log_info "🔍 Checking for common issues..."
    
    # Check Node.js version
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$NODE_VERSION" -ge 18 ]; then
            log_success "Node.js version is compatible: $(node -v)"
        else
            log_error "Node.js version is too old: $(node -v). Minimum required: 18.x"
            ((errors++))
        fi
    else
        log_error "Node.js is not installed"
        ((errors++))
    fi
    
    # Check npm version
    if command -v npm &> /dev/null; then
        log_success "npm is available: $(npm -v)"
    else
        log_error "npm is not installed"
        ((errors++))
    fi
    echo ""
    
    # Summary
    echo "========================================"
    if [ $errors -eq 0 ]; then
        log_success "🎉 All verification checks passed!"
        echo ""
        log_info "Your Remodely CRM deployment is ready!"
        echo ""
        log_info "Next steps:"
        echo "1. Start the services: pm2 start ecosystem.config.js"
        echo "2. Monitor with: pm2 status"
        echo "3. View logs with: pm2 logs"
        echo ""
        exit 0
    else
        log_error "❌ $errors verification check(s) failed"
        echo ""
        log_info "Please fix the issues above before deploying to production."
        echo ""
        exit 1
    fi
}

# Script options
case "${1:-verify}" in
    "verify")
        main
        ;;
    "quick")
        log_info "Quick verification (build files only)..."
        errors=0
        check_file "apps/backend/dist/src/main.js" "Backend build" || ((errors++))
        check_directory "apps/frontend/.next" "Frontend build" || ((errors++))
        check_file "apps/frontend/.next/standalone/apps/frontend/server.js" "Frontend standalone build" || ((errors++))
        
        if [ $errors -eq 0 ]; then
            log_success "Quick verification passed!"
        else
            log_error "Quick verification failed!"
            exit 1
        fi
        ;;
    "api")
        log_info "API connectivity test only..."
        test_endpoint "$BACKEND_URL/api/health" "Backend health check" 200
        test_endpoint "$FRONTEND_URL" "Frontend homepage" 200
        ;;
    "help")
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  verify  - Full verification (default)"
        echo "  quick   - Quick build verification only"
        echo "  api     - API connectivity test only"
        echo "  help    - Show this help message"
        echo ""
        echo "Environment variables:"
        echo "  BACKEND_URL  - Backend URL (default: http://localhost:3001)"
        echo "  FRONTEND_URL - Frontend URL (default: http://localhost:3000)"
        ;;
    *)
        log_error "Unknown command: $1"
        echo "Use '$0 help' for usage information"
        exit 1
        ;;
esac
