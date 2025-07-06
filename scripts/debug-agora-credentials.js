console.log('🔍 AGORA CREDENTIALS DEBUGGING');
console.log('==============================\n');

// Check environment variables
console.log('📋 ENVIRONMENT CHECK:');
const agoraKey = process.env.AGORA_KEY;
const agoraSecret = process.env.AGORA_SECRET;
const nextPublicAppId = process.env.NEXT_PUBLIC_AGORA_APP_ID;

console.log('AGORA_KEY:', agoraKey || 'NOT SET');
console.log('AGORA_SECRET:', agoraSecret ? `${agoraSecret.substring(0, 8)}...` : 'NOT SET');
console.log('NEXT_PUBLIC_AGORA_APP_ID:', nextPublicAppId || 'NOT SET');

console.log('\n🔍 CREDENTIAL ANALYSIS:');

// Check if App ID format is correct
if (agoraKey) {
    console.log(`✅ AGORA_KEY length: ${agoraKey.length} characters`);
    console.log(`✅ AGORA_KEY format: ${/^[a-f0-9]{32}$/i.test(agoraKey) ? 'Valid hex' : 'Invalid format'}`);
} else {
    console.log('❌ AGORA_KEY is not set');
}

if (agoraSecret) {
    console.log(`✅ AGORA_SECRET length: ${agoraSecret.length} characters`);
    console.log(`✅ AGORA_SECRET format: ${/^[a-f0-9]{32}$/i.test(agoraSecret) ? 'Valid hex' : 'Invalid format'}`);
} else {
    console.log('❌ AGORA_SECRET is not set');
}

if (nextPublicAppId) {
    console.log(`✅ NEXT_PUBLIC_AGORA_APP_ID length: ${nextPublicAppId.length} characters`);
    console.log(`✅ NEXT_PUBLIC_AGORA_APP_ID format: ${/^[a-f0-9]{32}$/i.test(nextPublicAppId) ? 'Valid hex' : 'Invalid format'}`);
    
    // Check if client and server App IDs match
    if (agoraKey && nextPublicAppId) {
        if (agoraKey === nextPublicAppId) {
            console.log('✅ Server and client App IDs match');
        } else {
            console.log('❌ WARNING: Server and client App IDs do NOT match!');
            console.log(`   Server (AGORA_KEY): ${agoraKey}`);
            console.log(`   Client (NEXT_PUBLIC_AGORA_APP_ID): ${nextPublicAppId}`);
        }
    }
} else {
    console.log('❌ NEXT_PUBLIC_AGORA_APP_ID is not set');
}

console.log('\n🚨 COMMON ISSUES:');
console.log('1. App ID might be from a deleted/inactive Agora project');
console.log('2. App ID might be incorrectly copied (missing characters, etc.)');
console.log('3. Agora project might not be activated yet');
console.log('4. Wrong project/console being used');

console.log('\n🔧 RECOMMENDED FIXES:');
console.log('1. Double-check your App ID in Agora Console (https://console.agora.io)');
console.log('2. Verify your project is active and not deleted');
console.log('3. Make sure you\'re using the correct App ID from the right project');
console.log('4. Try creating a new Agora project if this one seems corrupted');

console.log('\n📋 CURRENT CONFIGURATION TO VERIFY:');
console.log('====================================');
if (agoraKey) {
    console.log(`App ID being used: ${agoraKey}`);
    console.log('👆 Copy this App ID and verify it exists in your Agora Console');
} else {
    console.log('❌ No App ID configured - check your .env.local file');
} 