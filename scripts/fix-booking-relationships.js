const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixBookingRelationships() {
    try {
        console.log('🔧 Checking and fixing booking relationships...\n');
        
        // Get the booking
        const booking = await prisma.booking.findFirst({
            orderBy: { createdAt: 'desc' }
        });

        if (!booking) {
            console.log('❌ No bookings found');
            return;
        }

        console.log('📋 Current Booking:');
        console.log(`- Booking ID: ${booking.id}`);
        console.log(`- Client ID in booking: ${booking.clientId}`);
        console.log(`- Provider ID in booking: ${booking.providerId}`);
        console.log(`- Title: ${booking.title}`);
        console.log(`- Status: ${booking.status}`);
        console.log('');

        // Get the actual client and provider IDs from users
        const clientUser = await prisma.user.findUnique({
            where: { email: 'ebenezernachinabapplications@gmail.com' },
            include: {
                UserClientProfile: {
                    include: { Client: true }
                }
            }
        });

        const providerUser = await prisma.user.findUnique({
            where: { email: 'bizorebenezer@gmail.com' },
            include: {
                UserProviderProfile: {
                    include: { ServiceProvider: true }
                }
            }
        });

        console.log('👥 Actual User Data:');
        if (clientUser) {
            console.log(`✅ Client User: ${clientUser.name} (${clientUser.email})`);
            console.log(`   User ID: ${clientUser.id}`);
            console.log(`   Client Profile ID: ${clientUser.UserClientProfile?.Client?.id || 'MISSING!'}`);
        }

        if (providerUser) {
            console.log(`✅ Provider User: ${providerUser.name} (${providerUser.email})`);
            console.log(`   User ID: ${providerUser.id}`);
            console.log(`   Provider Profile ID: ${providerUser.UserProviderProfile?.ServiceProvider?.id || 'MISSING!'}`);
        }

        console.log('');

        // Check if IDs match
        const correctClientId = clientUser?.UserClientProfile?.Client?.id;
        const correctProviderId = providerUser?.UserProviderProfile?.ServiceProvider?.id;

        let needsUpdate = false;
        let updateData = {};

        if (booking.clientId !== correctClientId) {
            console.log(`❌ Client ID mismatch!`);
            console.log(`   Booking has: ${booking.clientId}`);
            console.log(`   Should be: ${correctClientId}`);
            updateData.clientId = correctClientId;
            needsUpdate = true;
        } else {
            console.log(`✅ Client ID matches: ${booking.clientId}`);
        }

        if (booking.providerId !== correctProviderId) {
            console.log(`❌ Provider ID mismatch!`);
            console.log(`   Booking has: ${booking.providerId}`);
            console.log(`   Should be: ${correctProviderId}`);
            updateData.providerId = correctProviderId;
            needsUpdate = true;
        } else {
            console.log(`✅ Provider ID matches: ${booking.providerId}`);
        }

        if (needsUpdate) {
            console.log('\n🔧 Fixing booking relationships...');
            
            const updatedBooking = await prisma.booking.update({
                where: { id: booking.id },
                data: updateData
            });

            console.log('✅ Booking updated successfully!');
            console.log(`   New Client ID: ${updatedBooking.clientId}`);
            console.log(`   New Provider ID: ${updatedBooking.providerId}`);
            
            console.log('\n🎯 Now the client should see the booking in their dashboard!');
            console.log(`   Login as: ${clientUser.email}`);
            console.log(`   Go to: /client/dashboard`);
        } else {
            console.log('\n✅ Booking relationships are correct!');
            console.log('The issue might be with authentication or API filtering.');
        }

    } catch (error) {
        console.error('❌ Error fixing relationships:', error);
    } finally {
        await prisma.$disconnect();
    }
}

fixBookingRelationships(); 