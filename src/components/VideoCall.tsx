'use client';

import React, { useEffect, useRef, useState } from 'react';
import AgoraRTC, {
    IAgoraRTCClient,
    IAgoraRTCRemoteUser,
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

export default function VideoCall({ bookingId, displayName, onCallEnd, onCallStart }: VideoCallProps) {
    const [tokenData, setTokenData] = useState<AgoraTokenResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [calling, setCalling] = useState(false);
    const [micOn, setMic] = useState(true);
    const [cameraOn, setCamera] = useState(true);

    // Agora Web SDK refs
    const clientRef = useRef<IAgoraRTCClient | null>(null);
    const localVideoTrackRef = useRef<ICameraVideoTrack | null>(null);
    const localAudioTrackRef = useRef<IMicrophoneAudioTrack | null>(null);
    const localVideoContainerRef = useRef<HTMLDivElement>(null);

    // Fetch token from your API
    useEffect(() => {
        const fetchToken = async () => {
            try {
                const response = await fetch(`/api/agora/token?bookingId=${bookingId}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setTokenData(data);
                setIsLoading(false);
            } catch (err) {
                console.error('Failed to fetch token:', err);
                setError('Failed to get video call token');
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
                console.log('📊 AGORA DEBUG: SDK Version:', AgoraRTC.VERSION);
                console.log('📊 AGORA DEBUG: Browser support check:', AgoraRTC.checkSystemRequirements());

                // Create Agora client for Web with enhanced config
                const client = AgoraRTC.createClient({
                    mode: "rtc",
                    codec: "vp8",
                    role: "host" // Latest SDK best practice
                });

                clientRef.current = client;
                console.log('✅ AGORA DEBUG: Client created successfully');

                // Enhanced event listeners with debugging
                client.on("user-published", async (user, mediaType) => {
                    console.log('👤 AGORA WEB: User published:', {
                        uid: user.uid,
                        mediaType,
                        hasVideoTrack: !!user.videoTrack,
                        hasAudioTrack: !!user.audioTrack
                    });

                    try {
                        await client.subscribe(user, mediaType);
                        console.log('✅ AGORA DEBUG: Successfully subscribed to user:', user.uid, mediaType);

                        if (mediaType === "video") {
                            const remoteVideoTrack = user.videoTrack;
                            const remoteContainer = document.getElementById('remote-video-container');
                            console.log('📺 AGORA DEBUG: Remote video container found:', !!remoteContainer);
                            if (remoteContainer && remoteVideoTrack) {
                                remoteVideoTrack.play(remoteContainer);
                                console.log('✅ AGORA DEBUG: Remote video playing');
                            }
                        }

                        if (mediaType === "audio") {
                            const remoteAudioTrack = user.audioTrack;
                            if (remoteAudioTrack) {
                                remoteAudioTrack.play();
                                console.log('✅ AGORA DEBUG: Remote audio playing');
                            }
                        }
                    } catch (subError) {
                        console.error('❌ AGORA DEBUG: Subscription failed:', subError);
                    }
                });

                client.on("user-unpublished", (user, mediaType) => {
                    console.log('👤 AGORA WEB: User unpublished:', {
                        uid: user.uid,
                        mediaType,
                        timestamp: new Date().toISOString()
                    });
                });

                client.on("user-left", (user) => {
                    console.log('👤 AGORA WEB: User left:', {
                        uid: user.uid,
                        timestamp: new Date().toISOString()
                    });
                });

                // Connection state monitoring (latest SDK feature)
                client.on("connection-state-change", (curState, revState) => {
                    console.log('🔗 AGORA DEBUG: Connection state changed:', {
                        from: revState,
                        to: curState,
                        timestamp: new Date().toISOString()
                    });
                });

                // Network quality monitoring (latest SDK feature)
                client.on("network-quality", (stats) => {
                    console.log('📊 AGORA DEBUG: Network quality:', {
                        uplink: stats.uplinkNetworkQuality,
                        downlink: stats.downlinkNetworkQuality,
                        timestamp: new Date().toISOString()
                    });
                });

                // Create local tracks with enhanced config
                console.log('🎥 AGORA WEB: Creating local tracks...');
                const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks(
                    {
                        // Enhanced audio config (latest SDK)
                        AEC: true,
                        ANS: true,
                        AGC: true
                    },
                    {
                        // Enhanced video config (latest SDK)
                        encoderConfig: {
                            width: 1280,
                            height: 720,
                            frameRate: 30,
                            bitrateMax: 1500,
                            bitrateMin: 400
                        },
                        optimizationMode: "detail"
                    }
                );

                localVideoTrackRef.current = videoTrack;
                localAudioTrackRef.current = audioTrack;

                console.log('✅ AGORA DEBUG: Local tracks created:', {
                    videoTrack: !!videoTrack,
                    audioTrack: !!audioTrack,
                    videoTrackId: videoTrack.getTrackId(),
                    audioTrackId: audioTrack.getTrackId()
                });

                // Play local video
                if (localVideoContainerRef.current) {
                    videoTrack.play(localVideoContainerRef.current);
                    console.log('✅ AGORA DEBUG: Local video playing in container');
                } else {
                    console.warn('⚠️ AGORA DEBUG: Local video container not found');
                }

                // Join channel with detailed logging
                const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID;
                console.log('🔗 AGORA WEB: Joining channel with params:', {
                    appId: appId ? `${appId.substring(0, 8)}...` : 'MISSING',
                    channelName: tokenData.channelName,
                    hasToken: !!tokenData.token,
                    tokenPrefix: tokenData.token.substring(0, 10),
                    uid: tokenData.uid
                });

                if (!appId) {
                    throw new Error('NEXT_PUBLIC_AGORA_APP_ID is not configured. Add it to your .env.local file.');
                }

                const joinedUid = await client.join(
                    appId,
                    tokenData.channelName,
                    tokenData.token,
                    parseInt(tokenData.uid)
                );

                console.log('✅ AGORA WEB: Successfully joined channel:', {
                    requestedUid: tokenData.uid,
                    joinedUid: joinedUid,
                    channelName: tokenData.channelName
                });

                // Publish local tracks
                console.log('📡 AGORA DEBUG: Publishing local tracks...');
                await client.publish([videoTrack, audioTrack]);
                console.log('✅ AGORA WEB: Successfully published local tracks');

                setCalling(true);
                onCallStart();

            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                const errorStack = error instanceof Error ? error.stack : undefined;

                console.error('❌ AGORA WEB: Initialization failed:', {
                    error: errorMessage,
                    stack: errorStack,
                    timestamp: new Date().toISOString(),
                    tokenData: tokenData ? {
                        channelName: tokenData.channelName,
                        uid: tokenData.uid,
                        hasToken: !!tokenData.token
                    } : 'null'
                });
                setError(`Failed to initialize video call: ${errorMessage}`);
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
            console.log('🧹 AGORA DEBUG: Starting cleanup...');

            if (localVideoTrackRef.current) {
                console.log('🎥 AGORA DEBUG: Stopping local video track');
                localVideoTrackRef.current.stop();
                localVideoTrackRef.current.close();
                localVideoTrackRef.current = null;
                console.log('✅ AGORA DEBUG: Local video track cleaned up');
            }

            if (localAudioTrackRef.current) {
                console.log('🎤 AGORA DEBUG: Stopping local audio track');
                localAudioTrackRef.current.stop();
                localAudioTrackRef.current.close();
                localAudioTrackRef.current = null;
                console.log('✅ AGORA DEBUG: Local audio track cleaned up');
            }

            if (clientRef.current) {
                console.log('🔗 AGORA DEBUG: Leaving channel and cleaning client');
                await clientRef.current.leave();
                clientRef.current.removeAllListeners();
                clientRef.current = null;
                console.log('✅ AGORA DEBUG: Client cleaned up');
            }

            console.log('✅ AGORA DEBUG: Cleanup completed successfully');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown cleanup error';
            console.error('❌ AGORA DEBUG: Cleanup error:', {
                error: errorMessage,
                timestamp: new Date().toISOString()
            });
        }
    };

    const toggleMic = async () => {
        if (localAudioTrackRef.current) {
            await localAudioTrackRef.current.setEnabled(!micOn);
            setMic(!micOn);
        }
    };

    const toggleCamera = async () => {
        if (localVideoTrackRef.current) {
            await localVideoTrackRef.current.setEnabled(!cameraOn);
            setCamera(!cameraOn);
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
            {/* Remote video (main view) */}
            <div
                id="remote-video-container"
                className="w-full h-full bg-gray-800"
            >
                <div className="flex items-center justify-center h-full text-white">
                    Waiting for other participant...
                </div>
            </div>

            {/* Local video (picture-in-picture) */}
            <div className="absolute top-4 right-4 w-32 h-24 bg-gray-700 rounded-lg overflow-hidden">
                <div
                    ref={localVideoContainerRef}
                    className="w-full h-full"
                />
            </div>

            {/* Controls */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
                <button
                    onClick={toggleMic}
                    className={`p-3 rounded-full ${micOn ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white`}
                >
                    {micOn ? '🎤' : '🔇'}
                </button>

                <button
                    onClick={toggleCamera}
                    className={`p-3 rounded-full ${cameraOn ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white`}
                >
                    {cameraOn ? '📹' : '📷'}
                </button>

                <button
                    onClick={endCall}
                    className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white"
                >
                    📞
                </button>
            </div>

            {/* Call info */}
            <div className="absolute top-4 left-4 text-white bg-black bg-opacity-50 px-3 py-1 rounded">
                {tokenData?.booking.clientName} & {tokenData?.booking.providerName}
            </div>
        </div>
    );
} 