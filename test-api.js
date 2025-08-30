#!/usr/bin/env node

const https = require('http');

// Test estimate data matching the bug report
const testEstimate = {
  clientId: "test-client-123",
  items: [
    {
      name: "Calacatta Quartz 2cm",
      description: "Bolder Image stone 2cm - 127x64",
      quantity: 2,
      baseCost: 1400.00,
      marginPct: 50,
      taxable: true
    },
    {
      name: "Fabrication and installation",
      description: "Professional installation services",
      quantity: 84,
      baseCost: 35.00,
      marginPct: 50,
      taxable: true
    }
  ],
  discountType: "percent",
  discountValue: 0,
  taxRate: 0,
  notes: "Test estimate to verify calculation fix"
};

const postData = JSON.stringify(testEstimate);

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/estimates',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
    // Skip auth for dev testing
  }
};

console.log('Testing estimate creation with fixed calculation...\n');

const req = https.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers, null, 2)}`);

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('\nResponse:');
    try {
      const response = JSON.parse(data);
      console.log(JSON.stringify(response, null, 2));

      if (response.items) {
        console.log('\n=== VERIFICATION ===');
        console.log('Line Items:');
        response.items.forEach(item => {
          console.log(`${item.name}: Qty ${item.quantity} × $${item.baseCost} (${item.marginPct}%) = $${item.sellPrice} unit → $${(item.sellPrice * item.quantity).toFixed(2)} total`);
        });
        console.log(`\nSubtotal Cost: $${response.subtotalCost}`);
        console.log(`Subtotal Sell: $${response.subtotalSell}`);
        console.log(`Total: $${response.total}`);

        // Check if fabrication line is correct
        const fabrication = response.items.find(item => item.name.includes('Fabrication'));
        if (fabrication) {
          const expectedUnitPrice = 35 * 1.5; // $52.50
          const actualUnitPrice = fabrication.sellPrice;
          console.log(`\nFabrication unit price: Expected $${expectedUnitPrice}, Got $${actualUnitPrice}`);
          console.log(`✅ ${Math.abs(actualUnitPrice - expectedUnitPrice) < 0.01 ? 'CORRECT' : 'INCORRECT'}`);
        }
      }
    } catch (e) {
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(postData);
req.end();
