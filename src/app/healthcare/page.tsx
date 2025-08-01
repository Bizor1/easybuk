'use client'

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import CategoryNavbar from '@/components/CategoryNavbar';
import { useCategoryData } from '@/hooks/useAPI';

interface HealthcareProfessional {
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
    type?: string;
    realServiceId?: string;
    realProviderId?: string;
}

export default function Healthcare() {
    const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
    const [searchLocation, setSearchLocation] = useState('');
    const [searchService, setSearchService] = useState('');
    const [searchBudget, setSearchBudget] = useState('');
    const [searchKeywords, setSearchKeywords] = useState('');
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
                    // Extract numeric value from price strings like "GH₵60" or "GH₵40/hour"
                    const priceA = parseFloat((a.consultation || '0').replace(/[^\d.]/g, ''));
                    const priceB = parseFloat((b.consultation || '0').replace(/[^\d.]/g, ''));
                    return priceA - priceB;
                });
            case 'experience':
                return sorted.sort((a, b) => {
                    // Extract numeric value from experience strings like "15 years"
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

    // Use SWR for data fetching with caching
    const { items: rawHealthcareData, isLoading: loading, isError, mutateCategory } = useCategoryData('healthcare');

    // Transform the data to match the expected format
    const healthcareProfessionals = useMemo(() => {
        return rawHealthcareData.map((item: any) => ({
            id: item.realProviderId || item.id,
            name: item.name,
            specialty: item.type === 'professional' ? item.category.charAt(0).toUpperCase() + item.category.slice(1) : item.title,
            image: item.image,
            rating: item.rating,
            reviews: item.reviews || 0,
            experience: item.type === 'professional' ? "Professional" : "Service Provider",
            location: item.location,
            consultation: item.price,
            availability: item.availability || item.badge,
            verified: item.isVerified || false,
            languages: ["English", "Local Languages"],
            services: item.type === 'professional' ? (item.specialties || item.skills || []).slice(0, 3) : [item.name],
            type: item.type,
            realServiceId: item.realServiceId,
            realProviderId: item.realProviderId
        }));
    }, [rawHealthcareData]);

    // Ghana cities for location dropdown
    const ghanaCities = [
        'accra', 'kumasi', 'tamale', 'takoradi', 'tema', 'cape-coast',
        'ho', 'sunyani', 'koforidua', 'wa', 'bolgatanga', 'techiman'
    ];

    // Healthcare service categories
    const healthcareCategories = [
        'general-practice', 'cardiology', 'neurology', 'pediatrics', 'gynecology',
        'orthopedics', 'dermatology', 'psychology', 'dentistry', 'physiotherapy'
    ];

    // Enhanced filter logic (similar to professional-services)
    const filteredProfessionals = useMemo(() => {
        let filtered = [...healthcareProfessionals];

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
                    provider.specialty.toLowerCase().includes(keyword) ||
                    provider.services.some((service: string) => service.toLowerCase().includes(keyword))
                )
            );
        }

        // Apply sorting
        return sortProfessionals(filtered, sortBy);
    }, [healthcareProfessionals, searchLocation, searchService, searchBudget, searchKeywords, sortBy]);

    const error = isError ? 'Failed to load healthcare professionals' : null;

    // Auto-advance carousel
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentBannerIndex((prev) => (prev + 1) % bannerAds.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [bannerAds.length]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
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
                    background: linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(34, 197, 94, 0.3));
                    backdrop-filter: blur(30px);
                }
                
                .glass-select option:checked,
                .glass-select option:selected {
                    background: linear-gradient(135deg, rgba(59, 130, 246, 0.4), rgba(34, 197, 94, 0.4));
                    color: white;
                    font-weight: 600;
                }
                
                .glass-select:focus {
                    outline: none;
                    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
                }
            `}</style>

            {/* Navigation */}
            <CategoryNavbar
                backText="← Back to Home"
                backHref="/"
                hoverColor="text-blue-600 dark:hover:text-blue-400"
                bgGradient="from-blue-50 via-white to-green-50"
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

                    {/* Sleek Liquid Glass Search Bar */}
                    <div className="absolute bottom-4 sm:bottom-12 left-1/2 transform -translate-x-1/2 w-full max-w-7xl px-2 sm:px-4">
                        <div className="relative group">
                            {/* Glow effect */}
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-400/20 to-green-400/20 rounded-2xl sm:rounded-full blur-lg group-hover:blur-xl transition-all duration-300"></div>

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
                                                className="w-full px-3 py-3 bg-white/10 backdrop-blur-md border-0 rounded-full text-white text-sm placeholder-white/70 focus:ring-2 focus:ring-blue-400/50 transition-all duration-300 hover:bg-white/15 appearance-none cursor-pointer glass-select"
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
                                                className="w-full px-3 py-3 bg-white/10 backdrop-blur-md border-0 rounded-full text-white text-sm placeholder-white/70 focus:ring-2 focus:ring-blue-400/50 transition-all duration-300 hover:bg-white/15 appearance-none cursor-pointer glass-select"
                                            >
                                                <option value="">🏥 Service</option>
                                                {healthcareCategories.map((category) => (
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
                                    </div>

                                    {/* Row 2: Budget and Keywords */}
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <input
                                                type="text"
                                                placeholder="💰 Budget"
                                                value={searchBudget}
                                                onChange={(e) => setSearchBudget(e.target.value)}
                                                className="w-full px-3 py-3 bg-white/10 backdrop-blur-md border-0 rounded-full text-white text-sm placeholder-white/70 focus:ring-2 focus:ring-blue-400/50 transition-all duration-300 hover:bg-white/15"
                                            />
                                        </div>
                                        <div className="relative flex-1">
                                            <input
                                                type="text"
                                                placeholder="🔍 Keywords"
                                                value={searchKeywords}
                                                onChange={(e) => setSearchKeywords(e.target.value)}
                                                className="w-full px-3 py-3 bg-white/10 backdrop-blur-md border-0 rounded-full text-white text-sm placeholder-white/70 focus:ring-2 focus:ring-blue-400/50 transition-all duration-300 hover:bg-white/15"
                                            />
                                        </div>
                                    </div>

                                    {/* Row 3: Action Buttons */}
                                    <div className="flex gap-2">
                                        <button className="flex-1 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white px-4 py-3 rounded-full font-semibold text-sm transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center gap-2 border border-white/20">
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
                                            className="w-full px-4 py-2.5 bg-white/10 backdrop-blur-md border-0 rounded-full text-white text-sm placeholder-white/70 focus:ring-2 focus:ring-blue-400/50 transition-all duration-300 hover:bg-white/15 appearance-none cursor-pointer glass-select"
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
                                            className="w-full px-4 py-2.5 bg-white/10 backdrop-blur-md border-0 rounded-full text-white text-sm placeholder-white/70 focus:ring-2 focus:ring-blue-400/50 transition-all duration-300 hover:bg-white/15 appearance-none cursor-pointer glass-select"
                                        >
                                            <option value="">🏥 Healthcare Service</option>
                                            {healthcareCategories.map((category) => (
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
                                            placeholder="💰 Budget (e.g., GH₵100)"
                                            value={searchBudget}
                                            onChange={(e) => setSearchBudget(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-white/10 backdrop-blur-md border-0 rounded-full text-white text-sm placeholder-white/70 focus:ring-2 focus:ring-blue-400/50 transition-all duration-300 hover:bg-white/15"
                                        />
                                    </div>

                                    {/* Keywords Input */}
                                    <div className="relative flex-1 min-w-[180px]">
                                        <input
                                            type="text"
                                            placeholder="🔍 Keywords (e.g., surgery, diabetes)"
                                            value={searchKeywords}
                                            onChange={(e) => setSearchKeywords(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-white/10 backdrop-blur-md border-0 rounded-full text-white text-sm placeholder-white/70 focus:ring-2 focus:ring-blue-400/50 transition-all duration-300 hover:bg-white/15"
                                        />
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2">
                                        <button className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 hover:scale-105 shadow-lg flex items-center gap-2 border border-white/20">
                                            <span>🔍</span>
                                            <span>Find Healthcare</span>
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

            {/* Healthcare Professionals Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-12">
                        <div>
                            <h2 className="text-4xl font-bold mb-4 text-gray-800">Available Healthcare Professionals</h2>
                            <p className="text-xl text-gray-600">Verified doctors and nurses ready to help you</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                            >
                                <option value="rating">Sort by Rating</option>
                                <option value="price">Sort by Price (Low to High)</option>
                                <option value="experience">Sort by Experience</option>
                                <option value="reviews">Sort by Reviews</option>
                            </select>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            <span className="ml-3 text-lg text-gray-600">Loading healthcare professionals...</span>
                        </div>
                    ) : error ? (
                        <div className="text-center py-12">
                            <div className="text-red-600 text-xl mb-4">⚠️ {error}</div>
                            <button
                                onClick={() => window.location.reload()}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : healthcareProfessionals.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-gray-600 text-xl mb-4">🔍 No healthcare professionals found</div>
                            <p className="text-gray-500">Please try again later or check other categories.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredProfessionals.map((professional) => (
                                <div key={professional.id} className="group relative">
                                    {/* Card Container with Glass Effect */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 via-transparent to-green-400/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>

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
                                                    <div className="absolute top-3 right-3 bg-gradient-to-r from-blue-500 to-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white">
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
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
                                                    <div className="text-xs text-white/80">per consultation</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Content Section */}
                                        <div className="p-4">
                                            {/* Name and Specialty */}
                                            <div className="mb-3">
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-1">
                                                    {professional.name}
                                                </h3>
                                                <p className="text-blue-600 dark:text-blue-400 font-semibold text-sm">{professional.specialty}</p>
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
                                                    <span className="text-yellow-500 text-sm">⭐</span>
                                                    <span className="font-bold text-gray-900 dark:text-white text-sm">{professional.rating}</span>
                                                </div>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">({professional.reviews} reviews)</span>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 ml-auto hidden sm:block">
                                                    💬 {professional.languages.join(', ')}
                                                </div>
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
                                                                className="ml-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium underline focus:outline-none transition-colors"
                                                            >
                                                                {expandedDescriptions[professional.id] ? 'Less' : 'More'}
                                                            </button>
                                                        )}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Services Tags */}
                                            <div className="flex flex-wrap gap-1.5 mb-4">
                                                {professional.services.slice(0, 2).map((service: string, index: number) => (
                                                    <span key={index} className="bg-blue-500/10 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full text-xs font-medium border border-blue-500/20">
                                                        {service}
                                                    </span>
                                                ))}
                                                {professional.services.length > 2 && (
                                                    <span className="bg-gray-500/10 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full text-xs font-medium border border-gray-500/20">
                                                        +{professional.services.length - 2}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Action Button */}
                                            <Link
                                                href={`/healthcare/professional/${professional.id}`}
                                                className="block w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white py-3 px-4 rounded-2xl font-semibold text-center transition-all duration-300 hover:scale-105 shadow-lg text-sm"
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