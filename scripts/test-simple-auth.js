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
    if (options.method === 'POST' && options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function testSimpleAuthRoute() {
  try {
    console.log('🔍 Testing simple auth route...\n');
    
    // Test GET request
    console.log('📡 Test 1: GET /api/auth/test-simple');
    const test1 = await makeRequest('https://easybuk.vercel.app/api/auth/test-simple');
    console.log('Status:', test1.status);
    console.log('Response:', JSON.stringify(test1.data, null, 2));
    
    // Test POST request
    console.log('\n📡 Test 2: POST /api/auth/test-simple');
    const testData = JSON.stringify({ test: 'data', message: 'hello' });
    const test2 = await makeRequest('https://easybuk.vercel.app/api/auth/test-simple', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(testData)
      },
      body: testData
    });
    console.log('Status:', test2.status);
    console.log('Response:', JSON.stringify(test2.data, null, 2));
    
    // Analysis
    console.log('\n🚨 Analysis:');
    if (test1.status === 200) {
      console.log('✅ Simple GET route works in auth directory');
    } else {
      console.log('❌ Even simple GET route fails in auth directory');
    }
    
    if (test2.status === 200) {
      console.log('✅ Simple POST route works in auth directory');
      console.log('This means the issue is with the specific auth route logic, not the directory');
    } else {
      console.log('❌ Simple POST route also fails');
      console.log('This suggests a broader issue with the auth directory or POST methods');
    }
    
  } catch (error) {
    console.error('❌ Failed to test simple auth route:', error.message);
  }
}

// Wait a bit for deployment, then test
setTimeout(testSimpleAuthRoute, 30000); // Wait 30 seconds for deployment
console.log('⏳ Waiting 30 seconds for deployment...'); 