#!/usr/bin/env node

/**
 * Test script to verify estimate and invoice routing and functionality
 * This checks that all the routes exist and are properly configured
 */

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

async function testRouting() {
  log('\n🔍 Testing Estimate & Invoice Routing Configuration\n', 'cyan');
  
  const baseUrl = 'http://localhost:3005';
  
  const routes = [
    { name: 'Dashboard', url: '/dashboard', expected: 200 },
    { name: 'Clients List', url: '/dashboard/clients', expected: 200 },
    { name: 'Estimates List', url: '/dashboard/estimates', expected: 200 },
    { name: 'New Estimate Form', url: '/dashboard/estimates/new', expected: 200 },
    { name: 'Invoices List', url: '/dashboard/invoices', expected: 200 },
    { name: 'New Invoice Form', url: '/dashboard/invoices/new', expected: 200 },
    { name: 'Financial Dashboard', url: '/dashboard/financial', expected: 200 },
  ];

  const fetch = (await import('node-fetch')).default;
  
  for (const route of routes) {
    try {
      const response = await fetch(baseUrl + route.url);
      if (response.status === route.expected) {
        log(`✅ ${route.name}: ${route.url}`, 'green');
      } else {
        log(`❌ ${route.name}: ${route.url} (Status: ${response.status})`, 'red');
      }
    } catch (error) {
      log(`❌ ${route.name}: ${route.url} (Error: ${error.message})`, 'red');
    }
  }
  
  log('\n📋 API Endpoints (these may require authentication):', 'cyan');
  
  const apiRoutes = [
    { name: 'Clients API', url: '/api/clients' },
    { name: 'Estimates API', url: '/api/estimates' },
    { name: 'Invoices API', url: '/api/invoices' },
    { name: 'Auth API', url: '/api/auth/login' },
  ];
  
  for (const route of apiRoutes) {
    try {
      const response = await fetch(baseUrl + route.url);
      if (response.status === 401) {
        log(`✅ ${route.name}: ${route.url} (Protected - requires auth)`, 'yellow');
      } else if (response.status === 200) {
        log(`✅ ${route.name}: ${route.url} (Accessible)`, 'green');
      } else {
        log(`⚠️  ${route.name}: ${route.url} (Status: ${response.status})`, 'yellow');
      }
    } catch (error) {
      log(`❌ ${route.name}: ${route.url} (Error: ${error.message})`, 'red');
    }
  }
  
  log('\n🌐 Manual Testing URLs:', 'blue');
  log(`📊 Main Dashboard: ${baseUrl}/dashboard`, 'cyan');
  log(`👥 Clients: ${baseUrl}/dashboard/clients`, 'cyan');
  log(`📋 Estimates: ${baseUrl}/dashboard/estimates`, 'cyan');
  log(`📄 New Estimate: ${baseUrl}/dashboard/estimates/new`, 'cyan');
  log(`🧾 Invoices: ${baseUrl}/dashboard/invoices`, 'cyan');
  log(`📝 New Invoice: ${baseUrl}/dashboard/invoices/new`, 'cyan');
  
  log('\n📝 Workflow Steps to Test Manually:', 'yellow');
  log('1. Go to Clients page and create a new client', 'blue');
  log('2. From the client detail page, click "Create Estimate"', 'blue');
  log('3. Fill out the estimate form with line items', 'blue');
  log('4. Save the estimate', 'blue');
  log('5. From estimate detail, convert to invoice', 'blue');
  log('6. Verify invoice appears in invoices list', 'blue');
  log('7. Check that dashboard shows updated counts', 'blue');
  
  log('\n✅ Route testing complete!', 'green');
}

testRouting().catch(console.error);
