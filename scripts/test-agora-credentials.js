const { RtcTokenBuilder, RtcRole } = require('agora-access-token');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env file
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

console.log('🧪 TESTING AGORA CREDENTIALS');
console.log('============================');

// Test environment variables
const appId = process.env.AGORA_KEY;
const appSecret = process.env.AGORA_SECRET;
const appCustomerId = process.env.AGORA_CUSTOMER_ID;

console.log('Environment Variables:');
console.log('AGORA_KEY (App ID):', appId ? `${appId.substring(0, 8)}...` : 'MISSING');
console.log('AGORA_SECRET:', appSecret ? `${appSecret.substring(0, 8)}...` : 'MISSING');
console.log('AGORA_CUSTOMER_ID:', appCustomerId ? `${appCustomerId.substring(0, 8)}...` : 'MISSING');
console.log('');

// Verify App ID and Customer ID match
if (appId && appCustomerId) {
    console.log('App ID and Customer ID match:', appId === appCustomerId ? '✅ YES' : '❌ NO');
    if (appId !== appCustomerId) {
        console.log('⚠️  WARNING: App ID and Customer ID should be the same value');
    }
} else {
    console.log('❌ Cannot verify App ID/Customer ID match - missing values');
}

console.log('');

// Test token generation
if (appId && appSecret) {
    try {
        console.log('🎫 Testing token generation...');
        
        const channelName = 'test-channel-' + Date.now();
        const uid = 12345;
        const role = RtcRole.PUBLISHER;
        const expirationTimeInSeconds = 3600;
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

        const token = RtcTokenBuilder.buildTokenWithUid(
            appId,
            appSecret,
            channelName,
            uid,
            role,
            privilegeExpiredTs
        );

        console.log('✅ Token generated successfully!');
        console.log('Channel Name:', channelName);
        console.log('UID:', uid);
        console.log('Token length:', token.length);
        console.log('Token preview:', token.substring(0, 50) + '...');
        console.log('Expires at:', new Date(privilegeExpiredTs * 1000).toISOString());

        // Validate token format
        if (token.length > 100 && token.startsWith('007')) {
            console.log('✅ Token format appears valid');
        } else {
            console.log('⚠️  Token format may be invalid');
        }

    } catch (error) {
        console.log('❌ Token generation failed:');
        console.log('Error:', error.message);
        console.log('');
        console.log('Common issues:');
        console.log('1. Check if AGORA_KEY is exactly 32 characters');
        console.log('2. Check if AGORA_SECRET is exactly 32 characters');
        console.log('3. Verify credentials are from the same Agora project');
    }
} else {
    console.log('❌ Cannot test token generation - missing App ID or Secret');
}

console.log('');
console.log('🌐 NEXT_PUBLIC Environment Variables (for client-side):');
console.log('Note: These should be added to both .env and Vercel for client-side access');

// Check if NEXT_PUBLIC version exists
const nextPublicAppId = process.env.NEXT_PUBLIC_AGORA_APP_ID;
console.log('NEXT_PUBLIC_AGORA_APP_ID:', nextPublicAppId ? `${nextPublicAppId.substring(0, 8)}...` : 'MISSING');

if (nextPublicAppId) {
    console.log('NEXT_PUBLIC App ID matches server App ID:', nextPublicAppId === appId ? '✅ YES' : '❌ NO');
} else {
    console.log('⚠️  NEXT_PUBLIC_AGORA_APP_ID is missing - add this to your environment:');
    console.log(`NEXT_PUBLIC_AGORA_APP_ID=${appId}`);
}

console.log('');
console.log('📋 Summary:');
console.log('Server-side credentials (for token generation):', appId && appSecret ? '✅ OK' : '❌ MISSING');
console.log('Client-side App ID (for SDK initialization):', nextPublicAppId ? '✅ OK' : '❌ MISSING');
console.log('Credentials consistency:', (appId === nextPublicAppId && appId && nextPublicAppId) ? '✅ OK' : '❌ MISMATCH');

if (!nextPublicAppId || nextPublicAppId !== appId) {
    console.log('');
    console.log('🔧 ACTION REQUIRED:');
    console.log('Add this to your .env file:');
    console.log(`NEXT_PUBLIC_AGORA_APP_ID=${appId}`);
    console.log('');
    console.log('And add the same to Vercel environment variables, then redeploy.');
} 