'use client'

import React from 'react';
import Link from 'next/link';

interface EarningsData {
    today: number;
    thisWeek: number;
    thisMonth: number;
    total: number;
    pendingEscrow: number;
}

interface EarningsCardProps {
    earnings: EarningsData;
}

export default function EarningsCard({ earnings }: EarningsCardProps) {
    return (
        <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl opacity-25 group-hover:opacity-40 blur transition-opacity"></div>
            <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-4 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Earnings Overview</h3>
                    <div className="p-1.5 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg group-hover:scale-110 transition-transform">
                        <svg className="w-4 h-4 text-green-600 dark:text-green-400 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                    </div>
                </div>

                {/* Today's Earnings */}
                <div className="mb-3">
                    <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent animate-pulse">
                        GH₵{earnings.today.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 animate-fadeInUp">Today&apos;s earnings 💰</p>
                </div>

                {/* Earnings Breakdown */}
                <div className="space-y-2 border-t border-gray-200/50 dark:border-gray-700/50 pt-3">
                    {[
                        { label: 'This Week', value: earnings.thisWeek, delay: 0 },
                        { label: 'This Month', value: earnings.thisMonth, delay: 100 },
                        { label: 'Total Earned', value: earnings.total, delay: 200 }
                    ].map((item, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between p-2 rounded-lg hover:bg-gradient-to-r hover:from-green-50/50 hover:to-emerald-50/50 dark:hover:from-green-900/20 dark:hover:to-emerald-900/20 transition-all duration-300 animate-fadeInUp transform hover:scale-105"
                            style={{ animationDelay: `${item.delay}ms` }}
                        >
                            <span className="text-xs text-gray-500 dark:text-gray-400">{item.label}</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                GH₵{item.value.toLocaleString()}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Growth Indicator */}
                <div className="mt-3 flex items-center space-x-2 text-sm p-2 rounded-lg bg-gradient-to-r from-green-50/80 to-emerald-50/80 dark:from-green-900/20 dark:to-emerald-900/20 backdrop-blur-sm">
                    <div className="flex items-center text-green-600 dark:text-green-400 animate-bounce">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                        </svg>
                        <span className="font-medium">+18%</span>
                    </div>
                    <span className="text-gray-500 dark:text-gray-400">vs last week 📈</span>
                </div>

                <Link href="/provider/earnings" className="mt-3 w-full bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 text-green-600 dark:text-green-400 py-2 px-4 rounded-lg text-sm font-medium text-center block hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-900/50 dark:hover:to-emerald-900/50 transition-all duration-300 transform hover:scale-105 backdrop-blur-sm group">
                    <span className="group-hover:hidden">View Details</span>
                    <span className="hidden group-hover:inline">💰 View Full Report</span>
                </Link>
            </div>
        </div>
    );
} 