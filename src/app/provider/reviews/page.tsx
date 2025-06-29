'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Review {
    id: string;
    client: {
        name: string;
        image: string;
    };
    rating: number;
    comment: string;
    service: string;
    date: string;
    helpful: number;
    response?: {
        text: string;
        date: string;
    };
    verified: boolean;
}

export default function ReviewsPage() {
    const [selectedFilter, setSelectedFilter] = useState<'all' | '5' | '4' | '3' | '2' | '1'>('all');
    const [sortBy, setSortBy] = useState<'recent' | 'helpful' | 'rating'>('recent');
    const [showResponseModal, setShowResponseModal] = useState<string | null>(null);
    const [responseText, setResponseText] = useState('');
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    // Review statistics - will be calculated from actual data
    const [overallStats, setOverallStats] = useState({
        averageRating: 0,
        totalReviews: 0,
        distribution: {
            5: 0,
            4: 0,
            3: 0,
            2: 0,
            1: 0
        },
        responseRate: 0,
        averageResponseTime: '0 hours'
    });

    // Fetch reviews from API
    useEffect(() => {
        const fetchReviews = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/provider/reviews');
                if (response.ok) {
                    const data = await response.json();
                    setReviews(data.reviews || []);
                    setOverallStats(prevStats => data.stats || prevStats);
                }
            } catch (error) {
                console.error('Error fetching reviews:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, []);

    const filteredReviews = reviews.filter(review => {
        if (selectedFilter === 'all') return true;
        return review.rating === parseInt(selectedFilter);
    });

    const sortedReviews = [...filteredReviews].sort((a, b) => {
        switch (sortBy) {
            case 'recent':
                return new Date(b.date).getTime() - new Date(a.date).getTime();
            case 'helpful':
                return b.helpful - a.helpful;
            case 'rating':
                return b.rating - a.rating;
            default:
                return 0;
        }
    });

    const handleResponse = async (reviewId: string) => {
        try {
            const response = await fetch(`/api/provider/reviews/${reviewId}/respond`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ response: responseText })
            });

            if (response.ok) {
                // Refresh reviews to show the new response
                const updatedReviews = reviews.map(review =>
                    review.id === reviewId
                        ? { ...review, response: { text: responseText, date: new Date().toISOString() } }
                        : review
                );
                setReviews(updatedReviews);
                setShowResponseModal(null);
                setResponseText('');
            }
        } catch (error) {
            console.error('Error responding to review:', error);
        }
    };

    const getRatingColor = (rating: number) => {
        if (rating >= 5) return 'text-green-500';
        if (rating >= 4) return 'text-yellow-500';
        if (rating >= 3) return 'text-orange-500';
        return 'text-red-500';
    };

    const getRatingGradient = (rating: number) => {
        if (rating >= 5) return 'from-green-500 to-emerald-500';
        if (rating >= 4) return 'from-yellow-500 to-orange-500';
        if (rating >= 3) return 'from-orange-500 to-red-500';
        return 'from-red-500 to-red-600';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 dark:from-slate-900 dark:via-gray-900 dark:to-slate-800 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">Loading reviews...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 dark:from-slate-900 dark:via-gray-900 dark:to-slate-800 relative overflow-hidden">
            {/* Floating Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-orange-400/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-orange-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">
                                <span className="text-gray-900 dark:text-white">Reviews</span>
                                <span className="block text-gradient-mixed animate-gradient-x">Client Feedback ⭐</span>
                            </h1>
                            <p className="text-lg text-gray-600 dark:text-gray-400">
                                Manage and respond to client reviews and feedback
                            </p>
                        </div>
                        <div className="mt-4 md:mt-0 flex items-center space-x-3">
                            <button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg text-sm">
                                📊 Analytics Report
                            </button>
                            <button className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg text-sm">
                                📤 Export Reviews
                            </button>
                        </div>
                    </div>
                </div>

                {/* Review Overview Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                    {/* Overall Rating */}
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl opacity-25 group-hover:opacity-40 blur transition-opacity"></div>
                        <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-6 text-center">
                            <div className="text-4xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent mb-2">
                                {overallStats.averageRating.toFixed(1)}
                            </div>
                            <div className="flex justify-center mb-2">
                                {[...Array(5)].map((_, i) => (
                                    <svg
                                        key={i}
                                        className={`w-5 h-5 ${i < Math.floor(overallStats.averageRating) ? 'text-yellow-400 fill-current animate-bounce' : 'text-gray-300 dark:text-gray-600'}`}
                                        viewBox="0 0 20 20"
                                        style={{ animationDelay: `${i * 100}ms` }}
                                    >
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {overallStats.totalReviews} total reviews
                            </p>
                        </div>
                    </div>

                    {/* Rating Distribution */}
                    <div className="lg:col-span-2 relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl opacity-20 group-hover:opacity-30 blur transition-opacity"></div>
                        <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-6">
                            <h3 className="text-lg font-semibold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
                                Rating Distribution 📊
                            </h3>
                            {overallStats.totalReviews > 0 ? (
                                <div className="space-y-2">
                                    {Object.entries(overallStats.distribution).reverse().map(([rating, count], index) => (
                                        <div
                                            key={rating}
                                            className="flex items-center space-x-3 animate-fadeInUp"
                                            style={{ animationDelay: `${index * 100}ms` }}
                                        >
                                            <div className="flex items-center space-x-1 w-12">
                                                <span className="text-sm font-medium">{rating}</span>
                                                <svg className="w-3 h-3 text-yellow-400 fill-current" viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            </div>
                                            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-4 relative overflow-hidden">
                                                <div
                                                    className={`h-full bg-gradient-to-r ${getRatingGradient(parseInt(rating))} rounded-full transition-all duration-1000 ease-out`}
                                                    style={{ width: `${overallStats.totalReviews > 0 ? (count / overallStats.totalReviews) * 100 : 0}%` }}
                                                />
                                            </div>
                                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-8">
                                                {count}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <p className="text-gray-500 dark:text-gray-400">No rating data available</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Response Stats */}
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl opacity-25 group-hover:opacity-40 blur transition-opacity"></div>
                        <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-6">
                            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">Response Rate</h3>

                            <div className="relative inline-flex items-center justify-center w-20 h-20 mb-4">
                                <svg className="w-20 h-20 transform -rotate-90">
                                    <circle
                                        cx="40"
                                        cy="40"
                                        r="30"
                                        stroke="currentColor"
                                        strokeWidth="6"
                                        fill="transparent"
                                        className="text-gray-200 dark:text-gray-700"
                                    />
                                    <circle
                                        cx="40"
                                        cy="40"
                                        r="30"
                                        stroke="url(#responseGradient)"
                                        strokeWidth="6"
                                        fill="transparent"
                                        strokeDasharray={`${(overallStats.responseRate / 100) * 188} 188`}
                                        className="transition-all duration-1000"
                                    />
                                </svg>
                                <div className="absolute text-center">
                                    <div className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                                        {overallStats.responseRate}%
                                    </div>
                                </div>
                            </div>

                            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                                Avg: {overallStats.averageResponseTime}
                            </p>

                            <svg width="0" height="0">
                                <defs>
                                    <linearGradient id="responseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#3B82F6" />
                                        <stop offset="100%" stopColor="#8B5CF6" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Filters and Sort */}
                <div className="relative group mb-8">
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl opacity-20 group-hover:opacity-30 blur transition-opacity"></div>
                    <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            {/* Rating Filters */}
                            <div className="flex flex-wrap gap-2">
                                {(['all', '5', '4', '3', '2', '1'] as const).map((filter) => (
                                    <button
                                        key={filter}
                                        onClick={() => setSelectedFilter(filter)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 ${selectedFilter === filter
                                            ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                                            : 'bg-gradient-to-r from-gray-100/80 to-gray-200/80 dark:from-gray-700/50 dark:to-gray-600/50 text-gray-700 dark:text-gray-300 hover:from-indigo-100/80 hover:to-purple-100/80'
                                            }`}
                                    >
                                        {filter === 'all' ? 'All Reviews' : `${filter} Stars`}
                                    </button>
                                ))}
                            </div>

                            {/* Sort Options */}
                            <div className="flex bg-gradient-to-r from-gray-100/80 to-gray-200/80 dark:from-gray-700/50 dark:to-gray-600/50 rounded-lg p-1">
                                {[
                                    { id: 'recent', label: 'Recent' },
                                    { id: 'helpful', label: 'Helpful' },
                                    { id: 'rating', label: 'Rating' }
                                ].map((option) => (
                                    <button
                                        key={option.id}
                                        onClick={() => setSortBy(option.id as any)}
                                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-300 ${sortBy === option.id
                                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105'
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-600/50'
                                            }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reviews List */}
                {sortedReviews.length > 0 ? (
                    <div className="space-y-6">
                        {sortedReviews.map((review, index) => (
                            <div
                                key={review.id}
                                className={`relative group animate-fadeInUp`}
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className={`absolute -inset-1 bg-gradient-to-r ${getRatingGradient(review.rating)} rounded-xl opacity-20 group-hover:opacity-30 blur transition-opacity`}></div>
                                <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
                                    <div className="flex items-start space-x-4">
                                        {/* Client Avatar */}
                                        <div className="relative group/avatar">
                                            <Image
                                                src={review.client.image}
                                                alt={review.client.name}
                                                width={48}
                                                height={48}
                                                className="w-12 h-12 rounded-full ring-2 ring-white dark:ring-gray-700 group-hover/avatar:ring-blue-500/30 transition-all"
                                            />
                                            {review.verified && (
                                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
                                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>

                                        {/* Review Content */}
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 dark:text-white">
                                                        {review.client.name}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        {review.service} • {new Date(review.date).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <div className="flex">
                                                        {[...Array(5)].map((_, i) => (
                                                            <svg
                                                                key={i}
                                                                className={`w-4 h-4 ${i < review.rating ? getRatingColor(review.rating) + ' fill-current' : 'text-gray-300 dark:text-gray-600'}`}
                                                                viewBox="0 0 20 20"
                                                            >
                                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                            </svg>
                                                        ))}
                                                    </div>
                                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                                        {review.helpful} helpful
                                                    </span>
                                                </div>
                                            </div>

                                            <p className="text-gray-700 dark:text-gray-300 mb-4">
                                                {review.comment}
                                            </p>

                                            {/* Response */}
                                            {review.response ? (
                                                <div className="bg-gradient-to-r from-blue-50/80 to-purple-50/80 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 border border-white/20 dark:border-gray-700/20 backdrop-blur-sm">
                                                    <div className="flex items-center space-x-2 mb-2">
                                                        <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                                            </svg>
                                                        </div>
                                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                            Your Response • {new Date(review.response.date).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-700 dark:text-gray-300">
                                                        {review.response.text}
                                                    </p>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setShowResponseModal(review.id)}
                                                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg text-sm"
                                                >
                                                    💬 Respond to Review
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-gray-400 to-gray-600 rounded-xl opacity-20 blur transition-opacity"></div>
                        <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-12 text-center">
                            <div className="text-6xl mb-4">⭐</div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                No Reviews Yet
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                Complete your first booking to start receiving reviews from clients.
                            </p>
                            <Link
                                href="/provider/services"
                                className="inline-flex items-center bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
                            >
                                Create Your Services
                            </Link>
                        </div>
                    </div>
                )}

                {/* Response Modal */}
                {showResponseModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-xl shadow-2xl border border-white/20 dark:border-gray-700/20 p-6 max-w-md w-full">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Respond to Review
                            </h3>
                            <textarea
                                value={responseText}
                                onChange={(e) => setResponseText(e.target.value)}
                                placeholder="Write your response..."
                                rows={4}
                                className="w-full px-4 py-3 bg-gradient-to-r from-gray-50/80 to-gray-100/80 dark:from-gray-700/50 dark:to-gray-600/50 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                            />
                            <div className="flex items-center justify-end space-x-3 mt-4">
                                <button
                                    onClick={() => setShowResponseModal(null)}
                                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleResponse(showResponseModal)}
                                    disabled={!responseText.trim()}
                                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 disabled:transform-none shadow-lg"
                                >
                                    Send Response
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
                .text-gradient-mixed {
                    background: linear-gradient(135deg, #3B82F6, #8B5CF6, #F59E0B);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    animation: gradient-x 3s ease infinite;
                    background-size: 200% 200%;
                }
                
                @keyframes gradient-x {
                    0%, 100% { background-position: left center; }
                    50% { background-position: right center; }
                }
            `}</style>
        </div>
    );
} 