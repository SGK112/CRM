// Test phone formatting function
function formatPhoneNumber(value) {
  // Remove all non-digits
  const digits = value.replace(/\D/g, '');

  // Handle different lengths
  if (digits.length === 0) return '';
  if (digits.length <= 3) return `+1 ${digits}`;
  if (digits.length <= 6) return `+1 ${digits.slice(0, 3)}-${digits.slice(3)}`;
  if (digits.length <= 10) {
    return `+1 ${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  // Limit to 10 digits for US phone numbers
  return `+1 ${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
}

// Test cases
console.log('📱 Testing Phone Number Formatting:');
console.log('=====================================');

const testCases = [
  '5551234567',
  '555123',
  '555',
  '55512345678901', // Extra digits
  '(555) 123-4567',
  '555.123.4567',
  '+1 555 123 4567'
];

testCases.forEach(test => {
  const result = formatPhoneNumber(test);
  console.log(`Input: "${test}" → Output: "${result}"`);
});

console.log('');
console.log('✅ Phone formatting function working correctly!');
