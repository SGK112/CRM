#!/usr/bin/env node

/**
 * Create Test Client Profiles
 * This script creates diverse test client profiles to test the entire CRM flow
 */

const testProfiles = [
  // LEADS - Potential clients who haven't been contacted yet
  {
    firstName: "Sarah",
    lastName: "Johnson", 
    email: "sarah.johnson@email.com",
    phone: "(555) 234-5678",
    company: "Johnson Family Home",
    type: "residential",
    status: "lead",
    source: "Website",
    notes: "Kitchen remodel inquiry - interested in modern design with granite countertops"
  },
  {
    firstName: "Mike",
    lastName: "Chen",
    email: "m.chen@techstartup.com", 
    phone: "(555) 345-6789",
    company: "TechFlow Innovations",
    type: "commercial",
    status: "lead",
    source: "Referral",
    notes: "Office renovation for 50-person startup. Looking for open concept design"
  },
  {
    firstName: "Jessica",
    lastName: "Williams",
    email: "jwilliams@gmail.com",
    phone: "(555) 456-7890", 
    company: "Williams Residence",
    type: "residential",
    status: "lead",
    source: "Google Ads",
    notes: "Bathroom renovation - master suite upgrade with walk-in shower"
  },

  // CONTACTS - Leads that have been contacted and are in discussion
  {
    firstName: "David",
    lastName: "Rodriguez", 
    email: "david.rodriguez@email.com",
    phone: "(555) 567-8901",
    company: "Rodriguez Construction Inc",
    type: "commercial", 
    status: "contact",
    source: "Trade Show",
    notes: "Commercial contractor looking for partnership opportunities"
  },
  {
    firstName: "Emily",
    lastName: "Thompson",
    email: "emily.thompson@realestate.com",
    phone: "(555) 678-9012",
    company: "Thompson Real Estate",
    type: "commercial",
    status: "contact", 
    source: "LinkedIn",
    notes: "Real estate agent with multiple flip projects needing renovation work"
  },

  // CLIENTS - Active paying customers
  {
    firstName: "Robert",
    lastName: "Anderson",
    email: "robert.anderson@email.com", 
    phone: "(555) 789-0123",
    company: "Anderson Family Estate",
    type: "residential",
    status: "client",
    source: "Referral",
    notes: "Full home renovation - 4,500 sq ft colonial. Project value: $180,000"
  },
  {
    firstName: "Lisa",
    lastName: "Martinez",
    email: "lisa@martinezlaw.com",
    phone: "(555) 890-1234",
    company: "Martinez Law Firm", 
    type: "commercial",
    status: "client",
    source: "Website",
    notes: "Law office renovation - premium finishes, conference rooms. Project value: $95,000"
  },

  // VENDORS - Service providers and suppliers
  {
    firstName: "Tom",
    lastName: "Builder",
    email: "tom@premiumcabinets.com",
    phone: "(555) 901-2345", 
    company: "Premium Cabinet Works",
    type: "commercial",
    status: "vendor",
    source: "Trade Directory",
    notes: "Custom cabinet manufacturer - excellent quality, 2-week lead time"
  },
  {
    firstName: "Angela",
    lastName: "Stone",
    email: "angela@stoneworks.com",
    phone: "(555) 012-3456",
    company: "Stone & Marble Works",
    type: "commercial",
    status: "vendor", 
    source: "Referral",
    notes: "Granite and marble supplier - competitive pricing, same-day delivery"
  },

  // SUBCONTRACTORS - Specialized trade partners
  {
    firstName: "Carlos",
    lastName: "Electrician",
    email: "carlos@sparkelect.com", 
    phone: "(555) 123-4567",
    company: "Spark Electric Solutions",
    type: "commercial",
    status: "subcontractor",
    source: "Trade Network",
    notes: "Licensed electrician - available for residential and commercial projects"
  },
  {
    firstName: "Maria",
    lastName: "Plumber",
    email: "maria@flowplumbing.com",
    phone: "(555) 234-5678",
    company: "Flow Master Plumbing",
    type: "commercial", 
    status: "subcontractor",
    source: "Yellow Pages",
    notes: "Master plumber - specializes in luxury bathroom installations"
  },

  // DEAD LEADS - Prospects that didn't convert
  {
    firstName: "John",
    lastName: "Budget",
    email: "john.budget@email.com",
    phone: "(555) 345-6789",
    company: "Budget Home Solutions",
    type: "residential",
    status: "dead_lead",
    source: "Cold Call", 
    notes: "Price was too high - went with cheaper contractor. May contact again next year"
  },
  {
    firstName: "Steve",
    lastName: "Undecided", 
    email: "steve.undecided@email.com",
    phone: "(555) 456-7890",
    company: "Undecided Office Space",
    type: "commercial",
    status: "dead_lead",
    source: "Website",
    notes: "Decided to postpone renovation project due to budget constraints"
  }
];

async function createTestProfiles() {
  console.log('🔧 Creating test client profiles...');
  
  // Get authentication token from localStorage (browser environment)
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJzdWIiOiI2OGMzNzNiNDYwN2Q0MmY5NTEzNmEzZWUiLCJ3b3Jrc3BhY2VJZCI6IjY4YzM3M2IzNjA3ZDQyZjk1MTM2YTNlZCIsImlhdCI6MTc1NzgxMTk3NywiZXhwIjoxNzU3ODk4Mzc3fQ.DP906rduo6WkbpD66WCcejbgrF6BLou7-8pAW-sgBPg';
  
  const baseUrl = 'http://localhost:3001'; // Backend URL
  let successCount = 0;
  let errorCount = 0;

  for (const profile of testProfiles) {
    try {
      const response = await fetch(`${baseUrl}/api/clients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profile)
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Created ${profile.status}: ${profile.firstName} ${profile.lastName} (${profile.company})`);
        successCount++;
      } else {
        const error = await response.text();
        console.log(`❌ Failed to create ${profile.firstName} ${profile.lastName}: ${response.status} - ${error}`);
        errorCount++;
      }
    } catch (error) {
      console.log(`❌ Error creating ${profile.firstName} ${profile.lastName}:`, error.message);
      errorCount++;
    }

    // Small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n📊 Summary:');
  console.log(`✅ Successfully created: ${successCount} profiles`);
  console.log(`❌ Failed: ${errorCount} profiles`);
  console.log(`\n🎯 Test Categories Created:`);
  console.log(`📋 Leads: 3 (Sarah Johnson, Mike Chen, Jessica Williams)`);
  console.log(`💬 Contacts: 2 (David Rodriguez, Emily Thompson)`);
  console.log(`👥 Clients: 2 (Robert Anderson, Lisa Martinez)`);
  console.log(`🏪 Vendors: 2 (Tom Builder, Angela Stone)`);
  console.log(`🔧 Subcontractors: 2 (Carlos Electrician, Maria Plumber)`);
  console.log(`💀 Dead Leads: 2 (John Budget, Steve Undecided)`);
  console.log(`\n🚀 Now you can test the complete CRM flow with all status categories!`);
}

// For Node.js environment, we need to use fetch polyfill
async function setupFetch() {
  if (typeof fetch === 'undefined') {
    const { default: fetch, Headers, Request, Response } = await import('node-fetch');
    global.fetch = fetch;
    global.Headers = Headers;
    global.Request = Request;
    global.Response = Response;
  }
}

// Run the script
(async () => {
  try {
    await setupFetch();
    await createTestProfiles();
  } catch (error) {
    console.error('Script error:', error);
    process.exit(1);
  }
})();