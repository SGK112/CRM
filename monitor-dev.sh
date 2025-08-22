#!/bin/bash

# Remodely CRM - Development Server Monitor
# This script monitors the servers and restarts them if they crash

FRONTEND_PORT=3000
BACKEND_PORT=3001
CHECK_INTERVAL=10
MAX_RESTARTS=5

restart_count=0

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[MONITOR]${NC} $(date '+%H:%M:%S') - $1"
}

print_success() {
    echo -e "${GREEN}[MONITOR]${NC} $(date '+%H:%M:%S') - $1"
}

print_warning() {
    echo -e "${YELLOW}[MONITOR]${NC} $(date '+%H:%M:%S') - $1"
}

print_error() {
    echo -e "${RED}[MONITOR]${NC} $(date '+%H:%M:%S') - $1"
}

check_port() {
    local port=$1
    local service_name=$2
    
    if curl -s http://localhost:$port > /dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

restart_servers() {
    if [ $restart_count -ge $MAX_RESTARTS ]; then
        print_error "Maximum restart attempts ($MAX_RESTARTS) reached. Stopping monitor."
        exit 1
    fi
    
    restart_count=$((restart_count + 1))
    print_warning "Attempting restart #$restart_count..."
    
    # Kill existing processes
    pkill -f "npm run dev" 2>/dev/null || true
    sleep 5
    
    # Start development server in background
    ./start-dev-robust.sh &
    sleep 30
}

print_success "Starting CRM Development Server Monitor"
print_status "Monitoring ports $FRONTEND_PORT (frontend) and $BACKEND_PORT (backend)"
print_status "Check interval: ${CHECK_INTERVAL}s, Max restarts: $MAX_RESTARTS"

while true; do
    frontend_ok=false
    backend_ok=false
    
    if check_port $FRONTEND_PORT "Frontend"; then
        frontend_ok=true
    fi
    
    if check_port $BACKEND_PORT "Backend"; then
        backend_ok=true
    fi
    
    if [ "$frontend_ok" = true ] && [ "$backend_ok" = true ]; then
        print_success "Both servers running (Frontend:$FRONTEND_PORT, Backend:$BACKEND_PORT)"
        restart_count=0  # Reset restart counter on success
    else
        if [ "$frontend_ok" = false ]; then
            print_error "Frontend server down (port $FRONTEND_PORT)"
        fi
        if [ "$backend_ok" = false ]; then
            print_error "Backend server down (port $BACKEND_PORT)"
        fi
        
        restart_servers
    fi
    
    sleep $CHECK_INTERVAL
done
