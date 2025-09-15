#!/usr/bin/env node

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

async function debugUser() {
  try {
    await mongoose.connect('mongodb://localhost:27017/remodely-crm');
    console.log('✅ Connected to MongoDB');

    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    const user = await User.findOne({ email: 'demo@demo.com' });
    
    console.log('User found:', !!user);
    console.log('Has password:', !!user?.password);
    console.log('Password starts with:', user?.password?.substring(0, 10));
    console.log('Password is hashed:', user?.password?.startsWith('$2'));
    
    // Test password comparison
    if (user?.password) {
      const match = await bcrypt.compare('demo123', user.password);
      console.log('Password match test:', match);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    mongoose.disconnect();
  }
}

debugUser();