'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface NotificationBellProps {
    userType: 'CLIENT' | 'PROVIDER';
}

export default function SimpleNotificationBell({ userType }: NotificationBellProps) {
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Fetch notifications
        const fetchNotifications = async () => {
            try {
                const response = await fetch('/api/notifications');
                if (response.ok) {
                    const data = await response.json();
                    const unread = data.notifications?.filter((n: any) => !n.isRead).length || 0;
                    setUnreadCount(unread);
                }
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
        };

        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-3 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 hover:scale-110 group bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-xl shadow-lg border border-white/30 dark:border-gray-700/30 hover:shadow-xl hover:bg-blue-50/50 dark:hover:bg-blue-900/20"
                title="Notifications"
            >
                {/* Bell Icon */}
                {unreadCount > 0 ? (
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 group-hover:animate-bounce" fill="currentColor" viewBox="0 0 24 24">
                        <path fillRule="evenodd" d="M5.25 9a6.75 6.75 0 0113.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 01-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 11-7.48 0 24.585 24.585 0 01-4.831-1.244.75.75 0 01-.298-1.205A8.217 8.217 0 005.25 9.75V9z" clipRule="evenodd" />
                    </svg>
                ) : (
                    <svg className="w-6 h-6 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:animate-bounce" fill="currentColor" viewBox="0 0 24 24">
                        <path fillRule="evenodd" d="M5.25 9a6.75 6.75 0 0113.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 01-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 11-7.48 0 24.585 24.585 0 01-4.831-1.244.75.75 0 01-.298-1.205A8.217 8.217 0 005.25 9.75V9z" clipRule="evenodd" />
                    </svg>
                )}

                {/* Notification Count Badge */}
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[20px] h-[20px] bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse ring-2 ring-white dark:ring-gray-800 shadow-lg">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Notification Dropdown using Portal */}
            {isOpen && typeof document !== 'undefined' && createPortal(
                <>
                    {/* Backdrop overlay */}
                    <div className="fixed inset-0 z-[99998] bg-black/20 backdrop-blur-sm" onClick={() => setIsOpen(false)}></div>

                    {/* Dropdown content - positioned at top right of screen */}
                    <div className="fixed top-16 right-4 w-96 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 dark:border-gray-700/30 z-[99999] animate-fadeInUp ring-1 ring-black/5 dark:ring-white/5">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-gray-200/50 dark:border-gray-700/50">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                                            <path fillRule="evenodd" d="M5.25 9a6.75 6.75 0 0113.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 01-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 11-7.48 0 24.585 24.585 0 01-4.831-1.244.75.75 0 01-.298-1.205A8.217 8.217 0 005.25 9.75V9z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <span>Notifications</span>
                                </h3>
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                                        {unreadCount} unread
                                    </span>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                    >
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            <div className="text-center py-8">
                                {unreadCount > 0 ? (
                                    <div>
                                        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                            <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                                                <path fillRule="evenodd" d="M5.25 9a6.75 6.75 0 0113.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 01-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 11-7.48 0 24.585 24.585 0 01-4.831-1.244.75.75 0 01-.298-1.205A8.217 8.217 0 005.25 9.75V9z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                            {unreadCount} New Notification{unreadCount > 1 ? 's' : ''}! 🎉
                                        </h4>
                                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                                            You have new booking requests and updates waiting for your attention.
                                        </p>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                            <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                                <path fillRule="evenodd" d="M5.25 9a6.75 6.75 0 0113.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 01-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 11-7.48 0 24.585 24.585 0 01-4.831-1.244.75.75 0 01-.298-1.205A8.217 8.217 0 005.25 9.75V9z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                            All Caught Up! ✨
                                        </h4>
                                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                                            You&apos;re all up to date. No new notifications at the moment.
                                        </p>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex flex-col space-y-3">
                                    <a
                                        href={userType === 'PROVIDER' ? '/provider/notifications' : '/client/notifications'}
                                        className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                        View All Notifications
                                    </a>

                                    <a
                                        href={userType === 'PROVIDER' ? '/provider/bookings' : '/client/dashboard'}
                                        className="inline-flex items-center justify-center px-6 py-3 bg-white/80 dark:bg-gray-700/80 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border border-gray-200/50 dark:border-gray-600/50 backdrop-blur-sm"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                        {userType === 'PROVIDER' ? 'Check Bookings' : 'Go to Dashboard'}
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </>,
                document.body
            )}
        </div>
    );
} 