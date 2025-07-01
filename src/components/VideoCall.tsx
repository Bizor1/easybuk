'use client';

import React, { useEffect, useState, useMemo } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import {
    AgoraRTCProvider,
    LocalUser,
    RemoteUser,
    useJoin,
    useLocalCameraTrack,
    useLocalMicrophoneTrack,
    usePublish,
    useRemoteAudioTracks,
    useRemoteUsers,
} from 'agora-rtc-react';

interface VideoCallProps {
    bookingId: string;
    displayName: string;
    onCallEnd?: () => void;
    onCallStart?: () => void;
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

function VideoCallContent({ bookingId, displayName, onCallEnd, onCallStart }: VideoCallProps) {
    const [tokenData, setTokenData] = useState<AgoraTokenResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [calling, setCalling] = useState(false);
    const [micOn, setMic] = useState(true);
    const [cameraOn, setCamera] = useState(true);

    // Get Agora App ID from environment variable
    const agoraAppId = process.env.NEXT_PUBLIC_AGORA_APP_ID;

    // Check if App ID is available
    useEffect(() => {
        console.log('🔧 AGORA: App ID from environment:', agoraAppId ? `${agoraAppId.substring(0, 8)}...` : 'MISSING');

        if (!agoraAppId) {
            setError('Agora App ID not configured. Please check environment variables.');
            setIsLoading(false);
            return;
        }
    }, [agoraAppId]);

    // Get local tracks
    const { localMicrophoneTrack } = useLocalMicrophoneTrack(micOn);
    const { localCameraTrack } = useLocalCameraTrack(cameraOn);

    // Join channel - now using environment variable for App ID
    useJoin({
        appid: agoraAppId || '',
        channel: tokenData?.channelName || '',
        token: tokenData?.token || null,
        uid: tokenData?.uid || null,
    }, calling);

    // Publish local tracks
    usePublish([localMicrophoneTrack, localCameraTrack]);

    // Get remote users and their audio tracks
    const remoteUsers = useRemoteUsers();
    const { audioTracks } = useRemoteAudioTracks(remoteUsers);

    // Play remote audio tracks
    useEffect(() => {
        audioTracks.forEach((track: any) => track.play());
    }, [audioTracks]);

    // Fetch Agora token
    useEffect(() => {
        const fetchToken = async () => {
            try {
                setIsLoading(true);

                const channelName = `easybuk-consultation-${bookingId}`;

                const response = await fetch('/api/agora/token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        bookingId,
                        channelName,
                    }),
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || 'Failed to get video call token');
                }

                const data: AgoraTokenResponse = await response.json();
                setTokenData(data);
                setError(null);

                console.log('✅ AGORA: Token received, joining channel:', data.channelName);

            } catch (err) {
                console.error('❌ AGORA: Failed to fetch token:', err);
                setError(err instanceof Error ? err.message : 'Failed to connect to video call');
            } finally {
                setIsLoading(false);
            }
        };

        fetchToken();
    }, [bookingId]);

    // Start call when token is ready
    useEffect(() => {
        if (tokenData && !calling) {
            setCalling(true);
            onCallStart?.();
        }
    }, [tokenData, calling, onCallStart]);

    const endCall = () => {
        setCalling(false);
        onCallEnd?.();
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-96 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-300 text-center">Connecting to video call...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-96 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <div className="text-red-500 mb-4">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-center mb-4">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="relative w-full h-full min-h-[500px] bg-black rounded-lg overflow-hidden">
            {/* Remote users grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-2 h-full">
                {remoteUsers.map((user: any) => (
                    <div key={user.uid} className="relative bg-gray-800 rounded-lg overflow-hidden">
                        <RemoteUser user={user} />
                        <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                            Remote User
                        </div>
                    </div>
                ))}

                {/* Local user */}
                <div className="relative bg-gray-800 rounded-lg overflow-hidden">
                    <LocalUser
                        audioTrack={localMicrophoneTrack}
                        videoTrack={localCameraTrack}
                        cameraOn={cameraOn}
                        micOn={micOn}
                        playAudio={false} // Don't play own audio
                        playVideo={cameraOn}
                    />
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                        You ({displayName})
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4 bg-gray-900 bg-opacity-75 rounded-lg p-4">
                <button
                    onClick={() => setMic(prev => !prev)}
                    className={`p-3 rounded-full transition-colors ${micOn ? 'bg-gray-600 hover:bg-gray-700' : 'bg-red-500 hover:bg-red-600'
                        }`}
                >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {micOn ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 5.586A2 2 0 015 7v3a9 9 0 009 9 9 9 0 009-9V7a2 2 0 00-2-2h-1.586L5.586 5.586zM12 19v4m-4 0h8" />
                        )}
                    </svg>
                </button>

                <button
                    onClick={() => setCamera(prev => !prev)}
                    className={`p-3 rounded-full transition-colors ${cameraOn ? 'bg-gray-600 hover:bg-gray-700' : 'bg-red-500 hover:bg-red-600'
                        }`}
                >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {cameraOn ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L12 21l-7.071-7.071M5.636 5.636L12 3l7.071 7.071" />
                        )}
                    </svg>
                </button>

                <button
                    onClick={endCall}
                    className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full flex items-center space-x-2 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 3l1.5 1.5m0 0L6 6m-1.5-1.5L3 6m1.5-1.5L6 3" />
                    </svg>
                    <span>End Call</span>
                </button>
            </div>

            {/* Call info */}
            {tokenData && (
                <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-2 rounded-lg">
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm">
                            Consultation with {tokenData?.booking.clientName} & {tokenData?.booking.providerName}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function VideoCall(props: VideoCallProps) {
    // Create Agora RTC client with useMemo to prevent recreation on every render
    const agoraClient = useMemo(() => {
        return AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    }, []);

    return (
        <AgoraRTCProvider client={agoraClient as any}>
            <VideoCallContent {...props} />
        </AgoraRTCProvider>
    );
} 