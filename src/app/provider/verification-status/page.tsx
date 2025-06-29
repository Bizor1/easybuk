'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function VerificationStatusPage() {
    const { user } = useAuth();
    const [setupStatus, setSetupStatus] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSetupStatus();
    }, []);

    const fetchSetupStatus = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/provider/setup-status');
            if (response.ok) {
                const status = await response.json();
                setSetupStatus(status);
            }
        } catch (error) {
            console.error('Failed to fetch setup status:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
            case 'verified':
                return '✅';
            case 'under_review':
                return '⏳';
            case 'rejected':
                return '❌';
            default:
                return '⭕';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'completed':
                return 'Completed';
            case 'verified':
                return 'Verified';
            case 'under_review':
                return 'Under Review';
            case 'rejected':
                return 'Rejected';
            default:
                return 'Pending';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
            case 'verified':
                return 'text-green-600 bg-green-50 border-green-200';
            case 'under_review':
                return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'rejected':
                return 'text-red-600 bg-red-50 border-red-200';
            default:
                return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const steps = [
        {
            id: 'email',
            title: 'Email Verification',
            description: 'Verify your email address',
            icon: '✉️'
        },
        {
            id: 'bank',
            title: 'Payment Details',
            description: 'Bank or mobile money information',
            icon: '💳'
        },
        {
            id: 'services',
            title: 'Service Categories',
            description: 'Selected service offerings',
            icon: '⚡'
        },
        {
            id: 'documents',
            title: 'Document Verification',
            description: 'ID documents and selfie verification',
            icon: '📄'
        }
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-600 text-lg">Loading verification status...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-4">
                            <Link href="/provider/dashboard" className="text-gray-600 hover:text-gray-900">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </Link>
                            <h1 className="text-xl font-semibold text-gray-900">Verification Status</h1>
                        </div>
                        <button
                            onClick={fetchSetupStatus}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                            Refresh Status
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Overall Status */}
                <div className="mb-8">
                    <div className="bg-white rounded-xl shadow-lg p-6 border">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold text-gray-900">Account Verification Status</h2>
                            <div className="text-right">
                                <div className="text-sm text-gray-600">Last Updated</div>
                                <div className="text-sm font-medium text-gray-900">
                                    {new Date().toLocaleDateString('en-US', {
                                        weekday: 'short',
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </div>
                            </div>
                        </div>

                        {setupStatus?.documents === 'under_review' && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="text-yellow-600">
                                        <svg className="w-6 h-6 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-yellow-800">Documents Under Review</h3>
                                        <p className="text-yellow-700 text-sm">
                                            Our verification team is reviewing your documents. This typically takes 24-48 hours during business days.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {setupStatus?.documents === 'verified' && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="text-green-600">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-green-800">Verification Complete!</h3>
                                        <p className="text-green-700 text-sm">
                                            Your account is fully verified and ready to accept bookings. 🎉
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {setupStatus?.documents === 'rejected' && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="text-red-600">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-red-800">Documents Need Attention</h3>
                                        <p className="text-red-700 text-sm">
                                            There was an issue with your submitted documents. Please check your email for details and resubmit.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Step by Step Status */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Verification Steps</h3>

                    {steps.map((step, index) => {
                        const status = setupStatus?.[step.id] || 'pending';
                        return (
                            <div key={step.id} className="bg-white rounded-lg shadow border overflow-hidden">
                                <div className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="text-3xl">{step.icon}</div>
                                            <div>
                                                <h4 className="text-lg font-semibold text-gray-900">{step.title}</h4>
                                                <p className="text-gray-600 text-sm">{step.description}</p>
                                            </div>
                                        </div>
                                        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(status)}`}>
                                            <span>{getStatusIcon(status)}</span>
                                            <span>{getStatusText(status)}</span>
                                        </div>
                                    </div>

                                    {/* Special handling for documents step */}
                                    {step.id === 'documents' && status === 'under_review' && (
                                        <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                                            <h5 className="font-medium text-yellow-800 mb-2">What happens next?</h5>
                                            <ul className="text-sm text-yellow-700 space-y-1">
                                                <li>• Our team will verify your ID documents</li>
                                                <li>• We&apos;ll confirm your selfie matches your ID</li>
                                                <li>• You&apos;ll receive an email notification once complete</li>
                                                <li>• If certificates were submitted, they&apos;ll be validated too</li>
                                            </ul>
                                        </div>
                                    )}

                                    {step.id === 'documents' && status === 'rejected' && (
                                        <div className="mt-4 p-4 bg-red-50 rounded-lg">
                                            <h5 className="font-medium text-red-800 mb-2">Common Issues:</h5>
                                            <ul className="text-sm text-red-700 space-y-1">
                                                <li>• Document image quality too low</li>
                                                <li>• ID document expired or unclear</li>
                                                <li>• Selfie doesn&apos;t clearly show ID document</li>
                                                <li>• Missing required certificates for your profession</li>
                                            </ul>
                                            <Link
                                                href="/provider/dashboard"
                                                className="inline-block mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                            >
                                                Resubmit Documents
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Help Section */}
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-3">Need Help?</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                        <div>
                            <h4 className="font-medium mb-2">Verification Timeline</h4>
                            <ul className="space-y-1">
                                <li>• Email: Instant verification</li>
                                <li>• Payment details: Instant</li>
                                <li>• Services: Instant</li>
                                <li>• Documents: 24-48 hours</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-medium mb-2">Contact Support</h4>
                            <ul className="space-y-1">
                                <li>• Email: support@easybuk.com</li>
                                <li>• Phone: +233 XX XXX XXXX</li>
                                <li>• Live chat available 9am-6pm</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Back to Dashboard */}
                <div className="mt-8 text-center">
                    <Link
                        href="/provider/dashboard"
                        className="inline-flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        <span>Back to Dashboard</span>
                    </Link>
                </div>
            </div>
        </div>
    );
} 