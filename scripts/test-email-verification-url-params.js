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

async function testEmailVerificationUrlParams() {
  try {
    console.log('📧 Testing email verification with URL parameters...\n');
    
    const testEmail = 'bizorebenezer@gmail.com';
    const encodedEmail = encodeURIComponent(testEmail);
    
    console.log('📡 POST /api/auth/send-verification?email=' + testEmail);
    console.log('📝 Using URL parameter instead of request body');
    
    const result = await makeRequest(`https://easybuk.vercel.app/api/auth/send-verification?email=${encodedEmail}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
      // No body - email is in URL params
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
      
      // Check the domain in the verification link
      if (result.data.verificationLink.includes('localhost')) {
        console.log('❌ PROBLEM: Link still contains localhost!');
      } else if (result.data.verificationLink.includes('easybuk.vercel.app')) {
        console.log('✅ GOOD: Link uses correct production domain');
      }
    }
    
    // If there's raw data (for debugging malformed responses)
    if (result.data.rawData) {
      console.log('📄 Raw response data (first 500 chars):');
      console.log(result.data.rawData);
    }
    
    console.log('\n🔍 Analysis:');
    if (result.status === 200) {
      console.log('✅ SUCCESS: Email verification with URL params works!');
      console.log('💡 The body reading issue has been resolved.');
    } else if (result.status === 400) {
      console.log('❌ BAD REQUEST: Check the error message above.');
    } else if (result.status === 404) {
      console.log('❌ NOT FOUND: User not found in database.');
    } else if (result.status === 500) {
      console.log('❌ SERVER ERROR: Still having internal server issues.');
      if (result.data.details && result.data.details.includes('Body has already been read')) {
        console.log('💡 The body reading fix hasn\'t been deployed yet or needs more work.');
      } else {
        console.log('💡 Different server error - check Vercel function logs.');
      }
    } else {
      console.log('❓ UNEXPECTED STATUS:', result.status);
    }

  } catch (error) {
    console.error('❌ Failed to test email verification:', error.message);
  }
}

testEmailVerificationUrlParams(); 