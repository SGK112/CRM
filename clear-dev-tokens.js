#!/usr/bin/env node

/**
 * Development utility to clear authentication tokens from browser localStorage
 * Run this script and then execute the output in your browser console
 */

console.log('🧹 CRM Development Token Cleaner');
console.log('===============================\n');

console.log('1. Open your browser console (F12 → Console tab)');
console.log('2. Copy and paste this code to clear stored auth tokens:\n');

console.log('// Clear all auth-related tokens from localStorage');
console.log("localStorage.removeItem('accessToken');");
console.log("localStorage.removeItem('token');");
console.log("localStorage.removeItem('refreshToken');");
console.log("localStorage.removeItem('user');");
console.log("localStorage.removeItem('authToken');");
console.log('console.log("✅ Cleared all auth tokens from localStorage");');
console.log('location.reload();');

console.log('\n3. Press Enter to reload the page');
console.log('\nThis will ensure the CRM uses development mode without authentication.');
