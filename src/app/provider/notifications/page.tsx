'use client'

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
    BellIcon,
    CheckIcon,
    ClockIcon,
    ExclamationTriangleIcon,
    CreditCardIcon,
    ChatBubbleLeftRightIcon,
    XMarkIcon,
    EyeIcon,
    TrashIcon
} from '@heroicons/react/24/outline';
import { BellIcon as BellIconSolid } from '@heroicons/react/24/solid';
import Link from 'next/link';

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

export default function ProviderNotifications() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'unread' | 'urgent'>('all');
    const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/notifications?limit=50');
            if (response.ok) {
                const data = await response.json();
                setNotifications(data.notifications || []);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (notificationId: string) => {
        try {
            const response = await fetch(`/api/notifications/${notificationId}/read`, {
                method: 'PATCH'
            });

            if (response.ok) {
                setNotifications(prev =>
                    prev.map(n =>
                        n.id === notificationId ? { ...n, isRead: true } : n
                    )
                );
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const response = await fetch('/api/notifications/mark-all-read', {
                method: 'PATCH'
            });

            if (response.ok) {
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            }
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    const deleteNotification = async (notificationId: string) => {
        try {
            const response = await fetch(`/api/notifications/${notificationId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                setNotifications(prev => prev.filter(n => n.id !== notificationId));
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const getNotificationIcon = (type: string, isUrgent?: boolean) => {
        const iconClass = `w-6 h-6 ${isUrgent ? 'text-red-500' : 'text-gray-500'}`;

        switch (type) {
            case 'BOOKING_REQUEST':
                return <ClockIcon className={iconClass} />;
            case 'BOOKING_CONFIRMED':
                return <CheckIcon className="w-6 h-6 text-green-500" />;
            case 'BOOKING_CANCELLED':
                return <XMarkIcon className="w-6 h-6 text-red-500" />;
            default:
                return <BellIcon className={iconClass} />;
        }
    };

    const getActionUrl = (notification: Notification) => {
        const data = notification.data ? JSON.parse(notification.data) : {};

        if (notification.type === 'BOOKING_REQUEST') {
            return '/provider/bookings?filter=PENDING';
        }
        return '/provider/dashboard';
    };

    const getActionText = (notification: Notification) => {
        if (notification.type === 'BOOKING_REQUEST') {
            return 'Review Request';
        }
        return 'View Details';
    };

    const filteredNotifications = notifications.filter(notification => {
        const data = notification.data ? JSON.parse(notification.data) : {};

        switch (filter) {
            case 'unread':
                return !notification.isRead;
            case 'urgent':
                return data.isUrgent || data.requiresAction;
            default:
                return true;
        }
    }).sort((a, b) => {
        // Unread first
        if (a.isRead !== b.isRead) return a.isRead ? 1 : -1;
        // Urgent first
        const aData = a.data ? JSON.parse(a.data) : {};
        const bData = b.data ? JSON.parse(b.data) : {};
        if (aData.isUrgent !== bData.isUrgent) return bData.isUrgent ? 1 : -1;
        // Most recent first
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const unreadCount = notifications.filter(n => !n.isRead).length;
    const urgentCount = notifications.filter(n => {
        const data = n.data ? JSON.parse(n.data) : {};
        return data.isUrgent || data.requiresAction;
    }).length;

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                        <div className="space-y-3">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center space-x-3">
                                <BellIconSolid className="w-8 h-8 text-blue-600" />
                                <span>Notifications</span>
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                Stay updated with your booking requests and important updates
                            </p>
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Mark All Read
                            </button>
                        )}
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center">
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <BellIcon className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Total</h3>
                                <p className="text-2xl font-bold text-blue-600">{notifications.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center">
                            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                                <ExclamationTriangleIcon className="w-6 h-6 text-orange-600" />
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Unread</h3>
                                <p className="text-2xl font-bold text-orange-600">{unreadCount}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center">
                            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                                <ClockIcon className="w-6 h-6 text-red-600" />
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Urgent</h3>
                                <p className="text-2xl font-bold text-red-600">{urgentCount}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="mb-6">
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 rounded-lg transition-colors ${filter === 'all'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                }`}
                        >
                            All ({notifications.length})
                        </button>
                        <button
                            onClick={() => setFilter('unread')}
                            className={`px-4 py-2 rounded-lg transition-colors ${filter === 'unread'
                                ? 'bg-orange-600 text-white'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                }`}
                        >
                            Unread ({unreadCount})
                        </button>
                        <button
                            onClick={() => setFilter('urgent')}
                            className={`px-4 py-2 rounded-lg transition-colors ${filter === 'urgent'
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                }`}
                        >
                            Urgent ({urgentCount})
                        </button>
                    </div>
                </div>

                {/* Notifications List */}
                <div className="space-y-4">
                    {filteredNotifications.length === 0 ? (
                        <div className="text-center py-12">
                            <BellIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                No notifications found
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                {filter === 'all'
                                    ? "You don't have any notifications yet"
                                    : `No ${filter} notifications found`
                                }
                            </p>
                        </div>
                    ) : (
                        filteredNotifications.map((notification) => {
                            const data = notification.data ? JSON.parse(notification.data) : {};
                            const actionUrl = getActionUrl(notification);
                            const actionText = getActionText(notification);

                            return (
                                <div
                                    key={notification.id}
                                    className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border transition-all hover:shadow-md ${!notification.isRead
                                        ? 'border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10'
                                        : 'border-gray-200 dark:border-gray-700'
                                        }`}
                                >
                                    <div className="p-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start space-x-4 flex-1">
                                                {/* Icon */}
                                                <div className="flex-shrink-0 mt-1">
                                                    {getNotificationIcon(notification.type, data.isUrgent)}
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <h3 className={`text-lg font-semibold ${!notification.isRead
                                                            ? 'text-gray-900 dark:text-white'
                                                            : 'text-gray-700 dark:text-gray-300'
                                                            }`}>
                                                            {notification.title}
                                                            {data.isUrgent && (
                                                                <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                                                                    Urgent
                                                                </span>
                                                            )}
                                                        </h3>
                                                        {!notification.isRead && (
                                                            <div className="w-3 h-3 bg-blue-600 rounded-full flex-shrink-0"></div>
                                                        )}
                                                    </div>

                                                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                                                        {notification.message}
                                                    </p>

                                                    <div className="flex items-center justify-between">
                                                        <p className="text-sm text-gray-500 dark:text-gray-500">
                                                            {new Date(notification.createdAt).toLocaleString()}
                                                        </p>

                                                        <div className="flex items-center space-x-2">
                                                            {(data.requiresAction || data.nextAction) && (
                                                                <Link
                                                                    href={actionUrl}
                                                                    onClick={() => markAsRead(notification.id)}
                                                                    className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                                                                >
                                                                    <CreditCardIcon className="w-4 h-4 mr-1" />
                                                                    {actionText}
                                                                </Link>
                                                            )}

                                                            {!notification.isRead && (
                                                                <button
                                                                    onClick={() => markAsRead(notification.id)}
                                                                    className="inline-flex items-center px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                                                >
                                                                    <CheckIcon className="w-4 h-4 mr-1" />
                                                                    Mark Read
                                                                </button>
                                                            )}

                                                            <button
                                                                onClick={() => deleteNotification(notification.id)}
                                                                className="inline-flex items-center px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm font-medium rounded-md hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                                                            >
                                                                <TrashIcon className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
} 