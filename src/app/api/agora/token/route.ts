import { NextRequest, NextResponse } from 'next/server';
import { RtcTokenBuilder, RtcRole } from 'agora-access-token';
import { getCurrentUser } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        console.log('🎥 AGORA_TOKEN: ===============================================');
        console.log('🎥 AGORA_TOKEN: Token generation request received');
        console.log('🎥 AGORA_TOKEN: Timestamp:', new Date().toISOString());

        // Get current user
        const tokenPayload = getCurrentUser(request);
        console.log('🔐 AGORA_TOKEN: Auth token payload:', {
            userId: tokenPayload?.userId || 'NONE',
            email: tokenPayload?.email || 'NONE',
            roles: tokenPayload?.roles || []
        });

        if (!tokenPayload?.userId) {
            console.log('❌ AGORA_TOKEN: Authentication failed - no valid token');
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { bookingId, channelName } = body;

        console.log('📋 AGORA_TOKEN: Request body:', {
            bookingId: bookingId || 'MISSING',
            channelName: channelName || 'MISSING'
        });

        if (!bookingId || !channelName) {
            console.log('❌ AGORA_TOKEN: Missing required parameters');
            return NextResponse.json(
                { error: 'bookingId and channelName are required' },
                { status: 400 }
            );
        }

        console.log('🔍 AGORA_TOKEN: Validating booking access for user:', tokenPayload.userId, 'bookingId:', bookingId);

        // First, resolve the user's client and provider profile IDs
        console.log('🔗 AGORA_TOKEN: Resolving user profile relationships...');
        const userProfiles = await prisma.user.findUnique({
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

        if (!userProfiles) {
            console.log('❌ AGORA_TOKEN: User not found:', tokenPayload.userId);
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        const userClientId = userProfiles.UserClientProfile?.clientId;
        const userProviderId = userProfiles.UserProviderProfile?.providerId;

        console.log('👤 AGORA_TOKEN: User profile resolution:', {
            userId: tokenPayload.userId,
            clientId: userClientId || 'None',
            providerId: userProviderId || 'None'
        });

        // First, let's find the booking without user restrictions to see what's there
        const bookingInfo = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                Client: true,
                ServiceProvider: true
            }
        });

        console.log('📋 AGORA_TOKEN: Booking found:', bookingInfo ? {
            id: bookingInfo.id,
            status: bookingInfo.status,
            clientId: bookingInfo.clientId,
            providerId: bookingInfo.providerId,
            clientName: bookingInfo.Client?.name,
            providerName: bookingInfo.ServiceProvider?.name
        } : 'NOT FOUND');

        // Build access conditions using resolved profile IDs
        const accessConditions = [];
        if (userClientId) {
            accessConditions.push({ clientId: userClientId });
        }
        if (userProviderId) {
            accessConditions.push({ providerId: userProviderId });
        }

        if (accessConditions.length === 0) {
            console.log('❌ AGORA_TOKEN: User has no client or provider profiles');
            return NextResponse.json(
                { error: 'User has no valid profiles for booking access' },
                { status: 403 }
            );
        }

        // Validate that user is part of this booking using resolved profile IDs
        const booking = await prisma.booking.findFirst({
            where: {
                id: bookingId,
                OR: accessConditions,
                status: {
                    in: ['CONFIRMED', 'IN_PROGRESS'] // Allow video calls for confirmed and in-progress bookings
                }
            },
            include: {
                Client: true,
                ServiceProvider: true
            }
        });

        if (!booking) {
            console.log('❌ AGORA_TOKEN: ===============================================');
            console.log('❌ AGORA_TOKEN: ACCESS DENIED - DETAILED ANALYSIS');
            console.log('❌ AGORA_TOKEN: User requesting access:', {
                userId: tokenPayload.userId,
                email: tokenPayload.email,
                roles: tokenPayload.roles
            });
            console.log('❌ AGORA_TOKEN: Booking requested:', bookingId);

            // Additional debugging
            if (bookingInfo) {
                console.log('📋 AGORA_TOKEN: Booking exists, analyzing why access was denied:');
                console.log('📋 AGORA_TOKEN: Booking details:', {
                    id: bookingInfo.id,
                    status: bookingInfo.status,
                    clientId: bookingInfo.clientId,
                    providerId: bookingInfo.providerId,
                    clientName: bookingInfo.Client?.name,
                    providerName: bookingInfo.ServiceProvider?.name
                });

                console.log('👤 AGORA_TOKEN: User profile analysis:', {
                    userId: tokenPayload.userId,
                    resolvedClientId: userClientId || 'NONE',
                    resolvedProviderId: userProviderId || 'NONE'
                });

                const clientIdMatch = userClientId && bookingInfo.clientId === userClientId;
                const providerIdMatch = userProviderId && bookingInfo.providerId === userProviderId;
                const statusValid = ['CONFIRMED', 'IN_PROGRESS'].includes(bookingInfo.status);

                console.log('🔍 AGORA_TOKEN: Access criteria check:');
                console.log('  ✓ User clientId matches booking clientId?', clientIdMatch,
                    `(${userClientId} === ${bookingInfo.clientId})`);
                console.log('  ✓ User providerId matches booking providerId?', providerIdMatch,
                    `(${userProviderId} === ${bookingInfo.providerId})`);
                console.log('  ✓ Status valid (CONFIRMED/IN_PROGRESS)?', statusValid, `(${bookingInfo.status})`);
                console.log('  ✓ User has client profile?', !!userClientId);
                console.log('  ✓ User has provider profile?', !!userProviderId);

                console.log('🎯 AGORA_TOKEN: REASON FOR DENIAL:', {
                    hasValidProfile: !!(userClientId || userProviderId),
                    isPartOfBooking: clientIdMatch || providerIdMatch,
                    bookingInValidStatus: statusValid,
                    overallAccess: (clientIdMatch || providerIdMatch) && statusValid
                });
            } else {
                console.log('📋 AGORA_TOKEN: Booking does not exist with ID:', bookingId);
            }

            console.log('❌ AGORA_TOKEN: ===============================================');
            return NextResponse.json(
                { error: 'Booking not found or access denied' },
                { status: 403 }
            );
        }

        // Check environment variables
        const appId = process.env.AGORA_KEY;
        const appCertificate = process.env.AGORA_SECRET;

        if (!appId || !appCertificate) {
            console.error('❌ AGORA_TOKEN: Missing Agora credentials');
            return NextResponse.json(
                { error: 'Agora service not configured' },
                { status: 500 }
            );
        }

        // Generate token parameters
        const uid = parseInt(tokenPayload.userId) || 0; // Use user ID as UID
        const role = RtcRole.PUBLISHER; // All participants can publish
        const expirationTimeInSeconds = 3600; // 1 hour
        const currentTimeStamp = Math.floor(Date.now() / 1000);
        const privilegeExpiredTs = currentTimeStamp + expirationTimeInSeconds;

        console.log('🎫 AGORA_TOKEN: Generating token with parameters:', {
            channelName,
            uid,
            role: 'PUBLISHER',
            expirationHours: 1,
            appId: appId ? `${appId.substring(0, 8)}...` : 'MISSING'
        });

        console.log('👥 AGORA_TOKEN: Booking participants being added to call:', {
            bookingId: booking.id,
            clientName: booking.Client.name,
            clientId: booking.clientId,
            providerName: booking.ServiceProvider.name,
            providerId: booking.providerId,
            requestingUser: tokenPayload.userId,
            requestingUserEmail: tokenPayload.email
        });

        // Generate the token
        const token = RtcTokenBuilder.buildTokenWithUid(
            appId,
            appCertificate,
            channelName,
            uid,
            role,
            privilegeExpiredTs
        );

        console.log('✅ AGORA_TOKEN: Token generated successfully');
        console.log('📦 AGORA_TOKEN: Response data:', {
            tokenLength: token.length,
            channelName,
            uid: uid.toString(),
            appId,
            bookingId: booking.id,
            expiresAt: new Date(privilegeExpiredTs * 1000).toISOString()
        });

        // Return token with participant info
        return NextResponse.json({
            token,
            channelName,
            uid: uid.toString(),
            appId,
            booking: {
                id: booking.id,
                clientName: booking.Client.name,
                providerName: booking.ServiceProvider.name
            },
            expiresAt: new Date(privilegeExpiredTs * 1000).toISOString()
        });

    } catch (error) {
        console.error('🚨 AGORA_TOKEN: ===============================================');
        console.error('🚨 AGORA_TOKEN: ERROR GENERATING TOKEN');
        console.error('🚨 AGORA_TOKEN: Error details:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : 'No stack trace',
            timestamp: new Date().toISOString()
        });
        console.error('🚨 AGORA_TOKEN: Full error object:', error);
        return NextResponse.json(
            { error: 'Failed to generate token' },
            { status: 500 }
        );
    }
} 