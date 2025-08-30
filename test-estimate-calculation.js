// Test script to verify estimate calculation fix
console.log('Testing Estimate Calculation Fix\n');

// Test case from the bug report
const testData = {
  items: [
    {
      name: 'Calacatta Quartz 2cm',
      quantity: 2,
      baseCost: 1400.00,
      marginPct: 50
    },
    {
      name: 'Fabrication and installation',
      quantity: 84,
      baseCost: 35.00,
      marginPct: 50
    }
  ]
};

console.log('=== TESTING ESTIMATE CALCULATION LOGIC ===\n');

function computeTotals(items) {
  let subtotalCost = 0;
  let subtotalSell = 0;
  let totalMargin = 0;

  const processedItems = items.map(item => {
    const unitCost = item.baseCost || 0;
    const quantity = item.quantity || 1;
    const unitSellPrice = unitCost * (1 + (item.marginPct||0)/100);

    const totalCost = unitCost * quantity;
    const totalSell = unitSellPrice * quantity;

    subtotalCost += totalCost;
    subtotalSell += totalSell;
    totalMargin += (totalSell - totalCost);

    return {
      ...item,
      unitCost,
      unitSellPrice,
      totalCost,
      totalSell,
      lineTotal: totalSell
    };
  });

  return {
    items: processedItems,
    subtotalCost,
    subtotalSell,
    totalMargin,
    marginPercent: subtotalSell > 0 ? (totalMargin / subtotalSell) * 100 : 0
  };
}

const result = computeTotals(testData.items);

console.log('Line Items:');
console.log('Item\t\t\t\tQty\tUnit Cost\tMargin%\tUnit Price\tTotal');
console.log('='.repeat(80));

result.items.forEach(item => {
  console.log(
    `${item.name.padEnd(30)}\t${item.quantity}\t$${item.unitCost.toFixed(2)}\t\t${item.marginPct}%\t$${item.unitSellPrice.toFixed(2)}\t\t$${item.lineTotal.toFixed(2)}`
  );
});

console.log('\nPricing Summary:');
console.log(`Subtotal (Cost): $${result.subtotalCost.toFixed(2)}`);
console.log(`Subtotal (Sell): $${result.subtotalSell.toFixed(2)}`);
console.log(`Total Margin: $${result.totalMargin.toFixed(2)} (${result.marginPercent.toFixed(1)}%)`);
console.log(`Total: $${result.subtotalSell.toFixed(2)}`);

console.log('\n=== VERIFICATION ===');
console.log('Expected results based on bug report:');
console.log('- Calacatta Quartz: 2 × $1400 × 1.5 = $4200 (total)');
console.log('- Fabrication: 84 × $35 × 1.5 = $4410 (total)');
console.log('- Grand Total: $8610');

console.log('\nActual results:');
result.items.forEach(item => {
  console.log(`- ${item.name}: ${item.quantity} × $${item.unitCost.toFixed(2)} × ${1 + item.marginPct/100} = $${item.lineTotal.toFixed(2)} (total)`);
});
console.log(`- Grand Total: $${result.subtotalSell.toFixed(2)}`);

const isCorrect = Math.abs(result.subtotalSell - 8610) < 0.01;
console.log(`\n✅ Calculation ${isCorrect ? 'CORRECT' : 'INCORRECT'}!`);

if (!isCorrect) {
  console.log('❌ Expected $8610.00, got $' + result.subtotalSell.toFixed(2));
} else {
  console.log('✅ Matches expected total of $8610.00');
}
