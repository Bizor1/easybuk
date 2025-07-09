import { prisma } from './prisma';

/**
 * Track when someone views a provider's profile
 */
export async function trackProfileView({
    providerId,
    viewerId = null,
    viewerType = 'GUEST',
    ipAddress = null,
    userAgent = null,
    referrer = null,
    source = 'direct'
}: {
    providerId: string;
    viewerId?: string | null;
    viewerType?: string;
    ipAddress?: string | null;
    userAgent?: string | null;
    referrer?: string | null;
    source?: string;
}) {
    try {
        // @ts-ignore - ProfileView table exists but types may need refresh
        await prisma.profileView.create({
            data: {
                providerId,
                viewerId,
                viewerType,
                ipAddress,
                userAgent,
                referrer,
                source,
                createdAt: new Date()
            }
        });
        console.log('✅ Profile view tracked for provider:', providerId);
    } catch (error) {
        console.error('❌ Error tracking profile view:', error);
    }
}

/**
 * Track when a message is sent (to measure response time later)
 */
export async function trackMessageSent({
    providerId,
    bookingId = null,
    clientId = null,
    messageType = 'GENERAL'
}: {
    providerId: string;
    bookingId?: string | null;
    clientId?: string | null;
    messageType?: string;
}) {
    try {
        const messageTracking = await prisma.messageResponseTime.create({
            data: {
                providerId,
                bookingId,
                clientId,
                messageSentAt: new Date(),
                messageType,
                isFirstResponse: false
            }
        });
        console.log('✅ Message sent tracked for provider:', providerId);
        return messageTracking.id;
    } catch (error) {
        console.error('❌ Error tracking message sent:', error);
        return null;
    }
}

/**
 * Track when a provider responds to a message
 */
export async function trackMessageResponse({
    messageTrackingId,
    responseAt = new Date()
}: {
    messageTrackingId: string;
    responseAt?: Date;
}) {
    try {
        const messageSent = await prisma.messageResponseTime.findUnique({
            where: { id: messageTrackingId }
        });

        if (!messageSent) {
            console.error('❌ Message tracking record not found:', messageTrackingId);
            return;
        }

        const responseTimeMs = responseAt.getTime() - messageSent.messageSentAt.getTime();

        await prisma.messageResponseTime.update({
            where: { id: messageTrackingId },
            data: {
                responseAt,
                responseTimeMs
            }
        });

        console.log('✅ Message response tracked. Response time:', Math.round(responseTimeMs / 1000), 'seconds');
    } catch (error) {
        console.error('❌ Error tracking message response:', error);
    }
}

/**
 * Get profile view analytics for a provider
 */
export async function getProfileViewAnalytics(providerId: string, startDate: Date) {
    try {
        const views = await prisma.profileView.count({
            where: {
                providerId,
                createdAt: { gte: startDate }
            }
        });

        const viewsBySource = await prisma.profileView.groupBy({
            by: ['source'],
            where: {
                providerId,
                createdAt: { gte: startDate }
            },
            _count: { id: true }
        });

        return {
            totalViews: views,
            viewsBySource: viewsBySource.map((item: any) => ({
                source: item.source || 'unknown',
                count: item._count.id
            }))
        };
    } catch (error) {
        console.error('❌ Error getting profile view analytics:', error);
        return { totalViews: 0, viewsBySource: [] };
    }
}

/**
 * Get response time analytics for a provider
 */
export async function getResponseTimeAnalytics(providerId: string, startDate: Date) {
    try {
        const responseStats = await prisma.messageResponseTime.aggregate({
            where: {
                providerId,
                responseAt: { not: null },
                messageSentAt: { gte: startDate }
            },
            _avg: { responseTimeMs: true },
            _count: { id: true }
        });

        const totalMessages = await prisma.messageResponseTime.count({
            where: {
                providerId,
                messageSentAt: { gte: startDate }
            }
        });

        const avgResponseTimeMs = responseStats._avg.responseTimeMs || 0;
        const responseCount = responseStats._count.id || 0;
        const responseRate = totalMessages > 0 ? (responseCount / totalMessages) * 100 : 0;

        return {
            avgResponseTimeMinutes: Math.round(avgResponseTimeMs / (1000 * 60)),
            responseRate: Math.round(responseRate),
            totalMessages,
            respondedMessages: responseCount
        };
    } catch (error) {
        console.error('❌ Error getting response time analytics:', error);
        return {
            avgResponseTimeMinutes: 0,
            responseRate: 0,
            totalMessages: 0,
            respondedMessages: 0
        };
    }
} 