'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import BookingForm from '@/components/BookingForm';
import PreBookingInquiry from '@/components/messaging/PreBookingInquiry';

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
    firm: {
        name: string;
        address: string;
        phone: string;
        hours: string;
    };
}

export default function ProfessionalServicesProfessional() {
    const params = useParams();
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [consultationType, setConsultationType] = useState('virtual');
    const [showBookingForm, setShowBookingForm] = useState(false);
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
                    specialty: data.category || 'Professional Service Provider',
                    image: data.profileImage || "https://res.cloudinary.com/duhfv8nqy/image/upload/v1733764031/default-avatar_cugq40.png",
                    rating: data.rating || 4.5,
                    reviews: data.totalReviews || 0,
                    experience: `${data.experience || 10} years`,
                    location: data.location || "Ghana",
                    consultation: `GH₵${data.hourlyRate || 200}`,
                    availability: data.isAvailable ? "Available this week" : "Contact for availability",
                    verified: data.isVerified || false,
                    languages: data.languages || ["English"],
                    services: data.services?.map((s: any) => s.name || s.title).slice(0, 6) || ["Professional Consultation"],
                    about: data.bio || data.description || "Experienced professional providing expert consultation and services with a focus on quality and client satisfaction.",
                    education: data.education || ["Professional Degree", "Advanced Certification"],
                    certifications: data.certifications || ["Licensed Professional"],
                    firm: {
                        name: data.businessName || `${data.name}&apos;s Practice`,
                        address: data.address || `${data.location}, Ghana`,
                        phone: data.phone || "+233 30 276 5432",
                        hours: typeof data.workingHours === 'object' && data.workingHours
                            ? "Mon-Fri: 8AM-6PM, Sat: 10AM-2PM"  // Convert object to readable string
                            : data.workingHours || "Mon-Fri: 8AM-6PM, Sat: 10AM-2PM"
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
            name: "Mr. Joseph Osei",
            rating: 5,
            date: "2 weeks ago",
            comment: "Excellent professional advice. Very thorough in explaining complex matters."
        },
        {
            name: "Sarah Business Ltd",
            rating: 5,
            date: "1 month ago",
            comment: "Great expertise and professional service. Clear communication and reasonable fees."
        },
        {
            name: "Kwame Enterprises",
            rating: 4,
            date: "2 months ago",
            comment: "Professional service with attention to detail. Completed work on time as promised."
        }
    ];

    const availableSlots = [
        "9:00 AM", "11:00 AM", "2:00 PM", "4:00 PM"
    ];

    // Service data for BookingForm
    const serviceData = professional ? {
        id: professional.id.toString(),
        title: `${professional.specialty} Consultation`,
        description: professional.about,
        basePrice: parseInt(professional.consultation.replace(/[^0-9]/g, '')),
        currency: 'GHS',
        pricingType: 'hourly' as const,
        duration: 1,
        durationUnit: 'hour',
        supportedBookingTypes: ['VIDEO_CALL', 'IN_PERSON'] as ('IN_PERSON' | 'REMOTE' | 'VIDEO_CALL' | 'PHONE_CALL')[],
        provider: {
            id: professional.id.toString(),
            name: professional.name,
            avatar: professional.image,
            rating: professional.rating
        }
    } : null;

    const handleBookingComplete = (bookingData: any) => {
        console.log('Booking completed:', bookingData);
        setShowBookingForm(false);
        // Handle successful booking (redirect, show success message, etc.)
    };

    const handleCloseBooking = () => {
        setShowBookingForm(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    <p className="mt-4 text-gray-600">Loading professional profile...</p>
                </div>
            </div>
        );
    }

    if (error || !professional) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error || 'Professional not found'}</p>
                    <Link
                        href="/professional-services"
                        className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                        Back to Professional Services
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
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
                            <Link href="/professional-services" className="text-gray-700 hover:text-purple-600 transition-colors">← Back to Professional Services</Link>
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
                                            <div className="absolute -bottom-2 -right-2 bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center">
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

                                        <p className="text-xl text-purple-600 font-medium mb-2">{professional.specialty}</p>
                                        <p className="text-gray-600 mb-4">📍 {professional.location} • {professional.experience} experience</p>

                                        <div className="flex items-center space-x-6 mb-4">
                                            <div className="flex items-center">
                                                <span className="text-yellow-400 mr-1">⭐</span>
                                                <span className="font-bold text-gray-800 text-xl">{professional.rating}</span>
                                                <span className="text-gray-500 ml-1">({professional.reviews} reviews)</span>
                                            </div>
                                            <div className="text-3xl font-bold text-purple-600">{professional.consultation}</div>
                                        </div>

                                        <div className="flex items-center space-x-2 mb-4">
                                            <span className="text-sm text-gray-600">Languages:</span>
                                            {professional.languages.map((lang, index) => (
                                                <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                                                    {lang}
                                                </span>
                                            ))}
                                        </div>

                                        <div className="flex space-x-4">
                                            <PreBookingInquiry
                                                providerId={professional.id.toString()}
                                                providerName={professional.name}
                                                providerImage={professional.image}
                                                buttonText="💬 Send Message"
                                                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-bold hover:from-purple-700 hover:to-indigo-700 transition-all duration-300"
                                                service={serviceData || undefined}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Services Offered */}
                                {professional.services && professional.services.length > 0 && (
                                    <div className="mb-6">
                                        <h3 className="text-xl font-bold text-gray-800 mb-3">💼 Services Offered</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            {professional.services.map((service: any, index: number) => (
                                                <div key={index} className="bg-purple-50 text-purple-700 px-4 py-2 rounded-lg text-center font-medium">
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
                                        <h3 className="text-lg font-bold text-gray-800 mb-3">🎓 Education</h3>
                                        {professional.education && professional.education.length > 0 ? (
                                            <div className="space-y-3">
                                                {professional.education.map((edu, index) => (
                                                    <div key={index} className="flex items-start">
                                                        <span className="w-2 h-2 bg-purple-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                                                        {edu.startsWith('http') ? (
                                                            <a
                                                                href={edu}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-purple-600 hover:text-purple-700 underline text-sm"
                                                            >
                                                                View Educational Certificate {index + 1}
                                                            </a>
                                                        ) : (
                                                            <span className="text-gray-600 text-sm">{edu}</span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 text-sm">Educational credentials available upon request</p>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-800 mb-3">🏆 Bar Admissions & Certifications</h3>
                                        {professional.certifications && professional.certifications.length > 0 ? (
                                            <div className="space-y-3">
                                                {professional.certifications.map((cert, index) => (
                                                    <div key={index} className="flex items-start">
                                                        <span className="w-2 h-2 bg-indigo-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                                                        {cert.startsWith('http') ? (
                                                            <a
                                                                href={cert}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-indigo-600 hover:text-indigo-700 underline text-sm"
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
                                            <p className="text-gray-500 text-sm">Professional certifications available upon request</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Reviews Section */}
                            <div className="bg-white rounded-2xl shadow-lg p-8">
                                <h3 className="text-2xl font-bold text-gray-800 mb-6">Client Reviews</h3>
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
                                <h3 className="text-2xl font-bold text-gray-800 mb-6">💼 Book Consultation</h3>

                                {/* Professional Summary */}
                                <div className="mb-6 p-4 bg-purple-50 rounded-lg">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-gray-700">Consultation Fee</span>
                                        <span className="text-2xl font-bold text-purple-600">{professional.consultation}</span>
                                    </div>
                                    <p className="text-sm text-gray-600">Per hour • Initial consultation</p>
                                    <div className="flex items-center mt-2">
                                        <span className="text-yellow-400 mr-1">⭐</span>
                                        <span className="font-medium text-gray-800">{professional.rating}</span>
                                        <span className="text-gray-500 text-sm ml-1">({professional.reviews} reviews)</span>
                                    </div>
                                </div>

                                {/* Service Options */}
                                <div className="mb-6">
                                    <h4 className="font-medium text-gray-700 mb-3">Available Services:</h4>
                                    <div className="space-y-2">
                                        {professional.services.slice(0, 3).map((service, index) => (
                                            <div key={index} className="flex items-center text-sm text-gray-600">
                                                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                                                {service}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Book Button */}
                                <button
                                    onClick={() => setShowBookingForm(true)}
                                    data-booking-trigger
                                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-lg font-bold text-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                                >
                                    💳 Book Consultation
                                </button>

                                <div className="grid grid-cols-2 gap-3 mt-4">
                                    <button className="bg-white border-2 border-purple-600 text-purple-600 py-2 px-4 rounded-lg font-medium hover:bg-purple-50 transition-colors">
                                        💬 Send Message
                                    </button>
                                    <button className="bg-white border-2 border-purple-600 text-purple-600 py-2 px-4 rounded-lg font-medium hover:bg-purple-50 transition-colors">
                                        📞 Call Office
                                    </button>
                                </div>

                                {/* Law Firm Info */}
                                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                    <h4 className="font-bold text-gray-800 mb-2">⚖️ {professional.firm.name}</h4>
                                    <p className="text-gray-600 text-sm mb-1">📍 {professional.firm.address}</p>
                                    <p className="text-gray-600 text-sm mb-1">📞 {professional.firm.phone}</p>
                                    <p className="text-gray-600 text-sm">🕒 {professional.firm.hours}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Booking Form Modal */}
            {showBookingForm && serviceData && (
                <BookingForm
                    service={serviceData}
                    category="professional"
                    onBookingComplete={handleBookingComplete}
                    onClose={handleCloseBooking}
                />
            )}
        </div>
    );
} 