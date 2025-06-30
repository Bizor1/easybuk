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

async function testSignupDebug() {
  try {
    console.log('🔍 Testing signup debug route...\n');
    
    const signupData = JSON.stringify({
      email: 'debug' + Date.now() + '@example.com',
      password: 'password123',
      name: 'Debug User',
      role: 'CLIENT'
    });
    
    console.log('📡 POST /api/auth/signup-debug');
    const result = await makeRequest('https://easybuk.vercel.app/api/auth/signup-debug', {
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
      console.log('\n✅ SUCCESS: All signup steps passed!');
      console.log('The issue was not in the basic signup logic.');
      console.log('The problem might be in the complex transaction logic.');
    } else {
      console.log('\n❌ FAILED: Debug signup failed at step:');
      if (result.data.error) {
        console.log('Error:', result.data.error);
      }
      if (result.data.stack) {
        console.log('Stack trace:', result.data.stack);
      }
    }
    
  } catch (error) {
    console.error('❌ Failed to test signup debug:', error.message);
  }
}

// Wait for deployment, then test
setTimeout(testSignupDebug, 30000); // Wait 30 seconds
console.log('⏳ Waiting 30 seconds for deployment...'); 