'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { DailyProvider, useDaily, useParticipantIds, useParticipantProperty, useMeetingState, useMediaTrack } from '@daily-co/daily-react';
import DailyIframe from '@daily-co/daily-js';

export default function TestDailyReact() {
    const [roomUrl, setRoomUrl] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [callObject, setCallObject] = useState<any>(null);
    const [isCreatingRoom, setIsCreatingRoom] = useState(false);
    const [roomData, setRoomData] = useState<any>(null);

    // Create a test room
    const createTestRoom = useCallback(async () => {
        setIsCreatingRoom(true);

        try {
            const response = await fetch('/api/daily/create-room', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: `test-room-${Date.now()}`,
                    properties: {
                        max_participants: 2,
                        enable_chat: true,
                        enable_screenshare: true,
                        exp: Math.floor(Date.now() / 1000) + (2 * 60 * 60), // 2 hours
                    }
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create room');
            }

            const data = await response.json();
            setRoomData(data);
            setRoomUrl(data.url);
            console.log('🏠 Test room created:', data);
        } catch (error) {
            console.error('❌ Failed to create test room:', error);
        } finally {
            setIsCreatingRoom(false);
        }
    }, []);

    // Create call object
    useEffect(() => {
        if (roomUrl && !callObject) {
            const call = DailyIframe.createCallObject();
            setCallObject(call);
        }
    }, [roomUrl, callObject]);

    return (
        <div className="container mx-auto p-6 max-w-6xl">
            <div className="bg-white rounded-lg shadow-lg p-6">
                <h1 className="text-2xl font-bold mb-6 text-gray-800">Daily.co React Test Page</h1>

                {/* Setup Section */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h2 className="text-lg font-semibold mb-4">Setup</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Your Name
                            </label>
                            <input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                placeholder="Enter your name"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Room URL
                            </label>
                            <input
                                type="text"
                                value={roomUrl}
                                onChange={(e) => setRoomUrl(e.target.value)}
                                placeholder="Enter Daily.co room URL or create a test room"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="flex space-x-4">
                            <button
                                onClick={createTestRoom}
                                disabled={isCreatingRoom}
                                className={`px-4 py-2 rounded-md font-medium transition-colors ${isCreatingRoom
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                                    }`}
                            >
                                {isCreatingRoom ? 'Creating...' : 'Create Test Room'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Call Section */}
                {callObject && displayName && (
                    <DailyProvider callObject={callObject}>
                        <TestCallInterface roomUrl={roomUrl} displayName={displayName} />
                    </DailyProvider>
                )}

                {/* Instructions */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2 text-blue-800">Instructions</h3>
                    <ul className="text-blue-700 space-y-1">
                        <li>1. Enter your name</li>
                        <li>2. Click &quot;Create Test Room&quot; to create a new room</li>
                        <li>3. Click &quot;Join Call&quot; to join the room</li>
                        <li>4. Open this page in another tab/browser to test with 2 participants</li>
                        <li>5. Check the console logs to see participant identification details</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

// Test call interface component
interface TestCallInterfaceProps {
    roomUrl: string;
    displayName: string;
}

function TestCallInterface({ roomUrl, displayName }: TestCallInterfaceProps) {
    const callObject = useDaily();
    const meetingState = useMeetingState();
    const participantIds = useParticipantIds();
    const [hasJoined, setHasJoined] = useState(false);
    const [debugInfo, setDebugInfo] = useState<any>({});

    // Debug logging
    useEffect(() => {
        const info = {
            meetingState,
            participantIds,
            participantCount: participantIds.length,
            hasJoined,
            timestamp: new Date().toISOString()
        };
        setDebugInfo(info);
        console.log('📊 Test Call Debug Info:', info);
    }, [meetingState, participantIds, hasJoined]);

    // Handle meeting state changes
    useEffect(() => {
        if (meetingState === 'joined-meeting' && !hasJoined) {
            setHasJoined(true);
            console.log('✅ Successfully joined test call');
        } else if (meetingState === 'left-meeting') {
            setHasJoined(false);
            console.log('👋 Left test call');
        }
    }, [meetingState, hasJoined]);

    // Join call
    const joinCall = useCallback(async () => {
        if (!callObject) return;

        try {
            console.log('🚀 Joining test call...');
            console.log('📋 Join parameters:', {
                url: roomUrl,
                userName: displayName,
                startVideoOff: false,
                startAudioOff: false
            });

            await callObject.join({
                url: roomUrl,
                userName: displayName,
                startVideoOff: false,
                startAudioOff: false
            });

            console.log('✅ Join call successful');
        } catch (error) {
            console.error('❌ Failed to join test call:', error);
        }
    }, [callObject, roomUrl, displayName]);

    // Leave call
    const leaveCall = useCallback(async () => {
        if (!callObject) return;

        try {
            await callObject.leave();
            console.log('👋 Left test call');
        } catch (error) {
            console.error('❌ Failed to leave test call:', error);
        }
    }, [callObject]);

    return (
        <div className="space-y-6">
            {/* Call Controls */}
            <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Call Controls</h3>

                <div className="flex space-x-4 mb-4">
                    <button
                        onClick={joinCall}
                        disabled={hasJoined}
                        className={`px-4 py-2 rounded-md font-medium transition-colors ${hasJoined
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-green-600 hover:bg-green-700 text-white'
                            }`}
                    >
                        {hasJoined ? 'Already Joined' : 'Join Call'}
                    </button>

                    <button
                        onClick={leaveCall}
                        disabled={!hasJoined}
                        className={`px-4 py-2 rounded-md font-medium transition-colors ${!hasJoined
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-red-600 hover:bg-red-700 text-white'
                            }`}
                    >
                        Leave Call
                    </button>
                </div>

                <div className="text-sm text-gray-600">
                    <p><strong>Meeting State:</strong> {meetingState}</p>
                    <p><strong>Participant Count:</strong> {participantIds.length}</p>
                </div>
            </div>

            {/* Debug Information */}
            <div className="p-4 bg-yellow-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Debug Information</h3>
                <pre className="text-sm text-gray-700 bg-white p-3 rounded overflow-auto">
                    {JSON.stringify(debugInfo, null, 2)}
                </pre>
            </div>

            {/* Participants */}
            {hasJoined && (
                <div className="p-4 bg-green-50 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Participants</h3>
                    <div className="space-y-4">
                        {participantIds.map((participantId) => (
                            <TestParticipantInfo key={participantId} participantId={participantId} />
                        ))}

                        {/* Also show local participant */}
                        <TestParticipantInfo participantId="local" />
                    </div>
                </div>
            )}

            {/* Video Grid */}
            {hasJoined && (
                <div className="p-4 bg-gray-900 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4 text-white">Video Grid</h3>
                    <TestVideoGrid participantIds={participantIds} />
                </div>
            )}
        </div>
    );
}

// Test participant info component
function TestParticipantInfo({ participantId }: { participantId: string }) {
    const userName = useParticipantProperty(participantId, 'user_name');
    const isLocalProperty = useParticipantProperty(participantId, 'local');
    const videoMediaTrack = useMediaTrack(participantId, 'video');
    const audioMediaTrack = useMediaTrack(participantId, 'audio');

    const participantInfo = {
        participantId,
        userName,
        isLocal: participantId === 'local',
        isLocalProperty,
        videoState: videoMediaTrack?.state,
        audioState: audioMediaTrack?.state,
        hasVideoTrack: !!videoMediaTrack?.track,
        hasAudioTrack: !!audioMediaTrack?.track,
    };

    console.log(`🔍 Participant Info for ${participantId}:`, participantInfo);

    return (
        <div className="p-3 bg-white rounded border">
            <h4 className="font-semibold mb-2">Participant: {participantId}</h4>
            <div className="text-sm space-y-1">
                <p><strong>User Name:</strong> {userName || 'null'}</p>
                <p><strong>Is Local (ID check):</strong> {participantId === 'local' ? 'true' : 'false'}</p>
                <p><strong>Is Local (Property):</strong> {isLocalProperty ? 'true' : 'false'}</p>
                <p><strong>Video State:</strong> {videoMediaTrack?.state || 'null'}</p>
                <p><strong>Audio State:</strong> {audioMediaTrack?.state || 'null'}</p>
                <p><strong>Has Video Track:</strong> {!!videoMediaTrack?.track ? 'true' : 'false'}</p>
                <p><strong>Has Audio Track:</strong> {!!audioMediaTrack?.track ? 'true' : 'false'}</p>
            </div>
        </div>
    );
}

// Test video grid component
function TestVideoGrid({ participantIds }: { participantIds: string[] }) {
    const callObject = useDaily();
    const participants = callObject?.participants();

    // Get all participants including local
    const allParticipants = [];
    if (participants?.local) {
        allParticipants.push('local');
    }
    participantIds.forEach(id => {
        if (id !== 'local') {
            allParticipants.push(id);
        }
    });

    console.log('🎬 Video Grid Participants:', {
        participantIds,
        allParticipants,
        localParticipant: participants?.local
    });

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allParticipants.map((participantId) => (
                <TestVideoTile key={participantId} participantId={participantId} />
            ))}
        </div>
    );
}

// Test video tile component
function TestVideoTile({ participantId }: { participantId: string }) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const userName = useParticipantProperty(participantId, 'user_name');
    const isLocal = participantId === 'local';
    const videoMediaTrack = useMediaTrack(participantId, 'video');

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

    const displayName = isLocal ? (userName || 'You') : (userName || 'Guest');

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

            {/* Placeholder when no video */}
            {videoMediaTrack?.state !== 'playable' && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
                    <div className="text-center">
                        <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-2">
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <p className="text-white text-sm">{displayName}</p>
                        <p className="text-gray-400 text-xs mt-1">
                            {videoMediaTrack?.state || 'No video'}
                        </p>
                    </div>
                </div>
            )}

            {/* Participant name overlay */}
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                {displayName} ({participantId})
            </div>

            {/* Status indicator */}
            <div className="absolute top-2 right-2">
                <div className={`w-3 h-3 rounded-full ${videoMediaTrack?.state === 'playable' ? 'bg-green-500' : 'bg-red-500'
                    }`} title={`Video: ${videoMediaTrack?.state || 'off'}`} />
            </div>
        </div>
    );
} 