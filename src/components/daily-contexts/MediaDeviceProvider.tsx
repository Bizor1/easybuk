import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useCallState } from './CallProvider';

// Device state constants as recommended by Daily.co
export const DEVICE_STATE_LOADING = 'DEVICE_STATE_LOADING';
export const DEVICE_STATE_LOADED = 'DEVICE_STATE_LOADED';
export const DEVICE_STATE_NOT_SUPPORTED = 'DEVICE_STATE_NOT_SUPPORTED';
export const DEVICE_STATE_ERROR = 'DEVICE_STATE_ERROR';

// Device interfaces
interface MediaDeviceInfo {
    deviceId: string;
    label: string;
    kind: string;
}

// Context type
interface MediaDeviceContextType {
    cams: MediaDeviceInfo[];
    mics: MediaDeviceInfo[];
    speakers: MediaDeviceInfo[];
    camError: boolean;
    micError: boolean;
    deviceState: string;
    currentDevices: {
        camera?: MediaDeviceInfo;
        mic?: MediaDeviceInfo;
        speaker?: MediaDeviceInfo;
    };
    setMicDevice: (deviceId: string) => void;
    setCamDevice: (deviceId: string) => void;
    setSpeakersDevice: (deviceId: string) => void;
}

const MediaDeviceContext = createContext<MediaDeviceContextType | undefined>(undefined);

interface MediaDeviceProviderProps {
    children: ReactNode;
}

// Helper function to sort devices by key
function sortByKey(a: any, b: any, key: string, desc = true): number {
    const modifier = desc ? -1 : 1;
    if (a[key] < b[key]) return -1 * modifier;
    if (a[key] > b[key]) return 1 * modifier;
    return 0;
}

export function MediaDeviceProvider({ children }: MediaDeviceProviderProps) {
    const { callObject } = useCallState();

    const [cams, setCams] = useState<MediaDeviceInfo[]>([]);
    const [mics, setMics] = useState<MediaDeviceInfo[]>([]);
    const [speakers, setSpeakers] = useState<MediaDeviceInfo[]>([]);
    const [camError, setCamError] = useState(false);
    const [micError, setMicError] = useState(false);
    const [deviceState, setDeviceState] = useState(DEVICE_STATE_LOADING);
    const [currentDevices, setCurrentDevices] = useState<{
        camera?: MediaDeviceInfo;
        mic?: MediaDeviceInfo;
        speaker?: MediaDeviceInfo;
    }>({});

    // Update device state as recommended by Daily.co
    const updateDeviceState = useCallback(async () => {
        if (!callObject) return;

        try {
            console.log('🎮 MediaDeviceProvider: Updating device state');

            const { devices } = await callObject.enumerateDevices();
            const { camera, mic, speaker } = await callObject.getInputDevices();

            // Filter and sort cameras
            const [defaultCam, ...videoDevices] = devices.filter(
                (d: any) => d.kind === 'videoinput' && d.deviceId !== ''
            );
            setCams(
                [
                    defaultCam,
                    ...videoDevices.sort((a: any, b: any) => sortByKey(a, b, 'label', false)),
                ].filter(Boolean)
            );

            // Filter and sort microphones
            const [defaultMic, ...micDevices] = devices.filter(
                (d: any) => d.kind === 'audioinput' && d.deviceId !== ''
            );
            setMics(
                [
                    defaultMic,
                    ...micDevices.sort((a: any, b: any) => sortByKey(a, b, 'label', false)),
                ].filter(Boolean)
            );

            // Filter and sort speakers
            const [defaultSpeaker, ...speakerDevices] = devices.filter(
                (d: any) => d.kind === 'audiooutput' && d.deviceId !== ''
            );
            setSpeakers(
                [
                    defaultSpeaker,
                    ...speakerDevices.sort((a: any, b: any) => sortByKey(a, b, 'label', false)),
                ].filter(Boolean)
            );

            setCurrentDevices({
                camera: camera as MediaDeviceInfo | undefined,
                mic: mic as MediaDeviceInfo | undefined,
                speaker: speaker as MediaDeviceInfo | undefined,
            });

            setDeviceState(DEVICE_STATE_LOADED);

        } catch (e) {
            console.error('🚨 MediaDeviceProvider: Device enumeration failed:', e);
            setDeviceState(DEVICE_STATE_NOT_SUPPORTED);
        }
    }, [callObject]);

    // Handle camera errors
    const handleCameraError = useCallback(() => {
        console.log('🚨 MediaDeviceProvider: Camera error occurred');
        setCamError(true);
    }, []);

    // Handle microphone errors
    const handleMicrophoneError = useCallback(() => {
        console.log('🚨 MediaDeviceProvider: Microphone error occurred');
        setMicError(true);
    }, []);

    // Set microphone device
    const setMicDevice = useCallback(
        (deviceId: string) => {
            if (!callObject) return;
            console.log('🎤 MediaDeviceProvider: Setting microphone device:', deviceId);
            callObject.setInputDevicesAsync({ audioDeviceId: deviceId });
        },
        [callObject]
    );

    // Set camera device
    const setCamDevice = useCallback(
        (deviceId: string) => {
            if (!callObject) return;
            console.log('📹 MediaDeviceProvider: Setting camera device:', deviceId);
            callObject.setInputDevicesAsync({ videoDeviceId: deviceId });
        },
        [callObject]
    );

    // Set speakers device
    const setSpeakersDevice = useCallback(
        (deviceId: string) => {
            if (!callObject) return;
            console.log('🔊 MediaDeviceProvider: Setting speakers device:', deviceId);
            callObject.setOutputDeviceAsync({ outputDeviceId: deviceId });
        },
        [callObject]
    );

    // Set up event listeners and device enumeration
    useEffect(() => {
        if (!callObject) return;

        console.log('🎮 MediaDeviceProvider: Setting up device listeners');

        // Listen for device changes
        callObject.on('available-devices-updated' as any, updateDeviceState);
        callObject.on('camera-error' as any, handleCameraError);
        callObject.on('microphone-error' as any, handleMicrophoneError);

        // Initial device enumeration
        updateDeviceState();

        return () => {
            callObject.off('available-devices-updated' as any, updateDeviceState);
            callObject.off('camera-error' as any, handleCameraError);
            callObject.off('microphone-error' as any, handleMicrophoneError);
        };
    }, [callObject, updateDeviceState, handleCameraError, handleMicrophoneError]);

    // Debug logging
    useEffect(() => {
        console.log('🎮 MediaDeviceProvider: Device state updated:', {
            deviceState,
            camsCount: cams.length,
            micsCount: mics.length,
            speakersCount: speakers.length,
            camError,
            micError,
        });
    }, [deviceState, cams.length, mics.length, speakers.length, camError, micError]);

    const value: MediaDeviceContextType = {
        cams,
        mics,
        speakers,
        camError,
        micError,
        deviceState,
        currentDevices,
        setMicDevice,
        setCamDevice,
        setSpeakersDevice,
    };

    return (
        <MediaDeviceContext.Provider value={value}>
            {children}
        </MediaDeviceContext.Provider>
    );
}

export function useMediaDevices(): MediaDeviceContextType {
    const context = useContext(MediaDeviceContext);
    if (context === undefined) {
        throw new Error('useMediaDevices must be used within a MediaDeviceProvider');
    }
    return context;
} 