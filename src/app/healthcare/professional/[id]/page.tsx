'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import BookingForm from '../../../../components/BookingForm';

export default function HealthcareProfessional() {
    const params = useParams();
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [professional, setProfessional] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch real provider data
    useEffect(() => {
        const fetchProviderData = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/providers/${params.id}`);

                if (!response.ok) {
                    throw new Error('Provider not found');
                }

                const data = await response.json();
                setProfessional(data);
            } catch (error) {
                console.error('Error fetching provider:', error);
                setError('Failed to load provider profile');
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            fetchProviderData();
        }
    }, [params.id]);

    // Track profile view
    useEffect(() => {
        const trackProfileView = async () => {
            if (!params.id) return;

            try {
                await fetch('/api/provider/track-view', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        providerId: params.id,
                        source: 'healthcare_profile'
                    })
                });
            } catch (error) {
                // Fail silently - tracking is not critical
                console.log('Profile view tracking failed');
            }
        };

        trackProfileView();
    }, [params.id]);

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-lg text-gray-600">Loading provider profile...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !professional) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">😞</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Provider Not Found</h2>
                    <p className="text-gray-600 mb-4">{error || 'The provider profile you are looking for does not exist.'}</p>
                    <Link href="/healthcare" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                        Back to Healthcare Services
                    </Link>
                </div>
            </div>
        );
    }

    // Use real reviews data from API
    const reviews = professional.reviewsData || [];

    // Service data for the booking modal
    const serviceData = {
        id: professional.id,
        title: professional.businessName || professional.name,
        description: professional.services?.[0]?.description || `Healthcare consultation with ${professional.name}`,
        basePrice: professional.services?.[0]?.basePrice || 80,
        currency: 'GHS',
        pricingType: 'fixed' as const,
        duration: professional.services?.[0]?.duration || 30,
        durationUnit: 'minutes',
        supportedBookingTypes: ['IN_PERSON', 'VIDEO_CALL'] as ('IN_PERSON' | 'VIDEO_CALL' | 'REMOTE' | 'PHONE_CALL')[],
        provider: {
            id: professional.id,
            name: professional.name,
            avatar: professional.profilePicture,
            rating: professional.averageRating || 4.5
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 glass backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/" className="flex items-center space-x-3">
                            <Image
                                src="https://res.cloudinary.com/duhfv8nqy/image/upload/v1749030696/easybuklogo_ity2xt.png"
                                alt="EasyBuk Logo"
                                width={40}
                                height={40}
                                className="w-10 h-10"
                            />
                            <span className="text-2xl font-bold text-gradient-mixed">EasyBuk</span>
                        </Link>

                        <div className="flex items-center space-x-4">
                            <Link href="/healthcare" className="text-gray-700 hover:text-blue-600 transition-colors">← Back to Healthcare</Link>
                            <Link href="/contact" className="btn-secondary">Contact Us</Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Professional Profile Section */}
            <section className="pt-20 pb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Profile Info */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                                <div className="flex items-start space-x-6 mb-6">
                                    <div className="relative">
                                        <Image
                                            src={professional.profilePicture}
                                            alt={professional.name}
                                            width={120}
                                            height={120}
                                            className="rounded-full object-cover"
                                        />
                                        {professional.isVerified && (
                                            <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center">
                                                ✓
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <h1 className="text-3xl font-bold text-gray-800">{professional.name}</h1>
                                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                                {professional.isVerified ? 'Verified Provider' : 'Available today'}
                                            </span>
                                        </div>

                                        <p className="text-xl text-blue-600 font-medium mb-2">{professional.businessName || professional.categorySpecialty}</p>
                                        <p className="text-gray-600 mb-4">📍 {professional.location} • {professional.yearsOfExperience || 'Experienced'} {professional.yearsOfExperience ? 'years' : ''} experience</p>

                                        <div className="flex items-center space-x-6 mb-4">
                                            <div className="flex items-center">
                                                <span className="text-yellow-400 mr-1">⭐</span>
                                                <span className="font-bold text-gray-800 text-xl">{professional.averageRating || '4.5'}</span>
                                                <span className="text-gray-500 ml-1">({professional.totalReviews || 0} reviews)</span>
                                            </div>
                                            <div className="text-3xl font-bold text-blue-600">
                                                GH₵{professional.services?.[0]?.basePrice || 80}
                                            </div>
                                        </div>

                                        {professional.languages && professional.languages.length > 0 && (
                                            <div className="flex items-center space-x-2 mb-4">
                                                <span className="text-sm text-gray-600">Languages:</span>
                                                {professional.languages.map((lang: string, index: number) => (
                                                    <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                                                        {lang}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        <div className="flex space-x-4">
                                            <button className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-6 py-3 rounded-lg font-bold hover:from-blue-700 hover:to-green-700 transition-all duration-300">
                                                💬 Send Message
                                            </button>
                                            <button className="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg font-bold hover:bg-blue-50 transition-colors">
                                                📞 Call Clinic
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Services Offered */}
                                {professional.services && professional.services.length > 0 && (
                                    <div className="mb-6">
                                        <h3 className="text-xl font-bold text-gray-800 mb-3">Services Offered</h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            {professional.services.map((service: any, index: number) => (
                                                <div key={index} className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-center">
                                                    {service.name || service.title}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* About */}
                                <div className="mb-6">
                                    <h3 className="text-xl font-bold text-gray-800 mb-3">About {professional.name}</h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        {professional.bio || professional.description || `${professional.name} is a healthcare professional providing quality medical services with ${professional.yearsOfExperience || 'years of'} experience in the field.`}
                                    </p>
                                </div>

                                {/* Education & Certifications */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {professional.education && professional.education.length > 0 && (
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-800 mb-3">🎓 Education</h3>
                                            <ul className="space-y-2">
                                                {professional.education.map((edu: string, index: number) => (
                                                    <li key={index} className="text-gray-600 flex items-start">
                                                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                                                        {edu}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {professional.certifications && professional.certifications.length > 0 && (
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-800 mb-3">🏆 Certifications</h3>
                                            <ul className="space-y-2">
                                                {professional.certifications.map((cert: string, index: number) => (
                                                    <li key={index} className="text-gray-600 flex items-start">
                                                        <span className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                                                        {cert}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {(!professional.education || professional.education.length === 0) && (!professional.certifications || professional.certifications.length === 0) && (
                                        <div className="col-span-2">
                                            <div className="bg-gray-50 rounded-lg p-6 text-center">
                                                <p className="text-gray-600">Professional credentials information will be available soon.</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Reviews Section */}
                            <div className="bg-white rounded-2xl shadow-lg p-8">
                                <h3 className="text-2xl font-bold text-gray-800 mb-6">Patient Reviews</h3>
                                <div className="space-y-6">
                                    {reviews && reviews.length > 0 ? (
                                        reviews.map((review: any, index: number) => (
                                            <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div>
                                                        <p className="font-medium text-gray-800">{review.clientName || review.name || 'Anonymous'}</p>
                                                        <div className="flex items-center mt-1">
                                                            {[...Array(review.rating || 5)].map((_, i) => (
                                                                <span key={i} className="text-yellow-400">⭐</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <span className="text-gray-500 text-sm">{review.createdAt ? new Date(review.createdAt).toLocaleDateString() : review.date || '1 week ago'}</span>
                                                </div>
                                                <p className="text-gray-600">{review.comment || review.reviewText}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8">
                                            <div className="text-4xl mb-3">📝</div>
                                            <p className="text-gray-600">No reviews yet. Be the first to leave a review!</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Booking Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
                                <h3 className="text-2xl font-bold text-gray-800 mb-6">📅 Book Appointment</h3>

                                {/* Professional Summary */}
                                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                                    <div className="flex items-center space-x-3 mb-3">
                                        <Image
                                            src={professional.profilePicture}
                                            alt={professional.name}
                                            width={50}
                                            height={50}
                                            className="rounded-full"
                                        />
                                        <div>
                                            <p className="font-bold text-gray-800">{professional.name}</p>
                                            <p className="text-blue-600 text-sm">{professional.specialty}</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-700">Consultation Fee</span>
                                        <span className="text-2xl font-bold text-blue-600">
                                            GH₵{professional.services?.[0]?.basePrice || 80}
                                        </span>
                                    </div>
                                </div>

                                {/* Book Button */}
                                <button
                                    onClick={() => setShowBookingModal(true)}
                                    className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white py-4 rounded-lg font-bold text-lg hover:from-blue-700 hover:to-green-700 transition-all duration-300"
                                >
                                    💳 Book Consultation
                                </button>

                                {/* Clinic Info */}
                                {professional.businessAddress && (
                                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                        <h4 className="font-bold text-gray-800 mb-2">🏥 {professional.businessName || 'Healthcare Clinic'}</h4>
                                        <p className="text-gray-600 text-sm mb-1">📍 {professional.businessAddress}</p>
                                        {professional.phone && (
                                            <p className="text-gray-600 text-sm mb-1">📞 {professional.phone}</p>
                                        )}
                                        <p className="text-gray-600 text-sm">🕒 Available by appointment</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Booking Modal */}
            {showBookingModal && (
                <BookingForm
                    service={serviceData}
                    onClose={() => setShowBookingModal(false)}
                    onBookingComplete={() => {
                        setShowBookingModal(false);
                        // Handle successful booking (e.g., show confirmation, redirect)
                    }}
                    category="healthcare"
                />
            )}
        </div>
    );
} 