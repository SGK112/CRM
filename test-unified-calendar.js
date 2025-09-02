#!/usr/bin/env node

/**
 * Test script to verify Google Calendar integration
 * Run this after connecting Google Calendar to test the unified calendar functionality
 */

const fetch = require('node-fetch');

async function testUnifiedCalendar() {
  console.log('🧪 Testing Unified Calendar Integration...\n');

  try {
    // Test 1: Check Google Calendar status
    console.log('1. Checking Google Calendar connection status...');
    const statusResponse = await fetch('http://localhost:3001/api/appointments/google-calendar/status', {
      headers: {
        'Authorization': `Bearer ${process.env.TEST_TOKEN || 'your-jwt-token-here'}`
      }
    });

    if (statusResponse.ok) {
      const status = await statusResponse.json();
      console.log('✅ Google Calendar Status:', status);
    } else {
      console.log('❌ Failed to get Google Calendar status');
    }

    // Test 2: Fetch unified calendar events
    console.log('\n2. Fetching unified calendar events...');
    const calendarResponse = await fetch('http://localhost:3001/api/appointments/calendar', {
      headers: {
        'Authorization': `Bearer ${process.env.TEST_TOKEN || 'your-jwt-token-here'}`
      }
    });

    if (calendarResponse.ok) {
      const events = await calendarResponse.json();
      console.log(`✅ Retrieved ${events.length} calendar events`);

      // Analyze events
      const crmEvents = events.filter(e => e.extendedProps?.source !== 'google');
      const googleEvents = events.filter(e => e.extendedProps?.source === 'google');

      console.log(`   📅 CRM Events: ${crmEvents.length}`);
      console.log(`   🌐 Google Calendar Events: ${googleEvents.length}`);

      if (googleEvents.length > 0) {
        console.log('\n📋 Sample Google Calendar Events:');
        googleEvents.slice(0, 3).forEach(event => {
          console.log(`   - ${event.title} (${new Date(event.start).toLocaleString()})`);
        });
      }

      if (crmEvents.length > 0) {
        console.log('\n📋 Sample CRM Events:');
        crmEvents.slice(0, 3).forEach(event => {
          console.log(`   - ${event.title} (${new Date(event.start).toLocaleString()})`);
        });
      }
    } else {
      console.log('❌ Failed to fetch calendar events');
    }

    console.log('\n🎉 Unified Calendar Integration Test Complete!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testUnifiedCalendar();
