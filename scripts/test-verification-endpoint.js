// Test the send-verification endpoint for an existing user
const testVerificationEndpoint = async () => {
    try {
        console.log('🧪 Testing send-verification endpoint...');

        // Test 1: With email in body (unauthenticated)
        console.log('\n📧 Test 1: Unauthenticated request with email');
        const response1 = await fetch('http://localhost:3000/api/auth/send-verification', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'johndiernorng@gmail.com'
            })
        });

        console.log('Response status:', response1.status);
        const result1 = await response1.text();
        console.log('Response body:', result1);

        // Test 2: Empty body (should handle gracefully)
        console.log('\n📧 Test 2: Empty body request');
        const response2 = await fetch('http://localhost:3000/api/auth/send-verification', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: ''
        });

        console.log('Response status:', response2.status);
        const result2 = await response2.text();
        console.log('Response body:', result2);

        // Test 3: No body at all
        console.log('\n📧 Test 3: No body at all');
        const response3 = await fetch('http://localhost:3000/api/auth/send-verification', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('Response status:', response3.status);
        const result3 = await response3.text();
        console.log('Response body:', result3);

    } catch (error) {
        console.error('❌ Error testing verification endpoint:', error);
    }
};

testVerificationEndpoint(); 