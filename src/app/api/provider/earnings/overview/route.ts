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

        // Calculate date ranges
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const yearStart = new Date(now.getFullYear(), 0, 1);

        // Get all completed bookings for this provider
        const completedBookings = await prisma.booking.findMany({
            where: {
                providerId: providerId,
                status: 'COMPLETED',
                isPaid: true
            },
            select: {
                totalAmount: true,
                commissionAmount: true,
                providerAmount: true,
                completedAt: true,
                createdAt: true,
                escrowReleased: true
            }
        });

        // Get active pipeline (paid but not completed bookings)
        const pipelineBookings = await prisma.booking.findMany({
            where: {
                providerId: providerId,
                status: {
                    in: ['CONFIRMED', 'IN_PROGRESS']
                },
                isPaid: true
            },
            select: {
                totalAmount: true,
                commissionAmount: true,
                providerAmount: true,
                createdAt: true
            }
        });

        // Get pending escrow (completed but not released after 48 hours)
        const escrowBookings = await prisma.booking.findMany({
            where: {
                providerId: providerId,
                status: 'COMPLETED',
                isPaid: true,
                escrowReleased: false
            },
            select: {
                totalAmount: true,
                commissionAmount: true,
                providerAmount: true,
                completedAt: true
            }
        });

        // Calculate pending escrow amount
        const currentTime = now.getTime();
        let pendingEscrow = 0;
        let availableToRelease = 0;

        escrowBookings.forEach(booking => {
            const providerEarning = booking.providerAmount || (booking.totalAmount - (booking.commissionAmount || booking.totalAmount * 0.05));

            if (booking.completedAt) {
                const hoursSinceCompletion = (currentTime - booking.completedAt.getTime()) / (1000 * 60 * 60);
                if (hoursSinceCompletion >= 48) {
                    availableToRelease += providerEarning;
                } else {
                    pendingEscrow += providerEarning;
                }
            } else {
                pendingEscrow += providerEarning;
            }
        });

        // Calculate earnings by time period
        const todayEarnings = completedBookings
            .filter(b => b.completedAt && b.completedAt >= today && b.escrowReleased)
            .reduce((sum, b) => sum + (b.providerAmount || (b.totalAmount - (b.commissionAmount || b.totalAmount * 0.05))), 0);

        const weekEarnings = completedBookings
            .filter(b => b.completedAt && b.completedAt >= weekStart && b.escrowReleased)
            .reduce((sum, b) => sum + (b.providerAmount || (b.totalAmount - (b.commissionAmount || b.totalAmount * 0.05))), 0);

        const monthEarnings = completedBookings
            .filter(b => b.completedAt && b.completedAt >= monthStart && b.escrowReleased)
            .reduce((sum, b) => sum + (b.providerAmount || (b.totalAmount - (b.commissionAmount || b.totalAmount * 0.05))), 0);

        const yearEarnings = completedBookings
            .filter(b => b.completedAt && b.completedAt >= yearStart && b.escrowReleased)
            .reduce((sum, b) => sum + (b.providerAmount || (b.totalAmount - (b.commissionAmount || b.totalAmount * 0.05))), 0);

        const totalEarnings = completedBookings
            .filter(b => b.escrowReleased)
            .reduce((sum, b) => sum + (b.providerAmount || (b.totalAmount - (b.commissionAmount || b.totalAmount * 0.05))), 0);

        // Calculate growth (comparing with previous periods)
        const prevWeekStart = new Date(weekStart);
        prevWeekStart.setDate(weekStart.getDate() - 7);
        const prevWeekEnd = new Date(weekStart);

        const prevWeekEarnings = completedBookings
            .filter(b => b.completedAt && b.completedAt >= prevWeekStart && b.completedAt < prevWeekEnd && b.escrowReleased)
            .reduce((sum, b) => sum + (b.providerAmount || (b.totalAmount - (b.commissionAmount || b.totalAmount * 0.05))), 0);

        const weekGrowth = prevWeekEarnings > 0 ? ((weekEarnings - prevWeekEarnings) / prevWeekEarnings * 100) : 0;

        // Calculate pipeline value (paid but not completed)
        const pipelineValue = pipelineBookings.reduce((sum, booking) => {
            const providerEarning = booking.providerAmount || (booking.totalAmount - (booking.commissionAmount || booking.totalAmount * 0.05));
            return sum + providerEarning;
        }, 0);

        // Calculate available balance (released funds)
        const availableBalance = totalEarnings;

        // Calculate total earning power (available + pending + pipeline)
        const totalEarningPower = availableBalance + pendingEscrow + pipelineValue;

        // Calculate average per booking
        const totalBookings = completedBookings.filter(b => b.escrowReleased).length;
        const averagePerBooking = totalBookings > 0 ? totalEarnings / totalBookings : 0;

        const overview = {
            today: {
                amount: todayEarnings,
                bookings: completedBookings.filter(b => b.completedAt && b.completedAt >= today && b.escrowReleased).length,
                growth: 0 // Can calculate later if needed
            },
            week: {
                amount: weekEarnings,
                bookings: completedBookings.filter(b => b.completedAt && b.completedAt >= weekStart && b.escrowReleased).length,
                growth: weekGrowth
            },
            month: {
                amount: monthEarnings,
                bookings: completedBookings.filter(b => b.completedAt && b.completedAt >= monthStart && b.escrowReleased).length,
                growth: 0 // Can calculate later if needed
            },
            year: {
                amount: yearEarnings,
                bookings: completedBookings.filter(b => b.completedAt && b.completedAt >= yearStart && b.escrowReleased).length,
                growth: 0 // Can calculate later if needed
            },
            // Financial overview
            availableBalance: availableBalance,
            pendingEscrow: pendingEscrow,
            pipelineValue: pipelineValue,
            totalEarningPower: totalEarningPower,
            // Legacy fields (for compatibility)
            totalEarnings: totalEarnings,
            averagePerBooking: averagePerBooking,
            availableToRelease: availableToRelease,
            // Booking counts
            pipelineBookings: pipelineBookings.length,
            completedBookings: completedBookings.filter(b => b.escrowReleased).length,
            escrowBookings: completedBookings.filter(b => !b.escrowReleased).length
        };

        return NextResponse.json(overview);

    } catch (error) {
        console.error('Error fetching earnings overview:', error);
        return NextResponse.json(
            { error: 'Failed to fetch earnings overview' },
            { status: 500 }
        );
    }
} 