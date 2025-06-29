'use client'

import React from 'react';

interface AvailabilityToggleProps {
    isOnline: boolean;
    setIsOnline: (isOnline: boolean) => void;
}

export default function AvailabilityToggle({ isOnline, setIsOnline }: AvailabilityToggleProps) {
    const handleToggle = () => {
        setIsOnline(!isOnline);
        // Here you would typically make an API call to update the provider's status
        // updateProviderStatus(!isOnline);
    };

    return (
        <div className="flex items-center space-x-3 p-2 rounded-xl bg-white/10 dark:bg-gray-800/10 backdrop-blur-sm border border-white/20 dark:border-gray-700/20">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Status:
            </span>

            <button
                onClick={handleToggle}
                className={`relative inline-flex items-center h-7 rounded-full w-12 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 transform hover:scale-110 ${isOnline
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 focus:ring-green-500 shadow-lg shadow-green-500/30'
                    : 'bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 focus:ring-gray-500 shadow-lg shadow-gray-500/20'
                    }`}
                role="switch"
                aria-checked={isOnline}
                aria-label={`Toggle availability ${isOnline ? 'off' : 'on'}`}
            >
                <span
                    className={`inline-block w-5 h-5 bg-white rounded-full shadow-lg transform transition-all duration-300 ease-in-out flex items-center justify-center ${isOnline ? 'translate-x-6 rotate-180' : 'translate-x-1'
                        }`}
                >
                    {isOnline ? (
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    ) : (
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    )}
                </span>

                {/* Glow effect */}
                {isOnline && (
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 opacity-50 blur-sm animate-pulse"></div>
                )}
            </button>

            <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full transition-all duration-300 ${isOnline
                    ? 'bg-green-500 animate-pulse shadow-lg shadow-green-500/50'
                    : 'bg-gray-400 shadow-sm'
                    }`}></div>
                <span className={`text-sm font-semibold transition-all duration-300 ${isOnline
                    ? 'text-transparent bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text animate-pulse'
                    : 'text-gray-500 dark:text-gray-400'
                    }`}>
                    {isOnline ? 'Online & Ready' : 'Offline'}
                </span>
                {isOnline && (
                    <span className="text-green-500 animate-bounce text-sm">⚡</span>
                )}
            </div>
        </div>
    );
} 