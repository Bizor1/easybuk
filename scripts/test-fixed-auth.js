const https = require('https');

// Function to make HTTP request with proper POST handling
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ 
            status: res.statusCode, 
            headers: res.headers,
            data: JSON.parse(data) 
          });
        } catch (error) {
          resolve({ 
            status: res.statusCode, 
            headers: res.headers,
            data: { error: 'Invalid JSON', rawData: data.substring(0, 200) } 
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

async function testFixedAuthRoutes() {
  try {
    console.log('🔍 Testing FIXED auth routes...\n');
    
    // Test 1: Auth ME without token (should return 401 now, not 500)
    console.log('📡 Test 1: GET /api/auth/me (no token)');
    const test1 = await makeRequest('https://easybuk.vercel.app/api/auth/me');
    console.log('Status:', test1.status);
    console.log('Response:', JSON.stringify(test1.data, null, 2));
    
    // Test 2: Try to signup a user (should work now, not 405)
    console.log('\n📡 Test 2: POST /api/auth/signup (create test user)');
    const signupData = JSON.stringify({
      email: 'test' + Date.now() + '@example.com', // Unique email
      password: 'password123',
      name: 'Test User',
      role: 'CLIENT'
    });
    
    const test2 = await makeRequest('https://easybuk.vercel.app/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(signupData)
      },
      body: signupData
    });
    console.log('Status:', test2.status);
    console.log('Response:', JSON.stringify(test2.data, null, 2));
    
    // Test 3: Try to login (should work now, not 405)
    console.log('\n📡 Test 3: POST /api/auth/login (test login)');
    const loginData = JSON.stringify({
      email: 'test@example.com',
      password: 'password123'
    });
    
    const test3 = await makeRequest('https://easybuk.vercel.app/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(loginData)
      },
      body: loginData
    });
    console.log('Status:', test3.status);
    console.log('Response:', JSON.stringify(test3.data, null, 2));
    
    // Analysis
    console.log('\n🚨 Analysis:');
    if (test1.status === 401) {
      console.log('✅ /api/auth/me now returns 401 (not authenticated) instead of 500');
    } else if (test1.status === 500) {
      console.log('❌ /api/auth/me still returning 500 error');
    }
    
    if (test2.status === 200 || test2.status === 400) {
      console.log('✅ /api/auth/signup is now working (returning proper status, not 405)');
    } else if (test2.status === 405) {
      console.log('❌ /api/auth/signup still returning 405 Method Not Allowed');
    }
    
    if (test3.status === 200 || test3.status === 401 || test3.status === 400) {
      console.log('✅ /api/auth/login is now working (returning proper status, not 405)');
    } else if (test3.status === 405) {
      console.log('❌ /api/auth/login still returning 405 Method Not Allowed');
    }
    
  } catch (error) {
    console.error('❌ Failed to test fixed auth routes:', error.message);
  }
}

// Wait for deployment, then test
setTimeout(testFixedAuthRoutes, 45000); // Wait 45 seconds for deployment
console.log('⏳ Waiting 45 seconds for deployment...'); 