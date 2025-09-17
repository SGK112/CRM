const { MongoClient } = require('mongodb');

async function clearAllData() {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/crm';
  
  if (!MONGODB_URI.includes('mongodb')) {
    console.log('❌ Please set MONGODB_URI environment variable');
    return;
  }

  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('🔗 Connected to MongoDB');
    
    const db = client.db('crm');
    
    // Get all collections
    const collections = await db.listCollections().toArray();
    console.log(`📚 Found ${collections.length} collections`);
    
    // Clear all collections
    for (const collection of collections) {
      const collectionName = collection.name;
      const count = await db.collection(collectionName).countDocuments();
      
      if (count > 0) {
        await db.collection(collectionName).deleteMany({});
        console.log(`🗑️  Cleared ${count} documents from ${collectionName}`);
      } else {
        console.log(`✅ ${collectionName} was already empty`);
      }
    }
    
    console.log('');
    console.log('🎉 ALL DATA CLEARED! Database is now fresh and clean.');
    console.log('✨ You can now register a new account at: https://crm-h137.onrender.com/auth/register');
    console.log('🚀 Or locally at: http://localhost:3000/auth/register');
    
  } catch (error) {
    console.error('❌ Error clearing data:', error.message);
  } finally {
    await client.close();
  }
}

// Check if running from command line
if (require.main === module) {
  clearAllData().catch(console.error);
}

module.exports = clearAllData;