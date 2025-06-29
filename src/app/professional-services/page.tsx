'use client'

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function ProfessionalServices() {
    const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
    const [searchLocation, setSearchLocation] = useState('');
    const [searchService, setSearchService] = useState('');

    // Banner carousel data with professional service themes
    const bannerAds = useMemo(() => [
        {
            image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
            title: "Legal Advisory",
            subtitle: "Expert legal consultation and representation services",
            provider: "Ghana Legal Partners",
            action: "Consult Now"
        },
        {
            image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
            title: "Financial Consulting",
            subtitle: "Professional accounting and financial planning services",
            provider: "FinanceMax Ghana",
            action: "Get Advice"
        },
        {
            image: "https://images.unsplash.com/photo-1560472355-536de3962603?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
            title: "Business Consulting",
            subtitle: "Strategic business advice and growth solutions",
            provider: "BizGrow Consultants",
            action: "Grow Your Business"
        },
        {
            image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
            title: "HR Solutions",
            subtitle: "Complete human resources and recruitment services",
            provider: "TalentPro HR",
            action: "Hire Better"
        }
    ], []);

    // Professional service providers data
    const professionalServiceProviders = [
        {
            id: 1,
            name: "Barrister Kwame Adjei",
            specialty: "Legal Advisory",
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
            rating: 4.9,
            reviews: 142,
            experience: "18 years",
            location: "Accra",
            consultation: "GH₵300",
            availability: "Available this week",
            verified: true,
            specializations: ["Corporate Law", "Contract Law", "Real Estate"],
            services: ["Legal Consultation", "Contract Review", "Business Registration", "Court Representation"],
            description: "Senior barrister specializing in corporate and commercial law with extensive court experience."
        },
        {
            id: 2,
            name: "Sarah Osei, CPA",
            specialty: "Accounting & Finance",
            image: "https://images.unsplash.com/photo-1494790108755-2616b612b282?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
            rating: 4.8,
            reviews: 186,
            experience: "12 years",
            location: "Kumasi",
            consultation: "GH₵250",
            availability: "Available today",
            verified: true,
            specializations: ["Tax Planning", "Financial Audit", "Bookkeeping"],
            services: ["Tax Preparation", "Financial Planning", "Audit Services", "Bookkeeping"],
            description: "Certified Public Accountant providing comprehensive financial services for businesses and individuals."
        },
        {
            id: 3,
            name: "Dr. Emmanuel Boateng",
            specialty: "Business Consulting",
            image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
            rating: 4.9,
            reviews: 97,
            experience: "15 years",
            location: "Accra",
            consultation: "GH₵400",
            availability: "Available tomorrow",
            verified: true,
            specializations: ["Strategy Development", "Market Analysis", "Digital Transformation"],
            services: ["Business Strategy", "Market Research", "Operations Improvement", "Digital Solutions"],
            description: "Business consultant with PhD in Management helping companies achieve sustainable growth."
        },
        {
            id: 4,
            name: "Grace Mensah, SHRM",
            specialty: "Human Resources",
            image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
            rating: 4.7,
            reviews: 128,
            experience: "10 years",
            location: "Tema",
            consultation: "GH₵200",
            availability: "Available now",
            verified: true,
            specializations: ["Talent Acquisition", "Performance Management", "HR Policy"],
            services: ["Recruitment", "Employee Training", "HR Audits", "Policy Development"],
            description: "SHRM certified HR professional specializing in talent management and organizational development."
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
                            <Link href="/" className="text-gray-700 hover:text-purple-600 transition-colors">← Back to Home</Link>
                            <Link href="/auth/signin" className="text-gray-700 hover:text-purple-600 transition-colors">Sign In</Link>
                            <Link href="/auth/provider/signup" className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg transition-all duration-300">Sign Up</Link>
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
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-900/80 to-indigo-900/60"></div>

                            {/* Banner Content */}
                            <div className="absolute inset-0 flex items-center">
                                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                                    <div className="max-w-2xl text-white">
                                        <div className="flex items-center mb-4">
                                            <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold mr-3">
                                                💼 Professional Service
                                            </span>
                                            <span className="text-purple-200">{banner.provider}</span>
                                        </div>
                                        <h1 className="text-5xl md:text-6xl font-bold mb-4">{banner.title}</h1>
                                        <p className="text-xl md:text-2xl mb-8 opacity-90">{banner.subtitle}</p>
                                        <button className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105">
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
                            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>

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
                                                    className="w-full px-4 py-4 pr-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-purple-400/50 focus:border-white/40 transition-all duration-300 hover:bg-white/15 appearance-none cursor-pointer"
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
                                                    className="w-full px-4 py-4 pr-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-purple-400/50 focus:border-white/40 transition-all duration-300 hover:bg-white/15 appearance-none cursor-pointer"
                                                >
                                                    <option value="" className="bg-gray-800 text-white">💼 Professional Service</option>
                                                    <option value="legal" className="bg-gray-800 text-white">Legal Advisory</option>
                                                    <option value="accounting" className="bg-gray-800 text-white">Accounting</option>
                                                    <option value="consulting" className="bg-gray-800 text-white">Business Consulting</option>
                                                    <option value="hr" className="bg-gray-800 text-white">HR Services</option>
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
                                                    placeholder="💰 Budget (e.g., GH₵200-400)"
                                                    className="w-full px-4 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-purple-400/50 focus:border-white/40 transition-all duration-300 hover:bg-white/15"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <button className="w-full bg-gradient-to-r from-purple-500/80 to-indigo-500/80 backdrop-blur-md text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-purple-600/90 hover:to-indigo-600/90 transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center space-x-2 border border-white/20">
                                                <span>🔍</span>
                                                <span>Find Experts</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Professional Service Providers Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-12">
                        <div>
                            <h2 className="text-4xl font-bold mb-4 text-gray-800">Available Professional Service Providers</h2>
                            <p className="text-xl text-gray-600">Expert professionals for your business and legal needs</p>
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
                        {professionalServiceProviders.map((professional) => (
                            <div key={professional.id} className="bg-white rounded-2xl shadow-lg border-l-4 border-purple-500 hover:shadow-xl transition-all duration-300 overflow-hidden">
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
                                                <div className="absolute -bottom-1 -right-1 bg-purple-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">
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

                                            <p className="text-purple-600 font-medium mb-1">{professional.specialty}</p>
                                            <p className="text-gray-500 text-sm mb-2">📍 {professional.location} • {professional.experience} experience</p>

                                            <div className="flex items-center space-x-4 mb-3">
                                                <div className="flex items-center">
                                                    <span className="text-yellow-400 mr-1">⭐</span>
                                                    <span className="font-bold text-gray-800">{professional.rating}</span>
                                                    <span className="text-gray-500 text-sm ml-1">({professional.reviews} reviews)</span>
                                                </div>
                                                <div className="text-2xl font-bold text-purple-600">{professional.consultation}</div>
                                            </div>

                                            <div className="mb-4">
                                                <p className="text-sm text-gray-600 mb-1">Specializations:</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {professional.specializations.map((spec, index) => (
                                                        <span key={index} className="bg-purple-50 text-purple-700 px-2 py-1 rounded text-xs">
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
                                                    href={`/professional-services/professional/${professional.id}`}
                                                    className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 px-4 rounded-lg font-bold text-center hover:from-purple-700 hover:to-indigo-700 transition-all duration-300"
                                                >
                                                    View Profile & Book
                                                </Link>
                                                <button className="border border-purple-600 text-purple-600 py-2 px-4 rounded-lg font-bold hover:bg-purple-50 transition-colors">
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

            {/* Premium Service Section */}
            <section className="py-16 bg-gradient-to-r from-purple-900 to-indigo-900 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-4xl animate-pulse">
                            💼
                        </div>
                    </div>
                    <h2 className="text-4xl font-bold mb-6">Premium Business Solutions</h2>
                    <p className="text-xl mb-8 opacity-90 max-w-3xl mx-auto">
                        Access our premium tier of professionals for comprehensive business solutions and priority support.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105">
                            💎 Premium Services
                        </button>
                        <button className="border-2 border-white text-white hover:bg-white hover:text-purple-600 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105">
                            📞 Enterprise Solutions
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
} 