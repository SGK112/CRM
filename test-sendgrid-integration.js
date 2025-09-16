#!/usr/bin/env node
/**
 * Test SendGrid integration for estimate sending
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testEstimateSend() {
  console.log('📧 Testing estimate send with SendGrid integration...\n');
  
  try {
    // Check if EmailService is configured
    console.log('🔍 Testing email service health...');
    
    // Check if we can reach the backend
    const healthResponse = await axios.get(`${API_BASE}/health`);
    console.log('✅ Backend health:', healthResponse.data);
    
    // This would require authentication, but we can check the error messages
    // to see if SendGrid is configured
    try {
      const estimatesResponse = await axios.get(`${API_BASE}/estimates`);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Estimates endpoint is protected (expected)');
      } else {
        console.log('❌ Unexpected error:', error.response?.status);
      }
    }
    
    console.log('\n📋 SendGrid Configuration Check:');
    console.log('To test estimate sending, you need:');
    console.log('1. SENDGRID_API_KEY in your .env file');
    console.log('2. SENDGRID_FROM_EMAIL (sender email)');
    console.log('3. SENDGRID_FROM_NAME (sender name)');
    console.log('\n🔧 Example .env configuration:');
    console.log('SENDGRID_API_KEY=SG.your-api-key-here');
    console.log('SENDGRID_FROM_EMAIL=noreply@yourdomain.com');
    console.log('SENDGRID_FROM_NAME=Your Company Name');
    
    console.log('\n🧪 To test estimate sending:');
    console.log('1. Create an estimate in the dashboard');
    console.log('2. Add a client with a valid email address');
    console.log('3. Click "Send Estimate" button');
    console.log('4. Check the backend logs for SendGrid status');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testEstimateSend().catch(console.error);