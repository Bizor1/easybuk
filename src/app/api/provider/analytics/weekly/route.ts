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
                ServiceProvider: true
            }
        });

        if (!userProviderProfile?.ServiceProvider) {
            return NextResponse.json({ error: 'Provider profile not found' }, { status: 404 });
        }

        const provider = userProviderProfile.ServiceProvider;

        const { searchParams } = new URL(request.url);
        const period = searchParams.get('period') || '30days';

        // Calculate periods for weekly data
        const now = new Date();
        let startDate: Date;
        let intervals: string[] = [];

        switch (period) {
            case '7days':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                // Generate last 7 days
                for (let i = 6; i >= 0; i--) {
                    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
                    intervals.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
                }
                break;
            case '3months':
                startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                // Generate last 12 weeks
                for (let i = 11; i >= 0; i--) {
                    intervals.push(`Week ${12 - i}`);
                }
                break;
            case '1year':
                startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                // Generate last 12 months
                for (let i = 11; i >= 0; i--) {
                    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
                    intervals.push(date.toLocaleDateString('en-US', { month: 'short' }));
                }
                break;
            default: // 30days
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                // Generate last 4 weeks
                for (let i = 3; i >= 0; i--) {
                    intervals.push(`Week ${4 - i}`);
                }
        }

        console.log('📊 Provider Weekly Analytics: Fetching data for provider', provider.id, 'period:', period);

        // Get weekly revenue and booking data
        const weeklyData = await Promise.all(intervals.map(async (interval, index) => {
            let periodStart: Date;
            let periodEnd: Date;

            if (period === '7days') {
                // Daily data
                periodStart = new Date(now.getTime() - (6 - index) * 24 * 60 * 60 * 1000);
                periodStart.setHours(0, 0, 0, 0);
                periodEnd = new Date(periodStart.getTime() + 24 * 60 * 60 * 1000);
            } else if (period === '3months') {
                // Weekly data
                periodStart = new Date(now.getTime() - (11 - index) * 7 * 24 * 60 * 60 * 1000);
                periodEnd = new Date(periodStart.getTime() + 7 * 24 * 60 * 60 * 1000);
            } else if (period === '1year') {
                // Monthly data
                periodStart = new Date(now.getFullYear(), now.getMonth() - (11 - index), 1);
                periodEnd = new Date(now.getFullYear(), now.getMonth() - (11 - index) + 1, 1);
            } else {
                // 30days - weekly data
                periodStart = new Date(now.getTime() - (3 - index) * 7 * 24 * 60 * 60 * 1000);
                periodEnd = new Date(periodStart.getTime() + 7 * 24 * 60 * 60 * 1000);
            }

            // Fetch data for this period
            const [bookingCount, revenueData, profileViews, avgRating] = await Promise.all([
                prisma.booking.count({
                    where: {
                        providerId: provider.id,
                        createdAt: { gte: periodStart, lt: periodEnd }
                    }
                }),
                prisma.booking.aggregate({
                    where: {
                        providerId: provider.id,
                        status: 'COMPLETED',
                        isPaid: true,
                        completedAt: { gte: periodStart, lt: periodEnd }
                    },
                    _sum: { totalAmount: true }
                }),
                // Get real profile views for this period
                prisma.profileView.count({
                    where: {
                        providerId: provider.id,
                        createdAt: { gte: periodStart, lt: periodEnd }
                    }
                }),
                // Get real average rating for this period
                prisma.review.aggregate({
                    where: {
                        providerId: provider.id,
                        createdAt: { gte: periodStart, lt: periodEnd }
                    },
                    _avg: { overallRating: true }
                })
            ]);

            return {
                period: interval,
                views: profileViews,
                bookings: bookingCount,
                revenue: revenueData._sum.totalAmount || 0,
                rating: Math.round((avgRating._avg.overallRating || provider.rating || 0) * 10) / 10
            };
        }));

        console.log('✅ Provider Weekly Analytics: Data fetched successfully for', intervals.length, 'periods');
        return NextResponse.json(weeklyData);

    } catch (error) {
        console.error('❌ Provider Weekly Analytics Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch provider weekly analytics' },
            { status: 500 }
        );
    }
} 