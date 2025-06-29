import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

// DELETE /api/notifications/[id] - Delete a notification
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    console.log('=== DELETE NOTIFICATION API START ===');

    const tokenPayload = getCurrentUser(request);
    if (!tokenPayload?.userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const notificationId = params.id;
        console.log('Deleting notification:', notificationId);

        // Find the notification
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

        // Delete the notification
        await prisma.notification.delete({
            where: { id: notificationId }
        });

        console.log('✅ Notification deleted:', notificationId);

        return NextResponse.json({
            success: true,
            message: 'Notification deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting notification:', error);
        return NextResponse.json(
            { error: 'Failed to delete notification' },
            { status: 500 }
        );
    }
} 