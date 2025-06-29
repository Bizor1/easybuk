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

export default function ClientNotifications() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'unread' | 'payment'>('all');

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

    const getNotificationIcon = (type: string, data: any) => {
        const isPaymentRequired = data?.nextAction === 'COMPLETE_PAYMENT';

        switch (type) {
            case 'BOOKING_CONFIRMED':
                return isPaymentRequired
                    ? <CreditCardIcon className="w-6 h-6 text-blue-500" />
                    : <CheckIcon className="w-6 h-6 text-green-500" />;
            case 'BOOKING_REQUEST':
                return <ClockIcon className="w-6 h-6 text-orange-500" />;
            case 'BOOKING_CANCELLED':
                return <XMarkIcon className="w-6 h-6 text-red-500" />;
            default:
                return <BellIcon className="w-6 h-6 text-gray-500" />;
        }
    };

    const getActionUrl = (notification: Notification) => {
        const data = notification.data ? JSON.parse(notification.data) : {};

        if (data.nextAction === 'COMPLETE_PAYMENT') {
            return '/client/dashboard?action=payment';
        }
        return '/client/dashboard';
    };

    const getActionText = (notification: Notification) => {
        const data = notification.data ? JSON.parse(notification.data) : {};

        if (data.nextAction === 'COMPLETE_PAYMENT') {
            return 'Complete Payment';
        }
        return 'View Details';
    };

    const filteredNotifications = notifications.filter(notification => {
        const data = notification.data ? JSON.parse(notification.data) : {};

        switch (filter) {
            case 'unread':
                return !notification.isRead;
            case 'payment':
                return data.nextAction === 'COMPLETE_PAYMENT';
            default:
                return true;
        }
    }).sort((a, b) => {
        // Unread first
        if (a.isRead !== b.isRead) return a.isRead ? 1 : -1;
        // Payment required first
        const aData = a.data ? JSON.parse(a.data) : {};
        const bData = b.data ? JSON.parse(b.data) : {};
        const aPayment = aData.nextAction === 'COMPLETE_PAYMENT';
        const bPayment = bData.nextAction === 'COMPLETE_PAYMENT';
        if (aPayment !== bPayment) return bPayment ? 1 : -1;
        // Most recent first
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const unreadCount = notifications.filter(n => !n.isRead).length;
    const paymentCount = notifications.filter(n => {
        const data = n.data ? JSON.parse(n.data) : {};
        return data.nextAction === 'COMPLETE_PAYMENT';
    }).length;

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 dark:from-slate-900 dark:via-gray-900 dark:to-slate-800 p-8">
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 dark:from-slate-900 dark:via-gray-900 dark:to-slate-800 relative overflow-hidden">
            {/* Floating Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-orange-400/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-orange-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">
                                <span className="text-gray-900 dark:text-white flex items-center space-x-3">
                                    <BellIconSolid className="w-10 h-10 text-blue-600" />
                                    <span>Notifications</span>
                                </span>
                                <span className="block text-gradient-mixed animate-gradient-x">Stay Updated 🔔</span>
                            </h1>
                            <p className="text-lg text-gray-600 dark:text-gray-400">
                                Track your booking updates and important messages
                            </p>
                        </div>
                        <div className="flex items-center space-x-4">
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                                >
                                    Mark All Read
                                </button>
                            )}
                            <Link
                                href="/client/dashboard"
                                className="px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-all duration-300 transform hover:scale-105"
                            >
                                Back to Dashboard
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-6">
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

                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-6">
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

                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                <CreditCardIcon className="w-6 h-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Payment Due</h3>
                                <p className="text-2xl font-bold text-green-600">{paymentCount}</p>
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
                                : 'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                        >
                            All ({notifications.length})
                        </button>
                        <button
                            onClick={() => setFilter('unread')}
                            className={`px-4 py-2 rounded-lg transition-colors ${filter === 'unread'
                                ? 'bg-orange-600 text-white'
                                : 'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                        >
                            Unread ({unreadCount})
                        </button>
                        <button
                            onClick={() => setFilter('payment')}
                            className={`px-4 py-2 rounded-lg transition-colors ${filter === 'payment'
                                ? 'bg-green-600 text-white'
                                : 'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                        >
                            Payment Due ({paymentCount})
                        </button>
                    </div>
                </div>

                {/* Notifications List */}
                <div className="space-y-4">
                    {filteredNotifications.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-12">
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
                        </div>
                    ) : (
                        filteredNotifications.map((notification, index) => {
                            const data = notification.data ? JSON.parse(notification.data) : {};
                            const actionUrl = getActionUrl(notification);
                            const actionText = getActionText(notification);
                            const requiresPayment = data.nextAction === 'COMPLETE_PAYMENT';

                            return (
                                <div
                                    key={notification.id}
                                    className={`relative group animate-fadeInUp ${requiresPayment ? 'ring-2 ring-green-500/50' : ''}`}
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <div className={`absolute -inset-1 bg-gradient-to-r ${requiresPayment
                                        ? 'from-green-500 to-emerald-500'
                                        : !notification.isRead
                                            ? 'from-blue-500 to-purple-500'
                                            : 'from-gray-400 to-gray-600'
                                        } rounded-xl opacity-20 group-hover:opacity-30 blur transition-opacity`}></div>

                                    <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
                                        {requiresPayment && (
                                            <div className="absolute top-2 right-2 flex items-center space-x-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-1 rounded-full text-xs">
                                                <CreditCardIcon className="w-3 h-3" />
                                                <span>Payment Required</span>
                                            </div>
                                        )}

                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start space-x-4 flex-1">
                                                {/* Icon */}
                                                <div className="flex-shrink-0 mt-1">
                                                    {getNotificationIcon(notification.type, data)}
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <h3 className={`text-lg font-semibold ${!notification.isRead
                                                            ? 'text-gray-900 dark:text-white'
                                                            : 'text-gray-700 dark:text-gray-300'
                                                            }`}>
                                                            {notification.title}
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
                                                                    className={`inline-flex items-center px-3 py-1.5 text-white text-sm font-medium rounded-md transition-colors ${requiresPayment
                                                                        ? 'bg-green-600 hover:bg-green-700'
                                                                        : 'bg-blue-600 hover:bg-blue-700'
                                                                        }`}
                                                                >
                                                                    {requiresPayment ? (
                                                                        <CreditCardIcon className="w-4 h-4 mr-1" />
                                                                    ) : (
                                                                        <EyeIcon className="w-4 h-4 mr-1" />
                                                                    )}
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