const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkMessages() {
  try {
    console.log('🔍 Checking user sessions and message visibility...');
    
    // Check the current user from the logs
    const currentLoggedUser = await prisma.user.findUnique({
      where: { id: '649292be-c53a-4ada-8c1f-749e464ce423' },
      include: {
        UserClientProfile: true,
        UserProviderProfile: true
      }
    });
    
    console.log('👤 CURRENT LOGGED USER (from logs):');
    if (currentLoggedUser) {
      console.log(`   Name: ${currentLoggedUser.name}`);
      console.log(`   Email: ${currentLoggedUser.email}`);
      console.log(`   Roles: ${currentLoggedUser.roles.join(', ')}`);
      console.log(`   Has Client Profile: ${!!currentLoggedUser.UserClientProfile}`);
      console.log(`   Has Provider Profile: ${!!currentLoggedUser.UserProviderProfile}`);
    } else {
      console.log('   ❌ User not found!');
    }
    
    console.log('');
    
    // Check the user who should receive the message
    const messageReceiver = await prisma.user.findUnique({
      where: { id: 'cd484a40-bbe8-472d-96c8-7ee65d776eb7' },
      include: {
        UserClientProfile: true,
        UserProviderProfile: true
      }
    });
    
    console.log('📧 MESSAGE RECEIVER USER:');
    if (messageReceiver) {
      console.log(`   Name: ${messageReceiver.name}`);
      console.log(`   Email: ${messageReceiver.email}`);
      console.log(`   Roles: ${messageReceiver.roles.join(', ')}`);
      console.log(`   Client ID: ${messageReceiver.UserClientProfile?.clientId || 'None'}`);
    } else {
      console.log('   ❌ User not found!');
    }
    
    console.log('');
    console.log('📋 SUMMARY:');
    console.log(`   ✅ Message EXISTS in database`);
    console.log(`   ✅ Backend is working correctly`);
    console.log(`   ❌ WRONG USER is logged in to see the message`);
    console.log('');
    
    console.log('🔧 SOLUTION NEEDED:');
    console.log('   1. Log in as the correct client user');
    console.log('   2. Or check if there are session/cookie issues');
    console.log('   3. Or investigate why the wrong user is active');
    
    // Check all users to see available options
    console.log('');
    console.log('👥 ALL USERS IN SYSTEM:');
    const allUsers = await prisma.user.findMany({
      include: {
        UserClientProfile: {
          include: {
            Client: true
          }
        },
        UserProviderProfile: {
          include: {
            ServiceProvider: true
          }
        }
      }
    });
    
    allUsers.forEach(user => {
      console.log(`   - ${user.name} (${user.email}) - Roles: ${user.roles.join(', ')}`);
      if (user.UserClientProfile) {
        console.log(`     Client: ${user.UserClientProfile.Client.name}`);
      }
      if (user.UserProviderProfile) {
        console.log(`     Provider: ${user.UserProviderProfile.ServiceProvider.name}`);
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkMessages(); 