#!/bin/bash

# Production Deployment Script for Remodely CRM
# This script handles the complete production deployment process

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if Node.js is installed
check_node() {
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        log_error "Node.js version must be 18 or higher. Current version: $(node -v)"
        exit 1
    fi
    
    log_success "Node.js version: $(node -v)"
}

# Check if npm is installed
check_npm() {
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    log_success "npm version: $(npm -v)"
}

# Check environment variables
check_env() {
    log_info "Checking environment variables..."
    
    if [ -z "$MONGODB_URI" ]; then
        log_warning "MONGODB_URI not set - database connection may fail"
    fi
    
    if [ -z "$JWT_SECRET" ]; then
        log_warning "JWT_SECRET not set - authentication may fail"
    fi
    
    if [ -z "$NEXT_PUBLIC_API_URL" ]; then
        log_warning "NEXT_PUBLIC_API_URL not set - frontend API calls may fail"
    fi
    
    log_success "Environment check completed"
}

# Install dependencies
install_deps() {
    log_info "Installing dependencies..."
    
    # Root dependencies
    npm install --production=false
    
    # Backend dependencies
    cd apps/backend
    npm install --production=false
    cd ../..
    
    # Frontend dependencies
    cd apps/frontend
    npm install --production=false
    cd ../..
    
    log_success "Dependencies installed"
}

# Build applications
build_apps() {
    log_info "Building applications..."
    
    # Build shared packages first
    log_info "Building shared packages..."
    npm run build
    
    log_success "All applications built successfully"
}

# Verify builds
verify_builds() {
    log_info "Verifying builds..."
    
    # Check backend build
    if [ ! -f "apps/backend/dist/src/main.js" ]; then
        log_error "Backend build failed - main.js not found"
        exit 1
    fi
    
    # Check frontend build
    if [ ! -d "apps/frontend/.next" ]; then
        log_error "Frontend build failed - .next directory not found"
        exit 1
    fi
    
    # Check standalone build
    if [ ! -f "apps/frontend/.next/standalone/apps/frontend/server.js" ]; then
        log_error "Frontend standalone build failed - server.js not found"
        exit 1
    fi
    
    log_success "Build verification completed"
}

# Health check
health_check() {
    log_info "Performing health check..."
    
    # Check if backend can start (timeout after 30 seconds)
    timeout 30s node apps/backend/dist/src/main.js &
    BACKEND_PID=$!
    sleep 5
    
    if ps -p $BACKEND_PID > /dev/null; then
        log_success "Backend health check passed"
        kill $BACKEND_PID 2>/dev/null || true
    else
        log_error "Backend health check failed"
        exit 1
    fi
}

# Create PM2 ecosystem file
create_pm2_config() {
    log_info "Creating PM2 configuration..."
    
    cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'remodely-crm-backend',
      script: 'apps/backend/dist/src/main.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_file: './logs/backend-combined.log',
      time: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '1G'
    },
    {
      name: 'remodely-crm-frontend',
      script: 'apps/frontend/.next/standalone/apps/frontend/server.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_file: './logs/frontend-combined.log',
      time: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '512M'
    }
  ]
};
EOF
    
    log_success "PM2 configuration created"
}

# Create log directory
create_logs() {
    mkdir -p logs
    log_success "Log directory created"
}

# Main deployment function
deploy() {
    log_info "🚀 Starting Remodely CRM Production Deployment"
    echo "=================================================="
    
    # Pre-flight checks
    check_node
    check_npm
    check_env
    
    # Create necessary directories
    create_logs
    
    # Build process
    install_deps
    build_apps
    verify_builds
    
    # Health check
    health_check
    
    # PM2 configuration
    create_pm2_config
    
    log_success "🎉 Deployment completed successfully!"
    echo "=================================================="
    echo ""
    log_info "Next steps:"
    echo "1. Start the application: pm2 start ecosystem.config.js"
    echo "2. Save PM2 configuration: pm2 save"
    echo "3. Setup PM2 startup: pm2 startup"
    echo "4. Monitor logs: pm2 logs"
    echo "5. Monitor status: pm2 status"
    echo ""
    log_info "Application URLs (once started):"
    echo "- Frontend: http://localhost:3000"
    echo "- Backend API: http://localhost:3001"
    echo "- Health Check: http://localhost:3001/api/health"
}

# Script options
case "${1:-deploy}" in
    "deploy")
        deploy
        ;;
    "build-only")
        log_info "Building applications only..."
        check_node
        check_npm
        install_deps
        build_apps
        verify_builds
        log_success "Build completed!"
        ;;
    "health-check")
        log_info "Running health check only..."
        check_node
        health_check
        log_success "Health check completed!"
        ;;
    "pm2-config")
        log_info "Creating PM2 configuration only..."
        create_logs
        create_pm2_config
        log_success "PM2 configuration created!"
        ;;
    "help")
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  deploy       - Full deployment (default)"
        echo "  build-only   - Build applications only"
        echo "  health-check - Run health check only"
        echo "  pm2-config   - Create PM2 configuration only"
        echo "  help         - Show this help message"
        ;;
    *)
        log_error "Unknown command: $1"
        echo "Use '$0 help' for usage information"
        exit 1
        ;;
esac
