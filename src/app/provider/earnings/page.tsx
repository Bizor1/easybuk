'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface EarningsData {
    period: string;
    amount: number;
    growth: number;
    bookings: number;
}

interface Transaction {
    id: string;
    type: 'payment' | 'withdrawal' | 'escrow_release' | 'refund';
    amount: number;
    date: string;
    client: string;
    service: string;
    status: 'completed' | 'pending' | 'failed';
    fee: number;
}

export default function EarningsPage() {
    const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');
    const [selectedTab, setSelectedTab] = useState<'overview' | 'transactions' | 'analytics'>('overview');
    const [loading, setLoading] = useState(true);

    // State for earnings data
    const [earningsOverview, setEarningsOverview] = useState({
        today: { amount: 0, bookings: 0, growth: 0 },
        week: { amount: 0, bookings: 0, growth: 0 },
        month: { amount: 0, bookings: 0, growth: 0 },
        year: { amount: 0, bookings: 0, growth: 0 },
        pendingEscrow: 0,
        totalEarnings: 0,
        averagePerBooking: 0,
        // New pipeline metrics
        availableBalance: 0,
        pipelineValue: 0,
        totalEarningPower: 0,
        pipelineBookings: 0,
        escrowBookings: 0
    });

    const [monthlyData, setMonthlyData] = useState<EarningsData[]>([]);
    const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);

    // Fetch earnings data
    useEffect(() => {
        const fetchEarningsData = async () => {
            try {
                setLoading(true);
                const [overviewRes, monthlyRes, transactionsRes] = await Promise.all([
                    fetch('/api/provider/earnings/overview'),
                    fetch('/api/provider/earnings/monthly'),
                    fetch('/api/provider/earnings/transactions')
                ]);

                if (overviewRes.ok) {
                    const overview = await overviewRes.json();
                    setEarningsOverview(overview);
                }

                if (monthlyRes.ok) {
                    const monthly = await monthlyRes.json();
                    setMonthlyData(monthly);
                }

                if (transactionsRes.ok) {
                    const transactions = await transactionsRes.json();
                    setRecentTransactions(transactions);
                }
            } catch (error) {
                console.error('Error fetching earnings data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchEarningsData();
    }, []);

    const getTransactionIcon = (type: Transaction['type']) => {
        switch (type) {
            case 'payment': return '💰';
            case 'withdrawal': return '🏦';
            case 'escrow_release': return '🔓';
            case 'refund': return '↩️';
            default: return '💸';
        }
    };

    const getTransactionColor = (type: Transaction['type']) => {
        switch (type) {
            case 'payment': return 'from-green-500 to-emerald-500';
            case 'withdrawal': return 'from-blue-500 to-cyan-500';
            case 'escrow_release': return 'from-purple-500 to-pink-500';
            case 'refund': return 'from-red-500 to-red-600';
            default: return 'from-gray-500 to-gray-600';
        }
    };

    const getStatusColor = (status: Transaction['status']) => {
        switch (status) {
            case 'completed': return 'from-green-100/90 to-emerald-100/90 dark:from-green-900/30 dark:to-emerald-900/30 text-green-800 dark:text-green-400';
            case 'pending': return 'from-yellow-100/90 to-orange-100/90 dark:from-yellow-900/30 dark:to-orange-900/30 text-yellow-800 dark:text-yellow-400';
            case 'failed': return 'from-red-100/90 to-red-200/90 dark:from-red-900/30 dark:to-red-800/30 text-red-800 dark:text-red-400';
            default: return 'from-gray-100/90 to-gray-200/90 dark:from-gray-700/50 dark:to-gray-600/50 text-gray-800 dark:text-gray-300';
        }
    };

    const maxAmount = monthlyData.length > 0 ? Math.max(...monthlyData.map(d => d.amount)) : 1;

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 dark:from-slate-900 dark:via-gray-900 dark:to-slate-800 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">Loading earnings data...</p>
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
                                <span className="text-gray-900 dark:text-white">Earnings</span>
                                <span className="block text-gradient-mixed animate-gradient-x">Financial Hub 💰</span>
                            </h1>
                            <p className="text-lg text-gray-600 dark:text-gray-400">
                                Track your income, payments, and financial performance
                            </p>
                        </div>
                        <div className="mt-4 md:mt-0 flex items-center space-x-3">
                            <button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg text-sm">
                                💸 Withdraw Funds
                            </button>
                            <button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg text-sm">
                                📊 Export Report
                            </button>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {[
                        { label: "Available Balance", value: `GH₵${earningsOverview.availableBalance?.toFixed(2) || '0.00'}`, growth: 0, icon: '💳', gradient: 'from-green-500 to-emerald-500' },
                        { label: 'Pending Escrow', value: `GH₵${earningsOverview.pendingEscrow?.toFixed(2) || '0.00'}`, growth: 0, icon: '🔒', gradient: 'from-yellow-500 to-orange-500' },
                        { label: 'Active Pipeline', value: `GH₵${earningsOverview.pipelineValue?.toFixed(2) || '0.00'}`, growth: 0, icon: '⏳', gradient: 'from-blue-500 to-purple-500' },
                        { label: 'Total Earning Power', value: `GH₵${earningsOverview.totalEarningPower?.toFixed(2) || '0.00'}`, growth: 8, icon: '🎯', gradient: 'from-purple-500 to-pink-500' }
                    ].map((stat, index) => (
                        <div
                            key={index}
                            className="relative group animate-fadeInUp"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className={`absolute -inset-1 bg-gradient-to-r ${stat.gradient} rounded-xl opacity-25 group-hover:opacity-40 blur transition-opacity`}></div>
                            <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.label}</h3>
                                    <div className={`p-2 bg-gradient-to-r ${stat.gradient.replace('500', '100').replace('dark:from-', 'dark:from-').replace('dark:to-', 'dark:to-')} rounded-lg`}>
                                        <span className="text-xl">{stat.icon}</span>
                                    </div>
                                </div>
                                <p className={`text-2xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                                    {stat.value}
                                </p>
                                {stat.growth > 0 && (
                                    <div className="flex items-center space-x-1 mt-2">
                                        <svg className="w-4 h-4 text-green-500 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                                        </svg>
                                        <span className="text-sm font-medium text-green-600 dark:text-green-400">+{stat.growth}%</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Navigation Tabs */}
                <div className="relative group mb-8">
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl opacity-20 group-hover:opacity-30 blur transition-opacity"></div>
                    <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-4">
                        <div className="flex flex-wrap gap-2">
                            {[
                                { id: 'overview', label: 'Overview', icon: '📊' },
                                { id: 'transactions', label: 'Transactions', icon: '📋' },
                                { id: 'analytics', label: 'Analytics', icon: '📈' }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setSelectedTab(tab.id as any)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 ${selectedTab === tab.id
                                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                                        : 'bg-gradient-to-r from-gray-100/80 to-gray-200/80 dark:from-gray-700/50 dark:to-gray-600/50 text-gray-700 dark:text-gray-300 hover:from-indigo-100/80 hover:to-purple-100/80'
                                        }`}
                                >
                                    <span className="mr-2">{tab.icon}</span>
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Tab Content */}
                {selectedTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Earnings Chart */}
                        <div className="lg:col-span-2 relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl opacity-20 group-hover:opacity-30 blur transition-opacity"></div>
                            <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-semibold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                        Monthly Earnings 📊
                                    </h3>
                                    <div className="flex gap-2">
                                        {(['week', 'month', 'year'] as const).map((period) => (
                                            <button
                                                key={period}
                                                onClick={() => setSelectedPeriod(period)}
                                                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${selectedPeriod === period
                                                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                                    }`}
                                            >
                                                {period.charAt(0).toUpperCase() + period.slice(1)}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Simple Bar Chart */}
                                {monthlyData.length > 0 ? (
                                    <div className="space-y-4">
                                        {monthlyData.slice(-6).map((data, index) => (
                                            <div
                                                key={data.period}
                                                className="flex items-center space-x-4 animate-fadeInUp"
                                                style={{ animationDelay: `${index * 100}ms` }}
                                            >
                                                <div className="w-12 text-sm font-medium text-gray-600 dark:text-gray-400">
                                                    {data.period}
                                                </div>
                                                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-8 relative overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-3"
                                                        style={{ width: `${(data.amount / maxAmount) * 100}%` }}
                                                    >
                                                        <span className="text-white text-xs font-medium">
                                                            GH₵{data.amount.toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className={`text-xs font-medium px-2 py-1 rounded-full ${data.growth >= 0
                                                    ? 'text-green-600 dark:text-green-400 bg-green-100/50 dark:bg-green-900/30'
                                                    : 'text-red-600 dark:text-red-400 bg-red-100/50 dark:bg-red-900/30'
                                                    }`}>
                                                    {data.growth >= 0 ? '+' : ''}{data.growth}%
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="text-6xl mb-4">📊</div>
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Earnings Data</h3>
                                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                                            Complete your first booking to start tracking earnings
                                        </p>
                                        <Link
                                            href="/provider/services"
                                            className="inline-flex items-center bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
                                        >
                                            Create Your Services
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl opacity-20 group-hover:opacity-30 blur transition-opacity"></div>
                            <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-6">
                                <h3 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
                                    Quick Actions 🚀
                                </h3>

                                <div className="space-y-4">
                                    {[
                                        { icon: '💸', label: 'Withdraw Earnings', description: 'Transfer to bank account', gradient: 'from-green-500 to-emerald-500' },
                                        { icon: '📊', label: 'Generate Report', description: 'Monthly earnings report', gradient: 'from-blue-500 to-cyan-500' },
                                        { icon: '💳', label: 'Payment Settings', description: 'Manage payment methods', gradient: 'from-purple-500 to-pink-500' },
                                        { icon: '📈', label: 'View Analytics', description: 'Detailed performance data', gradient: 'from-orange-500 to-red-500' }
                                    ].map((action, index) => (
                                        <button
                                            key={index}
                                            className={`w-full p-4 rounded-lg bg-gradient-to-r from-gray-50/80 to-gray-100/80 dark:from-gray-700/50 dark:to-gray-600/50 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 hover:scale-105 transition-all duration-300 text-left animate-fadeInUp`}
                                            style={{ animationDelay: `${index * 100}ms` }}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className={`p-2 bg-gradient-to-r ${action.gradient.replace('500', '100').replace('dark:from-', 'dark:from-').replace('dark:to-', 'dark:to-')} rounded-lg`}>
                                                    <span className="text-xl">{action.icon}</span>
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-900 dark:text-white">{action.label}</h4>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">{action.description}</p>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {selectedTab === 'transactions' && (
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl opacity-20 group-hover:opacity-30 blur transition-opacity"></div>
                        <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                                    Recent Transactions 📋
                                </h3>
                                <button className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium transition-colors hover:scale-110 transform">
                                    View All →
                                </button>
                            </div>

                            {recentTransactions.length > 0 ? (
                                <div className="space-y-4">
                                    {recentTransactions.map((transaction, index) => (
                                        <div
                                            key={transaction.id}
                                            className={`p-4 rounded-lg bg-gradient-to-r from-gray-50/80 to-gray-100/80 dark:from-gray-700/50 dark:to-gray-600/50 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 hover:scale-105 transition-all duration-300 animate-fadeInUp`}
                                            style={{ animationDelay: `${index * 100}ms` }}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-4">
                                                    <div className={`p-2 bg-gradient-to-r ${getTransactionColor(transaction.type).replace('500', '100').replace('600', '200')} rounded-lg`}>
                                                        <span className="text-xl">{getTransactionIcon(transaction.type)}</span>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium text-gray-900 dark:text-white">{transaction.client}</h4>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">{transaction.service}</p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-500">{new Date(transaction.date).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`text-lg font-bold ${transaction.amount > 0
                                                        ? 'text-green-600 dark:text-green-400'
                                                        : 'text-red-600 dark:text-red-400'
                                                        }`}>
                                                        {transaction.amount > 0 ? '+' : ''}GH₵{Math.abs(transaction.amount).toFixed(2)}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        Fee: GH₵{transaction.fee.toFixed(2)}
                                                    </p>
                                                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getStatusColor(transaction.status)} mt-1`}>
                                                        {transaction.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="text-6xl mb-4">📋</div>
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Transactions Yet</h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                                        Your payment history will appear here once you start receiving payments
                                    </p>
                                    <Link
                                        href="/provider/services"
                                        className="inline-flex items-center bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
                                    >
                                        Create Your Services
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {selectedTab === 'analytics' && (
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-red-600 rounded-xl opacity-20 group-hover:opacity-30 blur transition-opacity"></div>
                        <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-12 text-center">
                            <div className="text-6xl mb-4">📈</div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Analytics Coming Soon</h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                Advanced earnings analytics and insights will be available here
                            </p>
                            <button className="inline-flex items-center bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg">
                                Get Notified
                            </button>
                        </div>
                    </div>
                )}
            </div>

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
            `}</style>
        </div>
    );
} 