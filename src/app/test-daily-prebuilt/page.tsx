'use client';

import { useEffect, useState } from 'react';

export default function TestDailyPrebuilt() {
    const [roomUrl, setRoomUrl] = useState('');
    const [isCreatingRoom, setIsCreatingRoom] = useState(false);
    const [dailyFrame, setDailyFrame] = useState<any>(null);
    const [callStatus, setCallStatus] = useState('Not connected');

    useEffect(() => {
        // Load Daily script
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/@daily-co/daily-js';
        script.onload = () => {
            console.log('Daily script loaded');
        };
        document.head.appendChild(script);

        return () => {
            document.head.removeChild(script);
        };
    }, []);

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

    const joinCall = () => {
        if (!roomUrl) {
            alert('Please create a room first!');
            return;
        }

        try {
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
            });

            // Event listeners
            frame.on('joined-meeting', () => {
                setCallStatus('✅ Connected to call!');
            });

            frame.on('left-meeting', () => {
                setCallStatus('❌ Left the call');
                setDailyFrame(null);
            });

            frame.on('error', (error: any) => {
                console.error('Daily error:', error);
                setCallStatus(`Error: ${error.errorMsg}`);
            });

            // Join the room
            frame.join({ url: roomUrl });
            setDailyFrame(frame);
            setCallStatus('🔄 Joining call...');

        } catch (error) {
            console.error('Error joining call:', error);
            setCallStatus('Error joining call');
        }
    };

    const leaveCall = () => {
        if (dailyFrame) {
            dailyFrame.leave();
            dailyFrame.destroy();
            setDailyFrame(null);
            setCallStatus('Left the call');
        }
    };

    // Cleanup dailyFrame on unmount
    useEffect(() => {
        return () => {
            if (dailyFrame) {
                dailyFrame.destroy();
            }
        };
    }, [dailyFrame]);

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '800px' }}>
            <h1>Daily Video Calling Test - Prebuilt</h1>

            <div style={{
                backgroundColor: '#f8f9fa',
                padding: '20px',
                borderRadius: '8px',
                marginBottom: '20px',
                border: '1px solid #e9ecef'
            }}>
                <h2>📞 Daily Prebuilt Demo</h2>
                <p>
                    Daily Prebuilt is the easiest way to add video calling to your app.
                    It provides a complete, ready-to-use interface in an iframe.
                </p>

                <div style={{ marginBottom: '15px' }}>
                    <strong>Status:</strong>
                    <span style={{
                        marginLeft: '10px',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        backgroundColor: callStatus.includes('✅') ? '#d4edda' :
                            callStatus.includes('❌') ? '#f8d7da' :
                                callStatus.includes('🔄') ? '#fff3cd' : '#e9ecef',
                        fontSize: '14px'
                    }}>
                        {callStatus}
                    </span>
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
                <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                    <button
                        onClick={createRoom}
                        disabled={isCreatingRoom}
                        style={{
                            backgroundColor: isCreatingRoom ? '#6c757d' : '#007bff',
                            color: 'white',
                            border: 'none',
                            padding: '12px 24px',
                            borderRadius: '6px',
                            cursor: isCreatingRoom ? 'not-allowed' : 'pointer',
                            fontWeight: '500'
                        }}
                    >
                        {isCreatingRoom ? '🔄 Creating...' : '🏠 Create Room'}
                    </button>

                    <button
                        onClick={joinCall}
                        disabled={!roomUrl || !!dailyFrame}
                        style={{
                            backgroundColor: (!roomUrl || dailyFrame) ? '#6c757d' : '#28a745',
                            color: 'white',
                            border: 'none',
                            padding: '12px 24px',
                            borderRadius: '6px',
                            cursor: (!roomUrl || dailyFrame) ? 'not-allowed' : 'pointer',
                            fontWeight: '500'
                        }}
                    >
                        📹 Join Call
                    </button>

                    <button
                        onClick={leaveCall}
                        disabled={!dailyFrame}
                        style={{
                            backgroundColor: !dailyFrame ? '#6c757d' : '#dc3545',
                            color: 'white',
                            border: 'none',
                            padding: '12px 24px',
                            borderRadius: '6px',
                            cursor: !dailyFrame ? 'not-allowed' : 'pointer',
                            fontWeight: '500'
                        }}
                    >
                        📞 Leave Call
                    </button>
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
                    <li><strong>Join Call:</strong> Click &quot;Join Call&quot; to enter the video call in fullscreen</li>
                    <li><strong>Test Multiple Users:</strong>
                        <ul>
                            <li>Copy the room URL and open it in another browser tab/window</li>
                            <li>Or share the URL with someone else to join from another device</li>
                        </ul>
                    </li>
                    <li><strong>Leave Call:</strong> Use the leave button inside the call interface or click &quot;Leave Call&quot;</li>
                </ol>
            </div>

            <div style={{
                backgroundColor: '#fff3cd',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '20px',
                border: '1px solid #ffeaa7'
            }}>
                <h3>⚠️ Important Notes</h3>
                <ul>
                    <li><strong>Domain Required:</strong> For production, you need a Daily domain. This demo uses a placeholder.</li>
                    <li><strong>Room Creation:</strong> In production, create rooms via Daily&apos;s REST API on your backend.</li>
                    <li><strong>Permissions:</strong> Browser will ask for camera/microphone permissions.</li>
                    <li><strong>HTTPS:</strong> Daily requires HTTPS in production (localhost works for testing).</li>
                </ul>
            </div>

            <div style={{
                backgroundColor: '#d4edda',
                padding: '15px',
                borderRadius: '8px',
                border: '1px solid #c3e6cb'
            }}>
                <h3>✅ Daily Prebuilt Features</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <ul>
                        <li>🎥 Video calling</li>
                        <li>🎤 Audio controls</li>
                        <li>🖥️ Screen sharing</li>
                        <li>💬 Text chat</li>
                        <li>👥 Participant list</li>
                    </ul>
                    <ul>
                        <li>🔧 Device settings</li>
                        <li>📊 Network quality</li>
                        <li>🎨 Customizable themes</li>
                        <li>📱 Mobile responsive</li>
                        <li>🌍 Multi-language support</li>
                    </ul>
                </div>
            </div>
        </div>
    );
} 