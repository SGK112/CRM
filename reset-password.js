#!/usr/bin/env node

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// User schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  role: { type: String, enum: ['owner', 'admin', 'member'], default: 'member' },
  workspaceId: { type: String, required: true },
  isEmailVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  subscriptionStatus: { type: String, enum: ['active', 'trialing', 'past_due', 'canceled'], default: 'trialing' },
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

async function resetPassword(email, newPassword) {
  try {
    await mongoose.connect('mongodb://localhost:27017/remodely-crm');
    console.log('✅ Connected to MongoDB');

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    const result = await User.findOneAndUpdate(
      { email },
      { 
        password: hashedPassword,
        isEmailVerified: true, // Enable login
        isActive: true // Ensure account is active
      },
      { new: true }
    );
    
    if (result) {
      console.log(`✅ Password reset successful for ${email}`);
      console.log(`✅ New password: ${newPassword}`);
      console.log(`✅ Account activated and ready for login`);
    } else {
      console.log(`❌ User not found: ${email}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    mongoose.disconnect();
  }
}

async function listUsers() {
  try {
    await mongoose.connect('mongodb://localhost:27017/remodely-crm');
    console.log('✅ Connected to MongoDB');

    const users = await User.find({}).select('-password');
    console.log('\n=== ALL USERS ===');
    users.forEach((user, i) => {
      console.log(`${i + 1}. Email: ${user.email}`);
      console.log(`   Name: ${user.firstName} ${user.lastName}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Active: ${user.isActive}`);
      console.log(`   Email Verified: ${user.isEmailVerified}`);
      console.log('   ---');
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    mongoose.disconnect();
  }
}

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('🔧 CRM Password Reset Utility');
  console.log('=============================');
  console.log('Usage:');
  console.log('  node reset-password.js list                     # List all users');
  console.log('  node reset-password.js <email> <new_password>   # Reset password');
  console.log('');
  console.log('Examples:');
  console.log('  node reset-password.js list');
  console.log('  node reset-password.js joshb@surprisegranite.com newpassword123');
  console.log('  node reset-password.js demo@test.com demo123');
  process.exit(0);
}

if (args[0] === 'list') {
  listUsers();
} else if (args.length === 2) {
  const [email, password] = args;
  resetPassword(email, password);
} else {
  console.log('❌ Invalid arguments. Use: node reset-password.js <email> <password>');
  process.exit(1);
}
