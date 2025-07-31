'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import SignupForm from '@/components/auth/SignupForm';
import LoginForm from '@/components/auth/LoginForm';
import { UserRole } from '@/types/auth';

function SignupPageContent() {
    const [mode, setMode] = useState<'signup' | 'login'>('signup');
    const [defaultRole, setDefaultRole] = useState<UserRole>('CLIENT');
    const searchParams = useSearchParams();

    useEffect(() => {
        const roleParam = searchParams.get('role');
        if (roleParam === 'provider') {
            setDefaultRole('PROVIDER');
        } else if (roleParam === 'client') {
            setDefaultRole('CLIENT');
        }
    }, [searchParams]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-400/10 to-blue-400/10 dark:from-green-600/5 dark:to-blue-600/5 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-400/10 dark:from-blue-600/5 dark:to-purple-600/5 rounded-full blur-3xl"></div>
            </div>

            <div className="relative w-full max-w-md mx-auto">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center space-x-2 text-2xl font-bold text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors navbar-brand">
                        <Image
                            src="https://res.cloudinary.com/duhfv8nqy/image/upload/v1749030696/easybuklogo_ity2xt.png"
                            alt="EasyBuk Logo"
                            width={40}
                            height={40}
                            className="w-10 h-10"
                        />
                        <span>EasyBuk</span>
                    </Link>
                </div>

                {mode === 'signup' ? (
                    <SignupForm
                        onToggleMode={() => setMode('login')}
                        defaultRole={defaultRole}
                        redirectPath="/"
                    />
                ) : (
                    <LoginForm
                        onToggleMode={() => setMode('signup')}
                        redirectPath="/"
                    />
                )}

                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        By creating an account, you agree to our{' '}
                        <Link href="/terms" className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300">
                            Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link href="/privacy" className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300">
                            Privacy Policy
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function SignupPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-400/10 to-blue-400/10 dark:from-green-600/5 dark:to-blue-600/5 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-400/10 dark:from-blue-600/5 dark:to-purple-600/5 rounded-full blur-3xl"></div>
                </div>
                <div className="relative w-full max-w-md mx-auto">
                    <div className="text-center mb-8">
                        <Link href="/" className="inline-flex items-center space-x-2 text-2xl font-bold text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors navbar-brand">
                            <Image
                                src="https://res.cloudinary.com/duhfv8nqy/image/upload/v1749030696/easybuklogo_ity2xt.png"
                                alt="EasyBuk Logo"
                                width={40}
                                height={40}
                                className="w-10 h-10"
                            />
                            <span>EasyBuk</span>
                        </Link>
                    </div>
                    <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
                        <div className="text-center">
                            <div className="w-8 h-8 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Loading...</h2>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Please wait while we set up the form.</p>
                        </div>
                    </div>
                </div>
            </div>
        }>
            <SignupPageContent />
        </Suspense>
    );
} 