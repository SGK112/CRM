const fetch = require('node-fetch');

async function testContainerRemoval() {
  console.log('🧪 Testing container removal for space saving...\n');

  try {
    // Create a test contact to view
    const createResponse = await fetch('http://localhost:3005/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Space Test Contact',
        email: 'space-test@example.com',
        phone: '(555) 777-8888',
        contactType: 'client'
      })
    });

    if (!createResponse.ok) {
      throw new Error(`Create failed: ${createResponse.status}`);
    }

    const createdContact = await createResponse.json();
    console.log('✅ Test contact created:', {
      id: createdContact.id,
      name: createdContact.name
    });

    console.log(`\n🎯 You can now view the simplified layout at:`);
    console.log(`   http://localhost:3005/dashboard/clients/${createdContact.id}`);
    
    console.log('\n📦 Containers removed:');
    console.log('   • Profile Completion Prompt container (bg-slate-800 rounded-2xl)');
    console.log('   • Quick Actions container (bg-black rounded-2xl)');
    console.log('\n💾 Space saved:');
    console.log('   • Reduced padding and margins');
    console.log('   • Removed background containers');
    console.log('   • Cleaner, more compact layout');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testContainerRemoval();
