'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import NotificationBell from '@/components/NotificationBell';

interface CategoryNavbarProps {
    backText: string;
    backHref: string;
    hoverColor: string;
    bgGradient: string;
}

export default function CategoryNavbar({ backText, backHref, hoverColor, bgGradient }: CategoryNavbarProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { user, logout, loading: authLoading } = useAuth();

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2 sm:space-x-3">
                        <Image
                            src="https://res.cloudinary.com/duhfv8nqy/image/upload/v1749030696/easybuklogo_ity2xt.png"
                            alt="EasyBuk Logo"
                            width={32}
                            height={32}
                            className="w-8 h-8 sm:w-10 sm:h-10"
                        />
                        <span className="text-lg sm:text-2xl font-bold text-gradient-mixed navbar-brand">EasyBuk</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-4">
                        <Link
                            href={backHref}
                            className={`navbar-link text-gray-700 dark:text-gray-300 hover:${hoverColor} transition-colors`}
                        >
                            {backText}
                        </Link>

                        {/* Authentication Section */}
                        {authLoading ? (
                            <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-10 w-20 rounded-lg"></div>
                        ) : user ? (
                            <div className="flex items-center space-x-3">
                                {/* Notification Bell */}
                                <NotificationBell userType={user.roles.includes('PROVIDER') ? 'PROVIDER' : 'CLIENT'} />

                                <div className="flex items-center space-x-2">
                                    <Image
                                        src={user.image || '/default-avatar.svg'}
                                        alt={user.name || 'User'}
                                        width={32}
                                        height={32}
                                        className="w-8 h-8 rounded-full"
                                    />
                                    <div className="relative group">
                                        <button className={`flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:${hoverColor} transition-colors`}>
                                            <span className="text-sm font-medium">{user.name}</span>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>

                                        <div className="profile-dropdown absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                                            <div className="py-2">
                                                <Link
                                                    href={user.roles.includes('PROVIDER') ? '/provider/dashboard' : '/client/dashboard'}
                                                    className="profile-dropdown-item block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                                >
                                                    Dashboard
                                                </Link>
                                                <button
                                                    onClick={logout}
                                                    className="profile-dropdown-item w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                >
                                                    Sign Out
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <Link href="/auth/login" className="navbar-link text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Sign In</Link>
                                <Link href="/auth/signup" className="btn-primary navbar-button">Sign Up</Link>
                                <Link href="/auth/signup?role=provider" className="btn-secondary navbar-button">For Providers</Link>
                            </div>
                        )}

                        <Link href="/contact" className="btn-secondary navbar-button">Contact Us</Link>
                    </div>

                    {/* Mobile Navigation */}
                    <div className="md:hidden flex items-center space-x-2">
                        {/* Notification Bell for Mobile */}
                        {user && (
                            <NotificationBell userType={user.roles.includes('PROVIDER') ? 'PROVIDER' : 'CLIENT'} />
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {isMobileMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg">
                        <div className="px-4 py-3 space-y-3">
                            {/* Back Link */}
                            <Link
                                href={backHref}
                                className="mobile-menu-item flex items-center space-x-2 px-3 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <span>←</span>
                                <span>{backText.replace('← ', '')}</span>
                            </Link>

                            {/* User Section */}
                            {user ? (
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-3 px-3 py-2">
                                        <Image
                                            src={user.image || '/default-avatar.svg'}
                                            alt={user.name || 'User'}
                                            width={32}
                                            height={32}
                                            className="w-8 h-8 rounded-full"
                                        />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                                        </div>
                                    </div>
                                    <Link
                                        href={user.roles.includes('PROVIDER') ? '/provider/dashboard' : '/client/dashboard'}
                                        className="mobile-menu-item flex items-center space-x-2 px-3 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <span>📊</span>
                                        <span>Dashboard</span>
                                    </Link>
                                    <button
                                        onClick={() => {
                                            logout();
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className="mobile-menu-item w-full flex items-center space-x-2 px-3 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                    >
                                        <span>🚪</span>
                                        <span>Sign Out</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Link
                                        href="/auth/login"
                                        className="mobile-menu-item flex items-center space-x-2 px-3 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <span>🔑</span>
                                        <span>Sign In</span>
                                    </Link>
                                    <Link
                                        href="/auth/signup"
                                        className="mobile-menu-item flex items-center space-x-2 px-3 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <span>✨</span>
                                        <span>Sign Up</span>
                                    </Link>
                                    <Link
                                        href="/auth/signup?role=provider"
                                        className="mobile-menu-item flex items-center space-x-2 px-3 py-3 rounded-lg border border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <span>💼</span>
                                        <span>For Providers</span>
                                    </Link>
                                </div>
                            )}

                            {/* Contact Us */}
                            <Link
                                href="/contact"
                                className="mobile-menu-item flex items-center space-x-2 px-3 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <span>📞</span>
                                <span>Contact Us</span>
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
} 