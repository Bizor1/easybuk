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

async function testSignupDebugEndpoint() {
  try {
    console.log('🧪 Testing debug signup endpoint...\n');
    
    const signupData = JSON.stringify({
      email: 'bizorebenezer@gmail.com',
      password: 'password123',
      name: 'Bizore Ebenezer',
      role: 'CLIENT'
    });

    console.log('📡 POST /api/auth/signup-debug');
    console.log('📝 Data:', JSON.parse(signupData));
    
    const result = await makeRequest('https://easybuk.vercel.app/api/auth/signup-debug', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(signupData)
      },
      body: signupData
    });
    
    console.log('\n📊 Response:');
    console.log('Status:', result.status);
    console.log('Success:', result.data.success || false);
    
    if (result.data.error) {
      console.log('❌ Error:', result.data.error);
      if (result.data.step) {
        console.log('📍 Failed at step:', result.data.step);
      }
      if (result.data.details) {
        console.log('🔍 Details:', result.data.details);
      }
      if (result.data.stack) {
        console.log('📚 Stack trace:');
        console.log(result.data.stack);
      }
    }
    
    if (result.data.user) {
      console.log('✅ User created:', result.data.user);
    }
    
    if (result.data.message) {
      console.log('💬 Message:', result.data.message);
    }
    
    // If there's raw data (for debugging malformed responses)
    if (result.data.rawData) {
      console.log('📄 Raw response data:');
      console.log(result.data.rawData);
    }
    
    console.log('\n🔍 Analysis:');
    if (result.status === 200) {
      console.log('✅ SUCCESS: Debug signup worked!');
      console.log('💡 The issue may be in the regular signup endpoint logic.');
    } else if (result.status === 400) {
      console.log('❌ VALIDATION ERROR: Check the failed step above.');
    } else if (result.status === 500) {
      console.log('❌ SERVER ERROR: Check the error details and stack trace above.');
    } else {
      console.log('❓ UNEXPECTED STATUS:', result.status);
    }

  } catch (error) {
    console.error('❌ Failed to test debug signup endpoint:', error.message);
  }
}

testSignupDebugEndpoint(); 