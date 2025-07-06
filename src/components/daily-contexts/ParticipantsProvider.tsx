import React, { createContext, useContext, useReducer, useEffect, useCallback, ReactNode } from 'react';
import { DailyParticipant, DailyEventObject } from '@daily-co/daily-js';
import { useCallState } from './CallProvider';

// Participant action types as recommended by Daily.co
export const PARTICIPANT_JOINED = 'PARTICIPANT_JOINED';
export const PARTICIPANT_UPDATED = 'PARTICIPANT_UPDATED';
export const PARTICIPANT_LEFT = 'PARTICIPANT_LEFT';
export const PARTICIPANTS_UPDATED = 'PARTICIPANTS_UPDATED';

// Participant state type
interface ParticipantsState {
    participants: { [sessionId: string]: DailyParticipant };
}

// Action types
type ParticipantAction =
    | { type: typeof PARTICIPANT_JOINED; participant: DailyParticipant }
    | { type: typeof PARTICIPANT_UPDATED; participant: DailyParticipant }
    | { type: typeof PARTICIPANT_LEFT; participant: DailyParticipant }
    | { type: typeof PARTICIPANTS_UPDATED; participants: { [sessionId: string]: DailyParticipant } };

// Initial state
const initialParticipantsState: ParticipantsState = {
    participants: {},
};

// Reducer as recommended by Daily.co
function participantsReducer(state: ParticipantsState, action: ParticipantAction): ParticipantsState {
    switch (action.type) {
        case PARTICIPANT_JOINED:
            console.log('👥 ParticipantsProvider: Participant joined:', action.participant.session_id);
            return {
                ...state,
                participants: {
                    ...state.participants,
                    [action.participant.session_id]: action.participant,
                },
            };

        case PARTICIPANT_UPDATED:
            console.log('👥 ParticipantsProvider: Participant updated:', action.participant.session_id);
            return {
                ...state,
                participants: {
                    ...state.participants,
                    [action.participant.session_id]: action.participant,
                },
            };

        case PARTICIPANT_LEFT:
            console.log('👥 ParticipantsProvider: Participant left:', action.participant.session_id);
            const { [action.participant.session_id]: removed, ...remainingParticipants } = state.participants;
            return {
                ...state,
                participants: remainingParticipants,
            };

        case PARTICIPANTS_UPDATED:
            console.log('👥 ParticipantsProvider: All participants updated, count:', Object.keys(action.participants).length);
            return {
                ...state,
                participants: action.participants,
            };

        default:
            return state;
    }
}

// Context type
interface ParticipantsContextType {
    participants: { [sessionId: string]: DailyParticipant };
    allParticipants: DailyParticipant[];
    localParticipant: DailyParticipant | null;
    remoteParticipants: DailyParticipant[];
    participantCount: number;
}

const ParticipantsContext = createContext<ParticipantsContextType | undefined>(undefined);

interface ParticipantsProviderProps {
    children: ReactNode;
}

export function ParticipantsProvider({ children }: ParticipantsProviderProps) {
    const { callObject } = useCallState();
    const [state, dispatch] = useReducer(participantsReducer, initialParticipantsState);

    // Handle new participants state as recommended by Daily.co
    const handleNewParticipantsState = useCallback(
        (event: DailyEventObject | null = null) => {
            if (!callObject) return;

            const participants = callObject.participants();

            if (event) {
                const { action, participant } = event as any;

                switch (action) {
                    case 'participant-joined':
                        dispatch({
                            type: PARTICIPANT_JOINED,
                            participant,
                        });
                        break;
                    case 'participant-updated':
                        dispatch({
                            type: PARTICIPANT_UPDATED,
                            participant,
                        });
                        break;
                    case 'participant-left':
                        dispatch({
                            type: PARTICIPANT_LEFT,
                            participant,
                        });
                        break;
                    default:
                        // Fallback to updating all participants
                        dispatch({
                            type: PARTICIPANTS_UPDATED,
                            participants,
                        });
                        break;
                }
            } else {
                // Update all participants
                dispatch({
                    type: PARTICIPANTS_UPDATED,
                    participants,
                });
            }
        },
        [callObject]
    );

    // Set up event listeners as recommended by Daily.co
    useEffect(() => {
        if (!callObject) return;

        console.log('👥 ParticipantsProvider: Setting up participant event listeners');

        const events = [
            'joined-meeting',
            'participant-joined',
            'participant-updated',
            'participant-left',
        ];

        // Listen for changes in participant state
        events.forEach((event) =>
            callObject.on(event as any, handleNewParticipantsState)
        );

        // Initial participant state load
        handleNewParticipantsState();

        // Cleanup listeners
        return () => {
            events.forEach((event) =>
                callObject.off(event as any, handleNewParticipantsState)
            );
        };
    }, [callObject, handleNewParticipantsState]);

    // Computed values as recommended by Daily.co
    const allParticipants = Object.values(state.participants);

    const localParticipant = allParticipants.find(p => p.local) || null;

    const remoteParticipants = allParticipants.filter(p => !p.local);

    const participantCount = allParticipants.length;

    // Debug logging
    useEffect(() => {
        console.log('👥 ParticipantsProvider: State updated:', {
            participantCount,
            localParticipant: localParticipant?.session_id || 'none',
            remoteParticipants: remoteParticipants.map(p => p.session_id),
        });
    }, [participantCount, localParticipant, remoteParticipants]);

    const value: ParticipantsContextType = {
        participants: state.participants,
        allParticipants,
        localParticipant,
        remoteParticipants,
        participantCount,
    };

    return (
        <ParticipantsContext.Provider value={value}>
            {children}
        </ParticipantsContext.Provider>
    );
}

export function useParticipants(): ParticipantsContextType {
    const context = useContext(ParticipantsContext);
    if (context === undefined) {
        throw new Error('useParticipants must be used within a ParticipantsProvider');
    }
    return context;
} 