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
            <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h2>
                    <p className="text-gray-600">Loading...</p>
                </div>
                <div className="animate-pulse space-y-6">
                    <div className="h-12 bg-gray-200 rounded-lg"></div>
                    <div className="h-12 bg-gray-200 rounded-lg"></div>
                    <div className="h-12 bg-gray-200 rounded-lg"></div>
                    <div className="h-12 bg-gray-200 rounded-lg"></div>
                    <div className="h-12 bg-gray-200 rounded-lg"></div>
                </div>
            </div>
        }>
            <SignupFormSuspended onToggleMode={onToggleMode} defaultRole={defaultRole} redirectPath={redirectPath} />
        </Suspense>
    );
} 