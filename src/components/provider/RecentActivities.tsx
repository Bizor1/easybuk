'use client'

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Activity {
    id: string;
    type: 'booking' | 'payment' | 'review' | 'message' | 'cancellation';
    title: string;
    description: string;
    timestamp: string;
    client?: {
        name: string;
        image: string;
    };
    amount?: number;
    status?: 'pending' | 'completed' | 'cancelled' | 'confirmed' | 'in_progress' | 'awaiting_client_confirmation' | 'disputed' | 'refunded';
}

export default function RecentActivities() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch real activities from API
    useEffect(() => {
        const fetchActivities = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch('/api/provider/recent-activities?limit=5', {
                    credentials: 'include'
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.success && Array.isArray(data.activities)) {
                        setActivities(data.activities);
                    } else {
                        setActivities([]);
                    }
                } else {
                    console.error('Failed to fetch activities:', response.status);
                    setError('Failed to load activities');
                }
            } catch (error) {
                console.error('Error fetching activities:', error);
                setError('Error loading activities');
            } finally {
                setLoading(false);
            }
        };

        fetchActivities();
    }, []);

    const getActivityIcon = (type: Activity['type']) => {
        const iconConfig = {
            booking: {
                icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                ),
                gradient: 'from-blue-500 to-cyan-500',
                bgGradient: 'from-blue-100/80 to-cyan-100/80 dark:from-blue-900/30 dark:to-cyan-900/30'
            },
            payment: {
                icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                ),
                gradient: 'from-green-500 to-emerald-500',
                bgGradient: 'from-green-100/80 to-emerald-100/80 dark:from-green-900/30 dark:to-emerald-900/30'
            },
            review: {
                icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                ),
                gradient: 'from-yellow-500 to-orange-500',
                bgGradient: 'from-yellow-100/80 to-orange-100/80 dark:from-yellow-900/30 dark:to-orange-900/30'
            },
            message: {
                icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                ),
                gradient: 'from-purple-500 to-pink-500',
                bgGradient: 'from-purple-100/80 to-pink-100/80 dark:from-purple-900/30 dark:to-pink-900/30'
            },
            cancellation: {
                icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ),
                gradient: 'from-red-500 to-red-600',
                bgGradient: 'from-red-100/80 to-red-200/80 dark:from-red-900/30 dark:to-red-800/30'
            }
        };

        const config = iconConfig[type] || iconConfig.booking;

        return (
            <div className={`p-2 bg-gradient-to-r ${config.bgGradient} rounded-lg group-hover:scale-110 transition-transform shadow-lg`}>
                <div className={`text-transparent bg-gradient-to-r ${config.gradient} bg-clip-text`}>
                    {config.icon}
                </div>
            </div>
        );
    };

    const getStatusBadge = (status?: Activity['status']) => {
        if (!status) return null;

        const statusConfig = {
            pending: {
                gradient: 'from-yellow-100/90 to-orange-100/90 dark:from-yellow-900/30 dark:to-orange-900/30',
                textColor: 'text-yellow-800 dark:text-yellow-400',
                emoji: '⏳'
            },
            completed: {
                gradient: 'from-green-100/90 to-emerald-100/90 dark:from-green-900/30 dark:to-emerald-900/30',
                textColor: 'text-green-800 dark:text-green-400',
                emoji: '✅'
            },
            cancelled: {
                gradient: 'from-red-100/90 to-red-200/90 dark:from-red-900/30 dark:to-red-800/30',
                textColor: 'text-red-800 dark:text-red-400',
                emoji: '❌'
            },
            confirmed: {
                gradient: 'from-blue-100/90 to-cyan-100/90 dark:from-blue-900/30 dark:to-cyan-900/30',
                textColor: 'text-blue-800 dark:text-blue-400',
                emoji: '🎯'
            },
            in_progress: {
                gradient: 'from-blue-100/90 to-indigo-100/90 dark:from-blue-900/30 dark:to-indigo-900/30',
                textColor: 'text-blue-800 dark:text-blue-400',
                emoji: '🔄'
            },
            awaiting_client_confirmation: {
                gradient: 'from-purple-100/90 to-pink-100/90 dark:from-purple-900/30 dark:to-pink-900/30',
                textColor: 'text-purple-800 dark:text-purple-400',
                emoji: '⏰'
            },
            disputed: {
                gradient: 'from-orange-100/90 to-red-100/90 dark:from-orange-900/30 dark:to-red-900/30',
                textColor: 'text-orange-800 dark:text-orange-400',
                emoji: '⚠️'
            },
            refunded: {
                gradient: 'from-gray-100/90 to-gray-200/90 dark:from-gray-900/30 dark:to-gray-800/30',
                textColor: 'text-gray-800 dark:text-gray-400',
                emoji: '↩️'
            }
        };

        // Get config with fallback to 'pending' if status not found
        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

        return (
            <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${config.gradient} ${config.textColor} backdrop-blur-sm border border-white/20 animate-fadeInUp`}>
                <span>{config.emoji}</span>
                <span>{status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}</span>
            </span>
        );
    };

    return (
        <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl opacity-20 group-hover:opacity-30 blur transition-opacity"></div>
            <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-6 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        Recent Activities 🚀
                    </h3>
                    <Link href="/provider/bookings" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm font-medium transition-all hover:scale-110 transform">
                        View All →
                    </Link>
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="p-4 rounded-xl bg-gradient-to-r from-gray-50/80 to-gray-100/80 dark:from-gray-700/50 dark:to-gray-600/50 backdrop-blur-sm border border-white/20 dark:border-gray-700/20">
                                    <div className="flex items-start space-x-4">
                                        <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
                                        <div className="flex-1">
                                            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                                            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="text-center py-8">
                        <div className="text-red-500 text-lg mb-2">⚠️</div>
                        <p className="text-red-600 dark:text-red-400">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-2 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                            Try again
                        </button>
                    </div>
                ) : activities.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="text-gray-400 text-lg mb-2">📋</div>
                        <p className="text-gray-600 dark:text-gray-400">No recent activities in the last 7 days</p>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Start providing services to see activity here!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {activities.map((activity, index) => (
                            <div
                                key={activity.id}
                                className={`group/item flex items-start space-x-4 p-4 rounded-xl bg-gradient-to-r from-gray-50/80 to-gray-100/80 dark:from-gray-700/50 dark:to-gray-600/50 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 hover:from-indigo-50/80 hover:to-purple-50/80 dark:hover:from-indigo-900/20 dark:hover:to-purple-900/20 transition-all duration-300 transform hover:scale-[1.02] animate-fadeInUp`}
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                {/* Activity Icon */}
                                <div className="flex-shrink-0">
                                    {getActivityIcon(activity.type)}
                                </div>

                                {/* Activity Content */}
                                <div className="flex-1">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 group-hover/item:text-indigo-600 dark:group-hover/item:text-indigo-400 transition-colors">
                                                {activity.title}
                                            </h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 group-hover/item:text-gray-800 dark:group-hover/item:text-gray-300 transition-colors">
                                                {activity.description}
                                            </p>

                                            {/* Client Info & Amount */}
                                            <div className="flex items-center justify-between">
                                                {activity.client && (
                                                    <div className="flex items-center space-x-2 group-hover/item:scale-105 transition-transform">
                                                        <div className="relative">
                                                            <Image
                                                                src={activity.client.image}
                                                                alt={activity.client.name}
                                                                width={20}
                                                                height={20}
                                                                className="w-5 h-5 rounded-full ring-2 ring-white dark:ring-gray-700 group-hover/item:ring-indigo-500/30 transition-all"
                                                            />
                                                            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full opacity-0 group-hover/item:opacity-20 blur transition-opacity"></div>
                                                        </div>
                                                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                                            {activity.client.name}
                                                        </span>
                                                    </div>
                                                )}
                                                {activity.amount && (
                                                    <span className="text-xs font-semibold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent animate-pulse">
                                                        +GH₵{activity.amount} 💰
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Status & Timestamp */}
                                        <div className="flex flex-col items-end space-y-2">
                                            {getStatusBadge(activity.status)}
                                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                                {activity.timestamp}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Activity Summary - Only show when there are activities */}
                {!loading && !error && activities.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-gray-200/20 dark:border-gray-700/20">
                        <div className="grid grid-cols-3 gap-4 text-center">
                            {[
                                { label: 'Today', value: activities.filter(a => a.timestamp.includes('hours ago') || a.timestamp.includes('minutes ago') || a.timestamp === 'Just now').length, gradient: 'from-blue-600 to-cyan-600', emoji: '📅' },
                                { label: 'This Week', value: activities.length, gradient: 'from-purple-600 to-pink-600', emoji: '📊' },
                                { label: 'Payments', value: activities.filter(a => a.type === 'payment').length, gradient: 'from-green-600 to-emerald-600', emoji: '💰' }
                            ].map((stat, index) => (
                                <div
                                    key={index}
                                    className="p-3 rounded-xl bg-gradient-to-r from-gray-50/80 to-gray-100/80 dark:from-gray-700/50 dark:to-gray-600/50 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 hover:scale-105 transition-all duration-300 group/stat"
                                >
                                    <p className={`text-2xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent group-hover/stat:animate-pulse`}>
                                        {stat.value}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center space-x-1">
                                        <span>{stat.label}</span>
                                        <span className="group-hover/stat:animate-bounce">{stat.emoji}</span>
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
} 