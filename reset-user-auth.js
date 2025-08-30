#!/usr/bin/env node

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const readline = require('readline');

// User schema definition to match the backend
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

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function connectToDatabase() {
  try {
    await mongoose.connect('mongodb://localhost:27017/remodely-crm');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

async function listUsers() {
  const users = await User.find({}).select('-password');
  console.log('\n=== CURRENT USERS ===');
  if (users.length === 0) {
    console.log('No users found in database');
    return [];
  }
  
  users.forEach((user, i) => {
    console.log(`${i + 1}. Email: ${user.email}`);
    console.log(`   Name: ${user.firstName} ${user.lastName}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Active: ${user.isActive}`);
    console.log(`   Email Verified: ${user.isEmailVerified}`);
    console.log(`   Phone: ${user.phone || 'Not set'}`);
    console.log(`   Auth Provider: ${user.authProvider}`);
    console.log(`   Created: ${user.createdAt}`);
    console.log('   ---');
  });
  
  return users;
}

async function resetUserPassword(email, newPassword) {
  try {
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
      console.log(`✅ Email verification enabled`);
      console.log(`✅ Account activated`);
      return true;
    } else {
      console.log(`❌ User not found: ${email}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Password reset failed:`, error.message);
    return false;
  }
}

async function createNewUser(email, password, firstName, lastName, role = 'owner') {
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log(`❌ User already exists: ${email}`);
      return false;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const workspaceId = new mongoose.Types.ObjectId().toString();
    
    const user = new User({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role,
      workspaceId,
      isEmailVerified: true, // Enable immediate login
      isActive: true,
      subscriptionPlan: 'starter',
      subscriptionStatus: 'trialing',
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days trial
    });

    await user.save();
    console.log(`✅ New user created: ${email}`);
    console.log(`✅ Workspace ID: ${workspaceId}`);
    console.log(`✅ Ready to login immediately`);
    return true;
  } catch (error) {
    console.error(`❌ User creation failed:`, error.message);
    return false;
  }
}

async function enableUserLogin(email) {
  try {
    const result = await User.findOneAndUpdate(
      { email },
      { 
        isEmailVerified: true,
        isActive: true,
        subscriptionStatus: 'trialing' // Ensure they have access
      },
      { new: true }
    );
    
    if (result) {
      console.log(`✅ Login enabled for ${email}`);
      return true;
    } else {
      console.log(`❌ User not found: ${email}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Login enable failed:`, error.message);
    return false;
  }
}

async function deleteUser(email) {
  try {
    const result = await User.findOneAndDelete({ email });
    if (result) {
      console.log(`✅ User deleted: ${email}`);
      return true;
    } else {
      console.log(`❌ User not found: ${email}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ User deletion failed:`, error.message);
    return false;
  }
}

async function main() {
  await connectToDatabase();
  
  console.log('🔧 CRM User Authentication Reset Tool');
  console.log('=====================================');
  
  while (true) {
    console.log('\n📋 OPTIONS:');
    console.log('1. List all users');
    console.log('2. Reset user password');
    console.log('3. Enable user login (fix verification)');
    console.log('4. Create new user');
    console.log('5. Delete user');
    console.log('6. Quick fix - Enable all users');
    console.log('7. Exit');
    
    const choice = await ask('\nSelect an option (1-7): ');
    
    switch (choice) {
      case '1':
        await listUsers();
        break;
        
      case '2':
        const users = await listUsers();
        if (users.length === 0) break;
        
        const resetEmail = await ask('\nEnter email to reset password: ');
        const newPassword = await ask('Enter new password: ');
        await resetUserPassword(resetEmail, newPassword);
        break;
        
      case '3':
        const enableUsers = await listUsers();
        if (enableUsers.length === 0) break;
        
        const enableEmail = await ask('\nEnter email to enable login: ');
        await enableUserLogin(enableEmail);
        break;
        
      case '4':
        const createEmail = await ask('\nEnter email: ');
        const createPassword = await ask('Enter password: ');
        const createFirstName = await ask('Enter first name: ');
        const createLastName = await ask('Enter last name: ');
        const createRole = await ask('Enter role (owner/admin/member) [owner]: ') || 'owner';
        await createNewUser(createEmail, createPassword, createFirstName, createLastName, createRole);
        break;
        
      case '5':
        const deleteUsers = await listUsers();
        if (deleteUsers.length === 0) break;
        
        const deleteEmail = await ask('\nEnter email to delete: ');
        const confirm = await ask('Are you sure? This cannot be undone (yes/no): ');
        if (confirm.toLowerCase() === 'yes') {
          await deleteUser(deleteEmail);
        }
        break;
        
      case '6':
        console.log('\n🔧 Quick Fix - Enabling all users for login...');
        const allUsers = await User.find({});
        for (const user of allUsers) {
          await enableUserLogin(user.email);
        }
        console.log('✅ All users enabled for login');
        break;
        
      case '7':
        console.log('👋 Goodbye!');
        rl.close();
        mongoose.disconnect();
        process.exit(0);
        
      default:
        console.log('❌ Invalid option');
    }
  }
}

main().catch(error => {
  console.error('❌ Script error:', error.message);
  rl.close();
  mongoose.disconnect();
  process.exit(1);
});
