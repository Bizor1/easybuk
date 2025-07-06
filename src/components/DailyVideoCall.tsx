'use client';

import { useEffect, useState, useCallback } from 'react';
import { CallProvider } from './daily-contexts/CallProvider';
import { ParticipantsProvider } from './daily-contexts/ParticipantsProvider';
import { TracksProvider } from './daily-contexts/TracksProvider';
import { MediaDeviceProvider } from './daily-contexts/MediaDeviceProvider';
import { UIStateProvider } from './daily-contexts/UIStateProvider';
import { CallInterface } from './daily-call/CallInterface';

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
    const [error, setError] = useState<string | null>(null);
    const [isCreatingRoom, setIsCreatingRoom] = useState(false);

    // Create room using Daily.co recommended approach
    const createRoom = useCallback(async () => {
        setIsCreatingRoom(true);
        setError(null);

        try {
            console.log('🏠 DailyVideoCall: Creating room for booking:', bookingId);

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
            console.log('✅ DailyVideoCall: Room created successfully:', data);
            setRoomData(data);

        } catch (error) {
            console.error('❌ DailyVideoCall: Failed to create room:', error);
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

    // Show loading state
    if (isCreatingRoom) {
        return (
            <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-700 font-medium">Creating call room...</p>
                </div>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="flex items-center justify-center h-64 bg-red-50 rounded-lg border border-red-200">
                <div className="text-center">
                    <p className="text-red-700 font-medium mb-2">Call Setup Error</p>
                    <p className="text-red-600 text-sm">{error}</p>
                    <button
                        onClick={() => {
                            setError(null);
                            setRoomData(null);
                            createRoom();
                        }}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // Wait for room data
    if (!roomData) {
        return (
            <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
                <div className="text-center">
                    <p className="text-gray-700 font-medium">Preparing call...</p>
                </div>
            </div>
        );
    }

    // Daily.co recommended context hierarchy from their documentation
    return (
        <div className="w-full h-[600px]">
            <UIStateProvider>
                <CallProvider
                    domain={process.env.NEXT_PUBLIC_DAILY_DOMAIN || ''}
                    room={roomData.url}
                    userName={displayName}
                >
                    <ParticipantsProvider>
                        <TracksProvider>
                            <MediaDeviceProvider>
                                <CallInterface
                                    roomUrl={roomData.url}
                                    displayName={displayName}
                                    callType={callType}
                                    onCallEnd={onCallEnd}
                                    onCallStart={onCallStart}
                                    bookingData={roomData.booking}
                                />
                            </MediaDeviceProvider>
                        </TracksProvider>
                    </ParticipantsProvider>
                </CallProvider>
            </UIStateProvider>
        </div>
    );
} 