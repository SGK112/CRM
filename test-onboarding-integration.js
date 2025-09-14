const fetch = require('node-fetch');

const FRONTEND_URL = 'http://localhost:3005';
const BACKEND_URL = 'http://localhost:3001';

async function testOnboardingIntegration() {
  console.log('🧪 Testing client onboarding integration...\n');

  try {
    // First, authenticate with the backend to get a token
    console.log('🔐 Authenticating with backend...');
    const authResponse = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      }),
    });

    if (!authResponse.ok) {
      throw new Error(`Authentication failed: ${authResponse.status}`);
    }

    const authData = await authResponse.json();
    const { accessToken } = authData;
    console.log('✅ Authentication successful:', authData.user.email);

    // Test creating a client through the frontend API with authentication
    console.log('\n📝 Creating client through frontend API...');
    const clientData = {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      phone: '555-5678',
      company: 'Smith Industries',
      source: 'Onboarding Form',
      notes: 'Test client created through onboarding integration'
    };

    const createResponse = await fetch(`${FRONTEND_URL}/api/clients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(clientData),
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      throw new Error(`Client creation failed: ${createResponse.status} - ${errorText}`);
    }

    const newClient = await createResponse.json();
    console.log('✅ Client created successfully:', {
      id: newClient._id || newClient.id,
      name: `${newClient.firstName} ${newClient.lastName}`,
      email: newClient.email,
      company: newClient.company
    });

    // Verify the client exists by fetching all clients through frontend
    console.log('\n🔍 Verifying client through frontend API...');
    const listResponse = await fetch(`${FRONTEND_URL}/api/clients`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!listResponse.ok) {
      throw new Error(`Failed to fetch clients: ${listResponse.status}`);
    }

    const clients = await listResponse.json();
    const createdClient = clients.find(c => c.email === clientData.email);
    
    if (createdClient) {
      console.log('✅ Client found in list:', createdClient.firstName, createdClient.lastName);
    } else {
      console.log('❌ Client not found in list');
    }

    // Verify the client exists directly in backend
    console.log('\n🔍 Verifying client in backend database...');
    const backendResponse = await fetch(`${BACKEND_URL}/api/clients`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!backendResponse.ok) {
      throw new Error(`Failed to fetch backend clients: ${backendResponse.status}`);
    }

    const backendClients = await backendResponse.json();
    const backendClient = backendClients.find(c => c.email === clientData.email);
    
    if (backendClient) {
      console.log('✅ Client found in backend:', backendClient.firstName, backendClient.lastName);
    } else {
      console.log('❌ Client not found in backend');
    }

    console.log('\n📊 Summary:');
    console.log(`- Total clients in frontend: ${clients.length}`);
    console.log(`- Total clients in backend: ${backendClients.length}`);
    console.log(`- Client onboarding integration: ${createdClient && backendClient ? '✅ WORKING' : '❌ FAILED'}`);

    console.log('\n🎉 Onboarding integration test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    throw error;
  }
}

testOnboardingIntegration().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});