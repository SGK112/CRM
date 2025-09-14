/**
 * Simple Client Creation Test - Run in Browser Console
 * 
 * Instructions:
 * 1. Go to https://remodely-crm.onrender.com/dashboard
 * 2. Open browser console (F12)
 * 3. Paste this entire code
 * 4. Press Enter
 */

console.log('🧪 Testing Client Creation API...');

async function testClientCreation() {
  try {
    // Get auth token
    const token = localStorage.getItem('accessToken');
    console.log('Auth token found:', !!token);
    
    // Test data for Josh
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
      contactType: 'client',
      type: 'client',
      status: 'lead',
      notes: 'Test client - Josh Breese'
    };
    
    console.log('Creating client with data:', clientData);
    
    // Make API call
    const response = await fetch('/api/clients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(clientData)
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('Raw response:', responseText);
    
    if (response.ok) {
      const data = JSON.parse(responseText);
      console.log('✅ SUCCESS! Client created:', data);
      
      // Generate portal link
      const clientId = data.id || data._id;
      if (clientId) {
        console.log('🔗 Portal link:', window.location.origin + '/portal?client=' + clientId);
        
        // Try to send notification
        console.log('📧 Attempting to send notification...');
        const notificationResponse = await fetch('/api/notifications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            type: 'client_portal_invitation',
            recipientEmail: data.email,
            recipientName: data.name,
            subject: 'Welcome to Remodely CRM',
            message: `Hi ${data.firstName}, you can access your portal at: ${window.location.origin}/portal?client=${clientId}`,
            clientId: clientId
          })
        });
        
        if (notificationResponse.ok) {
          console.log('✅ Notification sent successfully!');
        } else {
          console.log('⚠️ Notification failed:', notificationResponse.status);
        }
      }
      
    } else {
      console.error('❌ FAILED:', response.status, responseText);
      
      // Additional debugging
      if (response.status === 401) {
        console.log('🔍 Auth issue. Check if logged in and token is valid');
      } else if (response.status === 404) {
        console.log('🔍 API route not found. Check deployment');
      }
    }
    
  } catch (error) {
    console.error('💥 Error:', error);
  }
}

// Run the test
testClientCreation();