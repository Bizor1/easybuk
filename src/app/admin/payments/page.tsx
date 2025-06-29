'use client';

import React from 'react';

export default function AdminPaymentsPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="py-6">
                        <h1 className="text-3xl font-bold text-gray-900">Payment Management</h1>
                        <p className="mt-2 text-gray-600">Monitor and manage all provider payments</p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white shadow rounded-lg p-8">
                    <div className="text-center">
                        <div className="text-6xl mb-4">💰</div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Payments Dashboard</h2>
                        <p className="text-gray-600 mb-8">
                            This page will display all payment transactions and management tools.
                        </p>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                            <div className="bg-blue-50 p-6 rounded-lg">
                                <h3 className="text-lg font-semibold text-blue-800 mb-2">Total Payments</h3>
                                <p className="text-3xl font-bold text-blue-600">GH₵0</p>
                                <p className="text-sm text-blue-600 mt-1">This month</p>
                            </div>

                            <div className="bg-green-50 p-6 rounded-lg">
                                <h3 className="text-lg font-semibold text-green-800 mb-2">Completed</h3>
                                <p className="text-3xl font-bold text-green-600">0</p>
                                <p className="text-sm text-green-600 mt-1">Transactions</p>
                            </div>

                            <div className="bg-yellow-50 p-6 rounded-lg">
                                <h3 className="text-lg font-semibold text-yellow-800 mb-2">Pending</h3>
                                <p className="text-3xl font-bold text-yellow-600">0</p>
                                <p className="text-sm text-yellow-600 mt-1">Awaiting processing</p>
                            </div>
                        </div>

                        {/* Development Notice */}
                        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                            <p className="text-blue-800 font-medium">
                                🚧 Payment management features are under development
                            </p>
                            <p className="text-blue-600 text-sm mt-1">
                                Coming soon: Transaction history, payment processing, and detailed analytics
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
