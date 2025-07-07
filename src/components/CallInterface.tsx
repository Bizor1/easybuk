'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import DailyVideoCall with SSR disabled to prevent window errors
const DailyVideoCall = dynamic(() => import('./DailyVideoCall'), {
    ssr: false,
    loading: () => (
        <div className="flex flex-col items-center justify-center h-96 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300 text-center">Loading Daily video call...</p>
        </div>
    )
});

interface CallInterfaceProps {
    bookingId: string;
    roomName?: string; // Optional - Daily will generate room names
    displayName: string;
    callType: 'VIDEO_CALL' | 'PHONE_CALL';
    onCallEnd?: () => void;
    onCallStart?: () => void;
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

export default function CallInterface({
    bookingId,
    displayName,
    callType,
    onCallEnd,
    onCallStart
}: CallInterfaceProps) {
    const [roomData, setRoomData] = useState<DailyRoomResponse | null>(null);
    const [isCreatingRoom, setIsCreatingRoom] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const dailyCallType = callType === 'VIDEO_CALL' ? 'video' : 'audio';

    // Create room using Daily.co API
    const createRoom = useCallback(async () => {
        setIsCreatingRoom(true);
        setError(null);

        try {
            console.log('🏠 CallInterface: Creating room for booking:', bookingId);

            const response = await fetch('/api/daily/create-booking-room', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    bookingId,
                    callType: callType.toUpperCase(),
                    displayName
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create room');
            }

            const data = await response.json();
            console.log('✅ CallInterface: Room created successfully:', data);
            setRoomData(data);

        } catch (error) {
            console.error('❌ CallInterface: Failed to create room:', error);
            setError(error instanceof Error ? error.message : 'Failed to create room');
        } finally {
            setIsCreatingRoom(false);
        }
    }, [bookingId, callType, displayName]);

    // Create room on mount
    useEffect(() => {
        if (bookingId && !roomData && !isCreatingRoom) {
            createRoom();
        }
    }, [bookingId, roomData, isCreatingRoom, createRoom]);

    // Show loading state while creating room
    if (isCreatingRoom) {
        return (
            <div className="w-full h-full min-h-[500px] flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-700 dark:text-gray-300 font-medium">Creating call room...</p>
                </div>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="w-full h-full min-h-[500px] flex items-center justify-center bg-red-50 dark:bg-red-900 rounded-lg border border-red-200 dark:border-red-700">
                <div className="text-center">
                    <p className="text-red-700 dark:text-red-300 font-medium mb-2">Call Setup Error</p>
                    <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                    <button
                        onClick={() => {
                            setError(null);
                            setRoomData(null);
                            createRoom();
                        }}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // Show preparing state if no room data yet
    if (!roomData) {
        return (
            <div className="w-full h-full min-h-[500px] flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
                <div className="text-center">
                    <p className="text-gray-700 dark:text-gray-300 font-medium">Preparing call...</p>
                </div>
            </div>
        );
    }

    // Handle call end - call both the local handler and parent handler
    const handleCallEnd = () => {
        console.log('📞 Call ended in CallInterface');
        onCallEnd?.();
    };

    // Handle call start - notify parent
    const handleCallStart = () => {
        console.log('📞 Call started in CallInterface');
        onCallStart?.();
    };

    // Get participant name from booking data
    const participantName = roomData.booking.clientName !== displayName
        ? roomData.booking.clientName
        : roomData.booking.providerName;

    return (
        <div className="w-full h-full min-h-[500px] rounded-lg overflow-hidden bg-gray-900">
            <DailyVideoCall
                roomUrl={roomData.url}
                displayName={displayName}
                participantName={participantName}
                onCallEnd={handleCallEnd}
            />
        </div>
    );
} 