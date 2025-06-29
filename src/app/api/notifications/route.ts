import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

// Mark this route as dynamic to handle headers during static generation
export const dynamic = 'force-dynamic';

// Helper function to get the correct entity ID for notifications
async function getEntityIdForNotification(userId: string, userType: 'CLIENT' | 'PROVIDER' | 'ADMIN'): Promise<string | null> {
    try {
        if (userType === 'CLIENT') {
            const clientProfile = await prisma.userClientProfile.findUnique({
                where: { userId },
                include: { Client: true }
            });
            return clientProfile?.Client?.id || null;
        } else if (userType === 'PROVIDER') {
            const providerProfile = await prisma.userProviderProfile.findUnique({
                where: { userId },
                include: { ServiceProvider: true }
            });
            return providerProfile?.ServiceProvider?.id || null;
        } else if (userType === 'ADMIN') {
            const adminProfile = await prisma.userAdminProfile.findUnique({
                where: { userId },
                include: { Admin: true }
            });
            return adminProfile?.Admin?.id || null;
        }
        return null;
    } catch (error) {
        console.error(`Failed to get entity ID for ${userType}:`, error);
        return null;
    }
}

// GET /api/notifications - Fetch user notifications
export async function GET(request: NextRequest) {
    console.log('=== NOTIFICATIONS API START ===');

    const tokenPayload = getCurrentUser(request);
    console.log('Token payload:', tokenPayload ? 'Found' : 'Missing');

    if (!tokenPayload?.userId) {
        console.log('Authentication failed - no token payload');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Get query parameters
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '20');
        const unreadOnly = searchParams.get('unreadOnly') === 'true';

        console.log('Fetching notifications for user:', tokenPayload.userId);

        // Build where clause
        const whereClause: any = {
            userId: tokenPayload.userId
        };

        if (unreadOnly) {
            whereClause.isRead = false;
        }

        // Get entity IDs for this user across all types
        const [clientEntityId, providerEntityId, adminEntityId] = await Promise.all([
            getEntityIdForNotification(tokenPayload.userId, 'CLIENT'),
            getEntityIdForNotification(tokenPayload.userId, 'PROVIDER'),
            getEntityIdForNotification(tokenPayload.userId, 'ADMIN')
        ]);

        const entityIds = [clientEntityId, providerEntityId, adminEntityId].filter((id): id is string => id !== null);

        if (entityIds.length === 0) {
            console.log('No entity IDs found for user:', tokenPayload.userId);
            return NextResponse.json({
                success: true,
                notifications: [],
                unreadCount: 0,
                total: 0
            });
        }

        console.log('Entity IDs found for user:', tokenPayload.userId, '=', entityIds);

        // Update where clause to use entity IDs
        whereClause.userId = { in: entityIds };

        // Fetch notifications
        const notifications = await prisma.notification.findMany({
            where: whereClause,
            orderBy: [
                { isRead: 'asc' }, // Unread first
                { createdAt: 'desc' } // Most recent first
            ],
            take: limit
        });

        console.log(`Found ${notifications.length} notifications`);

        // Count unread notifications
        const unreadCount = await prisma.notification.count({
            where: {
                userId: { in: entityIds },
                isRead: false
            }
        });

        console.log(`Unread count: ${unreadCount}`);

        return NextResponse.json({
            success: true,
            notifications,
            unreadCount,
            total: notifications.length
        });

    } catch (error) {
        console.error('Error fetching notifications:', error);
        return NextResponse.json(
            { error: 'Failed to fetch notifications' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    console.log('=== NOTIFICATIONS UPDATE API START ===');

    const tokenPayload = getCurrentUser(request);
    console.log('Token payload:', tokenPayload ? 'Found' : 'Missing');

    if (!tokenPayload?.userId) {
        console.log('Authentication failed - no token payload');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { notificationIds, markAsRead } = body;

        if (!Array.isArray(notificationIds) || typeof markAsRead !== 'boolean') {
            return NextResponse.json({ error: 'Invalid request format' }, { status: 400 });
        }

        // Update notifications
        const updateData: any = {
            isRead: markAsRead
        };

        if (markAsRead) {
            updateData.readAt = new Date();
        }

        await prisma.notification.updateMany({
            where: {
                id: { in: notificationIds },
                userId: tokenPayload.userId // Ensure user can only update their own notifications
            },
            data: updateData
        });

        return NextResponse.json({
            success: true,
            message: `Notifications marked as ${markAsRead ? 'read' : 'unread'}`
        });

    } catch (error) {
        console.error('Error updating notifications:', error);
        return NextResponse.json(
            { error: 'Failed to update notifications' },
            { status: 500 }
        );
    }
} 