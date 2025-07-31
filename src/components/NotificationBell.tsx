'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useNotifications } from '@/hooks/useAPI';
import {
    BellIcon,
    CheckIcon,
    ClockIcon,
    ExclamationTriangleIcon,
    CreditCardIcon,
    ChatBubbleLeftRightIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { BellIcon as BellIconSolid } from '@heroicons/react/24/solid';

interface Notification {
    id: string;
    userId: string;
    userType: 'CLIENT' | 'PROVIDER';
    type: 'BOOKING_REQUEST' | 'BOOKING_CONFIRMED' | 'BOOKING_CANCELLED' | 'SYSTEM_ANNOUNCEMENT';
    title: string;
    message: string;
    data: any;
    isRead: boolean;
    sentViaEmail: boolean;
    sentViaSMS: boolean;
    createdAt: string;
    isUrgent?: boolean;
    actionRequired?: boolean;
    actionUrl?: string;
}

interface NotificationBellProps {
    userType: 'CLIENT' | 'PROVIDER';
}

export default function NotificationBell({ userType }: NotificationBellProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Use SWR for notifications with automatic caching and revalidation
    const { notifications, unreadCount, isLoading, isError, mutateNotifications, markAllAsRead } = useNotifications();

    // Mark notification as read (optimistic updates with SWR)
    const markAsRead = async (notificationId: string) => {
        try {
            // Optimistic update
            mutateNotifications(
                (currentData: any) => {
                    if (!currentData) return currentData;
                    return {
                        ...currentData,
                        notifications: currentData.notifications.map((n: Notification) =>
                            n.id === notificationId ? { ...n, isRead: true } : n
                        ),
                        unreadCount: Math.max(0, currentData.unreadCount - 1)
                    };
                },
                false // Don't revalidate immediately
            );

            const response = await fetch(`/api/notifications/${notificationId}/read`, {
                method: 'PATCH'
            });

            if (response.ok) {
                // Revalidate to sync with server
                mutateNotifications();
                // Trigger refresh across the app
                window.dispatchEvent(new CustomEvent('notificationsChanged'));
            } else {
                // Revert on error
                mutateNotifications();
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
            // Revert on error
            mutateNotifications();
        }
    };

    // Get notification icon
    const getNotificationIcon = (type: string, isUrgent?: boolean) => {
        const iconClass = `w-5 h-5 ${isUrgent ? 'text-red-500' : 'text-gray-500'}`;

        switch (type) {
            case 'BOOKING_REQUEST':
                return <ClockIcon className={iconClass} />;
            case 'BOOKING_CONFIRMED':
                return <CheckIcon className="w-5 h-5 text-green-500" />;
            case 'BOOKING_CANCELLED':
                return <XMarkIcon className="w-5 h-5 text-red-500" />;
            default:
                return <BellIcon className={iconClass} />;
        }
    };

    // Get action URL based on notification type and user type
    const getActionUrl = (notification: Notification) => {
        const data = notification.data ? JSON.parse(notification.data) : {};

        if (userType === 'PROVIDER') {
            if (notification.type === 'BOOKING_REQUEST') {
                return '/provider/bookings?filter=PENDING';
            }
            return '/provider/dashboard';
        } else {
            if (notification.type === 'BOOKING_CONFIRMED' && data.nextAction === 'COMPLETE_PAYMENT') {
                return '/client/dashboard?action=payment';
            }
            return '/client/dashboard';
        }
    };

    // Get action text
    const getActionText = (notification: Notification) => {
        const data = notification.data ? JSON.parse(notification.data) : {};

        if (userType === 'PROVIDER' && notification.type === 'BOOKING_REQUEST') {
            return 'Review Request';
        }
        if (userType === 'CLIENT' && data.nextAction === 'COMPLETE_PAYMENT') {
            return 'Complete Payment';
        }
        return 'View Details';
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Listen for notification changes (SWR handles auto-refresh)
    useEffect(() => {
        const handleNotificationChange = () => {
            mutateNotifications();
        };
        window.addEventListener('notificationsChanged', handleNotificationChange);

        return () => {
            window.removeEventListener('notificationsChanged', handleNotificationChange);
        };
    }, [mutateNotifications]);

    // Sort notifications by urgency and date
    const sortedNotifications = [...notifications]
        .sort((a, b) => {
            // Unread first
            if (a.isRead !== b.isRead) return a.isRead ? 1 : -1;
            // Urgent first
            if (a.data && b.data) {
                const aData = JSON.parse(a.data);
                const bData = JSON.parse(b.data);
                if (aData.isUrgent !== bData.isUrgent) return bData.isUrgent ? 1 : -1;
            }
            // Most recent first
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Notification Bell */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                title="Notifications"
            >
                {/* Bell Icon */}
                {unreadCount > 0 ? (
                    <BellIconSolid className="w-6 h-6 text-blue-600" />
                ) : (
                    <BellIcon className="w-6 h-6" />
                )}

                {/* Notification Count Badge */}
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Notification Dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-hidden">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Notifications ({unreadCount})
                        </h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-80 overflow-y-auto">
                        {isLoading ? (
                            <div className="p-6 text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                <p className="text-gray-500 dark:text-gray-400 mt-2">Loading notifications...</p>
                            </div>
                        ) : sortedNotifications.length === 0 ? (
                            <div className="p-6 text-center">
                                <BellIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-500 dark:text-gray-400">No notifications yet</p>
                                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                                    You&apos;ll see updates about your bookings here
                                </p>
                            </div>
                        ) : (
                            sortedNotifications.map((notification) => {
                                const data = notification.data ? JSON.parse(notification.data) : {};
                                const actionUrl = getActionUrl(notification);
                                const actionText = getActionText(notification);

                                return (
                                    <div
                                        key={notification.id}
                                        className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${!notification.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                                            }`}
                                    >
                                        <div className="flex items-start space-x-3">
                                            {/* Icon */}
                                            <div className="flex-shrink-0 mt-1">
                                                {getNotificationIcon(notification.type, data.isUrgent)}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h4 className={`text-sm font-medium truncate ${!notification.isRead
                                                            ? 'text-gray-900 dark:text-white'
                                                            : 'text-gray-700 dark:text-gray-300'
                                                            }`}>
                                                            {notification.title}
                                                            {data.isUrgent && (
                                                                <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                                                                    Urgent
                                                                </span>
                                                            )}
                                                        </h4>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                                            {notification.message}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                                            {new Date(notification.createdAt).toLocaleString()}
                                                        </p>
                                                    </div>

                                                    {/* Unread indicator */}
                                                    {!notification.isRead && (
                                                        <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2"></div>
                                                    )}
                                                </div>

                                                {/* Action Buttons */}
                                                {(data.requiresAction || data.nextAction) && (
                                                    <div className="mt-3 flex space-x-2">
                                                        <Link
                                                            href={actionUrl}
                                                            onClick={() => {
                                                                markAsRead(notification.id);
                                                                setIsOpen(false);
                                                            }}
                                                            className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors"
                                                        >
                                                            {data.nextAction === 'COMPLETE_PAYMENT' && (
                                                                <CreditCardIcon className="w-4 h-4 mr-1" />
                                                            )}
                                                            {actionText}
                                                        </Link>

                                                        {!notification.isRead && (
                                                            <button
                                                                onClick={() => markAsRead(notification.id)}
                                                                className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-md hover:bg-gray-200 transition-colors"
                                                            >
                                                                Mark read
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Footer */}
                    {sortedNotifications.length > 0 && (
                        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 text-center">
                            <Link
                                href={userType === 'PROVIDER' ? '/provider/notifications' : '/client/notifications'}
                                onClick={() => setIsOpen(false)}
                                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                                View all notifications
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
} 