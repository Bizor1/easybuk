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

async function testUserSignup() {
  try {
    console.log('🧪 Testing signup with user data...\n');
    
    // Test with the exact data the user is trying to use
    const signupData = JSON.stringify({
      email: 'bizorebenezer@gmail.com',
      password: 'password123', // Using a test password
      name: 'Bizore Ebenezer',
      role: 'CLIENT'
    });

    console.log('📡 POST /api/auth/signup');
    console.log('📝 Data:', JSON.parse(signupData));
    
    const result = await makeRequest('https://easybuk.vercel.app/api/auth/signup', {
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
    }
    
    if (result.data.user) {
      console.log('✅ User created:', {
        id: result.data.user.userId,
        email: result.data.user.email,
        name: result.data.user.name,
        roles: result.data.user.roles
      });
    }
    
    // If there's raw data (for debugging malformed responses)
    if (result.data.rawData) {
      console.log('📄 Raw response data:');
      console.log(result.data.rawData);
    }
    
    if (result.status === 200) {
      console.log('\n✅ SUCCESS: Signup worked!');
      console.log('💡 The user should be able to sign up successfully.');
    } else if (result.status === 400) {
      console.log('\n❌ 400 BAD REQUEST: Signup validation failed');
      console.log('💡 Check the error message above for details.');
    } else if (result.status === 500) {
      console.log('\n❌ 500 SERVER ERROR: Internal server error');
      console.log('💡 There may be a server-side issue.');
    } else {
      console.log('\n❓ UNEXPECTED STATUS:', result.status);
    }

  } catch (error) {
    console.error('❌ Failed to test user signup:', error.message);
  }
}

testUserSignup(); 