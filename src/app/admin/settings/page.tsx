'use client';

import { useState } from 'react';
import {
    CogIcon,
    CreditCardIcon,
    BellIcon,
    ShieldCheckIcon,
    GlobeAltIcon,
    UserGroupIcon,
    EnvelopeIcon,
    PhoneIcon
} from '@heroicons/react/24/outline';

export default function AdminSettings() {
    const [activeTab, setActiveTab] = useState('general');
    const [settings, setSettings] = useState({
        general: {
            platformName: 'EasyBuk',
            platformDescription: 'Professional Services Marketplace',
            supportEmail: 'support@easybuk.com',
            supportPhone: '+233 XX XXX XXXX',
            timezone: 'Africa/Accra',
            currency: 'GHS',
            language: 'English'
        },
        payments: {
            commissionRate: 15,
            paymentHoldDays: 7,
            minimumPayout: 50,
            paymentMethods: {
                momo: true,
                card: true,
                bank: true
            },
            autoReleasePayments: true
        },
        notifications: {
            emailNotifications: true,
            smsNotifications: true,
            pushNotifications: true,
            adminAlerts: true,
            disputeAlerts: true,
            paymentAlerts: true
        },
        security: {
            twoFactorRequired: false,
            sessionTimeout: 30,
            passwordMinLength: 8,
            verificationRequired: true,
            autoSuspendUnverified: 30
        },
        features: {
            userRegistration: true,
            providerVerification: true,
            instantBooking: true,
            scheduledBooking: true,
            disputeSystem: true,
            ratingSystem: true
        }
    });

    const handleSettingChange = (category: string, setting: string, value: any) => {
        setSettings(prev => ({
            ...prev,
            [category]: {
                ...prev[category as keyof typeof prev],
                [setting]: value
            }
        }));
    };

    const handleNestedSettingChange = (category: string, parent: string, setting: string, value: any) => {
        setSettings(prev => ({
            ...prev,
            [category]: {
                ...prev[category as keyof typeof prev],
                [parent]: {
                    ...(prev[category as keyof typeof prev] as any)[parent],
                    [setting]: value
                }
            }
        }));
    };

    const saveSettings = () => {
        // Mock save functionality
        alert('Settings saved successfully!');
    };

    const tabs = [
        { id: 'general', name: 'General', icon: CogIcon },
        { id: 'payments', name: 'Payments', icon: CreditCardIcon },
        { id: 'notifications', name: 'Notifications', icon: BellIcon },
        { id: 'security', name: 'Security', icon: ShieldCheckIcon },
        { id: 'features', name: 'Features', icon: GlobeAltIcon }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="border-b border-gray-200 pb-4">
                <h1 className="text-3xl font-bold text-gray-900">Platform Settings</h1>
                <p className="mt-1 text-sm text-gray-600">
                    Configure platform settings, payment options, notifications, and security preferences
                </p>
            </div>

            <div className="flex space-x-8">
                {/* Sidebar Navigation */}
                <div className="w-64 flex-shrink-0">
                    <nav className="space-y-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`${activeTab === tab.id
                                    ? 'bg-orange-100 text-orange-700 border-orange-300'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                    } group flex items-center px-3 py-2 text-sm font-medium rounded-md border border-transparent w-full text-left`}
                            >
                                <tab.icon className="mr-3 h-5 w-5" />
                                {tab.name}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Settings Content */}
                <div className="flex-1 space-y-6">
                    {/* General Settings */}
                    {activeTab === 'general' && (
                        <div className="bg-white shadow rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">General Settings</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Platform Name</label>
                                    <input
                                        type="text"
                                        value={settings.general.platformName}
                                        onChange={(e) => handleSettingChange('general', 'platformName', e.target.value)}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Support Email</label>
                                    <input
                                        type="email"
                                        value={settings.general.supportEmail}
                                        onChange={(e) => handleSettingChange('general', 'supportEmail', e.target.value)}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Support Phone</label>
                                    <input
                                        type="tel"
                                        value={settings.general.supportPhone}
                                        onChange={(e) => handleSettingChange('general', 'supportPhone', e.target.value)}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Default Currency</label>
                                    <select
                                        value={settings.general.currency}
                                        onChange={(e) => handleSettingChange('general', 'currency', e.target.value)}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                                    >
                                        <option value="GHS">Ghana Cedi (GHS)</option>
                                        <option value="USD">US Dollar (USD)</option>
                                        <option value="EUR">Euro (EUR)</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Platform Description</label>
                                    <textarea
                                        value={settings.general.platformDescription}
                                        onChange={(e) => handleSettingChange('general', 'platformDescription', e.target.value)}
                                        rows={3}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Payment Settings */}
                    {activeTab === 'payments' && (
                        <div className="bg-white shadow rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Payment & Commission Settings</h3>
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Commission Rate (%)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="50"
                                            value={settings.payments.commissionRate}
                                            onChange={(e) => handleSettingChange('payments', 'commissionRate', parseInt(e.target.value))}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Payment Hold (Days)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="30"
                                            value={settings.payments.paymentHoldDays}
                                            onChange={(e) => handleSettingChange('payments', 'paymentHoldDays', parseInt(e.target.value))}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Minimum Payout</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={settings.payments.minimumPayout}
                                            onChange={(e) => handleSettingChange('payments', 'minimumPayout', parseInt(e.target.value))}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-sm font-medium text-gray-900 mb-3">Payment Methods</h4>
                                    <div className="space-y-2">
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={settings.payments.paymentMethods.momo}
                                                onChange={(e) => handleNestedSettingChange('payments', 'paymentMethods', 'momo', e.target.checked)}
                                                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                                            />
                                            <span className="ml-2 text-sm text-gray-700">Mobile Money</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={settings.payments.paymentMethods.card}
                                                onChange={(e) => handleNestedSettingChange('payments', 'paymentMethods', 'card', e.target.checked)}
                                                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                                            />
                                            <span className="ml-2 text-sm text-gray-700">Credit/Debit Cards</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={settings.payments.paymentMethods.bank}
                                                onChange={(e) => handleNestedSettingChange('payments', 'paymentMethods', 'bank', e.target.checked)}
                                                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                                            />
                                            <span className="ml-2 text-sm text-gray-700">Bank Transfer</span>
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={settings.payments.autoReleasePayments}
                                            onChange={(e) => handleSettingChange('payments', 'autoReleasePayments', e.target.checked)}
                                            className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Auto-release payments after hold period</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Notification Settings */}
                    {activeTab === 'notifications' && (
                        <div className="bg-white shadow rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Settings</h3>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-900 mb-3">General Notifications</h4>
                                    <div className="space-y-2">
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={settings.notifications.emailNotifications}
                                                onChange={(e) => handleSettingChange('notifications', 'emailNotifications', e.target.checked)}
                                                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                                            />
                                            <EnvelopeIcon className="ml-2 h-4 w-4 text-gray-400" />
                                            <span className="ml-2 text-sm text-gray-700">Email Notifications</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={settings.notifications.smsNotifications}
                                                onChange={(e) => handleSettingChange('notifications', 'smsNotifications', e.target.checked)}
                                                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                                            />
                                            <PhoneIcon className="ml-2 h-4 w-4 text-gray-400" />
                                            <span className="ml-2 text-sm text-gray-700">SMS Notifications</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={settings.notifications.pushNotifications}
                                                onChange={(e) => handleSettingChange('notifications', 'pushNotifications', e.target.checked)}
                                                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                                            />
                                            <BellIcon className="ml-2 h-4 w-4 text-gray-400" />
                                            <span className="ml-2 text-sm text-gray-700">Push Notifications</span>
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-sm font-medium text-gray-900 mb-3">Admin Alerts</h4>
                                    <div className="space-y-2">
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={settings.notifications.disputeAlerts}
                                                onChange={(e) => handleSettingChange('notifications', 'disputeAlerts', e.target.checked)}
                                                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                                            />
                                            <span className="ml-2 text-sm text-gray-700">New Dispute Alerts</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={settings.notifications.paymentAlerts}
                                                onChange={(e) => handleSettingChange('notifications', 'paymentAlerts', e.target.checked)}
                                                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                                            />
                                            <span className="ml-2 text-sm text-gray-700">Payment Issue Alerts</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Security Settings */}
                    {activeTab === 'security' && (
                        <div className="bg-white shadow rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Security & Verification</h3>
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Session Timeout (minutes)</label>
                                        <input
                                            type="number"
                                            min="5"
                                            max="120"
                                            value={settings.security.sessionTimeout}
                                            onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Minimum Password Length</label>
                                        <input
                                            type="number"
                                            min="6"
                                            max="20"
                                            value={settings.security.passwordMinLength}
                                            onChange={(e) => handleSettingChange('security', 'passwordMinLength', parseInt(e.target.value))}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={settings.security.verificationRequired}
                                            onChange={(e) => handleSettingChange('security', 'verificationRequired', e.target.checked)}
                                            className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Require provider verification</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={settings.security.twoFactorRequired}
                                            onChange={(e) => handleSettingChange('security', 'twoFactorRequired', e.target.checked)}
                                            className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Require two-factor authentication for admins</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Feature Settings */}
                    {activeTab === 'features' && (
                        <div className="bg-white shadow rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Platform Features</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-900 mb-3">User Features</h4>
                                    <div className="space-y-2">
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={settings.features.userRegistration}
                                                onChange={(e) => handleSettingChange('features', 'userRegistration', e.target.checked)}
                                                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                                            />
                                            <span className="ml-2 text-sm text-gray-700">Allow new user registration</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={settings.features.providerVerification}
                                                onChange={(e) => handleSettingChange('features', 'providerVerification', e.target.checked)}
                                                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                                            />
                                            <span className="ml-2 text-sm text-gray-700">Provider verification system</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={settings.features.ratingSystem}
                                                onChange={(e) => handleSettingChange('features', 'ratingSystem', e.target.checked)}
                                                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                                            />
                                            <span className="ml-2 text-sm text-gray-700">Rating & review system</span>
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-sm font-medium text-gray-900 mb-3">Booking Features</h4>
                                    <div className="space-y-2">
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={settings.features.instantBooking}
                                                onChange={(e) => handleSettingChange('features', 'instantBooking', e.target.checked)}
                                                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                                            />
                                            <span className="ml-2 text-sm text-gray-700">Instant booking</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={settings.features.scheduledBooking}
                                                onChange={(e) => handleSettingChange('features', 'scheduledBooking', e.target.checked)}
                                                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                                            />
                                            <span className="ml-2 text-sm text-gray-700">Scheduled booking</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={settings.features.disputeSystem}
                                                onChange={(e) => handleSettingChange('features', 'disputeSystem', e.target.checked)}
                                                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                                            />
                                            <span className="ml-2 text-sm text-gray-700">Dispute resolution system</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Save Button */}
                    <div className="flex justify-end">
                        <button
                            onClick={saveSettings}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                        >
                            Save Settings
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
} 