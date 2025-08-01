'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import CategoryNavbar from '@/components/CategoryNavbar';

// Interface for professional service provider data
interface ProfessionalServiceProvider {
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
}

export default function ProfessionalServices() {
    const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
    const [searchLocation, setSearchLocation] = useState('');
    const [searchService, setSearchService] = useState('');
    const [searchBudget, setSearchBudget] = useState('');
    const [searchKeywords, setSearchKeywords] = useState('');
    const [expandedDescriptions, setExpandedDescriptions] = useState<{ [key: number]: boolean }>({});
    const [sortBy, setSortBy] = useState('rating'); // Default sort by rating
    const [professionalServiceProviders, setProfessionalServiceProviders] = useState<ProfessionalServiceProvider[]>([]);
    const [filteredProviders, setFilteredProviders] = useState<ProfessionalServiceProvider[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);



    // Ghana cities for location dropdown
    const ghanaCities = [
        'accra', 'kumasi', 'tamale', 'takoradi', 'tema', 'cape-coast',
        'ho', 'sunyani', 'koforidua', 'wa', 'bolgatanga', 'techiman'
    ];

    // Professional service categories
    const professionalServiceCategories = [
        'legal', 'accounting', 'consulting', 'marketing', 'finance',
        'real-estate', 'insurance', 'business-development', 'hr', 'audit'
    ];

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
    const sortProfessionals = useCallback((professionals: any[], sortOption: string) => {
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
    }, []);

    // Filter providers based on search criteria
    const filterProviders = useCallback(() => {
        let filtered = [...professionalServiceProviders];

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
                provider.specializations.some((spec: string) => spec.toLowerCase().includes(searchService.toLowerCase())) ||
                provider.services.some((service: string) => service.toLowerCase().includes(searchService.toLowerCase()))
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
                    provider.specializations.some((spec: string) => spec.toLowerCase().includes(keyword)) ||
                    provider.services.some((service: string) => service.toLowerCase().includes(keyword))
                )
            );
        }

        // Apply sorting
        const sorted = sortProfessionals(filtered, sortBy);
        setFilteredProviders(sorted);
    }, [professionalServiceProviders, searchLocation, searchService, searchBudget, searchKeywords, sortBy, sortProfessionals, setFilteredProviders]);

    // Effect to re-sort when sortBy changes
    useEffect(() => {
        if (professionalServiceProviders.length > 0) {
            filterProviders();
        }
    }, [sortBy, filterProviders, professionalServiceProviders.length]);

    // Handle search button click
    const handleSearch = () => {
        filterProviders();
    };

    // Reset filters
    const handleResetFilters = () => {
        setSearchLocation('');
        setSearchService('');
        setSearchBudget('');
        setSearchKeywords('');
        const sorted = sortProfessionals(professionalServiceProviders, sortBy);
        setFilteredProviders(sorted);
    };

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

    // Fetch professional service providers from API
    useEffect(() => {
        const fetchProfessionalServiceProviders = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/explore?category=professional&limit=50');

                if (!response.ok) {
                    throw new Error('Failed to fetch professional service providers');
                }

                const data = await response.json();

                // Extract items from API response structure
                const items = data.items || [];

                // Transform API data to match UI format
                const transformedData: ProfessionalServiceProvider[] = items.map((item: any) => ({
                    id: item.realProviderId || item.id,
                    name: item.name,
                    specialty: item.category || 'Professional Services',
                    image: item.image, // Use item.image which is service image for services, provider image for providers
                    rating: item.rating || 4.5,
                    reviews: item.totalReviews || item.reviews || 0,
                    experience: `${item.experience || 10} years`,
                    location: item.location || "Ghana",
                    consultation: item.price || `GH₵${item.hourlyRate || 250}`,
                    availability: item.isAvailable ? "Available now" : "Contact for availability",
                    verified: item.isVerified || false,
                    specializations: item.specializations || item.skills?.slice(0, 3) || item.specialties?.slice(0, 3) || ["Professional Service"],
                    services: item.services?.map((s: any) => s.name || s.title).slice(0, 4) || item.specialties?.slice(0, 4) || [item.name || "Consultation"],
                    description: item.bio || item.description || item.title || "Professional service provider"
                }));

                setProfessionalServiceProviders(transformedData);
                setFilteredProviders(transformedData); // Initialize filtered providers
                setError(null);
            } catch (err) {
                console.error('Error fetching professional service providers:', err);
                setError('Failed to load professional service providers');
            } finally {
                setLoading(false);
            }
        };

        fetchProfessionalServiceProviders();
    }, []);

    // Auto-advance carousel
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentBannerIndex((prev) => (prev + 1) % bannerAds.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [bannerAds.length]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
            {/* Custom Styles for Glassmorphism Dropdowns */}
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
                    background: linear-gradient(135deg, rgba(168, 85, 247, 0.3), rgba(99, 102, 241, 0.3));
                    backdrop-filter: blur(30px);
                }
                
                .glass-select option:checked,
                .glass-select option:selected {
                    background: linear-gradient(135deg, rgba(168, 85, 247, 0.4), rgba(99, 102, 241, 0.4));
                    color: white;
                    font-weight: 600;
                }
                
                /* Enhanced dropdown styling */
                .glass-select:focus {
                    outline: none;
                    box-shadow: 0 0 0 2px rgba(168, 85, 247, 0.5);
                }
                
                /* Custom scrollbar for dropdown list */
                select.glass-select {
                    scrollbar-width: thin;
                    scrollbar-color: rgba(255, 255, 255, 0.4) transparent;
                }
                
                select.glass-select::-webkit-scrollbar {
                    width: 8px;
                }
                
                select.glass-select::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 4px;
                }
                
                select.glass-select::-webkit-scrollbar-thumb {
                    background: linear-gradient(135deg, rgba(168, 85, 247, 0.6), rgba(99, 102, 241, 0.6));
                    border-radius: 4px;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                }
                
                select.glass-select::-webkit-scrollbar-thumb:hover {
                    background: linear-gradient(135deg, rgba(168, 85, 247, 0.8), rgba(99, 102, 241, 0.8));
                }
                
                /* Limit visible options to ~6 items with scroll */
                .glass-select {
                    max-height: auto;
                }
                
                /* Style the dropdown arrow */
                .glass-select::-ms-expand {
                    display: none;
                }
            `}</style>

            {/* Navigation */}
            <CategoryNavbar
                backText="← Back to Home"
                backHref="/"
                hoverColor="text-purple-600 dark:hover:text-purple-400"
                bgGradient="from-purple-50 via-white to-indigo-50"
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

                    {/* Sleek Modern Search Bar */}
                    <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 w-full max-w-7xl px-4">
                        <div className="relative group">
                            {/* Glow effect */}
                            <div className="absolute -inset-1 bg-gradient-to-r from-purple-400/20 to-indigo-400/20 rounded-full blur-lg group-hover:blur-xl transition-all duration-300"></div>

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
                                                className="w-full px-3 py-3 bg-white/10 backdrop-blur-md border-0 rounded-full text-white text-sm placeholder-white/70 focus:ring-2 focus:ring-purple-400/50 transition-all duration-300 hover:bg-white/15 appearance-none cursor-pointer"
                                            >
                                                <option value="">📍 Location</option>
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
                                        <div className="relative flex-1">
                                            <select
                                                value={searchService}
                                                onChange={(e) => setSearchService(e.target.value)}
                                                className="w-full px-3 py-3 bg-white/10 backdrop-blur-md border-0 rounded-full text-white text-sm placeholder-white/70 focus:ring-2 focus:ring-purple-400/50 transition-all duration-300 hover:bg-white/15 appearance-none cursor-pointer"
                                            >
                                                <option value="">💼 Service</option>
                                                {professionalServiceCategories.map((category) => (
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
                                                className="w-full px-3 py-3 bg-white/10 backdrop-blur-md border-0 rounded-full text-white text-sm placeholder-white/70 focus:ring-2 focus:ring-purple-400/50 transition-all duration-300 hover:bg-white/15"
                                            />
                                        </div>
                                        <div className="relative flex-1">
                                            <input
                                                type="text"
                                                placeholder="🔍 Keywords"
                                                value={searchKeywords}
                                                onChange={(e) => setSearchKeywords(e.target.value)}
                                                className="w-full px-3 py-3 bg-white/10 backdrop-blur-md border-0 rounded-full text-white text-sm placeholder-white/70 focus:ring-2 focus:ring-purple-400/50 transition-all duration-300 hover:bg-white/15"
                                            />
                                        </div>
                                    </div>

                                    {/* Row 3: Action Buttons */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleSearch}
                                            className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white px-4 py-3 rounded-full font-semibold text-sm transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center gap-2 border border-white/20"
                                        >
                                            <span>🔍</span>
                                            <span>Search</span>
                                        </button>
                                        <button
                                            onClick={handleResetFilters}
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
                                            className="w-full px-4 py-2.5 bg-white/10 backdrop-blur-md border-0 rounded-full text-white text-sm placeholder-white/70 focus:ring-2 focus:ring-purple-400/50 transition-all duration-300 hover:bg-white/15 appearance-none cursor-pointer glass-select"
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
                                            className="w-full px-4 py-2.5 bg-white/10 backdrop-blur-md border-0 rounded-full text-white text-sm placeholder-white/70 focus:ring-2 focus:ring-purple-400/50 transition-all duration-300 hover:bg-white/15 appearance-none cursor-pointer glass-select"
                                        >
                                            <option value="">💼 Professional Service</option>
                                            {professionalServiceCategories.map((category) => (
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
                                            placeholder="💰 Budget (e.g., GH₵200)"
                                            value={searchBudget}
                                            onChange={(e) => setSearchBudget(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-white/10 backdrop-blur-md border-0 rounded-full text-white text-sm placeholder-white/70 focus:ring-2 focus:ring-purple-400/50 transition-all duration-300 hover:bg-white/15"
                                        />
                                    </div>

                                    {/* Keywords Input */}
                                    <div className="relative flex-1 min-w-[180px]">
                                        <input
                                            type="text"
                                            placeholder="🔍 Keywords (e.g., lawyer, accountant)"
                                            value={searchKeywords}
                                            onChange={(e) => setSearchKeywords(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-white/10 backdrop-blur-md border-0 rounded-full text-white text-sm placeholder-white/70 focus:ring-2 focus:ring-purple-400/50 transition-all duration-300 hover:bg-white/15"
                                        />
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={handleSearch}
                                            className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 hover:scale-105 shadow-lg flex items-center gap-2 border border-white/20"
                                        >
                                            <span>🔍</span>
                                            <span>Find Experts</span>
                                        </button>
                                        <button
                                            onClick={handleResetFilters}
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

            {/* Professional Service Providers Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-12">
                        <div>
                            <h2 className="text-4xl font-bold mb-4 text-gray-800">Available Professional Service Providers</h2>
                            <p className="text-xl text-gray-600">
                                {filteredProviders.length > 0 ?
                                    `Found ${filteredProviders.length} professional${filteredProviders.length !== 1 ? 's' : ''} ${(searchLocation || searchService || searchBudget || searchKeywords) ? 'matching your criteria' : 'available'
                                    }` :
                                    'Expert professionals for your business and legal needs'
                                }
                            </p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors"
                            >
                                <option value="rating">Sort by Rating</option>
                                <option value="price">Sort by Price (Low to High)</option>
                                <option value="experience">Sort by Experience</option>
                                <option value="reviews">Sort by Reviews</option>
                            </select>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                            <p className="mt-4 text-gray-600">Loading professional service providers...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-12">
                            <p className="text-red-600 mb-4">{error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : filteredProviders.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-600">No professional service providers found matching your criteria.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {filteredProviders.map((professional) => (
                                <div key={professional.id} className="group relative">
                                    {/* Glass Effect Background */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 via-transparent to-indigo-400/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>

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
                                                    <div className="absolute top-3 right-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white">
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
                                                    <div className="text-xs text-white/80">per consultation</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Content Section */}
                                        <div className="p-4">
                                            {/* Name and Specialty */}
                                            <div className="mb-3">
                                                <h3 className="text-lg font-bold text-gray-800 dark:text-white group-hover:text-purple-600 transition-colors mb-1">
                                                    {professional.name}
                                                </h3>
                                                <p className="text-purple-600 dark:text-purple-400 font-semibold text-sm">{professional.specialty}</p>
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
                                                                className="ml-1 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium underline focus:outline-none transition-colors"
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
                                                    <span key={index} className="bg-purple-500/10 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full text-xs font-medium border border-purple-500/20">
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
                                                href={`/professional-services/professional/${professional.id}`}
                                                className="block w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white py-3 px-4 rounded-2xl font-semibold text-center transition-all duration-300 hover:scale-105 shadow-lg text-sm"
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