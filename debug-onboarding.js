#!/usr/bin/env node

// Comprehensive test to debug the onboarding issue
const baseUrl = 'http://localhost:3005';

async function testCompleteOnboardingFlow() {
  console.log('🧪 Testing complete onboarding flow...\n');

  // Step 1: Test the exact payload the onboarding form sends
  const onboardingFormData = {
    name: 'John Test Smith',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.test@example.com',
    phone: '(555) 987-6543',
    company: '',
    type: 'client',
    contactType: 'client',
    businessType: 'Residential Property Owner',
    entityType: 'client',
    address: '456 Oak Avenue',
    city: 'Test City',
    state: 'CA',
    zipCode: '90210',
    notes: 'Test contact from comprehensive debugging',
    status: 'lead'
  };

  try {
    console.log('📝 Creating contact via onboarding form data...');
    const createResponse = await fetch(`${baseUrl}/api/clients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(onboardingFormData),
    });

    console.log('📊 Create response status:', createResponse.status);

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error('❌ Create failed:', errorText);
      return;
    }

    const created = await createResponse.json();
    console.log('✅ Contact created:', {
      id: created.id,
      _id: created._id,
      name: created.name,
      email: created.email,
      idsMatch: created.id === created._id
    });

    // This is what the onboarding form does:
    const newContactId = created?._id || created?.id;
    const redirectUrl = `/dashboard/clients/${newContactId}?created=true&type=${onboardingFormData.entityType}`;
    
    console.log('\n🔄 Simulating redirect to:', redirectUrl);
    console.log('🔍 Fetching contact with ID:', newContactId);

    // Step 2: Immediately try to fetch the contact (simulating the redirect)
    const fetchResponse = await fetch(`${baseUrl}/api/clients/${newContactId}`);
    
    console.log('📊 Fetch response status:', fetchResponse.status);

    if (fetchResponse.ok) {
      const fetched = await fetchResponse.json();
      console.log('✅ Contact found immediately:', {
        id: fetched.id,
        _id: fetched._id,
        name: fetched.name,
        email: fetched.email
      });
      console.log('\n🎉 SUCCESS: Onboarding flow works correctly!');
    } else {
      const errorText = await fetchResponse.text();
      console.log('❌ Contact NOT found:', {
        status: fetchResponse.status,
        error: errorText
      });
      
      // Check what's actually in the store
      console.log('\n🔍 Checking what contacts exist in store...');
      const allContactsResponse = await fetch(`${baseUrl}/api/clients`);
      if (allContactsResponse.ok) {
        const allData = await allContactsResponse.json();
        const contacts = allData.clients || allData;
        console.log('📋 Total contacts in store:', contacts.length);
        
        if (contacts.length > 0) {
          console.log('📝 Recent contacts:');
          contacts.slice(0, 3).forEach((contact, i) => {
            console.log(`  ${i + 1}. ID: ${contact.id}, _ID: ${contact._id}, Name: ${contact.name}`);
          });
          
          // Check if our contact exists with a different ID format
          const ourContact = contacts.find(c => 
            c.email === onboardingFormData.email || 
            c.name === onboardingFormData.name
          );
          
          if (ourContact) {
            console.log('🔍 Found our contact with different lookup:', {
              id: ourContact.id,
              _id: ourContact._id,
              searchedFor: newContactId
            });
          }
        }
      }
      
      console.log('\n💥 FAILURE: This reproduces the user\'s issue!');
    }

  } catch (error) {
    console.error('💥 Test error:', error.message);
  }
}

testCompleteOnboardingFlow();
