'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function HomeServices() {
    const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
    const [searchLocation, setSearchLocation] = useState('');
    const [searchService, setSearchService] = useState('');

    // Banner carousel data with home service themes
    const bannerAds = [
        {
            image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
            title: "Professional Cleaning",
            subtitle: "Deep cleaning services for homes and offices",
            provider: "CleanPro Ghana",
            action: "Book Now"
        },
        {
            image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
            title: "Expert Plumbing",
            subtitle: "24/7 plumbing repairs and installation services",
            provider: "PlumbFix Solutions",
            action: "Get Help"
        },
        {
            image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
            title: "Electrical Services",
            subtitle: "Safe and reliable electrical work by certified electricians",
            provider: "PowerCare Electricians",
            action: "Schedule"
        },
        {
            image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
            title: "Garden & Landscaping",
            subtitle: "Transform your outdoor space with professional gardening",
            provider: "GreenThumb Gardens",
            action: "Design Now"
        }
    ];

    // Home service professionals data
    const homeServiceProfessionals = [
        {
            id: 1,
            name: "Akosua Cleaning Services",
            specialty: "Professional Cleaning",
            image: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
            rating: 4.9,
            reviews: 187,
            experience: "6 years",
            location: "Accra",
            consultation: "GH₵50",
            availability: "Available today",
            verified: true,
            specializations: ["Deep Cleaning", "Office Cleaning", "Move-in/out"],
            services: ["House Cleaning", "Carpet Cleaning", "Window Cleaning", "Post-Construction"],
            description: "Professional cleaning service with eco-friendly products and experienced staff."
        },
        {
            id: 2,
            name: "Kwame the Plumber",
            specialty: "Plumbing Services",
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
            rating: 4.8,
            reviews: 156,
            experience: "12 years",
            location: "Kumasi",
            consultation: "GH₵60",
            availability: "Available now",
            verified: true,
            specializations: ["Pipe Repair", "Drain Cleaning", "Installation"],
            services: ["Emergency Plumbing", "Toilet Repair", "Water Heater", "Leak Detection"],
            description: "Licensed plumber providing reliable services for all your plumbing needs."
        },
        {
            id: 3,
            name: "ElectroFix Team",
            specialty: "Electrical Services",
            image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
            rating: 4.7,
            reviews: 134,
            experience: "10 years",
            location: "Accra",
            consultation: "GH₵80",
            availability: "Available tomorrow",
            verified: true,
            specializations: ["Wiring", "Panel Upgrade", "Smart Home"],
            services: ["Electrical Repair", "Installation", "Safety Inspection", "LED Upgrade"],
            description: "Certified electricians specializing in residential and commercial electrical work."
        },
        {
            id: 4,
            name: "Green Paradise Gardening",
            specialty: "Gardening & Landscaping",
            image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
            rating: 4.9,
            reviews: 98,
            experience: "8 years",
            location: "Tema",
            consultation: "GH₵70",
            availability: "Available this week",
            verified: true,
            specializations: ["Landscape Design", "Lawn Care", "Tree Service"],
            services: ["Garden Design", "Lawn Maintenance", "Plant Installation", "Irrigation"],
            description: "Professional landscaping service creating beautiful outdoor spaces."
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
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
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
                            <Link href="/" className="text-gray-700 hover:text-green-600 transition-colors">← Back to Home</Link>
                            <Link href="/auth/signin" className="text-gray-700 hover:text-green-600 transition-colors">Sign In</Link>
                            <Link href="/auth/provider/signup" className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-300">Sign Up</Link>
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
                            <div className="absolute inset-0 bg-gradient-to-r from-green-900/80 to-blue-900/60"></div>

                            {/* Banner Content */}
                            <div className="absolute inset-0 flex items-center">
                                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                                    <div className="max-w-2xl text-white">
                                        <div className="flex items-center mb-4">
                                            <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-bold mr-3">
                                                🏠 Home Service
                                            </span>
                                            <span className="text-green-200">{banner.provider}</span>
                                        </div>
                                        <h1 className="text-5xl md:text-6xl font-bold mb-4">{banner.title}</h1>
                                        <p className="text-xl md:text-2xl mb-8 opacity-90">{banner.subtitle}</p>
                                        <button className="bg-white text-green-600 hover:bg-gray-100 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105">
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
                            <div className="absolute -inset-1 bg-gradient-to-r from-green-600/20 to-blue-600/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>

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
                                                    className="w-full px-4 py-4 pr-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-green-400/50 focus:border-white/40 transition-all duration-300 hover:bg-white/15 appearance-none cursor-pointer"
                                                >
                                                    <option value="" className="bg-gray-800 text-white">📍 Select Location</option>
                                                    <option value="accra" className="bg-gray-800 text-white">Accra</option>
                                                    <option value="kumasi" className="bg-gray-800 text-white">Kumasi</option>
                                                    <option value="tamale" className="bg-gray-800 text-white">Tamale</option>
                                                    <option value="tema" className="bg-gray-800 text-white">Tema</option>
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
                                                    className="w-full px-4 py-4 pr-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-green-400/50 focus:border-white/40 transition-all duration-300 hover:bg-white/15 appearance-none cursor-pointer"
                                                >
                                                    <option value="" className="bg-gray-800 text-white">🏠 Home Service</option>
                                                    <option value="cleaning" className="bg-gray-800 text-white">Professional Cleaning</option>
                                                    <option value="plumbing" className="bg-gray-800 text-white">Plumbing</option>
                                                    <option value="electrical" className="bg-gray-800 text-white">Electrical</option>
                                                    <option value="gardening" className="bg-gray-800 text-white">Gardening</option>
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
                                                    placeholder="💰 Budget (e.g., GH₵50-70)"
                                                    className="w-full px-4 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-green-400/50 focus:border-white/40 transition-all duration-300 hover:bg-white/15"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <button className="w-full bg-gradient-to-r from-green-500/80 to-blue-500/80 backdrop-blur-md text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-green-600/90 hover:to-blue-600/90 transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center space-x-2 border border-white/20">
                                                <span>🔍</span>
                                                <span>Find Services</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Home Service Professionals Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-12">
                        <div>
                            <h2 className="text-4xl font-bold mb-4 text-gray-800">Available Home Service Professionals</h2>
                            <p className="text-xl text-gray-600">Trusted experts for all your home maintenance needs</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <select className="px-4 py-2 border border-gray-300 rounded-lg">
                                <option>Sort by Rating</option>
                                <option>Sort by Price</option>
                                <option>Sort by Experience</option>
                                <option>Sort by Distance</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {homeServiceProfessionals.map((professional) => (
                            <div key={professional.id} className="bg-white rounded-2xl shadow-lg border-l-4 border-green-500 hover:shadow-xl transition-all duration-300 overflow-hidden">
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
                                                <div className="absolute -bottom-1 -right-1 bg-green-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">
                                                    ✓
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="text-xl font-bold text-gray-800">{professional.name}</h3>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${professional.availability === 'Available now'
                                                    ? 'bg-green-100 text-green-800'
                                                    : professional.availability === 'Available today'
                                                        ? 'bg-blue-100 text-blue-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {professional.availability}
                                                </span>
                                            </div>

                                            <p className="text-green-600 font-medium mb-1">{professional.specialty}</p>
                                            <p className="text-gray-500 text-sm mb-2">📍 {professional.location} • {professional.experience} experience</p>

                                            <div className="flex items-center space-x-4 mb-3">
                                                <div className="flex items-center">
                                                    <span className="text-yellow-400 mr-1">⭐</span>
                                                    <span className="font-bold text-gray-800">{professional.rating}</span>
                                                    <span className="text-gray-500 text-sm ml-1">({professional.reviews} reviews)</span>
                                                </div>
                                                <div className="text-2xl font-bold text-green-600">{professional.consultation}</div>
                                            </div>

                                            <div className="mb-4">
                                                <p className="text-sm text-gray-600 mb-1">Specializations:</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {professional.specializations.map((spec, index) => (
                                                        <span key={index} className="bg-green-50 text-green-700 px-2 py-1 rounded text-xs">
                                                            {spec}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="mb-4">
                                                <p className="text-sm text-gray-600 mb-1">Services:</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {professional.services.slice(0, 3).map((service, index) => (
                                                        <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                                                            {service}
                                                        </span>
                                                    ))}
                                                    {professional.services.length > 3 && (
                                                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                                                            +{professional.services.length - 3} more
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex space-x-3">
                                                <Link
                                                    href={`/home-services/professional/${professional.id}`}
                                                    className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 text-white py-2 px-4 rounded-lg font-bold text-center hover:from-green-700 hover:to-blue-700 transition-all duration-300"
                                                >
                                                    View Profile & Book
                                                </Link>
                                                <button className="border border-green-600 text-green-600 py-2 px-4 rounded-lg font-bold hover:bg-green-50 transition-colors">
                                                    📞 Call
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

            {/* Emergency Service Section */}
            <section className="py-16 bg-gradient-to-r from-green-900 to-blue-900 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-4xl animate-pulse">
                            🚨
                        </div>
                    </div>
                    <h2 className="text-4xl font-bold mb-6">Emergency Home Services</h2>
                    <p className="text-xl mb-8 opacity-90 max-w-3xl mx-auto">
                        24/7 emergency services for urgent home repairs. Our rapid response team is ready to help.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button className="bg-white text-green-600 hover:bg-gray-100 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105">
                            📞 Emergency Hotline
                        </button>
                        <button className="border-2 border-white text-white hover:bg-white hover:text-green-600 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105">
                            🏠 Mobile Service
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
} 