// Simple test script to check wallet API connectivity
const API_BASE_URL = 'http://localhost:3001/api';

async function testWalletEndpoints() {
  console.log('Testing wallet endpoints...');

  const endpoints = [
    '/wallet/info',
    '/wallet/transactions?limit=50',
    '/wallet/stats'
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`\nTesting ${API_BASE_URL}${endpoint}`);

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'http://localhost:3000'
        }
      });

      console.log(`Status: ${response.status} ${response.statusText}`);
      console.log('Headers:', Object.fromEntries(response.headers.entries()));

      if (response.status === 401) {
        console.log('✅ Expected 401 Unauthorized (authentication required)');
      } else if (response.status === 404) {
        console.log('❌ Unexpected 404 Not Found');
      } else {
        console.log(`⚠️  Unexpected status: ${response.status}`);
      }

    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
  }
}

testWalletEndpoints().catch(console.error);
