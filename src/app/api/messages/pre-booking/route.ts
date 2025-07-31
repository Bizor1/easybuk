import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';
import { ContentFilterService } from '@/lib/content-filter';

// GET /api/messages/pre-booking - Get pre-booking conversations for a user
export async function GET(request: NextRequest) {
    try {
        console.log('=== GET Pre-booking Messages API Called ===');

        const tokenPayload = getCurrentUser(request);
        console.log('Token payload:', tokenPayload ? 'Valid' : 'Invalid');

        if (!tokenPayload?.userId) {
            console.log('Authentication failed - no valid token');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const providerId = searchParams.get('providerId');
        const clientId = searchParams.get('clientId');
        console.log('Request params:', { providerId, clientId });

        // Get user profiles to determine entity IDs
        console.log('Fetching user profiles for userId:', tokenPayload.userId);
        const userWithProfiles = await prisma.user.findUnique({
            where: { id: tokenPayload.userId },
            include: {
                UserClientProfile: { include: { Client: true } },
                UserProviderProfile: { include: { ServiceProvider: true } }
            }
        });

        if (!userWithProfiles) {
            console.log('User not found for ID:', tokenPayload.userId);
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        console.log('User profiles found:', {
            hasClientProfile: !!userWithProfiles.UserClientProfile,
            hasProviderProfile: !!userWithProfiles.UserProviderProfile
        });

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

        console.log('Query condition:', JSON.stringify(whereCondition, null, 2));

        const messages = await prisma.message.findMany({
            where: whereCondition,
            orderBy: { createdAt: 'asc' }
        });

        console.log('Messages found:', messages.length);

        return NextResponse.json({
            success: true,
            messages: messages,
            conversationType: 'pre-booking'
        });

    } catch (error) {
        console.error('Error in GET pre-booking messages:', error);
        console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');

        return NextResponse.json(
            { error: 'Failed to fetch messages', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

// POST /api/messages/pre-booking - Send pre-booking inquiry message
export async function POST(request: NextRequest) {
    try {
        console.log('=== POST Pre-booking Message API Called ===');

        const tokenPayload = getCurrentUser(request);
        console.log('Token payload:', tokenPayload ? 'Valid' : 'Invalid');

        if (!tokenPayload?.userId) {
            console.log('Authentication failed - no valid token');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log('Parsing request body...');
        const body = await request.json();
        const { providerId, clientId, content, messageType = 'TEXT' } = body;
        console.log('Request body:', { providerId, clientId, content: content?.slice(0, 50) + '...', messageType });

        if ((!providerId && !clientId) || !content?.trim()) {
            console.log('Validation failed: missing providerId/clientId or content');
            return NextResponse.json({
                error: 'Either Provider ID or Client ID and message content are required'
            }, { status: 400 });
        }

        // Get user profiles
        console.log('Fetching user profiles for userId:', tokenPayload.userId);
        const userWithProfiles = await prisma.user.findUnique({
            where: { id: tokenPayload.userId },
            include: {
                UserClientProfile: { include: { Client: true } },
                UserProviderProfile: { include: { ServiceProvider: true } }
            }
        });

        if (!userWithProfiles) {
            console.log('User not found for ID:', tokenPayload.userId);
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        console.log('User profiles found:', {
            userName: userWithProfiles.name,
            hasClientProfile: !!userWithProfiles.UserClientProfile,
            hasProviderProfile: !!userWithProfiles.UserProviderProfile
        });

        // Determine sender details
        const isClient = !!userWithProfiles.UserClientProfile?.Client;
        const isProvider = !!userWithProfiles.UserProviderProfile?.ServiceProvider;

        if (!isClient && !isProvider) {
            console.log('User has no client or provider profile');
            return NextResponse.json({
                error: 'User must have either client or provider profile'
            }, { status: 400 });
        }

        // Determine sender and receiver based on who is messaging whom
        let senderId: string;
        let receiverId: string;
        let senderType: 'CLIENT' | 'PROVIDER';
        let receiverType: 'CLIENT' | 'PROVIDER';
        let receiverUserId: string | undefined;

        if (providerId) {
            // Client is messaging a provider
            if (!isClient) {
                return NextResponse.json({ error: 'Only clients can initiate provider conversations' }, { status: 400 });
            }

            senderId = userWithProfiles.UserClientProfile!.Client!.id;
            receiverId = providerId;
            senderType = 'CLIENT';
            receiverType = 'PROVIDER';

            // Verify provider exists
            console.log('Verifying provider exists for ID:', providerId);
            const provider = await prisma.serviceProvider.findUnique({
                where: { id: providerId },
                include: {
                    UserProviderProfile: {
                        include: { User: true }
                    }
                }
            });

            if (!provider) {
                console.log('Provider not found for ID:', providerId);
                return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
            }

            receiverUserId = provider.UserProviderProfile?.userId;
            console.log('Provider found:', {
                providerName: provider.UserProviderProfile?.User?.name,
                hasUserProfile: !!provider.UserProviderProfile
            });
        } else if (clientId) {
            // Provider is replying to a client
            if (!isProvider) {
                return NextResponse.json({ error: 'Only providers can reply to client inquiries' }, { status: 400 });
            }

            senderId = userWithProfiles.UserProviderProfile!.ServiceProvider!.id;
            receiverId = clientId;
            senderType = 'PROVIDER';
            receiverType = 'CLIENT';

            // Verify client exists
            console.log('Verifying client exists for ID:', clientId);
            const client = await prisma.client.findUnique({
                where: { id: clientId },
                include: {
                    UserClientProfile: {
                        include: { User: true }
                    }
                }
            });

            if (!client) {
                console.log('Client not found for ID:', clientId);
                return NextResponse.json({ error: 'Client not found' }, { status: 404 });
            }

            receiverUserId = client.UserClientProfile?.userId;
            console.log('Client found:', {
                clientName: client.UserClientProfile?.User?.name,
                hasUserProfile: !!client.UserClientProfile
            });
        } else {
            return NextResponse.json({ error: 'Either providerId or clientId must be provided' }, { status: 400 });
        }

        console.log('Conversation details:', { senderId, receiverId, senderType, receiverType, receiverUserId });

        // Enhanced content filtering for pre-booking (more strict)
        console.log('Filtering content...');
        const filterResult = ContentFilterService.filterContent(content.trim());
        console.log('Filter result:', {
            isAllowed: filterResult.isAllowed,
            violations: filterResult.violations,
            riskScore: filterResult.riskScore
        });

        if (!filterResult.isAllowed) {
            console.log('Content blocked due to violations:', filterResult.violations);

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
        console.log('Creating message with ID:', messageId);

        const messageData = {
            id: messageId,
            content: content.trim(),
            senderId: senderId,
            senderType: senderType,
            receiverId: receiverId,
            receiverType: receiverType,
            bookingId: null, // Key: No booking ID for pre-booking messages
            messageType: messageType,
            attachments: [], // No attachments allowed in pre-booking
            isRead: false,
            flagged: filterResult.violations.length > 0,
            flagReason: filterResult.violations.length > 0 ? filterResult.violations.join(', ') : null,
            createdAt: new Date()
        };

        console.log('Message data:', JSON.stringify(messageData, null, 2));

        await prisma.message.create({
            data: messageData
        });

        console.log('Message created successfully');

        // Get the created message
        const message = await prisma.message.findUnique({
            where: { id: messageId }
        });

        console.log('Retrieved created message:', !!message);

        // Send notification to receiver (using User ID)
        console.log('Receiver User ID:', receiverUserId);

        if (receiverUserId) {
            console.log('Creating notification...');
            const notificationId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            // Create notification for new pre-booking message
            await prisma.notification.create({
                data: {
                    id: notificationId,
                    userId: receiverUserId,
                    userType: receiverType,
                    type: 'PRE_BOOKING_INQUIRY' as any, // Temporary fix for TypeScript
                    title: senderType === 'CLIENT' ? 'New Service Inquiry' : 'New Message Reply',
                    message: `${userWithProfiles.name || (senderType === 'CLIENT' ? 'A client' : 'A provider')} sent you a ${senderType === 'CLIENT' ? 'service inquiry' : 'message'}`,
                    data: {
                        conversationId: `${senderId}-${receiverId}`,
                        senderId: senderId,
                        receiverId: receiverId,
                        senderName: userWithProfiles.name,
                        messagePreview: content.slice(0, 100) + (content.length > 100 ? '...' : '')
                    },
                    isRead: false,
                    createdAt: new Date()
                }
            });

            console.log('Notification created successfully');
        }

        console.log('=== POST Pre-booking Message API Completed Successfully ===');

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
        console.error('Error in POST pre-booking message:', error);
        console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');

        return NextResponse.json(
            { error: 'Failed to send message', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
} 