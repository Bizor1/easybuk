'use client'

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface SetupGuardProps {
    children: React.ReactNode;
    requiredSteps?: string[];
    blockingMessage?: string;
}

export default function SetupGuard({
    children,
    requiredSteps = ['email', 'bank', 'services', 'documents'],
    blockingMessage = "Complete your account setup to access this feature"
}: SetupGuardProps) {
    const [setupStatus, setSetupStatus] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isSetupComplete, setIsSetupComplete] = useState(false);

    const fetchSetupStatus = useCallback(async () => {
        try {
            const response = await fetch('/api/provider/setup-status');
            if (response.ok) {
                const status = await response.json();
                setSetupStatus(status);

                // Check if all required steps are completed
                const allStepsComplete = requiredSteps.every(step => status[step] === 'completed');
                setIsSetupComplete(allStepsComplete);
            }
        } catch (error) {
            console.error('Failed to fetch setup status:', error);
        } finally {
            setLoading(false);
        }
    }, [requiredSteps]);

    useEffect(() => {
        fetchSetupStatus();
    }, [fetchSetupStatus]);

    const getIncompleteSteps = () => {
        if (!setupStatus) return [];
        return requiredSteps.filter(step => setupStatus[step] !== 'completed');
    };

    const getStepName = (step: string) => {
        const stepNames: { [key: string]: string } = {
            email: 'Email Verification',
            bank: 'Bank Account Setup',
            services: 'Service Categories',
            documents: 'Document Verification'
        };
        return stepNames[step] || step;
    };

    const getStepIcon = (step: string) => {
        const stepIcons: { [key: string]: string } = {
            email: '✉️',
            bank: '🏦',
            services: '⚡',
            documents: '📄'
        };
        return stepIcons[step] || '📋';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!isSetupComplete) {
        const incompleteSteps = getIncompleteSteps();

        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 p-6">
                <div className="max-w-2xl mx-auto pt-20">
                    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="text-6xl mb-4">🚫</div>
                            <h1 className="text-3xl font-bold text-gray-800 mb-4">
                                Account Setup Required
                            </h1>
                            <p className="text-lg text-gray-600">
                                {blockingMessage}
                            </p>
                        </div>

                        {/* Steps Status */}
                        <div className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">
                                Complete these steps to continue:
                            </h2>

                            <div className="space-y-3">
                                {requiredSteps.map((step) => {
                                    const isComplete = setupStatus[step] === 'completed';
                                    const isUnderReview = setupStatus[step] === 'under_review';

                                    return (
                                        <div
                                            key={step}
                                            className={`flex items-center p-4 rounded-lg border ${isComplete
                                                ? 'bg-green-50 border-green-200'
                                                : isUnderReview
                                                    ? 'bg-yellow-50 border-yellow-200'
                                                    : 'bg-gray-50 border-gray-200'
                                                }`}
                                        >
                                            <div className="text-2xl mr-4">
                                                {isComplete ? '✅' : isUnderReview ? '⏳' : getStepIcon(step)}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className={`font-semibold ${isComplete ? 'text-green-800' :
                                                    isUnderReview ? 'text-yellow-800' : 'text-gray-800'
                                                    }`}>
                                                    {getStepName(step)}
                                                </h3>
                                                <p className={`text-sm ${isComplete ? 'text-green-600' :
                                                    isUnderReview ? 'text-yellow-600' : 'text-gray-600'
                                                    }`}>
                                                    {isComplete
                                                        ? 'Completed ✓'
                                                        : isUnderReview
                                                            ? 'Under review - pending approval'
                                                            : 'Not completed yet'
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">Setup Progress</span>
                                <span className="text-sm text-gray-500">
                                    {requiredSteps.filter(step => setupStatus[step] === 'completed').length} of {requiredSteps.length} completed
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-gradient-to-r from-blue-600 to-green-600 h-2 rounded-full transition-all duration-500"
                                    style={{
                                        width: `${(requiredSteps.filter(step => setupStatus[step] === 'completed').length / requiredSteps.length) * 100}%`
                                    }}
                                ></div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link
                                href="/provider/dashboard"
                                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-lg font-semibold text-center hover:from-blue-700 hover:to-blue-800 transition-all duration-300 hover:scale-105"
                            >
                                Complete Setup
                            </Link>
                            <Link
                                href="/provider/dashboard"
                                className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold text-center hover:bg-gray-200 transition-all duration-300"
                            >
                                Back to Dashboard
                            </Link>
                        </div>

                        {/* Help Section */}
                        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <h3 className="font-semibold text-blue-800 mb-2">Need Help?</h3>
                            <p className="text-blue-600 text-sm mb-3">
                                Our account setup process ensures you can receive payments and bookings safely.
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <a
                                    href="mailto:support@easybuk.com"
                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium underline"
                                >
                                    Contact Support
                                </a>
                                <span className="text-blue-400">•</span>
                                <a
                                    href="/help/setup-guide"
                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium underline"
                                >
                                    Setup Guide
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // If setup is complete, render the protected content
    return <>{children}</>;
} 