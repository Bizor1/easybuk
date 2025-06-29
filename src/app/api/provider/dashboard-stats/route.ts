import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

// Mark this route as dynamic to handle headers during static generation
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const tokenPayload = getCurrentUser(request);

        if (!tokenPayload?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get provider profile using raw SQL to avoid foreign key issues
        const providerData = await prisma.$queryRaw`
      SELECT 
        sp.id as "providerId",
        sp.name,
        sp."totalEarnings",
        sp."completedBookings",
        sp.rating,
        sp."totalReviews"
      FROM "ServiceProvider" sp
      LEFT JOIN "UserProviderProfile" upp ON sp.id = upp."providerId"
      WHERE upp."userId" = ${tokenPayload.userId}
      LIMIT 1
    `;

        if (!providerData || (providerData as any[]).length === 0) {
            return NextResponse.json({ error: 'Provider profile not found' }, { status: 404 });
        }

        const provider = (providerData as any[])[0];

        // Get recent bookings count
        const recentBookingsData = await prisma.$queryRaw`
      SELECT COUNT(*) as count
      FROM "Booking"
      WHERE "providerId" = ${provider.providerId}
        AND "createdAt" >= NOW() - INTERVAL '30 days'
    `;

        const recentBookings = ((recentBookingsData as any[])[0]?.count || 0) as number;

        // Get pending bookings count
        const pendingBookingsData = await prisma.$queryRaw`
      SELECT COUNT(*) as count
      FROM "Booking"
      WHERE "providerId" = ${provider.providerId}
        AND status IN ('PENDING', 'CONFIRMED')
    `;

        const pendingBookings = ((pendingBookingsData as any[])[0]?.count || 0) as number;

        // Get this month's earnings
        const monthlyEarningsData = await prisma.$queryRaw`
      SELECT COALESCE(SUM(amount), 0) as earnings
      FROM "Transaction"
      WHERE "userId" = ${provider.providerId}
        AND type = 'ESCROW_RELEASE'
        AND status = 'COMPLETED'
        AND "createdAt" >= DATE_TRUNC('month', NOW())
    `;

        const monthlyEarnings = ((monthlyEarningsData as any[])[0]?.earnings || 0) as number;

        return NextResponse.json({
            success: true,
            stats: {
                totalEarnings: provider.totalEarnings || 0,
                completedBookings: provider.completedBookings || 0,
                rating: provider.rating || 0,
                totalReviews: provider.totalReviews || 0,
                recentBookings,
                pendingBookings,
                monthlyEarnings
            }
        });

    } catch (error) {
        console.error('Error fetching provider dashboard stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch dashboard stats' },
            { status: 500 }
        );
    }
} 