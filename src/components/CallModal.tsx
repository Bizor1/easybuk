'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import CallInterface with SSR disabled to prevent window errors
const CallInterface = dynamic(() => import('./CallInterface'), {
    ssr: false,
    loading: () => (
        <div className="flex flex-col items-center justify-center h-96 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300 text-center">Loading call interface...</p>
        </div>
    )
});

interface CallModalProps {
    isOpen: boolean;
    onClose: () => void;
    roomName: string;
    displayName: string;
    participantName: string;
    callType: 'VIDEO_CALL' | 'PHONE_CALL';
}

export default function CallModal({
    isOpen,
    onClose,
    roomName,
    displayName,
    participantName,
    callType
}: CallModalProps) {
    const [isCallActive, setIsCallActive] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    const isVideoCall = callType === 'VIDEO_CALL';
    const isAudioCall = callType === 'PHONE_CALL';

    const handleClose = () => {
        if (isCallActive) {
            setShowConfirmDialog(true);
        } else {
            onClose();
        }
    };

    const handleConfirmClose = () => {
        setShowConfirmDialog(false);
        setIsCallActive(false);
        onClose();
    };

    const handleCallStart = () => {
        setIsCallActive(true);
    };

    const handleCallEnd = () => {
        setIsCallActive(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl h-full max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className={`px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between ${isVideoCall ? 'bg-blue-600 text-white' : 'bg-purple-600 text-white'
                    }`}>
                    <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isVideoCall ? 'bg-blue-500' : 'bg-purple-500'
                            }`}>
                            {isVideoCall ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                            )}
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold">
                                {isVideoCall ? 'Video Call' : 'Audio Call'} with {participantName}
                            </h3>
                            <p className="text-sm opacity-90">
                                {isCallActive ? 'Call in progress' : 'Connecting...'}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleClose}
                        className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Call Interface */}
                <div className="flex-1 p-0">
                    <CallInterface
                        roomName={roomName}
                        displayName={displayName}
                        callType={callType}
                        onCallStart={handleCallStart}
                        onCallEnd={handleCallEnd}
                    />
                </div>

                {/* Footer Info */}
                <div className="px-6 py-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                <span>Secure Connection</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                <span>End-to-end encrypted</span>
                            </div>
                        </div>
                        <div className="text-xs">
                            Powered by Jitsi Meet
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirmation Dialog */}
            {showConfirmDialog && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-4">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    End {isVideoCall ? 'Video' : 'Audio'} Call?
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Are you sure you want to end the call with {participantName}?
                                </p>
                            </div>
                        </div>

                        <div className="flex space-x-3">
                            <button
                                onClick={() => setShowConfirmDialog(false)}
                                className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                                Continue Call
                            </button>
                            <button
                                onClick={handleConfirmClose}
                                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            >
                                End Call
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 