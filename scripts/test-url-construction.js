import fetch from 'node-fetch';

const VERCEL_URL = 'https://easybuk.vercel.app';

async function testUrlDebug() {
  console.log('🧪 Testing URL Debug Endpoint...\n');

  try {
    const response = await fetch(`${VERCEL_URL}/api/debug/url-test`, {
      method: 'GET',
      headers: {
        'Origin': VERCEL_URL
      }
    });

    console.log('📊 Response Status:', response.status);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Debug Response:');
      console.log(JSON.stringify(data, null, 2));
    } else {
      const text = await response.text();
      console.log('❌ Error Response:', text);
    }

  } catch (error) {
    console.error('❌ Fetch Error:', error.message);
  }
}

testUrlDebug(); 