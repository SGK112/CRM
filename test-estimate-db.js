#!/usr/bin/env node
/**
 * Direct database test for estimate creation
 */

const { MongoClient } = require('mongodb');

async function testEstimateNumbering() {
  console.log('🧪 Testing estimate numbering directly in MongoDB...\n');
  
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/remodely-crm';
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db();
    const estimates = db.collection('estimates');
    
    // Test workspace ID
    const workspaceId = '68b3a3402904df24ce241433';
    
    // Check existing estimates
    const existing = await estimates.find({ workspaceId }).sort({ number: -1 }).toArray();
    console.log(`📊 Found ${existing.length} existing estimates`);
    
    if (existing.length > 0) {
      console.log(`📊 Latest estimate: ${existing[0].number}`);
      console.log(`📊 All numbers: ${existing.map(e => e.number).join(', ')}`);
    }
    
    // Test our numbering logic
    const latestEstimate = await estimates
      .findOne({ workspaceId }, { sort: { number: -1 } });
    
    const latestNumber = latestEstimate ? 
      parseInt(latestEstimate.number.replace('EST-', ''), 10) : 
      1000;
    
    const nextNumber = `EST-${latestNumber + 1}`;
    console.log(`🔢 Next number should be: ${nextNumber}`);
    
    // Check if this number already exists
    const duplicate = await estimates.findOne({ workspaceId, number: nextNumber });
    if (duplicate) {
      console.log('❌ Duplicate found! This would cause the E11000 error');
    } else {
      console.log('✅ No duplicate found - number is safe to use');
    }
    
    // Show the unique index
    const indexes = await estimates.indexes();
    const uniqueIndex = indexes.find(idx => 
      idx.name.includes('workspaceId') && idx.name.includes('number')
    );
    
    if (uniqueIndex) {
      console.log(`🔒 Unique index found: ${uniqueIndex.name}`);
      console.log(`🔒 Index keys:`, uniqueIndex.key);
    } else {
      console.log('⚠️  No unique index found for workspaceId + number');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await client.close();
  }
}

testEstimateNumbering().catch(console.error);