const fetch = require('node-fetch');

async function testDeleteFunctionality() {
  console.log('🧪 Testing delete functionality...\n');

  try {
    // First, create a test contact
    const createResponse = await fetch('http://localhost:3005/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Delete Contact',
        email: 'delete-test@example.com',
        phone: '(555) 999-0000',
        contactType: 'client'
      })
    });

    if (!createResponse.ok) {
      throw new Error(`Create failed: ${createResponse.status}`);
    }

    const createdContact = await createResponse.json();
    console.log('✅ Test contact created:', {
      id: createdContact.id,
      name: createdContact.name,
      email: createdContact.email
    });

    // Verify the contact exists
    const checkResponse = await fetch(`http://localhost:3005/api/clients/${createdContact.id}`);
    if (checkResponse.ok) {
      console.log('✅ Contact verified to exist before deletion');
    } else {
      console.log('❌ Contact not found after creation');
      return;
    }

    // Now delete the contact
    console.log('\n🗑️ Attempting to delete contact...');
    const deleteResponse = await fetch(`http://localhost:3005/api/clients/${createdContact.id}`, {
      method: 'DELETE'
    });

    if (deleteResponse.ok) {
      const deleteResult = await deleteResponse.json();
      console.log('✅ Delete successful:', deleteResult.message);
    } else {
      const errorData = await deleteResponse.json();
      console.log('❌ Delete failed:', errorData.error);
      return;
    }

    // Verify the contact is deleted
    console.log('\n🔍 Verifying contact is deleted...');
    const verifyResponse = await fetch(`http://localhost:3005/api/clients/${createdContact.id}`);
    
    if (verifyResponse.status === 404) {
      console.log('✅ Contact successfully deleted - returns 404 as expected');
    } else if (verifyResponse.ok) {
      console.log('❌ Contact still exists after deletion');
    } else {
      console.log('⚠️ Unexpected response:', verifyResponse.status);
    }

    // Check contacts list to make sure it's not there
    console.log('\n📋 Checking contacts list...');
    const listResponse = await fetch('http://localhost:3005/api/clients');
    if (listResponse.ok) {
      const allContacts = await listResponse.json();
      const deletedContactStillExists = allContacts.clients.some(c => c.id === createdContact.id);
      
      if (!deletedContactStillExists) {
        console.log('✅ Contact not found in contacts list - deletion confirmed');
      } else {
        console.log('❌ Contact still appears in contacts list');
      }
    }

    console.log('\n🎉 Delete functionality test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testDeleteFunctionality();
