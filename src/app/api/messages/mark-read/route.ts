import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const tokenPayload = getCurrentUser(request);
        if (!tokenPayload?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { bookingId } = await request.json();
        if (!bookingId) {
            return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
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
            return NextResponse.json({ error: 'No profile found' }, { status: 404 });
        }

        // Mark all unread messages in this booking as read for this user
        const updateResult = await prisma.$executeRaw`
            UPDATE "Message"
            SET "isRead" = true, "readAt" = NOW()
            WHERE 
                "bookingId" = ${bookingId}
                AND "receiverId" = ANY(${entityIds}::text[])
                AND "isRead" = false
        `;

        return NextResponse.json({
            success: true,
            message: 'Messages marked as read'
        });

    } catch (error) {
        console.error('Error marking messages as read:', error);
        return NextResponse.json(
            { error: 'Failed to mark messages as read' },
            { status: 500 }
        );
    }
} 