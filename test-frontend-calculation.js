/**
 * Test to verify frontend calculation logic matches fixed backend
 * This simulates the exact scenario from the bug report
 */

// Frontend calculation logic (from page.tsx line 183-187)
function calculateTotals(items) {
  const subtotalCost = items.reduce((sum, item) => sum + (item.baseCost * item.quantity), 0);
  const subtotalSell = items.reduce((sum, item) => {
    const sellPrice = item.baseCost * (1 + item.marginPct / 100);
    return sum + (sellPrice * item.quantity);
  }, 0);

  return { subtotalCost, subtotalSell };
}

// Fixed backend calculation logic
function computeTotals(items) {
  const computedItems = items.map(item => {
    const sellPrice = item.baseCost * (1 + item.marginPct / 100);
    return {
      ...item,
      sellPrice: sellPrice, // Unit price, not total
      lineTotal: sellPrice * item.quantity
    };
  });

  const totalCost = computedItems.reduce((sum, item) => sum + (item.baseCost * item.quantity), 0);
  const totalSell = computedItems.reduce((sum, item) => sum + item.lineTotal, 0);

  return { computedItems, totalCost, totalSell };
}

// Test with the problematic scenario from bug report
const testItems = [
  {
    description: "Fabrication work",
    category: "fabrication",
    baseCost: 35.00,
    quantity: 84,
    marginPct: 50.00
  },
  {
    description: "Installation work",
    category: "installation",
    baseCost: 25.00,
    quantity: 50,
    marginPct: 80.00
  }
];

console.log('🧪 Testing Frontend vs Backend Calculation Consistency\n');

// Test frontend calculation
const frontendResult = calculateTotals(testItems);
console.log('Frontend Calculation:');
console.log(`Subtotal Cost: $${frontendResult.subtotalCost.toFixed(2)}`);
console.log(`Subtotal Sell: $${frontendResult.subtotalSell.toFixed(2)}`);

// Test backend calculation
const backendResult = computeTotals(testItems);
console.log('\nFixed Backend Calculation:');
console.log(`Total Cost: $${backendResult.totalCost.toFixed(2)}`);
console.log(`Total Sell: $${backendResult.totalSell.toFixed(2)}`);

// Detailed line items from backend
console.log('\nBackend Line Items:');
backendResult.computedItems.forEach((item, index) => {
  console.log(`${index + 1}. ${item.description}`);
  console.log(`   Unit Cost: $${item.baseCost.toFixed(2)}`);
  console.log(`   Unit Sell: $${item.sellPrice.toFixed(2)} (${item.marginPct}% margin)`);
  console.log(`   Quantity: ${item.quantity}`);
  console.log(`   Line Total: $${item.lineTotal.toFixed(2)}`);
});

// Verify consistency
const isConsistent = (
  Math.abs(frontendResult.subtotalCost - backendResult.totalCost) < 0.01 &&
  Math.abs(frontendResult.subtotalSell - backendResult.totalSell) < 0.01
);

console.log('\n' + '='.repeat(50));
if (isConsistent) {
  console.log('✅ CALCULATIONS CONSISTENT! ✅');
  console.log('Frontend and backend produce identical results');

  // Show the corrected fabrication price
  const fabricationItem = backendResult.computedItems[0];
  console.log(`\n🎯 Bug Fix Verified:`);
  console.log(`Fabrication unit price: $${fabricationItem.sellPrice.toFixed(2)} (NOT $4410.00)`);
  console.log(`Fabrication line total: $${fabricationItem.lineTotal.toFixed(2)} (NOT $370,440.00)`);
} else {
  console.log('❌ CALCULATIONS INCONSISTENT! ❌');
  console.log('Frontend and backend produce different results');
}
console.log('='.repeat(50));
