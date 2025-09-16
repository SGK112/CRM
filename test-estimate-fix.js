#!/usr/bin/env node
/**
 * Test script to verify estimate creation with duplicate key handling
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testEstimateCreation() {
  console.log('🧪 Testing estimate creation with duplicate key handling...\n');

  try {
    // First, let's check if we have any workspaces
    const workspacesResponse = await axios.get(`${API_BASE}/workspaces`);
    const workspaces = workspacesResponse.data;
    
    if (!workspaces || workspaces.length === 0) {
      console.log('❌ No workspaces found. Please create a workspace first.');
      return;
    }
    
    const workspaceId = workspaces[0]._id;
    console.log(`✅ Using workspace: ${workspaceId}`);

    // Check if we have any clients
    const clientsResponse = await axios.get(`${API_BASE}/clients?workspaceId=${workspaceId}`);
    const clients = clientsResponse.data;
    
    if (!clients || clients.length === 0) {
      console.log('❌ No clients found. Please create a client first.');
      return;
    }
    
    const clientId = clients[0]._id;
    console.log(`✅ Using client: ${clientId} (${clients[0].firstName} ${clients[0].lastName})`);

    // Create multiple estimates to test duplicate key handling
    console.log('\n🔄 Creating estimates to test duplicate key handling...');
    
    const estimateData = {
      clientId: clientId,
      items: [
        {
          name: 'Test Service',
          description: 'Testing estimate creation',
          quantity: 1,
          baseCost: 100
        }
      ],
      notes: 'Test estimate for duplicate key handling'
    };

    // Create first estimate
    const response1 = await axios.post(`${API_BASE}/estimates?workspaceId=${workspaceId}`, estimateData);
    console.log(`✅ Created estimate 1: ${response1.data.number}`);

    // Create second estimate  
    const response2 = await axios.post(`${API_BASE}/estimates?workspaceId=${workspaceId}`, estimateData);
    console.log(`✅ Created estimate 2: ${response2.data.number}`);

    // Create third estimate
    const response3 = await axios.post(`${API_BASE}/estimates?workspaceId=${workspaceId}`, estimateData);
    console.log(`✅ Created estimate 3: ${response3.data.number}`);

    // Verify all estimates have unique numbers
    const allEstimatesResponse = await axios.get(`${API_BASE}/estimates?workspaceId=${workspaceId}`);
    const allEstimates = allEstimatesResponse.data;
    
    const numbers = allEstimates.map(est => est.number);
    const uniqueNumbers = [...new Set(numbers)];
    
    console.log(`\n📊 Total estimates: ${allEstimates.length}`);
    console.log(`📊 Unique numbers: ${uniqueNumbers.length}`);
    console.log(`📊 Numbers: ${numbers.join(', ')}`);
    
    if (numbers.length === uniqueNumbers.length) {
      console.log('✅ All estimate numbers are unique! Duplicate key handling working correctly.');
    } else {
      console.log('❌ Found duplicate estimate numbers! Fix needed.');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.data?.message?.includes('E11000 duplicate key')) {
      console.log('\n🔧 Still getting duplicate key errors. The fix may need additional work.');
    }
  }
}

testEstimateCreation().catch(console.error);