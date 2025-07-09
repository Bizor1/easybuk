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

        console.log('📊 Provider Clients Analytics: Fetching data for provider', provider.id, 'period:', period);

        // Get all bookings in the period
        const allBookings = await prisma.booking.findMany({
            where: {
                providerId: provider.id,
                createdAt: { gte: startDate }
            },
            include: {
                Client: true
            }
        });

        // Get unique clients
        const uniqueClients = new Map();
        allBookings.forEach(booking => {
            if (!uniqueClients.has(booking.clientId)) {
                uniqueClients.set(booking.clientId, {
                    client: booking.Client,
                    bookings: [],
                    totalSpent: 0,
                    completedBookings: 0
                });
            }

            const clientData = uniqueClients.get(booking.clientId);
            clientData.bookings.push(booking);

            if (booking.status === 'COMPLETED' && booking.isPaid) {
                clientData.totalSpent += booking.totalAmount;
                clientData.completedBookings++;
            }
        });

        // Calculate client metrics
        const newClients = Array.from(uniqueClients.values()).filter(clientData =>
            clientData.client.createdAt >= startDate
        ).length;

        const returningClients = Array.from(uniqueClients.values()).filter(clientData =>
            clientData.bookings.length > 1
        ).length;

        const totalClients = uniqueClients.size;
        const totalSpent = Array.from(uniqueClients.values()).reduce((sum, clientData) =>
            sum + clientData.totalSpent, 0
        );
        const avgClientValue = totalClients > 0 ? totalSpent / totalClients : 0;

        // Get client satisfaction from reviews
        const reviews = await prisma.review.findMany({
            where: {
                providerId: provider.id,
                createdAt: { gte: startDate }
            }
        });

        const avgSatisfaction = reviews.length > 0
            ? reviews.reduce((sum, review) => sum + review.overallRating, 0) / reviews.length
            : 0;
        const clientSatisfaction = Math.round((avgSatisfaction / 5) * 100); // Convert to percentage

        // Get top clients by value
        const topClients = Array.from(uniqueClients.values())
            .sort((a, b) => b.totalSpent - a.totalSpent)
            .slice(0, 5)
            .map(clientData => ({
                name: clientData.client.name || 'Anonymous',
                email: clientData.client.email,
                totalSpent: clientData.totalSpent,
                bookingsCount: clientData.bookings.length,
                completedBookings: clientData.completedBookings,
                joinDate: clientData.client.createdAt,
                lastBooking: Math.max(...clientData.bookings.map((b: any) => b.createdAt.getTime()))
            }));

        // Calculate retention metrics
        const clientRetentionRate = totalClients > 0 ? (returningClients / totalClients) * 100 : 0;
        const repeatBookingRate = allBookings.length > 0
            ? (allBookings.filter(b => {
                const clientBookings = allBookings.filter(cb => cb.clientId === b.clientId);
                return clientBookings.length > 1;
            }).length / allBookings.length) * 100
            : 0;

        const clientAnalytics = {
            newClients,
            returningClients,
            totalClients,
            avgClientValue: Math.round(avgClientValue * 100) / 100,
            clientSatisfaction,
            clientRetentionRate: Math.round(clientRetentionRate * 100) / 100,
            repeatBookingRate: Math.round(repeatBookingRate * 100) / 100,
            topClients,
            insights: {
                mostActiveMonth: 'Current', // Could calculate this with more data
                avgBookingsPerClient: totalClients > 0 ? Math.round((allBookings.length / totalClients) * 100) / 100 : 0,
                totalReviews: reviews.length,
                avgRating: Math.round(avgSatisfaction * 10) / 10
            }
        };

        console.log('✅ Provider Clients Analytics: Data fetched successfully');
        return NextResponse.json(clientAnalytics);

    } catch (error) {
        console.error('❌ Provider Clients Analytics Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch provider clients analytics' },
            { status: 500 }
        );
    }
} 