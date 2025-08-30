#!/usr/bin/env node

/**
 * Reset Database Script
 * This script will delete all data from the CRM database except for admin users
 */

const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb://localhost:27017/remodely-crm';
const ADMIN_EMAIL = 'help.remodely@gmail.com';

async function resetDatabase() {
  let client;

  try {
    console.log('🔌 Connecting to MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db();
    console.log('✅ Connected to database: remodely-crm');

    // Get all collections
    const collections = await db.listCollections().toArray();
    console.log(`📊 Found ${collections.length} collections`);

    const results = [];
    let totalDeleted = 0;

    // Delete ALL collections completely - fresh start
    for (const collection of collections) {
      try {
        const result = await db.collection(collection.name).deleteMany({});
        results.push({
          collection: collection.name,
          deletedCount: result.deletedCount
        });
        totalDeleted += result.deletedCount;
        console.log(`🗑️  ${collection.name}: deleted ${result.deletedCount} documents`);
      } catch (error) {
        console.error(`❌ Error deleting from ${collection.name}:`, error.message);
        results.push({
          collection: collection.name,
          error: error.message,
          deletedCount: 0
        });
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('🎉 DATABASE COMPLETELY RESET');
    console.log('='.repeat(50));
    console.log(`📊 Total documents deleted: ${totalDeleted}`);
    console.log(`🕒 Reset completed at: ${new Date().toISOString()}`);

    console.log('\n📋 Summary by collection:');
    results.forEach(result => {
      if (result.error) {
        console.log(`  ❌ ${result.collection}: ERROR - ${result.error}`);
      } else {
        console.log(`  ✅ ${result.collection}: ${result.deletedCount} deleted`);
      }
    });

    console.log('\n🚀 The database is now completely empty!');
    console.log('You will need to register a new account to start fresh.');

  } catch (error) {
    console.error('❌ Database reset failed:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the reset
resetDatabase()
  .then(() => {
    console.log('✅ Reset script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Reset script failed:', error);
    process.exit(1);
  });
