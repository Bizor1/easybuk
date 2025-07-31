'use client'

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import CategoryNavbar from '@/components/CategoryNavbar';
import { useCategoryData } from '@/hooks/useAPI';

interface CreativeProfessional {
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
    specializations: string[];
    services: string[];
    description: string;
    type?: string;
    realServiceId?: string;
    realProviderId?: string;
}

export default function Creative() {
    const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
    const [searchLocation, setSearchLocation] = useState('');
    const [searchService, setSearchService] = useState('');
    const [searchBudget, setSearchBudget] = useState('');
    const [searchKeywords, setSearchKeywords] = useState('');

    // Banner carousel data with creative service themes
    const bannerAds = [
        {
            image: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
            title: "Brand Design Studio",
            subtitle: "Professional logo design and complete brand identity packages",
            provider: "DesignPro Ghana",
            action: "Create Your Brand"
        },
        {
            image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
            title: "Event Photography",
            subtitle: "Capture your special moments with professional photography",
            provider: "Moments Studio",
            action: "Book Session"
        },
        {
            image: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
            title: "Video Production",
            subtitle: "High-quality video content for businesses and events",
            provider: "FilmCraft Ghana",
            action: "Start Project"
        },
        {
            image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
            title: "Music Production",
            subtitle: "Professional recording and music production services",
            provider: "SoundWave Studios",
            action: "Record Now"
        }
    ];

    // Use SWR for data fetching with caching
    const { items: rawCreativeData, isLoading: loading, isError, mutateCategory } = useCategoryData('creative');


    // Transform the data to match the expected format
    const creativeProfessionals = useMemo(() => {
        return rawCreativeData.map((item: any) => ({
            id: item.realProviderId || item.id,
            name: item.name,
            specialty: item.type === 'professional' ? item.category.charAt(0).toUpperCase() + item.category.slice(1) : item.title,
            image: item.image,
            rating: item.rating,
            reviews: item.reviews || 0,
            experience: item.type === 'professional' ? "Creative Professional" : "Service Provider",
            location: item.location,
            consultation: item.price,
            availability: item.availability || item.badge,
            verified: item.isVerified || false,
            specializations: item.type === 'professional' ? (item.specialties || item.skills || []).slice(0, 3) : [item.category],
            services: item.type === 'professional' ? (item.specialties || item.skills || []).slice(0, 4) : [item.name],
            description: item.description || item.title || "Experienced creative professional",
            type: item.type,
            realServiceId: item.realServiceId,
            realProviderId: item.realProviderId
        }));
    }, [rawCreativeData]);

    // Ghana cities for location dropdown
    const ghanaCities = [
        'accra', 'kumasi', 'tamale', 'takoradi', 'tema', 'cape-coast',
        'ho', 'sunyani', 'koforidua', 'wa', 'bolgatanga', 'techiman'
    ];

    // Creative service categories
    const creativeCategories = [
        'graphic-design', 'photography', 'videography', 'web-design', 'music-production',
        'writing', 'animation', 'branding', 'social-media', 'content-creation'
    ];

    // Enhanced filter logic (similar to professional-services)
    const filteredProfessionals = useMemo(() => {
        let filtered = [...creativeProfessionals];

        // Filter by location
        if (searchLocation) {
            filtered = filtered.filter(provider =>
                provider.location.toLowerCase().includes(searchLocation.toLowerCase())
            );
        }

        // Filter by service type
        if (searchService) {
            filtered = filtered.filter(provider =>
                provider.specialty.toLowerCase().includes(searchService.toLowerCase()) ||
                provider.services.some((service: string) =>
                    service.toLowerCase().includes(searchService.toLowerCase())
                ) ||
                provider.specializations.some((spec: string) =>
                    spec.toLowerCase().includes(searchService.toLowerCase())
                )
            );
        }

        // Filter by budget
        if (searchBudget) {
            const budgetValue = parseFloat(searchBudget.replace(/[^\d.]/g, ''));
            if (!isNaN(budgetValue)) {
                filtered = filtered.filter(provider => {
                    const providerPrice = parseFloat(provider.consultation.replace(/[^\d.]/g, ''));
                    return !isNaN(providerPrice) && providerPrice <= budgetValue;
                });
            }
        }

        // Filter by keywords
        if (searchKeywords.trim()) {
            const keywords = searchKeywords.toLowerCase().split(' ');
            filtered = filtered.filter(provider =>
                keywords.some(keyword =>
                    provider.name.toLowerCase().includes(keyword) ||
                    provider.description.toLowerCase().includes(keyword) ||
                    provider.specialty.toLowerCase().includes(keyword) ||
                    provider.services.some((service: string) => service.toLowerCase().includes(keyword)) ||
                    provider.specializations.some((spec: string) => spec.toLowerCase().includes(keyword))
                )
            );
        }

        return filtered;
    }, [creativeProfessionals, searchLocation, searchService, searchBudget, searchKeywords]);

    const error = isError ? 'Failed to load creative professionals' : null;

    // Fallback dummy data (used only if API fails)
    const fallbackCreativeProfessionals = [
        {
            id: 1,
            name: "Kofi Designs",
            specialty: "Graphic Designer",
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
            rating: 4.9,
            reviews: 167,
            experience: "8 years",
            location: "Accra",
            consultation: "GH₵150",
            availability: "Available now",
            verified: true,
            specializations: ["Logo Design", "Brand Identity", "Print Design"],
            services: ["Logo Creation", "Business Cards", "Flyers", "Social Media Graphics"],
            description: "Award-winning graphic designer specializing in brand identity and marketing materials for Ghanaian businesses."
        },
        {
            id: 2,
            name: "Ama Photography",
            specialty: "Professional Photographer",
            image: "https://res.cloudinary.com/duhfv8nqy/image/upload/v1733764031/default-avatar_cugq40.png",
            rating: 4.8,
            reviews: 234,
            experience: "12 years",
            location: "Kumasi",
            consultation: "GH₵200",
            availability: "Available today",
            verified: true,
            specializations: ["Wedding Photography", "Event Coverage", "Portraits"],
            services: ["Wedding Shoots", "Corporate Events", "Family Portraits", "Product Photography"],
            description: "Professional photographer with over a decade of experience capturing life's precious moments across Ghana."
        },
        {
            id: 3,
            name: "VideoMax Productions",
            specialty: "Video Producer",
            image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
            rating: 4.9,
            reviews: 89,
            experience: "10 years",
            location: "Tema",
            consultation: "GH₵300",
            availability: "Available this week",
            verified: true,
            specializations: ["Commercial Videos", "Music Videos", "Documentary"],
            services: ["Corporate Videos", "Music Production", "Event Coverage", "Social Media Content"],
            description: "Creative video production company specializing in commercial and entertainment content."
        },
        {
            id: 4,
            name: "Kwame Web Design",
            specialty: "Web Designer",
            image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
            rating: 4.7,
            reviews: 156,
            experience: "7 years",
            location: "Accra",
            consultation: "GH₵120",
            availability: "Available tomorrow",
            verified: true,
            specializations: ["UI/UX Design", "E-commerce", "Mobile Apps"],
            services: ["Website Design", "Mobile Apps", "E-commerce Stores", "Digital Strategy"],
            description: "Modern web designer creating stunning digital experiences for businesses across Ghana."
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
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-orange-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
            {/* Custom Styles for Liquid Glass Search */}
            <style jsx>{`
                .glass-select {
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 9999px;
                    color: white;
                }
                
                .glass-select option {
                    background: rgba(31, 41, 55, 0.95);
                    backdrop-filter: blur(20px);
                    color: white;
                    padding: 12px 16px;
                    border: none;
                    font-size: 14px;
                    line-height: 1.5;
                }
                
                .glass-select option:hover {
                    background: linear-gradient(135deg, rgba(236, 72, 153, 0.3), rgba(251, 146, 60, 0.3));
                    backdrop-filter: blur(30px);
                }
                
                .glass-select option:checked,
                .glass-select option:selected {
                    background: linear-gradient(135deg, rgba(236, 72, 153, 0.4), rgba(251, 146, 60, 0.4));
                    color: white;
                    font-weight: 600;
                }
                
                .glass-select:focus {
                    outline: none;
                    box-shadow: 0 0 0 2px rgba(236, 72, 153, 0.5);
                }
            `}</style>

            {/* Navigation */}
            <CategoryNavbar
                backText="← Back to Home"
                backHref="/"
                hoverColor="text-pink-600 dark:hover:text-pink-400"
                bgGradient="from-pink-50 via-white to-orange-50"
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
                            <div className="absolute inset-0 bg-gradient-to-r from-pink-900/80 to-orange-900/60"></div>

                            {/* Banner Content */}
                            <div className="absolute inset-0 flex items-center">
                                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                                    <div className="max-w-2xl text-white">
                                        <div className="flex items-center mb-4">
                                            <span className="bg-pink-600 text-white px-3 py-1 rounded-full text-sm font-bold mr-3">
                                                🎨 Creative Service
                                            </span>
                                            <span className="text-pink-200">{banner.provider}</span>
                                        </div>
                                        <h1 className="text-5xl md:text-6xl font-bold mb-4">{banner.title}</h1>
                                        <p className="text-xl md:text-2xl mb-8 opacity-90">{banner.subtitle}</p>
                                        <button className="bg-white text-pink-600 hover:bg-gray-100 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105">
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

                    {/* Sleek Liquid Glass Search Bar */}
                    <div className="absolute bottom-4 sm:bottom-12 left-1/2 transform -translate-x-1/2 w-full max-w-7xl px-2 sm:px-4">
                        <div className="relative group">
                            {/* Glow effect */}
                            <div className="absolute -inset-1 bg-gradient-to-r from-pink-400/20 to-orange-400/20 rounded-2xl sm:rounded-full blur-lg group-hover:blur-xl transition-all duration-300"></div>

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
                                                className="w-full px-3 py-3 bg-white/10 backdrop-blur-md border-0 rounded-full text-white text-sm placeholder-white/70 focus:ring-2 focus:ring-pink-400/50 transition-all duration-300 hover:bg-white/15 appearance-none cursor-pointer glass-select"
                                            >
                                                <option value="">📍 Location</option>
                                                {ghanaCities.map((city) => (
                                                    <option key={city} value={city}>
                                                        {city.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                                                    </option>
                                                ))}
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
                                                className="w-full px-3 py-3 bg-white/10 backdrop-blur-md border-0 rounded-full text-white text-sm placeholder-white/70 focus:ring-2 focus:ring-pink-400/50 transition-all duration-300 hover:bg-white/15 appearance-none cursor-pointer glass-select"
                                            >
                                                <option value="">🎨 Service</option>
                                                {creativeCategories.map((category) => (
                                                    <option key={category} value={category}>
                                                        {category.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                                                    </option>
                                                ))}
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
                                                value={searchBudget}
                                                onChange={(e) => setSearchBudget(e.target.value)}
                                                className="w-full px-3 py-3 bg-white/10 backdrop-blur-md border-0 rounded-full text-white text-sm placeholder-white/70 focus:ring-2 focus:ring-pink-400/50 transition-all duration-300 hover:bg-white/15"
                                            />
                                        </div>
                                        <div className="relative flex-1">
                                            <input
                                                type="text"
                                                placeholder="🔍 Keywords"
                                                value={searchKeywords}
                                                onChange={(e) => setSearchKeywords(e.target.value)}
                                                className="w-full px-3 py-3 bg-white/10 backdrop-blur-md border-0 rounded-full text-white text-sm placeholder-white/70 focus:ring-2 focus:ring-pink-400/50 transition-all duration-300 hover:bg-white/15"
                                            />
                                        </div>
                                    </div>

                                    {/* Row 3: Action Buttons */}
                                    <div className="flex gap-2">
                                        <button className="flex-1 bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white px-4 py-3 rounded-full font-semibold text-sm transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center gap-2 border border-white/20">
                                            <span>🔍</span>
                                            <span>Search</span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSearchLocation('');
                                                setSearchService('');
                                                setSearchBudget('');
                                                setSearchKeywords('');
                                            }}
                                            className="bg-white/20 hover:bg-white/30 text-white px-4 py-3 rounded-full font-medium text-sm transition-all duration-300 border border-white/20"
                                        >
                                            Reset
                                        </button>
                                    </div>
                                </div>

                                {/* Desktop Layout (Horizontal) */}
                                <div className="hidden sm:flex items-center gap-3">
                                    {/* Location Selector */}
                                    <div className="relative min-w-[160px]">
                                        <select
                                            value={searchLocation}
                                            onChange={(e) => setSearchLocation(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-white/10 backdrop-blur-md border-0 rounded-full text-white text-sm placeholder-white/70 focus:ring-2 focus:ring-pink-400/50 transition-all duration-300 hover:bg-white/15 appearance-none cursor-pointer glass-select"
                                        >
                                            <option value="">📍 Select Location</option>
                                            {ghanaCities.map((city) => (
                                                <option key={city} value={city}>
                                                    {city.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                            <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>

                                    {/* Service Type Selector */}
                                    <div className="relative min-w-[160px]">
                                        <select
                                            value={searchService}
                                            onChange={(e) => setSearchService(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-white/10 backdrop-blur-md border-0 rounded-full text-white text-sm placeholder-white/70 focus:ring-2 focus:ring-pink-400/50 transition-all duration-300 hover:bg-white/15 appearance-none cursor-pointer glass-select"
                                        >
                                            <option value="">🎨 Creative Service</option>
                                            {creativeCategories.map((category) => (
                                                <option key={category} value={category}>
                                                    {category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                            <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>

                                    {/* Budget Input */}
                                    <div className="relative min-w-[140px]">
                                        <input
                                            type="text"
                                            placeholder="💰 Budget (e.g., GH₵300)"
                                            value={searchBudget}
                                            onChange={(e) => setSearchBudget(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-white/10 backdrop-blur-md border-0 rounded-full text-white text-sm placeholder-white/70 focus:ring-2 focus:ring-pink-400/50 transition-all duration-300 hover:bg-white/15"
                                        />
                                    </div>

                                    {/* Keywords Input */}
                                    <div className="relative flex-1 min-w-[180px]">
                                        <input
                                            type="text"
                                            placeholder="🔍 Keywords (e.g., logo, wedding)"
                                            value={searchKeywords}
                                            onChange={(e) => setSearchKeywords(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-white/10 backdrop-blur-md border-0 rounded-full text-white text-sm placeholder-white/70 focus:ring-2 focus:ring-pink-400/50 transition-all duration-300 hover:bg-white/15"
                                        />
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2">
                                        <button className="bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 hover:scale-105 shadow-lg flex items-center gap-2 border border-white/20">
                                            <span>🔍</span>
                                            <span>Find Creatives</span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSearchLocation('');
                                                setSearchService('');
                                                setSearchBudget('');
                                                setSearchKeywords('');
                                            }}
                                            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2.5 rounded-full font-medium text-sm transition-all duration-300 border border-white/20"
                                        >
                                            Reset
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Creative Professionals Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-12">
                        <div>
                            <h2 className="text-4xl font-bold mb-4 text-gray-800">Available Creative Professionals</h2>
                            <p className="text-xl text-gray-600">Talented creatives ready to bring your vision to life</p>
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

                    {/* Loading State */}
                    {loading && (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading creative professionals...</p>
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="text-center py-12">
                            <div className="text-red-500 text-6xl mb-4">⚠️</div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Failed to Load Data</h3>
                            <p className="text-gray-600 mb-4">{error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded-lg transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && !error && creativeProfessionals.length === 0 && (
                        <div className="text-center py-12">
                            <div className="text-gray-400 text-6xl mb-4">🎨</div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No Creative Professionals Found</h3>
                            <p className="text-gray-600 mb-4">We&apos;re working to add more creative professionals to our platform.</p>
                            <Link
                                href="/explore"
                                className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded-lg transition-colors inline-block"
                            >
                                Explore Other Categories
                            </Link>
                        </div>
                    )}

                    {/* Professionals Grid */}
                    {!loading && !error && creativeProfessionals.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredProfessionals.map((professional) => (
                                <div key={professional.id} className="group relative">
                                    {/* Card Container with Glass Effect */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-pink-400/10 via-transparent to-orange-400/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>

                                    <div className="relative bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700/50 hover:shadow-3xl hover:scale-[1.02] transition-all duration-500 overflow-hidden">

                                        {/* Header with Image and Status */}
                                        <div className="relative p-6 pb-0">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="relative">
                                                    <div className="w-20 h-20 rounded-2xl overflow-hidden ring-4 ring-white/50 shadow-lg">
                                                        <Image
                                                            src={professional.image}
                                                            alt={professional.name}
                                                            width={80}
                                                            height={80}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    {professional.verified && (
                                                        <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-pink-500 to-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white">
                                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex flex-col items-end gap-2">
                                                    <span className={`px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md ${professional.availability === 'Available now'
                                                        ? 'bg-green-500/20 text-green-700 dark:text-green-300 border border-green-500/30'
                                                        : professional.availability === 'Available today'
                                                            ? 'bg-pink-500/20 text-pink-700 dark:text-pink-300 border border-pink-500/30'
                                                            : 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                                                        }`}>
                                                        {typeof professional.availability === 'string' ? professional.availability : 'Available'}
                                                    </span>

                                                    <div className="text-right">
                                                        <div className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent">
                                                            {professional.consultation}
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">per project</div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                                                    {professional.name}
                                                </h3>
                                                <p className="text-pink-600 dark:text-pink-400 font-semibold">{professional.specialty}</p>
                                                <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1">
                                                    <span>📍</span>
                                                    <span>{professional.location}</span>
                                                    <span>•</span>
                                                    <span>{professional.experience} experience</span>
                                                </p>
                                            </div>
                                        </div>

                                        {/* Rating and Reviews */}
                                        <div className="px-6 py-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-yellow-500 text-lg">⭐</span>
                                                        <span className="font-bold text-gray-900 dark:text-white">{professional.rating}</span>
                                                    </div>
                                                    <span className="text-sm text-gray-500 dark:text-gray-400">({professional.reviews} reviews)</span>
                                                </div>

                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    🎨 Creative Professional
                                                </div>
                                            </div>
                                        </div>

                                        {/* Specializations and Services */}
                                        <div className="px-6 pb-6">
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {professional.specializations.slice(0, 3).map((spec, index) => (
                                                    <span key={index} className="bg-pink-500/10 text-pink-700 dark:text-pink-300 px-3 py-1 rounded-full text-xs font-medium border border-pink-500/20 backdrop-blur-sm">
                                                        {spec}
                                                    </span>
                                                ))}
                                                {professional.services.length > 3 && (
                                                    <span className="bg-gray-500/10 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-xs font-medium border border-gray-500/20 backdrop-blur-sm">
                                                        +{professional.services.length - 3} more
                                                    </span>
                                                )}
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex gap-3">
                                                <Link
                                                    href={`/creative/professional/${professional.id}`}
                                                    className="flex-1 bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white py-3 px-4 rounded-2xl font-semibold text-center transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl backdrop-blur-sm border border-white/20"
                                                >
                                                    View Portfolio & Book
                                                </Link>
                                                <button className="bg-white/20 dark:bg-slate-700/50 backdrop-blur-md border border-pink-500/30 text-pink-600 dark:text-pink-400 py-3 px-4 rounded-2xl font-semibold hover:bg-pink-500/10 transition-all duration-300 hover:scale-105">
                                                    📞
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="text-center mt-12">
                        <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-8 py-3 rounded-lg font-bold transition-colors">
                            Load More Creatives
                        </button>
                    </div>
                </div>
            </section>

            {/* Creative Showcase Section */}
            <section className="py-16 bg-gradient-to-r from-pink-900 to-orange-900 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-4xl animate-pulse">
                            🎨
                        </div>
                    </div>
                    <h2 className="text-4xl font-bold mb-6">Bring Your Creative Vision to Life</h2>
                    <p className="text-xl mb-8 opacity-90 max-w-3xl mx-auto">
                        Connect with Ghana&apos;s most talented creative professionals and transform your ideas into stunning reality.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button className="bg-white text-pink-600 hover:bg-gray-100 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105">
                            🎭 View Portfolio
                        </button>
                        <button className="border-2 border-white text-white hover:bg-white hover:text-pink-600 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105">
                            🌟 Premium Packages
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
} 