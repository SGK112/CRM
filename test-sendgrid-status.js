#!/usr/bin/env node
/**
 * Test SendGrid configuration directly
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testSendGridConfig() {
  console.log('🧪 Testing SendGrid configuration...\n');
  
  try {
    // Test the communications/status endpoint to see if SendGrid is configured
    const statusResponse = await axios.get(`${API_BASE}/communications/status`);
    console.log('📧 Email Service Status:', statusResponse.data);
    
    if (statusResponse.data.email?.configured) {
      console.log('✅ SendGrid is properly configured!');
      console.log('✅ Provider:', statusResponse.data.email.provider);
      console.log('✅ From Email:', statusResponse.data.email.fromEmail);
    } else {
      console.log('⚠️  SendGrid not configured or not working');
      console.log('💡 Check your .env file for SendGrid credentials');
    }
    
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('🔒 Communications endpoint requires authentication');
      console.log('✅ This is expected - the endpoint exists and is protected');
    } else {
      console.error('❌ Error checking SendGrid status:', error.response?.data || error.message);
    }
  }
}

testSendGridConfig().catch(console.error);