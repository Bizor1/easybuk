'use client';

import React from 'react';
import CallInterface from './CallInterface';

interface VideoCallModalProps {
    isOpen: boolean;
    onClose: () => void;
    bookingId: string;
    participantName: string;
    callType?: 'VIDEO_CALL' | 'PHONE_CALL';
}

export default function VideoCallModal({
    isOpen,
    onClose,
    bookingId,
    participantName,
    callType = 'VIDEO_CALL'
}: VideoCallModalProps) {
    if (!isOpen) return null;

    const handleCallStart = () => {
        console.log('Daily video call started for booking:', bookingId);
    };

    const handleCallEnd = () => {
        console.log('Daily video call ended for booking:', bookingId);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-6xl h-5/6 mx-4 relative overflow-hidden">
                {/* Header */}
                <div className="absolute top-0 left-0 right-0 bg-white border-b z-10 px-4 py-3 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                            {callType === 'VIDEO_CALL' ? 'Video Call' : 'Audio Call'} with {participantName}
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

                {/* Call Interface */}
                <div className="pt-16 h-full">
                    <CallInterface
                        bookingId={bookingId}
                        displayName={participantName}
                        callType={callType}
                        onCallStart={handleCallStart}
                        onCallEnd={handleCallEnd}
                    />
                </div>
            </div>
        </div>
    );
} 