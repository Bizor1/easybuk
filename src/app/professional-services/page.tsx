'use client'

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import NotificationBell from '@/components/NotificationBell';

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
    const [professionalServiceProviders, setProfessionalServiceProviders] = useState<ProfessionalServiceProvider[]>([]);
    const [filteredProviders, setFilteredProviders] = useState<ProfessionalServiceProvider[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Get authentication state
    const { user, logout, loading: authLoading } = useAuth();

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

    // Filter providers based on search criteria
    const filterProviders = () => {
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
                provider.services.some(service =>
                    service.toLowerCase().includes(searchService.toLowerCase())
                ) ||
                provider.specializations.some(spec =>
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
                    provider.services.some(service => service.toLowerCase().includes(keyword)) ||
                    provider.specializations.some(spec => spec.toLowerCase().includes(keyword))
                )
            );
        }

        setFilteredProviders(filtered);
    };

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
        setFilteredProviders(professionalServiceProviders);
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

                            {/* Authentication Section */}
                            {authLoading ? (
                                <div className="animate-pulse bg-gray-200 h-10 w-20 rounded-lg"></div>
                            ) : user ? (
                                <div className="flex items-center space-x-3">
                                    {/* Notification Bell */}
                                    <NotificationBell userType={user.roles.includes('PROVIDER') ? 'PROVIDER' : 'CLIENT'} />

                                    <div className="flex items-center space-x-2">
                                        <Image
                                            src={user.image || '/default-avatar.svg'}
                                            alt={user.name || 'User'}
                                            width={32}
                                            height={32}
                                            className="w-8 h-8 rounded-full"
                                        />
                                        <div className="relative group">
                                            <button className="flex items-center space-x-1 text-gray-700 hover:text-purple-600 transition-colors">
                                                <span className="text-sm font-medium">{user.name}</span>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>

                                            <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                                                <div className="py-2">
                                                    <Link
                                                        href={user.roles.includes('PROVIDER') ? '/provider/dashboard' : '/client/dashboard'}
                                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                                    >
                                                        Dashboard
                                                    </Link>
                                                    <button
                                                        onClick={logout}
                                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                                    >
                                                        Sign Out
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-3">
                                    <Link href="/auth/login" className="text-gray-700 hover:text-purple-600 transition-colors">Sign In</Link>
                                    <Link href="/auth/signup" className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg transition-all duration-300">Sign Up</Link>
                                    <Link href="/auth/signup?role=provider" className="border border-purple-600 text-purple-600 hover:bg-purple-50 px-4 py-2 rounded-lg transition-colors">For Providers</Link>
                                </div>
                            )}

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

                    {/* Sleek Modern Search Bar */}
                    <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 w-full max-w-7xl px-4">
                        <div className="relative group">
                            {/* Glow effect */}
                            <div className="absolute -inset-1 bg-gradient-to-r from-purple-400/20 to-indigo-400/20 rounded-full blur-lg group-hover:blur-xl transition-all duration-300"></div>

                            {/* Main search container */}
                            <div className="relative bg-white/10 backdrop-blur-3xl rounded-full px-6 py-3 shadow-2xl border border-white/20 hover:border-white/30 transition-all duration-300">

                                <div className="flex items-center gap-3">
                                    {/* Location Selector */}
                                    <div className="relative min-w-[160px]">
                                        <select
                                            value={searchLocation}
                                            onChange={(e) => setSearchLocation(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-white/10 backdrop-blur-md border-0 rounded-full text-white text-sm placeholder-white/70 focus:ring-2 focus:ring-purple-400/50 transition-all duration-300 hover:bg-white/15 appearance-none cursor-pointer"
                                        >
                                            <option value="" className="bg-gray-800 text-white">📍 Select Location</option>
                                            {ghanaCities.map((city) => (
                                                <option key={city} value={city} className="bg-gray-800 text-white">
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
                                            className="w-full px-4 py-2.5 bg-white/10 backdrop-blur-md border-0 rounded-full text-white text-sm placeholder-white/70 focus:ring-2 focus:ring-purple-400/50 transition-all duration-300 hover:bg-white/15 appearance-none cursor-pointer"
                                        >
                                            <option value="" className="bg-gray-800 text-white">💼 Professional Service</option>
                                            {professionalServiceCategories.map((category) => (
                                                <option key={category} value={category} className="bg-gray-800 text-white">
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
                            <select className="px-4 py-2 border border-gray-300 rounded-lg">
                                <option>Sort by Rating</option>
                                <option>Sort by Price</option>
                                <option>Sort by Experience</option>
                                <option>Sort by Distance</option>
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
                                                        {typeof professional.availability === 'string' ? professional.availability : 'Available for booking'}
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
                                                        {professional.specializations.map((spec: string, index: number) => (
                                                            <span key={index} className="bg-purple-50 text-purple-700 px-2 py-1 rounded text-xs">
                                                                {spec}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="mb-4">
                                                    <p className="text-sm text-gray-600 mb-1">Services:</p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {professional.services.slice(0, 3).map((service: string, index: number) => (
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