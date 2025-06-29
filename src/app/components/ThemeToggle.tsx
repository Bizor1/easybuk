'use client'

import { useTheme } from '@/contexts/ThemeContext'
import { useState, useEffect } from 'react'

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <button className="w-14 h-8 rounded-full bg-gray-300 relative transition-all duration-300">
                <div className="w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 translate-x-1 mt-1" />
            </button>
        )
    }

    return (
        <button
            onClick={toggleTheme}
            className={`
        relative w-14 h-8 rounded-full transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800
        ${theme === 'dark'
                    ? 'bg-gradient-to-r from-purple-500 to-blue-600'
                    : 'bg-gradient-to-r from-yellow-400 to-orange-500'
                }
      `}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
            {/* Toggle Track */}
            <div
                className={`
          absolute top-1 w-6 h-6 rounded-full shadow-lg transform transition-all duration-300 flex items-center justify-center
          ${theme === 'dark'
                        ? 'translate-x-7 bg-gray-800'
                        : 'translate-x-1 bg-white'
                    }
        `}
            >
                {/* Icons */}
                {theme === 'light' ? (
                    <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                    </svg>
                ) : (
                    <svg className="w-4 h-4 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                )}
            </div>

            {/* Background Icons */}
            <div className="absolute inset-0 flex items-center justify-between px-2">
                <svg className={`w-3 h-3 ${theme === 'light' ? 'text-white' : 'text-yellow-300'} transition-colors duration-300`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
                <svg className={`w-3 h-3 ${theme === 'dark' ? 'text-white' : 'text-blue-300'} transition-colors duration-300`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
            </div>
        </button>
    )
} 