import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

// PATCH /api/notifications/mark-all-read - Mark all notifications as read
export async function PATCH(request: NextRequest) {
    console.log('=== MARK ALL NOTIFICATIONS READ API START ===');

    const tokenPayload = getCurrentUser(request);
    if (!tokenPayload?.userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        console.log('Marking all notifications as read for user:', tokenPayload.userId);

        // Update all unread notifications for the user
        const updateResult = await prisma.notification.updateMany({
            where: {
                userId: tokenPayload.userId,
                isRead: false
            },
            data: {
                isRead: true
            }
        });

        console.log('✅ Marked', updateResult.count, 'notifications as read');

        return NextResponse.json({
            success: true,
            updatedCount: updateResult.count,
            message: `Marked ${updateResult.count} notifications as read`
        });

    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        return NextResponse.json(
            { error: 'Failed to mark all notifications as read' },
            { status: 500 }
        );
    }
} 