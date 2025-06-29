'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface AnalyticsData {
    period: string;
    views: number;
    bookings: number;
    revenue: number;
    rating: number;
}

interface MetricCard {
    title: string;
    value: string;
    change: number;
    icon: string;
    gradient: string;
}

export default function AnalyticsPage() {
    const [selectedPeriod, setSelectedPeriod] = useState<'7days' | '30days' | '3months' | '1year'>('30days');
    const [selectedMetric, setSelectedMetric] = useState<'overview' | 'performance' | 'clients' | 'revenue'>('overview');
    const [loading, setLoading] = useState(true);

    // State for analytics data
    const [analytics, setAnalytics] = useState({
        overview: {
            totalViews: 0,
            profileVisits: 0,
            bookingRequests: 0,
            conversionRate: 0,
            avgRating: 0,
            responseTime: 0,
            clientRetention: 0,
            repeatBookings: 0
        },
        weeklyData: [] as AnalyticsData[],
        topServices: [] as Array<{
            name: string;
            bookings: number;
            revenue: number;
            growth: number;
        }>,
        clientAnalytics: {
            newClients: 0,
            returningClients: 0,
            avgClientValue: 0,
            clientSatisfaction: 0
        }
    });

    // Fetch analytics data
    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                setLoading(true);
                const [overviewRes, weeklyRes, servicesRes, clientsRes] = await Promise.all([
                    fetch(`/api/provider/analytics/overview?period=${selectedPeriod}`),
                    fetch(`/api/provider/analytics/weekly?period=${selectedPeriod}`),
                    fetch(`/api/provider/analytics/services?period=${selectedPeriod}`),
                    fetch(`/api/provider/analytics/clients?period=${selectedPeriod}`)
                ]);

                if (overviewRes.ok) {
                    const overview = await overviewRes.json();
                    setAnalytics(prev => ({ ...prev, overview }));
                }

                if (weeklyRes.ok) {
                    const weeklyData = await weeklyRes.json();
                    setAnalytics(prev => ({ ...prev, weeklyData }));
                }

                if (servicesRes.ok) {
                    const topServices = await servicesRes.json();
                    setAnalytics(prev => ({ ...prev, topServices }));
                }

                if (clientsRes.ok) {
                    const clientAnalytics = await clientsRes.json();
                    setAnalytics(prev => ({ ...prev, clientAnalytics }));
                }
            } catch (error) {
                console.error('Error fetching analytics:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [selectedPeriod]);

    const metricCards: MetricCard[] = [
        {
            title: 'Profile Views',
            value: analytics.overview.totalViews.toLocaleString(),
            change: 0, // Calculate from API data
            icon: '👁️',
            gradient: 'from-blue-500 to-cyan-500'
        },
        {
            title: 'Booking Rate',
            value: `${analytics.overview.conversionRate.toFixed(1)}%`,
            change: 0, // Calculate from API data
            icon: '📈',
            gradient: 'from-green-500 to-emerald-500'
        },
        {
            title: 'Avg Rating',
            value: analytics.overview.avgRating.toFixed(1),
            change: 0, // Calculate from API data
            icon: '⭐',
            gradient: 'from-yellow-500 to-orange-500'
        },
        {
            title: 'Response Time',
            value: `${analytics.overview.responseTime}m`,
            change: 0, // Calculate from API data
            icon: '⚡',
            gradient: 'from-purple-500 to-pink-500'
        }
    ];

    const getMaxValue = (data: AnalyticsData[], key: keyof AnalyticsData) => {
        return data.length > 0 ? Math.max(...data.map(d => Number(d[key]))) : 1;
    };

    const periods = [
        { id: '7days', label: '7 Days' },
        { id: '30days', label: '30 Days' },
        { id: '3months', label: '3 Months' },
        { id: '1year', label: '1 Year' }
    ];

    const tabs = [
        { id: 'overview', label: 'Overview', icon: '📊' },
        { id: 'performance', label: 'Performance', icon: '🎯' },
        { id: 'clients', label: 'Clients', icon: '👥' },
        { id: 'revenue', label: 'Revenue', icon: '💰' }
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 dark:from-slate-900 dark:via-gray-900 dark:to-slate-800 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">Loading analytics...</p>
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
                                <span className="text-gray-900 dark:text-white">Analytics</span>
                                <span className="block text-gradient-mixed animate-gradient-x">Business Intelligence 📊</span>
                            </h1>
                            <p className="text-lg text-gray-600 dark:text-gray-400">
                                Track your performance and optimize your business
                            </p>
                        </div>
                        <div className="mt-4 md:mt-0 flex items-center space-x-3">
                            <div className="flex bg-gradient-to-r from-gray-100/80 to-gray-200/80 dark:from-gray-700/50 dark:to-gray-600/50 rounded-lg p-1">
                                {periods.map((period) => (
                                    <button
                                        key={period.id}
                                        onClick={() => setSelectedPeriod(period.id as any)}
                                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-300 ${selectedPeriod === period.id
                                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105'
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-600/50'
                                            }`}
                                    >
                                        {period.label}
                                    </button>
                                ))}
                            </div>
                            <button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg text-sm">
                                📈 Export Data
                            </button>
                        </div>
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {metricCards.map((metric, index) => (
                        <div
                            key={index}
                            className="relative group animate-fadeInUp"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className={`absolute -inset-1 bg-gradient-to-r ${metric.gradient} rounded-xl opacity-25 group-hover:opacity-40 blur transition-opacity`}></div>
                            <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{metric.title}</h3>
                                    <div className={`p-2 bg-gradient-to-r ${metric.gradient.replace('500', '100')} rounded-lg group-hover:scale-110 transition-transform`}>
                                        <span className="text-xl">{metric.icon}</span>
                                    </div>
                                </div>
                                <p className={`text-2xl font-bold bg-gradient-to-r ${metric.gradient} bg-clip-text text-transparent`}>
                                    {metric.value}
                                </p>
                                {metric.change !== 0 && (
                                    <div className={`flex items-center space-x-1 mt-2 ${metric.change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                        }`}>
                                        <svg className={`w-4 h-4 ${metric.change >= 0 ? 'animate-bounce' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                                        </svg>
                                        <span className="text-sm font-medium">
                                            {metric.change >= 0 ? '+' : ''}{metric.change}%
                                        </span>
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
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setSelectedMetric(tab.id as any)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 ${selectedMetric === tab.id
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
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Chart */}
                    <div className="lg:col-span-2 relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl opacity-20 group-hover:opacity-30 blur transition-opacity"></div>
                        <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                                    Performance Overview 📈
                                </h3>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    {selectedPeriod === '7days' ? 'Last 7 days' :
                                        selectedPeriod === '30days' ? 'Last 30 days' :
                                            selectedPeriod === '3months' ? 'Last 3 months' : 'Last year'}
                                </div>
                            </div>

                            {/* Chart Area */}
                            {analytics.weeklyData.length > 0 ? (
                                <div className="space-y-6">
                                    {/* Views Chart */}
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">Profile Views</h4>
                                        <div className="space-y-2">
                                            {analytics.weeklyData.map((data, index) => (
                                                <div
                                                    key={data.period}
                                                    className="flex items-center space-x-4 animate-fadeInUp"
                                                    style={{ animationDelay: `${index * 100}ms` }}
                                                >
                                                    <div className="w-12 text-sm font-medium text-gray-600 dark:text-gray-400">
                                                        {data.period}
                                                    </div>
                                                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6 relative overflow-hidden">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-3"
                                                            style={{ width: `${(data.views / getMaxValue(analytics.weeklyData, 'views')) * 100}%` }}
                                                        >
                                                            <span className="text-white text-xs font-medium">
                                                                {data.views}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="w-16 text-right">
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                                            {data.bookings} bookings
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Revenue Chart */}
                                    <div className="pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
                                        <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">Revenue</h4>
                                        <div className="space-y-2">
                                            {analytics.weeklyData.map((data, index) => (
                                                <div
                                                    key={`revenue-${data.period}`}
                                                    className="flex items-center space-x-4 animate-fadeInUp"
                                                    style={{ animationDelay: `${(index + 7) * 100}ms` }}
                                                >
                                                    <div className="w-12 text-sm font-medium text-gray-600 dark:text-gray-400">
                                                        {data.period}
                                                    </div>
                                                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6 relative overflow-hidden">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-3"
                                                            style={{ width: `${(data.revenue / getMaxValue(analytics.weeklyData, 'revenue')) * 100}%` }}
                                                        >
                                                            <span className="text-white text-xs font-medium">
                                                                GH₵{data.revenue}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="w-16 text-right">
                                                        <div className="flex items-center justify-end space-x-1">
                                                            {[...Array(5)].map((_, i) => (
                                                                <svg
                                                                    key={i}
                                                                    className={`w-2 h-2 ${i < Math.floor(data.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'}`}
                                                                    viewBox="0 0 20 20"
                                                                >
                                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                                </svg>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="text-6xl mb-4">📊</div>
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Analytics Data</h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                                        Start receiving bookings to see your performance analytics
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

                    {/* Side Panel */}
                    <div className="space-y-8">
                        {/* Top Services */}
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl opacity-20 group-hover:opacity-30 blur transition-opacity"></div>
                            <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-6">
                                <h3 className="text-xl font-semibold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-6">
                                    Top Services 🏆
                                </h3>

                                {analytics.topServices.length > 0 ? (
                                    <div className="space-y-4">
                                        {analytics.topServices.map((service, index) => (
                                            <div
                                                key={service.name}
                                                className="p-3 rounded-lg bg-gradient-to-r from-gray-50/80 to-gray-100/80 dark:from-gray-700/50 dark:to-gray-600/50 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 hover:scale-105 transition-all duration-300 animate-fadeInUp"
                                                style={{ animationDelay: `${index * 100}ms` }}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                                                        {service.name}
                                                    </h4>
                                                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${service.growth >= 0
                                                        ? 'text-green-600 dark:text-green-400 bg-green-100/50 dark:bg-green-900/30'
                                                        : 'text-red-600 dark:text-red-400 bg-red-100/50 dark:bg-red-900/30'
                                                        }`}>
                                                        {service.growth >= 0 ? '+' : ''}{service.growth}%
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-600 dark:text-gray-400">
                                                        {service.bookings} bookings
                                                    </span>
                                                    <span className="font-medium text-green-600 dark:text-green-400">
                                                        GH₵{service.revenue.toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="text-4xl mb-2">🏆</div>
                                        <p className="text-gray-600 dark:text-gray-400">No service data yet</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                                            Create services to see performance
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Client Analytics */}
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl opacity-20 group-hover:opacity-30 blur transition-opacity"></div>
                            <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-6">
                                <h3 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
                                    Client Insights 👥
                                </h3>

                                <div className="space-y-4">
                                    {[
                                        { label: 'New Clients', value: analytics.clientAnalytics.newClients, icon: '👤', gradient: 'from-blue-500 to-cyan-500' },
                                        { label: 'Returning Clients', value: analytics.clientAnalytics.returningClients, icon: '🔄', gradient: 'from-green-500 to-emerald-500' },
                                        { label: 'Avg Client Value', value: `GH₵${analytics.clientAnalytics.avgClientValue.toFixed(2)}`, icon: '💰', gradient: 'from-yellow-500 to-orange-500' },
                                        { label: 'Satisfaction', value: `${analytics.clientAnalytics.clientSatisfaction}%`, icon: '😊', gradient: 'from-purple-500 to-pink-500' }
                                    ].map((metric, index) => (
                                        <div
                                            key={metric.label}
                                            className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-gray-50/80 to-gray-100/80 dark:from-gray-700/50 dark:to-gray-600/50 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 hover:scale-105 transition-all duration-300 animate-fadeInUp"
                                            style={{ animationDelay: `${index * 100}ms` }}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className={`p-2 bg-gradient-to-r ${metric.gradient.replace('500', '100')} rounded-lg`}>
                                                    <span className="text-lg">{metric.icon}</span>
                                                </div>
                                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {metric.label}
                                                </span>
                                            </div>
                                            <span className={`font-bold bg-gradient-to-r ${metric.gradient} bg-clip-text text-transparent`}>
                                                {metric.value}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
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