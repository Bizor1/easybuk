'use client';

import { useState } from 'react';
import {
    ChartBarIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    CurrencyDollarIcon,
    UserGroupIcon,
    CalendarIcon,
    ExclamationTriangleIcon,
    DocumentArrowDownIcon,
    FunnelIcon,
    EyeIcon
} from '@heroicons/react/24/outline';

interface AnalyticsMetric {
    title: string;
    value: string | number;
    change: number;
    changeType: 'increase' | 'decrease';
    icon: any;
    color: string;
}

interface TimeSeriesData {
    period: string;
    revenue: number;
    bookings: number;
    users: number;
}

export default function AnalyticsReports() {
    const [timeRange, setTimeRange] = useState('30d');
    const [selectedCategory, setSelectedCategory] = useState('all');

    // Mock analytics data
    const metrics: AnalyticsMetric[] = [
        {
            title: 'Total Revenue',
            value: '$42,350',
            change: 12.5,
            changeType: 'increase',
            icon: CurrencyDollarIcon,
            color: 'text-green-600'
        },
        {
            title: 'Active Users',
            value: '2,847',
            change: 8.3,
            changeType: 'increase',
            icon: UserGroupIcon,
            color: 'text-blue-600'
        },
        {
            title: 'Total Bookings',
            value: 1456,
            change: -2.1,
            changeType: 'decrease',
            icon: CalendarIcon,
            color: 'text-orange-600'
        },
        {
            title: 'Conversion Rate',
            value: '3.2%',
            change: 0.8,
            changeType: 'increase',
            icon: ChartBarIcon,
            color: 'text-purple-600'
        }
    ];

    const timeSeriesData: TimeSeriesData[] = [
        { period: 'Week 1', revenue: 8500, bookings: 245, users: 89 },
        { period: 'Week 2', revenue: 12300, bookings: 312, users: 156 },
        { period: 'Week 3', revenue: 9800, bookings: 287, users: 134 },
        { period: 'Week 4', revenue: 11750, bookings: 356, users: 178 }
    ];

    const topServices = [
        { name: 'House Cleaning', bookings: 342, revenue: 15680, growth: 23.5 },
        { name: 'Plumbing Services', bookings: 298, revenue: 18940, growth: 15.2 },
        { name: 'Electrical Work', bookings: 187, revenue: 12450, growth: 8.7 },
        { name: 'Healthcare Consultation', bookings: 234, revenue: 8760, growth: 34.1 },
        { name: 'Legal Advisory', bookings: 156, revenue: 14250, growth: -5.3 }
    ];

    const regionData = [
        { region: 'Greater Accra', users: 1245, bookings: 567, revenue: 23480 },
        { region: 'Ashanti', users: 892, bookings: 423, revenue: 18650 },
        { region: 'Western', users: 434, bookings: 198, revenue: 8920 },
        { region: 'Eastern', users: 367, bookings: 187, revenue: 7340 },
        { region: 'Northern', users: 234, bookings: 98, revenue: 4560 }
    ];

    const userGrowthData = [
        { month: 'Jan', clients: 450, providers: 230 },
        { month: 'Feb', clients: 623, providers: 298 },
        { month: 'Mar', clients: 789, providers: 367 },
        { month: 'Apr', clients: 934, providers: 445 },
        { month: 'May', clients: 1156, providers: 523 },
        { month: 'Jun', clients: 1289, providers: 612 }
    ];

    const generateReport = (type: string) => {
        // Mock report generation
        alert(`Generating ${type} report for ${timeRange}...`);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="border-b border-gray-200 pb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Platform performance insights and business intelligence
                        </p>
                    </div>
                    <div className="flex space-x-3">
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                        >
                            <option value="7d">Last 7 days</option>
                            <option value="30d">Last 30 days</option>
                            <option value="90d">Last 90 days</option>
                            <option value="1y">Last year</option>
                        </select>
                        <button
                            onClick={() => generateReport('comprehensive')}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
                        >
                            <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                            Export Report
                        </button>
                    </div>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {metrics.map((metric, index) => (
                    <div key={index} className="bg-white p-6 rounded-lg shadow border border-gray-200">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <metric.icon className={`h-8 w-8 ${metric.color}`} />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">{metric.title}</dt>
                                    <dd className="flex items-baseline">
                                        <div className="text-2xl font-semibold text-gray-900">{metric.value}</div>
                                        <div className={`ml-2 flex items-baseline text-sm font-semibold ${metric.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                            {metric.changeType === 'increase' ? (
                                                <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                                            ) : (
                                                <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
                                            )}
                                            {Math.abs(metric.change)}%
                                        </div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Trend Chart */}
                <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Trend</h3>
                    <div className="space-y-4">
                        {timeSeriesData.map((data, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">{data.period}</span>
                                <div className="flex items-center space-x-4">
                                    <div className="w-32 bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-green-600 h-2 rounded-full"
                                            style={{ width: `${(data.revenue / 15000) * 100}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-sm font-medium text-gray-900">${data.revenue.toLocaleString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* User Growth Chart */}
                <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">User Growth by Type</h3>
                    <div className="space-y-4">
                        {userGrowthData.slice(-4).map((data, index) => (
                            <div key={index} className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">{data.month}</span>
                                    <span className="text-gray-900">Total: {data.clients + data.providers}</span>
                                </div>
                                <div className="flex space-x-2">
                                    <div className="flex-1">
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full"
                                                style={{ width: `${(data.clients / (data.clients + data.providers)) * 100}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-xs text-gray-500">Clients: {data.clients}</span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-orange-600 h-2 rounded-full"
                                                style={{ width: `${(data.providers / (data.clients + data.providers)) * 100}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-xs text-gray-500">Providers: {data.providers}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Detailed Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Services */}
                <div className="bg-white shadow rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">Top Services by Performance</h3>
                    </div>
                    <div className="divide-y divide-gray-200">
                        {topServices.map((service, index) => (
                            <div key={index} className="px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-900">{service.name}</h4>
                                        <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                                            <span>{service.bookings} bookings</span>
                                            <span>${service.revenue.toLocaleString()} revenue</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`text-sm font-medium ${service.growth > 0 ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                            {service.growth > 0 ? '+' : ''}{service.growth}%
                                        </div>
                                        <div className="text-xs text-gray-500">growth</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Regional Performance */}
                <div className="bg-white shadow rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">Regional Performance</h3>
                    </div>
                    <div className="divide-y divide-gray-200">
                        {regionData.map((region, index) => (
                            <div key={index} className="px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-900">{region.region}</h4>
                                        <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                                            <span>{region.users} users</span>
                                            <span>{region.bookings} bookings</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-medium text-gray-900">
                                            ${region.revenue.toLocaleString()}
                                        </div>
                                        <div className="text-xs text-gray-500">revenue</div>
                                    </div>
                                </div>
                                <div className="mt-2">
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-orange-600 h-2 rounded-full"
                                            style={{ width: `${(region.revenue / 25000) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Report Generation */}
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Generate Reports</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                        onClick={() => generateReport('financial')}
                        className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        <CurrencyDollarIcon className="h-5 w-5 mr-2 text-green-600" />
                        Financial Report
                    </button>
                    <button
                        onClick={() => generateReport('user_activity')}
                        className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        <UserGroupIcon className="h-5 w-5 mr-2 text-blue-600" />
                        User Activity Report
                    </button>
                    <button
                        onClick={() => generateReport('service_performance')}
                        className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        <ChartBarIcon className="h-5 w-5 mr-2 text-purple-600" />
                        Service Performance
                    </button>
                </div>
            </div>

            {/* Performance Alerts */}
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Alerts</h3>
                <div className="space-y-3">
                    <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-3" />
                        <div>
                            <p className="text-sm font-medium text-yellow-800">Booking Decline Alert</p>
                            <p className="text-xs text-yellow-600">Bookings decreased by 2.1% this week. Consider promotional campaigns.</p>
                        </div>
                    </div>
                    <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                        <ArrowTrendingUpIcon className="h-5 w-5 text-green-600 mr-3" />
                        <div>
                            <p className="text-sm font-medium text-green-800">Revenue Growth</p>
                            <p className="text-xs text-green-600">Healthcare services showing 34% growth. Opportunity for expansion.</p>
                        </div>
                    </div>
                    <div className="flex items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <UserGroupIcon className="h-5 w-5 text-blue-600 mr-3" />
                        <div>
                            <p className="text-sm font-medium text-blue-800">User Acquisition</p>
                            <p className="text-xs text-blue-600">New user registrations up 8.3% - conversion funnel is performing well.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 