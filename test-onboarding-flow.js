#!/usr/bin/env node

// Test script to reproduce the onboarding issue
const baseUrl = 'http://localhost:3005';

async function testOnboardingFlow() {
  console.log('🧪 Testing onboarding flow...\n');

  // Step 1: Create a contact via the API (same as onboarding form)
  const testContact = {
    name: 'Test User',
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    phone: '(555) 123-4567',
    company: '',
    type: 'client',
    contactType: 'client',
    businessType: 'Residential Property Owner',
    entityType: 'client',
    address: '123 Test Street',
    city: 'Test City',
    state: 'TS',
    zipCode: '12345',
    notes: 'Test contact created via debugging script',
    status: 'lead'
  };

  try {
    console.log('📝 Creating contact...');
    const createResponse = await fetch(`${baseUrl}/api/clients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testContact),
    });

    if (!createResponse.ok) {
      throw new Error(`Create failed: ${createResponse.status}`);
    }

    const created = await createResponse.json();
    const contactId = created._id || created.id;
    
    console.log('✅ Contact created:', {
      id: contactId,
      name: created.name,
      email: created.email
    });

    // Step 2: Immediately try to fetch the contact (same as profile page)
    console.log('\n🔍 Fetching contact immediately...');
    const fetchResponse = await fetch(`${baseUrl}/api/clients/${contactId}`);
    
    if (fetchResponse.ok) {
      const fetched = await fetchResponse.json();
      console.log('✅ Contact found:', {
        id: fetched.id || fetched._id,
        name: fetched.name,
        email: fetched.email
      });
      console.log('\n🎉 Test PASSED: Contact creation and immediate lookup works!');
    } else {
      console.log('❌ Contact NOT found:', {
        status: fetchResponse.status,
        statusText: fetchResponse.statusText
      });
      
      const errorText = await fetchResponse.text();
      console.log('Error response:', errorText);
      console.log('\n💥 Test FAILED: This is the same issue user reported!');
    }

    // Step 3: Wait a bit and try again
    console.log('\n⏳ Waiting 1 second and trying again...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const retryResponse = await fetch(`${baseUrl}/api/clients/${contactId}`);
    if (retryResponse.ok) {
      const retried = await retryResponse.json();
      console.log('✅ Contact found on retry:', {
        id: retried.id || retried._id,
        name: retried.name
      });
    } else {
      console.log('❌ Contact still not found after delay');
    }

  } catch (error) {
    console.error('💥 Test error:', error.message);
  }
}

testOnboardingFlow();
