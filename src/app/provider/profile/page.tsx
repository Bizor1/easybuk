'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface ProviderProfile {
    id: string;
    name: string;
    email: string;
    phone: string;
    image: string;
    bio: string;
    location: string;
    experience: number;
    hourlyRate: number;
    services: string[];
    skills: string[];
    languages: string[];
    verificationStatus: {
        email: boolean;
        phone: boolean;
        identity: boolean;
        address: boolean;
        background: boolean;
    };
    portfolio: {
        id: string;
        title: string;
        description: string;
        image: string;
        category: string;
    }[];
    availability: {
        monday: { start: string; end: string; available: boolean };
        tuesday: { start: string; end: string; available: boolean };
        wednesday: { start: string; end: string; available: boolean };
        thursday: { start: string; end: string; available: boolean };
        friday: { start: string; end: string; available: boolean };
        saturday: { start: string; end: string; available: boolean };
        sunday: { start: string; end: string; available: boolean };
    };
    socialLinks: {
        website?: string;
        linkedin?: string;
        facebook?: string;
        instagram?: string;
    };
    businessName?: string;
    category?: string;
}

export default function ProfilePage() {
    const [activeTab, setActiveTab] = useState<'basic' | 'services' | 'portfolio' | 'availability' | 'verification'>('basic');

    // Handle URL tab parameter
    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const tab = searchParams.get('tab');
        if (tab && ['basic', 'services', 'portfolio', 'availability', 'verification'].includes(tab)) {
            setActiveTab(tab as any);
        }
    }, []);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Real profile data from API
    const [profile, setProfile] = useState<ProviderProfile | null>(null);
    const [originalProfile, setOriginalProfile] = useState<ProviderProfile | null>(null);

    // Form state for adding new items
    const [newService, setNewService] = useState('');
    const [newSkill, setNewSkill] = useState('');
    const [newLanguage, setNewLanguage] = useState('');

    // Upload states
    const [uploadingProfilePhoto, setUploadingProfilePhoto] = useState(false);
    const [uploadingPortfolio, setUploadingPortfolio] = useState(false);
    // Fetch profile data on component mount
    useEffect(() => {
        fetchProfileData();
    }, []);

    const fetchProfileData = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('/api/provider/profile', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to fetch profile data');
            }

            const data = await response.json();
            console.log('📄 Fetched profile data:', {
                id: data.id,
                name: data.name,
                email: data.email,
                phone: data.phone,
                bio: data.bio ? 'Has bio' : 'No bio',
                experience: data.experience,
                hourlyRate: data.hourlyRate,
                portfolio: data.portfolio ? `${data.portfolio.length} items` : 'No portfolio',
                availability: data.availability ? 'Has schedule' : 'No schedule',
                isEditing: false
            });
            setProfile(data);
            setOriginalProfile(data);
        } catch (error) {
            console.error('Error fetching profile:', error);
            setError('Failed to load profile data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProfile = async () => {
        if (!profile) return;

        try {
            setSaving(true);
            setError(null);

            const response = await fetch('/api/provider/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(profile)
            });

            if (!response.ok) {
                throw new Error('Failed to save profile');
            }

            const result = await response.json();
            setOriginalProfile(profile);
            setIsEditing(false);

            // Show success message (you can enhance this with a toast notification)
            console.log('Profile saved successfully');
        } catch (error) {
            console.error('Error saving profile:', error);
            setError('Failed to save profile. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleCancelEdit = () => {
        if (originalProfile) {
            setProfile(originalProfile);
        }
        setIsEditing(false);
    };

    const updateProfile = (field: string, value: any) => {
        console.log('🔄 Updating profile field:', field, 'to value:', value);
        if (!profile) {
            console.log('❌ Cannot update profile - profile is null');
            return;
        }

        setProfile(prev => {
            if (!prev) return null;
            const updated = {
                ...prev,
                [field]: value
            };
            console.log('✅ Profile updated:', field, '=', value);
            return updated;
        });
    };

    const addToArray = (field: 'services' | 'skills' | 'languages', value: string) => {
        if (!profile || !value.trim()) return;

        const currentArray = profile[field] as string[];
        if (currentArray.includes(value.trim())) {
            console.log('❌ Item already exists:', value);
            return;
        }

        const newArray = [...currentArray, value.trim()];
        updateProfile(field, newArray);

        // Clear the input
        if (field === 'services') setNewService('');
        if (field === 'skills') setNewSkill('');
        if (field === 'languages') setNewLanguage('');
    };

    const removeFromArray = (field: 'services' | 'skills' | 'languages', index: number) => {
        if (!profile) return;

        const currentArray = profile[field] as string[];
        const newArray = currentArray.filter((_, i) => i !== index);
        updateProfile(field, newArray);
    };

    const handleProfilePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !profile) return;

        try {
            setUploadingProfilePhoto(true);

            // Create FormData for file upload
            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', 'profile'); // Specify the type for Cloudinary folder

            // Upload using existing API
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            if (!response.ok) throw new Error('Upload failed');

            const result = await response.json();
            console.log('📤 Image uploaded to:', result.url);

            // Automatically save to database with new image URL
            const updatedProfile = {
                ...profile,
                image: result.url
            };

            console.log('💾 Saving profile with new image URL...');
            const saveResponse = await fetch('/api/provider/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(updatedProfile)
            });

            if (!saveResponse.ok) {
                const errorText = await saveResponse.text();
                console.error('❌ Save failed:', errorText);
                throw new Error('Failed to save profile image');
            }

            console.log('✅ Profile saved to database successfully');
            // Update local state after successful save
            updateProfile('image', result.url);

            console.log('📸 Profile photo uploaded and saved successfully');
        } catch (error) {
            console.error('❌ Profile photo upload failed:', error);
            setError('Failed to upload profile photo. Please try again.');
        } finally {
            setUploadingProfilePhoto(false);
        }
    };

    const handlePortfolioUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !profile) return;

        try {
            setUploadingPortfolio(true);

            // Create FormData for file upload
            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', 'portfolio'); // Specify the type for Cloudinary folder

            // Upload using existing API
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            if (!response.ok) throw new Error('Upload failed');

            const result = await response.json();

            // Add new portfolio item
            const newPortfolioItem = {
                id: `${profile.id}_${Date.now()}`,
                title: 'New Work Sample',
                description: 'Professional work showcase',
                image: result.url,
                category: profile.category || 'General'
            };

            const updatedPortfolio = [...(profile.portfolio || []), newPortfolioItem];
            updateProfile('portfolio', updatedPortfolio);

            console.log('🖼️ Portfolio item uploaded successfully');
        } catch (error) {
            console.error('❌ Portfolio upload failed:', error);
            setError('Failed to upload portfolio item. Please try again.');
        } finally {
            setUploadingPortfolio(false);
        }
    };

    const removePortfolioItem = (itemId: string) => {
        if (!profile) return;

        const updatedPortfolio = profile.portfolio.filter(item => item.id !== itemId);
        updateProfile('portfolio', updatedPortfolio);
    };

    const tabs = [
        { id: 'basic', label: 'Basic Info', icon: '👤' },
        { id: 'services', label: 'Services', icon: '🔧' },
        { id: 'portfolio', label: 'Portfolio', icon: '📸' },
        { id: 'availability', label: 'Availability', icon: '📅' },
        { id: 'verification', label: 'Verification', icon: '✅' }
    ];

    // Show loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 dark:from-slate-900 dark:via-gray-900 dark:to-slate-800 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">Loading your profile...</p>
                </div>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 dark:from-slate-900 dark:via-gray-900 dark:to-slate-800 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Error Loading Profile</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
                    <button
                        onClick={fetchProfileData}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // Show message if no profile data
    if (!profile) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 dark:from-slate-900 dark:via-gray-900 dark:to-slate-800 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-gray-400 text-6xl mb-4">👤</div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Profile Data</h2>
                    <p className="text-gray-600 dark:text-gray-400">Unable to load your profile information.</p>
                </div>
            </div>
        );
    }

    const verificationProgress = Object.values(profile.verificationStatus).filter(Boolean).length;
    const verificationTotal = Object.values(profile.verificationStatus).length;

    const verificationItems = [
        { key: 'email' as keyof typeof profile.verificationStatus, label: 'Email Address', icon: '📧' },
        { key: 'phone' as keyof typeof profile.verificationStatus, label: 'Phone Number', icon: '📱' },
        { key: 'identity' as keyof typeof profile.verificationStatus, label: 'Government ID', icon: '🆔' },
        { key: 'address' as keyof typeof profile.verificationStatus, label: 'Address Proof', icon: '🏠' },
        { key: 'background' as keyof typeof profile.verificationStatus, label: 'Background Check', icon: '✅' }
    ];

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
                                <span className="text-gray-900 dark:text-white">Profile</span>
                                <span className="block text-gradient-mixed animate-gradient-x">Management 👤</span>
                            </h1>
                            <p className="text-lg text-gray-600 dark:text-gray-400">
                                Manage your professional profile and settings
                            </p>
                        </div>
                        <div className="mt-4 md:mt-0 flex items-center space-x-3">
                            <div className="text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Profile completeness:</span>
                                <span className="ml-2 font-semibold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                    {Math.round((verificationProgress / verificationTotal) * 100)}%
                                </span>
                            </div>
                            <div className="flex space-x-2">
                                {isEditing ? (
                                    <>
                                        <button
                                            onClick={handleSaveProfile}
                                            disabled={saving}
                                            className="px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {saving ? '⏳ Saving...' : '💾 Save Changes'}
                                        </button>
                                        <button
                                            onClick={handleCancelEdit}
                                            disabled={saving}
                                            className="px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white disabled:opacity-50"
                                        >
                                            ❌ Cancel
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => {
                                            console.log('🖊️ Edit button clicked, setting isEditing to true');
                                            setIsEditing(true);
                                        }}
                                        className="px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                                    >
                                        ✏️ Edit Profile
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Profile Overview Card */}
                <div className="relative group mb-8">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl opacity-20 group-hover:opacity-30 blur transition-opacity"></div>
                    <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-6">
                        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6">
                            <div className="relative group/avatar">
                                <Image
                                    src={profile.image}
                                    alt={profile.name}
                                    width={120}
                                    height={120}
                                    className="w-30 h-30 rounded-full ring-4 ring-white dark:ring-gray-700 group-hover/avatar:ring-blue-500/30 transition-all"
                                />
                                <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-0 group-hover/avatar:opacity-20 blur transition-opacity"></div>
                                <label className="absolute bottom-0 right-0 p-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-lg hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-110 cursor-pointer">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleProfilePhotoUpload}
                                        className="hidden"
                                        disabled={uploadingProfilePhoto}
                                    />
                                    {uploadingProfilePhoto ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    )}
                                </label>
                            </div>

                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{profile.name}</h2>
                                <p className="text-gray-600 dark:text-gray-400 mb-3">{profile.bio}</p>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                    <div className="flex items-center space-x-2">
                                        <span>📍</span>
                                        <span className="text-gray-600 dark:text-gray-400">{profile.location}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span>⭐</span>
                                        <span className="text-gray-600 dark:text-gray-400">{profile.experience} years experience</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span>💰</span>
                                        <span className="text-gray-600 dark:text-gray-400">GH₵{profile.hourlyRate}/hour</span>
                                    </div>
                                </div>
                            </div>

                            <div className="text-center">
                                <div className="relative inline-flex items-center justify-center w-20 h-20">
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
                                            stroke="url(#gradient)"
                                            strokeWidth="6"
                                            fill="transparent"
                                            strokeDasharray={`${(verificationProgress / verificationTotal) * 188} 188`}
                                            className="transition-all duration-1000"
                                        />
                                    </svg>
                                    <div className="absolute text-center">
                                        <div className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                            {Math.round((verificationProgress / verificationTotal) * 100)}%
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">Verified</div>
                                    </div>
                                </div>
                                <svg width="0" height="0">
                                    <defs>
                                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#10B981" />
                                            <stop offset="100%" stopColor="#059669" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="relative group mb-8">
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl opacity-20 group-hover:opacity-30 blur transition-opacity"></div>
                    <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-4">
                        <div className="flex flex-wrap gap-2">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 ${activeTab === tab.id
                                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                                        : 'bg-gradient-to-r from-gray-100/80 to-gray-200/80 dark:from-gray-700/50 dark:to-gray-600/50 text-gray-700 dark:text-gray-300 hover:from-indigo-100/80 hover:to-purple-100/80'
                                        }`}
                                >
                                    <span className="mr-2">{tab.icon}</span>
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl opacity-20 group-hover:opacity-30 blur transition-opacity"></div>
                    <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-6">

                        {/* Basic Info Tab */}
                        {activeTab === 'basic' && (
                            <div className="space-y-6">
                                <h3 className="text-xl font-semibold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
                                    Basic Information 📝
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                                        <input
                                            type="text"
                                            value={profile.name}
                                            onChange={(e) => updateProfile('name', e.target.value)}
                                            disabled={!isEditing}
                                            placeholder="Enter your full name"
                                            className="w-full px-4 py-3 bg-gradient-to-r from-gray-50/80 to-gray-100/80 dark:from-gray-700/50 dark:to-gray-600/50 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all disabled:opacity-60"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                                        <input
                                            type="email"
                                            value={profile.email}
                                            onChange={(e) => updateProfile('email', e.target.value)}
                                            disabled={true}
                                            placeholder="Your email address"
                                            className="w-full px-4 py-3 bg-gradient-to-r from-gray-50/80 to-gray-100/80 dark:from-gray-700/50 dark:to-gray-600/50 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all disabled:opacity-60"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
                                        <input
                                            type="tel"
                                            value={profile.phone}
                                            onChange={(e) => updateProfile('phone', e.target.value)}
                                            disabled={!isEditing}
                                            placeholder="Enter your phone number"
                                            className="w-full px-4 py-3 bg-gradient-to-r from-gray-50/80 to-gray-100/80 dark:from-gray-700/50 dark:to-gray-600/50 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all disabled:opacity-60"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Location</label>
                                        <input
                                            type="text"
                                            value={profile.location}
                                            onChange={(e) => updateProfile('location', e.target.value)}
                                            disabled={!isEditing}
                                            placeholder="Enter your city/location"
                                            className="w-full px-4 py-3 bg-gradient-to-r from-gray-50/80 to-gray-100/80 dark:from-gray-700/50 dark:to-gray-600/50 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all disabled:opacity-60"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bio</label>
                                    <textarea
                                        value={profile.bio}
                                        onChange={(e) => updateProfile('bio', e.target.value)}
                                        disabled={!isEditing}
                                        rows={4}
                                        placeholder="Tell potential clients about your experience, skills, and what makes you unique..."
                                        className="w-full px-4 py-3 bg-gradient-to-r from-gray-50/80 to-gray-100/80 dark:from-gray-700/50 dark:to-gray-600/50 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all disabled:opacity-60"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Years of Experience</label>
                                        <input
                                            type="number"
                                            value={profile.experience}
                                            onChange={(e) => updateProfile('experience', parseInt(e.target.value) || 0)}
                                            disabled={!isEditing}
                                            placeholder="Years of experience"
                                            min="0"
                                            max="50"
                                            className="w-full px-4 py-3 bg-gradient-to-r from-gray-50/80 to-gray-100/80 dark:from-gray-700/50 dark:to-gray-600/50 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all disabled:opacity-60"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Hourly Rate (GH₵)</label>
                                        <input
                                            type="number"
                                            value={profile.hourlyRate}
                                            onChange={(e) => {
                                                const value = parseFloat(e.target.value);
                                                if (value >= 0 || e.target.value === '') {
                                                    updateProfile('hourlyRate', value || 0);
                                                }
                                            }}
                                            disabled={!isEditing}
                                            placeholder="Your hourly rate in GHS"
                                            min="0"
                                            step="0.01"
                                            className="w-full px-4 py-3 bg-gradient-to-r from-gray-50/80 to-gray-100/80 dark:from-gray-700/50 dark:to-gray-600/50 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all disabled:opacity-60"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Services Tab */}
                        {activeTab === 'services' && (
                            <div className="space-y-6">
                                <h3 className="text-xl font-semibold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
                                    Services & Skills 🔧
                                </h3>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Services Offered</label>
                                    <div className="space-y-3">
                                        <div className="flex flex-wrap gap-2">
                                            {profile.services.map((service, index) => (
                                                <div
                                                    key={index}
                                                    className="relative group px-3 py-1 bg-gradient-to-r from-blue-100/80 to-cyan-100/80 dark:from-blue-900/30 dark:to-cyan-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm border border-white/20 dark:border-gray-700/20 backdrop-blur-sm"
                                                >
                                                    <span>{service}</span>
                                                    {isEditing && (
                                                        <button
                                                            onClick={() => removeFromArray('services', index)}
                                                            className="ml-2 text-red-500 hover:text-red-700 font-bold"
                                                            title="Remove service"
                                                        >
                                                            ×
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        {isEditing && (
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={newService}
                                                    onChange={(e) => setNewService(e.target.value)}
                                                    onKeyPress={(e) => {
                                                        if (e.key === 'Enter') {
                                                            addToArray('services', newService);
                                                        }
                                                    }}
                                                    placeholder="Enter new service"
                                                    className="flex-1 px-3 py-2 text-sm bg-gradient-to-r from-gray-50/80 to-gray-100/80 dark:from-gray-700/50 dark:to-gray-600/50 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
                                                />
                                                <button
                                                    onClick={() => addToArray('services', newService)}
                                                    disabled={!newService.trim()}
                                                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    Add
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Skills</label>
                                    <div className="space-y-3">
                                        <div className="flex flex-wrap gap-2">
                                            {profile.skills.map((skill, index) => (
                                                <div
                                                    key={index}
                                                    className="relative group px-3 py-1 bg-gradient-to-r from-purple-100/80 to-pink-100/80 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm border border-white/20 dark:border-gray-700/20 backdrop-blur-sm"
                                                >
                                                    <span>{skill}</span>
                                                    {isEditing && (
                                                        <button
                                                            onClick={() => removeFromArray('skills', index)}
                                                            className="ml-2 text-red-500 hover:text-red-700 font-bold"
                                                            title="Remove skill"
                                                        >
                                                            ×
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        {isEditing && (
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={newSkill}
                                                    onChange={(e) => setNewSkill(e.target.value)}
                                                    onKeyPress={(e) => {
                                                        if (e.key === 'Enter') {
                                                            addToArray('skills', newSkill);
                                                        }
                                                    }}
                                                    placeholder="Enter new skill"
                                                    className="flex-1 px-3 py-2 text-sm bg-gradient-to-r from-gray-50/80 to-gray-100/80 dark:from-gray-700/50 dark:to-gray-600/50 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
                                                />
                                                <button
                                                    onClick={() => addToArray('skills', newSkill)}
                                                    disabled={!newSkill.trim()}
                                                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    Add
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Languages</label>
                                    <div className="space-y-3">
                                        <div className="flex flex-wrap gap-2">
                                            {profile.languages.map((language, index) => (
                                                <div
                                                    key={index}
                                                    className="relative group px-3 py-1 bg-gradient-to-r from-orange-100/80 to-red-100/80 dark:from-orange-900/30 dark:to-red-900/30 text-orange-700 dark:text-orange-300 rounded-full text-sm border border-white/20 dark:border-gray-700/20 backdrop-blur-sm"
                                                >
                                                    <span>{language}</span>
                                                    {isEditing && (
                                                        <button
                                                            onClick={() => removeFromArray('languages', index)}
                                                            className="ml-2 text-red-500 hover:text-red-700 font-bold"
                                                            title="Remove language"
                                                        >
                                                            ×
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        {isEditing && (
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={newLanguage}
                                                    onChange={(e) => setNewLanguage(e.target.value)}
                                                    onKeyPress={(e) => {
                                                        if (e.key === 'Enter') {
                                                            addToArray('languages', newLanguage);
                                                        }
                                                    }}
                                                    placeholder="Enter new language"
                                                    className="flex-1 px-3 py-2 text-sm bg-gradient-to-r from-gray-50/80 to-gray-100/80 dark:from-gray-700/50 dark:to-gray-600/50 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
                                                />
                                                <button
                                                    onClick={() => addToArray('languages', newLanguage)}
                                                    disabled={!newLanguage.trim()}
                                                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    Add
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Portfolio Tab */}
                        {activeTab === 'portfolio' && (
                            <div className="space-y-6">
                                <h3 className="text-xl font-semibold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
                                    Portfolio Gallery 📸
                                </h3>

                                {profile.portfolio && profile.portfolio.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {profile.portfolio.map((item) => (
                                            <div
                                                key={item.id}
                                                className="relative group bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 overflow-hidden hover:scale-105 transition-all duration-300"
                                            >
                                                <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 relative overflow-hidden">
                                                    <Image
                                                        src={item.image || 'https://images.unsplash.com/photo-1560472355-536de3962603?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'}
                                                        alt={item.title}
                                                        fill
                                                        className="object-cover"
                                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                    />
                                                </div>
                                                <div className="p-4">
                                                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{item.title}</h4>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{item.description}</p>
                                                    <span className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs">
                                                        {item.category}
                                                    </span>
                                                </div>
                                                {isEditing && (
                                                    <button
                                                        onClick={() => removePortfolioItem(item.id)}
                                                        className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                        title="Remove portfolio item"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 bg-gradient-to-r from-gray-50/80 to-gray-100/80 dark:from-gray-800/50 dark:to-gray-700/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-600">
                                        <div className="text-6xl mb-4">📸</div>
                                        <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">No Portfolio Items</h4>
                                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                                            Showcase your best work to attract more clients
                                        </p>
                                        {isEditing && (
                                            <label className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-300 transform hover:scale-105 cursor-pointer">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handlePortfolioUpload}
                                                    className="hidden"
                                                    disabled={uploadingPortfolio}
                                                />
                                                {uploadingPortfolio ? 'Uploading...' : 'Add Portfolio Item'}
                                            </label>
                                        )}
                                    </div>
                                )}

                                {isEditing && profile.portfolio && profile.portfolio.length > 0 && (
                                    <div className="text-center">
                                        <label className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-300 transform hover:scale-105 cursor-pointer">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handlePortfolioUpload}
                                                className="hidden"
                                                disabled={uploadingPortfolio}
                                            />
                                            {uploadingPortfolio ? '⏳ Uploading...' : '+ Add New Portfolio Item'}
                                        </label>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Availability Tab */}
                        {activeTab === 'availability' && (
                            <div className="space-y-6">
                                <h3 className="text-xl font-semibold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
                                    Working Hours & Availability 📅
                                </h3>

                                <div className="space-y-4">
                                    {Object.entries(profile.availability).map(([day, schedule]) => (
                                        <div
                                            key={day}
                                            className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50/80 to-gray-100/80 dark:from-gray-800/50 dark:to-gray-700/50 rounded-xl border border-white/20 dark:border-gray-700/20"
                                        >
                                            <div className="flex items-center space-x-4">
                                                <div className="w-20">
                                                    <h4 className="font-medium text-gray-900 dark:text-white capitalize">
                                                        {day}
                                                    </h4>
                                                </div>

                                                {schedule.available ? (
                                                    <div className="flex items-center space-x-2">
                                                        <input
                                                            type="time"
                                                            value={schedule.start}
                                                            onChange={(e) => {
                                                                const newAvailability = {
                                                                    ...profile.availability,
                                                                    [day]: { ...schedule, start: e.target.value }
                                                                };
                                                                updateProfile('availability', newAvailability);
                                                            }}
                                                            disabled={!isEditing}
                                                            className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 disabled:opacity-60"
                                                        />
                                                        <span className="text-gray-500">to</span>
                                                        <input
                                                            type="time"
                                                            value={schedule.end}
                                                            onChange={(e) => {
                                                                const newAvailability = {
                                                                    ...profile.availability,
                                                                    [day]: { ...schedule, end: e.target.value }
                                                                };
                                                                updateProfile('availability', newAvailability);
                                                            }}
                                                            disabled={!isEditing}
                                                            className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 disabled:opacity-60"
                                                        />
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-500 dark:text-gray-400">Not available</span>
                                                )}
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={schedule.available}
                                                        onChange={(e) => {
                                                            const newAvailability = {
                                                                ...profile.availability,
                                                                [day]: { ...schedule, available: e.target.checked }
                                                            };
                                                            updateProfile('availability', newAvailability);
                                                        }}
                                                        disabled={!isEditing}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                                                    <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                                                        {schedule.available ? 'Available' : 'Unavailable'}
                                                    </span>
                                                </label>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="p-4 bg-gradient-to-r from-blue-50/80 to-cyan-50/80 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-200/50 dark:border-blue-700/50">
                                    <div className="flex items-start space-x-3">
                                        <div className="text-blue-500 text-xl">💡</div>
                                        <div>
                                            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">Availability Tips</h4>
                                            <ul className="text-sm text-blue-700 dark:text-blue-200 space-y-1">
                                                <li>• Set realistic working hours that you can consistently maintain</li>
                                                <li>• Consider time zones when working with international clients</li>
                                                <li>• Leave buffer time between bookings for preparation and travel</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Verification Tab */}
                        {activeTab === 'verification' && (
                            <div className="space-y-6">
                                <h3 className="text-xl font-semibold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
                                    Account Verification ✅
                                </h3>

                                <div className="space-y-4">
                                    {verificationItems.map((item) => (
                                        <div
                                            key={item.key}
                                            className={`p-4 rounded-lg border transition-all duration-300 hover:scale-105 ${profile.verificationStatus[item.key]
                                                ? 'bg-gradient-to-r from-green-100/80 to-emerald-100/80 dark:from-green-900/30 dark:to-emerald-900/30 border-green-200/50 dark:border-green-700/50'
                                                : 'bg-gradient-to-r from-red-100/80 to-red-200/80 dark:from-red-900/30 dark:to-red-800/30 border-red-200/50 dark:border-red-700/50'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <span className="text-2xl">{item.icon}</span>
                                                    <div>
                                                        <h4 className="font-medium text-gray-900 dark:text-white">{item.label}</h4>
                                                        <p className={`text-sm ${profile.verificationStatus[item.key]
                                                            ? 'text-green-600 dark:text-green-400'
                                                            : 'text-red-600 dark:text-red-400'
                                                            }`}>
                                                            {profile.verificationStatus[item.key] ? 'Verified' : 'Not verified'}
                                                        </p>
                                                    </div>
                                                </div>
                                                {!profile.verificationStatus[item.key] && (
                                                    <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg text-sm">
                                                        Verify Now
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
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