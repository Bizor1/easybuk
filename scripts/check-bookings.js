const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkBookings() {
    try {
        console.log('📋 Checking all bookings in the database...\n');
        
        const bookings = await prisma.booking.findMany({
            include: {
                Client: {
                    include: {
                        UserClientProfile: {
                            include: {
                                User: true
                            }
                        }
                    }
                },
                ServiceProvider: {
                    include: {
                        UserProviderProfile: {
                            include: {
                                User: true
                            }
                        }
                    }
                },
                Service: true
            },
            orderBy: { createdAt: 'desc' }
        });

        console.log(`Found ${bookings.length} bookings:\n`);

        if (bookings.length === 0) {
            console.log('❌ No bookings found in the database');
            console.log('💡 You need to create a booking first to test payments');
            console.log('📝 Go to /explore and book a service from a provider');
            return;
        }

        bookings.forEach((booking, index) => {
            console.log(`${index + 1}. Booking ID: ${booking.id}`);
            console.log(`   Title: ${booking.title}`);
            console.log(`   Status: ${booking.status}`);
            console.log(`   Is Paid: ${booking.isPaid ? '✅ Yes' : '❌ No'}`);
            console.log(`   Amount: ${booking.currency} ${booking.totalAmount}`);
            console.log(`   Client: ${booking.Client?.UserClientProfile?.[0]?.User?.name || 'Unknown'} (${booking.Client?.UserClientProfile?.[0]?.User?.email || 'Unknown'})`);
            console.log(`   Provider: ${booking.ServiceProvider?.UserProviderProfile?.[0]?.User?.name || 'Unknown'} (${booking.ServiceProvider?.UserProviderProfile?.[0]?.User?.email || 'Unknown'})`);
            console.log(`   Scheduled: ${booking.scheduledDate.toLocaleDateString()} at ${booking.scheduledTime}`);
            console.log(`   Created: ${booking.createdAt.toLocaleString()}`);
            
            // Show payment eligibility
            if (booking.status === 'CONFIRMED' && !booking.isPaid) {
                console.log('   💳 READY FOR PAYMENT - Client can now pay!');
            } else if (booking.status === 'PENDING') {
                console.log('   ⏳ WAITING - Provider needs to accept this booking first');
            } else if (booking.isPaid) {
                console.log('   ✅ PAID - Payment completed');
            } else {
                console.log(`   ℹ️  Status: ${booking.status} - ${booking.isPaid ? 'Paid' : 'Unpaid'}`);
            }
            
            console.log('');
        });

        // Summary
        const pendingBookings = bookings.filter(b => b.status === 'PENDING');
        const confirmedUnpaidBookings = bookings.filter(b => b.status === 'CONFIRMED' && !b.isPaid);
        const paidBookings = bookings.filter(b => b.isPaid);

        console.log('📊 Summary:');
        console.log(`   📋 Total bookings: ${bookings.length}`);
        console.log(`   ⏳ Pending (waiting for provider): ${pendingBookings.length}`);
        console.log(`   💳 Ready for payment: ${confirmedUnpaidBookings.length}`);
        console.log(`   ✅ Completed payments: ${paidBookings.length}`);

        if (confirmedUnpaidBookings.length > 0) {
            console.log('\n🎯 Ready for payment testing:');
            confirmedUnpaidBookings.forEach(booking => {
                console.log(`   - ${booking.title} (${booking.id}) - ${booking.currency} ${booking.totalAmount}`);
            });
        }

    } catch (error) {
        console.error('❌ Error checking bookings:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkBookings(); 