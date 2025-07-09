'use client';

import { useState, useEffect } from 'react';
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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Real analytics data from API
    const [metrics, setMetrics] = useState<AnalyticsMetric[]>([]);
    const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
    const [topServices, setTopServices] = useState<any[]>([]);
    const [regionData, setRegionData] = useState<any[]>([]);
    const [userGrowthData, setUserGrowthData] = useState<any[]>([]);
    const [summary, setSummary] = useState<any>({});

    // Fetch analytics data from API
    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                setLoading(true);
                setError(null);

                console.log('📊 Fetching admin analytics data for range:', timeRange);

                // Fetch overview metrics
                const overviewResponse = await fetch(`/api/admin/analytics/overview?timeRange=${timeRange}`, {
                    credentials: 'include'
                });

                if (!overviewResponse.ok) {
                    throw new Error(`Overview API failed: ${overviewResponse.status}`);
                }

                const overviewData = await overviewResponse.json();
                console.log('📊 Overview data received:', overviewData);

                // Fetch time series data
                const timeSeriesResponse = await fetch(`/api/admin/analytics/timeseries?timeRange=${timeRange}`, {
                    credentials: 'include'
                });

                if (!timeSeriesResponse.ok) {
                    throw new Error(`Time series API failed: ${timeSeriesResponse.status}`);
                }

                const timeSeriesData = await timeSeriesResponse.json();
                console.log('📊 Time series data received:', timeSeriesData);

                // Update state with real data
                setMetrics(overviewData.metrics.map((metric: any) => ({
                    ...metric,
                    icon: getIconForMetric(metric.title)
                })));

                setTimeSeriesData(timeSeriesData.timeSeriesData.map((data: any) => ({
                    period: data.period,
                    revenue: data.revenue,
                    bookings: data.bookings,
                    users: data.newUsers
                })));

                setTopServices(overviewData.topServices || []);
                setRegionData(overviewData.regionData || []);
                setUserGrowthData(timeSeriesData.userGrowthData || []);
                setSummary({
                    ...overviewData.summary,
                    ...timeSeriesData.summary
                });

            } catch (error) {
                console.error('❌ Error fetching analytics:', error);
                setError(error instanceof Error ? error.message : 'Failed to fetch analytics data');
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [timeRange]);

    // Helper function to get icons for metrics
    const getIconForMetric = (title: string) => {
        switch (title) {
            case 'Total Revenue':
                return CurrencyDollarIcon;
            case 'Active Users':
                return UserGroupIcon;
            case 'Total Bookings':
                return CalendarIcon;
            case 'Conversion Rate':
                return ChartBarIcon;
            default:
                return ChartBarIcon;
        }
    };

    const generateReport = (type: string) => {
        // Mock report generation
        alert(`Generating ${type} report for ${timeRange}...`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600"></div>
                <div className="ml-4">
                    <p className="text-lg font-medium text-gray-900">Loading Analytics...</p>
                    <p className="text-sm text-gray-600">Fetching real-time data from database</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Error Loading Analytics</h3>
                <p className="mt-1 text-sm text-gray-500">{error}</p>
                <div className="mt-6">
                    <button
                        onClick={() => window.location.reload()}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

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
                        {summary.totalRevenue !== undefined && (
                            <p className="mt-2 text-sm text-green-600 font-medium">
                                📊 Real-time data from {summary.totalBookings} bookings and GH₵{summary.totalRevenue?.toLocaleString()} revenue
                            </p>
                        )}
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
                    {timeSeriesData.length > 0 ? (
                        <div className="space-y-4">
                            {timeSeriesData.map((data, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">{data.period}</span>
                                    <div className="flex items-center space-x-4">
                                        <div className="w-32 bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-green-600 h-2 rounded-full"
                                                style={{ width: `${Math.min((data.revenue / Math.max(...timeSeriesData.map(d => d.revenue))) * 100, 100)}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-sm font-medium text-gray-900">GH₵{data.revenue.toLocaleString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-500">No revenue data available for this period</p>
                        </div>
                    )}
                </div>

                {/* User Growth Chart */}
                <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">User Growth</h3>
                    {userGrowthData.length > 0 ? (
                        <div className="space-y-4">
                            {userGrowthData.slice(-4).map((data, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">{data.month}</span>
                                    <div className="flex items-center space-x-4">
                                        <div className="text-sm text-blue-600 font-medium">
                                            Clients: {data.clients}
                                        </div>
                                        <div className="flex-1">
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-orange-600 h-2 rounded-full"
                                                    style={{ width: `${data.clients + data.providers > 0 ? (data.providers / (data.clients + data.providers)) * 100 : 0}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-xs text-gray-500">Providers: {data.providers}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-500">No user growth data available</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Detailed Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Services */}
                <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Top Performing Services</h3>
                    {topServices.length > 0 ? (
                        <div className="space-y-3">
                            {topServices.map((service, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="font-medium text-gray-900">{service.name}</p>
                                        <p className="text-sm text-gray-600">{service.bookings} bookings</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-green-600">GH₵{service.revenue.toLocaleString()}</p>
                                        {service.growth !== 0 && (
                                            <p className={`text-sm ${service.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {service.growth >= 0 ? '+' : ''}{service.growth}%
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-500">No service data available</p>
                        </div>
                    )}
                </div>

                {/* Regional Performance */}
                <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Regional Performance</h3>
                    {regionData.length > 0 ? (
                        <div className="space-y-3">
                            {regionData.map((region, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="font-medium text-gray-900">{region.region}</p>
                                        <p className="text-sm text-gray-600">{region.bookings} bookings</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-blue-600">GH₵{region.revenue.toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-500">No regional data available</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Export Reports */}
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Export Reports</h3>
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
                <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Insights</h3>
                <div className="space-y-3">
                    {summary.conversionRate !== undefined && (
                        <div className="flex items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <ChartBarIcon className="h-5 w-5 text-blue-600 mr-3" />
                            <div>
                                <p className="text-sm font-medium text-blue-800">Conversion Rate</p>
                                <p className="text-xs text-blue-600">
                                    {summary.conversionRate.toFixed(1)}% of bookings are completed successfully
                                </p>
                            </div>
                        </div>
                    )}

                    {summary.totalProviders !== undefined && (
                        <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                            <UserGroupIcon className="h-5 w-5 text-green-600 mr-3" />
                            <div>
                                <p className="text-sm font-medium text-green-800">Provider Network</p>
                                <p className="text-xs text-green-600">
                                    {summary.totalProviders} active providers serving {summary.totalClients} clients
                                </p>
                            </div>
                        </div>
                    )}

                    {summary.activeDisputes !== undefined && summary.activeDisputes > 0 && (
                        <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-3" />
                            <div>
                                <p className="text-sm font-medium text-yellow-800">Active Disputes</p>
                                <p className="text-xs text-yellow-600">
                                    {summary.activeDisputes} disputes need attention. Review in the disputes section.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 