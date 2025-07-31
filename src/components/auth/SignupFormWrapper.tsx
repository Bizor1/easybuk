'use client';

import { Suspense } from 'react';
import SignupForm from './SignupForm';
import { UserRole } from '@/types/auth';

interface SignupFormWrapperProps {
    onToggleMode?: () => void;
    defaultRole?: UserRole;
    redirectPath?: string;
}

function SignupFormSuspended({ onToggleMode, defaultRole, redirectPath }: SignupFormWrapperProps) {
    return <SignupForm onToggleMode={onToggleMode} defaultRole={defaultRole} redirectPath={redirectPath} />;
}

export default function SignupFormWrapper({ onToggleMode, defaultRole, redirectPath }: SignupFormWrapperProps) {
    return (
        <Suspense fallback={
            <div className="w-full max-w-md mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Create Account</h2>
                    <p className="text-gray-600 dark:text-gray-300">Loading...</p>
                </div>
                <div className="animate-pulse space-y-6">
                    <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                    <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                    <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                    <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                    <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                </div>
            </div>
        }>
            <SignupFormSuspended onToggleMode={onToggleMode} defaultRole={defaultRole} redirectPath={redirectPath} />
        </Suspense>
    );
} 