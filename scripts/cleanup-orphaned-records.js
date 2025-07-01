const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupOrphanedRecords() {
  console.log('🧹 Starting cleanup of orphaned records for bizorebenezer@gmail.com...');
  
  try {
    // First, let's identify what we're about to delete
    console.log('🔍 Step 1: Identifying orphaned records to delete...');
    
    const clientRecords = await prisma.client.findMany({
      where: { email: 'bizorebenezer@gmail.com' },
      include: {
        UserClientProfile: true,
        ClientWallet: true
      }
    });

    const providerRecords = await prisma.serviceProvider.findMany({
      where: { email: 'bizorebenezer@gmail.com' },
      include: {
        UserProviderProfile: true,
        ProviderWallet: true
      }
    });

    console.log(`📊 Found ${clientRecords.length} Client record(s) to clean up`);
    console.log(`📊 Found ${providerRecords.length} ServiceProvider record(s) to clean up`);

    // Clean up Client records and their wallets
    if (clientRecords.length > 0) {
      console.log('\n🧹 Step 2: Cleaning up Client records...');
      
      for (const client of clientRecords) {
        console.log(`🗑️ Cleaning up Client ID: ${client.id}`);
        
        // Delete client wallet if exists
        if (client.ClientWallet) {
          console.log(`   💰 Deleting ClientWallet ID: ${client.ClientWallet.id}`);
          await prisma.clientWallet.delete({
            where: { id: client.ClientWallet.id }
          });
          console.log('   ✅ ClientWallet deleted');
        }
        
        // Delete UserClientProfile if exists (though it shouldn't based on our check)
        if (client.UserClientProfile) {
          console.log(`   🔗 Deleting UserClientProfile ID: ${client.UserClientProfile.id}`);
          await prisma.userClientProfile.delete({
            where: { id: client.UserClientProfile.id }
          });
          console.log('   ✅ UserClientProfile deleted');
        }
        
        // Delete the client record
        console.log(`   🏠 Deleting Client record ID: ${client.id}`);
        await prisma.client.delete({
          where: { id: client.id }
        });
        console.log('   ✅ Client record deleted');
      }
    }

    // Clean up ServiceProvider records and their wallets
    if (providerRecords.length > 0) {
      console.log('\n🧹 Step 3: Cleaning up ServiceProvider records...');
      
      for (const provider of providerRecords) {
        console.log(`🗑️ Cleaning up ServiceProvider ID: ${provider.id}`);
        
        // Delete provider wallet if exists
        if (provider.ProviderWallet) {
          console.log(`   💰 Deleting ProviderWallet ID: ${provider.ProviderWallet.id}`);
          await prisma.providerWallet.delete({
            where: { id: provider.ProviderWallet.id }
          });
          console.log('   ✅ ProviderWallet deleted');
        }
        
        // Delete UserProviderProfile if exists (though it shouldn't based on our check)
        if (provider.UserProviderProfile) {
          console.log(`   🔗 Deleting UserProviderProfile ID: ${provider.UserProviderProfile.id}`);
          await prisma.userProviderProfile.delete({
            where: { id: provider.UserProviderProfile.id }
          });
          console.log('   ✅ UserProviderProfile deleted');
        }
        
        // Delete the provider record
        console.log(`   🏢 Deleting ServiceProvider record ID: ${provider.id}`);
        await prisma.serviceProvider.delete({
          where: { id: provider.id }
        });
        console.log('   ✅ ServiceProvider record deleted');
      }
    }

    console.log('\n🎉 Cleanup completed successfully!');
    console.log('💡 You can now try signing up with bizorebenezer@gmail.com');
    
    // Verify cleanup
    console.log('\n✅ Step 4: Verifying cleanup...');
    const remainingClients = await prisma.client.count({
      where: { email: 'bizorebenezer@gmail.com' }
    });
    const remainingProviders = await prisma.serviceProvider.count({
      where: { email: 'bizorebenezer@gmail.com' }
    });

    console.log(`📊 Remaining Client records: ${remainingClients}`);
    console.log(`📊 Remaining ServiceProvider records: ${remainingProviders}`);

    if (remainingClients === 0 && remainingProviders === 0) {
      console.log('✅ Perfect! All orphaned records cleaned up successfully');
      console.log('🚀 Ready for fresh signup attempt!');
    } else {
      console.log('⚠️ Some records may still remain - check manually');
    }

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    console.error('📊 Error details:', {
      name: error.name,
      message: error.message,
      code: error.code
    });
  } finally {
    await prisma.$disconnect();
  }
}

cleanupOrphanedRecords(); 