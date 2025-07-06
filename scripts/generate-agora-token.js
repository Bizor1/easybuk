// Script to generate temporary Agora token for testing
const { RtcTokenBuilder, RtcRole } = require('agora-access-token');

// Configuration
const appId = 'a07e1e5da6fc477f8b55e74192d31dd6';
const appCertificate = 'YOUR_APP_CERTIFICATE_HERE'; // Get this from Agora Console
const channelName = 'test-channel';
const uid = 0; // 0 means any user can join with this token
const role = RtcRole.PUBLISHER; // PUBLISHER can send and receive, SUBSCRIBER can only receive

// Token expires in 24 hours
const expirationTimeInSeconds = 3600 * 24;
const currentTimestamp = Math.floor(Date.now() / 1000);
const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

console.log('=== Agora Token Generator ===\n');

if (appCertificate === 'YOUR_APP_CERTIFICATE_HERE') {
  console.log('❌ You need to set your App Certificate first!');
  console.log('\nTo get your App Certificate:');
  console.log('1. Go to https://console.agora.io');
  console.log('2. Select your project');
  console.log('3. Go to "Config" tab');
  console.log('4. Enable "App Certificate" if not already enabled');
  console.log('5. Copy the certificate and replace "YOUR_APP_CERTIFICATE_HERE" in this script');
  console.log('\nAlternatively, for testing purposes, you can:');
  console.log('1. Go to https://console.agora.io');
  console.log('2. Select your project');
  console.log('3. Go to "Temp Token" tab');
  console.log('4. Generate a temporary token for channel "test-channel"');
  process.exit(1);
}

try {
  // Build token
  const token = RtcTokenBuilder.buildTokenWithUid(
    appId,
    appCertificate,
    channelName,
    uid,
    role,
    privilegeExpiredTs
  );

  console.log('✅ Token generated successfully!');
  console.log('\nToken:', token);
  console.log('\nAdd this to your .env.local file:');
  console.log(`NEXT_PUBLIC_AGORA_TOKEN=${token}`);
  console.log('\nToken details:');
  console.log('- App ID:', appId);
  console.log('- Channel:', channelName);
  console.log('- UID:', uid === 0 ? 'Any user' : uid);
  console.log('- Role:', role === RtcRole.PUBLISHER ? 'Publisher' : 'Subscriber');
  console.log('- Expires:', new Date(privilegeExpiredTs * 1000).toLocaleString());
  
} catch (error) {
  console.error('❌ Error generating token:', error.message);
  console.log('\nMake sure you have the correct App Certificate');
} 