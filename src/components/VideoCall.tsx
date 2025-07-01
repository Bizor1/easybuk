import React, { useEffect, useRef, useState } from 'react';
import { loadJitsiScript, getJitsiConfig, createRoomName } from '@/lib/jitsi-config';

interface VideoCallProps {
    roomName: string;
    displayName: string;
    onCallEnd?: () => void;
    onCallStart?: () => void;
}

export default function VideoCall({ roomName, displayName, onCallEnd, onCallStart }: VideoCallProps) {
    const jitsiContainerRef = useRef<HTMLDivElement>(null);
    const apiRef = useRef<any>(null);
    const [api, setApi] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const initializeJitsi = async () => {
            try {
                setIsLoading(true);
                await loadJitsiScript();

                if (!jitsiContainerRef.current) return;

                const config = getJitsiConfig('video');
                const options = {
                    roomName: createRoomName('video', roomName),
                    width: '100%',
                    height: '100%',
                    parentNode: jitsiContainerRef.current,
                    configOverwrite: config.configOverwrite,
                    interfaceConfigOverwrite: config.interfaceConfigOverwrite,
                    userInfo: {
                        displayName: displayName,
                    }
                };

                const jitsiApi = new window.JitsiMeetExternalAPI(config.domain, options);

                // Event listeners
                jitsiApi.addEventListener('videoConferenceJoined', () => {
                    setIsLoading(false);
                    onCallStart?.();
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
                apiRef.current = jitsiApi;
                setError(null);

            } catch (err) {
                console.error('Failed to initialize Jitsi:', err);
                setError('Failed to start video call. Please try again.');
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
    }, [roomName, displayName, onCallStart, onCallEnd]);

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
        <div className="relative w-full h-full min-h-[500px] bg-black rounded-lg overflow-hidden">
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 z-10">
                    <div className="text-center text-white">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                        <p>Starting video call...</p>
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
                        <span>End Call</span>
                    </button>
                </div>
            )}
        </div>
    );
} 