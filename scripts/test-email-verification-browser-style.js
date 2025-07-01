const https = require('https');

// Function to make HTTP request
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ 
          status: res.statusCode, 
          headers: res.headers,
          rawData: data
        });
      });
    });
    req.on('error', reject);
    if (options.method === 'POST' && options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function testEmailVerificationBrowserStyle() {
  try {
    console.log('🌐 Testing email verification - browser style call...\n');
    
    // Test 1: Exactly how signup calls it (from signup route)
    console.log('1️⃣ Testing internal API call (how signup route calls it)...');
    const emailData1 = JSON.stringify({
      email: 'bizorebenezer@gmail.com'
    });

    const result1 = await makeRequest('https://easybuk.vercel.app/api/auth/send-verification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'easybuk-internal/1.0',
        'Accept': 'application/json'
      },
      body: emailData1
    });
    
    console.log('📊 Response 1:');
    console.log('Status:', result1.status);
    console.log('Content-Type:', result1.headers['content-type']);
    console.log('Raw data preview:', result1.rawData.substring(0, 200));
    
    if (result1.rawData.startsWith('<!doctype') || result1.rawData.startsWith('<!DOCTYPE')) {
      console.log('❌ ERROR: Received HTML instead of JSON!');
      console.log('🔍 HTML content indicates server error');
    } else {
      try {
        const parsed = JSON.parse(result1.rawData);
        console.log('✅ Valid JSON response:', parsed);
      } catch (e) {
        console.log('❌ Invalid JSON response');
      }
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 2: With browser-like headers
    console.log('2️⃣ Testing with browser-like headers...');
    const result2 = await makeRequest('https://easybuk.vercel.app/api/auth/send-verification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Origin': 'https://easybuk.vercel.app',
        'Referer': 'https://easybuk.vercel.app/auth/signup'
      },
      body: emailData1
    });
    
    console.log('📊 Response 2:');
    console.log('Status:', result2.status);
    console.log('Content-Type:', result2.headers['content-type']);
    console.log('Raw data preview:', result2.rawData.substring(0, 200));
    
    if (result2.rawData.startsWith('<!doctype') || result2.rawData.startsWith('<!DOCTYPE')) {
      console.log('❌ ERROR: Received HTML instead of JSON!');
      console.log('🔍 This is what the browser is experiencing');
      
      // Look for error clues in the HTML
      if (result2.rawData.includes('Application error')) {
        console.log('🚨 Application error detected in HTML response');
      }
      if (result2.rawData.includes('500')) {
        console.log('🚨 500 Internal Server Error detected');
      }
      if (result2.rawData.includes('Runtime Error')) {
        console.log('🚨 Runtime error detected');
      }
    } else {
      try {
        const parsed = JSON.parse(result2.rawData);
        console.log('✅ Valid JSON response:', parsed);
      } catch (e) {
        console.log('❌ Invalid JSON response');
      }
    }

    console.log('\n🔍 Analysis:');
    if (result1.status === 200 && result2.status !== 200) {
      console.log('💡 Simple request works, browser-style request fails');
      console.log('💡 Likely a headers or middleware issue');
    } else if (result1.status !== 200 && result2.status !== 200) {
      console.log('💡 Both requests fail - serverless function has an issue');
      console.log('💡 Check Vercel function logs for detailed error info');
    } else {
      console.log('💡 Both requests work - issue might be timing or race condition');
    }

  } catch (error) {
    console.error('❌ Failed to test email verification:', error.message);
  }
}

testEmailVerificationBrowserStyle(); 