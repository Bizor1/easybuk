import React, { createContext, useContext, useReducer, useEffect, useCallback, ReactNode } from 'react';
import { DailyParticipant, DailyEventObject } from '@daily-co/daily-js';
import { useCallState } from './CallProvider';

// Track action types as recommended by Daily.co
export const TRACK_STARTED = 'TRACK_STARTED';
export const TRACK_STOPPED = 'TRACK_STOPPED';
export const TRACKS_UPDATED = 'TRACKS_UPDATED';

// Daily track interface (simplified)
interface DailyTrack {
    kind: 'video' | 'audio';
    state: 'playable' | 'loading' | 'interrupted' | 'off';
    track?: MediaStreamTrack;
    isScreenshare?: boolean;
}

// Track state type
interface TracksState {
    tracks: {
        [sessionId: string]: {
            video?: DailyTrack;
            audio?: DailyTrack;
            screenVideo?: DailyTrack;
            screenAudio?: DailyTrack;
        };
    };
}

// Action types
type TrackAction =
    | { type: typeof TRACK_STARTED; participant: DailyParticipant; track: DailyTrack }
    | { type: typeof TRACK_STOPPED; participant: DailyParticipant; track: DailyTrack }
    | { type: typeof TRACKS_UPDATED };

// Initial state
const initialTracksState: TracksState = {
    tracks: {},
};

// Helper function to get track type
function getTrackType(track: DailyTrack): 'video' | 'audio' | 'screenVideo' | 'screenAudio' {
    if (track.kind === 'video') {
        return track.isScreenshare ? 'screenVideo' : 'video';
    } else {
        return track.isScreenshare ? 'screenAudio' : 'audio';
    }
}

// Reducer as recommended by Daily.co
function tracksReducer(state: TracksState, action: TrackAction): TracksState {
    switch (action.type) {
        case TRACK_STARTED: {
            const { participant, track } = action;
            const trackType = getTrackType(track);

            console.log('🎬 TracksProvider: Track started:', {
                sessionId: participant.session_id,
                trackType,
                trackState: track.state
            });

            return {
                ...state,
                tracks: {
                    ...state.tracks,
                    [participant.session_id]: {
                        ...state.tracks[participant.session_id],
                        [trackType]: track,
                    },
                },
            };
        }

        case TRACK_STOPPED: {
            const { participant, track } = action;
            const trackType = getTrackType(track);

            console.log('🎬 TracksProvider: Track stopped:', {
                sessionId: participant.session_id,
                trackType
            });

            const participantTracks = { ...state.tracks[participant.session_id] };
            delete participantTracks[trackType];

            return {
                ...state,
                tracks: {
                    ...state.tracks,
                    [participant.session_id]: participantTracks,
                },
            };
        }

        case TRACKS_UPDATED:
            console.log('🎬 TracksProvider: All tracks updated');
            return state; // Will be handled by individual track events

        default:
            return state;
    }
}

// Context type
interface TracksContextType {
    tracks: TracksState['tracks'];
    getVideoTrack: (sessionId: string) => DailyTrack | undefined;
    getAudioTrack: (sessionId: string) => DailyTrack | undefined;
    getScreenVideoTrack: (sessionId: string) => DailyTrack | undefined;
    getScreenAudioTrack: (sessionId: string) => DailyTrack | undefined;
}

const TracksContext = createContext<TracksContextType | undefined>(undefined);

interface TracksProviderProps {
    children: ReactNode;
}

export function TracksProvider({ children }: TracksProviderProps) {
    const { callObject } = useCallState();
    const [state, dispatch] = useReducer(tracksReducer, initialTracksState);

    // Handle track started as recommended by Daily.co
    const handleTrackStarted = useCallback(
        (event: DailyEventObject) => {
            const { participant, track } = event as any;

            if (participant && track) {
                dispatch({
                    type: TRACK_STARTED,
                    participant,
                    track,
                });
            }
        },
        []
    );

    // Handle track stopped as recommended by Daily.co
    const handleTrackStopped = useCallback(
        (event: DailyEventObject) => {
            const { participant, track } = event as any;

            if (participant && track) {
                dispatch({
                    type: TRACK_STOPPED,
                    participant,
                    track,
                });
            }
        },
        []
    );

    // Set up event listeners as recommended by Daily.co
    useEffect(() => {
        if (!callObject) return;

        console.log('🎬 TracksProvider: Setting up track event listeners');

        callObject.on('track-started' as any, handleTrackStarted);
        callObject.on('track-stopped' as any, handleTrackStopped);

        return () => {
            callObject.off('track-started' as any, handleTrackStarted);
            callObject.off('track-stopped' as any, handleTrackStopped);
        };
    }, [callObject, handleTrackStarted, handleTrackStopped]);

    // Helper functions to get specific tracks
    const getVideoTrack = useCallback(
        (sessionId: string) => state.tracks[sessionId]?.video,
        [state.tracks]
    );

    const getAudioTrack = useCallback(
        (sessionId: string) => state.tracks[sessionId]?.audio,
        [state.tracks]
    );

    const getScreenVideoTrack = useCallback(
        (sessionId: string) => state.tracks[sessionId]?.screenVideo,
        [state.tracks]
    );

    const getScreenAudioTrack = useCallback(
        (sessionId: string) => state.tracks[sessionId]?.screenAudio,
        [state.tracks]
    );

    // Debug logging
    useEffect(() => {
        const trackCounts = Object.entries(state.tracks).map(([sessionId, tracks]) => ({
            sessionId,
            video: !!tracks.video,
            audio: !!tracks.audio,
            screenVideo: !!tracks.screenVideo,
            screenAudio: !!tracks.screenAudio,
        }));

        console.log('🎬 TracksProvider: Tracks state updated:', trackCounts);
    }, [state.tracks]);

    const value: TracksContextType = {
        tracks: state.tracks,
        getVideoTrack,
        getAudioTrack,
        getScreenVideoTrack,
        getScreenAudioTrack,
    };

    return (
        <TracksContext.Provider value={value}>
            {children}
        </TracksContext.Provider>
    );
}

export function useTracks(): TracksContextType {
    const context = useContext(TracksContext);
    if (context === undefined) {
        throw new Error('useTracks must be used within a TracksProvider');
    }
    return context;
} 