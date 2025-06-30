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

async function testEmailEndpoint() {
  try {
    console.log('🔍 Testing email endpoint...\n');
    
    // Test 1: Internal send-email endpoint
    console.log('📡 Test 1: POST /api/internal/send-email');
    const emailData = JSON.stringify({
      to: 'test@example.com',
      type: 'email_verification',
      data: {
        userName: 'Test User',
        verificationLink: 'https://example.com/verify?token=test'
      }
    });
    
    const test1 = await makeRequest('https://easybuk.vercel.app/api/internal/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(emailData)
      },
      body: emailData
    });
    
    console.log('Status:', test1.status);
    console.log('Response:', JSON.stringify(test1.data, null, 2));
    
    // Test 2: Send verification endpoint
    console.log('\n📡 Test 2: POST /api/auth/send-verification');
    const verificationData = JSON.stringify({
      email: 'test@example.com'
    });
    
    const test2 = await makeRequest('https://easybuk.vercel.app/api/auth/send-verification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(verificationData)
      },
      body: verificationData
    });
    
    console.log('Status:', test2.status);
    console.log('Response:', JSON.stringify(test2.data, null, 2));
    
    // Analysis
    console.log('\n🚨 Analysis:');
    if (test1.status === 200) {
      console.log('✅ Internal email endpoint works - SMTP not configured but handled gracefully');
    } else {
      console.log('❌ Internal email endpoint failing');
    }
    
    if (test2.status === 200) {
      console.log('✅ Send verification endpoint works');
    } else {
      console.log('❌ Send verification endpoint failing - this is the source of the 500 errors');
    }
    
  } catch (error) {
    console.error('❌ Failed to test email endpoints:', error.message);
  }
}

testEmailEndpoint(); 