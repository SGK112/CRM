#!/bin/bash

# Remodely CRM - Robust Development Server Startup Script
# This script ensures clean startup and handles common issues

echo "🚀 Starting Remodely CRM Development Environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Kill any existing processes on our ports
print_status "Cleaning up existing processes..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
# Also ensure frontend dev port is free
lsof -ti:3005 | xargs kill -9 2>/dev/null || true
pkill -f "npm run dev" 2>/dev/null || true
sleep 2

# Check if required files exist
print_status "Checking environment..."
if [ ! -f ".env" ]; then
    print_warning ".env file not found, copying from .env.example"
    cp .env.example .env
fi

if [ ! -f "package.json" ]; then
    print_error "package.json not found! Are you in the correct directory?"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    print_status "Installing dependencies..."
    npm install
fi

# Ensure ports are free
print_status "Verifying ports are available..."
if lsof -i:3000 > /dev/null 2>&1; then
    print_error "Port 3000 is still in use!"
    lsof -i:3000
    exit 1
fi

if lsof -i:3001 > /dev/null 2>&1; then
    print_error "Port 3001 is still in use!"
    lsof -i:3001
    exit 1
fi

if lsof -i:3005 > /dev/null 2>&1; then
    print_error "Port 3005 is still in use!"
    lsof -i:3005
    exit 1
fi

print_success "Ports 3000, 3001 and 3005 are available"

# Start the development server
print_status "Starting development server..."
# Ensure correct frontend URL is propagated for link generation in dev
# Enable in-memory demo users for local development (demo@test.com / demo123)
export USE_DEMO_USERS=${USE_DEMO_USERS:-true}
export FRONTEND_URL=${FRONTEND_URL:-http://localhost:3005}
export NEXT_PUBLIC_FRONTEND_URL=${NEXT_PUBLIC_FRONTEND_URL:-http://localhost:3005}
npm run dev

# If we get here, the server was stopped
print_warning "Development server stopped"
