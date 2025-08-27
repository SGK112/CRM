#!/bin/bash

# 🚀 CRM Development Terminal Setup
# This script optimizes your terminal for CRM development

echo "🧹 Setting up optimal terminal environment..."

# Set optimal terminal preferences
export TERM=xterm-256color
export EDITOR="code"

# Create useful aliases for CRM development
alias crm-dev="cd /Users/homepc/CRM-3 && ./start-dev-robust.sh"
alias crm-stop="pkill -f 'npm run dev' && lsof -ti:3000,3001 | xargs kill -9 2>/dev/null || true"
alias crm-clean="rm -rf apps/frontend/.next/cache && echo '✅ Cache cleared'"
alias crm-fresh="rm -rf node_modules apps/*/node_modules packages/*/node_modules && npm install"
alias crm-status="lsof -i:3000,3001 && ps aux | grep -E '(nest|3000|3001)' | grep -v grep"
alias crm-logs="tail -f apps/frontend/.next/trace"
alias crm-git="git status && echo '' && git log --oneline -5"

# Project navigation aliases
alias goto-frontend="cd /Users/homepc/CRM-3/apps/frontend"
alias goto-backend="cd /Users/homepc/CRM-3/apps/backend"
alias goto-shared="cd /Users/homepc/CRM-3/packages/shared"
alias goto-root="cd /Users/homepc/CRM-3"

# Development shortcuts
alias fe="npm run frontend:dev"
alias be="npm run backend:dev"
alias full="npm run dev"
alias build-all="npm run build"
alias test-all="npm test"
alias lint-fix="npm run lint -- --fix"

# Quick file access
alias edit-package="code package.json"
alias edit-readme="code README.md"
alias edit-env="code .env.local"

# Git shortcuts for CRM
alias gs="git status"
alias ga="git add ."
alias gc="git commit -m"
alias gp="git push"
alias gl="git log --oneline -10"
alias gd="git diff"

# Terminal productivity
alias ll="ls -la"
alias la="ls -A"
alias l="ls -CF"
alias ..="cd .."
alias ...="cd ../.."
alias h="history"
alias c="clear"

# Function to quickly create new components
function new-component() {
    if [ -z "$1" ]; then
        echo "Usage: new-component ComponentName"
        return 1
    fi
    
    local component_name="$1"
    local component_dir="apps/frontend/src/components/$component_name"
    
    mkdir -p "$component_dir"
    
    cat > "$component_dir/$component_name.tsx" << EOF
import React from 'react';

interface ${component_name}Props {
  // Add your props here
}

const $component_name: React.FC<${component_name}Props> = () => {
  return (
    <div className="$component_name">
      <h1>$component_name Component</h1>
    </div>
  );
};

export default $component_name;
EOF
    
    echo "✅ Created component: $component_dir/$component_name.tsx"
    code "$component_dir/$component_name.tsx"
}

# Function to quickly create new pages
function new-page() {
    if [ -z "$1" ]; then
        echo "Usage: new-page page-name"
        return 1
    fi
    
    local page_name="$1"
    local page_dir="apps/frontend/src/app/$page_name"
    
    mkdir -p "$page_dir"
    
    cat > "$page_dir/page.tsx" << EOF
'use client';

import React from 'react';
import Layout from '../../components/Layout';

export default function ${page_name^}Page() {
  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">${page_name^} Page</h1>
        <p>This is the $page_name page.</p>
      </div>
    </Layout>
  );
}
EOF
    
    echo "✅ Created page: $page_dir/page.tsx"
    code "$page_dir/page.tsx"
}

# Function to show CRM project status
function crm-overview() {
    echo "📊 CRM Project Overview"
    echo "======================"
    echo "📍 Location: $(pwd)"
    echo "🌿 Branch: $(git branch --show-current 2>/dev/null || echo 'Not a git repo')"
    echo "📦 Node: $(node --version 2>/dev/null || echo 'Not installed')"
    echo "📦 NPM: $(npm --version 2>/dev/null || echo 'Not installed')"
    echo ""
    echo "🚦 Services Status:"
    if lsof -i:3000 >/dev/null 2>&1; then
        echo "✅ Frontend (3000): Running"
    else
        echo "❌ Frontend (3000): Stopped"
    fi
    
    if lsof -i:3001 >/dev/null 2>&1; then
        echo "✅ Backend (3001): Running"
    else
        echo "❌ Backend (3001): Stopped"
    fi
    echo ""
    echo "📁 Recent files:"
    find . -name "*.tsx" -o -name "*.ts" -not -path "./node_modules/*" -not -path "./.next/*" | head -5
}

# Set up completion for our custom functions
complete -W "frontend backend shared root" goto-
complete -F _git gs ga gc gp gl gd

echo "✅ Terminal setup complete!"
echo ""
echo "🎯 Available commands:"
echo "  crm-dev     - Start development servers"
echo "  crm-stop    - Stop all servers"
echo "  crm-clean   - Clean cache"
echo "  crm-status  - Check server status"
echo "  crm-overview- Show project overview"
echo "  new-component <name> - Create new React component"
echo "  new-page <name>      - Create new Next.js page"
echo ""
echo "📁 Navigation:"
echo "  goto-frontend, goto-backend, goto-shared, goto-root"
echo ""
echo "🚀 Quick start: Run 'crm-dev' to start development!"

# Auto-navigate to project root if not already there
if [[ ! "$(pwd)" == *"CRM-3"* ]]; then
    cd /Users/homepc/CRM-3
    echo "📍 Navigated to CRM project root"
fi

# Show overview
crm-overview
