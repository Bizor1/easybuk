// Simulate client-side environment variable loading
const APP_ID = '18b6d08f950a48d9bc49814dda728562';

console.log('🌐 TESTING CLIENT-SIDE AGORA CONNECTION');
console.log('=======================================');

// Simulate what happens in the browser
console.log('Simulating browser environment...');
console.log('');

// Test 1: App ID availability (like in browser)
console.log('🔍 Test 1: Client-side App ID Check');
const clientAppId = APP_ID; // This simulates process.env.NEXT_PUBLIC_AGORA_APP_ID
console.log('App ID available:', clientAppId ? '✅ YES' : '❌ NO');
console.log('App ID value:', clientAppId ? `${clientAppId.substring(0, 8)}...` : 'UNDEFINED');
console.log('App ID length:', clientAppId ? clientAppId.length : 0);
console.log('');

// Test 2: Simulate Agora SDK initialization
console.log('🔍 Test 2: SDK Configuration Simulation');
const joinConfig = {
    appid: clientAppId || '',
    channel: 'easybuk-consultation-test123',
    token: null, // We'll test without token first
    uid: null
};

console.log('Join configuration that would be sent to Agora:');
console.log('- appid:', joinConfig.appid ? `${joinConfig.appid.substring(0, 8)}...` : 'EMPTY STRING');
console.log('- channel:', joinConfig.channel);
console.log('- token:', joinConfig.token || 'null');
console.log('- uid:', joinConfig.uid || 'null');
console.log('');

// Test 3: Configuration validation
console.log('🔍 Test 3: Configuration Validation');
const issues = [];

if (!joinConfig.appid) {
    issues.push('❌ App ID is empty or undefined');
} else if (joinConfig.appid.length !== 32) {
    issues.push('❌ App ID has wrong length (should be 32 characters)');
} else {
    console.log('✅ App ID format is correct');
}

if (!joinConfig.channel) {
    issues.push('❌ Channel name is empty');
} else {
    console.log('✅ Channel name is provided');
}

console.log('');

// Test 4: Diagnose the "invalid vendor key" error
console.log('🔍 Test 4: Error Analysis');
if (issues.length > 0) {
    console.log('🚨 ISSUES FOUND:');
    issues.forEach(issue => console.log(issue));
    console.log('');
    console.log('💡 DIAGNOSIS:');
    console.log('The "invalid vendor key, can not find appid" error occurs when:');
    console.log('1. The App ID is not provided to the Agora SDK');
    console.log('2. The App ID is empty or undefined');  
    console.log('3. The App ID has the wrong format');
    console.log('');
    console.log('🔧 SOLUTION:');
    console.log('Add NEXT_PUBLIC_AGORA_APP_ID to your environment variables:');
    console.log(`NEXT_PUBLIC_AGORA_APP_ID=${APP_ID}`);
} else {
    console.log('✅ Configuration appears correct!');
    console.log('');
    console.log('📋 SUMMARY:');
    console.log('✅ App ID: Valid format and length');
    console.log('✅ Channel: Provided');
    console.log('✅ Configuration: Should work with Agora SDK');
    console.log('');
    console.log('🎯 If you\'re still getting "invalid vendor key" error:');
    console.log('1. Verify NEXT_PUBLIC_AGORA_APP_ID is set in your .env file');
    console.log('2. Verify it\'s set in Vercel environment variables');
    console.log('3. Make sure you redeployed after adding the env var');
    console.log('4. Check browser console for the actual App ID value being used');
}

console.log('');
console.log('🧪 BROWSER DEBUGGING:');
console.log('Add this to your VideoCall component to debug:');
console.log('console.log("App ID in browser:", process.env.NEXT_PUBLIC_AGORA_APP_ID);');
console.log('');
console.log('Expected output: "App ID in browser: 18b6d08f950a48d9bc49814dda728562"');
console.log('If you see "undefined", the environment variable is not set correctly.'); 