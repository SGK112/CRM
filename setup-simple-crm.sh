#!/bin/bash

# Simple CRM Setup Script
# This script configures your CRM to use the simplified version without AI features

echo "🎯 Setting up Simple CRM (No AI Features)..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the CRM root directory"
    exit 1
fi

echo "✅ Creating simplified CRM configuration..."

# Create a backup of the current layout
cp apps/frontend/src/components/Layout.tsx apps/frontend/src/components/Layout.backup.tsx

echo "✅ Backed up current layout to Layout.backup.tsx"

# Create simple navigation config
cat > apps/frontend/src/config/simple-nav.ts << 'EOF'
// Simple CRM Navigation Configuration (No AI Features)
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CogIcon
} from '@heroicons/react/24/outline';

export const simpleNavigation = [
  {
    label: 'Core CRM',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
      { name: 'Clients', href: '/dashboard/clients', icon: UserGroupIcon },
      { name: 'Projects', href: '/dashboard/projects', icon: ClipboardDocumentListIcon },
      { name: 'Calendar', href: '/dashboard/calendar', icon: CalendarDaysIcon },
    ]
  },
  {
    label: 'Sales & Finance',
    items: [
      { name: 'Estimates', href: '/dashboard/estimates', icon: CurrencyDollarIcon },
      { name: 'Invoices', href: '/dashboard/invoices', icon: DocumentTextIcon },
      { name: 'Reports', href: '/dashboard/analytics', icon: ChartBarIcon },
    ]
  },
  {
    label: 'Settings', 
    items: [
      { name: 'Settings', href: '/dashboard/settings', icon: CogIcon }
    ]
  }
];

export const hiddenFeatures = [
  '/dashboard/voice-agent',
  '/dashboard/voice-agent-enhanced',
  '/dashboard/inbox',
  '/dashboard/phone-numbers',
  '/dashboard/wallet',
  '/dashboard/marketing',
  '/dashboard/ai-chat',
  '/dashboard/admin'
];
EOF

echo "✅ Created simple navigation configuration"

# Update package.json scripts for simple CRM
cat > simple-crm-commands.txt << 'EOF'
# Simple CRM Commands

## Start Simple CRM
npm run frontend:dev

## Access Simple CRM
http://localhost:3005/dashboard/simple

## Core Features Available:
- Dashboard: Overview and stats
- Clients: Customer management  
- Projects: Project tracking
- Calendar: Appointments
- Estimates: Quotes and proposals
- Invoices: Billing
- Reports: Basic analytics
- Settings: Configuration

## What's NOT included:
- AI features
- Voice agents
- Advanced integrations
- Marketing campaigns
- Wallet features
EOF

echo "✅ Created command reference"

echo ""
echo "🎉 Simple CRM Setup Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Start the development server: npm run frontend:dev"
echo "2. Visit: http://localhost:3005/dashboard/simple"
echo "3. Or access regular dashboard and use simplified features"
echo ""
echo "📖 Features Available:"
echo "  ✅ Dashboard with business metrics"
echo "  ✅ Client management"
echo "  ✅ Project tracking"
echo "  ✅ Calendar & appointments"
echo "  ✅ Estimates & invoices"
echo "  ✅ Basic reporting"
echo "  ✅ Settings"
echo ""
echo "📖 Features Removed:"
echo "  ❌ AI chat assistant"
echo "  ❌ Voice agents"
echo "  ❌ Advanced AI features"
echo "  ❌ Marketing campaigns"
echo "  ❌ Wallet features"
echo ""
echo "💡 To restore full CRM: cp apps/frontend/src/components/Layout.backup.tsx apps/frontend/src/components/Layout.tsx"
echo ""
echo "🚀 Your Simple CRM is ready to use!"
