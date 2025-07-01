import fetch from 'node-fetch';

async function testExactVerificationFlow() {
  console.log('🧪 Testing Exact Verification Flow...\n');

  try {
    // Step 1: Test the same email API call that verification route makes
    const origin = 'https://easybuk.vercel.app';
    const emailApiUrl = `${origin}/api/internal/send-email`;
    
    console.log('📡 Testing exact same call as verification route:');
    console.log('   URL:', emailApiUrl);
    
    const emailPayload = {
      to: 'bizorebenezer@gmail.com',
      type: 'email_verification',
      data: {
        userName: 'Bizore Ebenezer',
        verificationLink: `${origin}/auth/verify-email?token=TEST123`,
        verificationToken: 'TEST123'
      }
    };
    
    console.log('📦 Payload:', JSON.stringify(emailPayload, null, 2));
    
    const emailResult = await fetch(emailApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailPayload)
    });

    console.log('\n📊 Response Status:', emailResult.status);
    console.log('📊 Response OK:', emailResult.ok);
    console.log('📄 Content-Type:', emailResult.headers.get('content-type'));

    const responseText = await emailResult.text();
    console.log('📄 Response Length:', responseText.length);

    if (responseText.includes('<!doctype html>')) {
      console.log('❌ GOT HTML RESPONSE:');
      console.log(responseText.substring(0, 200));
    } else {
      console.log('✅ GOT NON-HTML RESPONSE:');
      try {
        const parsedResponse = JSON.parse(responseText);
        console.log('JSON Response:', parsedResponse);
      } catch (parseError) {
        console.log('Raw Response:', responseText.substring(0, 200));
      }
    }

  } catch (error) {
    console.error('❌ Test Error:', error.message);
  }
}

testExactVerificationFlow(); 