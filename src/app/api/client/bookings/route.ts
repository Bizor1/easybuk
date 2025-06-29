import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

// Mark this route as dynamic to handle headers during static generation
export const dynamic = 'force-dynamic';

// GET /api/client/bookings - Get client's bookings with filter support
export async function GET(request: NextRequest) {
    console.log('=== CLIENT BOOKINGS API START ===');

    const tokenPayload = getCurrentUser(request);

    if (!tokenPayload?.userId) {
        console.log('Authentication failed');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status'); // 'PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED'
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const offset = (page - 1) * limit;

        console.log('Fetching client bookings with filters:', { status, page, limit });
        console.log('User ID:', tokenPayload.userId);

        // Find the client associated with the current user
        const clientProfile = await prisma.userClientProfile.findFirst({
            where: { userId: tokenPayload.userId },
            include: { Client: true }
        });

        console.log('Client profile found:', !!clientProfile);
        console.log('Client data:', clientProfile?.Client ? { id: clientProfile.Client.id, name: clientProfile.Client.name, email: clientProfile.Client.email } : 'No client data');

        if (!clientProfile?.Client) {
            console.log('Client profile not found for user:', tokenPayload.userId);
            return NextResponse.json({ error: 'Client profile not found' }, { status: 404 });
        }

        const clientId = clientProfile.Client.id;
        console.log('Using client ID:', clientId);

        // Build where clause for filtering
        const whereClause: any = {
            clientId: clientId
        };

        if (status) {
            whereClause.status = status;
        }

        console.log('Where clause:', whereClause);

        // Fetch bookings with provider information
        const bookings = await prisma.booking.findMany({
            where: whereClause,
            include: {
                ServiceProvider: {
                    include: {
                        UserProviderProfile: {
                            include: {
                                User: {
                                    select: {
                                        id: true,
                                        name: true,
                                        email: true,
                                        image: true
                                    }
                                }
                            }
                        }
                    }
                },
                Service: true
            },
            orderBy: [
                { status: 'asc' }, // PENDING first for urgent action
                { createdAt: 'desc' }
            ],
            skip: offset,
            take: limit
        });

        console.log('Raw bookings found:', bookings.length);

        // Get total count for pagination
        const totalCount = await prisma.booking.count({
            where: whereClause
        });

        // Count by status for dashboard stats
        const statusCounts = await prisma.booking.groupBy({
            by: ['status'],
            where: { clientId: clientId },
            _count: { status: true }
        });

        const statusStats = statusCounts.reduce((acc, item) => {
            acc[item.status] = item._count.status;
            return acc;
        }, {} as Record<string, number>);

        // Format bookings for response
        const formattedBookings = bookings.map(booking => {
            const providerUser = booking.ServiceProvider.UserProviderProfile?.User;

            return {
                id: booking.id,
                title: booking.title,
                description: booking.description,
                status: booking.status,
                bookingType: booking.bookingType,
                isPaid: booking.isPaid,
                scheduledDate: booking.scheduledDate,
                scheduledTime: booking.scheduledTime,
                duration: booking.duration,
                location: booking.location,
                totalAmount: booking.totalAmount,
                currency: booking.currency,
                paymentMethod: booking.paymentMethod || 'MOBILE_MONEY',
                createdAt: booking.createdAt,
                updatedAt: booking.updatedAt,
                cancelledAt: booking.cancelledAt,
                completedAt: booking.completedAt,
                provider: {
                    id: booking.providerId,
                    name: providerUser?.name || 'Unknown Provider',
                    email: providerUser?.email || 'No email',
                    profileImage: providerUser?.image || null
                },
                service: booking.Service ? {
                    id: booking.Service.id,
                    title: booking.Service.name,
                    category: booking.Service.category
                } : null,
                canPay: booking.status === 'CONFIRMED' && !booking.isPaid,
                needsAction: (booking.status === 'CONFIRMED' && !booking.isPaid) || booking.status === 'PENDING' || booking.status === 'AWAITING_CLIENT_CONFIRMATION'
            };
        });

        const responseStats = {
            total: totalCount,
            page,
            limit,
            totalPages: Math.ceil(totalCount / limit),
            statusCounts: {
                PENDING: statusStats.PENDING || 0,
                CONFIRMED: statusStats.CONFIRMED || 0,
                ACTIVE: statusStats.ACTIVE || 0,
                IN_PROGRESS: statusStats.IN_PROGRESS || 0,
                AWAITING_CLIENT_CONFIRMATION: statusStats.AWAITING_CLIENT_CONFIRMATION || 0,
                COMPLETED: statusStats.COMPLETED || 0,
                CANCELLED: statusStats.CANCELLED || 0
            },
            actionRequired: (statusStats.CONFIRMED || 0) + (statusStats.AWAITING_CLIENT_CONFIRMATION || 0)
        };

        console.log('✅ Client bookings fetched:', {
            total: totalCount,
            currentPage: formattedBookings.length,
            statusFilter: status,
            actionRequired: responseStats.actionRequired
        });

        return NextResponse.json({
            success: true,
            bookings: formattedBookings,
            stats: responseStats,
            message: responseStats.actionRequired > 0 ?
                `You have ${responseStats.actionRequired} booking${responseStats.actionRequired > 1 ? 's' : ''} requiring your attention!` :
                'All bookings are up to date.'
        });

    } catch (error) {
        console.error('Error fetching client bookings:', error);
        return NextResponse.json(
            { error: 'Failed to fetch bookings: ' + (error instanceof Error ? error.message : 'Unknown error') },
            { status: 500 }
        );
    }
} 