'use client';

import { useState, useEffect } from 'react';
import {
    CalendarIcon,
    CreditCardIcon,
    EyeIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    MagnifyingGlassIcon,
    FunnelIcon
} from '@heroicons/react/24/outline';

interface Booking {
    id: string;
    client: {
        name: string;
        email: string;
        avatar?: string;
    };
    provider: {
        name: string;
        email: string;
        avatar?: string;
    };
    service: {
        name: string;
        category: string;
    };
    date: string;
    time: string;
    status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    amount: number;
    paymentStatus: 'PENDING' | 'PAID' | 'REFUNDED' | 'FAILED';
    location: string;
    createdAt: string;
}

const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-blue-100 text-blue-800',
    IN_PROGRESS: 'bg-purple-100 text-purple-800',
    COMPLETED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800'
};

const paymentStatusColors = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    PAID: 'bg-green-100 text-green-800',
    REFUNDED: 'bg-gray-100 text-gray-800',
    FAILED: 'bg-red-100 text-red-800'
};

export default function AdminBookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [paymentFilter, setPaymentFilter] = useState('ALL');

    // Mock data for demonstration
    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            setBookings([
                {
                    id: 'BK001',
                    client: {
                        name: 'Alice Johnson',
                        email: 'alice@example.com'
                    },
                    provider: {
                        name: 'Bob Smith',
                        email: 'bob@example.com'
                    },
                    service: {
                        name: 'House Cleaning',
                        category: 'Home Services'
                    },
                    date: '2024-01-15',
                    time: '10:00 AM',
                    status: 'CONFIRMED',
                    amount: 150,
                    paymentStatus: 'PAID',
                    location: '123 Main St, City',
                    createdAt: '2024-01-10T08:00:00Z'
                },
                {
                    id: 'BK002',
                    client: {
                        name: 'Charlie Brown',
                        email: 'charlie@example.com'
                    },
                    provider: {
                        name: 'Diana Wilson',
                        email: 'diana@example.com'
                    },
                    service: {
                        name: 'Plumbing Repair',
                        category: 'Home Maintenance'
                    },
                    date: '2024-01-16',
                    time: '2:00 PM',
                    status: 'PENDING',
                    amount: 200,
                    paymentStatus: 'PENDING',
                    location: '456 Oak Ave, City',
                    createdAt: '2024-01-12T14:30:00Z'
                },
                {
                    id: 'BK003',
                    client: {
                        name: 'Eva Martinez',
                        email: 'eva@example.com'
                    },
                    provider: {
                        name: 'Frank Davis',
                        email: 'frank@example.com'
                    },
                    service: {
                        name: 'Garden Maintenance',
                        category: 'Outdoor Services'
                    },
                    date: '2024-01-14',
                    time: '9:00 AM',
                    status: 'COMPLETED',
                    amount: 120,
                    paymentStatus: 'PAID',
                    location: '789 Pine St, City',
                    createdAt: '2024-01-08T10:15:00Z'
                }
            ]);
            setLoading(false);
        }, 1000);
    }, []);

    const filteredBookings = bookings.filter(booking => {
        const matchesSearch =
            booking.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.id.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'ALL' || booking.status === statusFilter;
        const matchesPayment = paymentFilter === 'ALL' || booking.paymentStatus === paymentFilter;

        return matchesSearch && matchesStatus && matchesPayment;
    });

    const handleViewDetails = (bookingId: string) => {
        // Navigate to booking details or open modal
        console.log('View booking details:', bookingId);
    };

    const handleUpdateStatus = (bookingId: string, newStatus: string) => {
        setBookings(prev => prev.map(booking =>
            booking.id === bookingId
                ? { ...booking, status: newStatus as any }
                : booking
        ));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="border-b border-gray-200 pb-4">
                <h1 className="text-2xl font-bold text-gray-900">Booking Management</h1>
                <p className="mt-1 text-sm text-gray-600">
                    Monitor and manage all platform bookings
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center">
                        <CalendarIcon className="h-8 w-8 text-blue-600" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                            <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center">
                        <CheckCircleIcon className="h-8 w-8 text-green-600" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Completed</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {bookings.filter(b => b.status === 'COMPLETED').length}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center">
                        <ClockIcon className="h-8 w-8 text-yellow-600" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Pending</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {bookings.filter(b => b.status === 'PENDING').length}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center">
                        <CreditCardIcon className="h-8 w-8 text-purple-600" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Revenue</p>
                            <p className="text-2xl font-bold text-gray-900">
                                ${bookings.filter(b => b.paymentStatus === 'PAID').reduce((sum, b) => sum + b.amount, 0)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-lg shadow">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Search Bookings
                        </label>
                        <div className="relative">
                            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by client, provider, service, or ID..."
                                className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status Filter
                        </label>
                        <select
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="ALL">All Statuses</option>
                            <option value="PENDING">Pending</option>
                            <option value="CONFIRMED">Confirmed</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Payment Filter
                        </label>
                        <select
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                            value={paymentFilter}
                            onChange={(e) => setPaymentFilter(e.target.value)}
                        >
                            <option value="ALL">All Payments</option>
                            <option value="PENDING">Pending</option>
                            <option value="PAID">Paid</option>
                            <option value="REFUNDED">Refunded</option>
                            <option value="FAILED">Failed</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Bookings Table */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Booking ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Client
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Provider
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Service
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date & Time
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Payment
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Amount
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredBookings.map((booking) => (
                                <tr key={booking.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {booking.id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {booking.client.name}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {booking.client.email}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {booking.provider.name}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {booking.provider.email}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {booking.service.name}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {booking.service.category}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {new Date(booking.date).toLocaleDateString()}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {booking.time}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[booking.status]}`}>
                                            {booking.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${paymentStatusColors[booking.paymentStatus]}`}>
                                            {booking.paymentStatus}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        ${booking.amount}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => handleViewDetails(booking.id)}
                                            className="text-blue-600 hover:text-blue-900 mr-4"
                                        >
                                            <EyeIcon className="h-5 w-5" />
                                        </button>
                                        {booking.status === 'PENDING' && (
                                            <>
                                                <button
                                                    onClick={() => handleUpdateStatus(booking.id, 'CONFIRMED')}
                                                    className="text-green-600 hover:text-green-900 mr-2"
                                                    title="Confirm Booking"
                                                >
                                                    <CheckCircleIcon className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateStatus(booking.id, 'CANCELLED')}
                                                    className="text-red-600 hover:text-red-900"
                                                    title="Cancel Booking"
                                                >
                                                    <XCircleIcon className="h-5 w-5" />
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredBookings.length === 0 && (
                    <div className="text-center py-12">
                        <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No bookings found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {searchTerm || statusFilter !== 'ALL' || paymentFilter !== 'ALL'
                                ? 'Try adjusting your filters'
                                : 'No bookings have been created yet'
                            }
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}