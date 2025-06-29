'use client'

import React from 'react';
import Link from 'next/link';

export default function QuickActions() {
    const actions = [
        {
            title: 'Update Availability',
            description: 'Set your working hours and calendar',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            ),
            href: '/provider/availability',
            gradient: 'from-blue-500 to-cyan-500',
            bgGradient: 'from-blue-50/80 to-cyan-50/80 dark:from-blue-900/30 dark:to-cyan-900/30',
            hoverGradient: 'hover:from-blue-100/80 hover:to-cyan-100/80 dark:hover:from-blue-900/50 dark:hover:to-cyan-900/50',
            emoji: '📅'
        },
        {
            title: 'Manage Profile',
            description: 'Update your services and portfolio',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            ),
            href: '/provider/profile',
            gradient: 'from-green-500 to-emerald-500',
            bgGradient: 'from-green-50/80 to-emerald-50/80 dark:from-green-900/30 dark:to-emerald-900/30',
            hoverGradient: 'hover:from-green-100/80 hover:to-emerald-100/80 dark:hover:from-green-900/50 dark:hover:to-emerald-900/50',
            emoji: '👤'
        },
        {
            title: 'Messages',
            description: 'Chat with clients and respond to inquiries',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
            ),
            href: '/provider/messages',
            gradient: 'from-purple-500 to-pink-500',
            bgGradient: 'from-purple-50/80 to-pink-50/80 dark:from-purple-900/30 dark:to-pink-900/30',
            hoverGradient: 'hover:from-purple-100/80 hover:to-pink-100/80 dark:hover:from-purple-900/50 dark:hover:to-pink-900/50',
            emoji: '💬',
            badge: 3
        },
        {
            title: 'View Analytics',
            description: 'Track your performance and earnings',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 00-2 2h-2a2 2 0 00-2-2z" />
                </svg>
            ),
            href: '/provider/analytics',
            gradient: 'from-orange-500 to-red-500',
            bgGradient: 'from-orange-50/80 to-red-50/80 dark:from-orange-900/30 dark:to-red-900/30',
            hoverGradient: 'hover:from-orange-100/80 hover:to-red-100/80 dark:hover:from-orange-900/50 dark:hover:to-red-900/50',
            emoji: '📊'
        },
        {
            title: 'Upload Documents',
            description: 'Add certifications and verification',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
            ),
            href: '/provider/documents',
            gradient: 'from-indigo-500 to-purple-500',
            bgGradient: 'from-indigo-50/80 to-purple-50/80 dark:from-indigo-900/30 dark:to-purple-900/30',
            hoverGradient: 'hover:from-indigo-100/80 hover:to-purple-100/80 dark:hover:from-indigo-900/50 dark:hover:to-purple-900/50',
            emoji: '📄'
        },
        {
            title: 'Pricing & Services',
            description: 'Update your rates and service offerings',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
            ),
            href: '/provider/pricing',
            gradient: 'from-pink-500 to-rose-500',
            bgGradient: 'from-pink-50/80 to-rose-50/80 dark:from-pink-900/30 dark:to-rose-900/30',
            hoverGradient: 'hover:from-pink-100/80 hover:to-rose-100/80 dark:hover:from-pink-900/50 dark:hover:to-rose-900/50',
            emoji: '💰'
        }
    ];

    return (
        <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl opacity-20 group-hover:opacity-30 blur transition-opacity"></div>
            <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-6 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Quick Actions ⚡
                    </h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400 animate-pulse">Manage your business</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {actions.map((action, index) => (
                        <Link
                            key={index}
                            href={action.href}
                            className={`group/item relative p-4 rounded-xl backdrop-blur-sm border border-white/20 dark:border-gray-700/20 transition-all duration-300 hover:scale-105 transform bg-gradient-to-br ${action.bgGradient} ${action.hoverGradient} animate-fadeInUp`}
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className={`absolute -inset-0.5 bg-gradient-to-r ${action.gradient} rounded-xl opacity-0 group-hover/item:opacity-20 blur transition-opacity`}></div>
                            <div className="relative">
                                <div className="flex items-start justify-between mb-3">
                                    <div className={`p-2 bg-gradient-to-r ${action.gradient} rounded-lg shadow-lg group-hover/item:scale-110 transition-transform`}>
                                        <div className="text-white">
                                            {action.icon}
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-xl group-hover/item:animate-bounce">{action.emoji}</span>
                                        {action.badge && (
                                            <span className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                                                {action.badge}
                                            </span>
                                        )}
                                        <svg className="w-4 h-4 text-gray-400 opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                                <div>
                                    <h4 className={`text-sm font-semibold mb-1 bg-gradient-to-r ${action.gradient} bg-clip-text text-transparent group-hover/item:animate-pulse`}>
                                        {action.title}
                                    </h4>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 group-hover/item:text-gray-800 dark:group-hover/item:text-gray-300 transition-colors">
                                        {action.description}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Emergency Actions */}
                <div className="mt-8 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                        <span>Emergency Actions</span>
                        <span className="text-red-500 animate-pulse">🚨</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <button className="group relative flex items-center justify-center space-x-2 p-3 rounded-xl backdrop-blur-sm border border-red-200/50 dark:border-red-700/50 bg-gradient-to-r from-red-50/80 to-red-100/80 dark:from-red-900/30 dark:to-red-800/30 text-red-600 dark:text-red-400 hover:from-red-100 hover:to-red-200 dark:hover:from-red-900/50 dark:hover:to-red-800/50 transition-all duration-300 transform hover:scale-105">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-red-600 rounded-xl opacity-0 group-hover:opacity-20 blur transition-opacity"></div>
                            <svg className="w-4 h-4 group-hover:animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                            </svg>
                            <span className="text-sm font-medium relative">Cancel Booking</span>
                        </button>
                        <button className="group relative flex items-center justify-center space-x-2 p-3 rounded-xl backdrop-blur-sm border border-yellow-200/50 dark:border-yellow-700/50 bg-gradient-to-r from-yellow-50/80 to-orange-50/80 dark:from-yellow-900/30 dark:to-orange-900/30 text-yellow-600 dark:text-yellow-400 hover:from-yellow-100 hover:to-orange-100 dark:hover:from-yellow-900/50 dark:hover:to-orange-900/50 transition-all duration-300 transform hover:scale-105">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl opacity-0 group-hover:opacity-20 blur transition-opacity"></div>
                            <svg className="w-4 h-4 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.864-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            <span className="text-sm font-medium relative">Report Issue</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
} 