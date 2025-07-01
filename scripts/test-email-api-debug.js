import fetch from 'node-fetch';

const VERCEL_URL = 'https://easybuk.vercel.app';

async function testEmailAPI() {
  console.log('🧪 Testing Email API Directly...\n');

  try {
    const response = await fetch(`${VERCEL_URL}/api/internal/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: 'bizorebenezer@gmail.com',
        type: 'email_verification',
        data: {
          userName: 'Test User',
          verificationLink: 'https://easybuk.vercel.app/auth/verify-email?token=test123'
        }
      })
    });

    console.log('📊 Response Status:', response.status);
    console.log('📊 Response Headers:', Object.fromEntries(response.headers.entries()));

    const contentType = response.headers.get('content-type');
    console.log('📄 Content-Type:', contentType);

    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      console.log('✅ JSON Response:', data);
    } else {
      const text = await response.text();
      console.log('❌ Non-JSON Response (first 500 chars):');
      console.log(text.substring(0, 500));
      console.log('\n... (truncated)');
    }

  } catch (error) {
    console.error('❌ Fetch Error:', error.message);
  }
}

testEmailAPI(); 