#!/usr/bin/env node

/**
 * Production Environment Test for Render Deployment
 * Tests the deployed CRM system on Render with configured email/SMS providers
 */

const axios = require('axios').default;

// Production URLs
const PRODUCTION_CONFIG = {
  apiUrl: 'https://remodely-crm-backend.onrender.com',
  frontendUrl: 'https://remodely-crm-frontend.onrender.com'
};

const TEST_EMAIL = 'joshb@surprisegranite.com';

console.log('🚀 Testing Production Deployment on Render');
console.log('=' .repeat(60));
console.log(`🌐 Frontend: ${PRODUCTION_CONFIG.frontendUrl}`);
console.log(`📡 Backend: ${PRODUCTION_CONFIG.apiUrl}`);
console.log(`📧 Test Email: ${TEST_EMAIL}`);
console.log('=' .repeat(60));

const api = axios.create({
  baseURL: PRODUCTION_CONFIG.apiUrl,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
});

function log(emoji, message, data = null) {
  const timestamp = new Date().toISOString();
  console.log(`${emoji} [${timestamp}] ${message}`);
  if (data) console.log(JSON.stringify(data, null, 2));
}

async function testProductionHealth() {
  log('🏥', 'Testing production health...');
  try {
    const response = await api.get('/api/health');
    log('✅', 'Production health check passed', response.data);
    return true;
  } catch (error) {
    log('❌', 'Production health check failed', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    });
    return false;
  }
}

async function testCommunicationsConfig() {
  log('⚙️', 'Testing production communications config...');
  try {
    // Test without auth first
    const response = await api.get('/api/communications/status');
    log('✅', 'Communications config accessible', response.data);

    const { email, sms } = response.data;
    const emailConfigured = email?.configured || false;
    const smsConfigured = sms?.configured || false;

    log('📧', `Email Provider: ${emailConfigured ? '✅ Configured' : '❌ Not configured'}`);
    log('📱', `SMS Provider: ${smsConfigured ? '✅ Configured' : '❌ Not configured'}`);

    return { emailConfigured, smsConfigured };
  } catch (error) {
    if (error.response?.status === 401) {
      log('ℹ️', 'Communications config requires authentication in production');
      return { emailConfigured: null, smsConfigured: null };
    }
    log('❌', 'Communications config check failed', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    });
    return { emailConfigured: false, smsConfigured: false };
  }
}

async function testFrontendAccess() {
  log('🌐', 'Testing frontend accessibility...');
  try {
    const response = await axios.get(PRODUCTION_CONFIG.frontendUrl, { timeout: 10000 });
    if (response.status === 200) {
      log('✅', 'Frontend is accessible');
      return true;
    }
  } catch (error) {
    log('❌', 'Frontend accessibility failed', {
      status: error.response?.status,
      message: error.message
    });
  }
  return false;
}

async function testRegistrationEndpoint() {
  log('📝', 'Testing registration endpoint...');

  const testUser = {
    email: `test+${Date.now()}@example.com`,
    password: 'TestPassword123!',
    firstName: 'Test',
    lastName: 'User',
    workspaceName: 'Test Workspace',
    phone: '+15551234567'
  };

  try {
    const response = await api.post('/api/auth/register', testUser);
    log('✅', 'Registration endpoint working', {
      status: response.status,
      hasUser: !!response.data.user
    });
    return true;
  } catch (error) {
    if (error.response?.status === 409) {
      log('ℹ️', 'Registration endpoint working (user already exists)');
      return true;
    }
    log('❌', 'Registration endpoint failed', {
      status: error.response?.status,
      data: error.response?.data || error.message
    });
    return false;
  }
}

async function testSwaggerDocs() {
  log('📚', 'Testing API documentation...');
  try {
    const response = await api.get('/api/docs');
    if (response.status === 200) {
      log('✅', 'API documentation accessible');
      return true;
    }
  } catch (error) {
    // Try HTML endpoint
    try {
      const htmlResponse = await axios.get(`${PRODUCTION_CONFIG.apiUrl}/api/docs`, {
        timeout: 10000,
        headers: { 'Accept': 'text/html' }
      });
      if (htmlResponse.status === 200) {
        log('✅', 'API documentation accessible (HTML)');
        return true;
      }
    } catch (htmlError) {
      log('❌', 'API documentation not accessible', {
        status: error.response?.status,
        message: error.message
      });
    }
  }
  return false;
}

async function testCorsConfiguration() {
  log('🔒', 'Testing CORS configuration...');
  try {
    // This will be tested implicitly by the frontend making requests
    // For now, just verify the health endpoint accepts requests
    const response = await api.get('/api/health', {
      headers: {
        'Origin': PRODUCTION_CONFIG.frontendUrl,
        'Access-Control-Request-Method': 'GET'
      }
    });
    log('✅', 'CORS configuration appears correct');
    return true;
  } catch (error) {
    log('⚠️', 'CORS configuration may need attention', {
      status: error.response?.status,
      message: error.message
    });
    return false;
  }
}

async function runProductionTests() {
  const results = {};

  console.log('\n🏥 PRODUCTION HEALTH CHECKS');
  console.log('='.repeat(50));
  results.health = await testProductionHealth();
  results.frontend = await testFrontendAccess();

  console.log('\n⚙️ CONFIGURATION CHECKS');
  console.log('='.repeat(50));
  results.communications = await testCommunicationsConfig();
  results.cors = await testCorsConfiguration();

  console.log('\n📡 API ENDPOINT CHECKS');
  console.log('='.repeat(50));
  results.registration = await testRegistrationEndpoint();
  results.docs = await testSwaggerDocs();

  return results;
}

async function printProductionSummary(results) {
  console.log('\n' + '='.repeat(80));
  console.log('📊 PRODUCTION DEPLOYMENT TEST RESULTS');
  console.log('='.repeat(80));

  const tests = [
    ['Backend Health', results.health],
    ['Frontend Accessibility', results.frontend],
    ['Registration API', results.registration],
    ['API Documentation', results.docs],
    ['CORS Configuration', results.cors]
  ];

  let passed = 0;
  const total = tests.length;

  tests.forEach(([name, result]) => {
    if (result) {
      passed++;
      console.log(`✅ ${name}`);
    } else {
      console.log(`❌ ${name}`);
    }
  });

  console.log('\n' + '='.repeat(80));
  console.log(`📈 PRODUCTION SCORE: ${passed}/${total} tests passed (${Math.round(passed/total*100)}%)`);

  if (results.communications) {
    const { emailConfigured, smsConfigured } = results.communications;
    console.log('\n📋 COMMUNICATIONS STATUS:');
    if (emailConfigured !== null) {
      console.log(`📧 Email Provider: ${emailConfigured ? '✅ Configured' : '❌ Not configured'}`);
    }
    if (smsConfigured !== null) {
      console.log(`📱 SMS Provider: ${smsConfigured ? '✅ Configured' : '❌ Not configured'}`);
    }
  }

  console.log('\n🚀 DEPLOYMENT STATUS:');
  if (passed === total) {
    console.log('✅ All production tests passed - Deployment is healthy!');
  } else if (passed >= total * 0.8) {
    console.log('⚠️  Most tests passed - Minor issues detected');
  } else {
    console.log('❌ Multiple test failures - Deployment needs attention');
  }

  console.log('\n🔗 Production Links:');
  console.log(`Frontend: ${PRODUCTION_CONFIG.frontendUrl}`);
  console.log(`Backend API: ${PRODUCTION_CONFIG.apiUrl}/api/docs`);
  console.log(`Health Check: ${PRODUCTION_CONFIG.apiUrl}/api/health`);

  console.log('\n💡 Next Steps:');
  if (passed === total) {
    console.log('✅ Production deployment is ready');
    console.log('🧪 You can now test full user workflows through the frontend');
  } else {
    console.log('🔧 Review and fix failing tests');
    console.log('📊 Check Render service logs for detailed error information');
  }
}

async function main() {
  try {
    const results = await runProductionTests();
    await printProductionSummary(results);
  } catch (error) {
    log('💥', 'Production test suite failed', error.message);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main, runProductionTests };
