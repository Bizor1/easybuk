// Simple test to directly call the internal email API
const testEmail = async () => {
    try {
        console.log('🧪 Testing internal email endpoint directly...');

        const response = await fetch('http://localhost:3000/api/internal/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                to: 'bizorebenezer@gmail.com',
                type: 'email_verification',
                data: {
                    userName: 'Test User',
                    verificationLink: 'http://localhost:3000/auth/verify-email?token=TEST123'
                }
            })
        });

        console.log('📧 Response status:', response.status);
        
        const result = await response.text();
        console.log('📧 Response body:', result);

        if (response.ok) {
            console.log('✅ Email endpoint test successful!');
        } else {
            console.log('❌ Email endpoint test failed');
        }

    } catch (error) {
        console.error('❌ Error testing email endpoint:', error);
    }
};

testEmail(); 