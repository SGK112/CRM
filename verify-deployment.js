#!/usr/bin/env node

/**
 * Post-Deployment Verification Script
 * Run this after pushing to Render to verify everything is working
 */

const axios = require('axios').default;

const PRODUCTION_URLS = {
  backend: 'https://remodely-crm-backend.onrender.com',
  frontend: 'https://remodely-crm-frontend.onrender.com'
};

const ENDPOINTS_TO_TEST = [
  { name: 'Backend Health', url: `${PRODUCTION_URLS.backend}/api/health`, expected: 200 },
  { name: 'API Documentation', url: `${PRODUCTION_URLS.backend}/api/docs`, expected: 200 },
  { name: 'Frontend Homepage', url: PRODUCTION_URLS.frontend, expected: 200 },
  { name: 'Registration Page', url: `${PRODUCTION_URLS.frontend}/auth/register`, expected: 200 },
  { name: 'Login Page', url: `${PRODUCTION_URLS.frontend}/auth/login`, expected: 200 }
];

async function testEndpoint(name, url, expectedStatus = 200) {
  try {
    console.log(`🔍 Testing ${name}...`);
    const response = await axios.get(url, { timeout: 30000 });
    
    if (response.status === expectedStatus) {
      console.log(`✅ ${name}: OK (${response.status})`);
      return true;
    } else {
      console.log(`⚠️  ${name}: Unexpected status ${response.status}`);
      return false;
    }
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      console.log(`⏰ ${name}: Timeout (Render service may be starting up)`);
    } else if (error.response) {
      console.log(`❌ ${name}: HTTP ${error.response.status}`);
    } else {
      console.log(`❌ ${name}: ${error.message}`);
    }
    return false;
  }
}

async function testCommunications() {
  console.log(`🔍 Testing Communications Configuration...`);
  try {
    const response = await axios.get(`${PRODUCTION_URLS.backend}/api/communications/status`, { 
      timeout: 30000 
    });
    
    const { email, sms } = response.data;
    console.log(`📧 Email Provider: ${email?.configured ? '✅ Ready' : '❌ Not configured'}`);
    console.log(`📱 SMS Provider: ${sms?.configured ? '✅ Ready' : '❌ Not configured'}`);
    
    return { email: email?.configured, sms: sms?.configured };
  } catch (error) {
    if (error.response?.status === 401) {
      console.log(`🔐 Communications config requires authentication (normal in production)`);
      return { email: null, sms: null };
    }
    console.log(`❌ Communications check failed: ${error.message}`);
    return { email: false, sms: false };
  }
}

async function main() {
  console.log('🚀 Render Deployment Verification');
  console.log('='.repeat(50));
  console.log(`🔗 Backend: ${PRODUCTION_URLS.backend}`);
  console.log(`🔗 Frontend: ${PRODUCTION_URLS.frontend}`);
  console.log('='.repeat(50));
  
  let passed = 0;
  let total = ENDPOINTS_TO_TEST.length;
  
  console.log('🔍 Testing Core Endpoints...');
  for (const { name, url, expected } of ENDPOINTS_TO_TEST) {
    const success = await testEndpoint(name, url, expected);
    if (success) passed++;
    await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limiting
  }
  
  console.log('\n🔍 Testing Communications...');
  const comms = await testCommunications();
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 DEPLOYMENT VERIFICATION RESULTS');
  console.log('='.repeat(50));
  console.log(`✅ Core Services: ${passed}/${total} working`);
  
  if (comms.email !== null) {
    console.log(`📧 Email: ${comms.email ? 'Configured' : 'Not configured'}`);
  }
  if (comms.sms !== null) {
    console.log(`📱 SMS: ${comms.sms ? 'Configured' : 'Not configured'}`);
  }
  
  console.log('\n🎯 DEPLOYMENT STATUS:');
  if (passed === total) {
    console.log('✅ SUCCESS: All core services are running!');
    console.log('🎉 Your CRM is live and ready for users');
    
    console.log('\n🔗 Live URLs:');
    console.log(`Frontend: ${PRODUCTION_URLS.frontend}`);
    console.log(`API Docs: ${PRODUCTION_URLS.backend}/api/docs`);
    
    console.log('\n📋 Next Steps:');
    console.log('1. ✅ Test user registration and login');
    console.log('2. ✅ Verify email/SMS communications if configured');
    console.log('3. ✅ Test full CRM workflows');
    console.log('4. ✅ Share with your team!');
    
  } else if (passed >= total * 0.5) {
    console.log('⚠️  PARTIAL: Some services are running, others may still be starting');
    console.log('⏰ Render services can take a few minutes to fully start up');
    console.log('🔄 Try running this script again in 2-3 minutes');
    
  } else {
    console.log('❌ FAILURE: Most services are not responding');
    console.log('📊 Check your Render dashboard for build/deployment logs');
    console.log('🔧 Verify environment variables are correctly set');
  }
  
  console.log('\n💡 For detailed testing:');
  console.log('node test-production-ready.js --prod');
}

if (require.main === module) {
  main();
}

module.exports = { main };
