const { RtcTokenBuilder, RtcRole } = require('agora-access-token');

console.log('🧪 AGORA SETUP TEST');
console.log('==================\n');

// Test environment variables
console.log('📋 ENVIRONMENT VARIABLES:');
const requiredVars = {
    'AGORA_CUSTOMER_ID': process.env.AGORA_CUSTOMER_ID,
    'AGORA_KEY': process.env.AGORA_KEY,
    'AGORA_SECRET': process.env.AGORA_SECRET,
    'NEXT_PUBLIC_AGORA_APP_ID': process.env.NEXT_PUBLIC_AGORA_APP_ID
};

let allVarsSet = true;
for (const [key, value] of Object.entries(requiredVars)) {
    const status = value ? '✅' : '❌';
    const displayValue = value ? `${value.substring(0, 8)}...` : 'NOT SET';
    console.log(`${status} ${key}: ${displayValue}`);
    if (!value) allVarsSet = false;
}

console.log('');

if (!allVarsSet) {
    console.log('❌ MISSING ENVIRONMENT VARIABLES!');
    console.log('Add these to your .env.local file:');
    console.log('');
    console.log('AGORA_CUSTOMER_ID=18b6d08f950a48d9bc49814dda728562');
    console.log('AGORA_KEY=18b6d08f950a48d9bc49814dda728562');
    console.log('AGORA_SECRET=7f8fa52ddb6946ef8466602b829c4711');
    console.log('NEXT_PUBLIC_AGORA_APP_ID=18b6d08f950a48d9bc49814dda728562');
    console.log('');
    process.exit(1);
}

// Test token generation
console.log('🔑 TESTING TOKEN GENERATION:');
try {
    const appId = process.env.AGORA_KEY;
    const appSecret = process.env.AGORA_SECRET;
    const channelName = 'test-channel-' + Date.now();
    const uid = Math.floor(Math.random() * 1000000);
    const expirationTimeInSeconds = 3600;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    const token = RtcTokenBuilder.buildTokenWithUid(
        appId,
        appSecret,
        channelName,
        uid,
        RtcRole.PUBLISHER,
        privilegeExpiredTs
    );

    console.log('✅ Token generated successfully');
    console.log(`   Channel: ${channelName}`);
    console.log(`   UID: ${uid}`);
    console.log(`   Token: ${token.substring(0, 20)}...`);
    console.log(`   Expires in: ${expirationTimeInSeconds / 3600} hours`);
    
} catch (error) {
    console.log('❌ Token generation failed:', error.message);
    process.exit(1);
}

console.log('\n🎯 NEXT STEPS:');
console.log('1. Start your dev server: npm run dev');
console.log('2. Open a booking with video call in your browser');
console.log('3. Check browser console for AGORA DEBUG logs');
console.log('4. Copy any error logs and share them if issues occur');

console.log('\n✅ AGORA SETUP TEST COMPLETE - Ready to test in browser!'); 