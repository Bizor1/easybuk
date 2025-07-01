'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import VideoCall with SSR disabled to prevent window errors
const VideoCall = dynamic(() => import('./VideoCall'), {
    ssr: false,
    loading: () => (
        <div className="flex flex-col items-center justify-center h-96 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300 text-center">Loading video call...</p>
        </div>
    )
});

interface VideoCallModalProps {
    isOpen: boolean;
    onClose: () => void;
    bookingId: string;
    displayName: string;
    participantName?: string;
}

export default function VideoCallModal({
    isOpen,
    onClose,
    bookingId,
    displayName,
    participantName
}: VideoCallModalProps) {
    if (!isOpen) return null;

    const handleCallEnd = () => {
        onClose();
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        // Prevent closing when clicking on the modal content
        if (e.target === e.currentTarget) {
            // Don't close accidentally during video calls
            const confirmed = window.confirm('Are you sure you want to end the video call?');
            if (confirmed) {
                onClose();
            }
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
            onClick={handleBackdropClick}
        >
            <div className="w-full max-w-6xl h-full max-h-[90vh] bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Video Consultation
                            {participantName && (
                                <span className="text-sm font-normal text-gray-600 dark:text-gray-300 ml-2">
                                    with {participantName}
                                </span>
                            )}
                        </h2>
                    </div>

                    <button
                        onClick={() => {
                            const confirmed = window.confirm('Are you sure you want to end the video call?');
                            if (confirmed) {
                                onClose();
                            }
                        }}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Video Call Content */}
                <div className="h-full">
                    <VideoCall
                        bookingId={bookingId}
                        displayName={displayName}
                        onCallEnd={handleCallEnd}
                        onCallStart={() => console.log('Video call started')}
                    />
                </div>

                {/* Footer with call controls info */}
                <div className="bg-gray-50 dark:bg-gray-700 px-6 py-3 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
                        <div className="flex items-center space-x-4">
                            <span className="flex items-center space-x-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                <span>HD Video</span>
                            </span>
                            <span className="flex items-center space-x-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                <span>Secure & Encrypted</span>
                            </span>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            Booking: {bookingId}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 