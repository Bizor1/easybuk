import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        console.log('🏠 DAILY_TEST: Creating test room');

        const { name, properties } = await request.json();

        // Use environment variable for API key
        const apiKey = process.env.DAILY_API_KEY;

        if (!apiKey) {
            console.error('❌ DAILY_TEST: Missing DAILY_API_KEY environment variable');
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
                name: name || `test-room-${Date.now()}`,
                properties: {
                    enable_chat: true,
                    enable_screenshare: true,
                    enable_recording: 'local',
                    max_participants: 10,
                    start_video_off: false,
                    start_audio_off: false,
                    exp: Math.floor(Date.now() / 1000) + (4 * 60 * 60), // 4 hours expiry
                    enable_knocking: false,
                    enable_prejoin_ui: false,
                    lang: 'en',
                    ...properties
                }
            })
        });

        if (!roomResponse.ok) {
            const errorData = await roomResponse.json();
            console.error('❌ DAILY_TEST: Daily API error:', errorData);
            return NextResponse.json(
                { error: `Failed to create Daily room: ${roomResponse.status}`, details: errorData },
                { status: roomResponse.status }
            );
        }

        const roomData = await roomResponse.json();

        console.log('✅ DAILY_TEST: Test room created successfully:', {
            roomId: roomData.id,
            roomName: roomData.name,
            url: roomData.url
        });

        return NextResponse.json({
            url: roomData.url,
            name: roomData.name,
            id: roomData.id,
            created_at: roomData.created_at,
            config: roomData.config
        });

    } catch (error) {
        console.error('❌ DAILY_TEST: Error creating test room:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 