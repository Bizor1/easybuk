// Test the complete signup flow with automatic email verification
const testSignupWithEmail = async () => {
    try {
        console.log('🧪 Testing complete signup flow with automatic email verification...');

        const testUser = {
            name: 'Test User Email',
            email: `test.email.${Date.now()}@example.com`,
            password: 'password123',
            role: 'PROVIDER'
        };

        console.log('📝 Creating new user:', testUser.email);

        const response = await fetch('http://localhost:3000/api/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testUser)
        });

        console.log('📧 Signup response status:', response.status);
        const result = await response.text();
        console.log('📧 Signup response body:', result);

        if (response.ok) {
            console.log('✅ Signup successful - verification email should have been sent automatically!');
            console.log('📧 Check the server logs above for email sending confirmation');
        } else {
            console.log('❌ Signup failed');
        }

    } catch (error) {
        console.error('❌ Error testing signup with email:', error);
    }
};

testSignupWithEmail(); 