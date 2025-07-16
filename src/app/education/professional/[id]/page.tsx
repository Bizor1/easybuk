'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import BookingForm from '../../../../components/BookingForm';

export default function EducationProfessional() {
    const params = useParams();
    const [showBookingModal, setShowBookingModal] = useState(false);

    // Mock professional data - in real app, fetch based on params.id
    const professional = {
        id: 1,
        name: "Prof. Samuel Asante",
        specialty: "Mathematics Tutor",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        rating: 4.9,
        reviews: 134,
        experience: "10 years",
        location: "Accra",
        consultation: "GH₵40",
        availability: "Available today",
        verified: true,
        languages: ["English", "Twi"],
        services: ["WASSCE Math", "University Math", "IB Mathematics", "Private Tutoring", "Group Classes", "Exam Preparation"],
        about: "Experienced mathematics educator with 10 years of teaching experience at secondary and tertiary levels. I specialize in making complex mathematical concepts easy to understand through practical examples and interactive learning.",
        education: ["BSc Mathematics - University of Ghana", "MPhil Mathematics Education - UCC", "Teaching Certificate - UEW", "Advanced Calculus Specialization"],
        certifications: ["Licensed Professional Teacher", "IB Mathematics Certified", "WASSCE Examiner", "Online Teaching Specialist"],
        academy: {
            name: "Asante Math Academy",
            address: "Osu, Accra (Online & Home Tutoring)",
            phone: "+233 24 123 7890",
            hours: "Mon-Sat: 3PM-8PM, Sun: 10AM-6PM"
        }
    };

    const reviews = [
        {
            name: "Akosua Mensah",
            rating: 5,
            date: "1 week ago",
            comment: "Prof. Asante helped my daughter improve her math grades from C to A in just 3 months! Excellent teacher with great patience."
        },
        {
            name: "Mr. Kwame Osei",
            rating: 5,
            date: "2 weeks ago",
            comment: "Amazing tutor! My son was struggling with calculus but Prof. Asante made it so easy to understand. Highly recommend!"
        },
        {
            name: "Mary Adjei",
            rating: 4,
            date: "1 month ago",
            comment: "Good teacher with effective teaching methods. Helped me prepare well for my WASSCE mathematics exam."
        }
    ];

    // Service data for the booking modal
    const serviceData = {
        id: professional.id.toString(),
        title: professional.specialty,
        description: `Mathematics tutoring with ${professional.name}`,
        basePrice: parseFloat(professional.consultation.replace('GH₵', '')),
        currency: 'GHS',
        pricingType: 'fixed' as const,
        duration: 60,
        durationUnit: 'minutes',
        supportedBookingTypes: ['IN_PERSON', 'VIDEO_CALL'] as ('IN_PERSON' | 'VIDEO_CALL' | 'REMOTE' | 'PHONE_CALL')[],
        provider: {
            id: professional.id.toString(),
            name: professional.name,
            avatar: professional.image,
            rating: professional.rating
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50">
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
                            <Link href="/education" className="text-gray-700 hover:text-indigo-600 transition-colors">← Back to Education</Link>
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
                                            <div className="absolute -bottom-2 -right-2 bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center">
                                                ✓
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <h1 className="text-3xl font-bold text-gray-800">{professional.name}</h1>
                                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                                {professional.availability}
                                            </span>
                                        </div>

                                        <p className="text-xl text-indigo-600 font-medium mb-2">{professional.specialty}</p>
                                        <p className="text-gray-600 mb-4">📍 {professional.location} • {professional.experience} experience</p>

                                        <div className="flex items-center space-x-6 mb-4">
                                            <div className="flex items-center">
                                                <span className="text-yellow-400 mr-1">⭐</span>
                                                <span className="font-bold text-gray-800 text-xl">{professional.rating}</span>
                                                <span className="text-gray-500 ml-1">({professional.reviews} reviews)</span>
                                            </div>
                                            <div className="text-3xl font-bold text-indigo-600">{professional.consultation}</div>
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
                                            <button className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:from-indigo-700 hover:to-blue-700 transition-all duration-300">
                                                💬 Send Message
                                            </button>
                                            <button className="border border-indigo-600 text-indigo-600 px-6 py-3 rounded-lg font-bold hover:bg-indigo-50 transition-colors">
                                                📞 Call Tutor
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Services Offered */}
                                <div className="mb-6">
                                    <h3 className="text-xl font-bold text-gray-800 mb-3">📚 Subjects & Services</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {professional.services.map((service, index) => (
                                            <div key={index} className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg text-center">
                                                {service}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* About */}
                                <div className="mb-6">
                                    <h3 className="text-xl font-bold text-gray-800 mb-3">About {professional.name}</h3>
                                    <p className="text-gray-600 leading-relaxed">{professional.about}</p>
                                </div>

                                {/* Education & Certifications */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-800 mb-3">🎓 Education</h3>
                                        <ul className="space-y-2">
                                            {professional.education.map((edu, index) => (
                                                <li key={index} className="text-gray-600 flex items-start">
                                                    <span className="w-2 h-2 bg-indigo-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                                                    {edu}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-800 mb-3">🏆 Teaching Certifications</h3>
                                        <ul className="space-y-2">
                                            {professional.certifications.map((cert, index) => (
                                                <li key={index} className="text-gray-600 flex items-start">
                                                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                                                    {cert}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Reviews Section */}
                            <div className="bg-white rounded-2xl shadow-lg p-8">
                                <h3 className="text-2xl font-bold text-gray-800 mb-6">Student & Parent Reviews</h3>
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
                                <h3 className="text-2xl font-bold text-gray-800 mb-6">📚 Book Session</h3>

                                {/* Session Type */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Session Type</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => setShowBookingModal(true)}
                                            className={`p-3 rounded-lg border text-center ${showBookingModal
                                                ? 'bg-indigo-600 text-white border-indigo-600'
                                                : 'bg-gray-50 text-gray-700 border-gray-300'}`}
                                        >
                                            💻 Online
                                        </button>
                                        <button
                                            onClick={() => setShowBookingModal(true)}
                                            className={`p-3 rounded-lg border text-center ${showBookingModal
                                                ? 'bg-indigo-600 text-white border-indigo-600'
                                                : 'bg-gray-50 text-gray-700 border-gray-300'}`}
                                        >
                                            🏠 Home Visit
                                        </button>
                                    </div>
                                </div>

                                {/* Date Selection */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
                                    <input
                                        type="date"
                                        value={showBookingModal ? serviceData.provider.rating : ''}
                                        onChange={(e) => { }}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                </div>

                                {/* Time Selection */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Available Times</label>
                                    <div className="grid grid-cols-1 gap-2">
                                        {showBookingModal ? serviceData.provider.rating : ''}
                                    </div>
                                </div>

                                {/* Session Fee */}
                                <div className="mb-6 p-4 bg-indigo-50 rounded-lg">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-700">Per Session</span>
                                        <span className="text-2xl font-bold text-indigo-600">{professional.consultation}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">90 minutes • Materials included</p>
                                </div>

                                {/* Book Button */}
                                <button
                                    disabled={!showBookingModal}
                                    className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-4 rounded-lg font-bold text-lg hover:from-indigo-700 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    💳 Book & Pay Now
                                </button>

                                {/* Academy Info */}
                                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                    <h4 className="font-bold text-gray-800 mb-2">📚 {professional.academy.name}</h4>
                                    <p className="text-gray-600 text-sm mb-1">📍 {professional.academy.address}</p>
                                    <p className="text-gray-600 text-sm mb-1">📞 {professional.academy.phone}</p>
                                    <p className="text-gray-600 text-sm">🕒 {professional.academy.hours}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {showBookingModal && (
                <BookingForm
                    service={serviceData}
                    onClose={() => setShowBookingModal(false)}
                    onBookingComplete={() => {
                        setShowBookingModal(false);
                        // Handle successful booking
                    }}
                    category="education"
                />
            )}
        </div>
    );
} 