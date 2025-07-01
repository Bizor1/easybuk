const https = require('https');

// Function to make HTTP request and check origin detection
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
            rawData: data
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

async function testOriginDetection() {
  try {
    console.log('🌐 Testing origin detection during signup flow...\n');
    
    // Test signup with a temporary email to see what origin is detected
    const testEmail = 'origintest' + Date.now() + '@example.com';
    const signupData = JSON.stringify({
      email: testEmail,
      password: 'password123',
      name: 'Origin Test User',
      role: 'CLIENT'
    });

    console.log('📝 Testing signup with temporary email:', testEmail);
    console.log('📡 This will show us what origin is being detected...\n');

    const result = await makeRequest('https://easybuk.vercel.app/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://easybuk.vercel.app',
        'Referer': 'https://easybuk.vercel.app/auth/signup',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: signupData
    });
    
    console.log('📊 Signup Response:');
    console.log('Status:', result.status);
    
    if (result.data) {
      console.log('Success:', result.data.success);
      if (result.data.error) {
        console.log('Error:', result.data.error);
      }
      if (result.data.user) {
        console.log('User created:', !!result.data.user);
      }
    } else if (result.rawData) {
      console.log('Raw response (first 300 chars):', result.rawData.substring(0, 300));
    }

    // Now test the email verification endpoint directly to compare
    console.log('\n' + '='.repeat(50));
    console.log('📧 Testing email verification endpoint directly...\n');

    const emailResult = await makeRequest('https://easybuk.vercel.app/api/auth/send-verification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://easybuk.vercel.app',
        'Referer': 'https://easybuk.vercel.app/auth/signup'
      },
      body: JSON.stringify({ email: testEmail })
    });

    console.log('📊 Email Verification Response:');
    console.log('Status:', emailResult.status);
    
    if (emailResult.data) {
      console.log('Success:', emailResult.data.success);
      if (emailResult.data.verificationLink) {
        console.log('🔗 Verification Link Generated:', emailResult.data.verificationLink);
        
        // Check if the link contains localhost or the correct domain
        if (emailResult.data.verificationLink.includes('localhost')) {
          console.log('❌ PROBLEM: Verification link contains localhost!');
        } else if (emailResult.data.verificationLink.includes('easybuk.vercel.app')) {
          console.log('✅ GOOD: Verification link uses correct domain');
        } else {
          console.log('⚠️ UNKNOWN: Verification link uses unexpected domain');
        }
      }
      if (emailResult.data.error) {
        console.log('❌ Email Error:', emailResult.data.error);
        if (emailResult.data.details) {
          console.log('🔍 Error Details:', emailResult.data.details);
        }
      }
    } else if (emailResult.rawData) {
      console.log('Raw email response:', emailResult.rawData.substring(0, 300));
      if (emailResult.rawData.includes('<!doctype') || emailResult.rawData.includes('<!DOCTYPE')) {
        console.log('❌ CONFIRMED: Email verification returns HTML error page');
      }
    }

    console.log('\n🔍 Analysis:');
    if (result.status === 200 && emailResult.status !== 200) {
      console.log('💡 Signup works, but email verification fails');
      console.log('💡 This confirms the issue is in the email system');
    }

  } catch (error) {
    console.error('❌ Failed to test origin detection:', error.message);
  }
}

testOriginDetection(); 