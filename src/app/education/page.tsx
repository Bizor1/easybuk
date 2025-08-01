'use client'

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import CategoryNavbar from '@/components/CategoryNavbar';
import { useCategoryData } from '@/hooks/useAPI';

interface EducationProfessional {
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

export default function Education() {
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

    // Use SWR for data fetching with caching
    const { items: rawEducationData, isLoading: loading, isError, mutateCategory } = useCategoryData('education');

    // Banner carousel data with education themes
    const bannerAds = [
        {
            image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
            title: "WASSCE Preparation",
            subtitle: "Expert tutoring for West African Senior School Certificate Examination",
            provider: "AcademyMax Ghana",
            action: "Start Learning"
        },
        {
            image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
            title: "Digital Skills Training",
            subtitle: "Master technology and digital literacy for the modern world",
            provider: "TechEdu Ghana",
            action: "Get Certified"
        },
        {
            image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
            title: "English Fluency Program",
            subtitle: "Improve your English speaking and writing skills",
            provider: "SpeakWell Institute",
            action: "Speak Better"
        },
        {
            image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
            title: "Professional Certification",
            subtitle: "Industry-recognized certifications to advance your career",
            provider: "CareerBoost Academy",
            action: "Get Certified"
        }
    ];



    // Transform the data to match the expected format
    const educationProfessionals = useMemo(() => {
        return rawEducationData.map((item: any) => ({
            id: item.realProviderId || item.id,
            name: item.name,
            specialty: item.type === 'professional' ? item.category.charAt(0).toUpperCase() + item.category.slice(1) : item.title,
            image: item.image,
            rating: item.rating,
            reviews: item.reviews || 0,
            experience: item.type === 'professional' ? "Professional Educator" : "Service Provider",
            location: item.location,
            consultation: item.price,
            availability: item.availability || item.badge,
            verified: item.isVerified || false,
            specializations: item.type === 'professional' ? (item.specialties || item.skills || []).slice(0, 3) : [item.category],
            services: item.type === 'professional' ? (item.specialties || item.skills || []).slice(0, 4) : [item.name],
            description: item.description || item.title || "Experienced education professional",
            type: item.type,
            realServiceId: item.realServiceId,
            realProviderId: item.realProviderId
        }));
    }, [rawEducationData]);

    // Ghana cities for location dropdown
    const ghanaCities = [
        'accra', 'kumasi', 'tamale', 'takoradi', 'tema', 'cape-coast',
        'ho', 'sunyani', 'koforidua', 'wa', 'bolgatanga', 'techiman'
    ];

    // Enhanced filter logic
    const filteredProfessionals = useMemo(() => {
        let filtered = [...educationProfessionals];

        if (searchLocation) {
            filtered = filtered.filter(provider =>
                provider.location.toLowerCase().includes(searchLocation.toLowerCase())
            );
        }

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

        if (searchBudget) {
            const budgetValue = parseFloat(searchBudget.replace(/[^\d.]/g, ''));
            if (!isNaN(budgetValue)) {
                filtered = filtered.filter(provider => {
                    const providerPrice = parseFloat(provider.consultation.replace(/[^\d.]/g, ''));
                    return !isNaN(providerPrice) && providerPrice <= budgetValue;
                });
            }
        }

        // Filter by keywords (search across name, specialty, specializations, services)
        if (searchKeywords.trim()) {
            const keywords = searchKeywords.toLowerCase().split(' ');
            filtered = filtered.filter(professional =>
                keywords.some(keyword =>
                    professional.name.toLowerCase().includes(keyword) ||
                    professional.specialty.toLowerCase().includes(keyword) ||
                    professional.specializations.some((spec: string) => spec.toLowerCase().includes(keyword)) ||
                    professional.services.some((service: string) => service.toLowerCase().includes(keyword))
                )
            );
        }

        // Apply sorting
        return sortProfessionals(filtered, sortBy);
    }, [educationProfessionals, searchLocation, searchService, searchBudget, searchKeywords, sortBy]);

    const error = isError ? 'Failed to load education professionals' : null;

    // Fallback dummy data (used only if API fails)
    const fallbackEducationProfessionals = [
        {
            id: 1,
            name: "Dr. Akosua Mensah",
            specialty: "Mathematics & Physics Tutor",
            image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
            rating: 4.9,
            reviews: 234,
            experience: "15 years",
            location: "Accra",
            consultation: "GH₵60",
            availability: "Available today",
            verified: true,
            specializations: ["WASSCE Prep", "University Prep", "Core Math"],
            services: ["Individual Tutoring", "Group Classes", "Exam Preparation", "Assignment Help"],
            description: "PhD in Mathematics with 15 years of teaching experience helping students excel in WASSCE and university entrance exams."
        },
        {
            id: 2,
            name: "Emmanuel Kofi",
            specialty: "Computer Science Instructor",
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
            rating: 4.8,
            reviews: 187,
            experience: "10 years",
            location: "Kumasi",
            consultation: "GH₵80",
            availability: "Available now",
            verified: true,
            specializations: ["Programming", "Web Development", "Data Analysis"],
            services: ["Coding Bootcamp", "Project Mentoring", "Career Guidance", "Certification Prep"],
            description: "Software engineer turned educator specializing in practical programming skills and tech career development."
        },
        {
            id: 3,
            name: "Ms. Sarah Osei",
            specialty: "English Language Specialist",
            image: "https://res.cloudinary.com/duhfv8nqy/image/upload/v1733764031/default-avatar_cugq40.png",
            rating: 4.9,
            reviews: 156,
            experience: "12 years",
            location: "Tema",
            consultation: "GH₵50",
            availability: "Available tomorrow",
            verified: true,
            specializations: ["IELTS Prep", "Business English", "Academic Writing"],
            services: ["Speaking Practice", "Writing Improvement", "IELTS Training", "Business Communication"],
            description: "Cambridge certified English teacher helping students achieve fluency and pass international examinations."
        },
        {
            id: 4,
            name: "Professor Kwame Asante",
            specialty: "Business & Economics",
            image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
            rating: 4.7,
            reviews: 98,
            experience: "20 years",
            location: "Accra",
            consultation: "GH₵100",
            availability: "Available this week",
            verified: true,
            specializations: ["MBA Prep", "Financial Analysis", "Economics"],
            services: ["University Admission", "Research Guidance", "Thesis Support", "Career Counseling"],
            description: "University professor with extensive experience in business education and research supervision."
        },
        {
            id: 5,
            name: "Grace Asante",
            specialty: "Mathematics Tutor",
            image: "https://res.cloudinary.com/duhfv8nqy/image/upload/v1733764031/default-avatar_cugq40.png",
            rating: 4.9,
            reviews: 127,
            experience: "6 years",
            location: "Accra",
            consultation: "GH₵40/hour",
            availability: "Available today",
            verified: true,
            specializations: ["Mathematics", "Physics", "Statistics"],
            services: ["Individual Tutoring", "Group Classes", "Exam Preparation", "Assignment Help"],
            description: "Experienced mathematics tutor specializing in high school and university level math.",
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
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
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
                    background: linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(168, 85, 247, 0.3));
                    backdrop-filter: blur(30px);
                }
                
                .glass-select option:checked,
                .glass-select option:selected {
                    background: linear-gradient(135deg, rgba(99, 102, 241, 0.4), rgba(168, 85, 247, 0.4));
                    color: white;
                    font-weight: 600;
                }
                
                .glass-select:focus {
                    outline: none;
                    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.4);
                }
            `}</style>

            {/* Navigation */}
            <CategoryNavbar
                backText="← Back to Home"
                backHref="/"
                hoverColor="text-indigo-600 dark:hover:text-indigo-400"
                bgGradient="from-indigo-50 via-white to-purple-50"
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
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/80 to-purple-900/60"></div>

                            {/* Banner Content */}
                            <div className="absolute inset-0 flex items-center">
                                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                                    <div className="max-w-2xl text-white">
                                        <div className="flex items-center mb-4">
                                            <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-bold mr-3">
                                                🎓 Education
                                            </span>
                                            <span className="text-indigo-200">{banner.provider}</span>
                                        </div>
                                        <h1 className="text-5xl md:text-6xl font-bold mb-4">{banner.title}</h1>
                                        <p className="text-xl md:text-2xl mb-8 opacity-90">{banner.subtitle}</p>
                                        <button className="bg-white text-indigo-600 hover:bg-gray-100 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105">
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
                            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-400/20 to-purple-400/20 rounded-2xl sm:rounded-full blur-lg group-hover:blur-xl transition-all duration-300"></div>

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
                                                className="w-full px-3 py-3 bg-white/10 backdrop-blur-md border-0 rounded-full text-white text-sm placeholder-white/70 focus:ring-2 focus:ring-indigo-400/50 transition-all duration-300 hover:bg-white/15 appearance-none cursor-pointer glass-select"
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
                                                className="w-full px-3 py-3 bg-white/10 backdrop-blur-md border-0 rounded-full text-white text-sm placeholder-white/70 focus:ring-2 focus:ring-indigo-400/50 transition-all duration-300 hover:bg-white/15 appearance-none cursor-pointer glass-select"
                                            >
                                                <option value="">🎓 Service</option>
                                                <option value="tutoring">Private Tutoring</option>
                                                <option value="language">Language Classes</option>
                                                <option value="computer">Computer Training</option>
                                                <option value="certification">Certification</option>
                                                <option value="exam-prep">Exam Preparation</option>
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
                                                className="w-full px-3 py-3 bg-white/10 backdrop-blur-md border-0 rounded-full text-white text-sm placeholder-white/70 focus:ring-2 focus:ring-indigo-400/50 transition-all duration-300 hover:bg-white/15"
                                            />
                                        </div>
                                        <div className="relative flex-1">
                                            <input
                                                type="text"
                                                placeholder="🔍 Keywords"
                                                value={searchKeywords}
                                                onChange={(e) => setSearchKeywords(e.target.value)}
                                                className="w-full px-3 py-3 bg-white/10 backdrop-blur-md border-0 rounded-full text-white text-sm placeholder-white/70 focus:ring-2 focus:ring-indigo-400/50 transition-all duration-300 hover:bg-white/15"
                                            />
                                        </div>
                                    </div>

                                    {/* Row 3: Action Buttons */}
                                    <div className="flex gap-2">
                                        <button className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-4 py-3 rounded-full font-semibold text-sm transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center gap-2 border border-white/20">
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
                                            className="w-full px-4 py-2.5 bg-white/10 backdrop-blur-md border-0 rounded-full text-white text-sm placeholder-white/70 focus:ring-2 focus:ring-indigo-400/50 transition-all duration-300 hover:bg-white/15 appearance-none cursor-pointer glass-select"
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
                                            className="w-full px-4 py-2.5 bg-white/10 backdrop-blur-md border-0 rounded-full text-white text-sm placeholder-white/70 focus:ring-2 focus:ring-indigo-400/50 transition-all duration-300 hover:bg-white/15 appearance-none cursor-pointer glass-select"
                                        >
                                            <option value="">🎓 Education Service</option>
                                            <option value="tutoring">Private Tutoring</option>
                                            <option value="language">Language Classes</option>
                                            <option value="computer">Computer Training</option>
                                            <option value="certification">Certification</option>
                                            <option value="exam-prep">Exam Preparation</option>
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
                                            placeholder="💰 Budget (e.g., GH₵80)"
                                            value={searchBudget}
                                            onChange={(e) => setSearchBudget(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-white/10 backdrop-blur-md border-0 rounded-full text-white text-sm placeholder-white/70 focus:ring-2 focus:ring-indigo-400/50 transition-all duration-300 hover:bg-white/15"
                                        />
                                    </div>

                                    {/* Keywords Input */}
                                    <div className="relative flex-1 min-w-[180px]">
                                        <input
                                            type="text"
                                            placeholder="🔍 Keywords (e.g., math, english)"
                                            value={searchKeywords}
                                            onChange={(e) => setSearchKeywords(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-white/10 backdrop-blur-md border-0 rounded-full text-white text-sm placeholder-white/70 focus:ring-2 focus:ring-indigo-400/50 transition-all duration-300 hover:bg-white/15"
                                        />
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2">
                                        <button className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 hover:scale-105 shadow-lg flex items-center gap-2 border border-white/20">
                                            <span>🔍</span>
                                            <span>Find Tutors</span>
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

            {/* Education Professionals Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-12">
                        <div>
                            <h2 className="text-4xl font-bold mb-4 text-gray-800">Available Education Professionals</h2>
                            <p className="text-xl text-gray-600">Expert educators to help you achieve your learning goals</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg glass-select">
                                <option value="rating">Sort by Rating</option>
                                <option value="price">Sort by Price</option>
                                <option value="experience">Sort by Experience</option>
                                <option value="distance">Sort by Distance</option>
                            </select>
                        </div>
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading education professionals...</p>
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
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && !error && educationProfessionals.length === 0 && (
                        <div className="text-center py-12">
                            <div className="text-gray-400 text-6xl mb-4">📚</div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No Education Professionals Found</h3>
                            <p className="text-gray-600 mb-4">We&apos;re working to add more education professionals to our platform.</p>
                            <Link
                                href="/explore"
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-colors inline-block"
                            >
                                Explore Other Categories
                            </Link>
                        </div>
                    )}

                    {/* Professionals Grid */}
                    {!loading && !error && educationProfessionals.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredProfessionals.map((professional) => (
                                <div key={professional.id} className="group relative">
                                    {/* Card Container with Glass Effect */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/10 via-transparent to-purple-400/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>

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
                                                    <div className="absolute top-3 right-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white">
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
                                                    <div className="text-xs text-white/80">per lesson</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Content Section */}
                                        <div className="p-4">
                                            {/* Name and Specialty */}
                                            <div className="mb-3">
                                                <h3 className="text-lg font-bold text-gray-800 dark:text-white group-hover:text-indigo-600 transition-colors mb-1">
                                                    {professional.name}
                                                </h3>
                                                <p className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm">{professional.specialty}</p>
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
                                                                className="ml-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium underline focus:outline-none transition-colors"
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
                                                    <span key={index} className="bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded-full text-xs font-medium border border-indigo-500/20">
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
                                                href={`/education/professional/${professional.id}`}
                                                className="block w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white py-3 px-4 rounded-2xl font-semibold text-center transition-all duration-300 hover:scale-105 shadow-lg text-sm"
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
                            Load More Educators
                        </button>
                    </div>
                </div>
            </section>

            {/* Learning Success Section */}
            <section className="py-16 bg-gradient-to-r from-indigo-900 to-purple-900 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-4xl animate-pulse">
                            🎯
                        </div>
                    </div>
                    <h2 className="text-4xl font-bold mb-6">Achieve Your Learning Goals</h2>
                    <p className="text-xl mb-8 opacity-90 max-w-3xl mx-auto">
                        Join thousands of successful students who have achieved their academic and professional goals with our expert educators.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button className="bg-white text-indigo-600 hover:bg-gray-100 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105">
                            🎓 Free Trial Lesson
                        </button>
                        <button className="border-2 border-white text-white hover:bg-white hover:text-indigo-600 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105">
                            📚 Learning Packages
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
} 