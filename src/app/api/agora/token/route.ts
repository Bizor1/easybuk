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

            // Collect debug information
            const debugInfo: any = {
                timestamp: new Date().toISOString(),
                user: {
                    userId: tokenPayload.userId,
                    email: tokenPayload.email,
                    roles: tokenPayload.roles
                },
                requestedBookingId: bookingId,
                profileResolution: {
                    userId: tokenPayload.userId,
                    resolvedClientId: userClientId || 'NONE',
                    resolvedProviderId: userProviderId || 'NONE'
                }
            };

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

                // Add booking info to debug response
                debugInfo.booking = {
                    exists: true,
                    id: bookingInfo.id,
                    status: bookingInfo.status,
                    clientId: bookingInfo.clientId,
                    providerId: bookingInfo.providerId,
                    clientName: bookingInfo.Client?.name,
                    providerName: bookingInfo.ServiceProvider?.name
                };

                debugInfo.accessCheck = {
                    userClientIdMatchesBookingClientId: clientIdMatch,
                    userProviderIdMatchesBookingProviderId: providerIdMatch,
                    statusValid: statusValid,
                    userHasClientProfile: !!userClientId,
                    userHasProviderProfile: !!userProviderId,
                    reasonForDenial: {
                        hasValidProfile: !!(userClientId || userProviderId),
                        isPartOfBooking: clientIdMatch || providerIdMatch,
                        bookingInValidStatus: statusValid,
                        overallAccessShouldBe: (clientIdMatch || providerIdMatch) && statusValid
                    }
                };
            } else {
                console.log('📋 AGORA_TOKEN: Booking does not exist with ID:', bookingId);
                debugInfo.booking = {
                    exists: false,
                    requestedId: bookingId
                };
            }

            console.log('❌ AGORA_TOKEN: ===============================================');

            // Return debug info in response for easier diagnosis
            return NextResponse.json(
                {
                    error: 'Booking not found or access denied',
                    debug: debugInfo
                },
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

        // Generate token
        const uid = Math.floor(Math.random() * 1000000);
        const expirationTimeInSeconds = 3600; // 1 hour
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

        const token = RtcTokenBuilder.buildTokenWithUid(
            appId,
            appCertificate,
            channelName,
            uid,
            RtcRole.PUBLISHER,
            privilegeExpiredTs
        );

        console.log('✅ AGORA_TOKEN: Token generated successfully for user:', tokenPayload.userId);
        console.log('🎥 AGORA_TOKEN: Channel:', channelName, 'UID:', uid);
        console.log('🎥 AGORA_TOKEN: ===============================================');

        return NextResponse.json({
            token,
            channelName,
            uid: uid.toString(),
            booking: {
                id: booking.id,
                clientName: booking.Client?.name || 'Unknown Client',
                providerName: booking.ServiceProvider?.name || 'Unknown Provider'
            }
        });

    } catch (error: any) {
        console.log('❌ AGORA_TOKEN: ERROR:', error.message);
        console.log('🎥 AGORA_TOKEN: ===============================================');
        return NextResponse.json(
            { error: 'Failed to generate video call token' },
            { status: 500 }
        );
    }
} 