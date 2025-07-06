import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        console.log('📞 DAILY_BOOKING_ROOM: Creating room for booking call');

        // Get current user
        const tokenPayload = getCurrentUser(request);
        if (!tokenPayload?.userId) {
            console.log('❌ DAILY_BOOKING_ROOM: Authentication failed');
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const { bookingId, callType, displayName } = await request.json();

        console.log('📋 DAILY_BOOKING_ROOM: Request details:', {
            bookingId,
            callType,
            displayName,
            userId: tokenPayload.userId
        });

        if (!bookingId || !callType) {
            return NextResponse.json(
                { error: 'bookingId and callType are required' },
                { status: 400 }
            );
        }

        // Resolve user profiles
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
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        const userClientId = userProfiles.UserClientProfile?.clientId;
        const userProviderId = userProfiles.UserProviderProfile?.providerId;

        console.log('👤 DAILY_BOOKING_ROOM: User profiles:', {
            userId: tokenPayload.userId,
            clientId: userClientId || 'None',
            providerId: userProviderId || 'None'
        });

        // Build access conditions
        const accessConditions = [];
        if (userClientId) {
            accessConditions.push({ clientId: userClientId });
        }
        if (userProviderId) {
            accessConditions.push({ providerId: userProviderId });
        }

        if (accessConditions.length === 0) {
            return NextResponse.json(
                { error: 'User has no valid profiles for booking access' },
                { status: 403 }
            );
        }

        // Validate booking access
        const booking = await prisma.booking.findFirst({
            where: {
                id: bookingId,
                OR: accessConditions,
                status: {
                    in: ['CONFIRMED', 'IN_PROGRESS'] // Allow calls for confirmed and in-progress bookings
                }
            },
            include: {
                Client: {
                    include: {
                        UserClientProfile: {
                            include: { User: true }
                        }
                    }
                },
                ServiceProvider: {
                    include: {
                        UserProviderProfile: {
                            include: { User: true }
                        }
                    }
                }
            }
        });

        if (!booking) {
            console.log('❌ DAILY_BOOKING_ROOM: Booking not found or access denied');
            return NextResponse.json(
                { error: 'Booking not found or access denied. Only confirmed/in-progress bookings allow calls.' },
                { status: 403 }
            );
        }

        console.log('✅ DAILY_BOOKING_ROOM: Booking access validated:', {
            bookingId: booking.id,
            status: booking.status,
            clientName: booking.Client?.UserClientProfile?.User?.name,
            providerName: booking.ServiceProvider?.UserProviderProfile?.User?.name
        });

        // Use environment variable for API key
        const apiKey = process.env.DAILY_API_KEY;

        if (!apiKey) {
            console.error('❌ DAILY_BOOKING_ROOM: Missing DAILY_API_KEY environment variable');
            return NextResponse.json(
                { error: 'Daily service not configured - missing API key' },
                { status: 500 }
            );
        }

        // Create Daily room
        const roomResponse = await fetch('https://api.daily.co/v1/rooms', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: `booking-${bookingId}-${Date.now()}`,
                properties: {
                    enable_chat: true,
                    enable_screenshare: true,
                    enable_recording: 'local',
                    max_participants: 2, // Client + Provider
                    start_video_off: callType === 'audio',
                    start_audio_off: false,
                    exp: Math.floor(Date.now() / 1000) + (4 * 60 * 60), // 4 hours expiry
                    enable_knocking: false, // Direct access for booking participants
                    enable_prejoin_ui: false, // Skip pre-join for smoother experience
                    lang: 'en'
                }
            })
        });

        if (!roomResponse.ok) {
            const errorData = await roomResponse.json();
            console.error('❌ DAILY_BOOKING_ROOM: Daily API error:', errorData);
            return NextResponse.json(
                { error: `Failed to create Daily room: ${roomResponse.status}`, details: errorData },
                { status: roomResponse.status }
            );
        }

        const roomData = await roomResponse.json();

        console.log('✅ DAILY_BOOKING_ROOM: Room created successfully:', {
            roomId: roomData.id,
            roomName: roomData.name,
            url: roomData.url,
            callType
        });

        return NextResponse.json({
            url: roomData.url,
            name: roomData.name,
            id: roomData.id,
            callType,
            booking: {
                id: booking.id,
                clientName: booking.Client?.UserClientProfile?.User?.name || 'Unknown Client',
                providerName: booking.ServiceProvider?.UserProviderProfile?.User?.name || 'Unknown Provider',
                status: booking.status
            }
        });

    } catch (error) {
        console.error('❌ DAILY_BOOKING_ROOM: Error creating room:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 