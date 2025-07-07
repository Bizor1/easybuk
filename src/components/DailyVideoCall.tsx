'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { DailyProvider, useDaily, useParticipantIds, useParticipantProperty, useMeetingState, useMediaTrack } from '@daily-co/daily-react';
import DailyIframe from '@daily-co/daily-js';

interface DailyVideoCallProps {
    roomUrl: string;
    displayName: string;
    participantName: string;
    onCallEnd?: () => void;
}

export default function DailyVideoCall({ roomUrl, displayName, participantName, onCallEnd }: DailyVideoCallProps) {
    const [callObject, setCallObject] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let currentCallObject: any = null;

        const createCallObject = async () => {
            try {
                console.log('🏗️ Creating Daily call object...');
                const call = DailyIframe.createCallObject();
                currentCallObject = call;
                setCallObject(call);
                console.log('✅ Call object created successfully');
            } catch (err) {
                console.error('❌ Error creating call object:', err);
                setError('Failed to create call object');
            }
        };

        createCallObject();

        return () => {
            if (currentCallObject) {
                console.log('🧹 Cleaning up call object...');
                currentCallObject.destroy();
            }
        };
    }, []); // Empty dependency array - only run once on mount

    if (error) {
        return (
            <div className="flex items-center justify-center h-64 bg-red-50 rounded-lg">
                <div className="text-center">
                    <div className="text-red-600 text-lg font-semibold mb-2">Call Error</div>
                    <div className="text-red-500">{error}</div>
                </div>
            </div>
        );
    }

    if (!callObject) {
        return (
            <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <div className="text-gray-600">Setting up call...</div>
                </div>
            </div>
        );
    }

    return (
        <DailyProvider callObject={callObject}>
            <CallInterface
                roomUrl={roomUrl}
                displayName={displayName}
                participantName={participantName}
                onCallEnd={onCallEnd}
            />
        </DailyProvider>
    );
}

interface CallInterfaceProps {
    roomUrl: string;
    displayName: string;
    participantName: string;
    onCallEnd?: () => void;
}

function CallInterface({ roomUrl, displayName, participantName, onCallEnd }: CallInterfaceProps) {
    const callObject = useDaily();
    const meetingState = useMeetingState();
    const participantIds = useParticipantIds();
    const [hasJoined, setHasJoined] = useState(false);
    const [isJoining, setIsJoining] = useState(false);
    const [cameraEnabled, setCameraEnabled] = useState(true);
    const [micEnabled, setMicEnabled] = useState(true);
    const [error, setError] = useState<string | null>(null);

    console.log('🔄 Call Interface State:', {
        meetingState,
        participantIds,
        hasJoined,
        cameraEnabled,
        micEnabled
    });

    // Handle meeting state changes
    useEffect(() => {
        if (meetingState === 'joined-meeting' && !hasJoined) {
            setHasJoined(true);
            setIsJoining(false);
            console.log('✅ Successfully joined meeting');
        } else if (meetingState === 'left-meeting') {
            setHasJoined(false);
            console.log('👋 Left meeting');
            onCallEnd?.();
        } else if (meetingState === 'error') {
            setError('Failed to join meeting');
            setIsJoining(false);
            console.error('❌ Meeting error');
        }
    }, [meetingState, hasJoined, onCallEnd]);

    const joinCall = useCallback(async () => {
        if (!callObject || isJoining) return;

        setIsJoining(true);
        setError(null);

        try {
            console.log('🚀 Joining call...', {
                roomUrl,
                userName: displayName,
                startVideoOff: !cameraEnabled,
                startAudioOff: !micEnabled
            });

            await callObject.join({
                url: roomUrl,
                userName: displayName,
                startVideoOff: !cameraEnabled,
                startAudioOff: !micEnabled
            });

            console.log('✅ Join call successful');
        } catch (err) {
            console.error('❌ Failed to join call:', err);
            setError('Failed to join call');
            setIsJoining(false);
        }
    }, [callObject, roomUrl, displayName, cameraEnabled, micEnabled, isJoining]);

    // Auto-join when component mounts
    useEffect(() => {
        if (callObject && !hasJoined && !isJoining) {
            joinCall();
        }
    }, [callObject, hasJoined, isJoining, joinCall]);

    const leaveCall = useCallback(async () => {
        if (!callObject) return;

        try {
            await callObject.leave();
            console.log('👋 Left call');
        } catch (err) {
            console.error('❌ Failed to leave call:', err);
        }
    }, [callObject]);

    const toggleCamera = useCallback(async () => {
        if (!callObject) return;

        try {
            await callObject.setLocalVideo(!cameraEnabled);
            setCameraEnabled(!cameraEnabled);
            console.log(`📹 Camera ${!cameraEnabled ? 'enabled' : 'disabled'}`);
        } catch (err) {
            console.error('❌ Failed to toggle camera:', err);
        }
    }, [callObject, cameraEnabled]);

    const toggleMic = useCallback(async () => {
        if (!callObject) return;

        try {
            await callObject.setLocalAudio(!micEnabled);
            setMicEnabled(!micEnabled);
            console.log(`🎤 Microphone ${!micEnabled ? 'enabled' : 'disabled'}`);
        } catch (err) {
            console.error('❌ Failed to toggle microphone:', err);
        }
    }, [callObject, micEnabled]);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-64 bg-red-50 rounded-lg">
                <div className="text-center">
                    <div className="text-red-600 text-lg font-semibold mb-2">Call Error</div>
                    <div className="text-red-500 mb-4">{error}</div>
                    <button
                        onClick={joinCall}
                        disabled={isJoining}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
                    >
                        {isJoining ? 'Joining...' : 'Try Again'}
                    </button>
                </div>
            </div>
        );
    }

    if (isJoining) {
        return (
            <div className="flex items-center justify-center h-64 bg-blue-50 rounded-lg">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <div className="text-blue-600">Joining call...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-900 rounded-lg overflow-hidden">
            <ParticipantGrid participantIds={participantIds} />
            <CallControls
                onLeave={leaveCall}
                onToggleCamera={toggleCamera}
                onToggleMic={toggleMic}
                cameraEnabled={cameraEnabled}
                micEnabled={micEnabled}
                hasJoined={hasJoined}
            />
        </div>
    );
}

interface ParticipantGridProps {
    participantIds: string[];
}

function ParticipantGrid({ participantIds }: ParticipantGridProps) {
    const callObject = useDaily();
    const participants = callObject?.participants();

    // Use same logic as test page: include all participants
    const allParticipants = [];
    if (participants?.local) {
        allParticipants.push('local');
    }
    participantIds.forEach(id => {
        if (id !== 'local') {
            allParticipants.push(id);
        }
    });

    console.log('🎬 Participant Grid:', {
        originalParticipantIds: participantIds,
        allParticipants,
        localParticipant: participants?.local
    });

    const participantCount = allParticipants.length;

    // Responsive grid based on participant count
    const gridClass = participantCount === 1
        ? 'grid-cols-1'
        : participantCount === 2
            ? 'grid-cols-1 md:grid-cols-2'
            : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';

    return (
        <div className={`grid ${gridClass} gap-4 p-4 min-h-[400px]`}>
            {allParticipants.map((participantId) => (
                <ParticipantTile key={participantId} participantId={participantId} />
            ))}
        </div>
    );
}

interface ParticipantTileProps {
    participantId: string;
}

function ParticipantTile({ participantId }: ParticipantTileProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const userName = useParticipantProperty(participantId, 'user_name');
    const isLocal = participantId === 'local'; // Use same logic as test page
    const videoMediaTrack = useMediaTrack(participantId, 'video');
    const audioMediaTrack = useMediaTrack(participantId, 'audio');
    const [audioPlaying, setAudioPlaying] = useState(false);

    console.log(`🎭 Participant Tile for ${participantId}:`, {
        participantId,
        userName,
        isLocal,
        videoState: videoMediaTrack?.state,
        audioState: audioMediaTrack?.state,
        hasVideoTrack: !!videoMediaTrack?.track,
        hasAudioTrack: !!audioMediaTrack?.track
    });

    // Set video track
    useEffect(() => {
        if (videoRef.current && videoMediaTrack?.track) {
            console.log(`📹 Setting video track for ${participantId} (${isLocal ? 'local' : 'remote'})`);

            try {
                const mediaStream = new MediaStream([videoMediaTrack.track]);
                videoRef.current.srcObject = mediaStream;
                videoRef.current.play().catch(console.error);
            } catch (error) {
                console.error(`❌ Error setting video track for ${participantId}:`, error);
            }
        }
    }, [videoMediaTrack?.track, participantId, isLocal]);

    // Set audio track for remote participants
    useEffect(() => {
        if (audioRef.current && audioMediaTrack?.track && !isLocal) {
            console.log(`🎤 Setting audio track for ${participantId} (remote)`);

            try {
                const mediaStream = new MediaStream([audioMediaTrack.track]);
                audioRef.current.srcObject = mediaStream;

                // Attempt to play audio
                audioRef.current.play()
                    .then(() => {
                        setAudioPlaying(true);
                        console.log(`✅ Audio playing for ${participantId}`);
                    })
                    .catch((error) => {
                        console.error(`❌ Audio autoplay failed for ${participantId}:`, error);
                        setAudioPlaying(false);
                    });
            } catch (error) {
                console.error(`❌ Error setting audio track for ${participantId}:`, error);
            }
        }
    }, [audioMediaTrack?.track, participantId, isLocal]);

    // Manual audio play function
    const playAudioManually = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.play()
                .then(() => {
                    setAudioPlaying(true);
                    console.log(`✅ Manual audio play successful for ${participantId}`);
                })
                .catch((error) => {
                    console.error(`❌ Manual audio play failed for ${participantId}:`, error);
                });
        }
    }, [participantId]);

    const displayName = isLocal ? (userName || 'You') : (userName || 'Guest');
    const hasVideoTrack = !!videoMediaTrack?.track;
    const hasAudioTrack = !!audioMediaTrack?.track;

    return (
        <div className="relative bg-gray-800 rounded-lg overflow-hidden aspect-video">
            {/* Video element */}
            <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                muted={isLocal}
                style={{
                    transform: isLocal ? 'scaleX(-1)' : 'none'
                }}
            />

            {/* Audio element for remote participants */}
            {!isLocal && hasAudioTrack && (
                <audio
                    ref={audioRef}
                    autoPlay
                    playsInline
                    controls={false}
                    style={{ display: 'none' }}
                />
            )}

            {/* Placeholder when no video */}
            {!hasVideoTrack && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <p className="text-white text-lg font-medium">{displayName}</p>
                        <p className="text-gray-400 text-sm mt-1">Camera off</p>
                    </div>
                </div>
            )}

            {/* Manual audio enable button for remote participants */}
            {!isLocal && hasAudioTrack && !audioPlaying && (
                <button
                    onClick={playAudioManually}
                    className="absolute top-4 left-4 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors"
                    title="Click to enable audio"
                >
                    🔊 Enable Audio
                </button>
            )}

            {/* Participant name overlay */}
            <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 text-white px-3 py-1 rounded-md text-sm font-medium">
                {displayName}
            </div>

            {/* Status indicators */}
            <div className="absolute top-4 right-4 flex space-x-2">
                {/* Video status */}
                <div className={`w-2 h-2 rounded-full ${hasVideoTrack ? 'bg-green-500' : 'bg-red-500'}`}
                    title={`Video: ${hasVideoTrack ? 'on' : 'off'}`} />

                {/* Audio status */}
                <div className={`w-2 h-2 rounded-full ${hasAudioTrack ? 'bg-blue-500' : 'bg-red-500'}`}
                    title={`Audio: ${hasAudioTrack ? 'on' : 'off'}`} />

                {/* Audio playing status for remote participants */}
                {!isLocal && hasAudioTrack && (
                    <div className={`w-2 h-2 rounded-full ${audioPlaying ? 'bg-green-400' : 'bg-yellow-500'}`}
                        title={`Audio playing: ${audioPlaying ? 'yes' : 'click to enable'}`} />
                )}
            </div>
        </div>
    );
}

interface CallControlsProps {
    onLeave: () => void;
    onToggleCamera: () => void;
    onToggleMic: () => void;
    cameraEnabled: boolean;
    micEnabled: boolean;
    hasJoined: boolean;
}

function CallControls({ onLeave, onToggleCamera, onToggleMic, cameraEnabled, micEnabled, hasJoined }: CallControlsProps) {
    if (!hasJoined) return null;

    return (
        <div className="bg-gray-800 p-4 flex justify-center space-x-4">
            <button
                onClick={onToggleMic}
                className={`p-3 rounded-full transition-colors ${micEnabled
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                title={micEnabled ? 'Mute microphone' : 'Unmute microphone'}
            >
                {micEnabled ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-3a1 1 0 011-1h1m0 0V9a3 3 0 013-3m3 3v3a3 3 0 01-3 3m0 0h3m-3 0l-3-3m3 3l3-3" />
                    </svg>
                )}
            </button>

            <button
                onClick={onToggleCamera}
                className={`p-3 rounded-full transition-colors ${cameraEnabled
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                title={cameraEnabled ? 'Turn off camera' : 'Turn on camera'}
            >
                {cameraEnabled ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                )}
            </button>

            <button
                onClick={onLeave}
                className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors"
                title="Leave call"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12l-4-4m0 0L8 12m4-4v12" />
                </svg>
            </button>
        </div>
    );
} 