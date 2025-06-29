'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Healthcare() {
    const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
    const [searchLocation, setSearchLocation] = useState('');
    const [searchService, setSearchService] = useState('');

    // Banner carousel data
    const bannerAds = [
        {
            image: "https://res.cloudinary.com/duhfv8nqy/image/upload/v1749043834/Whisk_3a5c6e228e_g4zhzh.jpg",
            title: "Emergency Care 24/7",
            subtitle: "Available round the clock for your medical needs",
            provider: "City Medical Center",
            action: "Book Now"
        },
        {
            image: "https://res.cloudinary.com/duhfv8nqy/image/upload/v1749035292/Whisk_e237f09aaa_puw1tg.jpg",
            title: "Specialist Consultation",
            subtitle: "Expert doctors in cardiology, neurology & more",
            provider: "Ghana Specialist Hospital",
            action: "Consult Today"
        },
        {
            image: "https://res.cloudinary.com/duhfv8nqy/image/upload/v1749035298/Whisk_87c9b31242_r6pu3d.jpg",
            title: "Home Nursing Care",
            subtitle: "Professional nursing services at your doorstep",
            provider: "CareFirst Home Services",
            action: "Get Care"
        },
        {
            image: "https://res.cloudinary.com/duhfv8nqy/image/upload/v1749035296/Whisk_ff2bd67a07_wdcpje.jpg",
            title: "Mental Health Support",
            subtitle: "Confidential therapy & counseling sessions",
            provider: "Wellness Psychology Center",
            action: "Start Healing"
        }
    ];

    // Healthcare professionals data
    const healthcareProfessionals = [
        {
            id: 1,
            name: "Dr. Kwame Asante",
            specialty: "General Practice",
            image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
            rating: 4.9,
            reviews: 156,
            experience: "15 years",
            location: "Accra Central",
            consultation: "GH₵80",
            availability: "Available today",
            verified: true,
            languages: ["English", "Twi"],
            services: ["General Consultation", "Health Checkups", "Vaccinations"]
        },
        {
            id: 2,
            name: "Dr. Ama Osei",
            specialty: "Pediatrics",
            image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
            rating: 4.8,
            reviews: 203,
            experience: "12 years",
            location: "Kumasi",
            consultation: "GH₵100",
            availability: "Available tomorrow",
            verified: true,
            languages: ["English", "Twi", "Ga"],
            services: ["Child Healthcare", "Immunizations", "Growth Monitoring"]
        },
        {
            id: 3,
            name: "Nurse Sarah Mensah",
            specialty: "Home Care Nursing",
            image: "https://images.unsplash.com/photo-1594824724159-9d0d18e2d4d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
            rating: 4.9,
            reviews: 89,
            experience: "8 years",
            location: "Tema",
            consultation: "GH₵60",
            availability: "Available now",
            verified: true,
            languages: ["English", "Ga"],
            services: ["Wound Care", "Medication Administration", "Patient Monitoring"]
        },
        {
            id: 4,
            name: "Dr. Kofi Mensah",
            specialty: "Cardiology",
            image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
            rating: 4.7,
            reviews: 124,
            experience: "20 years",
            location: "Accra",
            consultation: "GH₵200",
            availability: "Available this week",
            verified: true,
            languages: ["English", "Twi"],
            services: ["Heart Consultation", "ECG Reading", "Blood Pressure Management"]
        }
    ];

    // Auto-advance carousel
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentBannerIndex((prev) => (prev + 1) % bannerAds.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [bannerAds.length]);

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
                            <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors">← Back to Home</Link>
                            <Link href="/auth/signin" className="text-gray-700 hover:text-blue-600 transition-colors">Sign In</Link>
                            <Link href="/auth/provider/signup" className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-4 py-2 rounded-lg transition-all duration-300">Sign Up</Link>
                            <Link href="/contact" className="btn-secondary">Contact Us</Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Banner Carousel */}
            <section className="relative pt-16 h-screen overflow-hidden">
                <div className="relative w-full h-full">
                    {bannerAds.map((banner, index) => (
                        <div
                            key={index}
                            className={`absolute inset-0 transition-opacity duration-1000 ${index === currentBannerIndex ? 'opacity-100' : 'opacity-0'
                                }`}
                        >
                            <Image
                                src={banner.image}
                                alt={banner.title}
                                fill
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 to-green-900/50"></div>

                            {/* Banner Content */}
                            <div className="absolute inset-0 flex items-center">
                                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                                    <div className="max-w-2xl text-white">
                                        <div className="flex items-center mb-4">
                                            <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold mr-3">
                                                🏥 Featured Service
                                            </span>
                                            <span className="text-blue-200">{banner.provider}</span>
                                        </div>
                                        <h1 className="text-5xl md:text-6xl font-bold mb-4">{banner.title}</h1>
                                        <p className="text-xl md:text-2xl mb-8 opacity-90">{banner.subtitle}</p>
                                        <button className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105">
                                            {banner.action}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Progress Indicators */}
                    <div className="absolute right-8 top-1/2 transform -translate-y-1/2 z-20">
                        <div className="flex flex-col space-y-2">
                            {bannerAds.map((_, index) => (
                                <div key={index} className="relative">
                                    <div className="w-1 h-12 bg-white/30 rounded-full"></div>
                                    <div
                                        className={`absolute top-0 w-1 bg-white rounded-full transition-all duration-5000 ease-linear ${index === currentBannerIndex ? 'h-12' : 'h-0'
                                            }`}
                                    ></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Enhanced Glassmorphism Search Overlay */}
                    <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 w-full max-w-6xl px-4">
                        <div className="relative group">
                            {/* Glow effect */}
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-green-600/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>

                            {/* Main search container */}
                            <div className="relative bg-white/10 backdrop-blur-2xl rounded-2xl p-6 shadow-2xl border border-white/20 hover:border-white/30 transition-all duration-300">
                                {/* Subtle background pattern */}
                                <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent rounded-2xl"></div>

                                <div className="relative z-10">
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                        <div className="space-y-2">
                                            <div className="relative">
                                                <select
                                                    value={searchLocation}
                                                    onChange={(e) => setSearchLocation(e.target.value)}
                                                    className="w-full px-4 py-4 pr-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-blue-400/50 focus:border-white/40 transition-all duration-300 hover:bg-white/15 appearance-none cursor-pointer"
                                                >
                                                    <option value="" className="bg-gray-800 text-white">📍 Select Location</option>
                                                    <option value="accra" className="bg-gray-800 text-white">Accra</option>
                                                    <option value="kumasi" className="bg-gray-800 text-white">Kumasi</option>
                                                    <option value="tamale" className="bg-gray-800 text-white">Tamale</option>
                                                    <option value="cape-coast" className="bg-gray-800 text-white">Cape Coast</option>
                                                </select>
                                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                    <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="relative">
                                                <select
                                                    value={searchService}
                                                    onChange={(e) => setSearchService(e.target.value)}
                                                    className="w-full px-4 py-4 pr-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-blue-400/50 focus:border-white/40 transition-all duration-300 hover:bg-white/15 appearance-none cursor-pointer"
                                                >
                                                    <option value="" className="bg-gray-800 text-white">🏥 Healthcare Service</option>
                                                    <option value="general" className="bg-gray-800 text-white">General Practice</option>
                                                    <option value="specialist" className="bg-gray-800 text-white">Specialist Consultation</option>
                                                    <option value="nursing" className="bg-gray-800 text-white">Nursing Care</option>
                                                    <option value="emergency" className="bg-gray-800 text-white">Emergency Services</option>
                                                    <option value="mental-health" className="bg-gray-800 text-white">Mental Health</option>
                                                </select>
                                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                    <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    placeholder="💰 Budget (e.g., GH₵50-100)"
                                                    className="w-full px-4 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-blue-400/50 focus:border-white/40 transition-all duration-300 hover:bg-white/15"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <button className="w-full bg-gradient-to-r from-blue-500/80 to-green-500/80 backdrop-blur-md text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-blue-600/90 hover:to-green-600/90 transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center space-x-2 border border-white/20">
                                                <span>🔍</span>
                                                <span>Find Providers</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Healthcare Professionals Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-12">
                        <div>
                            <h2 className="text-4xl font-bold mb-4 text-gray-800">Available Healthcare Professionals</h2>
                            <p className="text-xl text-gray-600">Verified doctors and nurses ready to help you</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <select className="px-4 py-2 border border-gray-300 rounded-lg">
                                <option>Sort by Rating</option>
                                <option>Sort by Price</option>
                                <option>Sort by Experience</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {healthcareProfessionals.map((professional) => (
                            <div key={professional.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden">
                                <div className="p-6">
                                    <div className="flex items-start space-x-4">
                                        <div className="relative">
                                            <Image
                                                src={professional.image}
                                                alt={professional.name}
                                                width={80}
                                                height={80}
                                                className="rounded-full object-cover"
                                            />
                                            {professional.verified && (
                                                <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">
                                                    ✓
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="text-xl font-bold text-gray-800">{professional.name}</h3>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${professional.availability === 'Available now'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {professional.availability}
                                                </span>
                                            </div>

                                            <p className="text-blue-600 font-medium mb-1">{professional.specialty}</p>
                                            <p className="text-gray-500 text-sm mb-2">📍 {professional.location} • {professional.experience} experience</p>

                                            <div className="flex items-center space-x-4 mb-3">
                                                <div className="flex items-center">
                                                    <span className="text-yellow-400 mr-1">⭐</span>
                                                    <span className="font-bold text-gray-800">{professional.rating}</span>
                                                    <span className="text-gray-500 text-sm ml-1">({professional.reviews} reviews)</span>
                                                </div>
                                                <div className="text-2xl font-bold text-blue-600">{professional.consultation}</div>
                                            </div>

                                            <div className="flex items-center space-x-2 mb-4">
                                                <span className="text-sm text-gray-600">Languages:</span>
                                                {professional.languages.map((lang, index) => (
                                                    <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                                                        {lang}
                                                    </span>
                                                ))}
                                            </div>

                                            <div className="mb-4">
                                                <p className="text-sm text-gray-600 mb-1">Services:</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {professional.services.map((service, index) => (
                                                        <span key={index} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">
                                                            {service}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="flex space-x-3">
                                                <Link
                                                    href={`/healthcare/professional/${professional.id}`}
                                                    className="flex-1 bg-gradient-to-r from-blue-600 to-green-600 text-white py-2 px-4 rounded-lg font-bold text-center hover:from-blue-700 hover:to-green-700 transition-all duration-300"
                                                >
                                                    View Profile & Book
                                                </Link>
                                                <button className="border border-blue-600 text-blue-600 py-2 px-4 rounded-lg font-bold hover:bg-blue-50 transition-colors">
                                                    💬 Message
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-12">
                        <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-8 py-3 rounded-lg font-bold transition-colors">
                            Load More Professionals
                        </button>
                    </div>
                </div>
            </section>

            {/* Emergency Section */}
            <section className="py-16 bg-gradient-to-r from-red-600 to-orange-600 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-4xl animate-pulse">
                            🚨
                        </div>
                    </div>
                    <h2 className="text-4xl font-bold mb-6">Medical Emergency?</h2>
                    <p className="text-xl mb-8 opacity-90 max-w-3xl mx-auto">
                        Access immediate medical assistance 24/7. Our emergency response team is ready to help you.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button className="bg-white text-red-600 hover:bg-gray-100 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105">
                            📞 Call Emergency Line
                        </button>
                        <button className="border-2 border-white text-white hover:bg-white hover:text-red-600 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105">
                            🏥 Find Nearest Hospital
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
} 