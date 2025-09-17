#!/usr/bin/env node

/**
 * Setup Test Data Script
 * Creates sample clients and projects to fix form connectivity issues
 */

import { MongoClient, ObjectId } from 'mongodb';

async function setupTestData() {
  const uri = process.env.MONGODB_URI || 'mongodb+srv://CARI:%4011560Ndysart@cluster1.s4iodnn.mongodb.net/remodely-crm?retryWrites=true&w=majority&appName=Cluster1';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB...');

    const db = client.db();

    // Get or create a test user
    let user = await db.collection('users').findOne({ email: 'admin@remodely.ai' });
    if (!user) {
      // Create test user
      const testUser = {
        _id: new ObjectId(),
        email: 'admin@remodely.ai',
        firstName: 'Admin',
        lastName: 'User',
        password: '$2b$10$hash', // placeholder hash
        workspaceId: new ObjectId(),
        isEmailVerified: true,
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      await db.collection('users').insertOne(testUser);
      user = testUser;
      console.log('Created test user:', user.email);
    }

    // Get or create workspace
    let workspace = await db.collection('workspaces').findOne({ _id: user.workspaceId });
    if (!workspace) {
      if (typeof user.workspaceId === 'string') {
        try {
          user.workspaceId = new ObjectId(user.workspaceId);
        } catch (err) {
          user.workspaceId = new ObjectId();
        }
      }

      const testWorkspace = {
        _id: user.workspaceId,
        name: 'Remodely CRM',
        ownerId: user._id,
        settings: {},
        createdAt: new Date(),
        updatedAt: new Date()
      };
      await db.collection('workspaces').insertOne(testWorkspace);
      workspace = testWorkspace;
      console.log('Created test workspace:', workspace.name);
    }

    // Create test clients
    const testClients = [
      {
        _id: '1757618746935', // Match the clientId from URL
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@example.com',
        phone: '+1 (555) 123-4567',
        company: 'Smith Construction',
        address: {
          street: '123 Main Street',
          city: 'Anytown',
          state: 'CA',
          zipCode: '90210',
          country: 'United States'
        },
        status: 'client',
        tags: ['commercial', 'repeat-client'],
        workspaceId: workspace._id,
        userId: user._id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new ObjectId().toString(),
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@example.com',
        phone: '+1 (555) 987-6543',
        company: 'Doe Enterprises',
        address: {
          street: '456 Oak Avenue',
          city: 'Springfield',
          state: 'IL',
          zipCode: '62701',
          country: 'United States'
        },
        status: 'lead',
        tags: ['residential', 'kitchen-remodel'],
        workspaceId: workspace._id,
        userId: user._id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new ObjectId().toString(),
        firstName: 'Bob',
        lastName: 'Wilson',
        email: 'bob.wilson@example.com',
        phone: '+1 (555) 456-7890',
        company: 'Wilson Properties',
        address: {
          street: '789 Pine Street',
          city: 'Portland',
          state: 'OR',
          zipCode: '97201',
          country: 'United States'
        },
        status: 'client',
        tags: ['bathroom-remodel', 'high-value'],
        workspaceId: workspace._id,
        userId: user._id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Insert or update clients
    for (const clientData of testClients) {
      await db.collection('clients').replaceOne(
        { _id: clientData._id },
        clientData,
        { upsert: true }
      );
    }
    console.log(`Created/updated ${testClients.length} test clients`);

    // Create test projects
    const testProjects = [
      {
        _id: new ObjectId().toString(),
        title: 'Kitchen Renovation Project',
        description: 'Complete kitchen renovation with modern appliances and custom cabinets',
        status: 'in_progress',
        priority: 'high',
        budget: 25000,
        clientId: '1757618746935', // Link to first client
        address: {
          street: '123 Main Street',
          city: 'Anytown',
          state: 'CA',
          zipCode: '90210',
          country: 'United States'
        },
        startDate: '2025-09-15',
        endDate: '2025-11-30',
        tags: ['kitchen', 'renovation'],
        workspaceId: workspace._id,
        userId: user._id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new ObjectId().toString(),
        title: 'Bathroom Remodel',
        description: 'Master bathroom upgrade with luxury finishes',
        status: 'proposal',
        priority: 'medium',
        budget: 15000,
        clientId: testClients[1]._id, // Link to second client
        address: {
          street: '456 Oak Avenue',
          city: 'Springfield',
          state: 'IL',
          zipCode: '62701',
          country: 'United States'
        },
        startDate: '2025-10-01',
        endDate: '2025-12-15',
        tags: ['bathroom', 'luxury'],
        workspaceId: workspace._id,
        userId: user._id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Insert or update projects
    for (const projectData of testProjects) {
      await db.collection('projects').replaceOne(
        { _id: projectData._id },
        projectData,
        { upsert: true }
      );
    }
    console.log(`Created/updated ${testProjects.length} test projects`);

    // Create some test estimates
    const testEstimates = [
      {
        _id: new ObjectId().toString(),
        title: 'Kitchen Renovation Estimate',
        clientId: '1757618746935',
        projectId: testProjects[0]._id,
        items: [
          {
            name: 'Custom Cabinets',
            description: 'Solid wood custom kitchen cabinets',
            quantity: 1,
            baseCost: 8000,
            marginPct: 30,
            taxable: true
          },
          {
            name: 'Granite Countertops',
            description: 'Premium granite countertops with installation',
            quantity: 45,
            baseCost: 80,
            marginPct: 40,
            taxable: true
          },
          {
            name: 'Appliance Installation',
            description: 'Professional appliance installation',
            quantity: 5,
            baseCost: 200,
            marginPct: 25,
            taxable: true
          }
        ],
        subtotal: 16250,
        tax: 1300,
        total: 17550,
        status: 'draft',
        workspaceId: workspace._id,
        userId: user._id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Insert estimates
    for (const estimateData of testEstimates) {
      await db.collection('estimates').replaceOne(
        { _id: estimateData._id },
        estimateData,
        { upsert: true }
      );
    }
    console.log(`Created/updated ${testEstimates.length} test estimates`);

    console.log('\\n✅ Test data setup complete!');
    console.log('\\nYou can now:');
    console.log('- Visit http://localhost:3005/dashboard/projects/new?clientId=1757618746935');
    console.log('- Create new projects and estimates');
    console.log('- Test the form connections and workflows');

  } catch (error) {
    console.error('❌ Error setting up test data:', error);
  } finally {
    await client.close();
  }
}

setupTestData();
