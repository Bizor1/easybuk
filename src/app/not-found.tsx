'use client'

import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 dark:from-slate-900 dark:via-gray-900 dark:to-slate-800 flex items-center justify-center">
            {/* Floating Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-orange-400/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-orange-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            <div className="relative max-w-md w-full mx-4">
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/20 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 text-center">
                        <div className="text-8xl mb-4">🔍</div>
                        <h1 className="text-4xl font-bold mb-2">404</h1>
                        <p className="text-xl opacity-90">Page Not Found</p>
                    </div>

                    {/* Content */}
                    <div className="p-8 text-center">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            Oops! This page doesn&apos;t exist
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-8">
                            The page you&apos;re looking for might have been moved, deleted, or doesn&apos;t exist.
                        </p>

                        {/* Action Buttons */}
                        <div className="space-y-4">
                            <Link
                                href="/"
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 block"
                            >
                                🏠 Go to Homepage
                            </Link>

                            <Link
                                href="/explore"
                                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 block"
                            >
                                🔍 Explore Services
                            </Link>

                            <button
                                onClick={() => window.history.back()}
                                className="w-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 py-3 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
                            >
                                ← Go Back
                            </button>
                        </div>

                        {/* Help Text */}
                        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Need help? <Link href="/contact" className="text-blue-600 dark:text-blue-400 hover:underline">Contact Support</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 