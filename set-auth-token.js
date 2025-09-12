/**
 * Browser Script - Authentication Token Setter
 * 
 * ⚠️  This script is meant to be run in the BROWSER CONSOLE, not in Node.js
 * 
 * Instructions:
 * 1. Open your browser and navigate to http://localhost:3005/dashboard
 * 2. Open Developer Tools (F12)
 * 3. Go to the Console tab
 * 4. Copy and paste this entire script and press Enter
 * 
 * This will set the authentication token in localStorage
 */

/* eslint-env browser */
/* eslint-disable no-console */

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJzdWIiOiI2OGMzNzNiNDYwN2Q0MmY5NTEzNmEzZWUiLCJ3b3Jrc3BhY2VJZCI6IjY4YzM3M2IzNjA3ZDQyZjk1MTM2YTNlZCIsImlhdCI6MTc1NzYzOTY1NywiZXhwIjoxNzU3NzI2MDU3fQ.cqqHfR5IXtJAG2_yHfnhQnlTftX3c7U1pcxBMsLpdrw";

if (typeof localStorage !== 'undefined') {
  localStorage.setItem('accessToken', token);
  console.log('✅ Authentication token set! You can now use the authenticated features.');
  console.log('🔄 Refresh the page to see authenticated content.');

  // Display user info
  console.log('📧 Logged in as: test@example.com');
  console.log('🏢 Workspace: TestWorkspace');
} else {
  console.error('❌ localStorage is not available. This script must be run in a browser console.');
}
