'use client';

import React from 'react';
import VideoCallCorrect from './VideoCallCorrect';

interface VideoCallModalProps {
    isOpen: boolean;
    onClose: () => void;
    bookingId: string;
    participantName: string;
}

export default function VideoCallModal({ isOpen, onClose, bookingId, participantName }: VideoCallModalProps) {
    if (!isOpen) return null;

    const handleCallStart = () => {
        console.log('Video call started');
    };

    const handleCallEnd = () => {
        console.log('Video call ended');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl h-3/4 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
                >
                    ×
                </button>

                <div className="h-full">
                    <VideoCallCorrect
                        bookingId={bookingId}
                        displayName={participantName}
                        onCallStart={handleCallStart}
                        onCallEnd={handleCallEnd}
                    />
                </div>
            </div>
        </div>
    );
} 