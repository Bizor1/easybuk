import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

// Mark this route as dynamic to handle headers during static generation
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    console.log('📋 Provider Activities: Getting recent activity');
    try {
        const tokenPayload = getCurrentUser(request);

        if (!tokenPayload?.userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get provider profile
        const userProvider = await prisma.userProviderProfile.findUnique({
            where: { userId: tokenPayload.userId },
            include: {
                ServiceProvider: true
            }
        });

        if (!userProvider) {
            return NextResponse.json(
                { error: 'Provider profile not found' },
                { status: 404 }
            );
        }

        const providerId = userProvider.providerId;
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '10');

        console.log('📋 Fetching recent provider activities...');

        // Get recent bookings (last 7 days)
        const recentBookings = await prisma.booking.findMany({
            where: {
                providerId: providerId,
                createdAt: {
                    gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
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
                                        image: true
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
            orderBy: {
                createdAt: 'desc'
            },
            take: limit
        });

        // Get recent transactions (payments received)
        const recentTransactions = await prisma.transaction.findMany({
            where: {
                userId: providerId,
                userType: 'PROVIDER',
                status: 'COMPLETED',
                type: {
                    in: ['BOOKING_PAYMENT', 'ESCROW_RELEASE']
                },
                createdAt: {
                    gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
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
                                                image: true
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
            orderBy: {
                createdAt: 'desc'
            },
            take: limit
        });

        // Get recent reviews
        const recentReviews = await prisma.review.findMany({
            where: {
                providerId: providerId,
                createdAt: {
                    gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
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
                                        image: true
                                    }
                                }
                            }
                        }
                    }
                },
                Booking: {
                    include: {
                        Service: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: limit
        });

        // Get recent messages
        const recentMessages = await prisma.message.findMany({
            where: {
                OR: [
                    {
                        receiverId: providerId,
                        receiverType: 'PROVIDER'
                    }
                ],
                createdAt: {
                    gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                }
            },
            include: {
                Booking: {
                    include: {
                        Service: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: limit
        });

        // Format activities
        const activities: any[] = [];

        // Add booking activities
        recentBookings.forEach(booking => {
            const client = booking.Client?.UserClientProfile?.User;
            const statusText = booking.status === 'PENDING' ? 'New Booking Request' :
                booking.status === 'CONFIRMED' ? 'Booking Confirmed' :
                    booking.status === 'IN_PROGRESS' ? 'Service in Progress' :
                        booking.status === 'COMPLETED' ? 'Booking Completed' :
                            booking.status === 'AWAITING_CLIENT_CONFIRMATION' ? 'Awaiting Confirmation' :
                                booking.status === 'CANCELLED' ? 'Booking Cancelled' :
                                    booking.status === 'DISPUTED' ? 'Booking Disputed' :
                                        booking.status === 'REFUNDED' ? 'Booking Refunded' :
                                            'Booking Updated';

            // Map database status to frontend status
            const mapStatus = (dbStatus: string) => {
                switch (dbStatus) {
                    case 'PENDING': return 'pending';
                    case 'CONFIRMED': return 'confirmed';
                    case 'IN_PROGRESS': return 'in_progress';
                    case 'COMPLETED': return 'completed';
                    case 'AWAITING_CLIENT_CONFIRMATION': return 'awaiting_client_confirmation';
                    case 'CANCELLED': return 'cancelled';
                    case 'DISPUTED': return 'disputed';
                    case 'REFUNDED': return 'refunded';
                    default: return 'pending';
                }
            };

            activities.push({
                id: `booking_${booking.id}`,
                type: 'booking',
                title: statusText,
                description: booking.Service?.name || booking.title,
                timestamp: booking.createdAt,
                client: client ? {
                    name: client.name || 'Unknown Client',
                    image: client.image || '/default-avatar.png'
                } : undefined,
                amount: booking.status === 'COMPLETED' ? booking.providerAmount || booking.totalAmount : undefined,
                status: mapStatus(booking.status)
            });
        });

        // Add payment activities
        recentTransactions.forEach(transaction => {
            const client = transaction.Booking?.Client?.UserClientProfile?.User;
            activities.push({
                id: `payment_${transaction.id}`,
                type: 'payment',
                title: transaction.type === 'ESCROW_RELEASE' ? 'Payment Released' : 'Payment Received',
                description: `Payment for ${transaction.Booking?.Service?.name || 'service'}`,
                timestamp: transaction.createdAt,
                client: client ? {
                    name: client.name || 'Unknown Client',
                    image: client.image || '/default-avatar.png'
                } : undefined,
                amount: transaction.amount,
                status: 'completed' as const
            });
        });

        // Add review activities
        recentReviews.forEach(review => {
            const client = review.Client?.UserClientProfile?.User;
            activities.push({
                id: `review_${review.id}`,
                type: 'review',
                title: 'New Review Received',
                description: `${review.overallRating}-star rating for ${review.Booking?.Service?.name || 'your service'}`,
                timestamp: review.createdAt,
                client: client ? {
                    name: client.name || 'Unknown Client',
                    image: client.image || '/default-avatar.png'
                } : undefined,
                status: 'completed' as const
            });
        });

        // Add message activities
        recentMessages.forEach(message => {
            activities.push({
                id: `message_${message.id}`,
                type: 'message',
                title: 'New Message',
                description: `Message about ${message.Booking?.Service?.name || 'your service'}`,
                timestamp: message.createdAt,
                client: {
                    name: 'Client',
                    image: '/default-avatar.png'
                },
                status: message.isRead ? 'completed' as const : 'pending' as const
            });
        });

        // Sort by timestamp and limit results  
        activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        const limitedActivities = activities.slice(0, limit);

        // Format timestamps for display
        const formattedActivities = limitedActivities.map(activity => ({
            ...activity,
            timestamp: formatTimeAgo(activity.timestamp)
        }));

        console.log(`✅ Retrieved ${formattedActivities.length} provider activities`);

        return NextResponse.json({
            success: true,
            activities: formattedActivities
        });

    } catch (error) {
        console.error('Provider activities error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch recent activities' },
            { status: 500 }
        );
    }
}

function formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;

    return new Date(date).toLocaleDateString();
} 