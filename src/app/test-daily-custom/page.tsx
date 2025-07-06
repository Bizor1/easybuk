'use client';

import { useEffect, useState, useRef } from 'react';

export default function TestDailyCustom() {
    const [roomUrl, setRoomUrl] = useState('');
    const [callObject, setCallObject] = useState<any>(null);
    const [participants, setParticipants] = useState<any>({});
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [connectionState, setConnectionState] = useState('not-connected');
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideosRef = useRef<HTMLDivElement>(null);
    const [isCreatingRoom, setIsCreatingRoom] = useState(false);
    const [callStatus, setCallStatus] = useState('');

    useEffect(() => {
        // Load Daily script and initialize
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/@daily-co/daily-js';
        script.onload = initializeDaily;
        document.head.appendChild(script);

        return () => {
            document.head.removeChild(script);
        };
    }, []);

    const initializeDaily = () => {
        console.log('Daily script loaded, initializing...');
    };

    const createRoom = async () => {
        setIsCreatingRoom(true);
        try {
            // Use our API endpoint to create a proper room
            const response = await fetch('/api/daily/create-room', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    roomName: `test-room-${Date.now()}`,
                    properties: {
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
                throw new Error(errorData.error || `Failed to create room: ${response.status} ${response.statusText}`);
            }

            const room = await response.json();
            setRoomUrl(room.url);
            setCallStatus('✅ Room created successfully! Ready to join.');
            console.log('Created room:', room);
        } catch (error) {
            console.error('Error creating room:', error);
            setCallStatus(`❌ Error creating room: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsCreatingRoom(false);
        }
    };

    const joinCall = async () => {
        if (!roomUrl) {
            alert('Please create a room first!');
            return;
        }

        try {
            // Create call object
            const callObj = (window as any).DailyIframe.createCallObject();
            setCallObject(callObj);
            setConnectionState('connecting');

            // Set up event listeners
            callObj
                .on('joined-meeting', handleJoinedMeeting)
                .on('participant-joined', handleParticipantJoined)
                .on('participant-updated', handleParticipantUpdated)
                .on('participant-left', handleParticipantLeft)
                .on('track-started', handleTrackStarted)
                .on('track-stopped', handleTrackStopped)
                .on('left-meeting', handleLeftMeeting)
                .on('error', handleError);

            // Join the call
            await callObj.join({ url: roomUrl });

        } catch (error) {
            console.error('Error joining call:', error);
            setConnectionState('error');
        }
    };

    const handleJoinedMeeting = () => {
        console.log('Joined meeting successfully');
        setConnectionState('connected');
        updateParticipants();
    };

    const handleParticipantJoined = (event: any) => {
        console.log('Participant joined:', event.participant);
        updateParticipants();
    };

    const handleParticipantUpdated = (event: any) => {
        console.log('Participant updated:', event.participant);
        updateParticipants();
    };

    const handleParticipantLeft = (event: any) => {
        console.log('Participant left:', event.participant);
        updateParticipants();

        // Remove their video element
        const videoElement = document.getElementById(`video-${event.participant.session_id}`);
        if (videoElement) {
            videoElement.remove();
        }
    };

    const handleTrackStarted = (event: any) => {
        console.log('Track started:', event);
        if (event.track && event.participant) {
            if (event.participant.local) {
                // Local participant video
                if (event.track.kind === 'video' && localVideoRef.current) {
                    const mediaStream = new MediaStream([event.track]);
                    localVideoRef.current.srcObject = mediaStream;
                }
            } else {
                // Remote participant video
                if (event.track.kind === 'video') {
                    createRemoteVideoElement(event.participant, event.track);
                }
            }
        }
    };

    const handleTrackStopped = (event: any) => {
        console.log('Track stopped:', event);
        if (event.participant && !event.participant.local && event.track.kind === 'video') {
            const videoElement = document.getElementById(`video-${event.participant.session_id}`);
            if (videoElement) {
                videoElement.remove();
            }
        }
    };

    const handleLeftMeeting = () => {
        console.log('Left meeting');
        setConnectionState('disconnected');
        setParticipants({});

        // Clear video elements
        if (localVideoRef.current) {
            localVideoRef.current.srcObject = null;
        }
        if (remoteVideosRef.current) {
            remoteVideosRef.current.innerHTML = '';
        }
    };

    const handleError = (error: any) => {
        console.error('Daily error:', error);
        setConnectionState('error');
    };

    const updateParticipants = () => {
        if (callObject) {
            const currentParticipants = callObject.participants();
            setParticipants(currentParticipants);
            console.log('Current participants:', currentParticipants);
        }
    };

    const createRemoteVideoElement = (participant: any, track: any) => {
        if (!remoteVideosRef.current) return;

        // Remove existing video for this participant
        const existingVideo = document.getElementById(`video-${participant.session_id}`);
        if (existingVideo) {
            existingVideo.remove();
        }

        // Create new video element
        const videoContainer = document.createElement('div');
        videoContainer.id = `video-${participant.session_id}`;
        videoContainer.style.cssText = `
      position: relative;
      width: 300px;
      height: 200px;
      margin: 10px;
      border: 2px solid #007bff;
      border-radius: 8px;
      overflow: hidden;
    `;

        const video = document.createElement('video');
        video.autoplay = true;
        video.playsInline = true;
        video.muted = false;
        video.style.cssText = `
      width: 100%;
      height: 100%;
      object-fit: cover;
    `;

        const label = document.createElement('div');
        label.textContent = participant.user_name || `Participant ${participant.session_id.slice(0, 8)}`;
        label.style.cssText = `
      position: absolute;
      bottom: 5px;
      left: 5px;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 12px;
    `;

        const mediaStream = new MediaStream([track]);
        video.srcObject = mediaStream;

        videoContainer.appendChild(video);
        videoContainer.appendChild(label);
        remoteVideosRef.current.appendChild(videoContainer);
    };

    const toggleMic = () => {
        if (callObject) {
            if (isMuted) {
                callObject.setLocalAudio(true);
            } else {
                callObject.setLocalAudio(false);
            }
            setIsMuted(!isMuted);
        }
    };

    const toggleVideo = () => {
        if (callObject) {
            if (isVideoOff) {
                callObject.setLocalVideo(true);
            } else {
                callObject.setLocalVideo(false);
            }
            setIsVideoOff(!isVideoOff);
        }
    };

    const leaveCall = async () => {
        if (callObject) {
            await callObject.leave();
            callObject.destroy();
            setCallObject(null);
            setConnectionState('disconnected');
        }
    };

    // Cleanup call object on unmount
    useEffect(() => {
        return () => {
            if (callObject) {
                callObject.destroy();
            }
        };
    }, [callObject]);

    const getStatusColor = () => {
        switch (connectionState) {
            case 'connected': return '#28a745';
            case 'connecting': return '#ffc107';
            case 'error': return '#dc3545';
            case 'room-created': return '#17a2b8';
            default: return '#6c757d';
        }
    };

    const getStatusText = () => {
        switch (connectionState) {
            case 'connected': return '✅ Connected to call';
            case 'connecting': return '🔄 Connecting...';
            case 'error': return '❌ Connection error';
            case 'room-created': return '🏠 Room created';
            case 'disconnected': return '📞 Disconnected';
            default: return '⚪ Not connected';
        }
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1200px' }}>
            <h1>Daily Video Calling Test - Custom SDK</h1>

            <div style={{
                backgroundColor: '#f8f9fa',
                padding: '20px',
                borderRadius: '8px',
                marginBottom: '20px',
                border: '1px solid #e9ecef'
            }}>
                <h2>🛠️ Daily Client SDK Demo</h2>
                <p>
                    The Daily Client SDK gives you full control over the video calling experience.
                    Build custom interfaces and handle all video/audio streams directly.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '15px' }}>
                    <div>
                        <strong>Status:</strong>
                        <span style={{
                            marginLeft: '10px',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            backgroundColor: getStatusColor(),
                            color: 'white',
                            fontSize: '14px'
                        }}>
                            {getStatusText()}
                        </span>
                    </div>

                    <div>
                        <strong>Participants:</strong>
                        <span style={{ marginLeft: '10px', fontSize: '14px' }}>
                            {Object.keys(participants).length}
                        </span>
                    </div>
                </div>

                {roomUrl && (
                    <div style={{ marginBottom: '15px' }}>
                        <strong>Room URL:</strong>
                        <input
                            type="text"
                            value={roomUrl}
                            readOnly
                            style={{
                                marginLeft: '10px',
                                padding: '5px',
                                width: '400px',
                                fontSize: '12px',
                                backgroundColor: '#f8f9fa',
                                border: '1px solid #ced4da',
                                borderRadius: '4px'
                            }}
                        />
                        <button
                            onClick={() => navigator.clipboard.writeText(roomUrl)}
                            style={{
                                marginLeft: '5px',
                                padding: '5px 10px',
                                backgroundColor: '#6c757d',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px'
                            }}
                        >
                            📋 Copy
                        </button>
                    </div>
                )}
            </div>

            <div style={{ marginBottom: '20px' }}>
                <h3>Controls</h3>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
                    <button
                        onClick={createRoom}
                        disabled={!!roomUrl}
                        style={{
                            backgroundColor: roomUrl ? '#6c757d' : '#007bff',
                            color: 'white',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '6px',
                            cursor: roomUrl ? 'not-allowed' : 'pointer',
                            fontWeight: '500'
                        }}
                    >
                        🏠 Create Room
                    </button>

                    <button
                        onClick={joinCall}
                        disabled={!roomUrl || !!callObject}
                        style={{
                            backgroundColor: (!roomUrl || callObject) ? '#6c757d' : '#28a745',
                            color: 'white',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '6px',
                            cursor: (!roomUrl || callObject) ? 'not-allowed' : 'pointer',
                            fontWeight: '500'
                        }}
                    >
                        📹 Join Call
                    </button>

                    <button
                        onClick={toggleMic}
                        disabled={!callObject}
                        style={{
                            backgroundColor: !callObject ? '#6c757d' : isMuted ? '#dc3545' : '#28a745',
                            color: 'white',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '6px',
                            cursor: !callObject ? 'not-allowed' : 'pointer',
                            fontWeight: '500'
                        }}
                    >
                        {isMuted ? '🔇 Unmute' : '🎤 Mute'}
                    </button>

                    <button
                        onClick={toggleVideo}
                        disabled={!callObject}
                        style={{
                            backgroundColor: !callObject ? '#6c757d' : isVideoOff ? '#dc3545' : '#28a745',
                            color: 'white',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '6px',
                            cursor: !callObject ? 'not-allowed' : 'pointer',
                            fontWeight: '500'
                        }}
                    >
                        {isVideoOff ? '📹 Video On' : '📵 Video Off'}
                    </button>

                    <button
                        onClick={leaveCall}
                        disabled={!callObject}
                        style={{
                            backgroundColor: !callObject ? '#6c757d' : '#dc3545',
                            color: 'white',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '6px',
                            cursor: !callObject ? 'not-allowed' : 'pointer',
                            fontWeight: '500'
                        }}
                    >
                        📞 Leave Call
                    </button>
                </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <h3>Video Streams</h3>
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '20px',
                    minHeight: '220px',
                    backgroundColor: '#f8f9fa',
                    padding: '20px',
                    borderRadius: '8px',
                    border: '1px solid #e9ecef'
                }}>
                    {/* Local Video */}
                    <div style={{
                        position: 'relative',
                        width: '300px',
                        height: '200px',
                        border: '2px solid #28a745',
                        borderRadius: '8px',
                        overflow: 'hidden'
                    }}>
                        <video
                            ref={localVideoRef}
                            autoPlay
                            playsInline
                            muted
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                backgroundColor: '#000'
                            }}
                        />
                        <div style={{
                            position: 'absolute',
                            bottom: '5px',
                            left: '5px',
                            background: 'rgba(0, 0, 0, 0.7)',
                            color: 'white',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '12px'
                        }}>
                            You (Local)
                        </div>
                    </div>

                    {/* Remote Videos Container */}
                    <div ref={remoteVideosRef} style={{ display: 'flex', flexWrap: 'wrap' }}>
                        {/* Remote videos will be added here dynamically */}
                    </div>

                    {connectionState === 'not-connected' && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '100%',
                            height: '150px',
                            color: '#6c757d',
                            fontSize: '16px'
                        }}>
                            👆 Create a room and join to start video calling
                        </div>
                    )}
                </div>
            </div>

            <div style={{
                backgroundColor: '#e7f3ff',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '20px',
                border: '1px solid #bee5eb'
            }}>
                <h3>💡 How to Test</h3>
                <ol>
                    <li><strong>Create Room:</strong> Click &quot;Create Room&quot; to generate a new Daily room</li>
                    <li><strong>Join Call:</strong> Click &quot;Join Call&quot; to connect (you&apos;ll see your video appear)</li>
                    <li><strong>Test Controls:</strong> Try muting/unmuting and turning video on/off</li>
                    <li><strong>Multiple Users:</strong> Copy room URL and open in another tab/device</li>
                    <li><strong>Observe Events:</strong> Check browser console for detailed event logs</li>
                </ol>
            </div>

            <div style={{
                backgroundColor: '#d4edda',
                padding: '15px',
                borderRadius: '8px',
                border: '1px solid #c3e6cb'
            }}>
                <h3>🚀 Daily Client SDK Features</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <ul>
                        <li>✅ Direct access to video/audio tracks</li>
                        <li>✅ Custom UI control</li>
                        <li>✅ Real-time participant events</li>
                        <li>✅ Programmatic audio/video control</li>
                        <li>✅ Network quality monitoring</li>
                    </ul>
                    <ul>
                        <li>✅ Screen sharing APIs</li>
                        <li>✅ Recording control</li>
                        <li>✅ Custom layouts</li>
                        <li>✅ React/Vue integration</li>
                        <li>✅ Advanced configuration</li>
                    </ul>
                </div>
            </div>
        </div>
    );
} 