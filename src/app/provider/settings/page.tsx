'use client'

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function ProviderSettingsPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');

    const tabs = [
        { id: 'profile', label: 'Profile Settings', icon: '👤' },
        { id: 'notifications', label: 'Notifications', icon: '🔔' },
        { id: 'privacy', label: 'Privacy & Security', icon: '🔒' },
        { id: 'billing', label: 'Billing & Payments', icon: '💳' },
        { id: 'preferences', label: 'Preferences', icon: '⚙️' }
    ];

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
                    <h1 className="text-4xl font-bold mb-2">
                        <span className="text-gray-900 dark:text-white">Settings</span>
                        <span className="block text-gradient-mixed animate-gradient-x">Configuration ⚙️</span>
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        Manage your account settings and preferences
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Settings Navigation */}
                    <div className="lg:col-span-1">
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl opacity-20 group-hover:opacity-30 blur transition-opacity"></div>
                            <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20">
                                <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
                                    <h3 className="font-semibold text-gray-900 dark:text-white">Settings</h3>
                                </div>
                                <nav className="p-2">
                                    {tabs.map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-all duration-200 ${activeTab === tab.id
                                                ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-700/50'
                                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                                }`}
                                        >
                                            <span className="text-lg">{tab.icon}</span>
                                            <span className="font-medium">{tab.label}</span>
                                        </button>
                                    ))}
                                </nav>
                            </div>
                        </div>
                    </div>

                    {/* Settings Content */}
                    <div className="lg:col-span-3">
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl opacity-20 group-hover:opacity-30 blur transition-opacity"></div>
                            <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 min-h-[600px]">

                                {/* Coming Soon Message */}
                                <div className="flex items-center justify-center h-full p-12">
                                    <div className="text-center">
                                        <div className="text-8xl mb-6">🚧</div>
                                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                                            Settings Coming Soon
                                        </h2>
                                        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md">
                                            We&apos;re working hard to bring you comprehensive settings management.
                                            This feature will be available in the next update.
                                        </p>

                                        {/* Current User Info */}
                                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200/50 dark:border-blue-700/50">
                                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                                Current Account
                                            </h3>
                                            <div className="space-y-2 text-left">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600 dark:text-gray-400">Name:</span>
                                                    <span className="font-medium text-gray-900 dark:text-white">
                                                        {user?.name || 'Not set'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600 dark:text-gray-400">Email:</span>
                                                    <span className="font-medium text-gray-900 dark:text-white">
                                                        {user?.email || 'Not set'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600 dark:text-gray-400">Role:</span>
                                                    <span className="font-medium text-blue-600 dark:text-blue-400">
                                                        {user?.activeRole || 'Not set'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Features Preview */}
                                        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                                            <div className="bg-white/50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200/50 dark:border-gray-600/50">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <span className="text-lg">👤</span>
                                                    <h4 className="font-semibold text-gray-900 dark:text-white">Profile Management</h4>
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    Update your personal information, profile picture, and bio
                                                </p>
                                            </div>

                                            <div className="bg-white/50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200/50 dark:border-gray-600/50">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <span className="text-lg">🔔</span>
                                                    <h4 className="font-semibold text-gray-900 dark:text-white">Notifications</h4>
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    Control email and push notification preferences
                                                </p>
                                            </div>

                                            <div className="bg-white/50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200/50 dark:border-gray-600/50">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <span className="text-lg">🔒</span>
                                                    <h4 className="font-semibold text-gray-900 dark:text-white">Privacy & Security</h4>
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    Manage password, two-factor authentication, and privacy settings
                                                </p>
                                            </div>

                                            <div className="bg-white/50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200/50 dark:border-gray-600/50">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <span className="text-lg">💳</span>
                                                    <h4 className="font-semibold text-gray-900 dark:text-white">Billing & Payments</h4>
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    Manage payment methods, billing history, and subscription
                                                </p>
                                            </div>
                                        </div>
                                    </div>
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