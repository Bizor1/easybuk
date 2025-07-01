import React, { useEffect, useRef, useState } from 'react';
import { getJitsiConfig, createRoomName, initializeJitsiAPI } from '@/lib/jitsi-config';

interface CallInterfaceProps {
    roomName: string;
    displayName: string;
    callType: 'VIDEO_CALL' | 'PHONE_CALL';
    onCallEnd?: () => void;
    onCallStart?: () => void;
}

export default function CallInterface({
    roomName,
    displayName,
    callType,
    onCallEnd,
    onCallStart
}: CallInterfaceProps) {
    const jitsiContainerRef = useRef<HTMLDivElement>(null);
    const [api, setApi] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const apiRef = useRef<any>(null); // Add ref to track API instance

    const isVideoCall = callType === 'VIDEO_CALL';
    const isAudioCall = callType === 'PHONE_CALL';

    useEffect(() => {
        const initializeJitsi = async () => {
            try {
                setIsLoading(true);

                if (!jitsiContainerRef.current) return;

                const config = getJitsiConfig(isVideoCall ? 'video' : 'audio');
                const options = {
                    roomName: createRoomName(callType.toLowerCase(), roomName),
                    width: '100%',
                    height: '100%',
                    parentNode: jitsiContainerRef.current,
                    configOverwrite: config.configOverwrite,
                    interfaceConfigOverwrite: config.interfaceConfigOverwrite,
                    userInfo: {
                        displayName: displayName,
                    }
                };

                const jitsiApi = await initializeJitsiAPI(options);

                // Event listeners
                jitsiApi.addEventListener('videoConferenceJoined', () => {
                    setIsLoading(false);
                    onCallStart?.();

                    // For audio calls, ensure video is disabled
                    if (isAudioCall) {
                        jitsiApi.executeCommand('toggleVideo');
                    }
                });

                jitsiApi.addEventListener('videoConferenceLeft', () => {
                    onCallEnd?.();
                });

                jitsiApi.addEventListener('readyToClose', () => {
                    jitsiApi.dispose();
                    setApi(null);
                    apiRef.current = null;
                });

                setApi(jitsiApi);
                apiRef.current = jitsiApi; // Store in ref for cleanup
                setError(null);

            } catch (err) {
                console.error('Failed to initialize Jitsi:', err);
                setError(`Failed to start ${isVideoCall ? 'video' : 'audio'} call. Please try again.`);
                setIsLoading(false);
            }
        };

        initializeJitsi();

        // Cleanup
        return () => {
            if (apiRef.current) {
                apiRef.current.dispose();
                apiRef.current = null;
            }
        };
    }, [roomName, displayName, callType, onCallStart, onCallEnd, isVideoCall, isAudioCall]);

    const endCall = () => {
        if (api) {
            api.executeCommand('hangup');
        }
    };

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-96 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <div className="text-red-500 mb-4">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-center mb-4">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className={`relative w-full h-full min-h-[500px] rounded-lg overflow-hidden ${isAudioCall ? 'bg-gradient-to-br from-blue-900 to-purple-900' : 'bg-black'
            }`}>
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 z-10">
                    <div className="text-center text-white">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                        <p>Starting {isVideoCall ? 'video' : 'audio'} call...</p>
                    </div>
                </div>
            )}

            {/* Audio Call Visual Indicator */}
            {isAudioCall && !isLoading && (
                <div className="absolute inset-0 flex items-center justify-center z-5">
                    <div className="text-center text-white">
                        <div className="w-32 h-32 mx-auto mb-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-semibold mb-2">Audio Call in Progress</h3>
                        <p className="text-lg opacity-90">Connected with {displayName}</p>
                        <div className="mt-4 flex items-center justify-center space-x-2">
                            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="text-sm">Call Active</span>
                        </div>
                    </div>
                </div>
            )}

            <div ref={jitsiContainerRef} className="w-full h-full min-h-[500px]" />

            {api && !isLoading && (
                <div className="absolute top-4 right-4 z-20">
                    <button
                        onClick={endCall}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 3l1.5 1.5m0 0L6 6m-1.5-1.5L3 6m1.5-1.5L6 3" />
                        </svg>
                        <span>End {isVideoCall ? 'Video' : 'Audio'} Call</span>
                    </button>
                </div>
            )}
        </div>
    );
} 