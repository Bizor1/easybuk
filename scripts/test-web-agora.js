const { RtcTokenBuilder, RtcRole } = require('agora-access-token');

console.log('🧪 TESTING WEB AGORA SETUP');
console.log('=========================\n');

// Use your REAL App ID from dashboard
const REAL_APP_ID = 'a07e1e5da6fc477f8b55e74192d31dd6';

console.log('📋 TESTING WITH YOUR REAL APP ID:');
console.log(`App ID: ${REAL_APP_ID}`);

// Test 1: Token generation with your real App ID
console.log('\n🔑 TEST 1: Token Generation');
try {
    // For web apps, we can use the App ID as both key and secret for testing
    const channelName = 'test-channel-' + Date.now();
    const uid = Math.floor(Math.random() * 1000000);
    const expirationTimeInSeconds = 3600;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    // Try generating token with your real App ID
    const token = RtcTokenBuilder.buildTokenWithUid(
        REAL_APP_ID,
        REAL_APP_ID, // Using App ID as secret for testing
        channelName,
        uid,
        RtcRole.PUBLISHER,
        privilegeExpiredTs
    );

    console.log('✅ Token generated with your real App ID');
    console.log(`   Channel: ${channelName}`);
    console.log(`   UID: ${uid}`);
    console.log(`   Token: ${token.substring(0, 20)}...`);
    
} catch (error) {
    console.log('❌ Token generation failed:', error.message);
}

// Test 2: Check environment variables
console.log('\n📋 TEST 2: Environment Variables Check');
const envVars = {
    'AGORA_KEY': process.env.AGORA_KEY,
    'NEXT_PUBLIC_AGORA_APP_ID': process.env.NEXT_PUBLIC_AGORA_APP_ID
};

for (const [key, value] of Object.entries(envVars)) {
    if (value) {
        const isCorrect = value === REAL_APP_ID;
        const status = isCorrect ? '✅' : '❌';
        console.log(`${status} ${key}: ${value} ${isCorrect ? '(CORRECT)' : '(WRONG - should be ' + REAL_APP_ID + ')'}`);
    } else {
        console.log(`❌ ${key}: NOT SET`);
    }
}

console.log('\n🎯 WHAT TO DO:');
console.log('1. Update your .env file:');
console.log(`   AGORA_KEY=${REAL_APP_ID}`);
console.log(`   NEXT_PUBLIC_AGORA_APP_ID=${REAL_APP_ID}`);
console.log('2. Update your Vercel environment variables with the same');
console.log('3. Restart your dev server');
console.log('4. Test video call again');

console.log('\n💡 NOTE: For web apps, you can use the App ID as the secret too!'); 