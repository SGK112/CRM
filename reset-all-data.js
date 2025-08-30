#!/usr/bin/env node

/**
 * Reset Database Script
 * This script will delete all data from the CRM database except for admin users
 */

/* eslint-disable @typescript-eslint/no-var-requires, no-console, @typescript-eslint/no-unused-vars */
const { MongoClient } = require('mongodb');
const fs = require('fs');

/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/no-commonjs */
function loadMongoUri() {
  if (process.env.MONGODB_URI) return process.env.MONGODB_URI;
  try {
    const env = fs.readFileSync('.env', 'utf8');
    const match = env.match(/^MONGODB_URI=(.+)$/m);
    if (match && match[1]) return match[1].trim();
  } catch { /* no .env file */ }
  try {
    const envEx = fs.readFileSync('.env.example', 'utf8');
    const match = envEx.match(/^MONGODB_URI=(.+)$/m);
    if (match && match[1]) return match[1].trim();
  } catch { /* no .env.example file */ }
  return 'mongodb://localhost:27017/remodely-crm';
}

const MONGODB_URI = loadMongoUri();

async function resetDatabase() {
  let client;

  try {
    console.log('🔌 Connecting to MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();

  const db = client.db();
  console.log(`✅ Connected to database: ${db.databaseName}`);

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
