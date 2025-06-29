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

        // Get user's entity IDs (client and/or provider)
        const userWithProfiles = await prisma.user.findUnique({
            where: { id: tokenPayload.userId },
            include: {
                UserClientProfile: {
                    include: { Client: true }
                },
                UserProviderProfile: {
                    include: { ServiceProvider: true }
                }
            }
        });

        if (!userWithProfiles) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const entityIds = [];
        if (userWithProfiles.UserClientProfile?.Client) {
            entityIds.push(userWithProfiles.UserClientProfile.Client.id);
        }
        if (userWithProfiles.UserProviderProfile?.ServiceProvider) {
            entityIds.push(userWithProfiles.UserProviderProfile.ServiceProvider.id);
        }

        if (entityIds.length === 0) {
            return NextResponse.json({
                success: true,
                totalUnread: 0,
                unreadByBooking: {}
            });
        }

        // Get unread message counts by booking
        const unreadCounts = await prisma.$queryRaw`
            SELECT 
                "bookingId",
                COUNT(*) as "unreadCount"
            FROM "Message"
            WHERE 
                "receiverId" = ANY(${entityIds}::text[])
                AND "isRead" = false
                AND "bookingId" IS NOT NULL
            GROUP BY "bookingId"
        ` as Array<{ bookingId: string; unreadCount: bigint }>;

        // Convert bigint to number and create lookup object
        const unreadByBooking: Record<string, number> = {};
        let totalUnread = 0;

        unreadCounts.forEach(row => {
            const count = Number(row.unreadCount);
            unreadByBooking[row.bookingId] = count;
            totalUnread += count;
        });

        return NextResponse.json({
            success: true,
            totalUnread,
            unreadByBooking
        });

    } catch (error) {
        console.error('Error fetching unread message counts:', error);
        return NextResponse.json(
            { error: 'Failed to fetch unread message counts' },
            { status: 500 }
        );
    }
} 