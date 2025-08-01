'use client'

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import CategoryNavbar from '@/components/CategoryNavbar';

export default function Technical() {
    const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
    const [searchLocation, setSearchLocation] = useState('');
    const [searchService, setSearchService] = useState('');
    const [expandedDescriptions, setExpandedDescriptions] = useState<{ [key: number]: boolean }>({});
    const [sortBy, setSortBy] = useState('rating'); // Default sort by rating

    // Toggle description expansion
    const toggleDescription = (professionalId: number) => {
        setExpandedDescriptions(prev => ({
            ...prev,
            [professionalId]: !prev[professionalId]
        }));
    };

    // Truncate description helper
    const truncateDescription = (description: string, maxLength: number = 100) => {
        if (!description) return '';
        return description.length <= maxLength
            ? description
            : description.substring(0, maxLength) + '...';
    };

    // Sort professionals helper
    const sortProfessionals = (professionals: any[], sortOption: string) => {
        const sorted = [...professionals];

        switch (sortOption) {
            case 'rating':
                return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            case 'price':
                return sorted.sort((a, b) => {
                    const priceA = parseFloat((a.consultation || '0').replace(/[^\d.]/g, ''));
                    const priceB = parseFloat((b.consultation || '0').replace(/[^\d.]/g, ''));
                    return priceA - priceB;
                });
            case 'experience':
                return sorted.sort((a, b) => {
                    const expA = parseFloat((a.experience || '0').replace(/[^\d.]/g, ''));
                    const expB = parseFloat((b.experience || '0').replace(/[^\d.]/g, ''));
                    return expB - expA;
                });
            case 'reviews':
                return sorted.sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
            default:
                return sorted;
        }
    };


    // Banner carousel data with technical service themes
    const bannerAds = [
        {
            image: "https://res.cloudinary.com/duhfv8nqy/image/upload/v1749035298/Whisk_007be73391_kmjxjo.jpg",
            title: "Auto Repair Experts",
            subtitle: "Professional car maintenance and repair services",
            provider: "AutoCare Ghana",
            action: "Book Service"
        },
        {
            image: "https://res.cloudinary.com/duhfv8nqy/image/upload/v1749043834/Whisk_83033dc1db_fdtpro.jpg",
            title: "Electronics Repair",
            subtitle: "Fix smartphones, laptops, and all electronic devices",
            provider: "TechFix Solutions",
            action: "Get Quote"
        },
        {
            image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
            title: "Home Appliance Repair",
            subtitle: "Refrigerators, washing machines, and air conditioners",
            provider: "HomeRepair Plus",
            action: "Schedule Now"
        },
        {
            image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
            title: "IT Support Services",
            subtitle: "Network setup, troubleshooting, and data recovery",
            provider: "Ghana IT Solutions",
            action: "Get Help"
        }
    ];

    // State for real technical data
    const [technicalProfessionals, setTechnicalProfessionals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Computed sorted professionals
    const sortedProfessionals = useMemo(() => {
        return sortProfessionals(technicalProfessionals, sortBy);
    }, [technicalProfessionals, sortBy]);

    // Fetch real technical professionals and services
    useEffect(() => {
        const fetchTechnicalData = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/explore?category=technical&limit=50');
                const data = await response.json();
                if (data.success && data.items) {
                    const transformedData = data.items.map((item: any) => ({
                        id: item.realProviderId || item.id,
                        name: item.name,
                        specialty: item.type === 'professional' ? item.category.charAt(0).toUpperCase() + item.category.slice(1) : item.title,
                        image: item.image,
                        rating: item.rating,
                        reviews: item.reviews || 0,
                        experience: item.type === 'professional' ? "Technical Professional" : "Service Provider",
                        location: item.location,
                        consultation: item.price,
                        availability: item.availability || item.badge,
                        verified: item.isVerified || false,
                        specializations: item.type === 'professional' ? (item.specialties || item.skills || []).slice(0, 3) : [item.category],
                        services: item.type === 'professional' ? (item.specialties || item.skills || []).slice(0, 4) : [item.name],
                        description: item.description || item.title || "Experienced technical professional"
                    }));
                    setTechnicalProfessionals(transformedData);
                } else {
                    setError('Failed to load technical professionals. Please try again later.');
                }
            } catch (error) {
                setError('Failed to load technical professionals. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        fetchTechnicalData();
    }, []);

    // Fallback dummy data
    const fallbackTechnicalProfessionals = [
        {
            id: 1,
            name: "Kwame Boateng",
            specialty: "Auto Mechanic",
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
            rating: 4.8,
            reviews: 142,
            experience: "12 years",
            location: "Accra",
            consultation: "GH₵60",
            availability: "Available today",
            verified: true,
            specializations: ["Engine Repair", "Brake Service", "AC Repair"],
            services: ["Oil Change", "Brake Repair", "Engine Diagnostics", "Air Conditioning"],
            description: "Expert automotive technician specializing in all vehicle makes and models."
        },
        {
            id: 2,
            name: "Sarah Techie",
            specialty: "Electronics Repair Specialist",
            image: "https://images.unsplash.com/photo-1494790108755-2616b612b282?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
            rating: 4.9,
            reviews: 98,
            experience: "8 years",
            location: "Kumasi",
            consultation: "GH₵50",
            availability: "Available now",
            verified: true,
            specializations: ["Smartphone Repair", "Laptop Repair", "Circuit Board"],
            services: ["Screen Replacement", "Battery Replacement", "Water Damage Repair", "Software Issues"],
            description: "Professional electronics technician with expertise in mobile devices and computers."
        },
        {
            id: 3,
            name: "Emmanuel Kwaku",
            specialty: "Appliance Technician",
            image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
            rating: 4.7,
            reviews: 156,
            experience: "15 years",
            location: "Tema",
            consultation: "GH₵70",
            availability: "Available tomorrow",
            verified: true,
            specializations: ["Refrigerator", "Washing Machine", "Air Conditioner"],
            services: ["Appliance Repair", "Maintenance", "Installation", "Troubleshooting"],
            description: "Experienced home appliance repair specialist with factory training certification."
        },
        {
            id: 4,
            name: "Joseph IT",
            specialty: "IT Support Engineer",
            image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
            rating: 4.9,
            reviews: 73,
            experience: "10 years",
            location: "Accra",
            consultation: "GH₵100",
            availability: "Available this week",
            verified: true,
            specializations: ["Network Setup", "Data Recovery", "System Admin"],
            services: ["Network Installation", "Data Backup", "System Optimization", "Security Setup"],
            description: "Certified IT professional providing comprehensive technology solutions for businesses and homes."
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
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-gray-50 to-red-50">
            {/* Navigation */}
            <CategoryNavbar
                backText="← Back to Home"
                backHref="/"
                hoverColor="text-orange-600 dark:hover:text-orange-400"
                bgGradient="from-orange-50 via-gray-50 to-red-50"
            />

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
                            <div className="absolute inset-0 bg-gradient-to-r from-orange-900/80 to-red-900/60"></div>

                            {/* Banner Content */}
                            <div className="absolute inset-0 flex items-center">
                                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                                    <div className="max-w-2xl text-white">
                                        <div className="flex items-center mb-4">
                                            <span className="bg-orange-600 text-white px-3 py-1 rounded-full text-sm font-bold mr-3">
                                                🔧 Expert Service
                                            </span>
                                            <span className="text-orange-200">{banner.provider}</span>
                                        </div>
                                        <h1 className="text-5xl md:text-6xl font-bold mb-4">{banner.title}</h1>
                                        <p className="text-xl md:text-2xl mb-8 opacity-90">{banner.subtitle}</p>
                                        <button className="bg-white text-orange-600 hover:bg-gray-100 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105">
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
                            <div className="absolute -inset-1 bg-gradient-to-r from-orange-600/20 to-red-600/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>

                            {/* Main search container */}
                            <div className="relative bg-white/10 backdrop-blur-3xl rounded-2xl sm:rounded-full px-3 sm:px-6 py-3 sm:py-3 shadow-2xl border border-white/20 hover:border-white/30 transition-all duration-300">

                                {/* Mobile Layout (Stacked) */}
                                <div className="block sm:hidden space-y-3">
                                    {/* Row 1: Location and Service */}
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <select
                                                value={searchLocation}
                                                onChange={(e) => setSearchLocation(e.target.value)}
                                                className="w-full px-3 py-3 bg-white/10 backdrop-blur-md border-0 rounded-full text-white text-sm placeholder-white/70 focus:ring-2 focus:ring-orange-400/50 transition-all duration-300 hover:bg-white/15 appearance-none cursor-pointer"
                                            >
                                                <option value="">📍 Location</option>
                                                <option value="accra">Accra</option>
                                                <option value="kumasi">Kumasi</option>
                                                <option value="tamale">Tamale</option>
                                                <option value="tema">Tema</option>
                                            </select>
                                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="relative flex-1">
                                            <select
                                                value={searchService}
                                                onChange={(e) => setSearchService(e.target.value)}
                                                className="w-full px-3 py-3 bg-white/10 backdrop-blur-md border-0 rounded-full text-white text-sm placeholder-white/70 focus:ring-2 focus:ring-orange-400/50 transition-all duration-300 hover:bg-white/15 appearance-none cursor-pointer"
                                            >
                                                <option value="">🔧 Service</option>
                                                <option value="auto">Auto Repair</option>
                                                <option value="electronics">Electronics Repair</option>
                                                <option value="appliances">Appliance Repair</option>
                                                <option value="it">IT Support</option>
                                                <option value="hvac">HVAC Services</option>
                                            </select>
                                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Row 2: Budget and Keywords */}
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <input
                                                type="text"
                                                placeholder="💰 Budget"
                                                className="w-full px-3 py-3 bg-white/10 backdrop-blur-md border-0 rounded-full text-white text-sm placeholder-white/70 focus:ring-2 focus:ring-orange-400/50 transition-all duration-300 hover:bg-white/15"
                                            />
                                        </div>
                                        <div className="relative flex-1">
                                            <input
                                                type="text"
                                                placeholder="🔍 Keywords"
                                                className="w-full px-3 py-3 bg-white/10 backdrop-blur-md border-0 rounded-full text-white text-sm placeholder-white/70 focus:ring-2 focus:ring-orange-400/50 transition-all duration-300 hover:bg-white/15"
                                            />
                                        </div>
                                    </div>

                                    {/* Row 3: Action Buttons */}
                                    <div className="flex gap-2">
                                        <button className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-4 py-3 rounded-full font-semibold text-sm transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center gap-2 border border-white/20">
                                            <span>🔍</span>
                                            <span>Search</span>
                                        </button>
                                        <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-3 rounded-full font-medium text-sm transition-all duration-300 border border-white/20">
                                            Reset
                                        </button>
                                    </div>
                                </div>

                                {/* Desktop Layout (Horizontal) */}
                                <div className="hidden sm:grid sm:grid-cols-4 gap-4 items-end">
                                    <div className="relative">
                                        <select
                                            value={searchLocation}
                                            onChange={(e) => setSearchLocation(e.target.value)}
                                            className="w-full px-4 py-4 pr-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-orange-400/50 focus:border-white/40 transition-all duration-300 hover:bg-white/15 appearance-none cursor-pointer"
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

                                    <div className="relative">
                                        <select
                                            value={searchService}
                                            onChange={(e) => setSearchService(e.target.value)}
                                            className="w-full px-4 py-4 pr-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-orange-400/50 focus:border-white/40 transition-all duration-300 hover:bg-white/15 appearance-none cursor-pointer"
                                        >
                                            <option value="" className="bg-gray-800 text-white">🔧 Technical Service</option>
                                            <option value="auto" className="bg-gray-800 text-white">Auto Repair</option>
                                            <option value="electronics" className="bg-gray-800 text-white">Electronics Repair</option>
                                            <option value="appliances" className="bg-gray-800 text-white">Appliance Repair</option>
                                            <option value="it" className="bg-gray-800 text-white">IT Support</option>
                                            <option value="hvac" className="bg-gray-800 text-white">HVAC Services</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                            <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="💰 Budget (e.g., GH₵40-80)"
                                            className="w-full px-4 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-orange-400/50 focus:border-white/40 transition-all duration-300 hover:bg-white/15"
                                        />
                                    </div>

                                    <button className="w-full bg-gradient-to-r from-orange-500/80 to-red-500/80 backdrop-blur-md text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-orange-600/90 hover:to-red-600/90 transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center space-x-2 border border-white/20">
                                        <span>🔍</span>
                                        <span>Find Technicians</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Technical Professionals Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-12">
                        <div>
                            <h2 className="text-4xl font-bold mb-4 text-gray-800">Available Technical Experts</h2>
                            <p className="text-xl text-gray-600">Certified technicians ready to solve your problems</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                            >
                                <option value="rating">Sort by Rating</option>
                                <option value="price">Sort by Price (Low to High)</option>
                                <option value="experience">Sort by Experience</option>
                                <option value="reviews">Sort by Reviews</option>
                            </select>
                        </div>
                    </div>

                    {/* Loading/Error/Empty States */}
                    {loading && (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading technical professionals...</p>
                        </div>
                    )}
                    {error && (
                        <div className="text-center py-12">
                            <div className="text-red-500 text-6xl mb-4">⚠️</div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Failed to Load Data</h3>
                            <p className="text-gray-600 mb-4">{error}</p>
                            <button onClick={() => window.location.reload()} className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg transition-colors">Try Again</button>
                        </div>
                    )}
                    {!loading && !error && technicalProfessionals.length === 0 && (
                        <div className="text-center py-12">
                            <div className="text-gray-400 text-6xl mb-4">🔧</div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No Technical Professionals Found</h3>
                            <p className="text-gray-600 mb-4">We&apos;re working to add more technical experts to our platform.</p>
                            <Link href="/explore" className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg transition-colors inline-block">Explore Other Categories</Link>
                        </div>
                    )}
                    {!loading && !error && technicalProfessionals.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {sortedProfessionals.map((professional: any) => (
                                <div key={professional.id} className="group relative">
                                    {/* Glass Effect Background */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-orange-400/10 via-transparent to-red-400/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>

                                    <div className="relative bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700/50 hover:shadow-3xl hover:scale-[1.02] transition-all duration-500 overflow-hidden">

                                        {/* Large Image Section */}
                                        <div className="relative">
                                            <div className="aspect-[4/3] sm:aspect-[3/2] relative overflow-hidden">
                                                <Image
                                                    src={professional.image}
                                                    alt={professional.name}
                                                    fill
                                                    className="object-cover"
                                                    priority={false}
                                                    unoptimized={false}
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>

                                                {/* Verification Badge */}
                                                {professional.verified && (
                                                    <div className="absolute top-3 right-3 bg-gradient-to-r from-orange-500 to-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white">
                                                        ✓
                                                    </div>
                                                )}

                                                {/* Availability Badge */}
                                                <div className="absolute top-3 left-3">
                                                    <span className={`px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md ${professional.availability === 'Available now'
                                                        ? 'bg-green-500/20 text-green-700 border border-green-500/30'
                                                        : professional.availability === 'Available today'
                                                            ? 'bg-blue-500/20 text-blue-700 border border-blue-500/30'
                                                            : 'bg-amber-500/20 text-amber-700 border border-amber-500/30'
                                                        }`}>
                                                        {typeof professional.availability === 'string' ? professional.availability : 'Available'}
                                                    </span>
                                                </div>

                                                {/* Price Overlay at Bottom */}
                                                <div className="absolute bottom-3 right-3 text-right">
                                                    <div className="text-xl sm:text-2xl font-bold text-white drop-shadow-lg">
                                                        {professional.consultation}
                                                    </div>
                                                    <div className="text-xs text-white/80">per service</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Content Section */}
                                        <div className="p-4">
                                            {/* Name and Specialty */}
                                            <div className="mb-3">
                                                <h3 className="text-lg font-bold text-gray-800 dark:text-white group-hover:text-orange-600 transition-colors mb-1">
                                                    {professional.name}
                                                </h3>
                                                <p className="text-orange-600 dark:text-orange-400 font-semibold text-sm">{professional.specialty}</p>
                                                <p className="text-xs text-gray-600 dark:text-gray-300 flex items-center gap-1 mt-1">
                                                    <span>📍</span>
                                                    <span>{professional.location}</span>
                                                    <span>•</span>
                                                    <span>{professional.experience}</span>
                                                </p>
                                            </div>

                                            {/* Rating */}
                                            <div className="flex items-center gap-2 mb-3">
                                                <div className="flex items-center gap-1">
                                                    <span className="text-yellow-400 text-sm">⭐</span>
                                                    <span className="font-bold text-gray-800 dark:text-white text-sm">{professional.rating}</span>
                                                </div>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">({professional.reviews} reviews)</span>
                                            </div>

                                            {/* Short Description */}
                                            {professional.description && (
                                                <div className="mb-3">
                                                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                                                        {expandedDescriptions[professional.id]
                                                            ? professional.description
                                                            : truncateDescription(professional.description, 60)
                                                        }
                                                        {professional.description.length > 60 && (
                                                            <button
                                                                onClick={() => toggleDescription(professional.id)}
                                                                className="ml-1 text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-medium underline focus:outline-none transition-colors"
                                                            >
                                                                {expandedDescriptions[professional.id] ? 'Less' : 'More'}
                                                            </button>
                                                        )}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Specializations Tags */}
                                            <div className="flex flex-wrap gap-1.5 mb-4">
                                                {professional.specializations.slice(0, 2).map((spec: string, index: number) => (
                                                    <span key={index} className="bg-orange-500/10 text-orange-700 dark:text-orange-300 px-2 py-1 rounded-full text-xs font-medium border border-orange-500/20">
                                                        {spec}
                                                    </span>
                                                ))}
                                                {professional.specializations.length > 2 && (
                                                    <span className="bg-gray-500/10 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full text-xs font-medium border border-gray-500/20">
                                                        +{professional.specializations.length - 2}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Action Button */}
                                            <Link
                                                href={`/technical/professional/${professional.id}`}
                                                className="block w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-3 px-4 rounded-2xl font-semibold text-center transition-all duration-300 hover:scale-105 shadow-lg text-sm"
                                            >
                                                View Profile & Book
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="text-center mt-12">
                        <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-8 py-3 rounded-lg font-bold transition-colors">
                            Load More Technicians
                        </button>
                    </div>
                </div>
            </section>

            {/* Emergency Service Section */}
            <section className="py-16 bg-gradient-to-r from-gray-900 to-orange-900 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-4xl animate-pulse">
                            ⚡
                        </div>
                    </div>
                    <h2 className="text-4xl font-bold mb-6">Emergency Technical Support</h2>
                    <p className="text-xl mb-8 opacity-90 max-w-3xl mx-auto">
                        24/7 emergency repair services for urgent technical issues. Our rapid response team is ready to help.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button className="bg-white text-orange-600 hover:bg-gray-100 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105">
                            📞 Emergency Hotline
                        </button>
                        <button className="border-2 border-white text-white hover:bg-white hover:text-orange-600 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105">
                            🚗 Mobile Service
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
} 