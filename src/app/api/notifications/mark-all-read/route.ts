import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

// Helper function to get the correct entity ID for notifications (same as in route.ts)
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

// PATCH /api/notifications/mark-all-read - Mark all notifications as read
export async function PATCH(request: NextRequest) {
    console.log('=== MARK ALL NOTIFICATIONS READ API START ===');

    const tokenPayload = getCurrentUser(request);
    if (!tokenPayload?.userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        console.log('Marking all notifications as read for user:', tokenPayload.userId);

        // Get entity IDs for this user across all types (same logic as GET notifications)
        const [clientEntityId, providerEntityId, adminEntityId] = await Promise.all([
            getEntityIdForNotification(tokenPayload.userId, 'CLIENT'),
            getEntityIdForNotification(tokenPayload.userId, 'PROVIDER'),
            getEntityIdForNotification(tokenPayload.userId, 'ADMIN')
        ]);

        const entityIds = [tokenPayload.userId, clientEntityId, providerEntityId, adminEntityId].filter((id): id is string => id !== null);

        console.log('Entity IDs found for mark-all-read:', entityIds);

        // Update all unread notifications for the user and their entity IDs
        const updateResult = await prisma.notification.updateMany({
            where: {
                userId: { in: entityIds },
                isRead: false
            },
            data: {
                isRead: true,
                readAt: new Date()
            }
        });

        console.log('✅ Marked', updateResult.count, 'notifications as read');

        return NextResponse.json({
            success: true,
            updatedCount: updateResult.count,
            message: `Marked ${updateResult.count} notifications as read`,
            refresh: true // Signal to refresh notification components
        });

    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        return NextResponse.json(
            { error: 'Failed to mark all notifications as read' },
            { status: 500 }
        );
    }
} 