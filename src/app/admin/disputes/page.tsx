'use client';

import { useState } from 'react';
import {
    ExclamationTriangleIcon,
    ClockIcon,
    CheckCircleIcon,
    XMarkIcon,
    ChatBubbleLeftRightIcon,
    DocumentTextIcon,
    UserIcon,
    CurrencyDollarIcon
} from '@heroicons/react/24/outline';

interface Dispute {
    id: string;
    bookingId: string;
    clientName: string;
    providerName: string;
    type: 'PAYMENT' | 'SERVICE_QUALITY' | 'NO_SHOW' | 'CANCELLATION' | 'OTHER';
    status: 'OPEN' | 'IN_REVIEW' | 'RESOLVED' | 'ESCALATED';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    amount: number;
    description: string;
    createdAt: string;
    lastUpdate: string;
    assignedAdmin?: string;
}

export default function DisputeManagement() {
    const [disputes, setDisputes] = useState<Dispute[]>([
        {
            id: 'DP-001',
            bookingId: 'BK-2024-001',
            clientName: 'Sarah Johnson',
            providerName: 'Mike\'s Cleaning Service',
            type: 'SERVICE_QUALITY',
            status: 'OPEN',
            priority: 'HIGH',
            amount: 150,
            description: 'Service was not completed as agreed. House was left partially cleaned.',
            createdAt: '2024-01-15T10:30:00Z',
            lastUpdate: '2024-01-15T10:30:00Z'
        },
        {
            id: 'DP-002',
            bookingId: 'BK-2024-045',
            clientName: 'David Chen',
            providerName: 'Expert Plumbing Co.',
            type: 'PAYMENT',
            status: 'IN_REVIEW',
            priority: 'MEDIUM',
            amount: 280,
            description: 'Dispute over additional charges not mentioned in original quote.',
            createdAt: '2024-01-14T14:20:00Z',
            lastUpdate: '2024-01-15T09:15:00Z',
            assignedAdmin: 'Admin User'
        },
        {
            id: 'DP-003',
            bookingId: 'BK-2024-023',
            clientName: 'Emma Wilson',
            providerName: 'TechFix Solutions',
            type: 'NO_SHOW',
            status: 'RESOLVED',
            priority: 'LOW',
            amount: 75,
            description: 'Provider did not show up for scheduled appointment.',
            createdAt: '2024-01-12T11:45:00Z',
            lastUpdate: '2024-01-13T16:30:00Z',
            assignedAdmin: 'Admin User'
        }
    ]);

    const [filter, setFilter] = useState('all');
    const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'OPEN': return 'bg-red-100 text-red-800';
            case 'IN_REVIEW': return 'bg-yellow-100 text-yellow-800';
            case 'RESOLVED': return 'bg-green-100 text-green-800';
            case 'ESCALATED': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'URGENT': return 'bg-red-500';
            case 'HIGH': return 'bg-orange-500';
            case 'MEDIUM': return 'bg-yellow-500';
            case 'LOW': return 'bg-green-500';
            default: return 'bg-gray-500';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'PAYMENT': return <CurrencyDollarIcon className="h-5 w-5" />;
            case 'SERVICE_QUALITY': return <ExclamationTriangleIcon className="h-5 w-5" />;
            case 'NO_SHOW': return <ClockIcon className="h-5 w-5" />;
            case 'CANCELLATION': return <XMarkIcon className="h-5 w-5" />;
            default: return <DocumentTextIcon className="h-5 w-5" />;
        }
    };

    const handleResolveDispute = (disputeId: string, resolution: string) => {
        setDisputes(prev => prev.map(dispute =>
            dispute.id === disputeId
                ? {
                    ...dispute,
                    status: 'RESOLVED',
                    lastUpdate: new Date().toISOString(),
                    assignedAdmin: 'Admin User'
                }
                : dispute
        ));
        setSelectedDispute(null);
    };

    const handleAssignToSelf = (disputeId: string) => {
        setDisputes(prev => prev.map(dispute =>
            dispute.id === disputeId
                ? {
                    ...dispute,
                    status: 'IN_REVIEW',
                    assignedAdmin: 'Admin User',
                    lastUpdate: new Date().toISOString()
                }
                : dispute
        ));
    };

    const filteredDisputes = disputes.filter(dispute => {
        if (filter === 'all') return true;
        return dispute.status === filter.toUpperCase();
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="border-b border-gray-200 pb-4">
                <h1 className="text-3xl font-bold text-gray-900">Dispute Management</h1>
                <p className="mt-1 text-sm text-gray-600">
                    Resolve conflicts between clients and providers to maintain platform trust
                </p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                    <div className="flex items-center">
                        <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
                        <div className="ml-4">
                            <h3 className="text-2xl font-bold text-gray-900">
                                {disputes.filter(d => d.status === 'OPEN').length}
                            </h3>
                            <p className="text-sm text-gray-600">Open Disputes</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                    <div className="flex items-center">
                        <ClockIcon className="h-8 w-8 text-yellow-600" />
                        <div className="ml-4">
                            <h3 className="text-2xl font-bold text-gray-900">
                                {disputes.filter(d => d.status === 'IN_REVIEW').length}
                            </h3>
                            <p className="text-sm text-gray-600">In Review</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                    <div className="flex items-center">
                        <CheckCircleIcon className="h-8 w-8 text-green-600" />
                        <div className="ml-4">
                            <h3 className="text-2xl font-bold text-gray-900">
                                {disputes.filter(d => d.status === 'RESOLVED').length}
                            </h3>
                            <p className="text-sm text-gray-600">Resolved</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                    <div className="flex items-center">
                        <CurrencyDollarIcon className="h-8 w-8 text-blue-600" />
                        <div className="ml-4">
                            <h3 className="text-2xl font-bold text-gray-900">
                                ${disputes.reduce((sum, d) => sum + d.amount, 0)}
                            </h3>
                            <p className="text-sm text-gray-600">Total Amount</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                <div className="flex space-x-4">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-md text-sm font-medium ${filter === 'all'
                            ? 'bg-orange-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        All Disputes
                    </button>
                    <button
                        onClick={() => setFilter('open')}
                        className={`px-4 py-2 rounded-md text-sm font-medium ${filter === 'open'
                            ? 'bg-orange-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        Open
                    </button>
                    <button
                        onClick={() => setFilter('in_review')}
                        className={`px-4 py-2 rounded-md text-sm font-medium ${filter === 'in_review'
                            ? 'bg-orange-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        In Review
                    </button>
                    <button
                        onClick={() => setFilter('resolved')}
                        className={`px-4 py-2 rounded-md text-sm font-medium ${filter === 'resolved'
                            ? 'bg-orange-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        Resolved
                    </button>
                </div>
            </div>

            {/* Disputes List */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {filteredDisputes.map((dispute) => (
                        <li key={dispute.id} className="hover:bg-gray-50">
                            <div className="px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        {/* Priority Indicator */}
                                        <div className={`w-1 h-16 rounded-full ${getPriorityColor(dispute.priority)}`}></div>

                                        {/* Dispute Info */}
                                        <div>
                                            <div className="flex items-center space-x-2">
                                                <div className="text-blue-600">{getTypeIcon(dispute.type)}</div>
                                                <h3 className="text-sm font-medium text-gray-900">
                                                    {dispute.id} - {dispute.type.replace('_', ' ')}
                                                </h3>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(dispute.status)}`}>
                                                    {dispute.status.replace('_', ' ')}
                                                </span>
                                            </div>

                                            <div className="mt-1 flex items-center space-x-4 text-sm text-gray-600">
                                                <span>Client: {dispute.clientName}</span>
                                                <span>Provider: {dispute.providerName}</span>
                                                <span>Amount: ${dispute.amount}</span>
                                            </div>

                                            <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                                                {dispute.description}
                                            </p>

                                            <div className="mt-2 flex items-center space-x-4 text-xs text-gray-400">
                                                <span>Booking: {dispute.bookingId}</span>
                                                <span>Created: {new Date(dispute.createdAt).toLocaleDateString()}</span>
                                                {dispute.assignedAdmin && <span>Assigned: {dispute.assignedAdmin}</span>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => setSelectedDispute(dispute)}
                                            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                        >
                                            <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
                                            View Details
                                        </button>

                                        {dispute.status === 'OPEN' && (
                                            <button
                                                onClick={() => handleAssignToSelf(dispute.id)}
                                                className="inline-flex items-center px-3 py-2 border border-transparent text-xs font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
                                            >
                                                <UserIcon className="h-4 w-4 mr-1" />
                                                Take Case
                                            </button>
                                        )}

                                        {dispute.status === 'IN_REVIEW' && (
                                            <button
                                                onClick={() => handleResolveDispute(dispute.id, 'Resolved by admin')}
                                                className="inline-flex items-center px-3 py-2 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                                            >
                                                <CheckCircleIcon className="h-4 w-4 mr-1" />
                                                Resolve
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>

                {filteredDisputes.length === 0 && (
                    <div className="text-center py-12">
                        <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No disputes found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {filter === 'all' ? 'No disputes in the system.' : `No ${filter.replace('_', ' ')} disputes.`}
                        </p>
                    </div>
                )}
            </div>

            {/* Dispute Detail Modal */}
            {selectedDispute && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Dispute Details - {selectedDispute.id}
                                </h3>
                                <button
                                    onClick={() => setSelectedDispute(null)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Client</label>
                                        <p className="mt-1 text-sm text-gray-900">{selectedDispute.clientName}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Provider</label>
                                        <p className="mt-1 text-sm text-gray-900">{selectedDispute.providerName}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Type</label>
                                        <p className="mt-1 text-sm text-gray-900">{selectedDispute.type.replace('_', ' ')}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Amount</label>
                                        <p className="mt-1 text-sm text-gray-900">${selectedDispute.amount}</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Description</label>
                                    <p className="mt-1 text-sm text-gray-900">{selectedDispute.description}</p>
                                </div>

                                <div className="border-t pt-4">
                                    <h4 className="text-sm font-medium text-gray-900 mb-2">Resolution Actions</h4>
                                    <div className="flex space-x-3">
                                        <button
                                            onClick={() => handleResolveDispute(selectedDispute.id, 'Refund issued to client')}
                                            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700"
                                        >
                                            Issue Refund
                                        </button>
                                        <button
                                            onClick={() => handleResolveDispute(selectedDispute.id, 'Payment released to provider')}
                                            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                                        >
                                            Release Payment
                                        </button>
                                        <button
                                            onClick={() => handleResolveDispute(selectedDispute.id, 'Partial refund issued')}
                                            className="flex-1 bg-yellow-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-yellow-700"
                                        >
                                            Partial Refund
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 