const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function autoConfirmBookings() {
    console.log('🔄 Starting auto-confirmation process...');
    
    try {
        const now = new Date();
        
        // Find bookings awaiting client confirmation that are past deadline
        const overdueBookings = await prisma.booking.findMany({
            where: {
                status: 'AWAITING_CLIENT_CONFIRMATION',
                clientConfirmDeadline: {
                    lte: now
                },
                Dispute: {
                    is: null
                }
            },
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
                }
            }
        });

        console.log(`📋 Found ${overdueBookings.length} bookings requiring auto-confirmation`);

        let confirmedCount = 0;

        for (const booking of overdueBookings) {
            try {
                await prisma.$transaction(async (tx) => {
                    // Auto-confirm the booking
                    await tx.booking.update({
                        where: { id: booking.id },
                        data: {
                            status: 'COMPLETED',
                            clientConfirmedAt: new Date(),
                            updatedAt: new Date()
                        }
                    });

                    // Send notifications to both parties
                    const clientUserId = booking.Client?.UserClientProfile?.userId;
                    const providerUserId = booking.ServiceProvider?.UserProviderProfile?.userId;

                    const notificationPromises = [];

                    if (clientUserId) {
                        notificationPromises.push(
                            tx.notification.create({
                                data: {
                                    id: `notif_auto_confirm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                                    userId: clientUserId,
                                    userType: 'CLIENT',
                                    type: 'BOOKING_CONFIRMED',
                                    title: 'Service Auto-Confirmed ✅',
                                    message: `Your booking "${booking.title}" has been automatically confirmed after 48 hours. The payment has been released to the provider.`,
                                    data: JSON.stringify({
                                        bookingId: booking.id,
                                        serviceTitle: booking.title,
                                        autoConfirmed: true,
                                        confirmedAt: new Date().toISOString()
                                    })
                                }
                            })
                        );
                    }

                    if (providerUserId) {
                        notificationPromises.push(
                            tx.notification.create({
                                data: {
                                    id: `notif_auto_confirm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                                    userId: providerUserId,
                                    userType: 'PROVIDER',
                                    type: 'PAYMENT_RELEASED',
                                    title: 'Service Auto-Confirmed! 💰',
                                    message: `Your service "${booking.title}" has been automatically confirmed. Payment will be released shortly.`,
                                    data: JSON.stringify({
                                        bookingId: booking.id,
                                        serviceTitle: booking.title,
                                        autoConfirmed: true,
                                        confirmedAt: new Date().toISOString()
                                    })
                                }
                            })
                        );
                    }

                    await Promise.all(notificationPromises);
                });

                confirmedCount++;
                console.log(`✅ Auto-confirmed booking ${booking.id}: "${booking.title}"`);

            } catch (error) {
                console.error(`❌ Error auto-confirming booking ${booking.id}:`, error);
            }
        }

        console.log(`🎉 Auto-confirmation complete: ${confirmedCount} bookings confirmed`);
        
        return {
            success: true,
            confirmedCount,
            totalChecked: overdueBookings.length
        };

    } catch (error) {
        console.error('❌ Auto-confirmation process failed:', error);
        return {
            success: false,
            error: error.message
        };
    } finally {
        await prisma.$disconnect();
    }
}

// Run if called directly
if (require.main === module) {
    autoConfirmBookings()
        .then(result => {
            console.log('Final result:', result);
            process.exit(result.success ? 0 : 1);
        })
        .catch(error => {
            console.error('Script failed:', error);
            process.exit(1);
        });
}

module.exports = autoConfirmBookings; 