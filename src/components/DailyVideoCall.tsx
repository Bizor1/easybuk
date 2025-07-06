'use client';

import React, { useEffect, useRef, useState } from 'react';

interface DailyVideoCallProps {
    bookingId: string;
    displayName: string;
    callType: 'video' | 'audio';
    onCallEnd: () => void;
    onCallStart: () => void;
}

interface DailyRoomResponse {
    url: string;
    name: string;
    id: string;
    booking: {
        id: string;
        clientName: string;
        providerName: string;
    };
}

export default function DailyVideoCall({
    bookingId,
    displayName,
    callType,
    onCallEnd,
    onCallStart
}: DailyVideoCallProps) {
    const [roomData, setRoomData] = useState<DailyRoomResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const dailyFrameRef = useRef<any>(null);
    const [callStatus, setCallStatus] = useState('Initializing...');

    // Create room on component mount
    useEffect(() => {
        const createRoom = async () => {
            try {
                setIsLoading(true);
                setCallStatus('Creating secure call room...');

                const response = await fetch('/api/daily/create-booking-room', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        bookingId,
                        callType,
                        displayName
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || `Failed to create room: ${response.status}`);
                }

                const room = await response.json();
                console.log('Daily room created:', room);
                setRoomData(room);
                setCallStatus('Room created successfully!');
                setIsLoading(false);

            } catch (err) {
                console.error('Failed to create Daily room:', err);
                setError(err instanceof Error ? err.message : 'Failed to create call room');
                setIsLoading(false);
            }
        };

        createRoom();
    }, [bookingId, callType, displayName]);

    // Initialize Daily call when room is ready
    useEffect(() => {
        if (!roomData || dailyFrameRef.current) return;

        const initializeCall = async () => {
            try {
                setCallStatus('Joining call...');

                // Create Daily iframe
                const frame = (window as any).DailyIframe.createFrame({
                    iframeStyle: {
                        position: 'fixed',
                        top: '0',
                        left: '0',
                        width: '100%',
                        height: '100%',
                        zIndex: 9999,
                        border: 'none'
                    },
                    showLeaveButton: true,
                    showFullscreenButton: true,
                    showParticipantCount: true,
                    theme: {
                        accent: '#007bff',
                        accentText: '#ffffff',
                        background: '#f8f9fa',
                        backgroundAccent: '#e9ecef',
                        baseText: '#212529',
                        border: '#dee2e6',
                        mainAreaBg: '#ffffff',
                        mainAreaBgAccent: '#f8f9fa',
                        mainAreaText: '#212529',
                        supportiveText: '#6c757d'
                    }
                });

                // Set up event listeners
                frame.on('joined-meeting', () => {
                    console.log('Joined Daily meeting');
                    setCallStatus('Connected to call!');
                    onCallStart();

                    // For audio-only calls, turn off camera
                    if (callType === 'audio') {
                        frame.setLocalVideo(false);
                    }
                });

                frame.on('left-meeting', () => {
                    console.log('Left Daily meeting');
                    setCallStatus('Call ended');
                    dailyFrameRef.current = null;
                    onCallEnd();
                });

                frame.on('error', (error: any) => {
                    console.error('Daily error:', error);
                    setError(`Call error: ${error.errorMsg || 'Unknown error'}`);
                    setCallStatus('Call error occurred');
                });

                frame.on('participant-joined', (event: any) => {
                    console.log('Participant joined:', event.participant);
                    setCallStatus(`${event.participant.user_name || 'Someone'} joined the call`);
                });

                frame.on('participant-left', (event: any) => {
                    console.log('Participant left:', event.participant);
                    setCallStatus(`${event.participant.user_name || 'Someone'} left the call`);
                });

                // Join the room
                await frame.join({
                    url: roomData.url,
                    userName: displayName,
                    startVideoOff: callType === 'audio',
                    startAudioOff: false
                });

                dailyFrameRef.current = frame;

            } catch (err) {
                console.error('Failed to join Daily call:', err);
                setError('Failed to join call');
                setCallStatus('Failed to connect');
            }
        };

        // Load Daily script if not already loaded
        if (!(window as any).DailyIframe) {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/@daily-co/daily-js';
            script.onload = () => {
                console.log('Daily script loaded');
                initializeCall();
            };
            script.onerror = () => {
                setError('Failed to load Daily video calling library');
            };
            document.head.appendChild(script);
        } else {
            initializeCall();
        }

        return () => {
            if (dailyFrameRef.current) {
                dailyFrameRef.current.leave();
                dailyFrameRef.current.destroy();
            }
        };
    }, [roomData, callType, displayName, onCallStart, onCallEnd]);

    const endCall = () => {
        if (dailyFrameRef.current) {
            dailyFrameRef.current.leave();
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-700 font-medium">{callStatus}</p>
                    <p className="text-sm text-gray-500 mt-2">Booking: {bookingId}</p>
                    {roomData && (
                        <p className="text-sm text-blue-600 mt-1">
                            Call with {roomData.booking.clientName} & {roomData.booking.providerName}
                        </p>
                    )}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64 bg-red-50 rounded-lg">
                <div className="text-center">
                    <div className="text-red-600 mb-4">
                        <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.684-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <p className="text-red-600 font-medium mb-2">{error}</p>
                    <p className="text-sm text-red-500 mb-4">Please try again or contact support</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    >
                        Retry Call
                    </button>
                </div>
            </div>
        );
    }

    // Call interface is handled by Daily iframe
    return (
        <div className="w-full h-full bg-gray-900 rounded-lg overflow-hidden relative">
            {/* Status overlay */}
            {callStatus && callStatus !== 'Connected to call!' && (
                <div className="absolute top-4 left-4 bg-black bg-opacity-75 text-white px-3 py-1 rounded text-sm z-10">
                    {callStatus}
                </div>
            )}

            {/* Call info */}
            {roomData && (
                <div className="absolute top-4 right-4 bg-black bg-opacity-75 text-white px-3 py-1 rounded text-sm z-10">
                    {callType === 'video' ? '📹' : '🎙️'} {roomData.booking.clientName} & {roomData.booking.providerName}
                </div>
            )}

            {/* Emergency end call button */}
            <div className="absolute bottom-4 right-4 z-10">
                <button
                    onClick={endCall}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 3l1.5 1.5m0 0L6 6m-1.5-1.5L3 6m1.5-1.5L6 3" />
                    </svg>
                    <span>End Call</span>
                </button>
            </div>

            {/* Daily iframe will be injected here */}
            <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-white">
                    <div className="animate-pulse">
                        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            {callType === 'video' ? '📹' : '🎙️'}
                        </div>
                        <p>Preparing {callType} call...</p>
                    </div>
                </div>
            </div>
        </div>
    );
} 