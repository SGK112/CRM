// Script to update the authentication token in browser localStorage
// Run this in the browser console on http://localhost:3005

const freshToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJzdWIiOiI2OGMzNzNiNDYwN2Q0MmY5NTEzNmEzZWUiLCJ3b3Jrc3BhY2VJZCI6IjY4YzM3M2IzNjA3ZDQyZjk1MTM2YTNlZCIsImlhdCI6MTc1NzgxMTk3NywiZXhwIjoxNzU3ODk4Mzc3fQ.DP906rduo6WkbpD66WCcejbgrF6BLou7-8pAW-sgBPg";

if (typeof localStorage !== 'undefined') {
  localStorage.setItem('accessToken', freshToken);
  localStorage.setItem('token', freshToken);
  console.log('✅ Fresh authentication token updated!');
  console.log('🔄 Refresh the page to see backend data (3 clients).');
} else {
  console.error('❌ localStorage is not available. This script must be run in a browser console.');
}