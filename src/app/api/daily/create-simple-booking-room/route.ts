import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        console.log('📞 SIMPLE_BOOKING_ROOM: Creating simple room for booking call');

        // Get current user
        const tokenPayload = getCurrentUser(request);
        if (!tokenPayload?.userId) {
            console.log('❌ SIMPLE_BOOKING_ROOM: Authentication failed');
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const { bookingId, callType, displayName } = await request.json();

        console.log('📋 SIMPLE_BOOKING_ROOM: Request details:', {
            bookingId,
            callType,
            displayName,
            userId: tokenPayload.userId
        });

        if (!bookingId) {
            return NextResponse.json(
                { error: 'bookingId is required' },
                { status: 400 }
            );
        }

        // Simple booking validation - just check if user has access to this booking
        const booking = await prisma.booking.findFirst({
            where: {
                id: bookingId,
                OR: [
                    {
                        Client: {
                            UserClientProfile: {
                                userId: tokenPayload.userId
                            }
                        }
                    },
                    {
                        ServiceProvider: {
                            UserProviderProfile: {
                                userId: tokenPayload.userId
                            }
                        }
                    }
                ],
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
            console.log('❌ SIMPLE_BOOKING_ROOM: Booking not found or access denied');
            return NextResponse.json(
                { error: 'Booking not found or access denied. Only confirmed/in-progress bookings allow calls.' },
                { status: 403 }
            );
        }

        console.log('✅ SIMPLE_BOOKING_ROOM: Booking access validated');

        // Use environment variable for API key
        const apiKey = process.env.DAILY_API_KEY;

        if (!apiKey) {
            console.error('❌ SIMPLE_BOOKING_ROOM: Missing DAILY_API_KEY environment variable');
            return NextResponse.json(
                { error: 'Daily service not configured - missing API key' },
                { status: 500 }
            );
        }

        // Create Daily room - exactly like the test page
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
                    max_participants: 10,
                    start_video_off: callType === 'PHONE_CALL',
                    start_audio_off: false,
                    exp: Math.floor(Date.now() / 1000) + (4 * 60 * 60), // 4 hours expiry
                    enable_knocking: false,
                    enable_prejoin_ui: false,
                    lang: 'en'
                }
            })
        });

        if (!roomResponse.ok) {
            const errorData = await roomResponse.json();
            console.error('❌ SIMPLE_BOOKING_ROOM: Daily API error:', errorData);
            return NextResponse.json(
                { error: `Failed to create Daily room: ${roomResponse.status}`, details: errorData },
                { status: roomResponse.status }
            );
        }

        const roomData = await roomResponse.json();

        console.log('✅ SIMPLE_BOOKING_ROOM: Room created successfully:', {
            roomId: roomData.id,
            roomName: roomData.name,
            url: roomData.url,
            callType
        });

        // Return response exactly like the test page
        return NextResponse.json({
            url: roomData.url,
            name: roomData.name,
            id: roomData.id,
            created_at: roomData.created_at,
            config: roomData.config,
            booking: {
                id: booking.id,
                clientName: booking.Client?.UserClientProfile?.User?.name || 'Unknown Client',
                providerName: booking.ServiceProvider?.UserProviderProfile?.User?.name || 'Unknown Provider',
                status: booking.status
            }
        });

    } catch (error) {
        console.error('❌ SIMPLE_BOOKING_ROOM: Error creating room:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 