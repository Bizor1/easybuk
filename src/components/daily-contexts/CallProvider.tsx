import React, { createContext, useContext, useEffect, useCallback, useState, ReactNode } from 'react';
import DailyIframe, { DailyCall, DailyEvent, DailyEventObject } from '@daily-co/daily-js';

// Call states as recommended by Daily.co
export const CALL_STATE_IDLE = 'CALL_STATE_IDLE';
export const CALL_STATE_CREATING = 'CALL_STATE_CREATING';
export const CALL_STATE_JOINING = 'CALL_STATE_JOINING';
export const CALL_STATE_JOINED = 'CALL_STATE_JOINED';
export const CALL_STATE_LEAVING = 'CALL_STATE_LEAVING';
export const CALL_STATE_LEFT = 'CALL_STATE_LEFT';
export const CALL_STATE_ERROR = 'CALL_STATE_ERROR';

// Access states
export const ACCESS_STATE_UNKNOWN = 'ACCESS_STATE_UNKNOWN';
export const ACCESS_STATE_NONE = 'ACCESS_STATE_NONE';
export const ACCESS_STATE_LOBBY = 'ACCESS_STATE_LOBBY';

// Meeting states
export const MEETING_STATE_JOINED = 'MEETING_STATE_JOINED';

interface CallContextType {
    callObject: DailyCall | null;
    callState: string;
    join: () => void;
    leave: () => void;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

interface CallProviderProps {
    children: ReactNode;
    domain: string;
    room: string;
    userName: string;
}

export function CallProvider({ children, domain, room, userName }: CallProviderProps) {
    const [callObject, setCallObject] = useState<DailyCall | null>(null);
    const [callState, setCallState] = useState(CALL_STATE_IDLE);

    // Create call object
    useEffect(() => {
        console.log('📞 CallProvider: Creating call object');
        const newCallObject = DailyIframe.createCallObject();
        setCallObject(newCallObject);
        setCallState(CALL_STATE_CREATING);

        return () => {
            console.log('📞 CallProvider: Cleaning up call object');
            newCallObject?.destroy();
        };
    }, []);

    // Join function as recommended by Daily.co
    const join = useCallback(() => {
        if (!callObject || callState !== CALL_STATE_CREATING) return;

        console.log('🚪 CallProvider: Joining call:', { room, userName });

        setCallState(CALL_STATE_JOINING);

        callObject.join({
            url: room,
            userName: userName,
        });
    }, [callObject, callState, room, userName]);

    // Leave function
    const leave = useCallback(() => {
        if (!callObject) return;

        console.log('🚪 CallProvider: Leaving call');
        setCallState(CALL_STATE_LEAVING);
        callObject.leave();
    }, [callObject]);

    // Handle access state updates as recommended by Daily.co
    const handleAccessStateUpdated = useCallback(
        async (event: DailyEventObject) => {
            const { access } = event as any;
            console.log('🔐 CallProvider: Access state updated:', access);

            if ([CALL_STATE_LEFT, CALL_STATE_IDLE, CALL_STATE_CREATING].includes(callState)) {
                return;
            }

            if (access === ACCESS_STATE_UNKNOWN || access?.level === ACCESS_STATE_NONE) {
                setCallState(CALL_STATE_ERROR);
                return;
            }

            const meetingState = callObject?.meetingState();
            if (access?.level === ACCESS_STATE_LOBBY && meetingState === 'joined-meeting') {
                return;
            }

            // Auto-join if access is granted
            join();
        },
        [callObject, callState, join]
    );

    // Handle meeting state changes
    const handleMeetingStateUpdated = useCallback(
        (event: DailyEventObject) => {
            const meetingState = callObject?.meetingState();
            console.log('🏛️ CallProvider: Meeting state updated:', meetingState);

            switch (meetingState) {
                case 'joining-meeting':
                    setCallState(CALL_STATE_JOINING);
                    break;
                case 'joined-meeting':
                    setCallState(CALL_STATE_JOINED);
                    break;
                case 'left-meeting':
                    setCallState(CALL_STATE_LEFT);
                    break;
                case 'error':
                    setCallState(CALL_STATE_ERROR);
                    break;
                default:
                    break;
            }
        },
        [callObject]
    );

    // Set up event listeners as recommended by Daily.co
    useEffect(() => {
        if (!callObject) return;

        console.log('📞 CallProvider: Setting up event listeners');

        callObject.on('access-state-updated' as DailyEvent, handleAccessStateUpdated);
        callObject.on('joined-meeting' as DailyEvent, handleMeetingStateUpdated);
        callObject.on('joining-meeting' as DailyEvent, handleMeetingStateUpdated);
        callObject.on('left-meeting' as DailyEvent, handleMeetingStateUpdated);

        return () => {
            callObject.off('access-state-updated' as DailyEvent, handleAccessStateUpdated);
            callObject.off('joined-meeting' as DailyEvent, handleMeetingStateUpdated);
            callObject.off('joining-meeting' as DailyEvent, handleMeetingStateUpdated);
            callObject.off('left-meeting' as DailyEvent, handleMeetingStateUpdated);
        };
    }, [callObject, handleAccessStateUpdated, handleMeetingStateUpdated]);

    // Auto-start join process when call object is ready
    useEffect(() => {
        if (callObject && callState === CALL_STATE_CREATING) {
            console.log('📞 CallProvider: Auto-starting join process');
            join();
        }
    }, [callObject, callState, join]);

    const value: CallContextType = {
        callObject,
        callState,
        join,
        leave,
    };

    return (
        <CallContext.Provider value={value}>
            {children}
        </CallContext.Provider>
    );
}

export function useCallState(): CallContextType {
    const context = useContext(CallContext);
    if (context === undefined) {
        throw new Error('useCallState must be used within a CallProvider');
    }
    return context;
} 