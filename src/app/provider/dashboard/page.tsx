'use client'

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import SimpleNotificationBell from '@/components/SimpleNotificationBell';
import { createPortal } from 'react-dom';

// Import dashboard components
import EarningsCard from '@/components/provider/EarningsCard';
import BookingsCard from '@/components/provider/BookingsCard';
import PerformanceCard from '@/components/provider/PerformanceCard';
import QuickActions from '@/components/provider/QuickActions';
import RecentActivities from '@/components/provider/RecentActivities';
import AvailabilityToggle from '@/components/provider/AvailabilityToggle';
import AccountSetupFlow from '@/components/provider/AccountSetupFlow';

export default function ProviderDashboard() {
    const [performanceData, setPerformanceData] = useState({
        rating: 4.8,
        reviews: 127,
        responseRate: 96
    });

    useEffect(() => {
        const fetchPerformanceData = async () => {
            try {
                const response = await fetch('/api/provider/reviews');
                if (response.ok) {
                    const data = await response.json();
                    setPerformanceData({
                        rating: data.stats.averageRating || 4.8,
                        reviews: data.stats.totalReviews || 127,
                        responseRate: data.stats.responseRate || 96
                    });
                }
            } catch (error) {
                console.error('Error fetching performance data:', error);
            }
        };

        fetchPerformanceData();
    }, []);
    const { user, logout, switchRole, addRole } = useAuth();
    const [isOnline, setIsOnline] = useState(true);
    const [mounted, setMounted] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [setupStatus, setSetupStatus] = useState<any>(null);
    const [showSetupFlow, setShowSetupFlow] = useState(true); // Start with setup flow to avoid flash
    const [isCheckingSetup, setIsCheckingSetup] = useState(true); // Track loading state
    const hasInitialized = useRef(false); // Track if we've already initialized

    const [dashboardData, setDashboardData] = useState({
        earnings: {
            today: 0,
            thisWeek: 0,
            thisMonth: 0,
            total: 0,
            pendingEscrow: 0,
            // New enhanced metrics
            availableBalance: 0,
            pipelineValue: 0,
            totalEarningPower: 0,
            pipelineBookings: 0,
            escrowBookings: 0
        },
        bookings: {
            today: 0,
            upcoming: 0,
            completed: 0,
            cancelled: 0,
            pending: 0
        },
        performance: {
            rating: 0,
            reviews: 0,
            completionRate: 0,
            responseTime: 0
        }
    });

    // Fetch real earnings data
    const fetchEarningsData = async () => {
        try {
            const response = await fetch('/api/provider/earnings/overview', {
                credentials: 'include'
            });

            if (response.ok) {
                const earningsData = await response.json();
                setDashboardData(prev => ({
                    ...prev,
                    earnings: {
                        today: earningsData.today.amount || 0,
                        thisWeek: earningsData.week.amount || 0,
                        thisMonth: earningsData.month.amount || 0,
                        total: earningsData.totalEarnings || 0,
                        pendingEscrow: earningsData.pendingEscrow || 0,
                        // New enhanced metrics
                        availableBalance: earningsData.availableBalance || 0,
                        pipelineValue: earningsData.pipelineValue || 0,
                        totalEarningPower: earningsData.totalEarningPower || 0,
                        pipelineBookings: earningsData.pipelineBookings || 0,
                        escrowBookings: earningsData.escrowBookings || 0
                    }
                }));
            }
        } catch (error) {
            console.error('Error fetching earnings data:', error);
        }
    };

    // Animation on mount
    useEffect(() => {
        setMounted(true);
        fetchSetupStatus();
    }, []);

    // Fetch account setup status
    const fetchSetupStatus = async () => {
        try {
            setIsCheckingSetup(true);
            const response = await fetch('/api/provider/setup-status');
            console.log('Setup status response:', response.status);

            if (response.ok) {
                const status = await response.json();
                console.log('Setup status data:', status);
                setSetupStatus(status);

                // Check if setup is incomplete (excluding documents under review)
                const incompleteSteps = Object.entries(status).filter(([key, value]) => {
                    // Allow documents to be under_review or completed, that's not incomplete
                    if (key === 'documents' && (value === 'under_review' || value === 'completed')) return false;
                    return value !== 'completed' && value !== 'verified';
                });

                const hasIncompleteSteps = incompleteSteps.length > 0;
                console.log('Has incomplete steps:', hasIncompleteSteps);
                console.log('Incomplete steps:', incompleteSteps);
                console.log('All status values:', status);

                // Only show setup flow if there are actually incomplete steps (not just pending verification)
                setShowSetupFlow(hasIncompleteSteps);
            } else {
                console.error('Setup status API error:', response.status);
                // Force show setup flow if API fails
                setShowSetupFlow(true);
            }
        } catch (error) {
            console.error('Failed to fetch setup status:', error);
            // Force show setup flow if API fails
            setShowSetupFlow(true);
        } finally {
            setIsCheckingSetup(false);
        }
    };

    const handleSetupComplete = () => {
        setShowSetupFlow(false);
        setIsCheckingSetup(false);
        fetchSetupStatus(); // Refresh status
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;
            if (!target.closest('.profile-dropdown')) {
                setIsProfileDropdownOpen(false);
            }
        };

        if (isProfileDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isProfileDropdownOpen]);

    // Check if user can add client role (provider-only user)
    const canAddClientRole = user && user.roles.includes('PROVIDER') && !user.roles.includes('CLIENT');

    const handleAddClientRole = async () => {
        if (canAddClientRole) {
            const result = await addRole('CLIENT');
            if (result.success) {
                // Force refresh user data and redirect
                window.location.href = '/client/dashboard';
            }
        }
    };

    // Separate effect for initial setup check
    useEffect(() => {
        if (user && !hasInitialized.current) {
            hasInitialized.current = true;
            fetchSetupStatus();
        }
    }, [user]);

    // Separate effect for dashboard data when setup is complete
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch earnings data
                const earningsResponse = await fetch('/api/provider/earnings/overview', {
                    credentials: 'include'
                });

                if (earningsResponse.ok) {
                    const earningsData = await earningsResponse.json();
                    setDashboardData(prev => ({
                        ...prev,
                        earnings: {
                            today: earningsData.today.amount || 0,
                            thisWeek: earningsData.week.amount || 0,
                            thisMonth: earningsData.month.amount || 0,
                            total: earningsData.totalEarnings || 0,
                            pendingEscrow: earningsData.pendingEscrow || 0,
                            // New enhanced metrics
                            availableBalance: earningsData.availableBalance || 0,
                            pipelineValue: earningsData.pipelineValue || 0,
                            totalEarningPower: earningsData.totalEarningPower || 0,
                            pipelineBookings: earningsData.pipelineBookings || 0,
                            escrowBookings: earningsData.escrowBookings || 0
                        }
                    }));
                }

                // Try to fetch other dashboard stats (if available)
                try {
                    const response = await fetch('/api/provider/dashboard-stats');
                    if (response.ok) {
                        const data = await response.json();
                        setDashboardData(prev => ({
                            ...prev,
                            bookings: data.bookings || prev.bookings,
                            performance: data.performance || prev.performance
                        }));
                    }
                } catch (error) {
                    console.log('Dashboard stats endpoint not available, using earnings only');
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            }
        };

        if (user && !showSetupFlow && !isCheckingSetup) {
            fetchDashboardData();
            fetchEarningsData();
        }
    }, [user, showSetupFlow, isCheckingSetup]);

    // Show loading state while checking setup status
    if (isCheckingSetup) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-600 text-lg">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    // If setup flow should be shown, return only the setup flow
    if (showSetupFlow) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
                <div className="pt-20">
                    <AccountSetupFlow onComplete={handleSetupComplete} />
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
                <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-gradient-to-br from-blue-300/5 to-orange-300/5 rounded-full blur-2xl animate-float"></div>
                <div className="absolute top-1/4 right-1/3 w-24 h-24 bg-gradient-to-br from-orange-300/5 to-blue-300/5 rounded-full blur-2xl animate-float-delayed"></div>
            </div>

            {/* Header */}
            <header className="relative glass backdrop-blur-xl border-b border-white/20 dark:border-gray-700/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo & Breadcrumb */}
                        <div className="flex items-center space-x-4">
                            <Link href="/" className="flex items-center space-x-2 group">
                                <div className="relative">
                                    <Image
                                        src="https://res.cloudinary.com/duhfv8nqy/image/upload/v1749030696/easybuklogo_ity2xt.png"
                                        alt="EasyBuk Logo"
                                        width={32}
                                        height={32}
                                        className="w-8 h-8 transition-transform group-hover:scale-110"
                                    />
                                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-orange-500 rounded-full opacity-0 group-hover:opacity-20 blur transition-opacity"></div>
                                </div>
                                <span className="text-xl font-bold text-gradient-mixed">EasyBuk Pro</span>
                            </Link>
                            <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                                <span>/</span>
                                <span className="animate-fadeInUp">Provider Dashboard</span>
                            </div>
                        </div>

                        {/* Header Actions */}
                        <div className="flex items-center space-x-4">
                            {/* Availability Toggle */}
                            <div className="transform hover:scale-105 transition-transform relative z-10">
                                <AvailabilityToggle isOnline={isOnline} setIsOnline={setIsOnline} />
                            </div>

                            {/* Notifications - Replaced with working component */}
                            <div className="transform hover:scale-105 transition-transform relative z-10">
                                <SimpleNotificationBell userType="PROVIDER" />
                            </div>

                            {/* Profile Dropdown */}
                            <div className="relative profile-dropdown z-20">
                                <button
                                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                                    className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all duration-300 transform hover:scale-105"
                                >
                                    <div className="relative">
                                        <Image
                                            src={user?.image || '/default-avatar.svg'}
                                            alt={user?.name || 'User'}
                                            width={32}
                                            height={32}
                                            className="w-8 h-8 rounded-full ring-2 ring-transparent hover:ring-blue-500/30 transition-all"
                                        />
                                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-orange-500 rounded-full opacity-0 hover:opacity-20 blur transition-opacity"></div>
                                    </div>
                                    <span className="hidden md:block font-medium">{user?.name}</span>
                                    <svg className={`w-4 h-4 transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {/* Dropdown Menu using Portal */}
                                {isProfileDropdownOpen && typeof document !== 'undefined' && createPortal(
                                    <>
                                        {/* Backdrop overlay */}
                                        <div className="fixed inset-0 z-[99998] bg-black/5" onClick={() => setIsProfileDropdownOpen(false)}></div>

                                        {/* Dropdown content - positioned at top right of screen */}
                                        <div className="fixed top-16 right-4 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 transition-all duration-300 z-[99999] backdrop-blur-xl animate-fadeInUp ring-1 ring-black/5 dark:ring-white/5">
                                            <div className="py-2">
                                                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
                                                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Provider Account</p>
                                                </div>

                                                <Link
                                                    href="/provider/profile"
                                                    className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                                    onClick={() => setIsProfileDropdownOpen(false)}
                                                >
                                                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                    Profile Settings
                                                </Link>

                                                <Link
                                                    href="/provider/analytics"
                                                    className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                                    onClick={() => setIsProfileDropdownOpen(false)}
                                                >
                                                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                    </svg>
                                                    Analytics
                                                </Link>

                                                {/* Role Switching Section */}
                                                {user && user.roles.includes('CLIENT') && user.roles.includes('PROVIDER') && (
                                                    <>
                                                        <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                                                        <div className="px-4 py-2">
                                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Switch Role</p>
                                                            {user.roles.filter(role => role !== user.activeRole && role !== 'ADMIN').map((role) => (
                                                                <button
                                                                    key={role}
                                                                    onClick={async () => {
                                                                        setIsProfileDropdownOpen(false);
                                                                        const result = await switchRole(role);
                                                                        if (result.success) {
                                                                            // Redirect to appropriate dashboard
                                                                            const redirectPath = role === 'CLIENT' ? '/client/dashboard' :
                                                                                role === 'PROVIDER' ? '/provider/dashboard' : '/explore';
                                                                            window.location.href = redirectPath;
                                                                        }
                                                                    }}
                                                                    className="flex items-center w-full px-2 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors mb-1"
                                                                >
                                                                    <svg className="w-4 h-4 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                                                    </svg>
                                                                    Switch to {role === 'CLIENT' ? 'Client' : role === 'PROVIDER' ? 'Provider' : 'User'}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </>,
                                    document.body
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Document Verification Status Banner */}
                {setupStatus && setupStatus.documents === 'under_review' && (
                    <div className="mb-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 rounded-lg p-6 shadow-lg">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                                        <svg className="w-6 h-6 text-yellow-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-yellow-800 mb-1">
                                        📄 Document Verification in Progress
                                    </h3>
                                    <p className="text-yellow-700 text-sm mb-2">
                                        Your documents are being reviewed by our verification team. This usually takes 24-48 hours.
                                    </p>
                                    <div className="flex items-center space-x-4 text-sm">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                            <span className="text-yellow-700">You can set up your profile & services</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                                            <span className="text-yellow-700">Bookings disabled until verified</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col space-y-2">
                                <Link
                                    href="/provider/verification-status"
                                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors text-center"
                                >
                                    Check Status
                                </Link>
                                <Link
                                    href="/provider/services/create"
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors text-center"
                                >
                                    Create Service
                                </Link>
                            </div>
                        </div>
                    </div>
                )}



                {/* Only show verification completed banner, not setup completion since that happens early */}
                {setupStatus && setupStatus.documents === 'verified' && (
                    <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-400 rounded-lg p-6 shadow-lg">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-green-800 mb-1">
                                        ✅ Document Verification Complete!
                                    </h3>
                                    <p className="text-green-700 text-sm">
                                        Your identity has been verified successfully. You can now accept bookings and receive payments! 🎉
                                    </p>
                                </div>
                            </div>
                            <Link
                                href="/provider/services/create"
                                className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 transition-all"
                            >
                                Create Service
                            </Link>
                        </div>
                    </div>
                )}

                {/* Welcome Section */}
                <div className={`mb-8 transform transition-all duration-700 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="relative">
                            <h1 className="text-4xl md:text-5xl font-bold mb-2">
                                <span className="text-gray-900 dark:text-white">Welcome back,</span>
                                <span className="block text-gradient-mixed animate-gradient-x">
                                    {user?.name?.split(' ')[0] || 'Provider'}!
                                </span>
                            </h1>
                            <p className="text-lg text-gray-600 dark:text-gray-400 animate-fadeInUp delay-300">
                                Here&apos;s what&apos;s happening with your business today ✨
                            </p>
                        </div>
                        <div className={`mt-4 md:mt-0 flex items-center space-x-3 transform transition-all duration-500 delay-500 ${mounted ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
                            {/* Role Switcher - Only show if user has both roles */}
                            {user && user.roles.includes('CLIENT') && user.roles.includes('PROVIDER') && (
                                <button
                                    onClick={async () => {
                                        const result = await switchRole('CLIENT');
                                        if (result.success) {
                                            window.location.href = '/client/dashboard';
                                        }
                                    }}
                                    className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl animate-pulse hover:animate-none"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                    </svg>
                                    <span>👤 Switch to Client Mode</span>
                                </button>
                            )}
                            <div className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium backdrop-blur-md border transition-all duration-300 hover:scale-105 ${isOnline
                                ? 'bg-gradient-to-r from-green-100/80 to-green-200/80 text-green-800 border-green-200/50 dark:from-green-900/30 dark:to-green-800/30 dark:text-green-400 dark:border-green-700/50'
                                : 'bg-gradient-to-r from-gray-100/80 to-gray-200/80 text-gray-800 border-gray-200/50 dark:from-gray-700/30 dark:to-gray-600/30 dark:text-gray-300 dark:border-gray-600/50'
                                }`}>
                                <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                                <span>{isOnline ? 'Online & Ready' : 'Offline'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Financial Overview Grid */}
                <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8 transform transition-all duration-700 delay-200 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>

                    {/* Available Balance Card */}
                    <div className="relative group transform hover:scale-105 transition-all duration-300" title="Money you can withdraw right now">
                        <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl opacity-25 group-hover:opacity-40 blur transition-opacity"></div>
                        <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-4 hover:shadow-2xl transition-all duration-300 cursor-help">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Available Balance</h3>
                                <div className="p-1.5 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg group-hover:scale-110 transition-transform">
                                    <span className="text-lg">💳</span>
                                </div>
                            </div>
                            <p className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                GH₵{dashboardData.earnings.availableBalance.toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Ready to withdraw now 💰
                            </p>
                            {/* Hover hint */}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-50">
                                <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap shadow-xl">
                                    Funds from completed jobs that have been released from escrow
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pending Escrow Card */}
                    <div className="relative group transform hover:scale-105 transition-all duration-300 delay-100" title="Money from completed jobs waiting for 48-hour release">
                        <div className="absolute -inset-1 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl opacity-25 group-hover:opacity-40 blur transition-opacity"></div>
                        <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-4 hover:shadow-2xl transition-all duration-300 cursor-help">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Escrow</h3>
                                <div className="p-1.5 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-lg group-hover:scale-110 transition-transform">
                                    <span className="text-lg">🔒</span>
                                </div>
                            </div>
                            <p className="text-xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                                GH₵{dashboardData.earnings.pendingEscrow.toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {dashboardData.earnings.escrowBookings} jobs releasing soon ⏰
                            </p>
                            {/* Hover hint */}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-50">
                                <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap shadow-xl">
                                    Completed jobs held in escrow - releases automatically after 48 hours
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pipeline Value Card */}
                    <div className="relative group transform hover:scale-105 transition-all duration-300 delay-200" title="Value of active bookings you're working on">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl opacity-25 group-hover:opacity-40 blur transition-opacity"></div>
                        <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-4 hover:shadow-2xl transition-all duration-300 cursor-help">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Pipeline</h3>
                                <div className="p-1.5 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-lg group-hover:scale-110 transition-transform">
                                    <span className="text-lg">⏳</span>
                                </div>
                            </div>
                            <p className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                GH₵{dashboardData.earnings.pipelineValue.toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {dashboardData.earnings.pipelineBookings} active jobs 🚀
                            </p>
                            {/* Hover hint */}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-50">
                                <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap shadow-xl">
                                    Paid bookings you&apos;re currently working on - complete them to earn!
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Total Earning Power Card */}
                    <div className="relative group transform hover:scale-105 transition-all duration-300 delay-300" title="Your complete earning potential">
                        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl opacity-25 group-hover:opacity-40 blur transition-opacity"></div>
                        <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-4 hover:shadow-2xl transition-all duration-300 cursor-help">
                            {/* Growth indicator positioned absolutely to not affect height */}
                            <div className="absolute top-2 right-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-medium px-2 py-1 rounded-full flex items-center space-x-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                                </svg>
                                <span>+8%</span>
                            </div>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Earning Power</h3>
                                <div className="p-1.5 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg group-hover:scale-110 transition-transform">
                                    <span className="text-lg">🎯</span>
                                </div>
                            </div>
                            <p className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                GH₵{dashboardData.earnings.totalEarningPower.toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Your complete value 💪
                            </p>
                            {/* Hover hint */}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-50">
                                <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap shadow-xl">
                                    Available + Pending + Pipeline = Your total earning potential
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Performance Card (keeping existing) */}
                    <div className="transform hover:scale-105 transition-all duration-300 delay-400">
                        <PerformanceCard performance={{
                            rating: performanceData.rating,
                            reviews: performanceData.reviews,
                            completionRate: performanceData.responseRate,
                            responseTime: 45
                        }} />
                    </div>
                </div>

                {/* Client Role Addition Card */}
                {canAddClientRole && (
                    <div className={`mb-8 transform transition-all duration-700 delay-500 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-blue-600 rounded-xl opacity-25 group-hover:opacity-40 blur transition-opacity"></div>
                            <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-6 hover:shadow-2xl transition-all duration-300">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="p-4 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl text-white">
                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
                                                👥 Start Hiring as a Client
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-300 mb-3">
                                                Need services for yourself or your business? Access 50,000+ verified professionals on EasyBuk.
                                            </p>
                                            <div className="flex items-center space-x-6 text-sm">
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                    <span className="text-gray-600 dark:text-gray-300">Instant booking</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                    <span className="text-gray-600 dark:text-gray-300">Verified professionals</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                                    <span className="text-gray-600 dark:text-gray-300">Secure payments</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col space-y-3">
                                        <button
                                            onClick={handleAddClientRole}
                                            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                                        >
                                            Add Client Role
                                        </button>
                                        <Link
                                            href="/explore"
                                            className="text-green-600 dark:text-green-400 hover:underline text-sm font-medium text-center"
                                        >
                                            Browse Services
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Content Grid */}
                <div className={`grid grid-cols-1 lg:grid-cols-3 gap-8 transform transition-all duration-700 delay-400 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                    {/* Left Column - Recent Activities & Quick Actions */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="transform hover:scale-[1.02] transition-all duration-300">
                            <QuickActions />
                        </div>
                        <div className="transform hover:scale-[1.02] transition-all duration-300">
                            <RecentActivities />
                        </div>
                    </div>

                    {/* Right Column - Calendar & Insights */}
                    <div className="space-y-8">
                        {/* Enhanced Today's Schedule */}
                        <div className="relative group transform hover:scale-105 transition-all duration-300">
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl opacity-25 group-hover:opacity-40 blur transition-opacity"></div>
                            <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-6 hover:shadow-2xl transition-all duration-300">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Today&apos;s Schedule</h3>
                                    <Link href="/provider/calendar" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium transition-colors hover:scale-110 transform">
                                        View All →
                                    </Link>
                                </div>

                                <div className="space-y-3">
                                    <div className="text-center py-8">
                                        <div className="text-4xl mb-2">📅</div>
                                        <p className="text-gray-600 dark:text-gray-400">No appointments scheduled</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                                            Your today&apos;s schedule will appear here
                                        </p>
                                    </div>
                                </div>

                                <Link href="/provider/calendar" className="mt-4 w-full bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-600 dark:text-blue-400 py-3 px-4 rounded-lg text-sm font-medium text-center block hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-900/50 dark:hover:to-purple-900/50 transition-all duration-300 transform hover:scale-105 backdrop-blur-sm">
                                    ⚡ Manage Schedule
                                </Link>
                            </div>
                        </div>

                        {/* Enhanced Performance Insights */}
                        <div className="relative group transform hover:scale-105 transition-all duration-300">
                            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl opacity-25 group-hover:opacity-40 blur transition-opacity"></div>
                            <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-6 hover:shadow-2xl transition-all duration-300">
                                <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">Performance Insights 📊</h3>

                                <div className="space-y-4">
                                    <div className="text-center py-4">
                                        <div className="text-4xl mb-2">📊</div>
                                        <p className="text-gray-600 dark:text-gray-400">Performance insights coming soon</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                                            Track your profile views and booking rates
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-pink-50/50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20 transition-all duration-300 animate-fadeInUp transform hover:scale-105" style={{ animationDelay: '300ms' }}>
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Average Rating</span>
                                        <div className="flex items-center space-x-1">
                                            <span className="text-sm font-medium text-gray-900 dark:text-white" id="provider-rating">{performanceData.rating.toFixed(1)}</span>
                                            <div className="flex text-yellow-400">
                                                {[...Array(5)].map((_, i) => (
                                                    <svg
                                                        key={i}
                                                        className="w-3 h-3 fill-current hover:scale-125 transition-transform"
                                                        viewBox="0 0 20 20"
                                                        style={{ animationDelay: `${i * 100}ms` }}
                                                    >
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <Link href="/provider/analytics" className="mt-4 w-full bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-600 dark:text-purple-400 py-3 px-4 rounded-lg text-sm font-medium text-center block hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-900/50 dark:hover:to-pink-900/50 transition-all duration-300 transform hover:scale-105 backdrop-blur-sm">
                                    🚀 View Full Analytics
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 