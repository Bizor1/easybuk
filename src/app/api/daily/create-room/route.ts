import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { roomName, properties } = await request.json();

        // Use environment variable for API key
        const apiKey = process.env.DAILY_API_KEY;

        if (!apiKey) {
            console.error('❌ DAILY_CREATE_ROOM: Missing DAILY_API_KEY environment variable');
            return NextResponse.json(
                { error: 'Daily service not configured - missing API key' },
                { status: 500 }
            );
        }

        const response = await fetch('https://api.daily.co/v1/rooms', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: roomName || `test-room-${Date.now()}`,
                properties: properties || {
                    enable_chat: true,
                    enable_screenshare: true,
                    enable_recording: 'local',
                    max_participants: 10,
                    start_video_off: false,
                    start_audio_off: false
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Daily API error:', errorData);
            return NextResponse.json(
                { error: `Failed to create room: ${response.status} ${response.statusText}`, details: errorData },
                { status: response.status }
            );
        }

        const room = await response.json();
        return NextResponse.json(room);

    } catch (error) {
        console.error('Error creating Daily room:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 