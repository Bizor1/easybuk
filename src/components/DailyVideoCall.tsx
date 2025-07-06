'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { DailyProvider, useDaily, useParticipantIds, useParticipantProperty, useMeetingState, useMediaTrack } from '@daily-co/daily-react';
import DailyIframe from '@daily-co/daily-js';

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

// Main wrapper component that provides the Daily context
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
    const [callObject, setCallObject] = useState<any>(null);

    // Create room when component mounts
    useEffect(() => {
        const createRoom = async () => {
            try {
                const response = await fetch('/api/daily/create-booking-room', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        bookingId,
                        callType,
                        displayName
                    }),
                });

                if (!response.ok) {
                    throw new Error('Failed to create room');
                }

                const data = await response.json();
                setRoomData(data);
            } catch (error) {
                console.error('Error creating room:', error);
                setError('Failed to create video call room');
            } finally {
                setIsLoading(false);
            }
        };

        createRoom();
    }, [bookingId, callType, displayName]);

    // Create call object when room is ready
    useEffect(() => {
        if (roomData && !callObject) {
            const co = DailyIframe.createCallObject();
            setCallObject(co);
        }
    }, [roomData, callObject]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-700 font-medium">Setting up call...</p>
                    <p className="text-sm text-gray-500 mt-2">Booking: {bookingId}</p>
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
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Reload Page
                    </button>
                </div>
            </div>
        );
    }

    if (!roomData || !callObject) {
        return (
            <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
                <div className="text-center">
                    <p className="text-gray-700 font-medium">Preparing call...</p>
                </div>
            </div>
        );
    }

    return (
        <DailyProvider callObject={callObject}>
            <CallInterface
                roomUrl={roomData.url}
                displayName={displayName}
                callType={callType}
                onCallEnd={onCallEnd}
                onCallStart={onCallStart}
                bookingData={roomData.booking}
            />
        </DailyProvider>
    );
}

// Call interface component that uses Daily React hooks
interface CallInterfaceProps {
    roomUrl: string;
    displayName: string;
    callType: 'video' | 'audio';
    onCallEnd: () => void;
    onCallStart: () => void;
    bookingData: {
        id: string;
        clientName: string;
        providerName: string;
    };
}

function CallInterface({ roomUrl, displayName, callType, onCallEnd, onCallStart, bookingData }: CallInterfaceProps) {
    const callObject = useDaily();
    const meetingState = useMeetingState();
    const participantIds = useParticipantIds();
    const [hasJoined, setHasJoined] = useState(false);
    const [isJoining, setIsJoining] = useState(false);
    const [callStatus, setCallStatus] = useState('Ready to join');

    // Debug logging
    useEffect(() => {
        console.log('📹 Daily Call State:', {
            meetingState,
            participantIds,
            participantCount: participantIds.length,
            hasJoined,
            callType
        });
    }, [meetingState, participantIds, hasJoined, callType]);

    // Ensure local video is enabled after joining
    useEffect(() => {
        if (callObject && hasJoined && callType === 'video') {
            console.log('📹 Ensuring local video is enabled...');
            const participants = callObject.participants();
            const localParticipant = participants?.local;
            if (localParticipant && !localParticipant.video) {
                console.log('📹 Enabling local video...');
                callObject.setLocalVideo(true);
            }
        }
    }, [callObject, hasJoined, callType]);

    // Handle meeting state changes
    useEffect(() => {
        switch (meetingState) {
            case 'joining-meeting':
                setCallStatus('Joining call...');
                setIsJoining(true);
                break;
            case 'joined-meeting':
                setCallStatus('Connected to call!');
                if (!hasJoined) {
                    setHasJoined(true);
                    onCallStart();
                }
                setIsJoining(false);
                break;
            case 'left-meeting':
                setCallStatus('Call ended');
                setHasJoined(false);
                setIsJoining(false);
                onCallEnd();
                break;
            case 'error':
                setCallStatus('Call error occurred');
                setIsJoining(false);
                break;
            default:
                setCallStatus('Ready to join');
                setIsJoining(false);
                break;
        }
    }, [meetingState, onCallStart, onCallEnd, hasJoined]);

    // Join call
    const joinCall = useCallback(async () => {
        if (!callObject) return;

        try {
            console.log('📱 Joining call with media access...');

            await callObject.join({
                url: roomUrl,
                userName: displayName,
                startVideoOff: callType === 'audio', // Video off for audio calls only
                startAudioOff: false
            });

            console.log('✅ Successfully joined call');
        } catch (error) {
            console.error('Failed to join call:', error);
            setCallStatus('Failed to join call - check camera/microphone permissions');
        }
    }, [callObject, roomUrl, displayName, callType]);

    // Leave call
    const leaveCall = useCallback(async () => {
        if (!callObject) return;

        try {
            await callObject.leave();
        } catch (error) {
            console.error('Failed to leave call:', error);
        }
    }, [callObject]);

    // Toggle camera
    const toggleCamera = useCallback(() => {
        if (!callObject) return;
        const localParticipant = callObject.participants()?.local;
        if (localParticipant) {
            callObject.setLocalVideo(!localParticipant.video);
        }
    }, [callObject]);

    // Toggle microphone
    const toggleMicrophone = useCallback(() => {
        if (!callObject) return;
        const localParticipant = callObject.participants()?.local;
        if (localParticipant) {
            callObject.setLocalAudio(!localParticipant.audio);
        }
    }, [callObject]);

    if (!hasJoined) {
        return (
            <div className="flex flex-col items-center justify-center h-64 bg-gray-100 rounded-lg">
                <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        {callType === 'video' ? 'Video Call' : 'Audio Call'}
                    </h3>
                    <p className="text-sm text-gray-600 mb-1">
                        {bookingData.clientName} & {bookingData.providerName}
                    </p>
                    <p className="text-xs text-gray-500">Booking: {bookingData.id}</p>
                </div>

                <div className="mb-4">
                    <p className="text-sm text-gray-600">{callStatus}</p>
                </div>

                <button
                    onClick={joinCall}
                    disabled={isJoining}
                    className={`px-6 py-3 rounded-lg font-medium transition-colors ${isJoining
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                >
                    {isJoining ? 'Joining...' : `Join ${callType === 'video' ? 'Video' : 'Audio'} Call`}
                </button>
            </div>
        );
    }

    return (
        <div className="bg-black rounded-lg overflow-hidden">
            {/* Video Grid */}
            <div className="relative min-h-[400px] flex items-center justify-center">
                <ParticipantGrid participantIds={participantIds} callType={callType} />
            </div>

            {/* Controls */}
            <div className="bg-gray-900 p-4 flex items-center justify-center space-x-4">
                <CallControls
                    callType={callType}
                    onToggleCamera={toggleCamera}
                    onToggleMicrophone={toggleMicrophone}
                    onLeave={leaveCall}
                />
            </div>

            {/* Status */}
            <div className="bg-gray-800 px-4 py-2 text-center">
                <p className="text-sm text-gray-300">{callStatus}</p>
            </div>
        </div>
    );
}

// Participant grid component
function ParticipantGrid({ participantIds, callType }: { participantIds: string[], callType: 'video' | 'audio' }) {
    // Use the actual participant IDs from Daily
    const allParticipants = participantIds.length > 0 ? participantIds : [];

    console.log('🎭 ParticipantGrid:', {
        participantIds,
        allParticipants,
        totalCount: allParticipants.length
    });

    if (allParticipants.length === 0) {
        return (
            <div className="text-white text-center">
                <p className="text-lg mb-2">Waiting for participants...</p>
                <p className="text-sm text-gray-400">You&apos;re the only one here right now</p>
            </div>
        );
    }

    const gridClass = allParticipants.length === 1
        ? 'flex items-center justify-center'
        : allParticipants.length === 2
            ? 'grid grid-cols-2 gap-4'
            : 'grid grid-cols-1 gap-4';

    return (
        <div className={`w-full h-full p-4 ${gridClass}`}>
            {allParticipants.map((id) => (
                <ParticipantTile key={id} participantId={id} callType={callType} />
            ))}
        </div>
    );
}

// Individual participant tile
function ParticipantTile({ participantId, callType }: { participantId: string, callType: 'video' | 'audio' }) {
    const userName = useParticipantProperty(participantId, 'user_name');
    const videoTrack = useParticipantProperty(participantId, 'tracks.video.state');
    const audioTrack = useParticipantProperty(participantId, 'tracks.audio.state');
    const isLocalProp = useParticipantProperty(participantId, 'local');
    const videoMediaTrack = useMediaTrack(participantId, 'video');
    const audioMediaTrack = useMediaTrack(participantId, 'audio');
    const isLocal = isLocalProp === true;

    const videoRef = useRef<HTMLVideoElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);

    // Debug logging
    useEffect(() => {
        console.log(`🎥 Participant ${participantId}:`, {
            userName,
            isLocalProp,
            isLocal,
            videoTrack,
            audioTrack,
            hasVideoMediaTrack: !!videoMediaTrack?.track,
            hasAudioMediaTrack: !!audioMediaTrack?.track,
            callType
        });
    }, [participantId, userName, isLocalProp, isLocal, videoTrack, audioTrack, videoMediaTrack?.track, audioMediaTrack?.track, callType]);

    // Set video track
    useEffect(() => {
        if (videoRef.current && videoMediaTrack?.track) {
            console.log(`🎥 Setting video track for ${participantId}`);
            videoRef.current.srcObject = new MediaStream([videoMediaTrack.track]);
        }
    }, [videoMediaTrack?.track, participantId]);

    // Set audio track
    useEffect(() => {
        if (audioRef.current && audioMediaTrack?.track) {
            console.log(`🔊 Setting audio track for ${participantId}`);
            audioRef.current.srcObject = new MediaStream([audioMediaTrack.track]);
        }
    }, [audioMediaTrack?.track, participantId]);

    return (
        <div className="relative bg-gray-800 rounded-lg overflow-hidden aspect-video">
            {/* Video */}
            {callType === 'video' && videoMediaTrack?.track && (
                <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    autoPlay
                    playsInline
                    muted={isLocal}
                />
            )}

            {/* Audio */}
            {!isLocal && audioMediaTrack?.track && (
                <audio
                    ref={audioRef}
                    autoPlay
                />
            )}

            {/* Placeholder for video off or audio-only */}
            {(callType === 'audio' || !videoMediaTrack?.track) && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-2">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <p className="text-white text-sm">{userName || 'Guest'}</p>
                    </div>
                </div>
            )}

            {/* Participant info */}
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                {userName || 'Guest'} {isLocal && '(You)'}
            </div>

            {/* Mute indicators */}
            <div className="absolute top-2 right-2 flex space-x-1">
                {!audioMediaTrack?.track && (
                    <div className="bg-red-600 p-1 rounded">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                        </svg>
                    </div>
                )}
                {callType === 'video' && !videoMediaTrack?.track && (
                    <div className="bg-red-600 p-1 rounded">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
                        </svg>
                    </div>
                )}
            </div>
        </div>
    );
}

// Call controls component
function CallControls({
    callType,
    onToggleCamera,
    onToggleMicrophone,
    onLeave
}: {
    callType: 'video' | 'audio',
    onToggleCamera: () => void,
    onToggleMicrophone: () => void,
    onLeave: () => void
}) {
    const callObject = useDaily();
    const participants = callObject?.participants();
    const localParticipant = participants?.local;
    const videoEnabled = localParticipant?.video;
    const audioEnabled = localParticipant?.audio;

    return (
        <>
            {/* Microphone */}
            <button
                onClick={onToggleMicrophone}
                className={`p-3 rounded-full transition-colors ${audioEnabled
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                title={audioEnabled ? 'Mute microphone' : 'Unmute microphone'}
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {audioEnabled ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                    )}
                </svg>
            </button>

            {/* Camera (only for video calls) */}
            {callType === 'video' && (
                <button
                    onClick={onToggleCamera}
                    className={`p-3 rounded-full transition-colors ${videoEnabled
                        ? 'bg-gray-700 hover:bg-gray-600 text-white'
                        : 'bg-red-600 hover:bg-red-700 text-white'
                        }`}
                    title={videoEnabled ? 'Turn off camera' : 'Turn on camera'}
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {videoEnabled ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z M3 3l18 18" />
                        )}
                    </svg>
                </button>
            )}

            {/* Leave call */}
            <button
                onClick={onLeave}
                className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors"
                title="Leave call"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 3l18 18" />
                </svg>
            </button>
        </>
    );
} 