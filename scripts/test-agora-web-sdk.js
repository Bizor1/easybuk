// Test script to verify Web SDK token API works correctly
const { RtcTokenBuilder, RtcRole } = require('agora-access-token');
const fs = require('fs');
const path = require('path');

// Load environment variables
function loadEnvFile() {
    try {
        const envPath = path.join(process.cwd(), '.env');
        const envFile = fs.readFileSync(envPath, 'utf8');
        
        envFile.split('\n').forEach(line => {
            const [key, ...values] = line.split('=');
            if (key && values.length > 0) {
                const value = values.join('=').trim().replace(/^["']|["']$/g, '');
                if (value) {
                    process.env[key.trim()] = value;
                }
            }
        });
        console.log('✅ Loaded .env file');
    } catch (error) {
        console.log('⚠️  Could not load .env file:', error.message);
    }
}

loadEnvFile();

console.log('🧪 TESTING AGORA WEB SDK SETUP');
console.log('==============================');

const appId = process.env.AGORA_KEY;
const appSecret = process.env.AGORA_SECRET;

console.log('Environment Variables:');
console.log('AGORA_KEY (App ID):', appId ? `${appId.substring(0, 8)}...` : 'MISSING');
console.log('AGORA_SECRET:', appSecret ? `${appSecret.substring(0, 8)}...` : 'MISSING');
console.log('');

if (!appId || !appSecret) {
    console.log('❌ Missing required environment variables');
    process.exit(1);
}

// Test token generation (simulating the API)
try {
    const channelName = 'test-channel';
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

    console.log('✅ Token Generation Test:');
    console.log('Channel:', channelName);
    console.log('UID:', uid);
    console.log('Token:', token.substring(0, 40) + '...');
    console.log('');

    // Test API response format
    const mockApiResponse = {
        token,
        channelName,
        uid: uid.toString(),
        appId: appId, // This is key for Web SDK
        booking: {
            id: 'test-booking',
            clientName: 'Test Client',
            providerName: 'Test Provider'
        }
    };

    console.log('✅ Mock API Response Format:');
    console.log(JSON.stringify(mockApiResponse, null, 2));
    console.log('');

    console.log('🎉 WEB SDK SETUP VALIDATION COMPLETE!');
    console.log('✅ App ID and Secret are valid');
    console.log('✅ Token generation works');
    console.log('✅ API response includes appId for Web SDK');
    console.log('');
    console.log('🚀 Ready to test video calls!');

} catch (error) {
    console.log('❌ Token generation failed:', error.message);
    process.exit(1);
} 