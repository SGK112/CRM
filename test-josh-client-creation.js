/**
 * Test Client Creation Script
 * 
 * To use this script:
 * 1. Open https://remodely-crm.onrender.com/dashboard in your browser
 * 2. Make sure you're logged in
 * 3. Open Developer Tools (F12) → Console tab
 * 4. Copy and paste this entire script
 * 5. Press Enter to run
 */

console.log('🧪 Testing CRM Client Creation...\n');

async function testCreateClient() {
  try {
    // First check if we have authentication
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    
    if (!token) {
      console.error('❌ No authentication token found in localStorage');
      console.log('💡 Please log in first, then run this script again');
      return;
    }
    
    console.log('✅ Found authentication token');
    
    // Client data for Josh Breese
    const clientData = {
      firstName: 'Josh',
      lastName: 'Breese', 
      name: 'Josh Breese',
      email: 'joshb@surprisegranite.com',
      phone: '4802555887',
      address: '111 W Street',
      city: 'AA',
      state: 'AZ', 
      zipCode: '55555',
      type: 'client',
      contactType: 'client',
      businessType: 'Residential Property Owner',
      status: 'lead',
      notes: 'Test client added via browser console - Josh Breese from Surprise Granite'
    };
    
    console.log('📝 Creating client:', clientData.name);
    
    // Create the client
    const response = await fetch('/api/clients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(clientData)
    });
    
    console.log('📡 Response status:', response.status);
    
    if (response.ok) {
      const createdClient = await response.json();
      console.log('✅ Client created successfully!');
      console.log('📋 Client details:', {
        id: createdClient.id || createdClient._id,
        name: createdClient.name,
        email: createdClient.email,
        phone: createdClient.phone
      });
      
      // Now test sending a notification (if notification API exists)
      await testSendNotification(createdClient, token);
      
    } else {
      const errorText = await response.text();
      console.error('❌ Failed to create client:', response.status, errorText);
    }
    
  } catch (error) {
    console.error('💥 Error during client creation:', error.message);
  }
}

async function testSendNotification(client, token) {
  try {
    console.log('\n📧 Testing notification send...');
    
    const notificationData = {
      type: 'client_portal_invitation',
      recipientEmail: client.email,
      recipientName: client.name,
      subject: 'Welcome to Remodely CRM - Access Your Profile',
      message: `Hi ${client.firstName || client.name},

You've been added to our CRM system! You can now access your profile and project information.

Click the link below to view your profile:
${window.location.origin}/portal?client=${client.id || client._id}

Best regards,
Remodely Team`,
      clientId: client.id || client._id
    };
    
    // Try to send notification
    const notifResponse = await fetch('/api/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(notificationData)
    });
    
    if (notifResponse.ok) {
      console.log('✅ Notification sent successfully!');
      console.log('📧 Invitation sent to:', client.email);
    } else {
      console.log('⚠️  Notification API not available or failed:', notifResponse.status);
      console.log('💡 You can manually send an email with this link:');
      console.log(`   ${window.location.origin}/portal?client=${client.id || client._id}`);
    }
    
  } catch (error) {
    console.log('⚠️  Could not send notification:', error.message);
    console.log('💡 You can manually invite Josh with this link:');
    console.log(`   ${window.location.origin}/portal?client=${client.id || client._id}`);
  }
}

// Run the test
testCreateClient();