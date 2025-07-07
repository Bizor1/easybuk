'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface BookingVideoCallProps {
    isOpen: boolean;
    onClose: () => void;
    bookingId: string;
    participantName: string;
    callType?: 'VIDEO_CALL' | 'PHONE_CALL';
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

export default function BookingVideoCall({
    isOpen,
    onClose,
    bookingId,
    participantName,
    callType = 'VIDEO_CALL'
}: BookingVideoCallProps) {
    const { user } = useAuth();
    const [roomUrl, setRoomUrl] = useState('');
    const [isCreatingRoom, setIsCreatingRoom] = useState(false);
    const [dailyFrame, setDailyFrame] = useState<any>(null);
    const [callStatus, setCallStatus] = useState('Not connected');
    const [roomData, setRoomData] = useState<DailyRoomResponse | null>(null);

    useEffect(() => {
        if (!isOpen) return;

        // Load Daily script when modal opens
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/@daily-co/daily-js';
        script.onload = () => {
            console.log('Daily script loaded for booking call');
        };
        document.head.appendChild(script);

        return () => {
            // Cleanup when modal closes
            if (script.parentNode) {
                document.head.removeChild(script);
            }
            if (dailyFrame) {
                dailyFrame.destroy();
                setDailyFrame(null);
            }
        };
    }, [isOpen, dailyFrame]);

    const createRoom = async () => {
        setIsCreatingRoom(true);
        try {
            console.log('🏠 Creating room for booking:', bookingId);

            // Try the simpler API first (works like test page)
            let response = await fetch('/api/daily/create-simple-booking-room', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    bookingId,
                    callType: callType.toUpperCase(),
                    displayName: user?.name || 'You'
                })
            });

            // If simple API fails, try the original complex one
            if (!response.ok) {
                console.log('⚠️ Simple API failed, trying complex API...');
                response = await fetch('/api/daily/create-booking-room', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        bookingId,
                        callType: callType.toUpperCase(),
                        displayName: user?.name || 'You'
                    })
                });
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Failed to create room: ${response.status} ${response.statusText}`);
            }

            const room = await response.json();
            setRoomData(room);
            setRoomUrl(room.url);
            setCallStatus('✅ Room created successfully! Ready to join.');
            console.log('Created booking room:', room);

            // 🚀 AUTOMATICALLY SEND VIDEO CALL INVITATION MESSAGE
            try {
                const callTypeDisplay = callType === 'VIDEO_CALL' ? 'Video Call' : 'Audio Call';
                const invitationMessage = `🎯 ${user?.name || 'Someone'} started a ${callTypeDisplay}!\n\nClick the button below to join instantly:`;

                await fetch('/api/messages', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        bookingId,
                        content: invitationMessage,
                        messageType: 'VIDEO_CALL_INVITATION',
                        videoCallData: {
                            roomUrl: room.url,
                            callType: callType,
                            createdBy: user?.name || 'Someone',
                            roomId: room.id || room.name
                        }
                    })
                });

                console.log('✅ Video call invitation sent automatically!');
            } catch (error) {
                console.error('Failed to send automatic invitation:', error);
                // Don't fail the whole process if message sending fails
            }

        } catch (error) {
            console.error('Error creating booking room:', error);
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
            // Create Daily iframe - exactly like the test page
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

            // Event listeners - exactly like the test page
            frame.on('joined-meeting', () => {
                setCallStatus('✅ Connected to call!');
            });

            frame.on('left-meeting', () => {
                setCallStatus('❌ Left the call');
                setDailyFrame(null);
                onClose(); // Close the modal when user leaves the call
            });

            frame.on('error', (error: any) => {
                console.error('Daily error:', error);
                setCallStatus(`Error: ${error.errorMsg || 'Unknown error'}`);
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-4xl h-5/6 mx-4 relative overflow-hidden">
                {/* Header */}
                <div className="absolute top-0 left-0 right-0 bg-white border-b z-10 px-4 py-3">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                {callType === 'VIDEO_CALL' ? '📹 Video Call' : '📞 Audio Call'} with {participantName}
                            </h3>
                            <p className="text-sm text-gray-600">Booking: {bookingId}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                            title="Close call"
                        >
                            ×
                        </button>
                    </div>
                </div>

                {/* Main Content - Styled exactly like the test page */}
                <div className="pt-16 h-full p-5 overflow-y-auto" style={{ fontFamily: 'Arial, sans-serif' }}>
                    <div style={{
                        backgroundColor: '#f8f9fa',
                        padding: '20px',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        border: '1px solid #e9ecef'
                    }}>
                        <h2>📞 {callType === 'VIDEO_CALL' ? 'Video' : 'Audio'} Call for Booking</h2>
                        <p>
                            Using your actual Daily domain: <strong>easybuk.daily.co</strong>
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
                                        width: '300px',
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

                        {roomData && (
                            <div style={{ marginBottom: '15px' }}>
                                <strong>Participants:</strong>
                                <span style={{ marginLeft: '10px', fontSize: '14px' }}>
                                    {roomData.booking.clientName} & {roomData.booking.providerName}
                                </span>
                            </div>
                        )}
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <h3>🚀 Call Controls</h3>
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
                            <button
                                onClick={createRoom}
                                disabled={isCreatingRoom || !!roomUrl}
                                style={{
                                    backgroundColor: (isCreatingRoom || roomUrl) ? '#6c757d' : '#28a745',
                                    color: 'white',
                                    border: 'none',
                                    padding: '12px 24px',
                                    borderRadius: '6px',
                                    cursor: (isCreatingRoom || roomUrl) ? 'not-allowed' : 'pointer',
                                    fontWeight: '500'
                                }}
                            >
                                {isCreatingRoom ? '🔄 Creating...' : roomUrl ? '✅ Room Created' : '🎯 Create Room'}
                            </button>

                            <button
                                onClick={joinCall}
                                disabled={!roomUrl || !!dailyFrame}
                                style={{
                                    backgroundColor: (!roomUrl || dailyFrame) ? '#6c757d' : '#ffc107',
                                    color: 'black',
                                    border: 'none',
                                    padding: '12px 24px',
                                    borderRadius: '6px',
                                    cursor: (!roomUrl || dailyFrame) ? 'not-allowed' : 'pointer',
                                    fontWeight: '500'
                                }}
                            >
                                {callType === 'VIDEO_CALL' ? '📹 Join Video Call' : '📞 Join Audio Call'}
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
                        backgroundColor: '#d4edda',
                        padding: '15px',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        border: '1px solid #c3e6cb'
                    }}>
                        <h3>✅ Secure Booking Call</h3>
                        <p>
                            This {callType === 'VIDEO_CALL' ? 'video' : 'audio'} call is secured to your booking <strong>{bookingId}</strong>
                            with proper authentication and participant validation.
                        </p>
                        <ul>
                            <li>🔒 Authenticated participants only</li>
                            <li>🏠 Dedicated room for this booking</li>
                            <li>📊 Call activity logged for safety</li>
                            <li>⏱️ Automatic room cleanup after session</li>
                        </ul>
                    </div>

                    <div style={{
                        backgroundColor: '#fff3cd',
                        padding: '15px',
                        borderRadius: '8px',
                        border: '1px solid #ffeaa7'
                    }}>
                        <h3>💡 How to Use</h3>
                        <ol>
                            <li><strong>Click &quot;Create Room&quot;</strong> to set up the call room</li>
                            <li><strong>Click &quot;Join Call&quot;</strong> to enter the {callType === 'VIDEO_CALL' ? 'video' : 'audio'} call</li>
                            <li><strong>Share the room URL</strong> with {participantName} so they can join</li>
                            <li><strong>Use the Daily interface</strong> for camera, microphone, and screen sharing controls</li>
                            <li><strong>The call will automatically end</strong> when both participants leave</li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    );
} 