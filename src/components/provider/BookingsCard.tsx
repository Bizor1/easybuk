'use client'

import React from 'react';
import Link from 'next/link';

interface BookingsData {
    today: number;
    upcoming: number;
    completed: number;
    cancelled: number;
    pending: number;
}

interface BookingsCardProps {
    bookings: BookingsData;
}

export default function BookingsCard({ bookings }: BookingsCardProps) {
    const successRate = Math.round((bookings.completed / (bookings.completed + bookings.cancelled)) * 100);

    return (
        <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl opacity-25 group-hover:opacity-40 blur transition-opacity"></div>
            <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-6 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Bookings</h3>
                    <div className="p-2 bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg group-hover:scale-110 transition-transform">
                        <svg className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                </div>

                {/* Today's Bookings */}
                <div className="mb-4">
                    <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent animate-pulse">
                        {bookings.today}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 animate-fadeInUp">Bookings today 📅</p>
                </div>

                {/* Booking Status Breakdown */}
                <div className="space-y-3 border-t border-gray-200/50 dark:border-gray-700/50 pt-4">
                    {[
                        { label: 'Upcoming', value: bookings.upcoming, color: 'blue', delay: 0 },
                        { label: 'Pending', value: bookings.pending, color: 'yellow', delay: 100 },
                        { label: 'Completed', value: bookings.completed, color: 'green', delay: 200 },
                        { label: 'Cancelled', value: bookings.cancelled, color: 'red', delay: 300 }
                    ].map((item, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between p-2 rounded-lg hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-cyan-50/50 dark:hover:from-blue-900/20 dark:hover:to-cyan-900/20 transition-all duration-300 animate-fadeInUp transform hover:scale-105"
                            style={{ animationDelay: `${item.delay}ms` }}
                        >
                            <div className="flex items-center space-x-2">
                                <div className={`w-2 h-2 rounded-full animate-pulse ${item.color === 'blue' ? 'bg-blue-500' :
                                    item.color === 'yellow' ? 'bg-yellow-500' :
                                        item.color === 'green' ? 'bg-green-500' : 'bg-red-500'
                                    }`}></div>
                                <span className="text-xs text-gray-500 dark:text-gray-400">{item.label}</span>
                            </div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{item.value}</span>
                        </div>
                    ))}
                </div>

                {/* Success Rate */}
                <div className="mt-4 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                    <div className="flex items-center justify-between text-sm p-3 rounded-lg bg-gradient-to-r from-blue-50/80 to-cyan-50/80 dark:from-blue-900/20 dark:to-cyan-900/20 backdrop-blur-sm">
                        <span className="text-gray-500 dark:text-gray-400">Success Rate</span>
                        <div className="flex items-center space-x-2">
                            <span className={`font-medium ${successRate >= 90 ? 'text-green-600 dark:text-green-400' :
                                successRate >= 75 ? 'text-yellow-600 dark:text-yellow-400' :
                                    'text-red-600 dark:text-red-400'
                                }`}>
                                {successRate}%
                            </span>
                            {successRate >= 90 && <span className="text-green-500 animate-bounce">🎯</span>}
                        </div>
                    </div>
                </div>

                <Link href="/provider/bookings" className="mt-4 w-full bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 text-blue-600 dark:text-blue-400 py-3 px-4 rounded-lg text-sm font-medium text-center block hover:from-blue-100 hover:to-cyan-100 dark:hover:from-blue-900/50 dark:hover:to-cyan-900/50 transition-all duration-300 transform hover:scale-105 backdrop-blur-sm group">
                    <span className="group-hover:hidden">Manage Bookings</span>
                    <span className="hidden group-hover:inline">📅 Manage All Bookings</span>
                </Link>
            </div>
        </div>
    );
} 