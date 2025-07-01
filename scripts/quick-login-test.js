const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

async function createTestLoginToken() {
    console.log('🔐 Creating test login tokens...\n');

    try {
        const JWT_SECRET = process.env.JWT_SECRET;
        if (!JWT_SECRET) {
            console.log('❌ JWT_SECRET not found in environment variables');
            return;
        }

        // Find the booking participants
        const booking = await prisma.booking.findUnique({
            where: { id: 'booking_1751390884304_6tfbse4zj' },
            include: {
                Client: true,
                ServiceProvider: true
            }
        });

        if (!booking) {
            console.log('❌ Booking not found');
            return;
        }

        console.log('📋 Booking found:');
        console.log(`   Client: ${booking.Client.name} (${booking.Client.email})`);
        console.log(`   Provider: ${booking.ServiceProvider.name} (${booking.ServiceProvider.email})`);

        // Create tokens for both users
        console.log('\n🎫 Creating login tokens...\n');

        // Client token
        const clientToken = jwt.sign(
            {
                userId: booking.clientId,
                email: booking.Client.email,
                roles: booking.Client.roles
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Provider token
        const providerToken = jwt.sign(
            {
                userId: booking.providerId,
                email: booking.ServiceProvider.email,
                roles: booking.ServiceProvider.roles
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        console.log('✅ Tokens generated successfully!\n');

        console.log('🧪 Copy and paste this into your browser console to log in as CLIENT:');
        console.log('📋 (Augustine Amofa)');
        console.log('```javascript');
        console.log(`document.cookie = "auth=${clientToken}; path=/; max-age=86400";`);
        console.log('location.reload(); // Refresh the page');
        console.log('```\n');

        console.log('🧪 Or copy and paste this to log in as PROVIDER:');
        console.log('📋 (Ebenezer Bizor Nachinab)');
        console.log('```javascript');
        console.log(`document.cookie = "auth=${providerToken}; path=/; max-age=86400";`);
        console.log('location.reload(); // Refresh the page');
        console.log('```\n');

        console.log('💡 After running either command:');
        console.log('1. The page will refresh and you\'ll be logged in');
        console.log('2. Run runVideoCallTest() again');
        console.log('3. You should now get a successful Agora token! ✅');

    } catch (error) {
        console.error('❌ Error creating tokens:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Run the function
if (require.main === module) {
    createTestLoginToken().then(() => process.exit(0));
}

module.exports = { createTestLoginToken }; 