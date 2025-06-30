const https = require('https');

// Function to make HTTP request
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          resolve({ error: 'Invalid JSON', rawData: data });
        }
      });
    }).on('error', reject);
  });
}

async function checkEnvironmentVariables() {
  try {
    console.log('🔍 Checking environment variables on live site...\n');
    
    // Test the /api/test endpoint
    console.log('📡 Testing: https://easybuk.vercel.app/api/test');
    const testResult = await makeRequest('https://easybuk.vercel.app/api/test');
    console.log('🔥 Test Endpoint Response:', JSON.stringify(testResult, null, 2));
    
    console.log('\n🔍 Environment Variable Status:');
    console.log('- NODE_ENV:', testResult.environment || 'Not set');
    console.log('- DATABASE_URL:', testResult.hasDatabase ? '✅ Set' : '❌ Missing');
    console.log('- JWT_SECRET:', testResult.hasJwtSecret ? '✅ Set' : '❌ Missing');
    console.log('- NEXTAUTH_URL:', testResult.hasNextAuthUrl ? '✅ Set' : '❌ Missing');
    
    // Test database setup endpoint
    console.log('\n📡 Testing: https://easybuk.vercel.app/api/setup-db');
    const dbResult = await makeRequest('https://easybuk.vercel.app/api/setup-db');
    console.log('🔥 Database Endpoint Response:', JSON.stringify(dbResult, null, 2));
    
    // Test auth endpoints
    console.log('\n📡 Testing: https://easybuk.vercel.app/api/auth/me');
    const authResult = await makeRequest('https://easybuk.vercel.app/api/auth/me');
    console.log('🔥 Auth ME Endpoint Response:', JSON.stringify(authResult, null, 2));
    
    // Analyze issues
    console.log('\n🚨 Issue Analysis:');
    if (!testResult.hasJwtSecret) {
      console.log('❌ JWT_SECRET is missing - this will cause auth failures');
    }
    if (!testResult.hasNextAuthUrl) {
      console.log('❌ NEXTAUTH_URL is missing - this will cause callback issues');
    }
    if (!testResult.hasDatabase) {
      console.log('❌ DATABASE_URL is missing - but we know this is set from our tests');
    }
    
  } catch (error) {
    console.error('❌ Failed to check environment variables:', error.message);
  }
}

checkEnvironmentVariables(); 