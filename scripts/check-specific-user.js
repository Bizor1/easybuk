const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkSpecificUser() {
  console.log('🔍 Checking for specific user: bizorebenezer@gmail.com');
  
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'bizorebenezer@gmail.com' },
      include: {
        UserClientProfile: {
          include: {
            Client: {
              include: {
                ClientWallet: true,
              },
            },
          },
        },
        UserProviderProfile: {
          include: {
            ServiceProvider: {
              include: {
                ProviderWallet: true,
              },
            },
          },
        },
      },
    });

    if (user) {
      console.log('✅ User found in database:');
      console.log('👤 User ID:', user.id);
      console.log('📧 Email:', user.email);
      console.log('👤 Name:', user.name);
      console.log('📞 Phone:', user.phone);
      console.log('🏷️ Roles:', user.roles);
      console.log('✅ Email Verified:', user.emailVerified);
      console.log('📱 Phone Verified:', user.phoneVerified);
      console.log('📊 Status:', user.status);
      console.log('🕒 Created:', user.createdAt);
      console.log('🕒 Last Active:', user.lastActive);
      
      if (user.UserClientProfile) {
        console.log('🏠 Client Profile Found:');
        console.log('   - Client ID:', user.UserClientProfile.Client.id);
        console.log('   - Profile Completed:', user.UserClientProfile.Client.profileCompleted);
        console.log('   - Client Status:', user.UserClientProfile.Client.status);
        if (user.UserClientProfile.Client.ClientWallet) {
          console.log('   - Wallet Balance:', user.UserClientProfile.Client.ClientWallet.balance);
        }
      }
      
      if (user.UserProviderProfile) {
        console.log('🏢 Provider Profile Found:');
        console.log('   - Provider ID:', user.UserProviderProfile.ServiceProvider.id);
        console.log('   - Profile Completed:', user.UserProviderProfile.ServiceProvider.profileCompleted);
        console.log('   - Verification Status:', user.UserProviderProfile.ServiceProvider.verificationStatus);
        if (user.UserProviderProfile.ServiceProvider.ProviderWallet) {
          console.log('   - Wallet Balance:', user.UserProviderProfile.ServiceProvider.ProviderWallet.balance);
        }
      }
      
      console.log('\n❌ This explains the 400 error: User already exists!');
      console.log('💡 The user should try logging in instead of signing up.');
      
    } else {
      console.log('❌ User not found in database');
      console.log('💡 The user should be able to sign up with this email.');
    }

  } catch (error) {
    console.error('❌ Error checking user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSpecificUser(); 