const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkOrphanedRecords() {
  console.log('🔍 Checking for orphaned records...');
  
  try {
    // Check for Client records with bizorebenezer@gmail.com
    console.log('1️⃣ Checking for Client records with bizorebenezer@gmail.com...');
    const clientRecords = await prisma.client.findMany({
      where: { email: 'bizorebenezer@gmail.com' },
      include: {
        UserClientProfile: {
          include: {
            User: true
          }
        },
        ClientWallet: true
      }
    });

    console.log('📊 Found Client records:', clientRecords.length);
    
    if (clientRecords.length > 0) {
      clientRecords.forEach((client, index) => {
        console.log(`\n📝 Client Record ${index + 1}:`);
        console.log('   - Client ID:', client.id);
        console.log('   - Email:', client.email);
        console.log('   - Name:', client.name);
        console.log('   - Status:', client.status);
        console.log('   - Created:', client.createdAt);
        console.log('   - Has UserClientProfile:', !!client.UserClientProfile);
        console.log('   - Has User linked:', !!client.UserClientProfile?.User);
        console.log('   - Has Wallet:', !!client.ClientWallet);
        
        if (!client.UserClientProfile?.User) {
          console.log('   ⚠️ ORPHANED: Client exists but no User linked!');
        }
      });
    }

    // Check for ServiceProvider records with the same email
    console.log('\n2️⃣ Checking for ServiceProvider records with bizorebenezer@gmail.com...');
    const providerRecords = await prisma.serviceProvider.findMany({
      where: { email: 'bizorebenezer@gmail.com' },
      include: {
        UserProviderProfile: {
          include: {
            User: true
          }
        },
        ProviderWallet: true
      }
    });

    console.log('📊 Found ServiceProvider records:', providerRecords.length);
    
    if (providerRecords.length > 0) {
      providerRecords.forEach((provider, index) => {
        console.log(`\n📝 Provider Record ${index + 1}:`);
        console.log('   - Provider ID:', provider.id);
        console.log('   - Email:', provider.email);
        console.log('   - Name:', provider.name);
        console.log('   - Status:', provider.status);
        console.log('   - Created:', provider.createdAt);
        console.log('   - Has UserProviderProfile:', !!provider.UserProviderProfile);
        console.log('   - Has User linked:', !!provider.UserProviderProfile?.User);
        console.log('   - Has Wallet:', !!provider.ProviderWallet);
        
        if (!provider.UserProviderProfile?.User) {
          console.log('   ⚠️ ORPHANED: Provider exists but no User linked!');
        }
      });
    }

    // Summary and recommendations
    console.log('\n📋 Summary:');
    const totalOrphaned = clientRecords.length + providerRecords.length;
    
    if (totalOrphaned > 0) {
      console.log('❌ Found orphaned records that need cleanup');
      console.log('💡 These records are preventing signup with this email');
      console.log('🛠️ Solution: Clean up orphaned records and try signup again');
    } else {
      console.log('✅ No orphaned records found');
      console.log('💡 The issue might be elsewhere');
    }

  } catch (error) {
    console.error('❌ Error checking orphaned records:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkOrphanedRecords(); 