'use client'

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Application Error:', error);
    }, [error]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-slate-900 dark:via-gray-900 dark:to-slate-800 flex items-center justify-center">
            {/* Floating Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-red-400/10 to-orange-400/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-orange-400/10 to-red-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            <div className="relative max-w-md w-full mx-4">
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/20 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white p-8 text-center">
                        <div className="text-8xl mb-4">⚠️</div>
                        <h1 className="text-3xl font-bold mb-2">Something went wrong!</h1>
                        <p className="text-xl opacity-90">We encountered an unexpected error</p>
                    </div>

                    {/* Content */}
                    <div className="p-8 text-center">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            Oops! An error occurred
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-8">
                            Don&apos;t worry, our team has been notified. You can try refreshing the page or go back to safety.
                        </p>

                        {/* Error Details (only in development) */}
                        {process.env.NODE_ENV === 'development' && (
                            <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg text-left">
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Error Details:</h3>
                                <p className="text-sm text-gray-700 dark:text-gray-300 font-mono">
                                    {error.message}
                                </p>
                                {error.digest && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                        Error ID: {error.digest}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="space-y-4">
                            <button
                                onClick={reset}
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
                            >
                                🔄 Try Again
                            </button>

                            <Link
                                href="/"
                                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 block"
                            >
                                🏠 Go to Homepage
                            </Link>

                            <button
                                onClick={() => window.location.reload()}
                                className="w-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 py-3 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
                            >
                                🔄 Refresh Page
                            </button>
                        </div>

                        {/* Help Text */}
                        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Still having issues? <Link href="/contact" className="text-blue-600 dark:text-blue-400 hover:underline">Contact Support</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 