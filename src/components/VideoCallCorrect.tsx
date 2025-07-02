'use client';

import React, { useEffect, useRef, useState } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';

interface VideoCallProps {
    bookingId: string;
    displayName: string;
    onCallEnd: () => void;
    onCallStart: () => void;
}

export default function VideoCallCorrect({ bookingId, displayName, onCallEnd, onCallStart }: VideoCallProps) {
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const clientRef = useRef<any>(null);
    const localVideoRef = useRef<HTMLDivElement>(null);
    const remoteVideoRef = useRef<HTMLDivElement>(null);
    const localTracksRef = useRef<any[]>([]);

    useEffect(() => {
        const initializeCall = async () => {
            try {
                console.log('🚀 INITIALIZING AGORA WEB SDK');

                // 1. Fetch token from your API
                const response = await fetch('/api/agora/token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        bookingId: bookingId,
                        channelName: `booking_${bookingId}`
                    })
                });

                if (!response.ok) {
                    throw new Error(`Failed to get token: ${response.status}`);
                }

                const tokenData = await response.json();
                console.log('✅ Token received:', tokenData);

                // 2. Create Agora client (Web SDK)
                const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
                clientRef.current = client;

                // 3. Set up event handlers
                client.on("user-published", async (user: any, mediaType: "audio" | "video" | "datachannel") => {
                    console.log('👤 User joined:', user.uid, mediaType);
                    await client.subscribe(user, mediaType);

                    if (mediaType === "video" && remoteVideoRef.current) {
                        user.videoTrack.play(remoteVideoRef.current);
                    }
                    if (mediaType === "audio") {
                        user.audioTrack.play();
                    }
                });

                client.on("user-unpublished", (user: any, mediaType: "audio" | "video" | "datachannel") => {
                    console.log('👤 User left:', user.uid, mediaType);
                });

                // 4. Create local tracks
                const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
                localTracksRef.current = [audioTrack, videoTrack];

                // 5. Play local video
                if (localVideoRef.current) {
                    videoTrack.play(localVideoRef.current);
                }

                // 6. Join channel with token (hard-coded App ID for testing)
                const hardCodedAppId = "18b6d08f950a48d9bc49814dda728562";
                console.log('🔑 Using hard-coded App ID:', hardCodedAppId);

                await client.join(
                    hardCodedAppId,
                    tokenData.channelName,
                    tokenData.token,
                    parseInt(tokenData.uid)
                );

                // 7. Publish tracks
                await client.publish([audioTrack, videoTrack]);

                console.log('✅ AGORA WEB: Successfully connected!');
                setIsConnected(true);
                setLoading(false);
                onCallStart();

            } catch (error) {
                console.error('❌ AGORA WEB ERROR:', error);
                setError(`Connection failed: ${error}`);
                setLoading(false);
            }
        };

        initializeCall();

        return () => {
            // Cleanup
            if (clientRef.current) {
                clientRef.current.leave();
            }
            localTracksRef.current.forEach(track => {
                track.stop();
                track.close();
            });
        };
    }, [bookingId, onCallStart]);

    const handleEndCall = () => {
        if (clientRef.current) {
            clientRef.current.leave();
        }
        localTracksRef.current.forEach(track => {
            track.stop();
            track.close();
        });
        onCallEnd();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p>Connecting to video call...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center text-red-600">
                    <p className="mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-red-600 text-white rounded"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-96 bg-gray-900 rounded-lg overflow-hidden relative">
            {/* Remote video */}
            <div
                ref={remoteVideoRef}
                className="w-full h-full bg-gray-800"
            >
                <div className="flex items-center justify-center h-full text-white">
                    Waiting for other participant...
                </div>
            </div>

            {/* Local video */}
            <div className="absolute top-4 right-4 w-32 h-24 bg-gray-700 rounded overflow-hidden">
                <div ref={localVideoRef} className="w-full h-full" />
            </div>

            {/* Controls */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                <button
                    onClick={handleEndCall}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                    End Call
                </button>
            </div>

            {/* Status */}
            <div className="absolute top-4 left-4 text-white bg-black bg-opacity-50 px-3 py-1 rounded">
                {isConnected ? '🟢 Connected' : '🟡 Connecting...'}
            </div>
        </div>
    );
} 