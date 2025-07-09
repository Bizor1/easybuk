import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const tokenPayload = getCurrentUser(request);

        if (!tokenPayload?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get the provider profile through UserProviderProfile
        const userProviderProfile = await prisma.userProviderProfile.findUnique({
            where: { userId: tokenPayload.userId },
            include: {
                ServiceProvider: {
                    include: {
                        Service: true
                    }
                }
            }
        });

        if (!userProviderProfile?.ServiceProvider) {
            return NextResponse.json({ error: 'Provider profile not found' }, { status: 404 });
        }

        const provider = userProviderProfile.ServiceProvider;

        const { searchParams } = new URL(request.url);
        const period = searchParams.get('period') || '30days';

        // Calculate date ranges
        const now = new Date();
        let startDate: Date;
        let previousStartDate: Date;

        switch (period) {
            case '7days':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                previousStartDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
                break;
            case '3months':
                startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                previousStartDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
                break;
            case '1year':
                startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                previousStartDate = new Date(now.getTime() - 730 * 24 * 60 * 60 * 1000);
                break;
            default: // 30days
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                previousStartDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
        }

        console.log('📊 Provider Analytics: Fetching data for provider', provider.id, 'period:', period);

        // Fetch provider-specific analytics data
        const [
            currentBookings,
            previousBookings,
            completedBookings,
            previousCompletedBookings,
            totalRevenue,
            previousRevenue,
            profileViews,
            avgRating,
            responseStats,
            repeatClients
        ] = await Promise.all([
            // Current period bookings
            prisma.booking.count({
                where: {
                    providerId: provider.id,
                    createdAt: { gte: startDate }
                }
            }),
            // Previous period bookings
            prisma.booking.count({
                where: {
                    providerId: provider.id,
                    createdAt: { gte: previousStartDate, lt: startDate }
                }
            }),
            // Current period completed bookings
            prisma.booking.count({
                where: {
                    providerId: provider.id,
                    status: 'COMPLETED',
                    completedAt: { gte: startDate }
                }
            }),
            // Previous period completed bookings
            prisma.booking.count({
                where: {
                    providerId: provider.id,
                    status: 'COMPLETED',
                    completedAt: { gte: previousStartDate, lt: startDate }
                }
            }),
            // Current period revenue
            prisma.booking.aggregate({
                where: {
                    providerId: provider.id,
                    status: 'COMPLETED',
                    isPaid: true,
                    completedAt: { gte: startDate }
                },
                _sum: { totalAmount: true }
            }),
            // Previous period revenue
            prisma.booking.aggregate({
                where: {
                    providerId: provider.id,
                    status: 'COMPLETED',
                    isPaid: true,
                    completedAt: { gte: previousStartDate, lt: startDate }
                },
                _sum: { totalAmount: true }
            }),
            // Profile views - Using tracking helper
            import('@/lib/tracking').then(({ getProfileViewAnalytics }) =>
                getProfileViewAnalytics(provider.id, startDate).then(data => data.totalViews)
            ),
            // Average rating
            prisma.review.aggregate({
                where: {
                    providerId: provider.id,
                    createdAt: { gte: startDate }
                },
                _avg: { overallRating: true },
                _count: true
            }),
            // Response time stats - Using tracking helper
            import('@/lib/tracking').then(({ getResponseTimeAnalytics }) =>
                getResponseTimeAnalytics(provider.id, startDate).then(data => ({
                    avgResponseTime: data.avgResponseTimeMinutes,
                    responseRate: data.responseRate
                }))
            ),
            // Repeat clients
            prisma.booking.findMany({
                where: {
                    providerId: provider.id,
                    status: 'COMPLETED',
                    completedAt: { gte: startDate }
                },
                select: { clientId: true }
            }).then(bookings => {
                const clientCounts = bookings.reduce((acc, booking) => {
                    acc[booking.clientId] = (acc[booking.clientId] || 0) + 1;
                    return acc;
                }, {} as Record<string, number>);

                return Object.values(clientCounts).filter(count => count > 1).length;
            })
        ]);

        // Calculate metrics
        const currentRevenueAmount = totalRevenue._sum.totalAmount || 0;
        const previousRevenueAmount = previousRevenue._sum.totalAmount || 0;
        const revenueChange = previousRevenueAmount > 0
            ? ((currentRevenueAmount - previousRevenueAmount) / previousRevenueAmount) * 100
            : 0;

        const bookingChange = previousBookings > 0
            ? ((currentBookings - previousBookings) / previousBookings) * 100
            : 0;

        const conversionRate = currentBookings > 0 ? (completedBookings / currentBookings) * 100 : 0;
        const previousConversionRate = previousBookings > 0 ? (previousCompletedBookings / previousBookings) * 100 : 0;
        const conversionChange = conversionRate - previousConversionRate;

        const averageRating = avgRating._avg.overallRating || 0;
        const totalReviews = avgRating._count || 0;

        // Calculate client retention rate
        const totalClients = await prisma.booking.findMany({
            where: {
                providerId: provider.id,
                status: 'COMPLETED',
                completedAt: { gte: startDate }
            },
            select: { clientId: true },
            distinct: ['clientId']
        });

        const clientRetentionRate = totalClients.length > 0 ? (repeatClients / totalClients.length) * 100 : 0;

        const overview = {
            totalViews: profileViews,
            profileVisits: profileViews,
            bookingRequests: currentBookings,
            conversionRate: Math.round(conversionRate * 100) / 100,
            avgRating: Math.round(averageRating * 10) / 10,
            responseTime: responseStats.avgResponseTime,
            clientRetention: Math.round(clientRetentionRate * 100) / 100,
            repeatBookings: repeatClients,
            totalRevenue: currentRevenueAmount,
            revenueChange: Math.round(revenueChange * 100) / 100,
            bookingChange: Math.round(bookingChange * 100) / 100,
            conversionChange: Math.round(conversionChange * 100) / 100,
            completedBookings,
            totalReviews,
            responseRate: responseStats.responseRate
        };

        console.log('✅ Provider Analytics Overview: Data fetched successfully');
        return NextResponse.json(overview);

    } catch (error) {
        console.error('❌ Provider Analytics Overview Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch provider analytics overview' },
            { status: 500 }
        );
    }
} 