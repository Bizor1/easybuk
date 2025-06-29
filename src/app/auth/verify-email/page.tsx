'use client'

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading');
    const [message, setMessage] = useState('');
    const [userRole, setUserRole] = useState<string | null>(null);
    const [redirectPath, setRedirectPath] = useState('/provider/dashboard');

    const getUserInfoAndSetRedirect = useCallback(async () => {
        try {
            console.log('Getting user info for redirect...');
            const userResponse = await fetch('/api/auth/me', {
                credentials: 'include'
            });

            if (userResponse.ok) {
                const userData = await userResponse.json();
                console.log('User data:', userData);

                if (userData.success && userData.user) {
                    const user = userData.user;
                    setUserRole(user.activeRole || user.roles[0]);

                    // Determine redirect path based on user role
                    if (user.roles.includes('PROVIDER')) {
                        setRedirectPath('/provider/dashboard');
                        console.log('Provider user - redirecting to provider dashboard');
                    } else if (user.roles.includes('CLIENT')) {
                        setRedirectPath('/explore');
                        console.log('Client user - redirecting to explore page');
                    } else {
                        setRedirectPath('/provider/dashboard'); // fallback
                        console.log('Unknown role - fallback to provider dashboard');
                    }
                }
            } else {
                console.log('Failed to get user info, using default redirect');
                setRedirectPath('/provider/dashboard'); // fallback
            }
        } catch (error) {
            console.error('Error getting user info:', error);
            setRedirectPath('/provider/dashboard'); // fallback
        }
    }, []);

    const verifyEmail = useCallback(async (verificationToken: string) => {
        try {
            const response = await fetch('/api/auth/verify-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: verificationToken })
            });

            const result = await response.json();

            if (response.ok) {
                setStatus('success');
                setMessage(result.message || 'Email verified successfully!');

                // After successful verification, get user info to determine redirect
                await getUserInfoAndSetRedirect();
            } else {
                setStatus(result.expired ? 'expired' : 'error');
                setMessage(result.error || 'Verification failed');
            }
        } catch (error) {
            setStatus('error');
            setMessage('Network error occurred');
            console.error('Verification error:', error);
        }
    }, [getUserInfoAndSetRedirect]);

    useEffect(() => {
        if (token) {
            verifyEmail(token);
        } else {
            setStatus('error');
            setMessage('Invalid verification link');
        }
    }, [token, verifyEmail]);

    const getStatusIcon = () => {
        switch (status) {
            case 'loading': return '⏳';
            case 'success': return '✅';
            case 'expired': return '⏰';
            case 'error': return '❌';
            default: return '📧';
        }
    };

    const getStatusColor = () => {
        switch (status) {
            case 'loading': return 'text-blue-600';
            case 'success': return 'text-green-600';
            case 'expired': return 'text-yellow-600';
            case 'error': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };

    const getBackgroundColor = () => {
        switch (status) {
            case 'loading': return 'from-blue-50 to-blue-100';
            case 'success': return 'from-green-50 to-green-100';
            case 'expired': return 'from-yellow-50 to-yellow-100';
            case 'error': return 'from-red-50 to-red-100';
            default: return 'from-gray-50 to-gray-100';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center p-6">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="text-6xl mb-4">{getStatusIcon()}</div>
                        <h1 className={`text-3xl font-bold mb-4 ${getStatusColor()}`}>
                            {status === 'loading' && 'Verifying Email...'}
                            {status === 'success' && 'Email Verified!'}
                            {status === 'expired' && 'Link Expired'}
                            {status === 'error' && 'Verification Failed'}
                        </h1>
                        <p className="text-lg text-gray-600">
                            {message}
                        </p>
                    </div>

                    {/* Status specific content */}
                    {status === 'success' && (
                        <div className={`bg-gradient-to-r ${getBackgroundColor()} p-6 rounded-lg border border-green-200 mb-6`}>
                            <h3 className="font-semibold text-green-800 mb-2">What&apos;s Next?</h3>
                            {userRole === 'CLIENT' ? (
                                <ul className="text-green-700 text-sm space-y-1">
                                    <li>✅ Your email is now verified</li>
                                    <li>🔍 Browse available services</li>
                                    <li>📅 Book services from providers</li>
                                    <li>⭐ Leave reviews after completion</li>
                                </ul>
                            ) : (
                                <ul className="text-green-700 text-sm space-y-1">
                                    <li>✅ Your email is now verified</li>
                                    <li>🏦 Complete your bank account setup</li>
                                    <li>⚡ Select your service categories</li>
                                    <li>📄 Upload verification documents</li>
                                </ul>
                            )}
                        </div>
                    )}

                    {status === 'expired' && (
                        <div className={`bg-gradient-to-r ${getBackgroundColor()} p-6 rounded-lg border border-yellow-200 mb-6`}>
                            <h3 className="font-semibold text-yellow-800 mb-2">Link Expired</h3>
                            <p className="text-yellow-700 text-sm">
                                Verification links expire after 24 hours for security. Request a new verification email from your dashboard.
                            </p>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className={`bg-gradient-to-r ${getBackgroundColor()} p-6 rounded-lg border border-red-200 mb-6`}>
                            <h3 className="font-semibold text-red-800 mb-2">Something went wrong</h3>
                            <p className="text-red-700 text-sm">
                                The verification link may be invalid or already used. Try requesting a new verification email.
                            </p>
                        </div>
                    )}

                    {/* Action buttons */}
                    <div className="space-y-4">
                        {status === 'success' && (
                            <Link
                                href={redirectPath}
                                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-6 rounded-lg font-semibold text-center block hover:from-green-700 hover:to-green-800 transition-all duration-300"
                            >
                                {userRole === 'CLIENT' ? 'Explore Services' : 'Continue to Dashboard'}
                            </Link>
                        )}

                        {(status === 'expired' || status === 'error') && (
                            <Link
                                href={redirectPath}
                                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-lg font-semibold text-center block hover:from-blue-700 hover:to-blue-800 transition-all duration-300"
                            >
                                {userRole === 'CLIENT' ? 'Go to Explore' : 'Go to Dashboard'}
                            </Link>
                        )}

                        <Link
                            href="/"
                            className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold text-center block hover:bg-gray-200 transition-all duration-300"
                        >
                            Back to Home
                        </Link>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-8">
                    <p className="text-sm text-gray-500">
                        Need help? <Link href="/support" className="text-blue-600 hover:text-blue-500">Contact Support</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center p-6">
                <div className="max-w-md w-full">
                    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
                        <div className="text-center">
                            <div className="text-6xl mb-4">⏳</div>
                            <h1 className="text-3xl font-bold mb-4 text-blue-600">Loading...</h1>
                            <p className="text-lg text-gray-600">Please wait while we verify your email.</p>
                        </div>
                    </div>
                </div>
            </div>
        }>
            <VerifyEmailContent />
        </Suspense>
    );
} 