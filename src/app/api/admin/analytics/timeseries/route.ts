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

        // Calculate date ranges and intervals
        const now = new Date();
        let startDate: Date;
        let interval: 'day' | 'week' | 'month';
        let periods: string[] = [];

        switch (timeRange) {
            case '7d':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                interval = 'day';
                // Generate last 7 days
                for (let i = 6; i >= 0; i--) {
                    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
                    periods.push(date.toISOString().split('T')[0]);
                }
                break;
            case '90d':
                startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                interval = 'week';
                // Generate last 12 weeks
                for (let i = 11; i >= 0; i--) {
                    const date = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
                    periods.push(`Week ${12 - i}`);
                }
                break;
            case '1y':
                startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                interval = 'month';
                // Generate last 12 months
                for (let i = 11; i >= 0; i--) {
                    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
                    periods.push(date.toLocaleDateString('en-US', { month: 'short' }));
                }
                break;
            default: // 30d
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                interval = 'week';
                // Generate last 4 weeks
                for (let i = 3; i >= 0; i--) {
                    const date = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
                    periods.push(`Week ${4 - i}`);
                }
        }

        console.log('📊 Admin Time Series: Fetching data for', timeRange, 'with', interval, 'intervals');

        // Get revenue data over time
        const revenueData = await prisma.$queryRaw`
            SELECT 
                DATE_TRUNC(${interval}, "completedAt") as period,
                SUM("totalAmount") as revenue,
                COUNT(*) as bookings
            FROM "Booking"
            WHERE "status" = 'COMPLETED' 
                AND "isPaid" = true 
                AND "completedAt" >= ${startDate}
            GROUP BY DATE_TRUNC(${interval}, "completedAt")
            ORDER BY period ASC
        `;

        // Get user registration data over time
        const userRegistrationData = await prisma.$queryRaw`
            SELECT 
                DATE_TRUNC(${interval}, "createdAt") as period,
                COUNT(*) as new_users,
                COUNT(CASE WHEN 'CLIENT' = ANY(roles) THEN 1 END) as new_clients,
                COUNT(CASE WHEN 'PROVIDER' = ANY(roles) THEN 1 END) as new_providers
            FROM "User"
            WHERE "createdAt" >= ${startDate}
            GROUP BY DATE_TRUNC(${interval}, "createdAt")
            ORDER BY period ASC
        `;

        // Get booking requests over time (all statuses)
        const bookingRequestData = await prisma.$queryRaw`
            SELECT 
                DATE_TRUNC(${interval}, "createdAt") as period,
                COUNT(*) as total_bookings,
                COUNT(CASE WHEN "status" = 'COMPLETED' THEN 1 END) as completed_bookings,
                COUNT(CASE WHEN "status" = 'CANCELLED' THEN 1 END) as cancelled_bookings,
                COUNT(CASE WHEN "status" = 'PENDING' THEN 1 END) as pending_bookings
            FROM "Booking"
            WHERE "createdAt" >= ${startDate}
            GROUP BY DATE_TRUNC(${interval}, "createdAt")
            ORDER BY period ASC
        `;

        // Process and format the data for frontend consumption
        const timeSeriesData = periods.map((period, index) => {
            // Find matching data for this period
            const revenue = (revenueData as any[]).find(d => {
                if (interval === 'day') {
                    return new Date(d.period).toISOString().split('T')[0] === period;
                } else if (interval === 'week') {
                    // For weeks, we'll match by index since we generated them sequentially
                    return (revenueData as any[]).indexOf(d) === index;
                } else {
                    // For months, match by month name
                    return new Date(d.period).toLocaleDateString('en-US', { month: 'short' }) === period;
                }
            });

            const users = (userRegistrationData as any[]).find(d => {
                if (interval === 'day') {
                    return new Date(d.period).toISOString().split('T')[0] === period;
                } else if (interval === 'week') {
                    return (userRegistrationData as any[]).indexOf(d) === index;
                } else {
                    return new Date(d.period).toLocaleDateString('en-US', { month: 'short' }) === period;
                }
            });

            const bookings = (bookingRequestData as any[]).find(d => {
                if (interval === 'day') {
                    return new Date(d.period).toISOString().split('T')[0] === period;
                } else if (interval === 'week') {
                    return (bookingRequestData as any[]).indexOf(d) === index;
                } else {
                    return new Date(d.period).toLocaleDateString('en-US', { month: 'short' }) === period;
                }
            });

            return {
                period,
                revenue: Number(revenue?.revenue || 0),
                bookings: Number(bookings?.total_bookings || 0),
                completedBookings: Number(bookings?.completed_bookings || 0),
                cancelledBookings: Number(bookings?.cancelled_bookings || 0),
                pendingBookings: Number(bookings?.pending_bookings || 0),
                newUsers: Number(users?.new_users || 0),
                newClients: Number(users?.new_clients || 0),
                newProviders: Number(users?.new_providers || 0)
            };
        });

        // Calculate user growth data for the chart
        const userGrowthData = periods.map((period, index) => {
            const currentData = timeSeriesData[index];
            return {
                month: period,
                clients: currentData.newClients,
                providers: currentData.newProviders
            };
        });

        console.log('✅ Admin Time Series: Data fetched successfully for', periods.length, 'periods');

        return NextResponse.json({
            timeSeriesData,
            userGrowthData,
            interval,
            periods,
            summary: {
                totalRevenue: timeSeriesData.reduce((sum, d) => sum + d.revenue, 0),
                totalBookings: timeSeriesData.reduce((sum, d) => sum + d.bookings, 0),
                totalUsers: timeSeriesData.reduce((sum, d) => sum + d.newUsers, 0),
                avgConversionRate: timeSeriesData.length > 0
                    ? timeSeriesData.reduce((sum, d) => {
                        const rate = d.bookings > 0 ? (d.completedBookings / d.bookings) * 100 : 0;
                        return sum + rate;
                    }, 0) / timeSeriesData.length
                    : 0
            }
        });

    } catch (error) {
        console.error('❌ Admin Time Series Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch time series data' },
            { status: 500 }
        );
    }
} 