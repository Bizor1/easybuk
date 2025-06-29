'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    UserGroupIcon,
    CurrencyDollarIcon,
    CalendarIcon,
    ExclamationTriangleIcon,
    ChartBarIcon,
    ClockIcon,
    CheckCircleIcon,
    XCircleIcon,
    EyeIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    ShieldExclamationIcon,
    BanknotesIcon
} from '@heroicons/react/24/outline';

interface DashboardStats {
    totalUsers: number;
    totalRevenue: number;
    totalBookings: number;
    activeDisputes: number;
    pendingVerifications: number;
    newUsersToday: number;
    revenueToday: number;
    bookingsToday: number;
    completedBookings: number;
    totalProviders: number;
    verifiedProviders: number;
    userGrowthPercent: number;
    bookingGrowthPercent: number;
    revenueGrowthPercent: number;
}

interface RecentActivity {
    id: string;
    type: 'user_signup' | 'booking_created' | 'dispute_opened' | 'payment_processed' | 'verification_request';
    user: string;
    description: string;
    timestamp: string;
    severity: 'low' | 'medium' | 'high';
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('7d');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            console.log('📊 Fetching dashboard data...');

            // Fetch stats and activity in parallel
            const [statsResponse, activityResponse] = await Promise.all([
                fetch('/api/admin/dashboard/stats'),
                fetch('/api/admin/dashboard/activity')
            ]);

            if (statsResponse.ok) {
                const statsData = await statsResponse.json();
                console.log('📊 Stats loaded:', statsData.stats);
                setStats(statsData.stats);
            } else {
                console.error('Failed to fetch stats');
            }

            if (activityResponse.ok) {
                const activityData = await activityResponse.json();
                console.log('📋 Activity loaded:', activityData.activities.length, 'items');
                setRecentActivity(activityData.activities);
            } else {
                console.error('Failed to fetch activity');
            }

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Chart data
    const revenueChartData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
            {
                label: 'Revenue ($)',
                data: [12400, 13200, 11800, 15600, 14200, 16800, 18200],
                borderColor: 'rgb(249, 115, 22)',
                backgroundColor: 'rgba(249, 115, 22, 0.1)',
                tension: 0.1,
            },
        ],
    };

    const userGrowthData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                label: 'New Users',
                data: [450, 520, 480, 680, 720, 890],
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
            },
        ],
    };

    const userTypeData = {
        labels: ['Clients', 'Providers', 'Both Roles'],
        datasets: [
            {
                data: [7850, 3200, 1400],
                backgroundColor: [
                    'rgba(34, 197, 94, 0.8)',
                    'rgba(249, 115, 22, 0.8)',
                    'rgba(139, 92, 246, 0.8)',
                ],
            },
        ],
    };

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'user_signup': return <UserGroupIcon className="h-5 w-5" />;
            case 'booking_created': return <CalendarIcon className="h-5 w-5" />;
            case 'dispute_opened': return <ExclamationTriangleIcon className="h-5 w-5" />;
            case 'payment_processed': return <CurrencyDollarIcon className="h-5 w-5" />;
            case 'verification_request': return <ShieldExclamationIcon className="h-5 w-5" />;
            default: return <ClockIcon className="h-5 w-5" />;
        }
    };

    const getActivityColor = (severity: string) => {
        switch (severity) {
            case 'high': return 'text-red-600 bg-red-100';
            case 'medium': return 'text-yellow-600 bg-yellow-100';
            case 'low': return 'text-green-600 bg-green-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500"></div>
                    <p className="mt-4 text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">Failed to load dashboard data</p>
                    <button
                        onClick={fetchDashboardData}
                        className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="border-b border-gray-200 pb-4">
                <h1 className="text-3xl font-bold text-gray-900">Platform Dashboard</h1>
                <p className="mt-1 text-sm text-gray-600">
                    Real-time overview of EasyBuk platform performance and activity
                </p>
            </div>

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Users */}
                <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
                    <div className="p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <UserGroupIcon className="h-8 w-8 text-blue-600" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                                    <dd className="flex items-baseline">
                                        <div className="text-2xl font-semibold text-gray-900">
                                            {stats.totalUsers.toLocaleString()}
                                        </div>
                                        <div className={`ml-2 flex items-baseline text-sm font-semibold ${stats.userGrowthPercent >= 0 ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                            {stats.userGrowthPercent >= 0 ? (
                                                <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                                            ) : (
                                                <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
                                            )}
                                            {stats.userGrowthPercent >= 0 ? '+' : ''}{stats.userGrowthPercent}%
                                        </div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-6 py-3">
                        <div className="text-sm">
                            <span className="text-green-600 font-medium">+{stats.newUsersToday} new today</span>
                        </div>
                    </div>
                </div>

                {/* Total Revenue */}
                <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
                    <div className="p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                                    <dd className="flex items-baseline">
                                        <div className="text-2xl font-semibold text-gray-900">
                                            GHS {stats.totalRevenue.toLocaleString()}
                                        </div>
                                        <div className={`ml-2 flex items-baseline text-sm font-semibold ${stats.revenueGrowthPercent >= 0 ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                            {stats.revenueGrowthPercent >= 0 ? (
                                                <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                                            ) : (
                                                <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
                                            )}
                                            {stats.revenueGrowthPercent >= 0 ? '+' : ''}{stats.revenueGrowthPercent}%
                                        </div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-6 py-3">
                        <div className="text-sm">
                            <span className="text-green-600 font-medium">GHS {stats.revenueToday.toLocaleString()} today</span>
                        </div>
                    </div>
                </div>

                {/* Total Bookings */}
                <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
                    <div className="p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <CalendarIcon className="h-8 w-8 text-orange-600" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Total Bookings</dt>
                                    <dd className="flex items-baseline">
                                        <div className="text-2xl font-semibold text-gray-900">
                                            {stats.totalBookings.toLocaleString()}
                                        </div>
                                        <div className={`ml-2 flex items-baseline text-sm font-semibold ${stats.bookingGrowthPercent >= 0 ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                            {stats.bookingGrowthPercent >= 0 ? (
                                                <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                                            ) : (
                                                <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
                                            )}
                                            {stats.bookingGrowthPercent >= 0 ? '+' : ''}{stats.bookingGrowthPercent}%
                                        </div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-6 py-3">
                        <div className="text-sm">
                            <span className="text-green-600 font-medium">+{stats.bookingsToday} today</span>
                        </div>
                    </div>
                </div>

                {/* Active Disputes */}
                <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
                    <div className="p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Active Disputes</dt>
                                    <dd className="flex items-baseline">
                                        <div className="text-2xl font-semibold text-gray-900">
                                            {stats.activeDisputes}
                                        </div>
                                        <div className="ml-2 flex items-baseline text-sm font-semibold text-orange-600">
                                            <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                                            {stats.activeDisputes > 0 ? 'Active' : 'None'}
                                        </div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-6 py-3">
                        <div className="text-sm">
                            <span className={stats.activeDisputes > 0 ? "text-red-600 font-medium" : "text-green-600 font-medium"}>
                                {stats.activeDisputes > 0 ? "Needs attention" : "All resolved"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Alerts & System Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">System Alerts</h3>
                    <div className="space-y-3">
                        {stats.activeDisputes > 10 && (
                            <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                                <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-3" />
                                <div>
                                    <p className="text-sm font-medium text-red-800">High Dispute Volume</p>
                                    <p className="text-xs text-red-600">{stats.activeDisputes} active disputes need review</p>
                                </div>
                            </div>
                        )}
                        {stats.pendingVerifications > 0 && (
                            <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <div className="flex items-center">
                                    <ClockIcon className="h-5 w-5 text-yellow-600 mr-3" />
                                    <div>
                                        <p className="text-sm font-medium text-yellow-800">Document Verification</p>
                                        <p className="text-xs text-yellow-600">{stats.pendingVerifications} providers awaiting document review</p>
                                    </div>
                                </div>
                                <Link
                                    href="/admin/documents"
                                    className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded hover:bg-yellow-300 transition-colors"
                                >
                                    Review →
                                </Link>
                            </div>
                        )}
                        {stats.userGrowthPercent > 20 && (
                            <div className="flex items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <ArrowTrendingUpIcon className="h-5 w-5 text-blue-600 mr-3" />
                                <div>
                                    <p className="text-sm font-medium text-blue-800">Growth Alert</p>
                                    <p className="text-xs text-blue-600">User signups increased {stats.userGrowthPercent}% this week</p>
                                </div>
                            </div>
                        )}
                        {stats.activeDisputes === 0 && stats.pendingVerifications === 0 && stats.userGrowthPercent <= 20 && (
                            <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                                <CheckCircleIcon className="h-5 w-5 text-green-600 mr-3" />
                                <div>
                                    <p className="text-sm font-medium text-green-800">All Clear</p>
                                    <p className="text-xs text-green-600">No critical issues requiring attention</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Platform Status</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
                                <span className="text-sm text-gray-700">Payment System</span>
                            </div>
                            <span className="text-sm font-medium text-green-600">Operational</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
                                <span className="text-sm text-gray-700">Booking Engine</span>
                            </div>
                            <span className="text-sm font-medium text-green-600">Operational</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-yellow-400 rounded-full mr-3"></div>
                                <span className="text-sm text-gray-700">SMS Notifications</span>
                            </div>
                            <span className="text-sm font-medium text-yellow-600">Degraded</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
                                <span className="text-sm text-gray-700">Database</span>
                            </div>
                            <span className="text-sm font-medium text-green-600">Operational</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white shadow-sm rounded-lg border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
                </div>
                {recentActivity.length === 0 ? (
                    <div className="p-8 text-center">
                        <div className="text-gray-400 text-lg">📋</div>
                        <p className="mt-2 text-gray-600">No recent activity in the last 24 hours</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {recentActivity.map((activity) => (
                            <div key={activity.id} className="p-6">
                                <div className="flex items-center space-x-4">
                                    <div className={`p-2 rounded-full ${getActivityColor(activity.severity)}`}>
                                        {getActivityIcon(activity.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900">{activity.user}</p>
                                        <p className="text-sm text-gray-500">{activity.description}</p>
                                    </div>
                                    <div className="text-sm text-gray-500">{activity.timestamp}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                    <button
                        onClick={fetchDashboardData}
                        className="text-sm font-medium text-orange-600 hover:text-orange-500"
                    >
                        Refresh dashboard →
                    </button>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <UserGroupIcon className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                        <span className="text-sm font-medium">Manage Users</span>
                    </button>
                    <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <ExclamationTriangleIcon className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                        <span className="text-sm font-medium">Review Disputes</span>
                    </button>
                    <Link href="/admin/documents" className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex flex-col items-center">
                        <ShieldExclamationIcon className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                        <span className="text-sm font-medium">Review Documents</span>
                    </Link>
                    <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <ChartBarIcon className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                        <span className="text-sm font-medium">View Analytics</span>
                    </button>
                </div>
            </div>
        </div>
    );
} 