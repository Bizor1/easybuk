const https = require('https');

// Function to make HTTP request with headers
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
            data: { error: 'Invalid JSON', rawData: data } 
          });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function testAuthEndpoints() {
  try {
    console.log('🔍 Testing auth endpoints in detail...\n');
    
    // Test 1: Auth ME without token (should return 401)
    console.log('📡 Test 1: GET /api/auth/me (no token)');
    const test1 = await makeRequest('https://easybuk.vercel.app/api/auth/me');
    console.log('Status:', test1.status);
    console.log('Response:', JSON.stringify(test1.data, null, 2));
    
    // Test 2: Auth ME with invalid token (should return 401)
    console.log('\n📡 Test 2: GET /api/auth/me (invalid token)');
    const test2 = await makeRequest('https://easybuk.vercel.app/api/auth/me', {
      headers: {
        'Authorization': 'Bearer invalid-token-here'
      }
    });
    console.log('Status:', test2.status);
    console.log('Response:', JSON.stringify(test2.data, null, 2));
    
    // Test 3: Try to signup a user (should work)
    console.log('\n📡 Test 3: POST /api/auth/signup (create test user)');
    const signupData = JSON.stringify({
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      role: 'CLIENT'
    });
    
    const test3 = await new Promise((resolve, reject) => {
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(signupData)
        }
      };
      
      const req = https.request('https://easybuk.vercel.app/api/auth/signup', options, (res) => {
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
              data: { error: 'Invalid JSON', rawData: data } 
            });
          }
        });
      });
      req.on('error', reject);
      req.write(signupData);
      req.end();
    });
    console.log('Status:', test3.status);
    console.log('Response:', JSON.stringify(test3.data, null, 2));
    
    // Test 4: Try to login with the created user
    console.log('\n📡 Test 4: POST /api/auth/login (login with test user)');
    const loginData = JSON.stringify({
      email: 'test@example.com',
      password: 'password123'
    });
    
    const test4 = await new Promise((resolve, reject) => {
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(loginData)
        }
      };
      
      const req = https.request('https://easybuk.vercel.app/api/auth/login', options, (res) => {
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
              data: { error: 'Invalid JSON', rawData: data } 
            });
          }
        });
      });
      req.on('error', reject);
      req.write(loginData);
      req.end();
    });
    console.log('Status:', test4.status);
    console.log('Response:', JSON.stringify(test4.data, null, 2));
    
    // Test 5: Check if we can get user count now
    console.log('\n📡 Test 5: GET /api/setup-db (check user count)');
    const test5 = await makeRequest('https://easybuk.vercel.app/api/setup-db');
    console.log('User count:', test5.data.userCount);
    
    // Analysis
    console.log('\n🚨 Analysis:');
    if (test1.status === 500) {
      console.log('❌ /api/auth/me is throwing 500 error even without token (should be 401)');
      console.log('This suggests the error is happening before token validation');
    }
    
    if (test3.status === 500) {
      console.log('❌ /api/auth/signup is also throwing 500 error');
      console.log('This suggests a broader issue with the auth system');
    }
    
    if (test3.status === 405) {
      console.log('❌ /api/auth/signup is returning 405 Method Not Allowed');
      console.log('This suggests the POST method is not properly exported');
    }
    
  } catch (error) {
    console.error('❌ Failed to test auth endpoints:', error.message);
  }
}

testAuthEndpoints(); 