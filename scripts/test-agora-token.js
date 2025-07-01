const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

async function testAgoraTokenAPI() {
    console.log('🧪 Testing Agora Token API...\n');

    try {
        // Step 1: Find a booking with IN_PROGRESS status
        console.log('📋 Step 1: Finding IN_PROGRESS bookings...');
        const inProgressBookings = await prisma.booking.findMany({
            where: {
                status: 'IN_PROGRESS'
            },
            include: {
                Client: true,
                ServiceProvider: true
            },
            take: 5
        });

        console.log(`Found ${inProgressBookings.length} IN_PROGRESS bookings:`);
        inProgressBookings.forEach((booking, index) => {
            console.log(`  ${index + 1}. ID: ${booking.id}`);
            console.log(`     Client: ${booking.Client?.name} (${booking.clientId})`);
            console.log(`     Provider: ${booking.ServiceProvider?.name} (${booking.providerId})`);
            console.log(`     Type: ${booking.bookingType}`);
            console.log(`     Status: ${booking.status}`);
            console.log('');
        });

        if (inProgressBookings.length === 0) {
            console.log('❌ No IN_PROGRESS bookings found. Let\'s check all bookings...');
            
            const allBookings = await prisma.booking.findMany({
                include: {
                    Client: true,
                    ServiceProvider: true
                },
                take: 10,
                orderBy: {
                    createdAt: 'desc'
                }
            });

            console.log(`\n📋 Found ${allBookings.length} total bookings:`);
            allBookings.forEach((booking, index) => {
                console.log(`  ${index + 1}. ID: ${booking.id}`);
                console.log(`     Client: ${booking.Client?.name} (${booking.clientId})`);
                console.log(`     Provider: ${booking.ServiceProvider?.name} (${booking.providerId})`);
                console.log(`     Type: ${booking.bookingType}`);
                console.log(`     Status: ${booking.status}`);
                console.log('');
            });
            return;
        }

        // Step 2: Test with the first booking
        const testBooking = inProgressBookings[0];
        console.log(`🎯 Step 2: Testing with booking ${testBooking.id}`);
        console.log(`   Client ID: ${testBooking.clientId}`);
        console.log(`   Provider ID: ${testBooking.providerId}`);

        // Step 3: Find the actual users that correspond to the booking profiles
        console.log('\n👤 Step 3: Finding users...');
        
        // Find the user who has the client profile
        const clientUserProfile = await prisma.userClientProfile.findUnique({
            where: { clientId: testBooking.clientId },
            include: { 
                User: true,
                Client: true
            }
        });
        
        // Find the user who has the provider profile  
        const providerUserProfile = await prisma.userProviderProfile.findUnique({
            where: { providerId: testBooking.providerId },
            include: { 
                User: true,
                ServiceProvider: true
            }
        });

        const clientUser = clientUserProfile?.User;
        const providerUser = providerUserProfile?.User;

        console.log(`Client: ${clientUser?.name} (User ID: ${clientUser?.id}, Client ID: ${testBooking.clientId})`);
        console.log(`Provider: ${providerUser?.name} (User ID: ${providerUser?.id}, Provider ID: ${testBooking.providerId})`);

        if (!clientUser || !providerUser) {
            console.log('❌ Could not find users for booking profiles');
            return;
        }

        // Step 4: Test token generation for both users
        console.log('\n🔐 Step 4: Testing JWT token generation...');
        
        const JWT_SECRET = process.env.JWT_SECRET;
        if (!JWT_SECRET) {
            console.log('❌ JWT_SECRET not found in environment variables');
            return;
        }

        // Test for client
        console.log('\n🧪 Testing as CLIENT:');
        const clientToken = jwt.sign(
            { 
                userId: clientUser.id,
                email: clientUser.email,
                roles: ['CLIENT']
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        console.log(`Generated token for client: ${clientToken.substring(0, 50)}...`);

        // Test API call simulation for client
        console.log('\n📡 Simulating API call for client...');
        await testAgoraAPICall(testBooking.id, clientUser.id, 'CLIENT');

        // Test for provider
        console.log('\n🧪 Testing as PROVIDER:');
        const providerToken = jwt.sign(
            { 
                userId: providerUser.id,
                email: providerUser.email,
                roles: ['PROVIDER']
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        console.log(`Generated token for provider: ${providerToken.substring(0, 50)}...`);

        // Test API call simulation for provider
        console.log('\n📡 Simulating API call for provider...');
        await testAgoraAPICall(testBooking.id, providerUser.id, 'PROVIDER');

        // Step 5: Test with wrong user
        console.log('\n🚫 Step 5: Testing with unauthorized user...');
        const randomUser = await prisma.user.findFirst({
            where: {
                NOT: {
                    id: {
                        in: [clientUser.id, providerUser.id]
                    }
                }
            }
        });

        if (randomUser) {
            console.log(`Testing with unauthorized user: ${randomUser.name} (${randomUser.id})`);
            await testAgoraAPICall(testBooking.id, randomUser.id, 'UNAUTHORIZED');
        }

    } catch (error) {
        console.error('❌ Error in test:', error);
    } finally {
        await prisma.$disconnect();
    }
}

async function testAgoraAPICall(bookingId, userId, userType) {
    try {
        console.log(`\n🔍 Testing booking access for ${userType} user: ${userId}`);

        // First, resolve the user's client and provider profile IDs (same as API)
        console.log('🔗 Resolving user profile relationships...');
        const userProfiles = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                UserClientProfile: {
                    include: { Client: true }
                },
                UserProviderProfile: {
                    include: { ServiceProvider: true }
                }
            }
        });

        if (!userProfiles) {
            console.log('❌ User not found:', userId);
            return;
        }

        const userClientId = userProfiles.UserClientProfile?.clientId;
        const userProviderId = userProfiles.UserProviderProfile?.providerId;

        console.log('👤 User profile resolution:', {
            userId: userId,
            clientId: userClientId || 'None',
            providerId: userProviderId || 'None'
        });

        // First, let's find the booking without user restrictions to see what's there
        const bookingInfo = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                Client: true,
                ServiceProvider: true
            }
        });

        console.log('📋 Booking found:', bookingInfo ? {
            id: bookingInfo.id,
            status: bookingInfo.status,
            clientId: bookingInfo.clientId,
            providerId: bookingInfo.providerId,
            clientName: bookingInfo.Client?.name,
            providerName: bookingInfo.ServiceProvider?.name
        } : 'NOT FOUND');

        // Build access conditions using resolved profile IDs (same as API)
        const accessConditions = [];
        if (userClientId) {
            accessConditions.push({ clientId: userClientId });
        }
        if (userProviderId) {
            accessConditions.push({ providerId: userProviderId });
        }

        if (accessConditions.length === 0) {
            console.log('❌ User has no client or provider profiles');
            return;
        }

        // Validate that user is part of this booking using resolved profile IDs (same as API)
        const booking = await prisma.booking.findFirst({
            where: {
                id: bookingId,
                OR: accessConditions,
                status: {
                    in: ['CONFIRMED', 'IN_PROGRESS']
                }
            },
            include: {
                Client: true,
                ServiceProvider: true
            }
        });

        if (!booking) {
            console.log('❌ Access denied. Checking criteria:');
            if (bookingInfo) {
                console.log('  - User clientId matches booking clientId?', userClientId && bookingInfo.clientId === userClientId);
                console.log('  - User providerId matches booking providerId?', userProviderId && bookingInfo.providerId === userProviderId);
                console.log('  - Status valid?', ['CONFIRMED', 'IN_PROGRESS'].includes(bookingInfo.status));
                console.log('  - User has client profile?', !!userClientId);
                console.log('  - User has provider profile?', !!userProviderId);
            } else {
                console.log('  - Booking exists?', false);
            }
            return;
        }

        console.log('✅ Access granted! User can get Agora token for this booking');
        console.log('   Booking participants:');
        console.log(`   - Client: ${booking.Client.name}`);
        console.log(`   - Provider: ${booking.ServiceProvider.name}`);

        // Check environment variables
        const appId = process.env.AGORA_KEY;
        const appCertificate = process.env.AGORA_SECRET;

        if (!appId || !appCertificate) {
            console.log('❌ Missing Agora credentials in environment variables');
            console.log('   AGORA_KEY:', appId ? '✅ Set' : '❌ Missing');
            console.log('   AGORA_SECRET:', appCertificate ? '✅ Set' : '❌ Missing');
            return;
        }

        console.log('✅ Agora credentials found');
        console.log('   AGORA_KEY:', appId ? `${appId.substring(0, 8)}...` : 'Missing');
        console.log('   AGORA_SECRET:', appCertificate ? `${appCertificate.substring(0, 8)}...` : 'Missing');

    } catch (error) {
        console.error('❌ Error testing API call:', error);
    }
}

// Helper function to create a test booking if needed
async function createTestBooking() {
    try {
        console.log('🏗️ Creating test booking...');

        // Find a client and provider
        const client = await prisma.user.findFirst({
            where: {
                roles: {
                    has: 'CLIENT'
                }
            }
        });

        const provider = await prisma.user.findFirst({
            where: {
                roles: {
                    has: 'PROVIDER'
                }
            }
        });

        if (!client || !provider) {
            console.log('❌ Cannot create test booking: missing client or provider');
            return;
        }

        const testBooking = await prisma.booking.create({
            data: {
                clientId: client.id,
                providerId: provider.id,
                serviceId: 'test-service',
                bookingType: 'VIDEO_CALL',
                status: 'IN_PROGRESS',
                scheduledDate: new Date(),
                scheduledTime: new Date().toTimeString().split(' ')[0],
                duration: 60,
                amount: 100.00,
                currency: 'USD',
                escrowStatus: 'HELD'
            }
        });

        console.log('✅ Test booking created:', testBooking.id);
        return testBooking;

    } catch (error) {
        console.error('❌ Error creating test booking:', error);
    }
}

// Main execution
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args[0] === '--create-test-booking') {
        createTestBooking().then(() => process.exit(0));
    } else {
        testAgoraTokenAPI().then(() => process.exit(0));
    }
}

module.exports = { testAgoraTokenAPI, createTestBooking }; 