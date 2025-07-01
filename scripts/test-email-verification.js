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

async function testEmailVerification() {
  try {
    console.log('📧 Testing email verification endpoint...\n');
    
    const emailData = JSON.stringify({
      email: 'bizorebenezer@gmail.com'
    });

    console.log('📡 POST /api/auth/send-verification');
    console.log('📝 Data:', JSON.parse(emailData));
    
    const result = await makeRequest('https://easybuk.vercel.app/api/auth/send-verification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(emailData)
      },
      body: emailData
    });
    
    console.log('\n📊 Response:');
    console.log('Status:', result.status);
    console.log('Success:', result.data.success || false);
    
    if (result.data.error) {
      console.log('❌ Error:', result.data.error);
      if (result.data.details) {
        console.log('🔍 Details:', result.data.details);
      }
    }
    
    if (result.data.message) {
      console.log('✅ Message:', result.data.message);
    }
    
    if (result.data.verificationToken) {
      console.log('🎫 Verification Token:', result.data.verificationToken);
    }
    
    if (result.data.verificationLink) {
      console.log('🔗 Verification Link:', result.data.verificationLink);
    }
    
    // If there's raw data (for debugging malformed responses)
    if (result.data.rawData) {
      console.log('📄 Raw response data (first 500 chars):');
      console.log(result.data.rawData);
    }
    
    console.log('\n🔍 Analysis:');
    if (result.status === 200) {
      console.log('✅ SUCCESS: Email verification endpoint is working!');
      console.log('💡 Check your email inbox for the verification message.');
    } else if (result.status === 400) {
      console.log('❌ BAD REQUEST: Check the error message above.');
    } else if (result.status === 404) {
      console.log('❌ NOT FOUND: User not found in database.');
    } else if (result.status === 500) {
      console.log('❌ SERVER ERROR: Internal server error occurred.');
      console.log('💡 Check Vercel function logs for detailed error information.');
    } else {
      console.log('❓ UNEXPECTED STATUS:', result.status);
    }

  } catch (error) {
    console.error('❌ Failed to test email verification:', error.message);
  }
}

testEmailVerification(); 