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

        // Calculate date ranges for current and previous periods
        const now = new Date();
        let startDate: Date;
        let previousStartDate: Date;
        let previousEndDate: Date;

        switch (period) {
            case '7days':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                previousEndDate = new Date(startDate.getTime() - 1);
                previousStartDate = new Date(previousEndDate.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case '3months':
                startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                previousEndDate = new Date(startDate.getTime() - 1);
                previousStartDate = new Date(previousEndDate.getTime() - 90 * 24 * 60 * 60 * 1000);
                break;
            case '1year':
                startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                previousEndDate = new Date(startDate.getTime() - 1);
                previousStartDate = new Date(previousEndDate.getTime() - 365 * 24 * 60 * 60 * 1000);
                break;
            default: // 30days
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                previousEndDate = new Date(startDate.getTime() - 1);
                previousStartDate = new Date(previousEndDate.getTime() - 30 * 24 * 60 * 60 * 1000);
        }

        console.log('📊 Provider Services Analytics: Fetching data for provider', provider.id, 'period:', period);

        // Get service performance data
        const serviceStats = await Promise.all(
            provider.Service.map(async (service) => {
                // Current period data
                const [bookings, revenue, completedBookings, avgRating] = await Promise.all([
                    // Total bookings for this service
                    prisma.booking.count({
                        where: {
                            serviceId: service.id,
                            providerId: provider.id,
                            createdAt: { gte: startDate }
                        }
                    }),
                    // Revenue for this service
                    prisma.booking.aggregate({
                        where: {
                            serviceId: service.id,
                            providerId: provider.id,
                            status: 'COMPLETED',
                            isPaid: true,
                            completedAt: { gte: startDate }
                        },
                        _sum: { totalAmount: true }
                    }),
                    // Completed bookings
                    prisma.booking.count({
                        where: {
                            serviceId: service.id,
                            providerId: provider.id,
                            status: 'COMPLETED',
                            completedAt: { gte: startDate }
                        }
                    }),
                    // Average rating for this service
                    prisma.review.aggregate({
                        where: {
                            providerId: provider.id,
                            Booking: {
                                serviceId: service.id
                            },
                            createdAt: { gte: startDate }
                        },
                        _avg: { overallRating: true }
                    })
                ]);

                // Previous period data for growth calculation
                const [previousBookings, previousRevenue] = await Promise.all([
                    // Previous period bookings
                    prisma.booking.count({
                        where: {
                            serviceId: service.id,
                            providerId: provider.id,
                            createdAt: {
                                gte: previousStartDate,
                                lte: previousEndDate
                            }
                        }
                    }),
                    // Previous period revenue
                    prisma.booking.aggregate({
                        where: {
                            serviceId: service.id,
                            providerId: provider.id,
                            status: 'COMPLETED',
                            isPaid: true,
                            completedAt: {
                                gte: previousStartDate,
                                lte: previousEndDate
                            }
                        },
                        _sum: { totalAmount: true }
                    })
                ]);

                const revenueAmount = revenue._sum.totalAmount || 0;
                const previousRevenueAmount = previousRevenue._sum.totalAmount || 0;
                const completionRate = bookings > 0 ? (completedBookings / bookings) * 100 : 0;
                const avgRatingValue = avgRating._avg.overallRating || 0;

                // Calculate real growth percentage based on revenue
                let growth = 0;
                if (previousRevenueAmount > 0) {
                    growth = Math.round(((revenueAmount - previousRevenueAmount) / previousRevenueAmount) * 100 * 100) / 100;
                } else if (revenueAmount > 0) {
                    // If there's current revenue but no previous revenue, it's 100% growth
                    growth = 100;
                } else {
                    // If both periods have no revenue, growth is 0
                    growth = 0;
                }

                return {
                    name: service.name,
                    bookings,
                    revenue: revenueAmount,
                    completedBookings,
                    completionRate: Math.round(completionRate * 100) / 100,
                    avgRating: Math.round(avgRatingValue * 10) / 10,
                    growth,
                    basePrice: service.basePrice,
                    category: service.category,
                    isActive: service.isActive,
                    // Additional debugging info (can be removed later)
                    previousRevenue: previousRevenueAmount,
                    previousBookings: previousBookings
                };
            })
        );

        // Sort by revenue (highest first)
        const topServices = serviceStats.sort((a, b) => b.revenue - a.revenue);

        console.log('✅ Provider Services Analytics: Data fetched successfully for', provider.Service.length, 'services');
        return NextResponse.json(topServices);

    } catch (error) {
        console.error('❌ Provider Services Analytics Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch provider services analytics' },
            { status: 500 }
        );
    }
} 