import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

// Mark this route as dynamic to handle headers during static generation
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const tokenPayload = getCurrentUser(request);

        if (!tokenPayload?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get provider ID from user
        const userProvider = await prisma.userProviderProfile.findUnique({
            where: { userId: tokenPayload.userId }
        });

        if (!userProvider) {
            return NextResponse.json({ error: 'Provider profile not found' }, { status: 404 });
        }

        const providerId = userProvider.providerId;

        // Get transactions for this provider from bookings
        const transactions = await prisma.transaction.findMany({
            where: {
                userId: userProvider.providerId,
                userType: 'PROVIDER',
                type: {
                    in: ['BOOKING_PAYMENT', 'ESCROW_RELEASE', 'COMMISSION', 'WITHDRAWAL', 'REFUND']
                }
            },
            include: {
                Booking: {
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
                        Service: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 50 // Limit to recent 50 transactions
        });

        // Also get earnings from completed bookings (since transactions might not be created for all payments)
        const completedBookings = await prisma.booking.findMany({
            where: {
                providerId: providerId,
                status: 'COMPLETED',
                isPaid: true
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
                Service: {
                    select: {
                        name: true
                    }
                }
            },
            orderBy: { completedAt: 'desc' },
            take: 20
        });

        // Convert transactions to the expected format
        const formattedTransactions = transactions.map(transaction => ({
            id: transaction.id,
            type: transaction.type === 'BOOKING_PAYMENT' ? 'payment' :
                transaction.type === 'ESCROW_RELEASE' ? 'escrow_release' :
                    transaction.type === 'WITHDRAWAL' ? 'withdrawal' :
                        transaction.type === 'REFUND' ? 'refund' : 'payment',
            amount: transaction.amount,
            date: transaction.createdAt.toISOString(),
            client: transaction.Booking?.Client?.UserClientProfile?.User?.name || 'Unknown Client',
            service: transaction.Booking?.Service?.name || transaction.description || 'Service Payment',
            status: transaction.status.toLowerCase() as 'completed' | 'pending' | 'failed',
            fee: transaction.platformFee || 0,
            paymentMethod: transaction.paymentMethod || 'MOBILE_MONEY'
        }));

        // Convert completed bookings to transactions format (for payments not in Transaction table)
        const bookingTransactions = completedBookings
            .filter(booking => !transactions.some(t => t.bookingId === booking.id)) // Don't duplicate
            .map(booking => {
                const providerAmount = booking.providerAmount || (booking.totalAmount - (booking.commissionAmount || booking.totalAmount * 0.05));
                const commission = booking.commissionAmount || booking.totalAmount * 0.05;

                return {
                    id: `booking_${booking.id}`,
                    type: booking.escrowReleased ? 'escrow_release' : 'payment' as 'payment' | 'withdrawal' | 'escrow_release' | 'refund',
                    amount: providerAmount,
                    date: (booking.completedAt || booking.createdAt).toISOString(),
                    client: booking.Client?.UserClientProfile?.User?.name || 'Unknown Client',
                    service: booking.Service?.name || booking.title,
                    status: booking.escrowReleased ? 'completed' : 'pending' as 'completed' | 'pending' | 'failed',
                    fee: commission,
                    paymentMethod: booking.paymentMethod || 'MOBILE_MONEY'
                };
            });

        // Combine and sort all transactions
        const allTransactions = [...formattedTransactions, ...bookingTransactions]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 50); // Keep only recent 50

        return NextResponse.json(allTransactions);

    } catch (error) {
        console.error('Error fetching provider transactions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch transactions' },
            { status: 500 }
        );
    }
} 