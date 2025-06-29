'use client'

import React, { useState, useEffect } from 'react';
import MessagingInterface from '@/components/messaging/MessagingInterface';

interface Booking {
    id: string;
    provider: {
        id: string;
        name: string;
        email: string;
        profilePicture?: string;
    };
    service: {
        title: string;
    } | null;
    status: string;
    bookingType: string;
    scheduledDate: string;
    scheduledTime: string;
    createdAt: string;
}

export default function ClientMessagesPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch client's bookings to show available conversations
    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const response = await fetch('/api/client/bookings');
                if (response.ok) {
                    const data = await response.json();
                    setBookings(data.bookings || []);

                    // Auto-select the first booking if available
                    if (data.bookings && data.bookings.length > 0) {
                        setSelectedBookingId(data.bookings[0].id);
                    }
                }
            } catch (error) {
                console.error('Error fetching bookings:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 dark:from-slate-900 dark:via-gray-900 dark:to-slate-800 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">Loading conversations...</p>
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

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-screen flex flex-col">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">
                        <span className="text-gray-900 dark:text-white">Messages</span>
                        <span className="block text-gradient-mixed animate-gradient-x">Communication 💬</span>
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        Chat with your service providers about your bookings
                    </p>
                </div>

                {/* Messages Content */}
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
                    {/* Conversations List */}
                    <div className="lg:col-span-1">
                        <div className="relative group h-full">
                            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl opacity-20 group-hover:opacity-30 blur transition-opacity"></div>
                            <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 h-full flex flex-col">
                                <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
                                    <h3 className="font-semibold text-gray-900 dark:text-white">Your Bookings</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Select a booking to chat</p>
                                </div>

                                <div className="flex-1 overflow-y-auto">
                                    {bookings.length > 0 ? (
                                        bookings.map((booking) => (
                                            <div
                                                key={booking.id}
                                                onClick={() => setSelectedBookingId(booking.id)}
                                                className={`p-4 border-b border-gray-200/50 dark:border-gray-700/50 cursor-pointer transition-all duration-300 hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-pink-50/50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20 ${selectedBookingId === booking.id
                                                    ? 'bg-gradient-to-r from-purple-100/80 to-pink-100/80 dark:from-purple-900/40 dark:to-pink-900/40'
                                                    : ''
                                                    }`}
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-semibold">
                                                        {booking.provider.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-gray-900 dark:text-white truncate">
                                                            {booking.provider.name}
                                                        </p>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                                            {booking.service?.title || 'General Booking'}
                                                        </p>
                                                        <div className="flex items-center mt-1">
                                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${booking.status === 'CONFIRMED'
                                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                                                : booking.status === 'PENDING'
                                                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                                                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                                                                }`}>
                                                                {booking.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-8 text-center">
                                            <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                </svg>
                                            </div>
                                            <p className="text-gray-600 dark:text-gray-400">No bookings yet</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Messages will appear when you book services</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Messaging Interface */}
                    <div className="lg:col-span-3">
                        {selectedBookingId ? (
                            (() => {
                                const selectedBooking = bookings.find(b => b.id === selectedBookingId);
                                return selectedBooking ? (
                                    <MessagingInterface
                                        bookingId={selectedBookingId}
                                        otherParticipant={{
                                            name: selectedBooking.provider.name,
                                            image: selectedBooking.provider.profilePicture,
                                            type: 'PROVIDER' as const,
                                            isOnline: false // We don't have online status yet
                                        }}
                                        booking={{
                                            bookingType: selectedBooking.bookingType,
                                            status: selectedBooking.status,
                                            scheduledDate: selectedBooking.scheduledDate,
                                            scheduledTime: selectedBooking.scheduledTime
                                        }}
                                    />
                                ) : null;
                            })()
                        ) : (
                            <div className="relative group h-full">
                                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl opacity-20 blur transition-opacity"></div>
                                <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 h-full flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                            Select a Conversation
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            Choose a booking from the left to start messaging with your provider
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
} 