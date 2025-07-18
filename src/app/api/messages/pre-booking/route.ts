import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';
import { ContentFilterService } from '@/lib/content-filter';

// GET /api/messages/pre-booking - Get pre-booking conversations for a user
export async function GET(request: NextRequest) {
    try {
        const tokenPayload = getCurrentUser(request);
        if (!tokenPayload?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const providerId = searchParams.get('providerId');
        const clientId = searchParams.get('clientId');

        // Get user profiles to determine entity IDs
        const userWithProfiles = await prisma.user.findUnique({
            where: { id: tokenPayload.userId },
            include: {
                UserClientProfile: { include: { Client: true } },
                UserProviderProfile: { include: { ServiceProvider: true } }
            }
        });

        if (!userWithProfiles) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const userClientId = userWithProfiles.UserClientProfile?.Client?.id;
        const userProviderId = userWithProfiles.UserProviderProfile?.ServiceProvider?.id;

        // Build query conditions based on user type and requested conversation
        let whereCondition: any = {
            bookingId: null, // Pre-booking messages have no booking ID
        };

        if (providerId && userClientId) {
            // Client viewing conversation with specific provider
            whereCondition = {
                ...whereCondition,
                OR: [
                    { senderId: userClientId, receiverId: providerId },
                    { senderId: providerId, receiverId: userClientId }
                ]
            };
        } else if (clientId && userProviderId) {
            // Provider viewing conversation with specific client
            whereCondition = {
                ...whereCondition,
                OR: [
                    { senderId: userProviderId, receiverId: clientId },
                    { senderId: clientId, receiverId: userProviderId }
                ]
            };
        } else {
            // Get all pre-booking conversations for this user
            const userEntityIds = [];
            if (userClientId) userEntityIds.push(userClientId);
            if (userProviderId) userEntityIds.push(userProviderId);

            whereCondition = {
                ...whereCondition,
                OR: [
                    { senderId: { in: userEntityIds } },
                    { receiverId: { in: userEntityIds } }
                ]
            };
        }

        const messages = await prisma.message.findMany({
            where: whereCondition,
            orderBy: { createdAt: 'asc' }
        });

        return NextResponse.json({
            success: true,
            messages: messages,
            conversationType: 'pre-booking'
        });

    } catch (error) {
        console.error('Error fetching pre-booking messages:', error);
        return NextResponse.json(
            { error: 'Failed to fetch messages' },
            { status: 500 }
        );
    }
}

// POST /api/messages/pre-booking - Send pre-booking inquiry message
export async function POST(request: NextRequest) {
    try {
        const tokenPayload = getCurrentUser(request);
        if (!tokenPayload?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { providerId, content, messageType = 'TEXT' } = body;

        if (!providerId || !content?.trim()) {
            return NextResponse.json({
                error: 'Provider ID and message content are required'
            }, { status: 400 });
        }

        // Get user profiles
        const userWithProfiles = await prisma.user.findUnique({
            where: { id: tokenPayload.userId },
            include: {
                UserClientProfile: { include: { Client: true } },
                UserProviderProfile: { include: { ServiceProvider: true } }
            }
        });

        if (!userWithProfiles) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Determine sender details
        const isClient = !!userWithProfiles.UserClientProfile?.Client;
        const isProvider = !!userWithProfiles.UserProviderProfile?.ServiceProvider;

        if (!isClient && !isProvider) {
            return NextResponse.json({
                error: 'User must have either client or provider profile'
            }, { status: 400 });
        }

        // For pre-booking, typically clients message providers
        const senderId = isClient
            ? userWithProfiles.UserClientProfile!.Client!.id
            : userWithProfiles.UserProviderProfile!.ServiceProvider!.id;
        const senderType = isClient ? 'CLIENT' : 'PROVIDER';
        const receiverType = isClient ? 'PROVIDER' : 'CLIENT';

        // Verify provider exists
        const provider = await prisma.serviceProvider.findUnique({
            where: { id: providerId },
            include: {
                UserProviderProfile: {
                    include: { User: true }
                }
            }
        });

        if (!provider) {
            return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
        }

        // Enhanced content filtering for pre-booking (more strict)
        const filterResult = ContentFilterService.filterContent(content.trim());

        if (!filterResult.isAllowed) {
            // Log the violation
            await ContentFilterService.logViolation(
                tokenPayload.userId,
                'pre-booking-' + providerId,
                content,
                filterResult.violations,
                filterResult.riskScore
            );

            return NextResponse.json({
                error: 'Message blocked',
                reason: ContentFilterService.getWarningMessage(filterResult.violations),
                violations: filterResult.violations,
                helpText: 'Pre-booking messages are monitored to ensure quality service discussions. Contact information can be shared after booking confirmation.'
            }, { status: 400 });
        }

        // Create pre-booking message
        const messageId = `pre_msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        await prisma.message.create({
            data: {
                id: messageId,
                content: content.trim(),
                senderId: senderId,
                senderType: senderType,
                receiverId: providerId,
                receiverType: receiverType,
                bookingId: null, // Key: No booking ID for pre-booking messages
                messageType: messageType,
                attachments: [], // No attachments allowed in pre-booking
                isRead: false,
                flagged: filterResult.violations.length > 0,
                flagReason: filterResult.violations.length > 0 ? filterResult.violations.join(', ') : null,
                createdAt: new Date()
            }
        });

        // Get the created message
        const message = await prisma.message.findUnique({
            where: { id: messageId }
        });

        // Send notification to provider (using User ID)
        const receiverUserId = provider.UserProviderProfile?.userId;
        if (receiverUserId) {
            // Create notification for new pre-booking inquiry
            await prisma.notification.create({
                data: {
                    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    userId: receiverUserId,
                    userType: 'PROVIDER',
                    type: 'PRE_BOOKING_INQUIRY',
                    title: 'New Service Inquiry',
                    message: `${userWithProfiles.name || 'A client'} sent you a service inquiry`,
                    data: {
                        providerId: providerId,
                        senderId: senderId,
                        senderName: userWithProfiles.name,
                        messagePreview: content.slice(0, 100) + (content.length > 100 ? '...' : '')
                    },
                    isRead: false,
                    createdAt: new Date()
                }
            });
        }

        return NextResponse.json({
            success: true,
            message,
            messageText: 'Pre-booking inquiry sent successfully',
            restrictions: {
                fileSharing: false,
                videoCalls: false,
                contactSharing: false,
                note: 'Full communication features available after booking confirmation'
            }
        });

    } catch (error) {
        console.error('Error sending pre-booking message:', error);
        return NextResponse.json(
            { error: 'Failed to send message' },
            { status: 500 }
        );
    }
} 