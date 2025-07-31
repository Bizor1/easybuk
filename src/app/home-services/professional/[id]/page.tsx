'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import BookingForm from '../../../../components/BookingForm';
import PreBookingInquiry from '../../../../components/messaging/PreBookingInquiry';

// Interface for professional data
interface Professional {
    id: number;
    name: string;
    specialty: string;
    image: string;
    rating: number;
    reviews: number;
    experience: string;
    location: string;
    consultation: string;
    availability: string;
    verified: boolean;
    languages: string[];
    services: string[];
    about: string;
    education: string[];
    certifications: string[];
    business: {
        name: string;
        address: string;
        phone: string;
        hours: string;
    };
}

export default function HomeServicesProfessional() {
    const params = useParams();
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [professional, setProfessional] = useState<Professional | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch professional data from API
    useEffect(() => {
        const fetchProfessional = async () => {
            if (!params.id) return;

            try {
                setLoading(true);
                const response = await fetch(`/api/providers/${params.id}`);

                if (!response.ok) {
                    throw new Error('Failed to fetch professional data');
                }

                const data = await response.json();

                // Transform API data to match UI format
                const transformedData: Professional = {
                    id: data.id,
                    name: data.name,
                    specialty: data.category || 'Home Service Professional',
                    image: data.profileImage || "https://res.cloudinary.com/duhfv8nqy/image/upload/v1733764031/default-avatar_cugq40.png",
                    rating: data.rating || 4.5,
                    reviews: data.totalReviews || 0,
                    experience: `${data.experience || 6} years`,
                    location: data.location || "Ghana",
                    consultation: `GH₵${data.hourlyRate || 50}`,
                    availability: data.isAvailable ? "Available today" : "Contact for availability",
                    verified: data.isVerified || false,
                    languages: data.languages || ["English"],
                    services: data.services?.map((s: any) => s.name || s.title).slice(0, 6) || ["Home Services"],
                    about: data.bio || data.description || "Professional home service provider with years of experience delivering quality services.",
                    education: data.education || ["Professional Training", "Service Certification"],
                    certifications: data.certifications || ["Licensed Professional"],
                    business: {
                        name: data.businessName || `${data.name}&apos;s Services`,
                        address: data.address || `${data.location} (Mobile Service)`,
                        phone: data.phone || "+233 24 345 6789",
                        hours: typeof data.workingHours === 'object' && data.workingHours
                            ? "Mon-Sat: 6AM-8PM, Sunday: 8AM-6PM"  // Convert object to readable string
                            : data.workingHours || "Mon-Sat: 6AM-8PM, Sunday: 8AM-6PM"
                    }
                };

                setProfessional(transformedData);
                setError(null);
            } catch (err) {
                console.error('Error fetching professional data:', err);
                setError('Failed to load professional data');
            } finally {
                setLoading(false);
            }
        };

        fetchProfessional();
    }, [params.id]);

    const reviews = [
        {
            name: "Mrs. Adwoa Osei",
            rating: 5,
            date: "3 days ago",
            comment: "Amazing service! Very thorough and professional. Highly recommend!"
        },
        {
            name: "Mr. Kwame Asante",
            rating: 5,
            date: "1 week ago",
            comment: "Excellent service! Punctual, reliable, and pays attention to every detail."
        },
        {
            name: "Sandra Agyei",
            rating: 4,
            date: "2 weeks ago",
            comment: "Great service provider. Very friendly and professional. Will definitely book again."
        }
    ];

    // Service data for the booking modal
    const serviceData = professional ? {
        id: professional.id.toString(),
        title: professional.specialty,
        description: `Home services with ${professional.name}`,
        basePrice: parseFloat(professional.consultation.replace('GH₵', '')),
        currency: 'GHS',
        pricingType: 'fixed' as const,
        duration: 120,
        durationUnit: 'minutes',
        supportedBookingTypes: ['IN_PERSON'] as ('IN_PERSON' | 'VIDEO_CALL' | 'REMOTE' | 'PHONE_CALL')[],
        provider: {
            id: professional.id.toString(),
            name: professional.name,
            avatar: professional.image,
            rating: professional.rating
        }
    } : null;

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                    <p className="mt-4 text-gray-600">Loading professional profile...</p>
                </div>
            </div>
        );
    }

    if (error || !professional) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error || 'Professional not found'}</p>
                    <Link
                        href="/home-services"
                        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                        Back to Home Services
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
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
                            <Link href="/home-services" className="text-gray-700 hover:text-green-600 transition-colors">← Back to Home Services</Link>
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
                                            src={professional.image}
                                            alt={professional.name}
                                            width={120}
                                            height={120}
                                            className="rounded-full object-cover"
                                        />
                                        {professional.verified && (
                                            <div className="absolute -bottom-2 -right-2 bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center">
                                                ✓
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <h1 className="text-3xl font-bold text-gray-800">{professional.name}</h1>
                                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                                {typeof professional.availability === 'string' ? professional.availability : 'Available for booking'}
                                            </span>
                                        </div>

                                        <p className="text-xl text-green-600 font-medium mb-2">{professional.specialty}</p>
                                        <p className="text-gray-600 mb-4">📍 {professional.location} • {professional.experience} experience</p>

                                        <div className="flex items-center space-x-6 mb-4">
                                            <div className="flex items-center">
                                                <span className="text-yellow-400 mr-1">⭐</span>
                                                <span className="font-bold text-gray-800 text-xl">{professional.rating}</span>
                                                <span className="text-gray-500 ml-1">({professional.reviews} reviews)</span>
                                            </div>
                                            <div className="text-3xl font-bold text-green-600">{professional.consultation}</div>
                                        </div>

                                        <div className="flex items-center space-x-2 mb-4">
                                            <span className="text-sm text-gray-600">Languages:</span>
                                            {professional.languages.map((lang, index) => (
                                                <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                                                    {lang}
                                                </span>
                                            ))}
                                        </div>

                                        <div className="flex space-x-4 mb-4">
                                            <PreBookingInquiry
                                                providerId={professional.id.toString()}
                                                providerName={professional.name}
                                                providerImage={professional.image}
                                                buttonText="💬 Send Message"
                                                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg font-bold hover:from-green-700 hover:to-emerald-700 transition-all duration-300"
                                                service={serviceData || undefined}
                                            />
                                        </div>

                                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                            <div className="flex items-start gap-3">
                                                <div className="flex-shrink-0">
                                                    <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-amber-800">💬 Ready to connect?</p>
                                                    <p className="text-sm text-amber-700 mt-1">
                                                        Ask questions about services before booking. Full messaging and calls unlock after booking confirmation.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Services Offered */}
                                {professional.services && professional.services.length > 0 && (
                                    <div className="mb-6">
                                        <h3 className="text-xl font-bold text-gray-800 mb-3">🏠 Services Offered</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            {professional.services.map((service: any, index: number) => (
                                                <div key={index} className="bg-green-50 text-green-700 px-4 py-2 rounded-lg text-center font-medium">
                                                    {typeof service === 'string' ? service : (service && (service.name || service.title)) || 'Service'}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* About */}
                                <div className="mb-6">
                                    <h3 className="text-xl font-bold text-gray-800 mb-3">About {professional.name}</h3>
                                    <p className="text-gray-600 leading-relaxed">{professional.about}</p>
                                </div>

                                {/* Education & Certifications */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-800 mb-3">🎓 Training & Education</h3>
                                        {professional.education && professional.education.length > 0 ? (
                                            <div className="space-y-3">
                                                {professional.education.map((edu, index) => (
                                                    <div key={index} className="flex items-start">
                                                        <span className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                                                        {edu.startsWith('http') ? (
                                                            <a
                                                                href={edu}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-green-600 hover:text-green-700 underline text-sm"
                                                            >
                                                                View Training Certificate {index + 1}
                                                            </a>
                                                        ) : (
                                                            <span className="text-gray-600 text-sm">{edu}</span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 text-sm">Professional training information available upon request</p>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-800 mb-3">🏆 Certifications</h3>
                                        {professional.certifications && professional.certifications.length > 0 ? (
                                            <div className="space-y-3">
                                                {professional.certifications.map((cert, index) => (
                                                    <div key={index} className="flex items-start">
                                                        <span className="w-2 h-2 bg-emerald-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                                                        {cert.startsWith('http') ? (
                                                            <a
                                                                href={cert}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-emerald-600 hover:text-emerald-700 underline text-sm"
                                                            >
                                                                View Professional License {index + 1}
                                                            </a>
                                                        ) : (
                                                            <span className="text-gray-600 text-sm">{cert}</span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 text-sm">Professional licensing information available upon request</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Reviews Section */}
                            <div className="bg-white rounded-2xl shadow-lg p-8">
                                <h3 className="text-2xl font-bold text-gray-800 mb-6">Customer Reviews</h3>
                                <div className="space-y-6">
                                    {reviews.map((review, index) => (
                                        <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0">
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <p className="font-medium text-gray-800">{review.name}</p>
                                                    <div className="flex items-center mt-1">
                                                        {[...Array(review.rating)].map((_, i) => (
                                                            <span key={i} className="text-yellow-400">⭐</span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <span className="text-gray-500 text-sm">{review.date}</span>
                                            </div>
                                            <p className="text-gray-600">{review.comment}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Booking Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
                                <h3 className="text-2xl font-bold text-gray-800 mb-6">🏠 Book Service</h3>

                                {/* Service Type */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Service Location</label>
                                    <div className="grid grid-cols-1 gap-2">
                                        <button
                                            onClick={() => setShowBookingModal(true)}
                                            className="p-3 rounded-lg border text-center bg-green-600 text-white border-green-600"
                                        >
                                            🏠 Home Visit
                                        </button>
                                    </div>
                                </div>

                                {/* Professional Summary */}
                                <div className="mb-6 p-4 bg-green-50 rounded-lg">
                                    <div className="flex items-center space-x-3 mb-3">
                                        <Image
                                            src={professional.image}
                                            alt={professional.name}
                                            width={50}
                                            height={50}
                                            className="rounded-full"
                                        />
                                        <div>
                                            <p className="font-bold text-gray-800">{professional.name}</p>
                                            <p className="text-green-600 text-sm">{professional.specialty}</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-700">Service Fee</span>
                                        <span className="text-2xl font-bold text-green-600">{professional.consultation}</span>
                                    </div>
                                </div>

                                {/* Book Button */}
                                <button
                                    onClick={() => setShowBookingModal(true)}
                                    data-booking-trigger
                                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-lg font-bold text-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 mb-3"
                                >
                                    💳 Book Service
                                </button>

                                {/* Pre-booking Inquiry */}
                                {professional && serviceData && (
                                    <PreBookingInquiry
                                        providerId={professional.id.toString()}
                                        providerName={professional.name}
                                        providerImage={professional.image}
                                        className="w-full"
                                        service={serviceData}
                                    />
                                )}

                                {/* Business Info */}
                                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                    <h4 className="font-bold text-gray-800 mb-2">🏠 {professional.business.name}</h4>
                                    <p className="text-gray-600 text-sm mb-1">📍 {professional.business.address}</p>
                                    <p className="text-gray-600 text-sm mb-1">📞 {professional.business.phone}</p>
                                    <p className="text-gray-600 text-sm">🕒 {professional.business.hours}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Booking Modal */}
            {showBookingModal && serviceData && (
                <BookingForm
                    service={serviceData}
                    onClose={() => setShowBookingModal(false)}
                    onBookingComplete={() => {
                        setShowBookingModal(false);
                        // Handle successful booking
                    }}
                    category="home"
                />
            )}
        </div>
    );
} 