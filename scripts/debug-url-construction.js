const testEmail = 'bizorebenezer@gmail.com';
const encodedEmail = encodeURIComponent(testEmail);

console.log('🔧 URL Construction Debug:');
console.log('Original email:', testEmail);
console.log('Encoded email:', encodedEmail);

const baseUrl = 'https://easybuk.vercel.app/api/auth/send-verification';
const fullUrl = `${baseUrl}?email=${encodedEmail}`;
console.log('Full URL:', fullUrl);

// Test URL parsing
const url = new URL(fullUrl);
console.log('URL object:', {
  href: url.href,
  search: url.search,
  searchParams: url.searchParams.toString()
});

const extractedEmail = url.searchParams.get('email');
console.log('Extracted email:', extractedEmail);

if (extractedEmail === testEmail) {
  console.log('✅ URL parameter extraction works correctly');
} else {
  console.log('❌ URL parameter extraction failed');
  console.log('Expected:', testEmail);
  console.log('Got:', extractedEmail);
} 