#!/usr/bin/env node

// Test with authentication headers like the actual onboarding form
const baseUrl = 'http://localhost:3005';

async function testWithAuthHeaders() {
  console.log('🧪 Testing onboarding with auth headers (like browser)...\n');

  const formData = {
    name: 'Auth Test User',
    firstName: 'Auth',
    lastName: 'User',
    email: 'auth.test@example.com',
    phone: '(555) 444-5555',
    company: '',
    type: 'client',
    contactType: 'client',
    businessType: 'Residential Property Owner',
    entityType: 'client',
    address: '789 Auth Street',
    city: 'Auth City',
    state: 'TX',
    zipCode: '12345',
    notes: 'Testing with auth headers',
    status: 'lead'
  };

  try {
    // Test without auth token (as anonymous user might)
    console.log('📝 Creating contact without auth...');
    let createResponse = await fetch(`${baseUrl}/api/clients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    if (createResponse.ok) {
      const created = await createResponse.json();
      const contactId = created._id || created.id;

      console.log('✅ Contact created (no auth):', {
        id: contactId,
        name: created.name
      });

      // Test immediate lookup without auth
      console.log('🔍 Looking up without auth...');
      const fetchResponse = await fetch(`${baseUrl}/api/clients/${contactId}`);

      if (fetchResponse.ok) {
        const fetched = await fetchResponse.json();
        console.log('✅ Found without auth:', fetched.name);
      } else {
        console.log('❌ Not found without auth:', fetchResponse.status);
      }
    }

    // Test with invalid/null auth token (common browser scenario)
    console.log('\n📝 Creating contact with null auth...');
    createResponse = await fetch(`${baseUrl}/api/clients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer null'
      },
      body: JSON.stringify({
        ...formData,
        name: 'Null Auth User',
        email: 'null.auth@example.com'
      }),
    });

    if (createResponse.ok) {
      const created = await createResponse.json();
      const contactId = created._id || created.id;

      console.log('✅ Contact created (null auth):', {
        id: contactId,
        name: created.name
      });

      // Test lookup with null auth
      console.log('🔍 Looking up with null auth...');
      const fetchResponse = await fetch(`${baseUrl}/api/clients/${contactId}`, {
        headers: {
          'Authorization': 'Bearer null'
        }
      });

      if (fetchResponse.ok) {
        const fetched = await fetchResponse.json();
        console.log('✅ Found with null auth:', fetched.name);
      } else {
        console.log('❌ Not found with null auth:', fetchResponse.status);
      }
    }

  } catch (error) {
    console.error('💥 Test error:', error.message);
  }
}

testWithAuthHeaders();
