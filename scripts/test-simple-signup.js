const https = require('https');

// Function to make HTTP request
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ 
            status: res.statusCode, 
            data: JSON.parse(data) 
          });
        } catch (error) {
          resolve({ 
            status: res.statusCode, 
            data: { error: 'Invalid JSON', rawData: data.substring(0, 500) } 
          });
        }
      });
    });
    req.on('error', reject);
    if (options.method === 'POST' && options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function testSimpleSignup() {
  try {
    console.log('🔍 Testing SIMPLE signup route...\n');
    
    const signupData = JSON.stringify({
      email: 'simple' + Date.now() + '@example.com',
      password: 'password123',
      name: 'Simple User',
      role: 'CLIENT'
    });
    
    console.log('📡 POST /api/auth/signup-simple');
    const result = await makeRequest('https://easybuk.vercel.app/api/auth/signup-simple', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(signupData)
      },
      body: signupData
    });
    
    console.log('Status:', result.status);
    console.log('Response:', JSON.stringify(result.data, null, 2));
    
    if (result.status === 200) {
      console.log('\n🎉 SUCCESS: Simple signup works!');
      console.log('✅ The issue is with the complex AuthService transaction logic');
      console.log('✅ Basic user creation, password hashing, and token generation all work');
    } else if (result.status === 400 && result.data.error === 'User already exists') {
      console.log('\n✅ Route is working (user already exists)');
      console.log('✅ The issue is with the complex AuthService transaction logic');
    } else {
      console.log('\n❌ FAILED: Simple signup also failed');
      console.log('The issue might be more fundamental');
      if (result.data.error) {
        console.log('Error:', result.data.error);
      }
    }
    
  } catch (error) {
    console.error('❌ Failed to test simple signup:', error.message);
  }
}

// Wait for deployment, then test
setTimeout(testSimpleSignup, 30000); // Wait 30 seconds
console.log('⏳ Waiting 30 seconds for deployment...'); 