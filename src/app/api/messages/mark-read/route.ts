import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const tokenPayload = getCurrentUser(request);
        if (!tokenPayload?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { bookingId, providerId, conversationType } = await request.json();

        // For regular booking messages, bookingId is required
        // For pre-booking messages, providerId is required
        if (!bookingId && !providerId) {
            return NextResponse.json({
                error: 'Either Booking ID or Provider ID is required'
            }, { status: 400 });
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

        let updateResult;

        if (bookingId) {
            // Mark all unread messages in this booking as read for this user
            updateResult = await prisma.$executeRaw`
            UPDATE "Message"
            SET "isRead" = true, "readAt" = NOW()
            WHERE 
                "bookingId" = ${bookingId}
                AND "receiverId" = ANY(${entityIds}::text[])
                AND "isRead" = false
        `;

            // Also mark related message notifications as read
            await prisma.$executeRaw`
                UPDATE "Notification"
                SET "isRead" = true, "readAt" = NOW()
                WHERE 
                    "userId" = ${tokenPayload.userId}
                    AND "type" = 'MESSAGE_RECEIVED'
                    AND "data"::jsonb @> ${'{"bookingId":"' + bookingId + '"}'}::jsonb
                    AND "isRead" = false
            `;
        } else if (providerId) {
            // Mark all unread pre-booking messages from the other party as read for this user
            // providerId here represents the other participant in the conversation
            updateResult = await prisma.$executeRaw`
                UPDATE "Message"
                SET "isRead" = true, "readAt" = NOW()
                WHERE 
                    "bookingId" IS NULL
                    AND "senderId" = ${providerId}
                    AND "receiverId" = ANY(${entityIds}::text[])
                    AND "isRead" = false
            `;

            // Also mark related pre-booking inquiry notifications as read
            await prisma.$executeRaw`
                UPDATE "Notification"
                SET "isRead" = true, "readAt" = NOW()
                WHERE 
                    "userId" = ${tokenPayload.userId}
                    AND "type" = 'PRE_BOOKING_INQUIRY'
                    AND ("data"::jsonb @> ${'{"senderId":"' + providerId + '"}'}::jsonb OR "data"::jsonb @> ${'{"receiverId":"' + providerId + '"}'}::jsonb)
                    AND "isRead" = false
            `;
        }

        return NextResponse.json({
            success: true,
            message: 'Messages marked as read',
            messageType: bookingId ? 'booking' : 'pre-booking'
        });

    } catch (error) {
        console.error('Error marking messages as read:', error);
        return NextResponse.json(
            { error: 'Failed to mark messages as read' },
            { status: 500 }
        );
    }
} 