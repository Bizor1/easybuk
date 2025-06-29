'use client'

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
    ClockIcon,
    CheckCircleIcon,
    XCircleIcon,
    EyeIcon,
    ChatBubbleLeftRightIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface Booking {
    id: string;
    title: string;
    description: string;
    status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'AWAITING_CLIENT_CONFIRMATION';
    isPaid: boolean;
    scheduledDate: string;
    scheduledTime: string;
    duration: number;
    location: string;
    totalAmount: number;
    currency: string;
    paymentMethod: string;
    createdAt: string;
    updatedAt: string;
    cancelledAt: string | null;
    completedAt: string | null;
    client: {
        id: string;
        name: string;
        email: string;
        profileImage: string | null;
    };
    service: {
        id: string;
        title: string;
        category: string;
    } | null;
    isUrgent: boolean;
    timeSinceRequest: number | null;
}

interface BookingsResponse {
    success: boolean;
    bookings: Booking[];
    stats: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        statusCounts: {
            PENDING: number;
            CONFIRMED: number;
            IN_PROGRESS: number;
            ACTIVE: number;
            COMPLETED: number;
            CANCELLED: number;
        };
        pendingRequests: number;
    };
    message: string;
}

export default function BookingsPage() {
    const [activeTab, setActiveTab] = useState<'all' | 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [stats, setStats] = useState<BookingsResponse['stats'] | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [actionModal, setActionModal] = useState<{ type: 'accept' | 'decline'; booking: Booking } | null>(null);
    const [responseMessage, setResponseMessage] = useState('');

    const fetchBookings = useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (activeTab !== 'all') params.append('status', activeTab);

            const response = await fetch(`/api/provider/bookings?${params}`);
            if (response.ok) {
                const data: BookingsResponse = await response.json();
                setBookings(data.bookings || []);
                setStats(data.stats);
                console.log('Bookings loaded:', data.message);
            } else {
                console.error('Failed to fetch bookings');
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    }, [activeTab]);

    // Fetch bookings data
    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    const handleBookingAction = async (bookingId: string, action: 'ACCEPT' | 'DECLINE', message?: string) => {
        try {
            setActionLoading(bookingId);

            const response = await fetch(`/api/bookings/${bookingId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action,
                    message: message || ''
                }),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // Refresh bookings to show updated status
                await fetchBookings();
                setActionModal(null);
                setResponseMessage('');

                // Show success message
                alert(`Booking ${action.toLowerCase()}ed successfully!`);
            } else {
                alert(`Failed to ${action.toLowerCase()} booking: ${result.error}`);
            }
        } catch (error) {
            console.error(`Error ${action.toLowerCase()}ing booking:`, error);
            alert(`Error ${action.toLowerCase()}ing booking. Please try again.`);
        } finally {
            setActionLoading(null);
        }
    };

    const handleCompleteService = async (bookingId: string) => {
        try {
            setActionLoading(bookingId);

            const response = await fetch(`/api/bookings/${bookingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    status: 'COMPLETED'
                })
            });

            if (response.ok) {
                alert('Service marked as completed! Client will be notified to confirm.');
                // Refresh bookings
                await fetchBookings();
            } else {
                const error = await response.json();
                alert(`Failed to complete service: ${error.error || error.message}`);
            }
        } catch (error) {
            console.error('Error completing service:', error);
            alert('Failed to complete service. Please try again.');
        } finally {
            setActionLoading(null);
        }
    };

    const getStatusConfig = (status: Booking['status']) => {
        const configs = {
            PENDING: {
                gradient: 'from-yellow-100/90 to-orange-100/90 dark:from-yellow-900/30 dark:to-orange-900/30',
                textColor: 'text-yellow-800 dark:text-yellow-400',
                bgGradient: 'from-yellow-500 to-orange-500',
                emoji: '⏳'
            },
            CONFIRMED: {
                gradient: 'from-blue-100/90 to-cyan-100/90 dark:from-blue-900/30 dark:to-cyan-900/30',
                textColor: 'text-blue-800 dark:text-blue-400',
                bgGradient: 'from-blue-500 to-cyan-500',
                emoji: '✅'
            },
            IN_PROGRESS: {
                gradient: 'from-purple-100/90 to-pink-100/90 dark:from-purple-900/30 dark:to-pink-900/30',
                textColor: 'text-purple-800 dark:text-purple-400',
                bgGradient: 'from-purple-500 to-pink-500',
                emoji: '🔄'
            },
            ACTIVE: {
                gradient: 'from-purple-100/90 to-pink-100/90 dark:from-purple-900/30 dark:to-pink-900/30',
                textColor: 'text-purple-800 dark:text-purple-400',
                bgGradient: 'from-purple-500 to-pink-500',
                emoji: '🔄'
            },
            AWAITING_CLIENT_CONFIRMATION: {
                gradient: 'from-purple-100/90 to-indigo-100/90 dark:from-purple-900/30 dark:to-indigo-900/30',
                textColor: 'text-purple-800 dark:text-purple-400',
                bgGradient: 'from-purple-500 to-indigo-500',
                emoji: '⏰'
            },
            COMPLETED: {
                gradient: 'from-green-100/90 to-emerald-100/90 dark:from-green-900/30 dark:to-emerald-900/30',
                textColor: 'text-green-800 dark:text-green-400',
                bgGradient: 'from-green-500 to-emerald-500',
                emoji: '🎉'
            },
            CANCELLED: {
                gradient: 'from-red-100/90 to-red-200/90 dark:from-red-900/30 dark:to-red-800/30',
                textColor: 'text-red-800 dark:text-red-400',
                bgGradient: 'from-red-500 to-red-600',
                emoji: '❌'
            }
        };
        return configs[status];
    };

    const filteredBookings = bookings.filter(booking => {
        const matchesTab = activeTab === 'all' || booking.status === activeTab;
        const matchesSearch = booking.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.title.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesTab && matchesSearch;
    });

    const tabs = [
        { id: 'all', label: 'All Bookings', count: stats?.total || 0 },
        {
            id: 'PENDING',
            label: 'Pending Requests',
            count: stats?.statusCounts.PENDING || 0,
            urgent: (stats?.pendingRequests || 0) > 0
        },
        { id: 'CONFIRMED', label: 'Confirmed', count: stats?.statusCounts.CONFIRMED || 0 },
        { id: 'IN_PROGRESS', label: 'In Progress', count: stats?.statusCounts.IN_PROGRESS || 0 },
        { id: 'ACTIVE', label: 'Active', count: stats?.statusCounts.ACTIVE || 0 },
        { id: 'COMPLETED', label: 'Completed', count: stats?.statusCounts.COMPLETED || 0 },
        { id: 'CANCELLED', label: 'Cancelled', count: stats?.statusCounts.CANCELLED || 0 }
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 dark:from-slate-900 dark:via-gray-900 dark:to-slate-800 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">Loading bookings...</p>
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

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">
                                <span className="text-gray-900 dark:text-white">Booking Requests</span>
                                <span className="block text-gradient-mixed animate-gradient-x">Management 📋</span>
                            </h1>
                            <p className="text-lg text-gray-600 dark:text-gray-400">
                                {stats?.pendingRequests ?
                                    `⚠️ You have ${stats.pendingRequests} pending request${stats.pendingRequests > 1 ? 's' : ''} requiring your attention!` :
                                    'Manage all your service booking requests and appointments'
                                }
                            </p>
                        </div>
                        <div className="mt-4 md:mt-0">
                            <Link
                                href="/provider/services"
                                className="inline-flex items-center bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                            >
                                + Create Service
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="relative group mb-8">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl opacity-20 group-hover:opacity-30 blur transition-opacity"></div>
                    <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    <input
                                        type="text"
                                        placeholder="Search by client name or service..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-gradient-to-r from-gray-50/80 to-gray-100/80 dark:from-gray-700/50 dark:to-gray-600/50 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex flex-wrap gap-2 mt-4">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 ${activeTab === tab.id
                                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                                        : 'bg-gradient-to-r from-gray-100/80 to-gray-200/80 dark:from-gray-700/50 dark:to-gray-600/50 text-gray-700 dark:text-gray-300 hover:from-blue-100/80 hover:to-purple-100/80'
                                        }`}
                                >
                                    {tab.label}
                                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${activeTab === tab.id
                                        ? 'bg-white/20'
                                        : 'bg-gray-300/50 dark:bg-gray-600/50'
                                        }`}>
                                        {tab.count}
                                    </span>
                                    {tab.urgent && (
                                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bookings List */}
                {filteredBookings.length > 0 ? (
                    <div className="space-y-4">
                        {filteredBookings.map((booking, index) => {
                            const statusConfig = getStatusConfig(booking.status);
                            return (
                                <div
                                    key={booking.id}
                                    className={`relative group animate-fadeInUp ${booking.isUrgent ? 'ring-2 ring-orange-500/50' : ''}`}
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <div className={`absolute -inset-1 bg-gradient-to-r ${statusConfig.bgGradient} rounded-xl opacity-20 group-hover:opacity-30 blur transition-opacity`}></div>
                                    <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
                                        {booking.isUrgent && (
                                            <div className="absolute top-2 right-2 flex items-center space-x-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-2 py-1 rounded-full text-xs">
                                                <ExclamationTriangleIcon className="w-3 h-3" />
                                                <span>Urgent</span>
                                            </div>
                                        )}

                                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                                            <div className="flex items-start space-x-4 flex-1">
                                                {/* Client Avatar */}
                                                <div className="relative group/avatar">
                                                    <div className="w-15 h-15 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold ring-4 ring-white dark:ring-gray-700 group-hover/avatar:ring-blue-500/30 transition-all">
                                                        {booking.client.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-0 group-hover/avatar:opacity-20 blur transition-opacity"></div>
                                                </div>

                                                {/* Booking Details */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div>
                                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                                {booking.client.name}
                                                            </h3>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">{booking.client.email}</p>
                                                            {booking.timeSinceRequest !== null && (
                                                                <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                                                                    Requested {booking.timeSinceRequest}h ago
                                                                </p>
                                                            )}
                                                        </div>
                                                        <span className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${statusConfig.gradient} ${statusConfig.textColor} backdrop-blur-sm border border-white/20`}>
                                                            <span>{statusConfig.emoji}</span>
                                                            <span>{booking.status.charAt(0).toUpperCase() + booking.status.slice(1).toLowerCase()}</span>
                                                        </span>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                                        <div>
                                                            <p className="text-gray-500 dark:text-gray-400">Service</p>
                                                            <p className="font-medium text-gray-900 dark:text-white">{booking.title}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-500 dark:text-gray-400">Date & Time</p>
                                                            <p className="font-medium text-gray-900 dark:text-white">
                                                                {new Date(booking.scheduledDate).toLocaleDateString()} at {booking.scheduledTime}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-500 dark:text-gray-400">Location</p>
                                                            <p className="font-medium text-gray-900 dark:text-white truncate">{booking.location}</p>
                                                        </div>
                                                    </div>

                                                    <div className="mt-3 flex items-center justify-between">
                                                        <div className="flex items-center space-x-4">
                                                            <span className="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                                                {booking.currency} {booking.totalAmount.toFixed(2)}
                                                            </span>
                                                            {booking.status === 'CONFIRMED' && !booking.isPaid && (
                                                                <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 px-2 py-1 rounded">
                                                                    Awaiting Payment
                                                                </span>
                                                            )}
                                                            {booking.isPaid && (
                                                                <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 px-2 py-1 rounded">
                                                                    Paid
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex flex-wrap gap-2 mt-4 lg:mt-0 lg:ml-4">
                                                <button
                                                    onClick={() => setSelectedBooking(booking)}
                                                    className="px-4 py-2 bg-gradient-to-r from-blue-100/80 to-cyan-100/80 dark:from-blue-900/30 dark:to-cyan-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:from-blue-200/80 hover:to-cyan-200/80 transition-all transform hover:scale-105 text-sm font-medium flex items-center space-x-1"
                                                >
                                                    <EyeIcon className="w-4 h-4" />
                                                    <span>Details</span>
                                                </button>

                                                {booking.status === 'PENDING' && (
                                                    <>
                                                        <button
                                                            onClick={() => setActionModal({ type: 'accept', booking })}
                                                            disabled={actionLoading === booking.id}
                                                            className="px-4 py-2 bg-gradient-to-r from-green-100/80 to-emerald-100/80 dark:from-green-900/30 dark:to-emerald-900/30 text-green-600 dark:text-green-400 rounded-lg hover:from-green-200/80 hover:to-emerald-200/80 transition-all transform hover:scale-105 text-sm font-medium flex items-center space-x-1 disabled:opacity-50"
                                                        >
                                                            <CheckCircleIcon className="w-4 h-4" />
                                                            <span>{actionLoading === booking.id ? 'Processing...' : 'Accept'}</span>
                                                        </button>
                                                        <button
                                                            onClick={() => setActionModal({ type: 'decline', booking })}
                                                            disabled={actionLoading === booking.id}
                                                            className="px-4 py-2 bg-gradient-to-r from-red-100/80 to-red-200/80 dark:from-red-900/30 dark:to-red-800/30 text-red-600 dark:text-red-400 rounded-lg hover:from-red-200/80 hover:to-red-300/80 transition-all transform hover:scale-105 text-sm font-medium flex items-center space-x-1 disabled:opacity-50"
                                                        >
                                                            <XCircleIcon className="w-4 h-4" />
                                                            <span>{actionLoading === booking.id ? 'Processing...' : 'Decline'}</span>
                                                        </button>
                                                    </>
                                                )}

                                                {(booking.status === 'IN_PROGRESS' || booking.status === 'ACTIVE') && (
                                                    <button
                                                        onClick={() => handleCompleteService(booking.id)}
                                                        disabled={actionLoading === booking.id}
                                                        className="px-4 py-2 bg-gradient-to-r from-green-100/80 to-emerald-100/80 dark:from-green-900/30 dark:to-emerald-900/30 text-green-600 dark:text-green-400 rounded-lg hover:from-green-200/80 hover:to-emerald-200/80 transition-all transform hover:scale-105 text-sm font-medium flex items-center space-x-1 disabled:opacity-50"
                                                    >
                                                        <CheckCircleIcon className="w-4 h-4" />
                                                        <span>{actionLoading === booking.id ? 'Processing...' : 'Mark Complete'}</span>
                                                    </button>
                                                )}

                                                <Link
                                                    href={`/provider/messages?client=${booking.client.name}`}
                                                    className="px-4 py-2 bg-gradient-to-r from-purple-100/80 to-pink-100/80 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-600 dark:text-purple-400 rounded-lg hover:from-purple-200/80 hover:to-pink-200/80 transition-all transform hover:scale-105 text-sm font-medium flex items-center space-x-1"
                                                >
                                                    <ChatBubbleLeftRightIcon className="w-4 h-4" />
                                                    <span>Message</span>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-gray-400 to-gray-600 rounded-xl opacity-20 blur transition-opacity"></div>
                        <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-12 text-center">
                            <div className="text-6xl mb-4">📋</div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                {searchTerm || activeTab !== 'all' ? 'No booking requests found' : 'No booking requests yet'}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                {searchTerm || activeTab !== 'all'
                                    ? 'Try adjusting your search or filter criteria.'
                                    : 'Create your services to start receiving booking requests from clients.'}
                            </p>
                            {!searchTerm && activeTab === 'all' && (
                                <Link
                                    href="/provider/services"
                                    className="inline-flex items-center bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
                                >
                                    Create Your First Service
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Booking Details Modal */}
            {selectedBooking && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Booking Request Details</h3>
                                <button
                                    onClick={() => setSelectedBooking(null)}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    <XCircleIcon className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Client</label>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{selectedBooking.client.name}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedBooking.client.email}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{selectedBooking.status}</p>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Service</label>
                                <p className="text-lg font-semibold text-gray-900 dark:text-white">{selectedBooking.title}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{selectedBooking.description}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Date & Time</label>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {new Date(selectedBooking.scheduledDate).toLocaleDateString()}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedBooking.scheduledTime}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Duration</label>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {selectedBooking.duration >= 60
                                            ? `${Math.floor(selectedBooking.duration / 60)} ${Math.floor(selectedBooking.duration / 60) === 1 ? 'hour' : 'hours'}${selectedBooking.duration % 60 > 0 ? ` ${selectedBooking.duration % 60}min` : ''}`
                                            : `${selectedBooking.duration} minutes`
                                        }
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Location</label>
                                <p className="text-lg font-semibold text-gray-900 dark:text-white">{selectedBooking.location}</p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Amount</label>
                                <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                    {selectedBooking.currency} {selectedBooking.totalAmount.toFixed(2)}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Payment Method: {selectedBooking.paymentMethod}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Action Modal (Accept/Decline) */}
            {actionModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                {actionModal.type === 'accept' ? 'Accept Booking Request' : 'Decline Booking Request'}
                            </h3>
                        </div>

                        <div className="p-6 space-y-4">
                            <p className="text-gray-600 dark:text-gray-400">
                                Are you sure you want to {actionModal.type} this booking request from {actionModal.booking.client.name}?
                            </p>

                            <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                    {actionModal.type === 'accept' ? 'Welcome message (optional)' : 'Reason for declining (optional)'}
                                </label>
                                <textarea
                                    value={responseMessage}
                                    onChange={(e) => setResponseMessage(e.target.value)}
                                    placeholder={actionModal.type === 'accept' ?
                                        'Thank you for choosing our service! I look forward to working with you.' :
                                        'Sorry, but I am not available at this time...'
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                    rows={3}
                                />
                            </div>

                            <div className="flex space-x-3 pt-4">
                                <button
                                    onClick={() => setActionModal(null)}
                                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleBookingAction(actionModal.booking.id, actionModal.type.toUpperCase() as 'ACCEPT' | 'DECLINE', responseMessage)}
                                    disabled={actionLoading === actionModal.booking.id}
                                    className={`flex-1 px-4 py-2 rounded-lg text-white transition-colors ${actionModal.type === 'accept'
                                        ? 'bg-green-600 hover:bg-green-700'
                                        : 'bg-red-600 hover:bg-red-700'
                                        } disabled:opacity-50`}
                                >
                                    {actionLoading === actionModal.booking.id ? 'Processing...' :
                                        (actionModal.type === 'accept' ? 'Accept Request' : 'Decline Request')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .text-gradient-mixed {
                    background: linear-gradient(135deg, #3B82F6, #8B5CF6, #F59E0B);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    animation: gradient-x 3s ease infinite;
                    background-size: 200% 200%;
                }
                
                @keyframes gradient-x {
                    0%, 100% { background-position: left center; }
                    50% { background-position: right center; }
                }
                
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .animate-fadeInUp {
                    animation: fadeInUp 0.6s ease-out;
                }
            `}</style>
        </div>
    );
} 