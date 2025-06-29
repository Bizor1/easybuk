'use client';

import { Suspense } from 'react';
import LoginForm from './LoginForm';

interface LoginFormWrapperProps {
    onToggleMode?: () => void;
    redirectPath?: string;
}

function LoginFormSuspended({ onToggleMode, redirectPath }: LoginFormWrapperProps) {
    return <LoginForm onToggleMode={onToggleMode} redirectPath={redirectPath} />;
}

export default function LoginFormWrapper({ onToggleMode, redirectPath }: LoginFormWrapperProps) {
    return (
        <Suspense fallback={
            <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h2>
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
            <LoginFormSuspended onToggleMode={onToggleMode} redirectPath={redirectPath} />
        </Suspense>
    );
} 