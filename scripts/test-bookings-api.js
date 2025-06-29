const fetch = require('node-fetch');

async function testBookingsAPI() {
    try {
        console.log('🧪 Testing /api/bookings endpoint...\n');
        
        // Test the API endpoint directly
        const response = await fetch('http://localhost:3000/api/bookings', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // Note: This won't work without proper authentication
                // but will show us the authentication error
            }
        });

        console.log(`📡 Response Status: ${response.status}`);
        console.log(`📡 Response Status Text: ${response.statusText}`);

        const data = await response.text();
        console.log(`📡 Response Body: ${data}`);

        if (response.status === 401) {
            console.log('\n🔒 Expected: Authentication required');
            console.log('✅ This is normal - the API requires authentication');
            console.log('\n📋 What you need to do:');
            console.log('1. Open your browser');
            console.log('2. Go to http://localhost:3000/auth/login');
            console.log('3. Login with: ebenezernachinabapplications@gmail.com');
            console.log('4. Go to: http://localhost:3000/client/dashboard');
            console.log('5. You should see the booking with a "Complete Payment" button!');
        } else {
            console.log('\n📊 API Response Data:');
            try {
                const jsonData = JSON.parse(data);
                console.log(JSON.stringify(jsonData, null, 2));
            } catch (e) {
                console.log('Response is not JSON:', data);
            }
        }

    } catch (error) {
        console.error('❌ Error testing API:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('\n🚫 Connection refused - is the Next.js server running?');
            console.log('Run: npm run dev');
        }
    }
}

testBookingsAPI(); 