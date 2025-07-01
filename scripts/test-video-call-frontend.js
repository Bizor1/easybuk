// Frontend test script for video call functionality
// Run this in the browser console when on a booking/messaging page

async function testVideoCallFrontend(providedBookingId) {
    console.log('🎥 Testing Video Call Frontend Functionality...\n');

    // Use provided booking ID or try to detect it
    let bookingId = providedBookingId;
    
    if (!bookingId) {
        // Step 1: Check if we're on the right page
        const currentUrl = window.location.href;
        console.log('📍 Current URL:', currentUrl);

        // Try to extract from URL
        const urlMatch = currentUrl.match(/bookings\/([a-zA-Z0-9_-]+)/);
        if (urlMatch) {
            bookingId = urlMatch[1];
        }

        // Try to extract from DOM
        if (!bookingId) {
            const bookingElements = document.querySelectorAll('[data-booking-id]');
            if (bookingElements.length > 0) {
                bookingId = bookingElements[0].getAttribute('data-booking-id');
            }
        }

        // Try to find in React components (look for bookingId in window)
        if (!bookingId && window.React) {
            console.log('🔍 Searching for booking ID in React components...');
            // This is a bit hacky but might work
            const reactElements = document.querySelectorAll('[data-reactroot] *');
            for (let element of reactElements) {
                if (element._reactInternalFiber || element.__reactInternalInstance) {
                    // Try to find bookingId in props
                    const fiber = element._reactInternalFiber || element.__reactInternalInstance;
                    if (fiber && fiber.memoizedProps && fiber.memoizedProps.bookingId) {
                        bookingId = fiber.memoizedProps.bookingId;
                        break;
                    }
                }
            }
        }
    }

    console.log('🆔 Booking ID found:', bookingId || 'Not found');

    if (!bookingId) {
        console.log('❌ Cannot test without booking ID. Please provide one:');
        console.log('   testVideoCallFrontend("your-booking-id-here")');
        return;
    }

    // Step 2: Check authentication
    console.log('\n🔐 Step 2: Checking authentication...');
    
    const cookies = document.cookie;
    const authTokenCookie = cookies.split(';').find(cookie => cookie.trim().startsWith('auth-token='));
    const refreshTokenCookie = cookies.split(';').find(cookie => cookie.trim().startsWith('refresh-token='));
    
    console.log('🍪 Auth token cookie found:', authTokenCookie ? 'Yes' : 'No');
    console.log('🍪 Refresh token cookie found:', refreshTokenCookie ? 'Yes' : 'No');

    if (authTokenCookie) {
        try {
            const tokenValue = authTokenCookie.split('=')[1];
            const tokenPayload = JSON.parse(atob(tokenValue.split('.')[1]));
            console.log('👤 User info from token:', {
                userId: tokenPayload.userId,
                email: tokenPayload.email,
                roles: tokenPayload.roles
            });
        } catch (error) {
            console.log('❌ Error parsing auth token:', error.message);
        }
    }

    // Also test the /api/auth/me endpoint to compare
    console.log('\n🔍 Testing /api/auth/me endpoint...');
    try {
        const meResponse = await fetch('/api/auth/me', { credentials: 'include' });
        console.log('📊 /api/auth/me Response status:', meResponse.status);
        
        if (meResponse.ok) {
            const meData = await meResponse.json();
            console.log('👤 Current user from API:', {
                userId: meData.user?.userId,
                email: meData.user?.email,
                name: meData.user?.name,
                activeRole: meData.user?.activeRole,
                roles: meData.user?.roles
            });
        } else {
            console.log('❌ /api/auth/me failed:', await meResponse.text());
        }
    } catch (error) {
        console.log('❌ /api/auth/me error:', error);
    }

    // Step 3: Test Agora token API call
    console.log('\n📡 Step 3: Testing Agora token API call...');
    
    const channelName = `easybuk-consultation-${bookingId}`;
    
    try {
        const response = await fetch('/api/agora/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                bookingId: bookingId,
                channelName: channelName
            })
        });

        console.log('📊 Response status:', response.status);
        console.log('📋 Response headers:', Object.fromEntries(response.headers.entries()));

        if (response.ok) {
            const data = await response.json();
            console.log('✅ Token received successfully!');
            console.log('🎫 Token data:', {
                channelName: data.channelName,
                uid: data.uid,
                appId: data.appId,
                booking: data.booking,
                expiresAt: data.expiresAt
            });
            
            // Step 4: Test Agora SDK initialization
            console.log('\n🔧 Step 4: Testing Agora SDK...');
            if (window.AgoraRTC) {
                console.log('✅ Agora SDK is available');
                
                try {
                    const client = window.AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
                    console.log('✅ Agora client created successfully');
                    
                    // Test joining channel (but don't actually join)
                    console.log('🎯 Would join channel:', data.channelName);
                    console.log('🔑 With token:', data.token.substring(0, 20) + '...');
                    console.log('👤 As user ID:', data.uid);
                    
                } catch (error) {
                    console.log('❌ Error creating Agora client:', error);
                }
            } else {
                console.log('❌ Agora SDK not found. Make sure agora-rtc-sdk-ng is loaded.');
            }
            
        } else {
            const errorText = await response.text();
            console.log('❌ Token request failed');
            console.log('📄 Error response:', errorText);
            
            // Try to parse as JSON
            try {
                const errorData = JSON.parse(errorText);
                console.log('🔍 Parsed error:', errorData);
            } catch (e) {
                console.log('📝 Raw error text:', errorText);
            }
        }
        
    } catch (error) {
        console.log('❌ Network error:', error);
    }

    // Step 5: Check for video call components
    console.log('\n🎬 Step 5: Checking for video call components...');
    
    const videoCallButtons = document.querySelectorAll('button').forEach(button => {
        const text = button.textContent.toLowerCase();
        if (text.includes('video') || text.includes('call') || text.includes('start')) {
            console.log('🎯 Found potential video call button:', button.textContent);
            console.log('   Element:', button);
        }
    });

    const videoElements = document.querySelectorAll('video');
    console.log(`📹 Video elements found: ${videoElements.length}`);

    // Step 6: DOM inspection for React components
    console.log('\n🔍 Step 6: Looking for React video components...');
    
    const reactComponents = [];
    document.querySelectorAll('*').forEach(element => {
        const className = element.className;
        if (typeof className === 'string' && (
            className.includes('video') || 
            className.includes('call') || 
            className.includes('agora') ||
            className.includes('VideoCall') ||
            className.includes('CallInterface')
        )) {
            reactComponents.push({
                tag: element.tagName,
                className: className,
                element: element
            });
        }
    });

    console.log(`🔧 Potential React video components: ${reactComponents.length}`);
    reactComponents.forEach(comp => {
        console.log(`   ${comp.tag}.${comp.className}`);
    });

    console.log('\n✅ Frontend test completed!');
    console.log('\n💡 To test with a specific booking ID:');
    console.log('   testVideoCallFrontend("your-booking-id")');
}

// Create a wrapper function for convenience
function runVideoCallTest(specificBookingId) {
    // Use the known test booking ID if no ID is provided
    const defaultBookingId = "booking_1751390884304_6tfbse4zj";
    
    if (specificBookingId) {
        console.log('🎯 Using provided booking ID:', specificBookingId);
        return testVideoCallFrontend(specificBookingId);
    } else {
        console.log('🎯 Using default test booking ID:', defaultBookingId);
        return testVideoCallFrontend(defaultBookingId);
    }
}

// Make both functions available globally
window.testVideoCallFrontend = testVideoCallFrontend;
window.runVideoCallTest = runVideoCallTest;

console.log('🎥 Video Call Frontend Test Script Loaded!');
console.log('📝 Usage:');
console.log('   runVideoCallTest()                         // Use default booking ID: booking_1751390884304_6tfbse4zj');
console.log('   runVideoCallTest("booking-id-here")        // Use specific booking ID');
console.log('   testVideoCallFrontend("booking-id-here")   // Direct function call');
console.log('');
console.log('💡 Quick test: Just run runVideoCallTest() to test with the known booking!'); 