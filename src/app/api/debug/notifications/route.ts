import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    const tokenPayload = getCurrentUser(request);
    if (!tokenPayload?.userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Get entity IDs for this user across all types
        const [clientProfile, providerProfile, adminProfile] = await Promise.all([
            prisma.userClientProfile.findUnique({
                where: { userId: tokenPayload.userId },
                include: { Client: true }
            }),
            prisma.userProviderProfile.findUnique({
                where: { userId: tokenPayload.userId },
                include: { ServiceProvider: true }
            }),
            prisma.userAdminProfile.findUnique({
                where: { userId: tokenPayload.userId },
                include: { Admin: true }
            })
        ]);

        const entityIds = [
            tokenPayload.userId,
            clientProfile?.Client?.id,
            providerProfile?.ServiceProvider?.id,
            adminProfile?.Admin?.id
        ].filter((id): id is string => id !== null);

        // Get all unread notifications for this user
        const unreadNotifications = await prisma.notification.findMany({
            where: {
                userId: { in: entityIds },
                isRead: false
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Get total count using different methods to compare
        const unreadCountEntityIds = await prisma.notification.count({
            where: {
                userId: { in: entityIds },
                isRead: false
            }
        });

        const unreadCountUserIdOnly = await prisma.notification.count({
            where: {
                userId: tokenPayload.userId,
                isRead: false
            }
        });

        return NextResponse.json({
            success: true,
            user: {
                id: tokenPayload.userId,
                entityIds: {
                    user: tokenPayload.userId,
                    client: clientProfile?.Client?.id || null,
                    provider: providerProfile?.ServiceProvider?.id || null,
                    admin: adminProfile?.Admin?.id || null
                }
            },
            counts: {
                unreadWithEntityIds: unreadCountEntityIds,
                unreadWithUserIdOnly: unreadCountUserIdOnly
            },
            unreadNotifications: unreadNotifications.map(notification => ({
                id: notification.id,
                userId: notification.userId,
                type: notification.type,
                title: notification.title,
                message: notification.message,
                isRead: notification.isRead,
                createdAt: notification.createdAt,
                data: notification.data && typeof notification.data === 'string' ? JSON.parse(notification.data) : notification.data
            }))
        });

    } catch (error) {
        console.error('Error in notifications debug:', error);
        return NextResponse.json(
            { error: 'Failed to debug notifications' },
            { status: 500 }
        );
    }
} 