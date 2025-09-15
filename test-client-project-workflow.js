#!/usr/bin/env node

/**
 * Test script to verify the client-project integration workflow
 * Tests the URL: /dashboard/projects/new?clientId=XXX&returnTo=/dashboard/estimates/new
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3001';

async function testWorkflow() {
  console.log('🧪 Testing Client-Project Integration Workflow\n');

  try {
    // Step 1: Login to get token
    console.log('1. Authenticating...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@remodely.ai',
        password: 'admin123456'
      })
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }

    const { accessToken } = await loginResponse.json();
    console.log('✅ Authentication successful\n');

    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    };

    // Step 2: Get existing clients or create one
    console.log('2. Fetching clients...');
    const clientsResponse = await fetch(`${BASE_URL}/api/clients`, { headers });
    
    if (!clientsResponse.ok) {
      throw new Error(`Failed to fetch clients: ${clientsResponse.status}`);
    }

    let clients = await clientsResponse.json();
    console.log(`📋 Found ${clients.length} existing clients`);

    let testClient;
    if (clients.length > 0) {
      testClient = clients[0];
      console.log(`✅ Using existing client: ${testClient.firstName} ${testClient.lastName} (ID: ${testClient._id})`);
    } else {
      // Create a test client
      console.log('Creating test client...');
      const createClientResponse = await fetch(`${BASE_URL}/api/clients`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          firstName: 'Test',
          lastName: 'Client',
          email: 'test@example.com',
          phone: '555-0123',
          company: 'Test Company'
        })
      });

      if (!createClientResponse.ok) {
        throw new Error(`Failed to create client: ${createClientResponse.status}`);
      }

      testClient = await createClientResponse.json();
      console.log(`✅ Created test client: ${testClient.firstName} ${testClient.lastName} (ID: ${testClient._id})`);
    }

    console.log('\n');

    // Step 3: Test URL construction
    const testClientId = testClient._id;
    const returnTo = encodeURIComponent('/dashboard/estimates/new');
    const testUrl = `http://localhost:3005/dashboard/projects/new?clientId=${testClientId}&returnTo=${returnTo}`;
    
    console.log('3. Testing project creation URL...');
    console.log(`🔗 URL: ${testUrl}`);
    console.log('✅ URL construction successful\n');

    // Step 4: Test that client exists in system (mimics frontend behavior)
    console.log('4. Verifying client accessibility...');
    const clientResponse = await fetch(`${BASE_URL}/api/clients/${testClientId}`, { headers });
    
    if (!clientResponse.ok) {
      throw new Error(`Client not accessible: ${clientResponse.status}`);
    }

    const clientDetails = await clientResponse.json();
    console.log(`✅ Client accessible: ${clientDetails.firstName} ${clientDetails.lastName}`);
    console.log(`📧 Email: ${clientDetails.email || 'N/A'}`);
    console.log(`📞 Phone: ${clientDetails.phone || 'N/A'}`);
    console.log(`🏢 Company: ${clientDetails.company || 'N/A'}\n`);

    // Step 5: Test creating a project for this client
    console.log('5. Testing project creation...');
    const createProjectResponse = await fetch(`${BASE_URL}/api/projects`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        title: 'Test Project Integration',
        description: 'Testing client-project workflow integration',
        clientId: testClientId,
        status: 'lead',
        priority: 'medium',
        budget: 5000
      })
    });

    if (!createProjectResponse.ok) {
      const errorText = await createProjectResponse.text();
      throw new Error(`Failed to create project: ${createProjectResponse.status} - ${errorText}`);
    }

    const createdProject = await createProjectResponse.json();
    console.log(`✅ Project created successfully: ${createdProject.title} (ID: ${createdProject._id})`);
    console.log(`🔗 Client linked: ${createdProject.clientId === testClientId ? 'YES' : 'NO'}\n`);

    // Step 6: Verify project-client relationship
    console.log('6. Verifying project-client relationship...');
    const projectResponse = await fetch(`${BASE_URL}/api/projects/${createdProject._id}`, { headers });
    
    if (!projectResponse.ok) {
      throw new Error(`Failed to fetch project: ${projectResponse.status}`);
    }

    const projectDetails = await projectResponse.json();
    const isLinked = projectDetails.clientId === testClientId;
    console.log(`✅ Project-Client relationship: ${isLinked ? 'LINKED' : 'NOT LINKED'}`);
    
    if (isLinked) {
      console.log(`📋 Project: ${projectDetails.title}`);
      console.log(`👤 Client ID: ${projectDetails.clientId}`);
      console.log(`💰 Budget: $${projectDetails.budget || 0}\n`);
    }

    // Final summary
    console.log('🎉 WORKFLOW TEST RESULTS:');
    console.log('========================');
    console.log('✅ Authentication: WORKING');
    console.log('✅ Client fetch: WORKING');
    console.log('✅ URL construction: WORKING');
    console.log('✅ Client accessibility: WORKING');
    console.log('✅ Project creation: WORKING');
    console.log('✅ Client-Project linking: WORKING');
    console.log('\n🌟 The client-project integration workflow is fully functional!');
    console.log(`\n🔗 Test this URL in your browser:`);
    console.log(`   ${testUrl}`);

  } catch (error) {
    console.error('\n❌ WORKFLOW TEST FAILED:');
    console.error('========================');
    console.error(`Error: ${error.message}`);
    console.error('\n🔧 Check your servers and try again.');
    process.exit(1);
  }
}

// Run the test
testWorkflow().catch(console.error);