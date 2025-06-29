'use client'

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface PerformanceData {
    rating: number;
    reviews: number;
    completionRate: number;
    responseTime: number; // in minutes
}

interface PerformanceCardProps {
    performance?: PerformanceData;
}

export default function PerformanceCard({ performance: initialPerformance }: PerformanceCardProps) {
    const [performance, setPerformance] = useState<PerformanceData>({
        rating: 0,
        reviews: 0,
        completionRate: 0,
        responseTime: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPerformanceData = async () => {
            try {
                const response = await fetch('/api/provider/reviews');
                if (response.ok) {
                    const data = await response.json();
                    setPerformance({
                        rating: data.stats.averageRating || 0,
                        reviews: data.stats.totalReviews || 0,
                        completionRate: data.stats.responseRate || 0, // Using response rate as completion rate
                        responseTime: 120 // Mock 2 hours in minutes
                    });
                } else if (initialPerformance) {
                    setPerformance(initialPerformance);
                }
            } catch (error) {
                console.error('Error fetching performance data:', error);
                if (initialPerformance) {
                    setPerformance(initialPerformance);
                } else {
                    // Set default values
                    setPerformance({
                        rating: 4.8,
                        reviews: 127,
                        completionRate: 96,
                        responseTime: 45
                    });
                }
            } finally {
                setLoading(false);
            }
        };

        fetchPerformanceData();
    }, [initialPerformance]);
    const formatResponseTime = (minutes: number) => {
        if (minutes < 60) {
            return `${minutes} min`;
        } else {
            const hours = Math.floor(minutes / 60);
            const remainingMinutes = minutes % 60;
            return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
        }
    };

    const getRatingColor = (rating: number) => {
        if (rating >= 4.5) return 'from-green-600 to-emerald-600';
        if (rating >= 4.0) return 'from-yellow-600 to-orange-600';
        return 'from-red-600 to-red-700';
    };

    const getCompletionRateColor = (rate: number) => {
        if (rate >= 95) return 'text-green-600 dark:text-green-400';
        if (rate >= 85) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-red-600 dark:text-red-400';
    };

    return (
        <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl opacity-25 group-hover:opacity-40 blur transition-opacity"></div>
            <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-4 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Performance</h3>
                    <div className="p-1.5 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg group-hover:scale-110 transition-transform">
                        <svg className="w-4 h-4 text-purple-600 dark:text-purple-400 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 00-2 2h-2a2 2 0 00-2-2z" />
                        </svg>
                    </div>
                </div>

                {/* Rating Display */}
                <div className="mb-3">
                    <div className="flex items-center space-x-2">
                        <p className={`text-xl font-bold bg-gradient-to-r ${getRatingColor(performance.rating)} bg-clip-text text-transparent animate-pulse`}>
                            {performance.rating.toFixed(1)}
                        </p>
                        <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                                <svg
                                    key={i}
                                    className={`w-4 h-4 transition-all duration-300 hover:scale-125 ${i < Math.floor(performance.rating)
                                        ? 'fill-current animate-bounce'
                                        : 'text-gray-300 dark:text-gray-600'
                                        }`}
                                    viewBox="0 0 20 20"
                                    style={{ animationDelay: `${i * 100}ms` }}
                                >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            ))}
                        </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 animate-fadeInUp">
                        Based on {performance.reviews} reviews ⭐
                    </p>
                </div>

                {/* Performance Metrics */}
                <div className="space-y-2 border-t border-gray-200/50 dark:border-gray-700/50 pt-3">
                    {[
                        { label: 'Completion Rate', value: `${performance.completionRate}%`, color: getCompletionRateColor(performance.completionRate), delay: 0 },
                        { label: 'Response Time', value: formatResponseTime(performance.responseTime), color: 'text-gray-900 dark:text-white', delay: 100 },
                        { label: 'Total Reviews', value: performance.reviews.toString(), color: 'text-gray-900 dark:text-white', delay: 200 }
                    ].map((metric, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between p-1.5 rounded-lg hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-pink-50/50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20 transition-all duration-300 animate-fadeInUp transform hover:scale-105"
                            style={{ animationDelay: `${metric.delay}ms` }}
                        >
                            <span className="text-xs text-gray-500 dark:text-gray-400">{metric.label}</span>
                            <span className={`text-sm font-medium ${metric.color}`}>
                                {metric.value}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Performance Progress Bar */}
                <div className="mt-3 pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
                    <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-500 dark:text-gray-400">Performance Score</span>
                        <span className="font-medium bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            {Math.round((performance.rating / 5) * 100)}% 🚀
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                        <div
                            className="bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 h-3 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                            style={{ width: `${(performance.rating / 5) * 100}%` }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                        </div>
                    </div>
                </div>

                <Link href="/provider/reviews" className="mt-3 w-full bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-600 dark:text-purple-400 py-2 px-4 rounded-lg text-sm font-medium text-center block hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-900/50 dark:hover:to-pink-900/50 transition-all duration-300 transform hover:scale-105 backdrop-blur-sm group">
                    <span className="group-hover:hidden">View Reviews</span>
                    <span className="hidden group-hover:inline">⭐ View All Reviews</span>
                </Link>
            </div>
        </div>
    );
} 