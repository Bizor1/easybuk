'use client';

import React, { useEffect, useRef, useState } from 'react';
import AgoraRTC, {
    IAgoraRTCClient,
    ICameraVideoTrack,
    IMicrophoneAudioTrack
} from 'agora-rtc-sdk-ng';

interface VideoCallProps {
    bookingId: string;
    displayName: string;
    onCallEnd: () => void;
    onCallStart: () => void;
}

interface AgoraTokenResponse {
    token: string;
    channelName: string;
    uid: string;
    booking: {
        id: string;
        clientName: string;
        providerName: string;
    };
}

export default function VideoCallWeb({ bookingId, displayName, onCallEnd, onCallStart }: VideoCallProps) {
    const [tokenData, setTokenData] = useState<AgoraTokenResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [calling, setCalling] = useState(false);
    const [micOn, setMic] = useState(true);
    const [cameraOn, setCamera] = useState(true);
    const [remoteUsers, setRemoteUsers] = useState<number[]>([]);

    // Agora Web SDK refs
    const clientRef = useRef<IAgoraRTCClient | null>(null);
    const localVideoTrackRef = useRef<ICameraVideoTrack | null>(null);
    const localAudioTrackRef = useRef<IMicrophoneAudioTrack | null>(null);
    const localVideoContainerRef = useRef<HTMLDivElement>(null);

    // Fetch token from your API
    useEffect(() => {
        const fetchToken = async () => {
            try {
                console.log('🔗 AGORA WEB: Fetching token for booking:', bookingId);
                const response = await fetch(`/api/agora/token?bookingId=${bookingId}`, {
                    credentials: 'include'
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
                }

                const data = await response.json();
                console.log('✅ AGORA WEB: Token received:', {
                    channelName: data.channelName,
                    uid: data.uid,
                    booking: data.booking
                });

                setTokenData(data);
                setIsLoading(false);
            } catch (err) {
                console.error('❌ AGORA WEB: Failed to fetch token:', err);
                setError(`Failed to get video call token: ${err instanceof Error ? err.message : 'Unknown error'}`);
                setIsLoading(false);
            }
        };

        fetchToken();
    }, [bookingId]);

    // Initialize Agora Web SDK
    useEffect(() => {
        if (!tokenData) return;

        const initializeAgora = async () => {
            try {
                console.log('🚀 AGORA WEB: Initializing Web SDK...');

                // Create Agora client for Web
                const client = AgoraRTC.createClient({
                    mode: "rtc",
                    codec: "vp8"
                });

                clientRef.current = client;

                // Set up event listeners
                client.on("user-published", async (user, mediaType) => {
                    console.log('👤 AGORA WEB: User published:', user.uid, mediaType);
                    await client.subscribe(user, mediaType);

                    // Update remote users list
                    setRemoteUsers(prev => {
                        const uid = typeof user.uid === 'string' ? parseInt(user.uid) : user.uid;
                        if (!prev.includes(uid)) {
                            return [...prev, uid];
                        }
                        return prev;
                    });

                    if (mediaType === "video") {
                        const remoteVideoTrack = user.videoTrack;
                        const remoteContainer = document.getElementById(`remote-video-${user.uid}`);
                        if (remoteContainer && remoteVideoTrack) {
                            remoteVideoTrack.play(remoteContainer);
                        }
                    }

                    if (mediaType === "audio") {
                        const remoteAudioTrack = user.audioTrack;
                        if (remoteAudioTrack) {
                            remoteAudioTrack.play();
                        }
                    }
                });

                client.on("user-unpublished", (user, mediaType) => {
                    console.log('👤 AGORA WEB: User unpublished:', user.uid, mediaType);
                });

                client.on("user-left", (user) => {
                    console.log('👤 AGORA WEB: User left:', user.uid);
                    setRemoteUsers(prev => {
                        const uid = typeof user.uid === 'string' ? parseInt(user.uid) : user.uid;
                        return prev.filter(id => id !== uid);
                    });
                });

                // Create local tracks
                console.log('🎥 AGORA WEB: Creating local tracks...');
                const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();

                localVideoTrackRef.current = videoTrack;
                localAudioTrackRef.current = audioTrack;

                // Play local video
                if (localVideoContainerRef.current) {
                    videoTrack.play(localVideoContainerRef.current);
                }

                // Join channel
                console.log('🔗 AGORA WEB: Joining channel:', tokenData.channelName);
                const uid = await client.join(
                    process.env.NEXT_PUBLIC_AGORA_APP_ID!,
                    tokenData.channelName,
                    tokenData.token,
                    parseInt(tokenData.uid)
                );

                console.log('✅ AGORA WEB: Joined with UID:', uid);

                // Publish local tracks
                await client.publish([videoTrack, audioTrack]);
                console.log('📡 AGORA WEB: Published local tracks');

                setCalling(true);
                onCallStart();

            } catch (error) {
                console.error('❌ AGORA WEB: Initialization failed:', error);
                setError(`Failed to initialize video call: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        };

        initializeAgora();

        // Cleanup function
        return () => {
            cleanup();
        };
    }, [tokenData, onCallStart]);

    const cleanup = async () => {
        try {
            console.log('🧹 AGORA WEB: Cleaning up...');

            if (localVideoTrackRef.current) {
                localVideoTrackRef.current.stop();
                localVideoTrackRef.current.close();
                localVideoTrackRef.current = null;
            }

            if (localAudioTrackRef.current) {
                localAudioTrackRef.current.stop();
                localAudioTrackRef.current.close();
                localAudioTrackRef.current = null;
            }

            if (clientRef.current) {
                await clientRef.current.leave();
                clientRef.current = null;
            }

            console.log('✅ AGORA WEB: Cleanup completed');
        } catch (error) {
            console.error('❌ AGORA WEB: Cleanup error:', error);
        }
    };

    const toggleMic = async () => {
        if (localAudioTrackRef.current) {
            await localAudioTrackRef.current.setEnabled(!micOn);
            setMic(!micOn);
            console.log(`🎤 AGORA WEB: Microphone ${!micOn ? 'enabled' : 'disabled'}`);
        }
    };

    const toggleCamera = async () => {
        if (localVideoTrackRef.current) {
            await localVideoTrackRef.current.setEnabled(!cameraOn);
            setCamera(!cameraOn);
            console.log(`📹 AGORA WEB: Camera ${!cameraOn ? 'enabled' : 'disabled'}`);
        }
    };

    const endCall = () => {
        cleanup();
        setCalling(false);
        onCallEnd();
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p>Connecting to video call...</p>
                    <p className="text-sm text-gray-600 mt-2">Booking: {bookingId}</p>
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
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full bg-gray-900 rounded-lg overflow-hidden relative">
            {/* Remote video containers */}
            {remoteUsers.length > 0 ? (
                <div className="w-full h-full grid grid-cols-1">
                    {remoteUsers.map((uid) => (
                        <div
                            key={uid}
                            id={`remote-video-${uid}`}
                            className="w-full h-full bg-gray-800"
                        />
                    ))}
                </div>
            ) : (
                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                    <div className="text-center text-white">
                        <div className="mb-4">
                            <div className="animate-pulse rounded-full h-16 w-16 bg-gray-600 mx-auto mb-4"></div>
                        </div>
                        <p>Waiting for other participant...</p>
                        <p className="text-sm text-gray-400 mt-2">
                            {tokenData?.booking.clientName} & {tokenData?.booking.providerName}
                        </p>
                    </div>
                </div>
            )}

            {/* Local video (picture-in-picture) */}
            <div className="absolute top-4 right-4 w-32 h-24 bg-gray-700 rounded-lg overflow-hidden border-2 border-gray-500">
                <div
                    ref={localVideoContainerRef}
                    className="w-full h-full"
                />
                {!cameraOn && (
                    <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                        <span className="text-white text-xs">Camera Off</span>
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
                <button
                    onClick={toggleMic}
                    className={`p-3 rounded-full ${micOn ? 'bg-gray-600 hover:bg-gray-700' : 'bg-red-600 hover:bg-red-700'} text-white transition-colors`}
                    title={micOn ? 'Mute Microphone' : 'Unmute Microphone'}
                >
                    {micOn ? '🎤' : '🔇'}
                </button>

                <button
                    onClick={toggleCamera}
                    className={`p-3 rounded-full ${cameraOn ? 'bg-gray-600 hover:bg-gray-700' : 'bg-red-600 hover:bg-red-700'} text-white transition-colors`}
                    title={cameraOn ? 'Turn Off Camera' : 'Turn On Camera'}
                >
                    {cameraOn ? '📹' : '📷'}
                </button>

                <button
                    onClick={endCall}
                    className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors"
                    title="End Call"
                >
                    📞
                </button>
            </div>

            {/* Call status indicator */}
            <div className="absolute top-4 left-4 text-white bg-black bg-opacity-50 px-3 py-1 rounded text-sm">
                {calling ? '🟢 Connected' : '🟡 Connecting...'}
            </div>

            {/* Participants count */}
            <div className="absolute top-12 left-4 text-white bg-black bg-opacity-50 px-3 py-1 rounded text-xs">
                {remoteUsers.length + 1} participant{remoteUsers.length !== 0 ? 's' : ''}
            </div>
        </div>
    );
} 