const fetch = require('node-fetch');

async function testEmail() {
    try {
        console.log('🧪 Testing internal email endpoint...');
        
        const response = await fetch('http://localhost:3000/api/internal/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                to: 'test@example.com',
                type: 'email_verification',
                data: {
                    userName: 'Test User',
                    verificationLink: 'http://localhost:3000/auth/verify-email?token=test123'
                }
            })
        });

        const result = await response.json();
        
        console.log('📧 Email endpoint response:');
        console.log('Status:', response.status);
        console.log('Result:', JSON.stringify(result, null, 2));

        if (response.ok) {
            console.log('✅ Email endpoint is working!');
        } else {
            console.log('❌ Email endpoint failed');
        }

    } catch (error) {
        console.error('❌ Error testing email:', error);
    }
}

testEmail(); 