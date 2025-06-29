'use client'

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

interface Service {
    id: string;
    title: string;
    description: string;
    category: string;
    subcategory?: string;
    basePrice: number;
    currency: string;
    duration?: number;
    location: 'client' | 'provider' | 'remote';
    status: 'ACTIVE' | 'INACTIVE' | 'DRAFT';
    images: string[];
    bookingsCount: number;
    rating: number;
    reviewsCount: number;
    createdAt: string;
    lastBooking?: string;
    earnings: number;
}

interface DeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    serviceTitle: string;
    isDeleting: boolean;
}

function DeleteConfirmationModal({ isOpen, onClose, onConfirm, serviceTitle, isDeleting }: DeleteModalProps) {
    const [confirmText, setConfirmText] = useState('');
    const isConfirmValid = confirmText === 'DELETE';

    const handleConfirm = () => {
        if (isConfirmValid) {
            onConfirm();
        }
    };

    const handleClose = () => {
        if (!isDeleting) {
            setConfirmText('');
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-w-md w-full mx-4 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6">
                    <div className="flex items-center space-x-3">
                        <div className="text-3xl">⚠️</div>
                        <div>
                            <h3 className="text-xl font-bold">Delete Service</h3>
                            <p className="text-red-100 text-sm">This action cannot be undone</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="mb-6">
                        <p className="text-gray-700 dark:text-gray-300 mb-2">
                            You are about to permanently delete:
                        </p>
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border-l-4 border-red-500">
                            <p className="font-semibold text-gray-900 dark:text-white">&quot;{serviceTitle}&quot;</p>
                        </div>
                    </div>

                    <div className="mb-6">
                        <p className="text-gray-700 dark:text-gray-300 mb-4">
                            This will permanently remove:
                        </p>
                        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-4">
                            <li>• Service listing and details</li>
                            <li>• All associated data</li>
                            <li>• Service images and content</li>
                            <li>• Historical booking references</li>
                        </ul>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Type <span className="font-bold text-red-600">DELETE</span> to confirm:
                        </label>
                        <input
                            type="text"
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            placeholder="Type DELETE here"
                            disabled={isDeleting}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3">
                        <button
                            onClick={handleClose}
                            disabled={isDeleting}
                            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={!isConfirmValid || isDeleting}
                            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${isConfirmValid && !isDeleting
                                ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white'
                                : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            {isDeleting ? (
                                <div className="flex items-center justify-center space-x-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Deleting...</span>
                                </div>
                            ) : (
                                'Delete Service'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ServicesPageContent() {
    const searchParams = useSearchParams();
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'all' | 'active' | 'inactive' | 'draft'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);

    // Modal states
    const [deleteModal, setDeleteModal] = useState<{
        isOpen: boolean;
        serviceId: string;
        serviceTitle: string;
        isDeleting: boolean;
    }>({
        isOpen: false,
        serviceId: '',
        serviceTitle: '',
        isDeleting: false
    });

    // Check for success message on page load
    useEffect(() => {
        if (searchParams.get('success') === 'true') {
            setShowSuccessMessage(true);
            // Hide success message after 5 seconds
            setTimeout(() => setShowSuccessMessage(false), 5000);
        }
    }, [searchParams]);

    // Fetch services
    useEffect(() => {
        const fetchServices = async () => {
            try {
                setLoading(true);
                console.log('🔄 Fetching services from API...');
                const response = await fetch('/api/provider/services');

                if (response.ok) {
                    const data = await response.json();
                    console.log('✅ Services fetched successfully:', data.length);
                    setServices(data);
                } else {
                    console.error('❌ Failed to fetch services:', response.status, response.statusText);
                    const errorData = await response.json();
                    console.error('Error details:', errorData);

                    // Handle specific error cases
                    if (response.status === 401) {
                        console.log('🔑 Authentication required');
                        // Could redirect to login here if needed
                    } else if (response.status === 404) {
                        console.log('👤 Provider profile not found');
                    }

                    // Set empty array on error - no fallback mock data
                    setServices([]);
                }
            } catch (error) {
                console.error('🚨 Network error fetching services:', error);
                // Set empty array on network error - no fallback mock data
                setServices([]);
            } finally {
                setLoading(false);
            }
        };

        fetchServices();
    }, []);

    const handleStatusToggle = async (serviceId: string, newStatus: 'ACTIVE' | 'INACTIVE') => {
        try {
            const response = await fetch(`/api/provider/services/${serviceId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                setServices(prev => prev.map(service =>
                    service.id === serviceId ? { ...service, status: newStatus } : service
                ));

                // Show success message
                const action = newStatus === 'ACTIVE' ? 'activated' : 'paused';
                setShowSuccessMessage(true);
                setTimeout(() => setShowSuccessMessage(false), 3000);
            } else {
                const errorData = await response.json();
                console.error('Failed to update service:', errorData);
            }
        } catch (error) {
            console.error('Error updating service status:', error);
        }
    };

    const openDeleteModal = (serviceId: string, serviceTitle: string) => {
        setDeleteModal({
            isOpen: true,
            serviceId,
            serviceTitle,
            isDeleting: false
        });
    };

    const closeDeleteModal = () => {
        setDeleteModal({
            isOpen: false,
            serviceId: '',
            serviceTitle: '',
            isDeleting: false
        });
    };

    const handleDeleteService = async () => {
        setDeleteModal(prev => ({ ...prev, isDeleting: true }));

        try {
            const response = await fetch(`/api/provider/services/${deleteModal.serviceId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                setServices(prev => prev.filter(service => service.id !== deleteModal.serviceId));
                closeDeleteModal();
                setShowSuccessMessage(true);
                setTimeout(() => setShowSuccessMessage(false), 3000);
            } else {
                const errorData = await response.json();
                console.error('Failed to delete service:', errorData);
                setDeleteModal(prev => ({ ...prev, isDeleting: false }));
            }
        } catch (error) {
            console.error('Error deleting service:', error);
            setDeleteModal(prev => ({ ...prev, isDeleting: false }));
        }
    };

    const handleCleanupAutoCreated = async () => {
        const autoCreated = services.filter(service =>
            service.basePrice === 50 &&
            service.description.includes('Professional') &&
            (service.title.includes('Services') || service.title.includes('Home Services'))
        );

        if (autoCreated.length === 0) {
            return;
        }

        if (!confirm(`Found ${autoCreated.length} auto-created services. Delete them all?`)) {
            return;
        }

        try {
            for (const service of autoCreated) {
                await fetch(`/api/provider/services/${service.id}`, { method: 'DELETE' });
            }

            // Refresh services list
            const response = await fetch('/api/provider/services');
            if (response.ok) {
                const data = await response.json();
                setServices(data);
            }

            setShowSuccessMessage(true);
            setTimeout(() => setShowSuccessMessage(false), 3000);
        } catch (error) {
            console.error('Error cleaning up services:', error);
        }
    };

    const getStatusConfig = (status: Service['status']) => {
        const configs = {
            ACTIVE: {
                color: 'text-green-700 dark:text-green-400',
                bg: 'bg-green-100/80 dark:bg-green-900/30',
                border: 'border-green-200 dark:border-green-700',
                emoji: '✅'
            },
            INACTIVE: {
                color: 'text-gray-700 dark:text-gray-400',
                bg: 'bg-gray-100/80 dark:bg-gray-700/30',
                border: 'border-gray-200 dark:border-gray-600',
                emoji: '⏸️'
            },
            DRAFT: {
                color: 'text-yellow-700 dark:text-yellow-400',
                bg: 'bg-yellow-100/80 dark:bg-yellow-900/30',
                border: 'border-yellow-200 dark:border-yellow-700',
                emoji: '📝'
            }
        };
        return configs[status];
    };

    const getLocationIcon = (location: Service['location']) => {
        const icons = {
            client: '🏠 Client Location',
            provider: '🏢 My Location',
            remote: '💻 Remote/Online'
        };
        return icons[location];
    };

    const getCategoryName = (category: string) => {
        const names: { [key: string]: string } = {
            'HOME_SERVICES': 'Home Services',
            'HEALTHCARE': 'Healthcare',
            'EDUCATION': 'Education & Training',
            'TECHNICAL': 'Technical Services',
            'CREATIVE': 'Creative Services',
            'PROFESSIONAL': 'Professional Services'
        };
        return names[category] || category;
    };

    const filteredServices = services.filter(service => {
        const matchesTab = activeTab === 'all' || service.status.toLowerCase() === activeTab;
        const matchesSearch = service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            service.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
        return matchesTab && matchesSearch && matchesCategory;
    });

    const stats = {
        total: services.length,
        active: services.filter(s => s.status === 'ACTIVE').length,
        inactive: services.filter(s => s.status === 'INACTIVE').length,
        draft: services.filter(s => s.status === 'DRAFT').length,
        totalEarnings: services.reduce((sum, s) => sum + (s.earnings || 0), 0),
        totalBookings: services.reduce((sum, s) => sum + (s.bookingsCount || 0), 0),
        averageRating: services.length > 0 ? services.reduce((sum, s) => sum + (s.rating || 0), 0) / services.length : 0
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 dark:from-slate-900 dark:via-gray-900 dark:to-slate-800 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">Loading your services...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 dark:from-slate-900 dark:via-gray-900 dark:to-slate-800 relative overflow-hidden">
            {/* Floating Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-orange-400/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-orange-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            {/* Success Notification */}
            {showSuccessMessage && (
                <div className="fixed top-4 right-4 z-50 animate-slideInRight">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-xl shadow-2xl border border-green-400/30 backdrop-blur-sm">
                        <div className="flex items-center space-x-3">
                            <div className="text-2xl">🎉</div>
                            <div>
                                <h3 className="font-bold text-lg">Service Created Successfully!</h3>
                                <p className="text-green-100 text-sm">Your service has been published and is now available for bookings.</p>
                            </div>
                            <button
                                onClick={() => setShowSuccessMessage(false)}
                                className="text-green-100 hover:text-white transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">
                                <span className="text-gray-900 dark:text-white">My Services</span>
                                <span className="block text-gradient-mixed animate-gradient-x">Portfolio 🛠️</span>
                            </h1>
                            <p className="text-lg text-gray-600 dark:text-gray-400">
                                Manage your service offerings and track performance
                            </p>
                        </div>
                        <div className="mt-4 md:mt-0 flex items-center space-x-3">
                            {/* Cleanup Auto-Created Services Button */}
                            {services.filter(service =>
                                service.basePrice === 50 &&
                                service.description.includes('Professional') &&
                                (service.title.includes('Services') || service.title.includes('Home Services'))
                            ).length > 0 && (
                                    <button
                                        onClick={handleCleanupAutoCreated}
                                        className="inline-flex items-center bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                                        title="Remove auto-created services from onboarding"
                                    >
                                        🧹 Clean Up
                                    </button>
                                )}

                            <Link
                                href="/provider/services/create"
                                className="inline-flex items-center bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Create New Service
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl opacity-25 group-hover:opacity-40 blur transition-opacity"></div>
                        <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-6">
                            <div className="flex items-center">
                                <div className="p-3 bg-gradient-to-r from-blue-100/80 to-cyan-100/80 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg">
                                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.active}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Active Services</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl opacity-25 group-hover:opacity-40 blur transition-opacity"></div>
                        <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-6">
                            <div className="flex items-center">
                                <div className="p-3 bg-gradient-to-r from-green-100/80 to-emerald-100/80 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg">
                                    <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">GH₵{stats.totalEarnings.toLocaleString()}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Earnings</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl opacity-25 group-hover:opacity-40 blur transition-opacity"></div>
                        <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-6">
                            <div className="flex items-center">
                                <div className="p-3 bg-gradient-to-r from-purple-100/80 to-pink-100/80 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg">
                                    <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalBookings}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Bookings</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl opacity-25 group-hover:opacity-40 blur transition-opacity"></div>
                        <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-6">
                            <div className="flex items-center">
                                <div className="p-3 bg-gradient-to-r from-yellow-100/80 to-orange-100/80 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-lg">
                                    <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.averageRating.toFixed(1)}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Average Rating</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="relative group mb-8">
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl opacity-20 group-hover:opacity-30 blur transition-opacity"></div>
                    <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            {/* Status Tabs */}
                            <div className="flex flex-wrap gap-2">
                                {(['all', 'active', 'inactive', 'draft'] as const).map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 ${activeTab === tab
                                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                                            : 'bg-gray-100/80 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-blue-100/80 dark:hover:bg-blue-900/30'
                                            }`}
                                    >
                                        {tab.charAt(0).toUpperCase() + tab.slice(1)} ({
                                            tab === 'all' ? stats.total :
                                                tab === 'active' ? stats.active :
                                                    tab === 'inactive' ? stats.inactive :
                                                        stats.draft
                                        })
                                    </button>
                                ))}
                            </div>

                            {/* Search and Category Filter */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="relative">
                                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    <input
                                        type="text"
                                        placeholder="Search services..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10 pr-4 py-2 bg-white/50 dark:bg-gray-700/50 border border-gray-200/50 dark:border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all backdrop-blur-sm"
                                    />
                                </div>

                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="px-4 py-2 bg-white/50 dark:bg-gray-700/50 border border-gray-200/50 dark:border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all backdrop-blur-sm"
                                >
                                    <option value="all">All Categories</option>
                                    <option value="HOME_SERVICES">Home Services</option>
                                    <option value="HEALTHCARE">Healthcare</option>
                                    <option value="EDUCATION">Education & Training</option>
                                    <option value="TECHNICAL">Technical Services</option>
                                    <option value="CREATIVE">Creative Services</option>
                                    <option value="PROFESSIONAL">Professional Services</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Services Grid */}
                {filteredServices.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredServices.map((service, index) => {
                            const statusConfig = getStatusConfig(service.status);
                            return (
                                <div
                                    key={service.id}
                                    className="relative group animate-fadeInUp"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl opacity-20 group-hover:opacity-30 blur transition-opacity"></div>
                                    <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                                        {/* Service Image */}
                                        <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 relative overflow-hidden">
                                            {service.images.length > 0 ? (
                                                <Image
                                                    src={service.images[0]}
                                                    alt={service.title}
                                                    fill
                                                    className="object-cover transition-transform group-hover:scale-110"
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center h-full">
                                                    <div className="text-6xl opacity-50">🛠️</div>
                                                </div>
                                            )}
                                            <div className="absolute top-4 left-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border} border backdrop-blur-sm`}>
                                                    {statusConfig.emoji} {service.status}
                                                </span>
                                            </div>
                                            <div className="absolute top-4 right-4">
                                                <span className="px-3 py-1 bg-black/50 text-white rounded-full text-xs font-medium backdrop-blur-sm">
                                                    {getCategoryName(service.category)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Service Content */}
                                        <div className="p-6">
                                            <div className="flex items-start justify-between mb-3">
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                    {service.title}
                                                </h3>
                                            </div>

                                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                                                {service.description}
                                            </p>

                                            {/* Service Details */}
                                            <div className="space-y-2 mb-4">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-600 dark:text-gray-400">Price:</span>
                                                    <span className="font-bold text-green-600 dark:text-green-400">
                                                        {service.currency}{service.basePrice}
                                                        {service.duration && ` (${service.duration}h)`}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-600 dark:text-gray-400">Location:</span>
                                                    <span className="text-gray-900 dark:text-white">
                                                        {getLocationIcon(service.location)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-600 dark:text-gray-400">Bookings:</span>
                                                    <span className="text-gray-900 dark:text-white">{service.bookingsCount}</span>
                                                </div>
                                                {service.rating > 0 && (
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-gray-600 dark:text-gray-400">Rating:</span>
                                                        <div className="flex items-center space-x-1">
                                                            <span className="text-yellow-500">⭐</span>
                                                            <span className="text-gray-900 dark:text-white">
                                                                {service.rating.toFixed(1)} ({service.reviewsCount})
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex space-x-2">
                                                <Link
                                                    href={`/provider/services/${service.id}/edit`}
                                                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-center py-2 px-4 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105"
                                                >
                                                    ✏️ Edit
                                                </Link>

                                                <button
                                                    onClick={() => handleStatusToggle(service.id, service.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')}
                                                    className={`flex-1 text-center py-2 px-4 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 ${service.status === 'ACTIVE'
                                                        ? 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white'
                                                        : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white'
                                                        }`}
                                                >
                                                    {service.status === 'ACTIVE' ? '⏸️ Pause' : '▶️ Activate'}
                                                </button>

                                                <button
                                                    onClick={() => openDeleteModal(service.id, service.title)}
                                                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>

                                        {/* Earnings Overlay - Repositioned to not block buttons */}
                                        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                            <div className="text-white text-center">
                                                <p className="text-lg font-bold">GH₵{(service.earnings || 0).toLocaleString()}</p>
                                                <p className="text-xs opacity-80">Total Earnings</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <div className="text-8xl mb-4 opacity-50">🛠️</div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            No services found
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-8">
                            {activeTab === 'all' ? 'Start by creating your first service' : `No ${activeTab} services found`}
                        </p>
                        <Link
                            href="/provider/services/create"
                            className="inline-flex items-center bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Create Your First Service
                        </Link>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {deleteModal.isOpen && (
                <DeleteConfirmationModal
                    isOpen={deleteModal.isOpen}
                    onClose={closeDeleteModal}
                    onConfirm={handleDeleteService}
                    serviceTitle={deleteModal.serviceTitle}
                    isDeleting={deleteModal.isDeleting}
                />
            )}

            <style jsx>{`
                .text-gradient-mixed {
                    background: linear-gradient(135deg, #3B82F6, #8B5CF6, #F59E0B);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    animation: gradient-x 3s ease infinite;
                    background-size: 200% 200%;
                }
                
                @keyframes gradient-x {
                    0%, 100% { background-position: left center; }
                    50% { background-position: right center; }
                }

                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
            `}</style>
        </div>
    );
}

export default function ServicesPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center py-16">
                        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <h2 className="text-2xl font-bold text-gray-700 mb-2">Loading Services...</h2>
                        <p className="text-gray-500">Please wait while we fetch your services.</p>
                    </div>
                </div>
            </div>
        }>
            <ServicesPageContent />
        </Suspense>
    );
}