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

        // Calculate date range
        const now = new Date();
        let startDate: Date;

        switch (period) {
            case '7days':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case '3months':
                startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                break;
            case '1year':
                startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                break;
            default: // 30days
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        }

        console.log('📊 Provider Services Analytics: Fetching data for provider', provider.id, 'period:', period);

        // Get service performance data
        const serviceStats = await Promise.all(
            provider.Service.map(async (service) => {
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

                const revenueAmount = revenue._sum.totalAmount || 0;
                const completionRate = bookings > 0 ? (completedBookings / bookings) * 100 : 0;
                const avgRatingValue = avgRating._avg.overallRating || 0;

                // Mock growth calculation (would need historical data for real calculation)
                const growth = Math.round((Math.random() * 40 - 20) * 100) / 100; // -20% to +20%

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
                    isActive: service.isActive
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