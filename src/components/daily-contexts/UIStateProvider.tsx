import React, { createContext, useContext, useState, ReactNode } from 'react';

// UI state constants as recommended by Daily.co
export const UI_STATE_IDLE = 'UI_STATE_IDLE';
export const UI_STATE_LOADING = 'UI_STATE_LOADING';
export const UI_STATE_JOINING = 'UI_STATE_JOINING';
export const UI_STATE_JOINED = 'UI_STATE_JOINED';
export const UI_STATE_LEAVING = 'UI_STATE_LEAVING';
export const UI_STATE_ERROR = 'UI_STATE_ERROR';

// Context type
interface UIStateContextType {
    currentUIState: string;
    currentError: string | null;
    setUIState: (state: string) => void;
    setError: (error: string | null) => void;
}

const UIStateContext = createContext<UIStateContextType | undefined>(undefined);

interface UIStateProviderProps {
    children: ReactNode;
}

export function UIStateProvider({ children }: UIStateProviderProps) {
    const [currentUIState, setCurrentUIState] = useState<string>(UI_STATE_IDLE);
    const [currentError, setCurrentError] = useState<string | null>(null);

    // Set UI state with logging
    const setUIState = (state: string) => {
        console.log('🎨 UIStateProvider: Setting UI state:', state);
        setCurrentUIState(state);
    };

    // Set error state with logging
    const setError = (error: string | null) => {
        console.log('🚨 UIStateProvider: Setting error state:', error);
        setCurrentError(error);
    };

    const value: UIStateContextType = {
        currentUIState,
        currentError,
        setUIState,
        setError,
    };

    return (
        <UIStateContext.Provider value={value}>
            {children}
        </UIStateContext.Provider>
    );
}

export function useUIState(): UIStateContextType {
    const context = useContext(UIStateContext);
    if (context === undefined) {
        throw new Error('useUIState must be used within a UIStateProvider');
    }
    return context;
} 