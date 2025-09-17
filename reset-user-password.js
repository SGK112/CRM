const { MongoClient } = require('mongodb');

// Quick script to reset user password or check user status
async function resetUserPassword() {
  const MONGODB_URI = process.env.MONGODB_URI || 'your-mongodb-connection-string';
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db('crm');
    const usersCollection = db.collection('users');
    
    // Check if user exists
    const user = await usersCollection.findOne({ email: 'joshb@surprisegranite.com' });
    
    if (user) {
      console.log('✅ User found:');
      console.log('- Email:', user.email);
      console.log('- Created:', user.createdAt);
      console.log('- Email Verified:', user.emailVerified);
      console.log('- Active:', user.isActive);
      
      // Reset password to "password123" (you can change this)
      const bcrypt = require('bcrypt');
      const newPassword = await bcrypt.hash('password123', 10);
      
      await usersCollection.updateOne(
        { email: 'joshb@surprisegranite.com' },
        { 
          $set: { 
            password: newPassword,
            emailVerified: true,
            isActive: true
          }
        }
      );
      
      console.log('✅ Password reset to: password123');
      console.log('✅ Account activated and email verified');
      console.log('🚀 You can now login at: https://crm-h137.onrender.com/auth/login');
      
    } else {
      console.log('❌ User not found');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

resetUserPassword();