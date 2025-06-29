'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
    HomeIcon,
    UserGroupIcon,
    CalendarIcon,
    CurrencyDollarIcon,
    ChartBarIcon,
    ExclamationTriangleIcon,
    CogIcon,
    ShieldCheckIcon,
    DocumentTextIcon,
    BellIcon,
    MagnifyingGlassIcon,
    Bars3Icon,
    XMarkIcon
} from '@heroicons/react/24/outline';

const navigation = [
    {
        name: 'Dashboard',
        href: '/admin/dashboard',
        icon: HomeIcon,
        description: 'Overview & Analytics'
    },
    {
        name: 'User Management',
        href: '/admin/users',
        icon: UserGroupIcon,
        description: 'Clients & Providers'
    },
    {
        name: 'Bookings',
        href: '/admin/bookings',
        icon: CalendarIcon,
        description: 'All Bookings & Oversight'
    },
    {
        name: 'Disputes',
        href: '/admin/disputes',
        icon: ExclamationTriangleIcon,
        description: 'Dispute Resolution'
    },
    {
        name: 'Payments',
        href: '/admin/payments',
        icon: CurrencyDollarIcon,
        description: 'Financial Oversight'
    },
    {
        name: 'Analytics',
        href: '/admin/analytics',
        icon: ChartBarIcon,
        description: 'Platform Insights'
    },
    {
        name: 'Documents',
        href: '/admin/documents',
        icon: ShieldCheckIcon,
        description: 'Document Verification'
    },
    {
        name: 'Support',
        href: '/admin/support',
        icon: DocumentTextIcon,
        description: 'Help Tickets'
    },
    {
        name: 'Settings',
        href: '/admin/settings',
        icon: CogIcon,
        description: 'Platform Config'
    }
];

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [notifications, setNotifications] = useState(12);

    // Check admin access
    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push('/auth/login?redirect=/admin/dashboard');
                return;
            }

            if (!user.roles.includes('ADMIN')) {
                router.push('/');
                return;
            }
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    if (!user || !user.roles.includes('ADMIN')) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 flex z-40 lg:hidden">
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
                    <div className="relative flex-1 flex flex-col max-w-xs w-full bg-gray-900">
                        <div className="absolute top-0 right-0 -mr-12 pt-2">
                            <button
                                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                                onClick={() => setSidebarOpen(false)}
                            >
                                <XMarkIcon className="h-6 w-6 text-white" />
                            </button>
                        </div>
                        <SidebarContent pathname={pathname} />
                    </div>
                </div>
            )}

            {/* Desktop sidebar */}
            <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
                <div className="flex flex-col flex-grow bg-gray-900 pt-5 pb-4 overflow-y-auto">
                    <SidebarContent pathname={pathname} />
                </div>
            </div>

            {/* Main content */}
            <div className="lg:pl-64 flex flex-col flex-1">
                {/* Top navigation */}
                <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white shadow-sm border-b border-gray-200">
                    <button
                        className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-orange-500 lg:hidden"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Bars3Icon className="h-6 w-6" />
                    </button>

                    <div className="flex-1 px-4 flex justify-between items-center">
                        <div className="flex-1 flex">
                            <div className="w-full flex md:ml-0">
                                <div className="relative w-full text-gray-400 focus-within:text-gray-600">
                                    <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                                        <MagnifyingGlassIcon className="h-5 w-5" />
                                    </div>
                                    <input
                                        className="block w-full h-full pl-8 pr-3 py-2 border-transparent text-gray-900 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-0 focus:border-transparent sm:text-sm"
                                        placeholder="Search users, bookings, disputes..."
                                        type="search"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="ml-4 flex items-center md:ml-6">
                            {/* Notifications */}
                            <button className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 relative">
                                <BellIcon className="h-6 w-6" />
                                {notifications > 0 && (
                                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                        {notifications > 9 ? '9+' : notifications}
                                    </span>
                                )}
                            </button>

                            {/* Profile dropdown */}
                            <div className="ml-3 relative">
                                <div className="flex items-center space-x-3">
                                    <Image
                                        src={user.image || '/default-avatar.svg'}
                                        alt="Admin"
                                        width={32}
                                        height={32}
                                        className="h-8 w-8 rounded-full"
                                    />
                                    <div className="hidden md:block">
                                        <div className="text-sm font-medium text-gray-700">{user.name}</div>
                                        <div className="text-xs text-gray-500">Platform Administrator</div>
                                    </div>
                                </div>
                            </div>

                            {/* Logout */}
                            <button
                                onClick={logout}
                                className="ml-3 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>

                {/* Page content */}
                <main className="flex-1 relative overflow-y-auto focus:outline-none">
                    <div className="py-6">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

function SidebarContent({ pathname }: { pathname: string }) {
    return (
        <>
            {/* Logo */}
            <div className="flex items-center flex-shrink-0 px-4">
                <Image
                    src="https://res.cloudinary.com/duhfv8nqy/image/upload/v1749030696/easybuklogo_ity2xt.png"
                    alt="EasyBuk Admin"
                    width={32}
                    height={32}
                    className="h-8 w-8"
                />
                <span className="ml-2 text-xl font-bold text-white">EasyBuk Admin</span>
            </div>

            {/* Navigation */}
            <nav className="mt-5 flex-1 px-2 space-y-1">
                {navigation.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${isActive
                                ? 'bg-orange-600 text-white'
                                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                }`}
                        >
                            <item.icon
                                className={`mr-3 flex-shrink-0 h-6 w-6 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'
                                    }`}
                            />
                            <div>
                                <div className="text-sm font-medium">{item.name}</div>
                                <div className={`text-xs ${isActive ? 'text-orange-200' : 'text-gray-500'}`}>
                                    {item.description}
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </nav>

            {/* System status */}
            <div className="flex-shrink-0 flex border-t border-gray-700 p-4">
                <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="ml-2 text-sm text-gray-300">System Online</span>
                </div>
            </div>
        </>
    );
}
