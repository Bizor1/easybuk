import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

// GET /api/provider/bookings - Get provider's bookings with filter support
export async function GET(request: NextRequest) {
    console.log('=== PROVIDER BOOKINGS API START ===');

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

        console.log('Fetching provider bookings with filters:', { status, page, limit });

        // Find the provider associated with the current user
        const providerProfile = await prisma.userProviderProfile.findFirst({
            where: { userId: tokenPayload.userId },
            include: { ServiceProvider: true }
        });

        if (!providerProfile?.ServiceProvider) {
            console.log('Provider profile not found');
            return NextResponse.json({ error: 'Provider profile not found' }, { status: 404 });
        }

        const providerId = providerProfile.ServiceProvider.id;

        // Build where clause for filtering
        const whereClause: any = {
            providerId: providerId
        };

        if (status) {
            whereClause.status = status;
        }

        // Fetch bookings with client information
        const bookings = await prisma.booking.findMany({
            where: whereClause,
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

        // Get total count for pagination
        const totalCount = await prisma.booking.count({
            where: whereClause
        });

        // Count by status for dashboard stats
        const statusCounts = await prisma.booking.groupBy({
            by: ['status'],
            where: { providerId: providerId },
            _count: { status: true }
        });

        const statusStats = statusCounts.reduce((acc, item) => {
            acc[item.status] = item._count.status;
            return acc;
        }, {} as Record<string, number>);

        // Format bookings for response
        const formattedBookings = bookings.map(booking => {
            const clientUser = booking.Client.UserClientProfile?.User;

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
                paymentMethod: booking.paymentMethod,
                createdAt: booking.createdAt,
                updatedAt: booking.updatedAt,
                cancelledAt: booking.cancelledAt,
                completedAt: booking.completedAt,
                client: {
                    id: booking.clientId,
                    name: clientUser?.name || 'Unknown Client',
                    email: clientUser?.email || 'No email',
                    profileImage: clientUser?.image || null
                },
                service: booking.Service ? {
                    id: booking.Service.id,
                    title: booking.Service.name,
                    category: booking.Service.category
                } : null,
                // Add urgency flag for UI
                isUrgent: booking.status === 'PENDING' && isUrgentBooking(booking.scheduledDate),
                // Add time since request for PENDING bookings
                timeSinceRequest: booking.status === 'PENDING' ?
                    Math.round((Date.now() - booking.createdAt.getTime()) / (1000 * 60 * 60)) : null
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
                COMPLETED: statusStats.COMPLETED || 0,
                CANCELLED: statusStats.CANCELLED || 0
            },
            pendingRequests: statusStats.PENDING || 0 // Highlight pending requests
        };

        console.log('✅ Provider bookings fetched:', {
            total: totalCount,
            currentPage: formattedBookings.length,
            statusFilter: status,
            pendingRequests: statusStats.PENDING || 0
        });

        return NextResponse.json({
            success: true,
            bookings: formattedBookings,
            stats: responseStats,
            message: statusStats.PENDING > 0 ?
                `You have ${statusStats.PENDING} pending booking request${statusStats.PENDING > 1 ? 's' : ''} requiring your attention!` :
                'All booking requests are up to date.'
        });

    } catch (error) {
        console.error('Error fetching provider bookings:', error);
        return NextResponse.json(
            { error: 'Failed to fetch bookings: ' + (error instanceof Error ? error.message : 'Unknown error') },
            { status: 500 }
        );
    }
}

// Helper function to check if booking is urgent (within 24 hours)
function isUrgentBooking(scheduledDate: Date): boolean {
    const now = new Date();
    const diffHours = (scheduledDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return diffHours <= 24 && diffHours > 0;
} 