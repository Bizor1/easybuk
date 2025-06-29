'use client'

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Service {
    id: string;
    title: string;
    description: string;
    category: string;
    basePrice: number;
    duration?: number;
    location: 'client' | 'provider' | 'remote';
    status: 'ACTIVE' | 'INACTIVE' | 'DRAFT';
}

export default function EditServicePage() {
    const params = useParams();
    const router = useRouter();
    const serviceId = params.serviceId as string;

    const [service, setService] = useState<Service | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchService = async () => {
            try {
                const response = await fetch(`/api/provider/services/${serviceId}`);
                if (response.ok) {
                    const data = await response.json();
                    setService(data);
                }
            } catch (error) {
                console.error('Error fetching service:', error);
                // Mock data for development
                setService({
                    id: serviceId,
                    title: 'Professional House Cleaning',
                    description: 'Deep cleaning service for residential properties',
                    category: 'HOME_SERVICES',
                    basePrice: 150,
                    duration: 3,
                    location: 'client',
                    status: 'ACTIVE'
                });
            } finally {
                setLoading(false);
            }
        };

        if (serviceId) {
            fetchService();
        }
    }, [serviceId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!service) return;

        setSaving(true);
        try {
            const response = await fetch(`/api/provider/services/${serviceId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(service)
            });

            if (response.ok) {
                router.push('/provider/services');
            }
        } catch (error) {
            console.error('Error updating service:', error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-600 text-lg">Loading service...</p>
                </div>
            </div>
        );
    }

    if (!service) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Service not found</h1>
                    <Link href="/provider/services" className="text-blue-600 hover:underline">
                        Back to Services
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 dark:from-slate-900 dark:via-gray-900 dark:to-slate-800">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/provider/services" className="text-blue-600 hover:underline mb-4 inline-block">
                        ← Back to Services
                    </Link>
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Edit Service</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">Update your service details</p>
                </div>

                {/* Edit Form */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Service Title *
                                </label>
                                <input
                                    type="text"
                                    value={service.title}
                                    onChange={(e) => setService({ ...service, title: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Description *
                                </label>
                                <textarea
                                    rows={4}
                                    value={service.description}
                                    onChange={(e) => setService({ ...service, description: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Category *
                                    </label>
                                    <select
                                        value={service.category}
                                        onChange={(e) => setService({ ...service, category: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                        required
                                    >
                                        <option value="HOME_SERVICES">Home Services</option>
                                        <option value="HEALTHCARE">Healthcare</option>
                                        <option value="EDUCATION">Education & Training</option>
                                        <option value="TECHNICAL">Technical Services</option>
                                        <option value="CREATIVE">Creative Services</option>
                                        <option value="PROFESSIONAL">Professional Services</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Price (GH₵) *
                                    </label>
                                    <input
                                        type="number"
                                        value={service.basePrice}
                                        onChange={(e) => setService({ ...service, basePrice: Number(e.target.value) })}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                        min="1"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Service Duration (hours)
                                </label>
                                <input
                                    type="number"
                                    value={service.duration || ''}
                                    onChange={(e) => setService({ ...service, duration: e.target.value ? Number(e.target.value) : undefined })}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                    min="0.5"
                                    step="0.5"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Service Location
                                </label>
                                <div className="space-y-2">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="location"
                                            value="client"
                                            checked={service.location === 'client'}
                                            onChange={(e) => setService({ ...service, location: e.target.value as 'client' | 'provider' | 'remote' })}
                                            className="mr-2"
                                        />
                                        <span className="text-gray-700 dark:text-gray-300">At client&apos;s location</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="location"
                                            value="provider"
                                            checked={service.location === 'provider'}
                                            onChange={(e) => setService({ ...service, location: e.target.value as 'client' | 'provider' | 'remote' })}
                                            className="mr-2"
                                        />
                                        <span className="text-gray-700 dark:text-gray-300">At my location</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="location"
                                            value="remote"
                                            checked={service.location === 'remote'}
                                            onChange={(e) => setService({ ...service, location: e.target.value as 'client' | 'provider' | 'remote' })}
                                            className="mr-2"
                                        />
                                        <span className="text-gray-700 dark:text-gray-300">Remote/Online</span>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Status
                                </label>
                                <select
                                    value={service.status}
                                    onChange={(e) => setService({ ...service, status: e.target.value as 'ACTIVE' | 'INACTIVE' | 'DRAFT' })}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="ACTIVE">Active</option>
                                    <option value="INACTIVE">Inactive</option>
                                    <option value="DRAFT">Draft</option>
                                </select>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex space-x-4 pt-6">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {saving ? 'Saving...' : 'Update Service'}
                                </button>
                                <Link
                                    href="/provider/services"
                                    className="flex-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-500 transition-all duration-300 text-center"
                                >
                                    Cancel
                                </Link>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
} 