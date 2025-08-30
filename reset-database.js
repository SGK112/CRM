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

    // Preserve admin user but delete all others
    if (collections.find(c => c.name === 'users')) {
      const adminUser = await db.collection('users').findOne({ email: ADMIN_EMAIL });
      if (adminUser) {
        const deletedUsers = await db.collection('users').deleteMany({
          _id: { $ne: adminUser._id }
        });
        results.push({
          collection: 'users (non-admin)',
          deletedCount: deletedUsers.deletedCount
        });
        totalDeleted += deletedUsers.deletedCount;
        console.log(`👤 Preserved admin user: ${adminUser.email}`);
        console.log(`🗑️  Deleted ${deletedUsers.deletedCount} non-admin users`);
      } else {
        console.log('⚠️  Admin user not found - deleting all users');
        const deletedUsers = await db.collection('users').deleteMany({});
        results.push({
          collection: 'users (all)',
          deletedCount: deletedUsers.deletedCount
        });
        totalDeleted += deletedUsers.deletedCount;
      }
    }

    // Delete all data from other collections
    const collectionsToReset = [
      'clients',
      'projects',
      'appointments',
      'estimates',
      'invoices',
      'notifications',
      'media',
      'designs',
      'designrevisions',
      'employees',
      'invitations',
      'sharelinks',
      'voicecalls',
      'aitokenbalances',
      'vendors',
      'priceitems',
      'catalogs',
      'workspaces'
    ];

    for (const collectionName of collectionsToReset) {
      if (collections.find(c => c.name === collectionName)) {
        try {
          const result = await db.collection(collectionName).deleteMany({});
          results.push({
            collection: collectionName,
            deletedCount: result.deletedCount
          });
          totalDeleted += result.deletedCount;
          console.log(`🗑️  ${collectionName}: deleted ${result.deletedCount} documents`);
        } catch (error) {
          console.error(`❌ Error deleting from ${collectionName}:`, error.message);
          results.push({
            collection: collectionName,
            error: error.message,
            deletedCount: 0
          });
        }
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('🎉 DATABASE RESET COMPLETE');
    console.log('='.repeat(50));
    console.log(`📊 Total documents deleted: ${totalDeleted}`);
    console.log(`🕒 Reset completed at: ${new Date().toISOString()}`);

    if (results.find(r => r.collection.includes('users'))) {
      console.log(`👤 Admin user preserved: ${ADMIN_EMAIL}`);
    }

    console.log('\n📋 Summary by collection:');
    results.forEach(result => {
      if (result.error) {
        console.log(`  ❌ ${result.collection}: ERROR - ${result.error}`);
      } else {
        console.log(`  ✅ ${result.collection}: ${result.deletedCount} deleted`);
      }
    });

    console.log('\n🚀 The app is now reset to a fresh state!');
    console.log('You can now test the CRM from start to finish.');

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
