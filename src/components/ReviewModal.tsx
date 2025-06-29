'use client';

import { useState } from 'react';
import { XMarkIcon, StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (rating: number, review: string) => void;
    providerName: string;
    serviceTitle: string;
    isSubmitting?: boolean;
}

export default function ReviewModal({
    isOpen,
    onClose,
    onSubmit,
    providerName,
    serviceTitle,
    isSubmitting = false
}: ReviewModalProps) {
    const [rating, setRating] = useState(5);
    const [review, setReview] = useState('');
    const [hoveredRating, setHoveredRating] = useState(0);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(rating, review.trim());
    };

    const handleSkip = () => {
        onSubmit(0, ''); // Submit with no rating/review
    };

    const ratingLabels = {
        1: 'Poor',
        2: 'Fair',
        3: 'Good',
        4: 'Very Good',
        5: 'Excellent'
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                Rate Your Experience
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                How was your service with {providerName}?
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Service Info */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                            Service Completed
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                            {serviceTitle}
                        </p>
                    </div>

                    {/* Rating Section */}
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Rating (Optional)
                        </label>

                        {/* Star Rating */}
                        <div className="flex items-center space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onMouseEnter={() => setHoveredRating(star)}
                                    onMouseLeave={() => setHoveredRating(0)}
                                    onClick={() => setRating(star)}
                                    className="transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                                >
                                    {star <= (hoveredRating || rating) ? (
                                        <StarSolidIcon className="w-8 h-8 text-yellow-400" />
                                    ) : (
                                        <StarIcon className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Rating Label */}
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {ratingLabels[(hoveredRating || rating) as keyof typeof ratingLabels]}
                        </p>
                    </div>

                    {/* Review Section */}
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Review (Optional)
                        </label>
                        <textarea
                            value={review}
                            onChange={(e) => setReview(e.target.value)}
                            placeholder="Share your experience with other clients..."
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                            maxLength={500}
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 text-right">
                            {review.length}/500 characters
                        </p>
                    </div>

                    {/* Buttons */}
                    <div className="flex space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={handleSkip}
                            disabled={isSubmitting}
                            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Skip Review
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-medium"
                        >
                            {isSubmitting ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Submitting...
                                </div>
                            ) : (
                                'Confirm & Submit'
                            )}
                        </button>
                    </div>
                </form>

                {/* Footer Note */}
                <div className="px-6 pb-6">
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                        Your review helps other clients make informed decisions and helps providers improve their services.
                    </p>
                </div>
            </div>
        </div>
    );
} 