'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { UserRole } from '@/types/auth';

interface SignupFormProps {
    onToggleMode?: () => void;
    defaultRole?: UserRole;
    redirectPath?: string;
}

export default function SignupForm({ onToggleMode, defaultRole = 'CLIENT', redirectPath }: SignupFormProps) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        role: defaultRole,
        agreeToTerms: false
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [googleLoading, setGoogleLoading] = useState(false);

    const { signup } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Check for error messages from URL params (e.g., from OAuth callback)
    useEffect(() => {
        const errorParam = searchParams.get('error');
        if (errorParam) {
            setError(decodeURIComponent(errorParam));
        }
    }, [searchParams]);

    // Function to determine redirect path based on user role
    function getRedirectPath(user: any): string {
        // If a specific redirect path was provided, use it
        if (redirectPath && redirectPath !== 'auto' && redirectPath !== '/') {
            return redirectPath;
        }

        // Check active role first, then fallback to first role
        const role = user.activeRole || user.roles[0];

        switch (role) {
            case 'PROVIDER':
                return '/provider/dashboard';
            case 'CLIENT':
                return '/explore';
            case 'ADMIN':
                return '/admin/dashboard'; // Assuming admin dashboard exists
            default:
                return '/explore'; // Default fallback
        }
    }

    function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (!formData.agreeToTerms) {
            setError('Please agree to the terms and conditions');
            return;
        }

        setLoading(true);

        try {
            const result = await signup({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                phone: formData.phone || undefined,
                role: formData.role as UserRole
            });

            if (result.success) {
                // Get the updated user from the auth context
                const userResponse = await fetch('/api/auth/me', {
                    credentials: 'include'
                });

                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    if (userData.success) {
                        const redirectTo = getRedirectPath(userData.user);
                        router.push(redirectTo);
                        return;
                    }
                }

                // Fallback based on selected role if user data fetch fails
                const fallbackPath = formData.role === 'PROVIDER' ? '/provider/dashboard' : '/explore';
                router.push(fallbackPath);
            } else {
                setError(result.error || 'Signup failed');
            }
        } catch (error) {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    function handleGoogleSignup() {
        setGoogleLoading(true);
        setError('');

        // For Google signup, we'll handle redirect in the callback
        const params = new URLSearchParams({
            role: formData.role,
            redirect: redirectPath || 'auto' // Use 'auto' to trigger role-based redirect
        });

        window.location.href = `/api/auth/google?${params.toString()}`;
    }

    return (
        <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h2>
                <p className="text-gray-600">Join EasyBuk and get started today</p>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                        I want to
                    </label>
                    <select
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                        <option value="CLIENT">Hire professionals (Client)</option>
                        <option value="PROVIDER">Offer my services (Provider)</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                    </label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Enter your full name"
                    />
                </div>

                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Enter your email"
                    />
                </div>

                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number (Optional)
                    </label>
                    <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Enter your phone number"
                    />
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                        Password
                    </label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Create a password"
                    />
                </div>

                <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm Password
                    </label>
                    <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Confirm your password"
                    />
                </div>

                <div className="flex items-start">
                    <input
                        id="agreeToTerms"
                        name="agreeToTerms"
                        type="checkbox"
                        checked={formData.agreeToTerms}
                        onChange={handleInputChange}
                        required
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                    />
                    <label htmlFor="agreeToTerms" className="ml-2 block text-sm text-gray-700">
                        I agree to the{' '}
                        <a href="/terms" className="text-blue-600 hover:text-blue-500">
                            Terms of Service
                        </a>{' '}
                        and{' '}
                        <a href="/privacy" className="text-blue-600 hover:text-blue-500">
                            Privacy Policy
                        </a>
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={loading || googleLoading}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Creating account...
                        </div>
                    ) : (
                        'Create Account'
                    )}
                </button>
            </form>

            <div className="mt-6 text-center">
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">Or continue with</span>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleGoogleSignup}
                    disabled={loading || googleLoading}
                    className="mt-4 w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {googleLoading ? (
                        <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600 mr-2"></div>
                            Connecting to Google...
                        </div>
                    ) : (
                        <>
                            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                                <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Continue with Google
                        </>
                    )}
                </button>
            </div>

            {onToggleMode && (
                <div className="mt-8 text-center">
                    <p className="text-gray-600">
                        Already have an account?{' '}
                        <button
                            onClick={onToggleMode}
                            className="text-blue-600 hover:text-blue-500 font-medium"
                        >
                            Sign in
                        </button>
                    </p>
                </div>
            )}
        </div>
    );
} 