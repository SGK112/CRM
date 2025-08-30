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
  phone: String,
  avatar: String,
  isEmailVerified: { type: Boolean, default: false },
  isPhoneVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  authProvider: { type: String, default: 'local' },
  googleId: String,
  twoFactorEnabled: { type: Boolean, default: false },
  subscriptionPlan: { type: String, enum: ['free', 'starter', 'professional', 'enterprise'], default: 'free' },
  subscriptionStatus: { type: String, enum: ['active', 'trialing', 'past_due', 'canceled'], default: 'trialing' },
  stripeCustomerId: String,
  stripeSubscriptionId: String,
  trialEndsAt: Date,
  lastLoginAt: Date,
  notificationSettings: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
    push: { type: Boolean, default: true }
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

async function main() {
  try {
    await mongoose.connect('mongodb://localhost:27017/remodely-crm');
    console.log('✅ Connected to MongoDB');

    // List current users
    const users = await User.find({});
    console.log('\n=== CURRENT USERS ===');
    users.forEach((user, i) => {
      console.log(`${i + 1}. ${user.email} - Verified: ${user.isEmailVerified}, Active: ${user.isActive}`);
    });

    console.log('\n🔧 FIXING AUTHENTICATION ISSUES...');

    // Fix all users - enable email verification and ensure they can login
    const updates = await User.updateMany(
      {},
      {
        $set: {
          isEmailVerified: true,
          isActive: true,
          subscriptionStatus: 'trialing'
        }
      }
    );

    console.log(`✅ Updated ${updates.modifiedCount} users`);

    // Reset passwords for known users with simple passwords
    const userPasswords = [
      { email: 'joshb@surprisegranite.com', password: 'password123' },
      { email: 'demo@test.com', password: 'demo123' }
    ];

    for (const userPass of userPasswords) {
      const hashedPassword = await bcrypt.hash(userPass.password, 12);
      const result = await User.findOneAndUpdate(
        { email: userPass.email },
        { password: hashedPassword },
        { new: true }
      );
      
      if (result) {
        console.log(`✅ Password reset for ${userPass.email} -> ${userPass.password}`);
      }
    }

    // Verify final state
    console.log('\n=== FINAL USER STATE ===');
    const finalUsers = await User.find({});
    finalUsers.forEach((user, i) => {
      console.log(`${i + 1}. ${user.email}`);
      console.log(`   - Email Verified: ${user.isEmailVerified}`);
      console.log(`   - Active: ${user.isActive}`);
      console.log(`   - Subscription: ${user.subscriptionStatus}`);
      console.log(`   - Role: ${user.role}`);
      console.log('');
    });

    console.log('🎉 Authentication fix complete!');
    console.log('\n📋 LOGIN CREDENTIALS:');
    console.log('• joshb@surprisegranite.com / password123');
    console.log('• demo@test.com / demo123');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    mongoose.disconnect();
  }
}

main();
