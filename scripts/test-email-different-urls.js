import fetch from 'node-fetch';

async function testEmailWithDifferentUrls() {
  console.log('🧪 Testing Email API with Different URLs...\n');

  const urlsToTest = [
    'https://easybuk.vercel.app/api/internal/send-email',
    'https://easybuk-git-main-bizorebenezer.vercel.app/api/internal/send-email',
    'http://localhost:3000/api/internal/send-email',
    'https://vercel.app/api/internal/send-email',
    '/api/internal/send-email'
  ];

  for (const url of urlsToTest) {
    console.log(`\n🔍 Testing URL: ${url}`);
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: 'test@example.com',
          type: 'email_verification',
          data: {
            userName: 'Test User',
            verificationLink: 'https://example.com/verify'
          }
        })
      });

      console.log(`📊 Status: ${response.status}`);
      console.log(`📄 Content-Type: ${response.headers.get('content-type')}`);
      
      const text = await response.text();
      
      if (text.includes('<!doctype html>')) {
        console.log('❌ Returns HTML (error page)');
        console.log(`   First 100 chars: ${text.substring(0, 100)}`);
      } else {
        console.log('✅ Returns non-HTML response');
        console.log(`   Response: ${text.substring(0, 200)}`);
      }
      
    } catch (error) {
      console.log(`❌ Fetch Error: ${error.message}`);
    }
  }
}

testEmailWithDifferentUrls(); 