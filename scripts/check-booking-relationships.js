const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkBookingRelationships() {
    try {
        console.log('🔍 Checking booking relationships and user data...\n');
        
        // First, let's see all users
        const users = await prisma.user.findMany({
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
        
        console.log('👥 All Users:');
        users.forEach(user => {
            console.log(`- ${user.name} (${user.email}) - Roles: ${user.roles.join(', ')}`);
            console.log(`  User ID: ${user.id}`);
            if (user.UserClientProfile) {
                console.log(`  Client ID: ${user.UserClientProfile.Client.id}`);
            }
            if (user.UserProviderProfile) {
                console.log(`  Provider ID: ${user.UserProviderProfile.ServiceProvider.id}`);
            }
            console.log('');
        });

        // Now check the booking
        const booking = await prisma.booking.findFirst({
            orderBy: { createdAt: 'desc' }
        });

        if (booking) {
            console.log('📋 Booking Details:');
            console.log(`- Booking ID: ${booking.id}`);
            console.log(`- Client ID: ${booking.clientId}`);
            console.log(`- Provider ID: ${booking.providerId}`);
            console.log(`- Title: ${booking.title}`);
            console.log(`- Status: ${booking.status}`);
            console.log(`- Paid: ${booking.isPaid}`);
            console.log('');

            // Find which user is the client for this booking
            const clientUser = users.find(user => 
                user.UserClientProfile?.Client.id === booking.clientId
            );

            const providerUser = users.find(user => 
                user.UserProviderProfile?.ServiceProvider.id === booking.providerId
            );

            console.log('🎯 Booking Ownership:');
            if (clientUser) {
                console.log(`✅ Client: ${clientUser.name} (${clientUser.email})`);
                console.log(`   This user should see the booking in client dashboard`);
            } else {
                console.log(`❌ Client ID ${booking.clientId} not found in users!`);
            }

            if (providerUser) {
                console.log(`✅ Provider: ${providerUser.name} (${providerUser.email})`);
                console.log(`   This user should see the booking in provider dashboard`);
            } else {
                console.log(`❌ Provider ID ${booking.providerId} not found in users!`);
            }

            // Check if we need to create the missing user relationships
            if (!clientUser || !providerUser) {
                console.log('\n⚠️  RELATIONSHIP ISSUE DETECTED!');
                console.log('The booking references client/provider IDs that don\'t match any users.');
                console.log('This is why the dashboard shows "No bookings yet".');
            }
        }

    } catch (error) {
        console.error('❌ Error checking relationships:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkBookingRelationships(); 