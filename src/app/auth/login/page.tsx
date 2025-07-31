'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import LoginFormWrapper from '@/components/auth/LoginFormWrapper';
import SignupFormWrapper from '@/components/auth/SignupFormWrapper';

export default function LoginPage() {
    const [mode, setMode] = useState<'login' | 'signup'>('login');

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-400/10 dark:from-blue-600/5 dark:to-purple-600/5 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/10 to-pink-400/10 dark:from-purple-600/5 dark:to-pink-600/5 rounded-full blur-3xl"></div>
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

                {mode === 'login' ? (
                    <LoginFormWrapper
                        onToggleMode={() => setMode('signup')}
                        redirectPath="auto"
                    />
                ) : (
                    <SignupFormWrapper
                        onToggleMode={() => setMode('login')}
                        redirectPath="auto"
                    />
                )}

                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        By continuing, you agree to our{' '}
                        <Link href="/terms" className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300">
                            Terms of Service
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
} 