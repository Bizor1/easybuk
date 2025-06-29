'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    CalendarIcon,
    ClockIcon,
    MapPinIcon,
    UserIcon,
    PhoneIcon,
    EnvelopeIcon,
    CheckCircleIcon,
    XCircleIcon,
    ChatBubbleLeftRightIcon,
    EyeIcon,
    CurrencyDollarIcon
} from '@heroicons/react/24/outline';

interface BookingData {
    id: string;
    title: string;
    description: string;
    client: {
        id: string;
        name: string;
        email: string;
        phone?: string;
        image?: string;
    };
    service?: {
        id: string;
        name: string;
        category: string;
    };
    scheduledDate: string;
    scheduledTime: string;
    duration?: number;
    location: string;
    totalAmount: number;
    currency: string;
    status: string;
    isPaid: boolean;
    paymentStatus: string;
    createdAt: string;
    canAccept: boolean;
    canCancel: boolean;
    urgentResponse: boolean;
}

interface BookingStats {
    total: number;
    pending: number;
    needsAction: number;
}

export default function BookingManagement() {
    const [bookings, setBookings] = useState<BookingData[]>([]);
    const [stats, setStats] = useState<BookingStats>({ total: 0, pending: 0, needsAction: 0 });
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [selectedBooking, setSelectedBooking] = useState<BookingData | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchBookings = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(
                `/api/provider/bookings?status=${filter}&limit=50`,
                {
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include'
                }
            );

            if (response.ok) {
                const data = await response.json();
                setBookings(data.bookings || []);
                setStats(data.stats || { total: 0, pending: 0, needsAction: 0 });
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    const handleBookingAction = async (bookingId: string, action: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED', reason?: string) => {
        try {
            setActionLoading(bookingId);

            const response = await fetch(`/api/bookings/${bookingId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    status: action,
                    reason
                })
            });

            if (response.ok) {
                // Refresh bookings
                await fetchBookings();
                setSelectedBooking(null);

                // Show success message
                const actionText = action === 'CONFIRMED' ? 'accepted' : 'cancelled';
                alert(`Booking ${actionText} successfully!`);
            } else {
                const error = await response.json();
                alert(`Failed to ${action.toLowerCase()} booking: ${error.message}`);
            }
        } catch (error) {
            console.error('Error updating booking:', error);
            alert('Failed to update booking. Please try again.');
        } finally {
            setActionLoading(null);
        }
    };

    const getStatusBadge = (status: string, urgentResponse: boolean) => {
        const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";

        switch (status) {
            case 'PENDING':
                return (
                    <span className={`${baseClasses} ${urgentResponse ? 'bg-red-100 text-red-800 animate-pulse' : 'bg-yellow-100 text-yellow-800'}`}>
                        {urgentResponse ? 'URGENT' : 'PENDING'}
                    </span>
                );
            case 'CONFIRMED':
                return <span className={`${baseClasses} bg-green-100 text-green-800`}>CONFIRMED</span>;
            case 'IN_PROGRESS':
                return <span className={`${baseClasses} bg-blue-100 text-blue-800`}>IN PROGRESS</span>;
            case 'AWAITING_CLIENT_CONFIRMATION':
                return <span className={`${baseClasses} bg-purple-100 text-purple-800 animate-pulse`}>AWAITING CONFIRMATION</span>;
            case 'COMPLETED':
                return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>COMPLETED</span>;
            case 'CANCELLED':
                return <span className={`${baseClasses} bg-red-100 text-red-800`}>CANCELLED</span>;
            default:
                return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>{status}</span>;
        }
    };

    const openMessaging = (bookingId: string) => {
        // Open messaging modal or navigate to messages
        window.open(`/provider/messages?bookingId=${bookingId}`, '_blank');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center">
                        <CalendarIcon className="h-8 w-8 text-blue-600" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center">
                        <ClockIcon className="h-8 w-8 text-yellow-600" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Pending</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center">
                        <CheckCircleIcon className="h-8 w-8 text-green-600" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Needs Action</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.needsAction}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="bg-white rounded-lg shadow-md">
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6">
                        {[
                            { key: 'all', label: 'All Bookings' },
                            { key: 'pending', label: 'Pending' },
                            { key: 'confirmed', label: 'Confirmed' },
                            { key: 'completed', label: 'Completed' }
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setFilter(tab.key)}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${filter === tab.key
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Bookings List */}
                <div className="divide-y divide-gray-200">
                    {bookings.length === 0 ? (
                        <div className="p-12 text-center">
                            <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No bookings found</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {filter === 'pending' ? 'No pending bookings at the moment.' : 'Start promoting your services to get bookings.'}
                            </p>
                        </div>
                    ) : (
                        bookings.map((booking) => (
                            <div key={booking.id} className="p-6 hover:bg-gray-50">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-3">
                                            <h3 className="text-lg font-medium text-gray-900">{booking.title}</h3>
                                            {getStatusBadge(booking.status, booking.urgentResponse)}
                                            {booking.isPaid && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    <CurrencyDollarIcon className="h-3 w-3 mr-1" />
                                                    PAID
                                                </span>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                                            <div className="flex items-center">
                                                <UserIcon className="h-4 w-4 mr-2" />
                                                <span>{booking.client.name}</span>
                                            </div>

                                            <div className="flex items-center">
                                                <CalendarIcon className="h-4 w-4 mr-2" />
                                                <span>{new Date(booking.scheduledDate).toLocaleDateString()}</span>
                                            </div>

                                            <div className="flex items-center">
                                                <ClockIcon className="h-4 w-4 mr-2" />
                                                <span>{booking.scheduledTime}</span>
                                            </div>

                                            <div className="flex items-center">
                                                <MapPinIcon className="h-4 w-4 mr-2" />
                                                <span className="truncate">{booking.location}</span>
                                            </div>
                                        </div>

                                        <div className="mt-3 flex items-center justify-between">
                                            <div className="text-lg font-semibold text-gray-900">
                                                {booking.currency} {booking.totalAmount.toFixed(2)}
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => setSelectedBooking(booking)}
                                                    className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                                >
                                                    <EyeIcon className="h-4 w-4 mr-1" />
                                                    View Details
                                                </button>

                                                <button
                                                    onClick={() => openMessaging(booking.id)}
                                                    className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                                >
                                                    <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
                                                    Message
                                                </button>

                                                {booking.canAccept && (
                                                    <button
                                                        onClick={() => handleBookingAction(booking.id, 'CONFIRMED')}
                                                        disabled={actionLoading === booking.id}
                                                        className="inline-flex items-center px-3 py-1 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                                                    >
                                                        <CheckCircleIcon className="h-4 w-4 mr-1" />
                                                        {actionLoading === booking.id ? 'Processing...' : 'Accept'}
                                                    </button>
                                                )}

                                                {booking.status === 'IN_PROGRESS' && (
                                                    <button
                                                        onClick={() => handleBookingAction(booking.id, 'COMPLETED')}
                                                        disabled={actionLoading === booking.id}
                                                        className="inline-flex items-center px-3 py-1 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                                                    >
                                                        <CheckCircleIcon className="h-4 w-4 mr-1" />
                                                        {actionLoading === booking.id ? 'Processing...' : 'Mark Complete'}
                                                    </button>
                                                )}

                                                {booking.canCancel && (
                                                    <button
                                                        onClick={() => {
                                                            const reason = prompt('Reason for cancellation (optional):');
                                                            handleBookingAction(booking.id, 'CANCELLED', reason || undefined);
                                                        }}
                                                        disabled={actionLoading === booking.id}
                                                        className="inline-flex items-center px-3 py-1 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                                                    >
                                                        <XCircleIcon className="h-4 w-4 mr-1" />
                                                        Cancel
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Booking Details Modal */}
            {selectedBooking && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-screen overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Booking Details</h3>
                            <button
                                onClick={() => setSelectedBooking(null)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <XCircleIcon className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h4 className="font-medium text-gray-900">{selectedBooking.title}</h4>
                                <p className="text-gray-600">{selectedBooking.description}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Client</label>
                                    <div className="mt-1">
                                        <p className="text-sm text-gray-900">{selectedBooking.client.name}</p>
                                        <p className="text-sm text-gray-500">{selectedBooking.client.email}</p>
                                        {selectedBooking.client.phone && (
                                            <p className="text-sm text-gray-500">{selectedBooking.client.phone}</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Schedule</label>
                                    <div className="mt-1">
                                        <p className="text-sm text-gray-900">
                                            {new Date(selectedBooking.scheduledDate).toLocaleDateString()}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {selectedBooking.scheduledTime}
                                            {selectedBooking.duration && ` (${selectedBooking.duration >= 60
                                                ? `${Math.floor(selectedBooking.duration / 60)} ${Math.floor(selectedBooking.duration / 60) === 1 ? 'hour' : 'hours'}${selectedBooking.duration % 60 > 0 ? ` ${selectedBooking.duration % 60}min` : ''}`
                                                : `${selectedBooking.duration} minutes`
                                                })`}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Location</label>
                                <p className="mt-1 text-sm text-gray-900">{selectedBooking.location}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Payment</label>
                                <div className="mt-1">
                                    <p className="text-sm text-gray-900">
                                        {selectedBooking.currency} {selectedBooking.totalAmount.toFixed(2)}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Status: {selectedBooking.isPaid ? 'Paid' : 'Pending'} ({selectedBooking.paymentStatus})
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                onClick={() => setSelectedBooking(null)}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                            >
                                Close
                            </button>

                            <button
                                onClick={() => openMessaging(selectedBooking.id)}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                                <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
                                Send Message
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 