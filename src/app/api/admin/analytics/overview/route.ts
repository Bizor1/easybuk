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

        // Check if user is admin
        const user = await prisma.user.findUnique({
            where: { id: tokenPayload.userId },
            include: {
                UserAdminProfile: true
            }
        });

        if (!user || !user.roles.includes('ADMIN') || !user.UserAdminProfile) {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const timeRange = searchParams.get('timeRange') || '30d';

        // Calculate date ranges
        const now = new Date();
        let startDate: Date;
        let previousStartDate: Date;

        switch (timeRange) {
            case '7d':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                previousStartDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
                break;
            case '90d':
                startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                previousStartDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
                break;
            case '1y':
                startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                previousStartDate = new Date(now.getTime() - 730 * 24 * 60 * 60 * 1000);
                break;
            default: // 30d
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                previousStartDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
        }

        console.log('📊 Admin Analytics: Fetching data for range:', timeRange, 'from', startDate.toISOString());

        // Fetch all data in parallel
        const [
            totalRevenue,
            previousRevenue,
            totalUsers,
            previousUsers,
            totalBookings,
            previousBookings,
            completedBookings,
            previousCompletedBookings,
            providersCount,
            clientsCount,
            disputesCount,
            pendingVerifications
        ] = await Promise.all([
            // Current period revenue (from completed bookings)
            prisma.booking.aggregate({
                where: {
                    status: 'COMPLETED',
                    isPaid: true,
                    completedAt: { gte: startDate }
                },
                _sum: { totalAmount: true }
            }),
            // Previous period revenue
            prisma.booking.aggregate({
                where: {
                    status: 'COMPLETED',
                    isPaid: true,
                    completedAt: { gte: previousStartDate, lt: startDate }
                },
                _sum: { totalAmount: true }
            }),
            // Current period users
            prisma.user.count({
                where: { createdAt: { gte: startDate } }
            }),
            // Previous period users
            prisma.user.count({
                where: { createdAt: { gte: previousStartDate, lt: startDate } }
            }),
            // Current period bookings
            prisma.booking.count({
                where: { createdAt: { gte: startDate } }
            }),
            // Previous period bookings
            prisma.booking.count({
                where: { createdAt: { gte: previousStartDate, lt: startDate } }
            }),
            // Current period completed bookings
            prisma.booking.count({
                where: {
                    status: 'COMPLETED',
                    completedAt: { gte: startDate }
                }
            }),
            // Previous period completed bookings
            prisma.booking.count({
                where: {
                    status: 'COMPLETED',
                    completedAt: { gte: previousStartDate, lt: startDate }
                }
            }),
            // Total providers
            prisma.serviceProvider.count(),
            // Total clients
            prisma.client.count(),
            // Active disputes
            prisma.dispute.count({
                where: { status: 'OPEN' }
            }),
            // Pending verifications (providers without verification)
            prisma.serviceProvider.count({
                where: { isVerified: false }
            })
        ]);

        // Calculate metrics
        const currentRevenue = totalRevenue._sum.totalAmount || 0;
        const prevRevenue = previousRevenue._sum.totalAmount || 0;
        const revenueChange = prevRevenue > 0 ? ((currentRevenue - prevRevenue) / prevRevenue) * 100 : 0;

        const userChange = previousUsers > 0 ? ((totalUsers - previousUsers) / previousUsers) * 100 : 0;
        const bookingChange = previousBookings > 0 ? ((totalBookings - previousBookings) / previousBookings) * 100 : 0;

        // Calculate conversion rate (completed bookings / total bookings)
        const currentConversionRate = totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0;
        const previousConversionRate = previousBookings > 0 ? (previousCompletedBookings / previousBookings) * 100 : 0;
        const conversionChange = previousConversionRate > 0 ? currentConversionRate - previousConversionRate : 0;

        // Get top performing services by joining with Service table
        const topServicesData = await prisma.booking.findMany({
            where: {
                status: 'COMPLETED',
                isPaid: true,
                completedAt: { gte: startDate }
            },
            include: {
                Service: {
                    select: {
                        category: true,
                        name: true
                    }
                }
            }
        });

        // Get previous period data for growth calculation
        const previousTopServicesData = await prisma.booking.findMany({
            where: {
                status: 'COMPLETED',
                isPaid: true,
                completedAt: {
                    gte: previousStartDate,
                    lt: startDate
                }
            },
            include: {
                Service: {
                    select: {
                        category: true,
                        name: true
                    }
                }
            }
        });

        // Group current period by category
        const categoryStats = new Map<string, { count: number; revenue: number; services: Set<string> }>();

        topServicesData.forEach(booking => {
            const category = booking.Service?.category || 'Other';
            const serviceName = booking.Service?.name || 'Unknown Service';

            if (!categoryStats.has(category)) {
                categoryStats.set(category, { count: 0, revenue: 0, services: new Set() });
            }

            const stats = categoryStats.get(category)!;
            stats.count += 1;
            stats.revenue += booking.totalAmount;
            stats.services.add(serviceName);
        });

        // Group previous period by category
        const previousCategoryStats = new Map<string, { count: number; revenue: number; services: Set<string> }>();

        previousTopServicesData.forEach(booking => {
            const category = booking.Service?.category || 'Other';
            const serviceName = booking.Service?.name || 'Unknown Service';

            if (!previousCategoryStats.has(category)) {
                previousCategoryStats.set(category, { count: 0, revenue: 0, services: new Set() });
            }

            const stats = previousCategoryStats.get(category)!;
            stats.count += 1;
            stats.revenue += booking.totalAmount;
            stats.services.add(serviceName);
        });

        // Convert to array and sort by revenue with real growth calculation
        const topServices = Array.from(categoryStats.entries())
            .map(([category, stats]) => {
                const previousStats = previousCategoryStats.get(category);
                const previousRevenue = previousStats?.revenue || 0;

                // Calculate real growth percentage
                let growth = 0;
                if (previousRevenue > 0) {
                    growth = Math.round(((stats.revenue - previousRevenue) / previousRevenue) * 100 * 100) / 100;
                } else if (stats.revenue > 0) {
                    // If there's current revenue but no previous revenue, it's 100% growth
                    growth = 100;
                } else {
                    // If both periods have no revenue, growth is 0
                    growth = 0;
                }

                return {
                    name: category,
                    bookings: stats.count,
                    revenue: stats.revenue,
                    growth
                };
            })
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);

        // Get regional data
        const regionalData = await prisma.booking.groupBy({
            by: ['location'],
            where: {
                createdAt: { gte: startDate }
            },
            _count: { id: true },
            _sum: { totalAmount: true },
            orderBy: { _count: { id: 'desc' } },
            take: 5
        });

        const analytics = {
            metrics: [
                {
                    title: 'Total Revenue',
                    value: `GH₵${currentRevenue.toLocaleString()}`,
                    change: Math.round(revenueChange * 100) / 100,
                    changeType: revenueChange >= 0 ? 'increase' : 'decrease',
                    color: 'text-green-600'
                },
                {
                    title: 'Active Users',
                    value: (totalUsers + previousUsers).toLocaleString(),
                    change: Math.round(userChange * 100) / 100,
                    changeType: userChange >= 0 ? 'increase' : 'decrease',
                    color: 'text-blue-600'
                },
                {
                    title: 'Total Bookings',
                    value: totalBookings.toLocaleString(),
                    change: Math.round(bookingChange * 100) / 100,
                    changeType: bookingChange >= 0 ? 'increase' : 'decrease',
                    color: 'text-orange-600'
                },
                {
                    title: 'Conversion Rate',
                    value: `${Math.round(currentConversionRate * 100) / 100}%`,
                    change: Math.round(conversionChange * 100) / 100,
                    changeType: conversionChange >= 0 ? 'increase' : 'decrease',
                    color: 'text-purple-600'
                }
            ],
            topServices: topServices,
            regionData: regionalData.map(region => ({
                region: region.location || 'Unknown',
                bookings: region._count.id,
                revenue: region._sum.totalAmount || 0
            })),
            summary: {
                totalProviders: providersCount,
                totalClients: clientsCount,
                activeDisputes: disputesCount,
                pendingVerifications,
                currentRevenue,
                totalBookings,
                completedBookings,
                conversionRate: currentConversionRate
            }
        };

        console.log('✅ Admin Analytics: Data fetched successfully');
        return NextResponse.json(analytics);

    } catch (error) {
        console.error('❌ Admin Analytics Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch analytics data' },
            { status: 500 }
        );
    }
} 