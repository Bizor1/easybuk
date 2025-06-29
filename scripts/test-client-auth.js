const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testClientAuth() {
    try {
        console.log('🧪 Testing client authentication and booking access...\n');
        
        // Simulate what the API does when a CLIENT user requests bookings
        const clientEmail = 'ebenezernachinabapplications@gmail.com';
        
        // Step 1: Find the user (simulating JWT token validation)
        const user = await prisma.user.findUnique({
            where: { email: clientEmail },
            include: {
                UserClientProfile: {
                    include: { Client: true }
                }
            }
        });

        if (!user) {
            console.log('❌ User not found');
            return;
        }

        console.log('👤 User Authentication:');
        console.log(`- User: ${user.name} (${user.email})`);
        console.log(`- User ID: ${user.id}`);
        console.log(`- Roles: ${user.roles.join(', ')}`);
        console.log(`- Has CLIENT role: ${user.roles.includes('CLIENT') ? '✅' : '❌'}`);
        
        if (user.UserClientProfile) {
            console.log(`- Client Profile ID: ${user.UserClientProfile.Client.id}`);
        } else {
            console.log('❌ No client profile found!');
            return;
        }

        // Step 2: Simulate the API's WHERE clause for CLIENT users
        const clientId = user.UserClientProfile.Client.id;
        console.log(`\n🔍 Searching for bookings where clientId = "${clientId}"`);

        // This is what the API does:
        const where = {
            clientId: clientId  // This should match our booking's clientId
        };

        // Step 3: Search for bookings
        const bookings = await prisma.booking.findMany({
            where,
            include: {
                Client: {
                    include: {
                        UserClientProfile: {
                            include: {
                                User: {
                                    select: {
                                        id: true,
                                        name: true,
                                        email: true,
                                        image: true,
                                        phone: true
                                    }
                                }
                            }
                        }
                    }
                },
                ServiceProvider: {
                    include: {
                        UserProviderProfile: {
                            include: {
                                User: {
                                    select: {
                                        id: true,
                                        name: true,
                                        email: true,
                                        image: true,
                                        phone: true
                                    }
                                }
                            }
                        }
                    }
                },
                Service: {
                    select: {
                        id: true,
                        name: true,
                        category: true,
                        basePrice: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        console.log(`\n📋 Found ${bookings.length} booking(s):`);
        
        if (bookings.length === 0) {
            console.log('❌ No bookings found for this client!');
            
            // Let's check what's in the database
            const allBookings = await prisma.booking.findMany({
                select: {
                    id: true,
                    clientId: true,
                    title: true,
                    status: true,
                    isPaid: true
                }
            });
            
            console.log('\n🔍 All bookings in database:');
            allBookings.forEach(booking => {
                console.log(`- ${booking.id}: clientId=${booking.clientId}, title=${booking.title}`);
                console.log(`  Match: ${booking.clientId === clientId ? '✅' : '❌'}`);
            });
        } else {
            bookings.forEach((booking, index) => {
                console.log(`\n${index + 1}. Booking: ${booking.title}`);
                console.log(`   ID: ${booking.id}`);
                console.log(`   Status: ${booking.status}`);
                console.log(`   Paid: ${booking.isPaid ? '✅' : '❌'}`);
                console.log(`   Amount: ${booking.currency} ${booking.totalAmount}`);
                console.log(`   Client ID: ${booking.clientId}`);
                console.log(`   Provider: ${booking.ServiceProvider?.UserProviderProfile?.User?.name || 'Unknown'}`);
                
                // Check if this should show payment button
                if (booking.status === 'CONFIRMED' && !booking.isPaid) {
                    console.log('   💳 SHOULD SHOW PAYMENT BUTTON!');
                } else {
                    console.log(`   ℹ️  Payment button: No (status=${booking.status}, paid=${booking.isPaid})`);
                }
            });
        }

    } catch (error) {
        console.error('❌ Error testing client auth:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testClientAuth(); 