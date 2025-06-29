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

        // Get provider ID from user
        const userProvider = await prisma.userProviderProfile.findUnique({
            where: { userId: tokenPayload.userId }
        });

        if (!userProvider) {
            return NextResponse.json({ error: 'Provider profile not found' }, { status: 404 });
        }

        const providerId = userProvider.providerId;

        // Get completed bookings for the last 12 months
        const now = new Date();
        const twelveMonthsAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1);

        const completedBookings = await prisma.booking.findMany({
            where: {
                providerId: providerId,
                status: 'COMPLETED',
                isPaid: true,
                escrowReleased: true, // Only count released earnings
                completedAt: {
                    gte: twelveMonthsAgo
                }
            },
            select: {
                totalAmount: true,
                commissionAmount: true,
                providerAmount: true,
                completedAt: true
            }
        });

        // Group earnings by month
        const monthlyData: { [key: string]: { amount: number; bookings: number } } = {};

        // Initialize last 12 months
        for (let i = 0; i < 12; i++) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            monthlyData[monthKey] = { amount: 0, bookings: 0 };
        }

        // Aggregate earnings by month
        completedBookings.forEach(booking => {
            if (booking.completedAt) {
                const monthKey = `${booking.completedAt.getFullYear()}-${String(booking.completedAt.getMonth() + 1).padStart(2, '0')}`;
                if (monthlyData[monthKey]) {
                    const providerEarning = booking.providerAmount || (booking.totalAmount - (booking.commissionAmount || booking.totalAmount * 0.05));
                    monthlyData[monthKey].amount += providerEarning;
                    monthlyData[monthKey].bookings += 1;
                }
            }
        });

        // Convert to array format expected by frontend
        const monthlyArray = Object.entries(monthlyData)
            .map(([monthKey, data]) => {
                const [year, month] = monthKey.split('-');
                const date = new Date(parseInt(year), parseInt(month) - 1);

                // Calculate growth compared to previous month
                const prevMonthKey = `${parseInt(month) === 1 ? parseInt(year) - 1 : parseInt(year)}-${String(parseInt(month) === 1 ? 12 : parseInt(month) - 1).padStart(2, '0')}`;
                const prevMonthData = monthlyData[prevMonthKey];
                const growth = prevMonthData && prevMonthData.amount > 0
                    ? ((data.amount - prevMonthData.amount) / prevMonthData.amount * 100)
                    : 0;

                return {
                    period: date.toLocaleDateString('en-US', { month: 'short' }),
                    amount: data.amount,
                    growth: Math.round(growth * 100) / 100, // Round to 2 decimal places
                    bookings: data.bookings
                };
            })
            .reverse() // Show oldest to newest
            .filter(item => item.amount > 0 || item.bookings > 0); // Only show months with activity

        return NextResponse.json(monthlyArray);

    } catch (error) {
        console.error('Error fetching monthly earnings:', error);
        return NextResponse.json(
            { error: 'Failed to fetch monthly earnings' },
            { status: 500 }
        );
    }
} 