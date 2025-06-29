import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

// PATCH /api/notifications/[id]/read - Mark notification as read
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    console.log('=== MARK NOTIFICATION READ API START ===');

    const tokenPayload = getCurrentUser(request);
    if (!tokenPayload?.userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const notificationId = params.id;
        console.log('Marking notification as read:', notificationId);

        // Find and update the notification
        const notification = await prisma.notification.findUnique({
            where: { id: notificationId }
        });

        if (!notification) {
            return NextResponse.json(
                { error: 'Notification not found' },
                { status: 404 }
            );
        }

        // Verify ownership
        if (notification.userId !== tokenPayload.userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 403 }
            );
        }

        // Update notification as read
        const updatedNotification = await prisma.notification.update({
            where: { id: notificationId },
            data: { isRead: true }
        });

        console.log('✅ Notification marked as read:', notificationId);

        return NextResponse.json({
            success: true,
            notification: updatedNotification
        });

    } catch (error) {
        console.error('Error marking notification as read:', error);
        return NextResponse.json(
            { error: 'Failed to mark notification as read' },
            { status: 500 }
        );
    }
} 