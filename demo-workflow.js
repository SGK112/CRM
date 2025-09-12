#!/usr/bin/env node

/**
 * Complete CRM Workflow Demonstration
 * Creates: Client → Project → Estimate → Invoice
 * Shows updated dashboard stats
 */

/* eslint-disable no-console */

import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/remodely-crm';

async function demonstrateWorkflow() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db();
    const timestamp = Date.now();
    
    // Step 1: Create a new client
    console.log('\n📋 Step 1: Creating a new client...');
    const newClient = {
      _id: `demo-client-${timestamp}`,
      name: 'Demo Renovation Co',
      email: 'contact@demoreno.com',
      phone: '(555) 987-6543',
      address: '456 Renovation Ave, Demo City, DC 54321',
      type: 'commercial',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: 'demo-user'
    };
    
    await db.collection('clients').insertOne(newClient);
    console.log(`✅ Created client: ${newClient.name} (ID: ${newClient._id})`);
    
    // Step 2: Create a project for this client
    console.log('\n🏗️ Step 2: Creating a new project...');
    const newProject = {
      _id: `demo-project-${timestamp}`,
      clientId: newClient._id,
      name: 'Office Space Renovation',
      description: 'Complete renovation of 2000 sq ft office space including flooring, lighting, and modern fixtures',
      status: 'planning',
      startDate: new Date(),
      estimatedCompletionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: 'demo-user'
    };
    
    await db.collection('projects').insertOne(newProject);
    console.log(`✅ Created project: ${newProject.name} (ID: ${newProject._id})`);
    
    // Step 3: Create an estimate for this project
    console.log('\n💰 Step 3: Creating an estimate...');
    const newEstimate = {
      _id: `demo-estimate-${timestamp}`,
      clientId: newClient._id,
      projectId: newProject._id,
      estimateNumber: `EST-${timestamp}`,
      title: 'Office Renovation Estimate',
      description: 'Comprehensive estimate for office space renovation',
      status: 'draft',
      items: [
        {
          id: '1',
          description: 'Premium Vinyl Flooring Installation',
          quantity: 2000,
          unit: 'sq ft',
          unitPrice: 8.50,
          total: 17000
        },
        {
          id: '2', 
          description: 'LED Lighting System',
          quantity: 25,
          unit: 'fixtures',
          unitPrice: 120,
          total: 3000
        },
        {
          id: '3',
          description: 'Paint and Wall Preparation',
          quantity: 1,
          unit: 'project',
          unitPrice: 4500,
          total: 4500
        },
        {
          id: '4',
          description: 'Labor and Installation',
          quantity: 80,
          unit: 'hours',
          unitPrice: 75,
          total: 6000
        }
      ],
      subtotal: 30500,
      tax: 2440, // 8% tax
      total: 32940,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: 'demo-user'
    };
    
    await db.collection('estimates').insertOne(newEstimate);
    console.log(`✅ Created estimate: ${newEstimate.title} (${newEstimate.estimateNumber}) - $${newEstimate.total.toLocaleString()}`);
    
    // Step 4: Convert estimate to invoice
    console.log('\n🧾 Step 4: Converting estimate to invoice...');
    const newInvoice = {
      _id: `demo-invoice-${timestamp}`,
      clientId: newClient._id,
      projectId: newProject._id,
      estimateId: newEstimate._id,
      invoiceNumber: `INV-${timestamp}`,
      title: 'Office Renovation Invoice',
      description: 'Invoice for office space renovation project',
      status: 'sent',
      items: newEstimate.items, // Copy items from estimate
      subtotal: newEstimate.subtotal,
      tax: newEstimate.tax,
      total: newEstimate.total,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      issueDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: 'demo-user'
    };
    
    await db.collection('invoices').insertOne(newInvoice);
    console.log(`✅ Created invoice: ${newInvoice.title} (${newInvoice.invoiceNumber}) - $${newInvoice.total.toLocaleString()}`);
    
    // Step 5: Update estimate status to converted
    await db.collection('estimates').updateOne(
      { _id: newEstimate._id },
      { 
        $set: { 
          status: 'converted',
          convertedToInvoice: newInvoice._id,
          updatedAt: new Date()
        }
      }
    );
    console.log('✅ Updated estimate status to "converted"');
    
    // Step 6: Show updated stats
    console.log('\n📊 Step 6: Updated Dashboard Stats:');
    
    const clientCount = await db.collection('clients').countDocuments();
    const projectCount = await db.collection('projects').countDocuments();
    const estimateCount = await db.collection('estimates').countDocuments();
    const invoiceCount = await db.collection('invoices').countDocuments();
    
    // Calculate financial stats
    const totalEstimateValue = await db.collection('estimates').aggregate([
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]).toArray();
    
    const totalInvoiceValue = await db.collection('invoices').aggregate([
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]).toArray();
    
    console.log(`📈 Clients: ${clientCount}`);
    console.log(`🏗️ Projects: ${projectCount}`);
    console.log(`💰 Estimates: ${estimateCount} (Total: $${(totalEstimateValue[0]?.total || 0).toLocaleString()})`);
    console.log(`🧾 Invoices: ${invoiceCount} (Total: $${(totalInvoiceValue[0]?.total || 0).toLocaleString()})`);
    
    console.log('\n🎉 Workflow demonstration completed successfully!');
    console.log('\n📱 You can now view the updated dashboard at: http://localhost:3005/dashboard');
    console.log(`👤 View the new client at: http://localhost:3005/dashboard/clients/${newClient._id}`);
    console.log(`🏗️ View the new project at: http://localhost:3005/dashboard/projects/${newProject._id}`);
    console.log(`💰 View the estimate at: http://localhost:3005/dashboard/estimates/${newEstimate._id}`);
    console.log(`🧾 View the invoice at: http://localhost:3005/dashboard/invoices/${newInvoice._id}`);
    console.log('\n✨ Note: Estimates and invoices display demo data when not authenticated');
    console.log('🔐 For full functionality, create an account at: http://localhost:3005/auth/register');
    
  } catch (error) {
    console.error('❌ Error during workflow:', error);
  } finally {
    await client.close();
  }
}

// Only run if this file is executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  demonstrateWorkflow();
}

export { demonstrateWorkflow };
