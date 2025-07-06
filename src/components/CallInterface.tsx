'use client';

import React from 'react';
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

export default function CallInterface({
    bookingId,
    displayName,
    callType,
    onCallEnd,
    onCallStart
}: CallInterfaceProps) {
    const dailyCallType = callType === 'VIDEO_CALL' ? 'video' : 'audio';

    return (
        <div className="w-full h-full min-h-[500px] rounded-lg overflow-hidden bg-gray-900">
            <DailyVideoCall
                bookingId={bookingId}
                displayName={displayName}
                callType={dailyCallType}
                onCallEnd={onCallEnd || (() => { })}
                onCallStart={onCallStart || (() => { })}
            />
        </div>
    );
} 