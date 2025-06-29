'use client'

import React, { useState, useEffect } from 'react';

export default function CleanupServicesPage() {
    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/provider/services');
            if (response.ok) {
                const data = await response.json();
                setServices(data);
            }
        } catch (error) {
            console.error('Error fetching services:', error);
        } finally {
            setLoading(false);
        }
    };

    const deleteAutoCreatedServices = async () => {
        if (!confirm('Are you sure you want to delete all auto-created services? This action cannot be undone.')) {
            return;
        }

        try {
            setDeleting(true);

            // Delete services that look like auto-created ones
            const servicesToDelete = services.filter(service =>
                service.basePrice === 50 && // Default price
                service.description.includes('Professional') && // Default description pattern
                (service.title.includes('Services') || service.title.includes('Home Services'))
            );

            console.log('Services to delete:', servicesToDelete);

            for (const service of servicesToDelete) {
                const response = await fetch(`/api/provider/services/${service.id}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    console.log(`Deleted service: ${service.title}`);
                } else {
                    console.error(`Failed to delete service: ${service.title}`);
                }
            }

            alert(`Successfully deleted ${servicesToDelete.length} auto-created services!`);

            // Refresh the list
            fetchServices();

        } catch (error) {
            console.error('Error deleting services:', error);
            alert('Error deleting services. Please try again.');
        } finally {
            setDeleting(false);
        }
    };

    const autoCreatedServices = services.filter(service =>
        service.basePrice === 50 &&
        service.description.includes('Professional') &&
        (service.title.includes('Services') || service.title.includes('Home Services'))
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 p-6">
            <div className="max-w-4xl mx-auto pt-20">
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="text-6xl mb-4">🧹</div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-4">
                            Cleanup Auto-Created Services
                        </h1>
                        <p className="text-lg text-gray-600">
                            Remove services that were automatically created during onboarding
                        </p>
                    </div>

                    {loading ? (
                        <div className="text-center py-8">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <p className="mt-2 text-gray-600">Loading services...</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <h3 className="font-semibold text-yellow-800 mb-2">
                                    Found {autoCreatedServices.length} auto-created services
                                </h3>
                                <p className="text-yellow-700 text-sm">
                                    These services were automatically created during onboarding and can be safely removed.
                                </p>
                            </div>

                            {autoCreatedServices.length > 0 && (
                                <div className="space-y-4">
                                    <h3 className="text-xl font-semibold text-gray-800">Auto-Created Services:</h3>

                                    {autoCreatedServices.map((service) => (
                                        <div key={service.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-medium text-gray-900">{service.title}</h4>
                                                    <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        Price: GH₵{service.basePrice} • Category: {service.category}
                                                    </p>
                                                </div>
                                                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                                                    Auto-created
                                                </span>
                                            </div>
                                        </div>
                                    ))}

                                    <div className="pt-6 border-t">
                                        <button
                                            onClick={deleteAutoCreatedServices}
                                            disabled={deleting}
                                            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {deleting ? (
                                                <span className="flex items-center justify-center">
                                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Deleting Services...
                                                </span>
                                            ) : (
                                                `🗑️ Delete All ${autoCreatedServices.length} Auto-Created Services`
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {autoCreatedServices.length === 0 && (
                                <div className="text-center py-8">
                                    <div className="text-6xl mb-4">✅</div>
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2">All Clean!</h3>
                                    <p className="text-gray-600">No auto-created services found.</p>
                                </div>
                            )}

                            <div className="pt-6 border-t text-center">
                                <a
                                    href="/provider/services"
                                    className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                    Back to Services
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 