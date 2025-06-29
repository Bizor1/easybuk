'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';

export default function ProfessionalServicesProfessional() {
    const params = useParams();
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [consultationType, setConsultationType] = useState('virtual');

    // Mock professional data - in real app, fetch based on params.id
    const professional = {
        id: 1,
        name: "Barrister Akosua Darko",
        specialty: "Corporate Lawyer",
        image: "https://images.unsplash.com/photo-1594824724159-9d0d18e2d4d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        rating: 4.9,
        reviews: 87,
        experience: "15 years",
        location: "Ridge, Accra",
        consultation: "GH₵200",
        availability: "Available this week",
        verified: true,
        languages: ["English", "French"],
        services: ["Corporate Law", "Contract Drafting", "Legal Consultation", "Business Registration", "Mergers & Acquisitions", "Compliance"],
        about: "Experienced corporate lawyer with 15 years of practice in commercial law, business formation, and legal compliance. I help businesses navigate complex legal challenges and ensure regulatory compliance.",
        education: ["LLB - University of Ghana Law Faculty", "BL - Ghana School of Law", "Master of Laws (LLM) - Harvard Law School", "Corporate Law Specialization"],
        certifications: ["Ghana Bar Association Member", "Corporate Law Specialist", "International Business Law Certified", "Arbitration & Mediation Certified"],
        firm: {
            name: "Darko & Associates Legal",
            address: "Independence Avenue, Ridge, Accra",
            phone: "+233 30 276 5432",
            hours: "Mon-Fri: 8AM-6PM, Sat: 10AM-2PM"
        }
    };

    const reviews = [
        {
            name: "Mr. Joseph Osei",
            rating: 5,
            date: "2 weeks ago",
            comment: "Excellent legal advice for our company merger. Very professional and thorough in explaining complex legal matters."
        },
        {
            name: "Sarah Business Ltd",
            rating: 5,
            date: "1 month ago",
            comment: "Barrister Darko helped us with contract negotiations. Her expertise saved us from potential legal issues. Highly recommend!"
        },
        {
            name: "Kwame Enterprises",
            rating: 4,
            date: "2 months ago",
            comment: "Professional service for business registration and compliance. Clear communication and reasonable fees."
        }
    ];

    const availableSlots = [
        "9:00 AM", "11:00 AM", "2:00 PM", "4:00 PM"
    ];

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
                                                {professional.availability}
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
                                            <button className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-bold hover:from-purple-700 hover:to-indigo-700 transition-all duration-300">
                                                💬 Send Message
                                            </button>
                                            <button className="border border-purple-600 text-purple-600 px-6 py-3 rounded-lg font-bold hover:bg-purple-50 transition-colors">
                                                📞 Call Office
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Services Offered */}
                                <div className="mb-6">
                                    <h3 className="text-xl font-bold text-gray-800 mb-3">💼 Services Offered</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {professional.services.map((service, index) => (
                                            <div key={index} className="bg-purple-50 text-purple-700 px-4 py-2 rounded-lg text-center">
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
                                                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                                                    {edu}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-800 mb-3">🏆 Bar Admissions & Certifications</h3>
                                        <ul className="space-y-2">
                                            {professional.certifications.map((cert, index) => (
                                                <li key={index} className="text-gray-600 flex items-start">
                                                    <span className="w-2 h-2 bg-indigo-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                                                    {cert}
                                                </li>
                                            ))}
                                        </ul>
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

                                {/* Consultation Type */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Consultation Type</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => setConsultationType('virtual')}
                                            className={`p-3 rounded-lg border text-center ${consultationType === 'virtual'
                                                ? 'bg-purple-600 text-white border-purple-600'
                                                : 'bg-gray-50 text-gray-700 border-gray-300'}`}
                                        >
                                            💻 Virtual
                                        </button>
                                        <button
                                            onClick={() => setConsultationType('in-person')}
                                            className={`p-3 rounded-lg border text-center ${consultationType === 'in-person'
                                                ? 'bg-purple-600 text-white border-purple-600'
                                                : 'bg-gray-50 text-gray-700 border-gray-300'}`}
                                        >
                                            🏢 In-Person
                                        </button>
                                    </div>
                                </div>

                                {/* Date Selection */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
                                    <input
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>

                                {/* Time Selection */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Available Times</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {availableSlots.map((time) => (
                                            <button
                                                key={time}
                                                onClick={() => setSelectedTime(time)}
                                                className={`p-2 rounded-lg border text-sm ${selectedTime === time
                                                    ? 'bg-purple-600 text-white border-purple-600'
                                                    : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'}`}
                                            >
                                                {time}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Consultation Fee */}
                                <div className="mb-6 p-4 bg-purple-50 rounded-lg">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-700">Consultation Fee</span>
                                        <span className="text-2xl font-bold text-purple-600">{professional.consultation}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Per hour • Initial consultation</p>
                                </div>

                                {/* Book Button */}
                                <button
                                    disabled={!selectedDate || !selectedTime}
                                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-lg font-bold text-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    💳 Book & Pay Now
                                </button>

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
        </div>
    );
} 