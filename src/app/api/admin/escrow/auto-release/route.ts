import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

// Mark this route as dynamic to handle headers during static generation
export const dynamic = 'force-dynamic';

// POST /api/admin/escrow/auto-release - Auto-release escrow after 48 hours (admin/system only)
export async function POST(request: NextRequest) {
    console.log('🔄 Starting automatic escrow release process...');

    try {
        const tokenPayload = getCurrentUser(request);

        if (!tokenPayload?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const isAdmin = tokenPayload.roles?.includes('ADMIN');
        if (!isAdmin) {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        // Find bookings eligible for auto-release (48+ hours ago)
        // Only process bookings still awaiting client confirmation after 48 hours
        // (Two-party confirmations are handled immediately in the confirm endpoint)
        const now = new Date();

        const eligibleBookings = await prisma.booking.findMany({
            where: {
                status: 'AWAITING_CLIENT_CONFIRMATION', // Only unresponded client confirmations
                isPaid: true,
                escrowReleased: false,
                clientConfirmDeadline: {
                    lte: now // Past the 48-hour deadline
                },
                Dispute: {
                    is: null // No disputes
                }
            },
            include: {
                ServiceProvider: {
                    include: {
                        ProviderWallet: true,
                        UserProviderProfile: {
                            include: {
                                User: true
                            }
                        }
                    }
                }
            },
            take: 50 // Process in batches
        });

        console.log(`📋 Found ${eligibleBookings.length} bookings eligible for auto-release`);

        let releasedCount = 0;
        let totalReleased = 0;

        for (const booking of eligibleBookings) {
            try {
                const providerAmount = booking.providerAmount || (booking.totalAmount - (booking.commissionAmount || booking.totalAmount * 0.05));

                await prisma.$transaction(async (tx) => {
                    // Auto-accept completion since client didn't respond within 48 hours
                    await tx.booking.update({
                        where: { id: booking.id },
                        data: {
                            status: 'COMPLETED',
                            clientConfirmedAt: new Date(), // Set auto-confirmation timestamp
                            escrowReleased: true,
                            updatedAt: new Date()
                        }
                    });

                    console.log(`🕐 Auto-accepted booking ${booking.id} after 48 hours - client didn't respond`);

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
                                releaseReason: 'AUTO_RELEASE_NO_CLIENT_RESPONSE',
                                providerCompletedAt: booking.completedAt,
                                autoAcceptedAt: new Date(),
                                deadlinePassed: booking.clientConfirmDeadline
                            },
                            createdAt: new Date(),
                            updatedAt: new Date()
                        }
                    });

                    // Update provider wallet
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

                    // Send notification
                    const userId = booking.ServiceProvider.UserProviderProfile?.userId;
                    if (userId) {
                        await tx.notification.create({
                            data: {
                                id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                                userId: userId,
                                userType: 'PROVIDER',
                                type: 'PAYMENT_RELEASED',
                                title: 'Funds Released! 💰',
                                message: `Your payment of ${booking.currency} ${providerAmount.toFixed(2)} has been released for "${booking.title}". The client didn't respond within 48 hours, so completion was automatically confirmed.`
                            }
                        });
                    }
                });

                releasedCount++;
                totalReleased += providerAmount;
                console.log(`✅ Released ${providerAmount} ${booking.currency} for booking ${booking.id}`);

            } catch (error) {
                console.error(`❌ Error releasing escrow for ${booking.id}:`, error);
            }
        }

        return NextResponse.json({
            success: true,
            message: `Released ${releasedCount} payments totaling ${totalReleased} GHS`,
            releasedCount,
            totalReleased
        });

    } catch (error) {
        console.error('❌ Auto-release error:', error);
        return NextResponse.json(
            { error: 'Failed to process auto-release' },
            { status: 500 }
        );
    }
}

// GET /api/admin/escrow/auto-release - Check which bookings are eligible for auto-release
export async function GET(request: NextRequest) {
    try {
        const tokenPayload = getCurrentUser(request);

        if (!tokenPayload?.userId || !tokenPayload.roles?.includes('ADMIN')) {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        const now = new Date();
        const fortyEightHoursAgo = new Date(now.getTime() - (48 * 60 * 60 * 1000));

        // Find eligible bookings
        const eligibleBookings = await prisma.booking.findMany({
            where: {
                status: 'COMPLETED',
                isPaid: true,
                escrowReleased: false,
                completedAt: {
                    lte: fortyEightHoursAgo
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
                ServiceProvider: {
                    include: {
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
                }
            },
            orderBy: { completedAt: 'asc' }
        });

        // Calculate total amounts
        const totalAmount = eligibleBookings.reduce((sum, booking) => {
            const providerAmount = booking.providerAmount || (booking.totalAmount - (booking.commissionAmount || booking.totalAmount * 0.05));
            return sum + providerAmount;
        }, 0);

        const eligibilityReport = eligibleBookings.map(booking => {
            const providerAmount = booking.providerAmount || (booking.totalAmount - (booking.commissionAmount || booking.totalAmount * 0.05));
            const hoursSinceCompletion = booking.completedAt ? (now.getTime() - booking.completedAt.getTime()) / (1000 * 60 * 60) : 0;

            return {
                bookingId: booking.id,
                title: booking.title,
                providerName: booking.ServiceProvider.UserProviderProfile?.User?.name || 'Unknown Provider',
                clientName: booking.Client.UserClientProfile?.User?.name || 'Unknown Client',
                amount: providerAmount,
                currency: booking.currency,
                completedAt: booking.completedAt,
                hoursSinceCompletion: Math.round(hoursSinceCompletion),
                isEligible: hoursSinceCompletion >= 48,
                hasDispute: false
            };
        });

        return NextResponse.json({
            eligibleCount: eligibleBookings.length,
            totalAmount,
            currency: 'GHS',
            bookings: eligibilityReport
        });

    } catch (error) {
        console.error('Error checking escrow eligibility:', error);
        return NextResponse.json(
            { error: 'Failed to check eligibility' },
            { status: 500 }
        );
    }
} 