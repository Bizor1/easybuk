import React, { useEffect, useRef } from 'react';
import { useCallState } from '../daily-contexts/CallProvider';
import { useParticipants } from '../daily-contexts/ParticipantsProvider';
import { useTracks } from '../daily-contexts/TracksProvider';
import { useMediaDevices } from '../daily-contexts/MediaDeviceProvider';
import { useUIState } from '../daily-contexts/UIStateProvider';

interface CallInterfaceProps {
    roomUrl: string;
    displayName: string;
    callType: 'video' | 'audio';
    onCallEnd: () => void;
    onCallStart: () => void;
    bookingData?: {
        id: string;
        clientName: string;
        providerName: string;
    };
}

// Individual participant component as recommended by Daily.co
interface ParticipantProps {
    participant: any;
    isLocal: boolean;
    callType: 'video' | 'audio';
}

function Participant({ participant, isLocal, callType }: ParticipantProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const { getVideoTrack, getAudioTrack } = useTracks();

    const sessionId = participant.session_id;
    const videoTrack = getVideoTrack(sessionId);
    const audioTrack = getAudioTrack(sessionId);

    console.log(`🎭 Participant ${sessionId} (${isLocal ? 'local' : 'remote'}):`, {
        userName: participant.user_name,
        videoTrack: videoTrack?.state,
        audioTrack: audioTrack?.state,
    });

    // Set up video track as recommended by Daily.co
    useEffect(() => {
        if (videoRef.current && videoTrack?.track) {
            console.log(`📹 Setting video track for ${sessionId}`);

            const mediaStream = new MediaStream([videoTrack.track]);
            videoRef.current.srcObject = mediaStream;

            videoRef.current.play().catch(error => {
                console.error(`❌ Failed to play video for ${sessionId}:`, error);
            });
        }
    }, [videoTrack?.track, sessionId]);

    // Set up audio track as recommended by Daily.co
    useEffect(() => {
        if (audioRef.current && audioTrack?.track && !isLocal) {
            console.log(`🔊 Setting audio track for ${sessionId}`);

            const mediaStream = new MediaStream([audioTrack.track]);
            audioRef.current.srcObject = mediaStream;

            audioRef.current.play().catch(error => {
                console.error(`❌ Failed to play audio for ${sessionId}:`, error);
            });
        }
    }, [audioTrack?.track, sessionId, isLocal]);

    return (
        <div className="relative bg-gray-800 rounded-lg overflow-hidden aspect-video">
            {/* Video element */}
            {callType === 'video' && (
                <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    autoPlay
                    playsInline
                    muted={isLocal}
                    style={{
                        transform: isLocal ? 'scaleX(-1)' : 'none' // Mirror local video
                    }}
                />
            )}

            {/* Audio element for remote participants */}
            {!isLocal && (
                <audio
                    ref={audioRef}
                    autoPlay
                    playsInline
                />
            )}

            {/* Participant name overlay */}
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                {isLocal ? 'You' : participant.user_name || 'Unknown'}
            </div>

            {/* Video placeholder if no video */}
            {(videoTrack?.state !== 'playable' || callType === 'audio') && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
                    <div className="w-16 h-16 rounded-full bg-gray-600 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                            {(participant.user_name || 'U')[0].toUpperCase()}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}

export function CallInterface({
    roomUrl,
    displayName,
    callType,
    onCallEnd,
    onCallStart,
    bookingData
}: CallInterfaceProps) {
    const { callObject, callState, leave } = useCallState();
    const { allParticipants, localParticipant, remoteParticipants } = useParticipants();
    const { currentUIState, setUIState } = useUIState();
    const { camError, micError } = useMediaDevices();

    // Handle call state changes
    useEffect(() => {
        console.log('📞 CallInterface: Call state changed:', callState);

        switch (callState) {
            case 'CALL_STATE_JOINED':
                setUIState('UI_STATE_JOINED');
                onCallStart();
                break;
            case 'CALL_STATE_LEFT':
                setUIState('UI_STATE_IDLE');
                onCallEnd();
                break;
            case 'CALL_STATE_ERROR':
                setUIState('UI_STATE_ERROR');
                break;
            default:
                break;
        }
    }, [callState, onCallStart, onCallEnd, setUIState]);

    // Handle leave call
    const handleLeaveCall = () => {
        console.log('📞 CallInterface: Leaving call');
        leave();
    };

    // Show loading state
    if (callState === 'CALL_STATE_CREATING' || callState === 'CALL_STATE_JOINING') {
        return (
            <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-700 font-medium">
                        {callState === 'CALL_STATE_CREATING' ? 'Setting up call...' : 'Joining call...'}
                    </p>
                </div>
            </div>
        );
    }

    // Show error state
    if (callState === 'CALL_STATE_ERROR') {
        return (
            <div className="flex items-center justify-center h-64 bg-red-50 rounded-lg border border-red-200">
                <div className="text-center">
                    <p className="text-red-700 font-medium mb-2">Call Error</p>
                    <p className="text-red-600 text-sm">
                        {camError && 'Camera access denied. '}
                        {micError && 'Microphone access denied. '}
                        Please check your permissions and try again.
                    </p>
                    <button
                        onClick={handleLeaveCall}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        End Call
                    </button>
                </div>
            </div>
        );
    }

    // Show call interface
    return (
        <div className="w-full h-full bg-gray-900 rounded-lg overflow-hidden">
            {/* Participants grid */}
            <div className="h-full p-4">
                <div className={`grid gap-4 h-full ${allParticipants.length === 1 ? 'grid-cols-1' :
                        allParticipants.length === 2 ? 'grid-cols-2' :
                            'grid-cols-2 grid-rows-2'
                    }`}>
                    {/* Local participant */}
                    {localParticipant && (
                        <Participant
                            participant={localParticipant}
                            isLocal={true}
                            callType={callType}
                        />
                    )}

                    {/* Remote participants */}
                    {remoteParticipants.map(participant => (
                        <Participant
                            key={participant.session_id}
                            participant={participant}
                            isLocal={false}
                            callType={callType}
                        />
                    ))}
                </div>
            </div>

            {/* Call controls */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4 bg-black bg-opacity-50 rounded-lg p-4">
                <button
                    onClick={handleLeaveCall}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg flex items-center gap-2"
                >
                    <span>End Call</span>
                </button>
            </div>

            {/* Debug info */}
            <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white p-2 rounded text-xs">
                <div>State: {callState}</div>
                <div>Participants: {allParticipants.length}</div>
                <div>Local: {localParticipant ? 'Yes' : 'No'}</div>
                <div>Remote: {remoteParticipants.length}</div>
            </div>
        </div>
    );
} 