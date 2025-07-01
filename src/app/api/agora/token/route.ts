import { NextRequest, NextResponse } from 'next/server';
import { RtcTokenBuilder, RtcRole } from 'agora-access-token';
import { getCurrentUser } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        console.log('🎥 AGORA_TOKEN: Token generation request received');

        // Get current user
        const tokenPayload = getCurrentUser(request);
        if (!tokenPayload?.userId) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { bookingId, channelName } = body;

        if (!bookingId || !channelName) {
            return NextResponse.json(
                { error: 'bookingId and channelName are required' },
                { status: 400 }
            );
        }

        console.log('🔍 AGORA_TOKEN: Validating booking access for user:', tokenPayload.userId, 'bookingId:', bookingId);

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

        // Validate that user is part of this booking
        const booking = await prisma.booking.findFirst({
            where: {
                id: bookingId,
                OR: [
                    { clientId: tokenPayload.userId },
                    { providerId: tokenPayload.userId }
                ],
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
            console.log('❌ AGORA_TOKEN: Access denied. User:', tokenPayload.userId,
                'not authorized for booking:', bookingId,
                'or booking not in valid state (CONFIRMED/IN_PROGRESS)');

            // Additional debugging
            if (bookingInfo) {
                console.log('📋 AGORA_TOKEN: Booking exists but access denied. Checking criteria:');
                console.log('  - User matches clientId?', bookingInfo.clientId === tokenPayload.userId);
                console.log('  - User matches providerId?', bookingInfo.providerId === tokenPayload.userId);
                console.log('  - Status valid?', ['CONFIRMED', 'IN_PROGRESS'].includes(bookingInfo.status));
            }

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

        console.log('🎫 AGORA_TOKEN: Generating token for channel:', channelName);

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
        console.error('🚨 AGORA_TOKEN: Error generating token:', error);
        return NextResponse.json(
            { error: 'Failed to generate token' },
            { status: 500 }
        );
    }
} 