'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ClientLayoutProps {
    children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const pathname = usePathname();
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/auth/login?redirect=/client/dashboard');
        }
    }, [user, loading, router]);

    // Fetch unread message count
    const fetchUnreadCount = async () => {
        try {
            const response = await fetch('/api/messages/unread-count', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setUnreadCount(data.totalUnread);
                }
            }
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    // Fetch unread count on mount and set up periodic refresh
    useEffect(() => {
        if (!loading && user) {
            fetchUnreadCount();

            // Refresh every 30 seconds
            const interval = setInterval(fetchUnreadCount, 30000);
            return () => clearInterval(interval);
        }
    }, [loading, user]);

    // Refresh unread count when navigating away from messages
    useEffect(() => {
        if (pathname !== '/client/messages') {
            fetchUnreadCount();
        }
    }, [pathname]);

    const navigation = [
        {
            name: 'Dashboard',
            href: '/client/dashboard',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2v10z" />
                </svg>
            )
        },
        {
            name: 'Browse Services',
            href: '/explore',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            )
        },
        {
            name: 'My Bookings',
            href: '/client/bookings',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            )
        },
        {
            name: 'Messages',
            href: '/client/messages',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
            ),
            badge: unreadCount > 0 ? unreadCount : undefined
        },
        {
            name: 'Notifications',
            href: '/client/notifications',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.868 19.718A10.964 10.964 0 016.18 16.48a10.964 10.964 0 010-8.96A10.964 10.964 0 014.868 4.282a11.988 11.988 0 000 15.436z" />
                </svg>
            )
        }
    ];

    const isActive = (href: string) => pathname === href;

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
                <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
                    <Link href="/client/dashboard" className="flex items-center space-x-2">
                        <Image
                            src="https://res.cloudinary.com/duhfv8nqy/image/upload/v1749030696/easybuklogo_ity2xt.png"
                            alt="EasyBuk Logo"
                            width={32}
                            height={32}
                            className="w-8 h-8"
                        />
                        <span className="text-xl font-bold text-gray-900 dark:text-white">EasyBuk</span>
                    </Link>
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="lg:hidden p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <nav className="mt-6 px-4">
                    <div className="space-y-1">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${isActive(item.href)
                                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                            >
                                <span className={`mr-3 ${isActive(item.href) ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
                                    }`}>
                                    {item.icon}
                                </span>
                                {item.name}
                                {item.badge && (
                                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        ))}
                    </div>

                    {/* User Profile Section */}
                    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center px-3 py-2">
                            <Image
                                src={user?.image || '/default-avatar.svg'}
                                alt={user?.name || 'User'}
                                width={32}
                                height={32}
                                className="w-8 h-8 rounded-full"
                            />
                            <div className="ml-3 flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    {user?.name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                    {user?.email}
                                </p>
                            </div>
                        </div>
                        <div className="mt-3 space-y-1">
                            <button
                                onClick={logout}
                                className="group flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                                <svg className="mr-3 w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Sign out
                            </button>
                        </div>
                    </div>
                </nav>
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Mobile header */}
                <div className="lg:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <Link href="/client/dashboard" className="flex items-center space-x-2">
                            <Image
                                src="https://res.cloudinary.com/duhfv8nqy/image/upload/v1749030696/easybuklogo_ity2xt.png"
                                alt="EasyBuk Logo"
                                width={24}
                                height={24}
                                className="w-6 h-6"
                            />
                            <span className="text-lg font-bold text-gray-900 dark:text-white">EasyBuk</span>
                        </Link>
                        <div className="w-10"></div> {/* Spacer for balance */}
                    </div>
                </div>

                {/* Page content */}
                <main className="flex-1 overflow-auto">
                    {children}
                </main>
            </div>

            {/* Sidebar overlay for mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
        </div>
    );
} 