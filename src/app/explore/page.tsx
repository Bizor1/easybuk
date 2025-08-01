'use client'

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import CategoryNavbar from '@/components/CategoryNavbar';
import BookingForm from '@/components/BookingForm';
import { useExploreData } from '@/hooks/useAPI';

// Type definitions
interface BaseItem {
    id: number;
    realServiceId?: string;  // Add real service ID
    realProviderId?: string;  // Add real provider ID
    type: 'professional' | 'service' | 'category' | 'trending' | 'featured';
    name: string;
    title: string;
    category: string;
    image: string;
    location: string;
    height: string;
    isLive?: boolean;
    isHot?: boolean;
    isTrending?: boolean;
    isVerified?: boolean;
    responseTime?: string;
    completedJobs?: number;
    discount?: number;
}

interface Professional extends BaseItem {
    type: 'professional';
    rating: number;
    reviews: number;
    price: string;
    badge: string;
    badgeColor: string;
    availability?: string;
    specialties?: string[];
    portfolio?: string[];
    skills?: string[];
}

interface Service extends BaseItem {
    type: 'service';
    rating: number;
    reviews: number;
    price: string;
    badge: string;
    badgeColor: string;
    provider: string;
    subjects?: string[];
    originalPrice?: string;
    discountedPrice?: string;
}

interface Category extends BaseItem {
    type: 'category';
    professionals: number;
    averagePrice: string;
    description: string;
}

interface TrendingItem extends BaseItem {
    type: 'trending';
    trendingScore: number;
    weeklyGrowth: string;
    totalBookings: number;
}

interface FeaturedItem extends BaseItem {
    type: 'featured';
    featuredUntil: string;
    originalPrice: string;
    discountedPrice: string;
}

type ExploreItem = Professional | Service | Category | TrendingItem | FeaturedItem;

export default function Explore() {
    const { user, logout, loading: authLoading } = useAuth();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sortBy, setSortBy] = useState('trending');
    const [additionalItems, setAdditionalItems] = useState<ExploreItem[]>([]);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);

    // Use SWR for initial data with caching
    const searchParams = new URLSearchParams({
        page: '1',
        limit: '20',
        category: selectedCategory,
        search: searchQuery,
        sortBy: sortBy
    }).toString();
    const { professionals: initialItems, isLoading, isError, mutateExplore } = useExploreData(searchParams);
    const [showFilters, setShowFilters] = useState(false);
    const [priceRange, setPriceRange] = useState([0, 1000]);
    const [selectedRating, setSelectedRating] = useState(0);
    const [isOnlineOnly, setIsOnlineOnly] = useState(false);
    const [nearMe, setNearMe] = useState(false);
    const [showBookingForm, setShowBookingForm] = useState(false);
    const [selectedService, setSelectedService] = useState<any>(null);
    const observer = useRef<IntersectionObserver>();

    // Clean, brand-aligned categories
    const categories = [
        { id: 'all', name: 'All Services', icon: '⭐', color: 'from-blue-600 to-blue-700', count: '50K+' },
        { id: 'healthcare', name: 'Healthcare', icon: '🏥', color: 'from-blue-500 to-blue-600', count: '12K+' },
        { id: 'creative', name: 'Creative', icon: '🎨', color: 'from-orange-500 to-orange-600', count: '8K+' },
        { id: 'professional', name: 'Professional', icon: '💼', color: 'from-slate-600 to-slate-700', count: '15K+' },
        { id: 'home', name: 'Home Services', icon: '🏠', color: 'from-emerald-500 to-emerald-600', count: '6K+' },
        { id: 'education', name: 'Education', icon: '🎓', color: 'from-indigo-500 to-indigo-600', count: '4K+' },
        { id: 'technical', name: 'Technical', icon: '⚡', color: 'from-yellow-500 to-yellow-600', count: '5K+' },
    ];

    // Simplified sort options
    const sortOptions = [
        { id: 'trending', name: 'Trending Now', icon: '📈' },
        { id: 'rating', name: 'Highest Rated', icon: '⭐' },
        { id: 'newest', name: 'Newest', icon: '✨' },
        { id: 'price_low', name: 'Price: Low to High', icon: '💰' },
        { id: 'price_high', name: 'Price: High to Low', icon: '💎' },
        { id: 'distance', name: 'Nearest to Me', icon: '📍' },
    ];

    // No more mock data - fetching real data from API

    // Load more items (infinite scroll) - only for additional pages
    const loadMoreItems = useCallback(async () => {
        if (loadingMore || !hasMore || page === 1) return;

        setLoadingMore(true);

        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '20',
                category: selectedCategory,
                search: searchQuery,
                sortBy: sortBy
            });

            const response = await fetch(`/api/explore?${params}`);
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setAdditionalItems(prev => [...prev, ...data.items]);
                    setPage(prev => prev + 1);
                    setHasMore(data.pagination.hasMore);
                } else {
                    setHasMore(false);
                }
            } else {
                console.error('Failed to fetch explore data');
                setHasMore(false);
            }
        } catch (error) {
            console.error('Error fetching explore data:', error);
            setHasMore(false);
        }

        setLoadingMore(false);
    }, [loadingMore, hasMore, page, selectedCategory, searchQuery, sortBy]);

    // Reset additional items and pagination when filters change
    useEffect(() => {
        setAdditionalItems([]); // Clear additional items when filters change
        setPage(2); // Reset page to 2 (since SWR handles page 1)
        setHasMore(true); // Reset hasMore
    }, [selectedCategory, searchQuery, sortBy]);

    // Combine initial SWR data with additional infinite scroll data
    const allItems = useMemo(() => {
        return [...(initialItems || []), ...additionalItems];
    }, [initialItems, additionalItems]);

    // Infinite scroll observer
    const lastItemRef = useCallback((node: HTMLDivElement | null) => {
        if (isLoading || loadingMore) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                loadMoreItems();
            }
        });
        if (node) observer.current.observe(node);
    }, [isLoading, loadingMore, hasMore, loadMoreItems]);

    // Filter items based on category and search
    const filteredItems = allItems.filter((item: ExploreItem) => {
        const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });



    // Function to handle booking
    const handleBookNow = (item: ExploreItem) => {
        console.log('HandleBookNow called - User:', user);
        console.log('User authenticated:', !!user);

        if (!user) {
            console.log('No user found, redirecting to login');
            // Redirect to login if not authenticated
            window.location.href = '/auth/login';
            return;
        }

        console.log('User found, proceeding with booking');
        console.log('Item data:', item);

        // Check if we have real service ID and provider ID
        const serviceId = item.realServiceId;
        const providerId = item.realProviderId;

        if (!serviceId || !providerId) {
            console.error('No real service/provider ID found for item:', item);
            alert('Sorry, this service is not available for booking at the moment.');
            return;
        }

        // Use data directly from the item (now includes all needed fields from explore API)
        const serviceData = {
            id: serviceId,
            title: (item as any).name || item.name,
            description: (item as any).description || item.title,
            basePrice: (item as any).basePrice || parseFloat((item as any).price?.replace(/[^0-9.]/g, '') || '50'),
            currency: (item as any).currency || 'GHS',
            pricingType: (item as any).pricingType || 'HOURLY' as const,
            duration: (item as any).duration || 1,
            durationUnit: 'hours',
            supportedBookingTypes: (item as any).supportedBookingTypes || ['IN_PERSON'], // Use supported booking types from explore API
            provider: {
                id: providerId,  // Use real provider ID from database
                name: (item as any).provider || 'Professional Provider',
                rating: (item as any).rating || 4.5
            },
            category: item.category // Add category for modal styling
        };

        console.log('Service data with booking types:', serviceData);
        setSelectedService(serviceData);
        setShowBookingForm(true);
    };

    const handleBookingComplete = (bookingData: any) => {
        console.log('Booking completed:', bookingData);
        setShowBookingForm(false);
        setSelectedService(null);
        // You could show a success message or redirect here
        alert('Booking completed successfully!');
    };

    const handleCloseBooking = () => {
        setShowBookingForm(false);
        setSelectedService(null);
    };



    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
            {/* Custom Styles */}
            <style jsx>{`
                
                .clean-button {
                    background: linear-gradient(135deg, #1a5173, #2d6591);
                    transition: all 0.3s ease;
                }
                
                .clean-button:hover {
                    background: linear-gradient(135deg, #2d6591, #1a5173);
                    transform: translateY(-1px);
                }
                
                .orange-button {
                    background: linear-gradient(135deg, #e37922, #ff8c42);
                    transition: all 0.3s ease;
                }
                
                .orange-button:hover {
                    background: linear-gradient(135deg, #ff8c42, #e37922);
                    transform: translateY(-1px);
                }
                
                .floating-shapes {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    overflow: hidden;
                    pointer-events: none;
                }
                
                .shape {
                    position: absolute;
                    background: linear-gradient(45deg, rgba(26, 81, 115, 0.05), rgba(227, 121, 34, 0.05));
                    border-radius: 50%;
                    animation: float 20s infinite linear;
                }
                
                .shape-1 {
                    width: 200px;
                    height: 200px;
                    top: 20%;
                    left: 10%;
                    animation-delay: 0s;
                }
                
                .shape-2 {
                    width: 150px;
                    height: 150px;
                    top: 60%;
                    right: 20%;
                    animation-delay: -5s;
                }
                
                .shape-3 {
                    width: 100px;
                    height: 100px;
                    bottom: 20%;
                    left: 50%;
                    animation-delay: -10s;
                }
                
                .shape-4 {
                    width: 250px;
                    height: 250px;
                    top: 10%;
                    right: 10%;
                    animation-delay: -15s;
                }
                
                @keyframes float {
                    0% {
                        transform: translateY(0px) rotate(0deg);
                        opacity: 0.3;
                    }
                    50% {
                        transform: translateY(-100px) rotate(180deg);
                        opacity: 0.6;
                    }
                    100% {
                        transform: translateY(0px) rotate(360deg);
                        opacity: 0.3;
                    }
                }
                
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }

                .category-scroll {
                    scroll-behavior: smooth;
                    scrollbar-width: none;
                    -ms-overflow-style: none;
                }

                .category-scroll::-webkit-scrollbar {
                    display: none;
                }
            `}</style>

            <CategoryNavbar
                backText="← Back to Home"
                backHref="/"
                hoverColor="text-blue-600"
                bgGradient="from-blue-500 to-orange-500"
            />

            {/* Hero Search Section */}
            <section className="relative pt-20 pb-8 overflow-hidden">
                {/* Clean Background */}
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 via-white/30 to-orange-50/50 dark:from-slate-900/50 dark:via-slate-800/30 dark:to-slate-900/50"></div>
                    <div className="floating-shapes">
                        <div className="shape shape-1"></div>
                        <div className="shape shape-2"></div>
                        <div className="shape shape-3"></div>
                        <div className="shape shape-4"></div>
                    </div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center space-x-2 bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-full px-4 py-2 mb-6">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            <span className="text-blue-700 dark:text-blue-300 text-sm">2,800+ professionals available now</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                            Explore
                            <span className="block text-gradient-blue">
                                Everything
                            </span>
                            <span className="block text-3xl md:text-5xl mt-2 text-gray-600 dark:text-gray-300">
                                Ghana Has to Offer
                            </span>
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                            From healthcare heroes to creative legends, discover Ghana&apos;s most talented professionals.
                            <span className="text-orange-600 dark:text-orange-400 font-semibold"> Real people, real results.</span>
                        </p>
                    </div>

                    {/* Clean Search Bar */}
                    <div className="max-w-4xl mx-auto">
                        <div className="relative group">
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-xl border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300">
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                    {/* Search Input */}
                                    <div className="md:col-span-7 relative">
                                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                            <span className="text-xl">🔍</span>
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Search doctors, designers, developers..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3 sm:py-4 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-base sm:text-lg focus:outline-none mobile-search-input"
                                        />
                                    </div>

                                    {/* Location */}
                                    <div className="md:col-span-3 relative">
                                        <select className="w-full px-4 py-3 bg-transparent text-gray-900 dark:text-white focus:outline-none appearance-none cursor-pointer">
                                            <option value="" className="bg-white dark:bg-slate-800">All Locations</option>
                                            <option value="accra" className="bg-white dark:bg-slate-800">Accra</option>
                                            <option value="kumasi" className="bg-white dark:bg-slate-800">Kumasi</option>
                                            <option value="tamale" className="bg-white dark:bg-slate-800">Tamale</option>
                                            <option value="remote" className="bg-white dark:bg-slate-800">Remote</option>
                                        </select>
                                    </div>

                                    {/* Search Button */}
                                    <div className="md:col-span-2">
                                        <button className="w-full clean-button text-white py-3 px-6 rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105 shadow-lg">
                                            Search
                                        </button>
                                    </div>
                                </div>

                                {/* Quick Suggestions */}
                                <div className="mt-4">
                                    <span className="text-gray-500 dark:text-gray-400 text-sm block sm:inline mb-2 sm:mb-0">Popular:</span>
                                    <div className="flex flex-wrap gap-2 mt-2 sm:mt-0 sm:inline-flex sm:ml-2">
                                        {['Doctors', 'Web Design', 'Home Cleaning', 'Tutoring', 'Legal Help'].map((term, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setSearchQuery(term)}
                                                className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 sm:px-3 sm:py-1 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 min-h-[40px] sm:min-h-auto flex items-center justify-center"
                                            >
                                                {term}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories & Filters */}
            <section className="py-4 sm:py-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 sticky top-16 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
                        {/* Smooth Categories */}
                        <div className="flex items-center space-x-2 sm:space-x-3 overflow-x-auto category-scroll pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
                            {categories.map((category) => (
                                <Link
                                    key={category.id}
                                    href={category.id === 'all' ? '/explore' : `/${category.id === 'home' ? 'home-services' : category.id === 'professional' ? 'professional-services' : category.id === 'technical' ? 'technical' : category.id}`}
                                    className={`relative flex items-center space-x-2 px-3 py-2 sm:px-4 sm:py-2 rounded-xl font-medium whitespace-nowrap transition-all duration-300 transform hover:scale-105 min-h-[48px] sm:min-h-auto ${selectedCategory === category.id
                                        ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                                        : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600'
                                        }`}
                                >
                                    <span className="text-lg sm:text-base">{category.icon}</span>
                                    <div className="flex flex-col items-start">
                                        <span className="text-xs sm:text-sm font-medium">{category.name}</span>
                                        <span className="text-[10px] sm:text-xs opacity-75">{category.count}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Filters Toggle */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center justify-center sm:justify-start space-x-2 px-4 py-3 sm:py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl transition-all duration-300 border border-gray-200 dark:border-gray-600 min-h-[48px] sm:min-h-auto font-medium"
                        >
                            <span className="text-lg sm:text-base">⚙️</span>
                            <span className="text-sm sm:text-base">Filters</span>
                            <div className={`transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`}>⌄</div>
                        </button>
                    </div>

                    {/* Filters Panel */}
                    <div className={`transition-all duration-500 overflow-hidden ${showFilters ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                {/* Sort Options */}
                                <div>
                                    <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-3">Sort By</label>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        {sortOptions.map((option) => (
                                            <option key={option.id} value={option.id} className="bg-white dark:bg-slate-800">
                                                {option.icon} {option.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Price Range */}
                                <div>
                                    <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-3">Price Range</label>
                                    <div className="space-y-2">
                                        <input
                                            type="range"
                                            min="0"
                                            max="1000"
                                            value={priceRange[1]}
                                            onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                                            className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
                                        />
                                        <div className="flex justify-between text-gray-600 dark:text-gray-400 text-xs">
                                            <span>GH₵0</span>
                                            <span>GH₵{priceRange[1]}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Rating Filter */}
                                <div>
                                    <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-3">Min Rating</label>
                                    <div className="flex space-x-1">
                                        {[1, 2, 3, 4, 5].map((rating) => (
                                            <button
                                                key={rating}
                                                onClick={() => setSelectedRating(rating)}
                                                className={`text-xl transition-all duration-200 hover:scale-110 ${rating <= selectedRating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
                                                    }`}
                                            >
                                                ⭐
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Quick Filters */}
                                <div>
                                    <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-3">Quick Filters</label>
                                    <div className="space-y-2">
                                        <label className="flex items-center space-x-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={isOnlineOnly}
                                                onChange={(e) => setIsOnlineOnly(e.target.checked)}
                                                className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-gray-700 dark:text-gray-300 text-sm">Online Services</span>
                                        </label>
                                        <label className="flex items-center space-x-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={nearMe}
                                                onChange={(e) => setNearMe(e.target.checked)}
                                                className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-gray-700 dark:text-gray-300 text-sm">Near Me</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Active Filters */}
                    {(selectedCategory !== 'all' || searchQuery || selectedRating > 0) && (
                        <div className="flex items-center space-x-2 mt-4">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Active filters:</span>
                            {selectedCategory !== 'all' && (
                                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm flex items-center space-x-1 border border-blue-200 dark:border-blue-700">
                                    <span>{categories.find(c => c.id === selectedCategory)?.name}</span>
                                    <button onClick={() => setSelectedCategory('all')} className="ml-1 hover:text-blue-900 dark:hover:text-blue-100 transition-colors">×</button>
                                </span>
                            )}
                            {searchQuery && (
                                <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-3 py-1 rounded-full text-sm flex items-center space-x-1 border border-orange-200 dark:border-orange-700">
                                    <span>&quot;{searchQuery}&quot;</span>
                                    <button onClick={() => setSearchQuery('')} className="ml-1 hover:text-orange-900 dark:hover:text-orange-100 transition-colors">×</button>
                                </span>
                            )}
                            {selectedRating > 0 && (
                                <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-3 py-1 rounded-full text-sm flex items-center space-x-1 border border-yellow-200 dark:border-yellow-700">
                                    <span>{selectedRating}+ ⭐</span>
                                    <button onClick={() => setSelectedRating(0)} className="ml-1 hover:text-yellow-900 dark:hover:text-yellow-100 transition-colors">×</button>
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </section>

            {/* Trending Banner */}
            <section className="py-3 sm:py-4 bg-gradient-to-r from-blue-50 to-orange-50 dark:from-blue-900/20 dark:to-orange-900/20 border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                        <div className="flex items-center space-x-3">
                            <div className="text-xl sm:text-2xl animate-bounce">🔥</div>
                            <div>
                                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">Trending Right Now</h3>
                                <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Most booked services in the last 24 hours</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 sm:space-x-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400 ml-8 sm:ml-0">
                            <div className="flex items-center space-x-1">
                                <span className="text-sm sm:text-base">📈</span>
                                <span className="font-medium">+127% bookings today</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Results Section */}
            <section className="py-6 sm:py-8 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Results Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                Discover Amazing Professionals
                            </h2>
                            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                                Showing {filteredItems.length} results
                                {selectedCategory !== 'all' && ` in ${categories.find(c => c.id === selectedCategory)?.name}`}
                                {searchQuery && ` for "${searchQuery}"`}
                            </p>
                        </div>
                        <div className="flex items-center space-x-2 sm:space-x-3">
                            <button className="px-3 py-2 sm:px-4 sm:py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-all duration-300 border border-gray-200 dark:border-gray-600 text-xs sm:text-sm font-medium">
                                📊 Analytics
                            </button>
                            <button className="px-3 py-2 sm:px-4 sm:py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-all duration-300 border border-gray-200 dark:border-gray-600 text-xs sm:text-sm font-medium">
                                💾 Save Search
                            </button>
                        </div>
                    </div>

                    {/* Masonry Grid */}
                    <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
                        {filteredItems.map((item, index) => (
                            <div
                                key={item.id}
                                ref={index === filteredItems.length - 1 ? lastItemRef : null}
                                className="break-inside-avoid group cursor-pointer transform transition-all duration-300 hover:scale-105 relative"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                {/* Professional Card */}
                                {item.type === 'professional' && (
                                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600">
                                        {/* Live Badge */}
                                        {item.isLive && (
                                            <div className="absolute top-3 left-3 z-20 flex items-center space-x-1 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                                                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                                                <span>LIVE</span>
                                            </div>
                                        )}

                                        {/* Hot Badge */}
                                        {item.isHot && (
                                            <div className="absolute top-3 right-3 z-20 text-xl animate-bounce">🔥</div>
                                        )}

                                        {/* Image */}
                                        <div className="relative h-48 overflow-hidden">
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                fill
                                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>

                                            {/* Badges */}
                                            <div className="absolute bottom-3 left-3 flex items-center space-x-2">
                                                <span className={`${item.badgeColor} text-white px-2 py-1 rounded-lg text-xs font-medium`}>
                                                    {item.badge}
                                                </span>
                                                {item.isVerified && (
                                                    <span className="bg-blue-500 text-white px-2 py-1 rounded-lg text-xs font-medium">✓ Verified</span>
                                                )}
                                            </div>

                                            {/* Rating */}
                                            <div className="absolute bottom-3 right-3">
                                                <div className="bg-black/40 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center space-x-1">
                                                    <span className="text-yellow-400 text-sm">⭐</span>
                                                    <span className="text-white font-medium text-sm">{(item as Professional).rating}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-5">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{item.name}</h3>
                                                    <p className="text-gray-600 dark:text-gray-400 font-medium">{item.title}</p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-xl font-bold text-gray-900 dark:text-white">{(item as Professional).price}</div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">per session</div>
                                                </div>
                                            </div>

                                            {/* Stats */}
                                            <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                                                <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-2">
                                                    <div className="text-gray-900 dark:text-white font-bold text-sm">{item.completedJobs}</div>
                                                    <div className="text-gray-600 dark:text-gray-400 text-xs">Jobs</div>
                                                </div>
                                                <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-2">
                                                    <div className="text-gray-900 dark:text-white font-bold text-sm">{item.responseTime}</div>
                                                    <div className="text-gray-600 dark:text-gray-400 text-xs">Response</div>
                                                </div>
                                                <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-2">
                                                    <div className="text-gray-900 dark:text-white font-bold text-sm">{(item as Professional).reviews}</div>
                                                    <div className="text-gray-600 dark:text-gray-400 text-xs">Reviews</div>
                                                </div>
                                            </div>

                                            {/* Specialties */}
                                            {(item as Professional).specialties && (
                                                <div className="flex flex-wrap gap-2 mb-4">
                                                    {(item as Professional).specialties!.slice(0, 2).map((specialty, idx) => (
                                                        <span key={idx} className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-lg text-xs border border-blue-200 dark:border-blue-700">
                                                            {specialty}
                                                        </span>
                                                    ))}
                                                    {(item as Professional).specialties!.length > 2 && (
                                                        <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-lg text-xs border border-gray-200 dark:border-gray-600">
                                                            +{(item as Professional).specialties!.length - 2} more
                                                        </span>
                                                    )}
                                                </div>
                                            )}

                                            {/* Action Buttons */}
                                            <div className="grid grid-cols-2 gap-3">
                                                <button className="clean-button text-white py-2 px-4 rounded-lg font-medium transition-all duration-300 hover:scale-105">
                                                    💬 Chat
                                                </button>
                                                <button
                                                    onClick={() => handleBookNow(item)}
                                                    className="orange-button text-white py-2 px-4 rounded-lg font-medium transition-all duration-300 hover:scale-105"
                                                >
                                                    🚀 Book
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Service Card */}
                                {item.type === 'service' && (
                                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600">
                                        <div className="relative h-40 overflow-hidden">
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                fill
                                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>

                                            {item.discount && (
                                                <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-lg text-sm font-medium">
                                                    {item.discount}% OFF
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-5">
                                            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{item.name}</h3>
                                            <p className="text-gray-600 dark:text-gray-400 mb-3">{item.title}</p>

                                            <div className="flex items-center justify-between mb-4">
                                                {(item as Service).discountedPrice ? (
                                                    <div>
                                                        <span className="text-lg font-bold text-gray-900 dark:text-white">{(item as Service).discountedPrice}</span>
                                                        <span className="text-sm text-gray-500 dark:text-gray-400 line-through ml-2">{(item as Service).originalPrice}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-lg font-bold text-gray-900 dark:text-white">{(item as Service).price}</span>
                                                )}
                                                <div className="flex items-center space-x-1">
                                                    <span className="text-yellow-400">⭐</span>
                                                    <span className="text-gray-900 dark:text-white font-medium">{(item as Service).rating}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
                                                <span>by {(item as Service).provider}</span>
                                                <span>{item.location}</span>
                                            </div>

                                            <button
                                                onClick={() => handleBookNow(item)}
                                                className="w-full orange-button text-white py-2 px-4 rounded-lg font-medium transition-all duration-300 hover:scale-105"
                                            >
                                                🚀 Book Now
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Trending Card */}
                                {item.type === 'trending' && (
                                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-yellow-200 dark:border-yellow-700 hover:border-yellow-300 dark:hover:border-yellow-600">
                                        <div className="p-5">
                                            <div className="flex items-center space-x-2 mb-4">
                                                <span className="bg-yellow-500 text-black px-2 py-1 rounded-lg text-xs font-medium">🔥 TRENDING</span>
                                                <span className="bg-green-500 text-white px-2 py-1 rounded-lg text-xs font-medium">
                                                    {(item as TrendingItem).weeklyGrowth}
                                                </span>
                                            </div>

                                            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{item.name}</h3>
                                            <p className="text-gray-600 dark:text-gray-400 mb-4">{item.title}</p>

                                            <div className="grid grid-cols-2 gap-2 mb-4 text-center">
                                                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 border border-yellow-200 dark:border-yellow-700">
                                                    <div className="text-yellow-600 dark:text-yellow-400 font-bold">{(item as TrendingItem).trendingScore}</div>
                                                    <div className="text-gray-600 dark:text-gray-400 text-xs">Score</div>
                                                </div>
                                                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 border border-yellow-200 dark:border-yellow-700">
                                                    <div className="text-yellow-600 dark:text-yellow-400 font-bold">{(item as TrendingItem).totalBookings}</div>
                                                    <div className="text-gray-600 dark:text-gray-400 text-xs">Bookings</div>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => handleBookNow(item)}
                                                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black py-2 px-4 rounded-lg font-medium transition-all duration-300 hover:scale-105"
                                            >
                                                🔥 Join Trend
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Featured Card */}
                                {item.type === 'featured' && (
                                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-blue-200 dark:border-blue-700 hover:border-blue-300 dark:hover:border-blue-600">
                                        <div className="absolute top-3 left-3 bg-blue-500 text-white px-2 py-1 rounded-lg text-xs font-medium">
                                            ⭐ FEATURED
                                        </div>

                                        <div className="relative h-40 overflow-hidden">
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                fill
                                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                        </div>

                                        <div className="p-5">
                                            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{item.name}</h3>
                                            <p className="text-gray-600 dark:text-gray-400 mb-4">{item.title}</p>

                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <span className="text-lg font-bold text-gray-900 dark:text-white">{(item as FeaturedItem).discountedPrice}</span>
                                                    <span className="text-sm text-gray-500 dark:text-gray-400 line-through ml-2">{(item as FeaturedItem).originalPrice}</span>
                                                </div>
                                                <span className="bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-medium">
                                                    -{item.discount}% OFF
                                                </span>
                                            </div>

                                            <button
                                                onClick={() => handleBookNow(item)}
                                                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-all duration-300 hover:scale-105"
                                            >
                                                💎 Get Deal
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Category Card */}
                                {item.type === 'category' && (
                                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-600">
                                        <div className="relative h-32 overflow-hidden">
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                fill
                                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40"></div>
                                        </div>

                                        <div className="p-5">
                                            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{item.name}</h3>
                                            <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">{(item as Category).description}</p>

                                            <div className="grid grid-cols-2 gap-2 mb-4">
                                                <div className="text-center">
                                                    <div className="text-gray-900 dark:text-white font-bold">{(item as Category).professionals}</div>
                                                    <div className="text-gray-600 dark:text-gray-400 text-xs">Professionals</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-gray-900 dark:text-white font-bold">{(item as Category).averagePrice}</div>
                                                    <div className="text-gray-600 dark:text-gray-400 text-xs">Avg Price</div>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => handleBookNow(item)}
                                                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white py-2 px-4 rounded-lg font-medium transition-all duration-300 hover:scale-105"
                                            >
                                                🚀 Explore
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Load More */}
                    {hasMore && (
                        <div className="text-center mt-12">
                            <button
                                onClick={loadMoreItems}
                                disabled={loadingMore}
                                className="clean-button text-white px-8 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 disabled:opacity-50"
                            >
                                {loadingMore ? (
                                    <div className="flex items-center space-x-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>Loading...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center space-x-2">
                                        <span>🚀</span>
                                        <span>Load More</span>
                                    </div>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {/* Floating Buttons */}
            <div className="fixed bottom-6 right-6 z-50 space-y-3">
                <button className="w-12 h-12 clean-button text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center">
                    <span className="text-lg">💬</span>
                </button>
                <button className="w-12 h-12 orange-button text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center">
                    <span className="text-lg">🎯</span>
                </button>
            </div>

            {/* Booking Form */}
            {
                showBookingForm && selectedService && (
                    <BookingForm
                        service={selectedService}
                        category={selectedService.category?.toLowerCase() as any || 'professional'}
                        onBookingComplete={handleBookingComplete}
                        onClose={handleCloseBooking}
                    />
                )
            }
        </div>
    );
} 