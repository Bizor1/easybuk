const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function autoReleaseEscrow() {
    try {
        console.log('🔄 Starting automated escrow release process...');
        
        // Find bookings eligible for auto-release (48+ hours ago)
        // Only process bookings still awaiting client confirmation (unilateral provider claims)
        const now = new Date();
        const fortyEightHoursAgo = new Date(now.getTime() - (48 * 60 * 60 * 1000));

        const eligibleBookings = await prisma.booking.findMany({
            where: {
                status: 'AWAITING_CLIENT_CONFIRMATION', // Only unresponded client confirmations
                isPaid: true,
                escrowReleased: false,
                clientConfirmDeadline: {
                    lte: now // Past the 48-hour deadline
                },
                // No open disputes
                Dispute: {
                    is: null
                }
            },
            include: {
                ServiceProvider: {
                    include: {
                        ProviderWallet: true,
                        UserProviderProfile: {
                            include: {
                                User: {
                                    select: {
                                        name: true,
                                        email: true
                                    }
                                }
                            }
                        }
                    }
                },
                Client: {
                    include: {
                        UserClientProfile: {
                            include: {
                                User: {
                                    select: {
                                        name: true,
                                        email: true
                                    }
                                }
                            }
                        }
                    }
                }
            },
            take: 100 // Process in batches
        });

        console.log(`📋 Found ${eligibleBookings.length} bookings eligible for auto-release`);

        if (eligibleBookings.length === 0) {
            console.log('✅ No bookings require escrow release at this time');
            return { releasedCount: 0, totalReleased: 0 };
        }

        let releasedCount = 0;
        let totalReleased = 0;
        const errors = [];

        for (const booking of eligibleBookings) {
            try {
                const providerAmount = booking.providerAmount || (booking.totalAmount - (booking.commissionAmount || booking.totalAmount * 0.05));
                
                console.log(`💰 Processing escrow release for booking ${booking.id}: ${providerAmount} ${booking.currency}`);
                
                await prisma.$transaction(async (tx) => {
                    // Auto-accept completion and mark escrow as released
                    await tx.booking.update({
                        where: { id: booking.id },
                        data: {
                            status: 'COMPLETED', // Auto-accept the completion
                            clientConfirmedAt: new Date(), // Set auto-confirmation timestamp
                            escrowReleased: true,
                            updatedAt: new Date()
                        }
                    });

                    // Create transaction record
                    await tx.transaction.create({
                        data: {
                            id: `escrow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                            userId: booking.providerId,
                            userType: 'PROVIDER',
                            bookingId: booking.id,
                            type: 'ESCROW_RELEASE',
                            amount: providerAmount,
                            currency: booking.currency,
                            status: 'COMPLETED',
                            description: `Auto-release: Client didn't respond within 48 hours - ${booking.title}`,
                            metadata: {
                                originalAmount: booking.totalAmount,
                                commission: booking.commissionAmount || booking.totalAmount * 0.05,
                                releaseReason: 'AUTO_RELEASE_NO_CLIENT_RESPONSE',
                                providerCompletedAt: booking.completedAt,
                                autoAcceptedAt: new Date(),
                                deadlinePassed: booking.clientConfirmDeadline
                            },
                            createdAt: new Date(),
                            updatedAt: new Date()
                        }
                    });

                    // Update or create provider wallet
                    if (booking.ServiceProvider.ProviderWallet) {
                        await tx.providerWallet.update({
                            where: { providerId: booking.providerId },
                            data: {
                                balance: { increment: providerAmount },
                                updatedAt: new Date()
                            }
                        });
                    } else {
                        await tx.providerWallet.create({
                            data: {
                                id: `wallet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                                providerId: booking.providerId,
                                balance: providerAmount,
                                currency: booking.currency,
                                canWithdraw: true,
                                createdAt: new Date(),
                                updatedAt: new Date()
                            }
                        });
                    }

                    // Send notification to provider
                    const userId = booking.ServiceProvider.UserProviderProfile?.userId;
                    if (userId) {
                        await tx.notification.create({
                            data: {
                                id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                                userId: userId,
                                userType: 'PROVIDER',
                                type: 'PAYMENT_RELEASED',
                                title: 'Funds Released! 💰',
                                message: `Your payment of ${booking.currency} ${providerAmount.toFixed(2)} has been released for "${booking.title}". The funds are now available in your wallet.`,
                                data: {
                                    bookingId: booking.id,
                                    amount: providerAmount,
                                    currency: booking.currency,
                                    releaseType: 'AUTO_RELEASE_48_HOURS'
                                },
                                isRead: false,
                                sentViaEmail: false,
                                sentViaSMS: false,
                                sentViaPush: false,
                                createdAt: new Date()
                            }
                        });
                    }
                });

                releasedCount++;
                totalReleased += providerAmount;
                
                console.log(`✅ Successfully released ${providerAmount} ${booking.currency} for booking ${booking.id}`);
                console.log(`   Provider: ${booking.ServiceProvider.UserProviderProfile?.User?.name || 'Unknown'}`);
                console.log(`   Client: ${booking.Client.UserClientProfile?.User?.name || 'Unknown'}`);
                console.log(`   Service: ${booking.title}`);

            } catch (error) {
                console.error(`❌ Error releasing escrow for booking ${booking.id}:`, error);
                errors.push(`Booking ${booking.id}: ${error.message}`);
            }
        }

        console.log(`\n🎉 Escrow auto-release completed:`);
        console.log(`   📊 Released payments: ${releasedCount}`);
        console.log(`   💰 Total amount released: ${totalReleased.toFixed(2)} GHS`);
        console.log(`   ❌ Errors: ${errors.length}`);
        
        if (errors.length > 0) {
            console.log(`\n⚠️  Errors encountered:`);
            errors.forEach(error => console.log(`   - ${error}`));
        }

        return {
            releasedCount,
            totalReleased,
            errors
        };

    } catch (error) {
        console.error('❌ Fatal error in auto-release process:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// If running as script directly
if (require.main === module) {
    autoReleaseEscrow()
        .then(result => {
            console.log(`\n✅ Auto-release script completed successfully`);
            process.exit(0);
        })
        .catch(error => {
            console.error('❌ Auto-release script failed:', error);
            process.exit(1);
        });
}

module.exports = autoReleaseEscrow; 