'use client'

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
    CalendarIcon,
    CreditCardIcon,
    HeartIcon,
    UserIcon,
    ClockIcon,
    CheckCircleIcon,
    XCircleIcon,
    StarIcon,
    MapPinIcon,
    PhoneIcon,
    ChatBubbleLeftRightIcon,
    EyeIcon,
    PlusIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import {
    HeartIcon as HeartSolidIcon,
    StarIcon as StarSolidIcon
} from '@heroicons/react/24/solid';
import Link from 'next/link';
import Image from 'next/image';
import NotificationBell from '@/components/NotificationBell';
import ReviewModal from '@/components/ReviewModal';

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
    provider: {
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
    canPay: boolean;
    needsAction: boolean;
}

interface SavedProvider {
    id: string;
    name: string;
    image: string;
    profession: string;
    rating: number;
    reviewCount: number;
    priceRange: string;
    location: string;
    isAvailable: boolean;
    responseTime: string;
}

interface PaymentHistory {
    id: string;
    date: string;
    providerName: string;
    serviceName: string;
    amount: number;
    status: 'completed' | 'pending' | 'failed' | 'refunded';
    paymentMethod: string;
}

export default function ClientDashboard() {
    const { user, logout, addRole, switchRole } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [savedProviders, setSavedProviders] = useState<SavedProvider[]>([]);
    const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
    const [loading, setLoading] = useState(true);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [paymentLoading, setPaymentLoading] = useState<string | null>(null);
    const [reviewModal, setReviewModal] = useState<{
        isOpen: boolean;
        booking: Booking | null;
        action: 'ACCEPT' | 'DISPUTE';
    }>({
        isOpen: false,
        booking: null,
        action: 'ACCEPT'
    });
    const [unreadMessages, setUnreadMessages] = useState<{
        totalUnread: number;
        unreadByBooking: Record<string, number>;
    }>({
        totalUnread: 0,
        unreadByBooking: {}
    });

    // Load real data from API
    useEffect(() => {
        console.log('🚀 ClientDashboard useEffect triggered - about to fetch bookings');
        fetchBookings();
        fetchUnreadMessages();

        // Set up periodic refresh for unread messages
        const interval = setInterval(() => {
            fetchUnreadMessages();
        }, 30000); // Refresh every 30 seconds

        return () => clearInterval(interval);
    }, []);

    const fetchUnreadMessages = async () => {
        try {
            const response = await fetch('/api/messages/unread-count', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setUnreadMessages({
                        totalUnread: data.totalUnread,
                        unreadByBooking: data.unreadByBooking
                    });
                }
            }
        } catch (error) {
            console.error('Error fetching unread messages:', error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'upcoming': return 'text-blue-600 bg-blue-100';
            case 'completed': return 'text-green-600 bg-green-100';
            case 'cancelled': return 'text-red-600 bg-red-100';
            case 'in-progress': return 'text-orange-600 bg-orange-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getPaymentStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'text-green-600 bg-green-100';
            case 'pending': return 'text-orange-600 bg-orange-100';
            case 'failed': return 'text-red-600 bg-red-100';
            case 'refunded': return 'text-blue-600 bg-blue-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const upcomingBookings = bookings.filter(b => ['PENDING', 'CONFIRMED'].includes(b.status));
    const totalSpent = bookings.filter(b => b.isPaid).reduce((sum, booking) => sum + booking.totalAmount, 0);
    const completedBookings = bookings.filter(b => b.status === 'COMPLETED').length;
    const canAddProviderRole = user && !user.roles.includes('PROVIDER');

    // Check if user can add provider role (client-only user)
    const handleAddProviderRole = async () => {
        if (canAddProviderRole) {
            const result = await addRole('PROVIDER');
            if (result.success) {
                // Force refresh user data and redirect
                window.location.href = '/provider/dashboard';
            }
        }
    };

    const fetchBookings = async () => {
        try {
            console.log('🔄 Fetching client bookings...');
            setLoading(true);
            const response = await fetch('/api/client/bookings', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // This sends cookies including the JWT token
            });

            console.log('📡 Client Bookings API response status:', response.status);
            console.log('📡 Client Bookings API response ok:', response.ok);

            if (response.ok) {
                const data = await response.json();
                console.log('📦 Client Bookings API response data:', data);

                // The new API returns { success: true, bookings: [...] }
                const bookings = data.bookings || [];
                console.log('📋 Number of bookings found:', bookings.length);
                setBookings(bookings);

                if (bookings.length > 0) {
                    console.log('✅ Client bookings loaded successfully:', bookings);
                } else {
                    console.log('⚠️ No bookings found in response');
                }
            } else {
                const errorData = await response.text();
                console.error('❌ Failed to fetch client bookings', response.status, response.statusText);
                console.error('❌ Error response:', errorData);
            }
        } catch (error) {
            console.error('🚨 Error fetching client bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const processPayment = async (bookingId: string) => {
        try {
            setPaymentLoading(bookingId);

            const response = await fetch(`/api/bookings/${bookingId}/payment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // This sends cookies including the JWT token
                body: JSON.stringify({
                    paymentMethod: 'MOBILE_MONEY'
                }),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // Refresh bookings to show updated status
                await fetchBookings();
                alert('Payment processed successfully! Your booking is now confirmed.');
            } else {
                alert(`Payment failed: ${result.error}`);
            }
        } catch (error) {
            console.error('Error processing payment:', error);
            alert('Error processing payment. Please try again.');
        } finally {
            setPaymentLoading(null);
        }
    };

    const handleClientConfirmation = async (bookingId: string, action: 'ACCEPT' | 'DISPUTE') => {
        const booking = bookings.find(b => b.id === bookingId);
        if (!booking) return;

        if (action === 'ACCEPT') {
            // Open review modal for acceptance
            setReviewModal({
                isOpen: true,
                booking: booking,
                action: 'ACCEPT'
            });
        } else {
            // For disputes, ask for reason directly
            const reason = prompt('Please explain why you are disputing this service completion:') || '';
            if (!reason.trim()) {
                alert('Please provide a reason for the dispute.');
                return;
            }
            await submitConfirmation(bookingId, action, 0, reason);
        }
    };

    const submitConfirmation = async (bookingId: string, action: 'ACCEPT' | 'DISPUTE', rating: number = 0, review: string = '') => {
        try {
            setPaymentLoading(bookingId);

            const response = await fetch(`/api/bookings/${bookingId}/confirm`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    action,
                    reason: action === 'DISPUTE' ? review : undefined,
                    rating: rating > 0 ? rating : undefined,
                    review: action === 'ACCEPT' && review.trim() ? review : undefined
                })
            });

            if (response.ok) {
                const result = await response.json();
                if (action === 'ACCEPT') {
                    if (rating > 0 || review.trim()) {
                        alert('Service completion confirmed with your review! Payment will be released to the provider.');
                    } else {
                        alert('Service completion confirmed! Payment will be released to the provider.');
                    }
                } else {
                    alert('Dispute has been created. Our team will review and respond within 24-48 hours.');
                }

                // Close modal and refresh bookings
                setReviewModal({ isOpen: false, booking: null, action: 'ACCEPT' });
                await fetchBookings();
            } else {
                const error = await response.json();
                alert(`Failed to ${action.toLowerCase()} completion: ${error.message}`);
            }
        } catch (error) {
            console.error('Confirmation error:', error);
            alert('Failed to process confirmation. Please try again.');
        } finally {
            setPaymentLoading(null);
        }
    };

    const getStatusConfig = (status: Booking['status']) => {
        const configs = {
            PENDING: {
                gradient: 'from-yellow-100/90 to-orange-100/90 dark:from-yellow-900/30 dark:to-orange-900/30',
                textColor: 'text-yellow-800 dark:text-yellow-400',
                bgGradient: 'from-yellow-500 to-orange-500',
                emoji: '⏳',
                message: 'Waiting for provider response'
            },
            CONFIRMED: {
                gradient: 'from-blue-100/90 to-cyan-100/90 dark:from-blue-900/30 dark:to-cyan-900/30',
                textColor: 'text-blue-800 dark:text-blue-400',
                bgGradient: 'from-blue-500 to-cyan-500',
                emoji: '✅',
                message: 'Accepted by provider - Complete payment'
            },
            IN_PROGRESS: {
                gradient: 'from-purple-100/90 to-pink-100/90 dark:from-purple-900/30 dark:to-pink-900/30',
                textColor: 'text-purple-800 dark:text-purple-400',
                bgGradient: 'from-purple-500 to-pink-500',
                emoji: '🔄',
                message: 'Service in progress'
            },
            ACTIVE: {
                gradient: 'from-purple-100/90 to-pink-100/90 dark:from-purple-900/30 dark:to-pink-900/30',
                textColor: 'text-purple-800 dark:text-purple-400',
                bgGradient: 'from-purple-500 to-pink-500',
                emoji: '🔄',
                message: 'Service in progress'
            },
            AWAITING_CLIENT_CONFIRMATION: {
                gradient: 'from-purple-100/90 to-indigo-100/90 dark:from-purple-900/30 dark:to-indigo-900/30',
                textColor: 'text-purple-800 dark:text-purple-400',
                bgGradient: 'from-purple-500 to-indigo-500',
                emoji: '⏰',
                message: 'Service completed - Please confirm or dispute'
            },
            COMPLETED: {
                gradient: 'from-green-100/90 to-emerald-100/90 dark:from-green-900/30 dark:to-emerald-900/30',
                textColor: 'text-green-800 dark:text-green-400',
                bgGradient: 'from-green-500 to-emerald-500',
                emoji: '🎉',
                message: 'Service completed'
            },
            CANCELLED: {
                gradient: 'from-red-100/90 to-red-200/90 dark:from-red-900/30 dark:to-red-800/30',
                textColor: 'text-red-800 dark:text-red-400',
                bgGradient: 'from-red-500 to-red-600',
                emoji: '❌',
                message: 'Request declined by provider'
            }
        };
        return configs[status];
    };

    const getActionButton = (booking: Booking) => {
        if (booking.status === 'CONFIRMED' && !booking.isPaid) {
            return (
                <button
                    onClick={() => processPayment(booking.id)}
                    disabled={paymentLoading === booking.id}
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-105 text-sm font-medium flex items-center space-x-2 disabled:opacity-50"
                >
                    <CreditCardIcon className="w-4 h-4" />
                    <span>{paymentLoading === booking.id ? 'Processing...' : 'Complete Payment'}</span>
                </button>
            );
        }

        if (booking.status === 'AWAITING_CLIENT_CONFIRMATION') {
            return (
                <div className="flex space-x-2">
                    <button
                        onClick={() => handleClientConfirmation(booking.id, 'ACCEPT')}
                        disabled={paymentLoading === booking.id}
                        className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-105 text-sm font-medium flex items-center space-x-2 disabled:opacity-50"
                    >
                        <CheckCircleIcon className="w-4 h-4" />
                        <span>{paymentLoading === booking.id ? 'Processing...' : 'Confirm Complete'}</span>
                    </button>
                    <button
                        onClick={() => handleClientConfirmation(booking.id, 'DISPUTE')}
                        disabled={paymentLoading === booking.id}
                        className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all transform hover:scale-105 text-sm font-medium flex items-center space-x-2 disabled:opacity-50"
                    >
                        <XCircleIcon className="w-4 h-4" />
                        <span>Dispute</span>
                    </button>
                </div>
            );
        }
        return null;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 dark:from-slate-900 dark:via-gray-900 dark:to-slate-800 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">Loading your bookings...</p>
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
                                <span className="text-gray-900 dark:text-white">My Bookings</span>
                                <span className="block text-gradient-mixed animate-gradient-x">Dashboard 📊</span>
                            </h1>
                            <p className="text-lg text-gray-600 dark:text-gray-400">
                                Track your service requests and appointments
                            </p>
                        </div>
                        <div className="mt-4 md:mt-0 flex items-center space-x-4">
                            <NotificationBell userType="CLIENT" />
                            <Link
                                href="/explore"
                                className="inline-flex items-center bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                            >
                                + Book New Service
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <ClockIcon className="h-8 w-8 text-yellow-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {bookings.filter(b => b.status === 'PENDING').length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <CheckCircleIcon className="h-8 w-8 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Confirmed</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {bookings.filter(b => b.status === 'CONFIRMED').length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="h-8 w-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm">🔄</div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {bookings.filter(b => b.status === 'IN_PROGRESS' || b.status === 'ACTIVE').length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="h-8 w-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm">🎉</div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Completed</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {bookings.filter(b => b.status === 'COMPLETED').length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bookings List */}
                {bookings.length > 0 ? (
                    <div className="space-y-4">
                        {bookings.map((booking, index) => {
                            const statusConfig = getStatusConfig(booking.status);
                            const actionButton = getActionButton(booking);

                            return (
                                <div
                                    key={booking.id}
                                    className={`relative group animate-fadeInUp ${booking.needsAction ? 'ring-2 ring-blue-500/50' : ''}`}
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <div className={`absolute -inset-1 bg-gradient-to-r ${statusConfig.bgGradient} rounded-xl opacity-20 group-hover:opacity-30 blur transition-opacity`}></div>
                                    <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
                                        {booking.needsAction && (
                                            <div className="absolute top-2 right-2 flex items-center space-x-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full text-xs">
                                                <ExclamationTriangleIcon className="w-3 h-3" />
                                                <span>Action Required</span>
                                            </div>
                                        )}

                                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                                            <div className="flex items-start space-x-4 flex-1">
                                                {/* Provider Avatar */}
                                                <div className="relative group/avatar">
                                                    <div className="w-15 h-15 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-xl font-bold ring-4 ring-white dark:ring-gray-700 group-hover/avatar:ring-blue-500/30 transition-all">
                                                        {booking.provider.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full opacity-0 group-hover/avatar:opacity-20 blur transition-opacity"></div>
                                                </div>

                                                {/* Booking Details */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div>
                                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                                {booking.title}
                                                            </h3>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">Provider: {booking.provider.name}</p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                                                Requested: {new Date(booking.createdAt).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                        <span className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${statusConfig.gradient} ${statusConfig.textColor} backdrop-blur-sm border border-white/20`}>
                                                            <span>{statusConfig.emoji}</span>
                                                            <span>{booking.status.charAt(0).toUpperCase() + booking.status.slice(1).toLowerCase()}</span>
                                                        </span>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                                        <div>
                                                            <p className="text-gray-500 dark:text-gray-400">Scheduled</p>
                                                            <p className="font-medium text-gray-900 dark:text-white">
                                                                {new Date(booking.scheduledDate).toLocaleDateString()} at {booking.scheduledTime}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-500 dark:text-gray-400">Location</p>
                                                            <p className="font-medium text-gray-900 dark:text-white truncate">{booking.location}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-500 dark:text-gray-400">Amount</p>
                                                            <p className="font-bold text-green-600 dark:text-green-400">
                                                                {booking.currency} {booking.totalAmount.toFixed(2)}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="mt-3 flex items-center justify-between">
                                                        <div className="flex items-center space-x-4">
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                {statusConfig.message}
                                                            </p>
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

                                                {actionButton}

                                                <Link
                                                    href={`/client/messages?provider=${booking.provider.name}`}
                                                    className="relative px-4 py-2 bg-gradient-to-r from-purple-100/80 to-pink-100/80 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-600 dark:text-purple-400 rounded-lg hover:from-purple-200/80 hover:to-pink-200/80 transition-all transform hover:scale-105 text-sm font-medium flex items-center space-x-1"
                                                >
                                                    <ChatBubbleLeftRightIcon className="w-4 h-4" />
                                                    <span>Message</span>
                                                    {unreadMessages.unreadByBooking[booking.id] > 0 && (
                                                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                                                            {unreadMessages.unreadByBooking[booking.id] > 9 ? '9+' : unreadMessages.unreadByBooking[booking.id]}
                                                        </span>
                                                    )}
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
                            <div className="text-6xl mb-4">📊</div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                No bookings yet
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                Start by exploring our services and making your first booking request.
                            </p>
                            <Link
                                href="/explore"
                                className="inline-flex items-center bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
                            >
                                Explore Services
                            </Link>
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
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Booking Details</h3>
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
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Service</label>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{selectedBooking.title}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedBooking.description}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{selectedBooking.status}</p>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Provider</label>
                                <p className="text-lg font-semibold text-gray-900 dark:text-white">{selectedBooking.provider.name}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{selectedBooking.provider.email}</p>
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
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Payment</label>
                                <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                    {selectedBooking.currency} {selectedBooking.totalAmount.toFixed(2)}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Status: {selectedBooking.isPaid ? 'Paid' : 'Pending Payment'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Review Modal */}
            <ReviewModal
                isOpen={reviewModal.isOpen}
                onClose={() => setReviewModal({ isOpen: false, booking: null, action: 'ACCEPT' })}
                onSubmit={(rating, review) => {
                    if (reviewModal.booking) {
                        submitConfirmation(reviewModal.booking.id, reviewModal.action, rating, review);
                    }
                }}
                providerName={reviewModal.booking?.provider?.name || 'Provider'}
                serviceTitle={reviewModal.booking?.title || 'Service'}
                isSubmitting={paymentLoading === reviewModal.booking?.id}
            />

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