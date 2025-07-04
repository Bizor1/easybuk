'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SigninPage() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to the actual login page
        router.replace('/auth/login');
    }, [router]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Redirecting to login...</p>
            </div>
        </div>
    );
} 