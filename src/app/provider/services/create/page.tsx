'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import SetupGuard from '@/components/provider/SetupGuard';
import { useRouter } from 'next/navigation';

interface ServiceFormData {
    name: string;
    description: string;
    category: string;
    basePrice: string;
    pricingType: 'FIXED' | 'HOURLY' | 'DAILY' | 'PROJECT_BASED';
    duration: string;
    location: 'CLIENT_LOCATION' | 'PROVIDER_LOCATION' | 'REMOTE' | 'FLEXIBLE';
    supportedBookingTypes: ('IN_PERSON' | 'REMOTE' | 'VIDEO_CALL' | 'PHONE_CALL')[];
    tags: string[];
    requiresEquipment: boolean;
    equipmentList: string[];
    minimumNotice: string;
    cancellationPolicy: string;
    serviceRadius: string;
    availableSlots: string;
    images: File[];
}

export default function CreateServicePage() {
    const router = useRouter();
    const [formData, setFormData] = useState<ServiceFormData>({
        name: '',
        description: '',
        category: '',
        basePrice: '',
        pricingType: 'HOURLY',
        duration: '',
        location: 'CLIENT_LOCATION',
        supportedBookingTypes: ['IN_PERSON'],
        tags: [],
        requiresEquipment: false,
        equipmentList: [],
        minimumNotice: '24',
        cancellationPolicy: 'Free cancellation up to 24 hours before the service',
        serviceRadius: '10',
        availableSlots: '8',
        images: []
    });

    const [currentTag, setCurrentTag] = useState('');
    const [currentEquipment, setCurrentEquipment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDraft, setIsDraft] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [uploadingImages, setUploadingImages] = useState(false);

    const serviceCategories = [
        { value: 'HOME_SERVICES', label: 'Home Services' },
        { value: 'HEALTHCARE', label: 'Healthcare' },
        { value: 'EDUCATION', label: 'Education & Training' },
        { value: 'TECHNICAL_SERVICES', label: 'Technical Services' },
        { value: 'CREATIVE_SERVICES', label: 'Creative Services' },
        { value: 'PROFESSIONAL_SERVICES', label: 'Professional Services' },
        { value: 'AUTOMOTIVE', label: 'Automotive' },
        { value: 'BEAUTY_WELLNESS', label: 'Beauty & Wellness' },
        { value: 'EVENTS_ENTERTAINMENT', label: 'Events & Entertainment' },
        { value: 'AGRICULTURE', label: 'Agriculture' },
        { value: 'SECURITY', label: 'Security' },
        { value: 'DELIVERY_LOGISTICS', label: 'Delivery & Logistics' }
    ];

    const pricingTypes = [
        { value: 'FIXED', label: 'Fixed Price', description: 'One-time fixed price for the entire service' },
        { value: 'HOURLY', label: 'Per Hour', description: 'Charge per hour of work' },
        { value: 'DAILY', label: 'Per Day', description: 'Daily rate for extended services' },
        { value: 'PROJECT_BASED', label: 'Project Based', description: 'Custom pricing based on project scope' }
    ];

    const locationTypes = [
        { value: 'CLIENT_LOCATION', label: 'At Client&apos;s Location', icon: '🏠' },
        { value: 'PROVIDER_LOCATION', label: 'At My Location', icon: '🏢' },
        { value: 'REMOTE', label: 'Remote/Online', icon: '💻' },
        { value: 'FLEXIBLE', label: 'Flexible Location', icon: '🌍' }
    ];

    const bookingTypes = [
        {
            value: 'IN_PERSON',
            label: 'In-Person Service',
            icon: '🤝',
            description: 'Traditional face-to-face service delivery'
        },
        {
            value: 'REMOTE',
            label: 'Remote Service',
            icon: '💻',
            description: 'Service delivered remotely without video'
        },
        {
            value: 'VIDEO_CALL',
            label: 'Video Consultation',
            icon: '🎥',
            description: 'Live video consultation via integrated video calling'
        },
        {
            value: 'PHONE_CALL',
            label: 'Phone Consultation',
            icon: '📞',
            description: 'Voice-only consultation over the phone'
        }
    ];

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.name.trim()) newErrors.name = 'Service name is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        if (!formData.category) newErrors.category = 'Category is required';
        if (!formData.basePrice || parseFloat(formData.basePrice) <= 0) {
            newErrors.basePrice = 'Valid price is required';
        }
        if (formData.duration && parseFloat(formData.duration) <= 0) {
            newErrors.duration = 'Duration must be positive';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (field: keyof ServiceFormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleImageUpload = async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        const newImages = Array.from(files);
        const totalImages = formData.images.length + newImages.length;

        if (totalImages > 5) {
            setErrors(prev => ({ ...prev, images: 'Maximum 5 images allowed' }));
            return;
        }

        // Validate file types and sizes
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        for (const file of newImages) {
            if (!validTypes.includes(file.type)) {
                setErrors(prev => ({ ...prev, images: 'Only JPEG, PNG, and WebP images are allowed' }));
                return;
            }
            if (file.size > maxSize) {
                setErrors(prev => ({ ...prev, images: 'Each image must be less than 5MB' }));
                return;
            }
        }

        // Clear any existing image errors
        setErrors(prev => ({ ...prev, images: '' }));

        // Create previews
        const newPreviews: string[] = [];
        for (const file of newImages) {
            const reader = new FileReader();
            reader.onload = (e) => {
                newPreviews.push(e.target?.result as string);
                if (newPreviews.length === newImages.length) {
                    setImagePreviews(prev => [...prev, ...newPreviews]);
                }
            };
            reader.readAsDataURL(file);
        }

        // Update form data
        setFormData(prev => ({
            ...prev,
            images: [...prev.images, ...newImages]
        }));
    };

    const removeImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleAddTag = () => {
        if (currentTag.trim() && !formData.tags.includes(currentTag.trim().toLowerCase())) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, currentTag.trim().toLowerCase()]
            }));
            setCurrentTag('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    const handleAddEquipment = () => {
        if (currentEquipment.trim() && !formData.equipmentList.includes(currentEquipment.trim())) {
            setFormData(prev => ({
                ...prev,
                equipmentList: [...prev.equipmentList, currentEquipment.trim()]
            }));
            setCurrentEquipment('');
        }
    };

    const handleRemoveEquipment = (equipmentToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            equipmentList: prev.equipmentList.filter(equipment => equipment !== equipmentToRemove)
        }));
    };

    const uploadImagesToServer = async (images: File[]): Promise<string[]> => {
        const uploadPromises = images.map(async (image) => {
            const formData = new FormData();
            formData.append('file', image);
            formData.append('type', 'service_image');

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Failed to upload image: ${image.name}`);
            }

            const result = await response.json();
            return result.url;
        });

        return Promise.all(uploadPromises);
    };

    const handleSubmit = async (asDraft: boolean = false) => {
        if (!asDraft && !validateForm()) return;

        setIsSubmitting(true);
        setIsDraft(asDraft);

        try {
            let imageUrls: string[] = [];

            // Upload images if any
            if (formData.images.length > 0) {
                setUploadingImages(true);
                try {
                    imageUrls = await uploadImagesToServer(formData.images);
                } catch (imageError) {
                    console.error('Error uploading images:', imageError);
                    setErrors({ submit: 'Failed to upload images. Please try again.' });
                    return;
                } finally {
                    setUploadingImages(false);
                }
            }

            const response = await fetch('/api/provider/services/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    basePrice: parseFloat(formData.basePrice),
                    duration: formData.duration ? parseInt(formData.duration) : null,
                    serviceRadius: parseFloat(formData.serviceRadius),
                    availableSlots: parseInt(formData.availableSlots),
                    minimumNotice: parseInt(formData.minimumNotice),
                    images: imageUrls,
                    isActive: !asDraft
                })
            });

            const result = await response.json();

            if (response.ok) {
                // Success - redirect to services page
                router.push('/provider/services?success=true');
            } else {
                setErrors({ submit: result.error || 'Failed to save service' });
            }
        } catch (error) {
            console.error('Error submitting service:', error);
            setErrors({ submit: 'Network error. Please try again.' });
        } finally {
            setIsSubmitting(false);
            setIsDraft(false);
        }
    };

    return (
        <SetupGuard blockingMessage="Complete your account setup to start posting services">
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 p-6">
                <div className="max-w-5xl mx-auto pt-20">
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8">
                            <div className="text-center">
                                <div className="text-6xl mb-4">🚀</div>
                                <h1 className="text-3xl font-bold mb-4">Create Your Service</h1>
                                <p className="text-lg opacity-90">
                                    Build a comprehensive service offering to attract more clients
                                </p>
                            </div>
                        </div>

                        {/* Form */}
                        <div className="p-8 space-y-8">
                            {/* Basic Information */}
                            <div className="space-y-6">
                                <h2 className="text-2xl font-semibold text-gray-800 border-b pb-2">
                                    📝 Basic Information
                                </h2>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="lg:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Service Title *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => handleInputChange('name', e.target.value)}
                                            placeholder="e.g., Professional House Cleaning Service"
                                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.name ? 'border-red-300' : 'border-gray-300'}`}
                                        />
                                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                                    </div>

                                    <div className="lg:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Description *
                                        </label>
                                        <textarea
                                            rows={4}
                                            value={formData.description}
                                            onChange={(e) => handleInputChange('description', e.target.value)}
                                            placeholder="Describe your service in detail. What makes it special? What can clients expect?"
                                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.description ? 'border-red-300' : 'border-gray-300'}`}
                                        />
                                        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Category *
                                        </label>
                                        <select
                                            value={formData.category}
                                            onChange={(e) => handleInputChange('category', e.target.value)}
                                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.category ? 'border-red-300' : 'border-gray-300'}`}
                                        >
                                            <option value="">Select a category</option>
                                            {serviceCategories.map((cat) => (
                                                <option key={cat.value} value={cat.value}>
                                                    {cat.label}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Service Duration (hours)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.5"
                                            min="0.5"
                                            value={formData.duration}
                                            onChange={(e) => handleInputChange('duration', e.target.value)}
                                            placeholder="e.g., 2.5"
                                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.duration ? 'border-red-300' : 'border-gray-300'}`}
                                        />
                                        {errors.duration && <p className="text-red-500 text-sm mt-1">{errors.duration}</p>}
                                        <p className="text-sm text-gray-500 mt-1">Estimated duration for this service</p>
                                    </div>
                                </div>
                            </div>

                            {/* Service Images */}
                            <div className="space-y-6">
                                <h2 className="text-2xl font-semibold text-gray-800 border-b pb-2">
                                    📸 Service Images
                                </h2>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Upload Images (Optional)
                                        </label>
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                                            <input
                                                type="file"
                                                id="service-images"
                                                multiple
                                                accept="image/jpeg,image/jpg,image/png,image/webp"
                                                onChange={(e) => handleImageUpload(e.target.files)}
                                                className="hidden"
                                            />
                                            <label
                                                htmlFor="service-images"
                                                className="cursor-pointer flex flex-col items-center"
                                            >
                                                <div className="text-4xl mb-2">📷</div>
                                                <p className="text-gray-600 font-medium">Click to upload images</p>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    JPEG, PNG, WebP • Max 5 images • 5MB each
                                                </p>
                                            </label>
                                        </div>
                                        {errors.images && <p className="text-red-500 text-sm mt-1">{errors.images}</p>}
                                    </div>

                                    {/* Image Previews */}
                                    {imagePreviews.length > 0 && (
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                            {imagePreviews.map((preview, index) => (
                                                <div key={index} className="relative group">
                                                    <div className="relative w-full h-24 rounded-lg border border-gray-200 overflow-hidden">
                                                        <Image
                                                            src={preview}
                                                            alt={`Preview ${index + 1}`}
                                                            fill
                                                            className="object-cover"
                                                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                                                        />
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage(index)}
                                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Pricing */}
                            <div className="space-y-6">
                                <h2 className="text-2xl font-semibold text-gray-800 border-b pb-2">
                                    💰 Pricing & Payment
                                </h2>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Pricing Type *
                                    </label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {pricingTypes.map((type) => (
                                            <div
                                                key={type.value}
                                                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${formData.pricingType === type.value
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                                onClick={() => handleInputChange('pricingType', type.value)}
                                            >
                                                <h3 className="font-semibold text-gray-800">{type.label}</h3>
                                                <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Base Price (GH₵) *
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={formData.basePrice}
                                            onChange={(e) => handleInputChange('basePrice', e.target.value)}
                                            placeholder="0.00"
                                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.basePrice ? 'border-red-300' : 'border-gray-300'}`}
                                        />
                                        {errors.basePrice && <p className="text-red-500 text-sm mt-1">{errors.basePrice}</p>}
                                        <p className="text-sm text-gray-500 mt-1">
                                            {formData.pricingType === 'HOURLY' && 'Price per hour'}
                                            {formData.pricingType === 'DAILY' && 'Price per day'}
                                            {formData.pricingType === 'FIXED' && 'Fixed price for entire service'}
                                            {formData.pricingType === 'PROJECT_BASED' && 'Starting price (negotiable)'}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Minimum Notice (hours)
                                        </label>
                                        <select
                                            value={formData.minimumNotice}
                                            onChange={(e) => handleInputChange('minimumNotice', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="1">1 hour</option>
                                            <option value="2">2 hours</option>
                                            <option value="6">6 hours</option>
                                            <option value="12">12 hours</option>
                                            <option value="24">24 hours</option>
                                            <option value="48">48 hours</option>
                                            <option value="72">72 hours</option>
                                            <option value="168">1 week</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Available Slots per Day
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="24"
                                            value={formData.availableSlots}
                                            onChange={(e) => handleInputChange('availableSlots', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                        <p className="text-sm text-gray-500 mt-1">Maximum bookings per day</p>
                                    </div>
                                </div>
                            </div>

                            {/* Location & Service Area */}
                            <div className="space-y-6">
                                <h2 className="text-2xl font-semibold text-gray-800 border-b pb-2">
                                    📍 Location & Service Area
                                </h2>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Service Location *
                                    </label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {locationTypes.map((location) => (
                                            <div
                                                key={location.value}
                                                className={`p-4 border-2 rounded-lg cursor-pointer transition-all text-center ${formData.location === location.value
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                                onClick={() => handleInputChange('location', location.value)}
                                            >
                                                <div className="text-2xl mb-2">{location.icon}</div>
                                                <h3 className="font-semibold text-gray-800 text-sm">{location.label}</h3>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {(formData.location === 'CLIENT_LOCATION' || formData.location === 'FLEXIBLE') && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Service Radius (km)
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="100"
                                            value={formData.serviceRadius}
                                            onChange={(e) => handleInputChange('serviceRadius', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                        <p className="text-sm text-gray-500 mt-1">Maximum distance you&apos;re willing to travel</p>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Supported Booking Types * (Select all that apply)
                                    </label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {bookingTypes.map((type) => {
                                            const isSelected = formData.supportedBookingTypes.includes(type.value as any);
                                            return (
                                                <div
                                                    key={type.value}
                                                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${isSelected
                                                        ? 'border-green-500 bg-green-50'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                        }`}
                                                    onClick={() => {
                                                        const currentTypes = formData.supportedBookingTypes;
                                                        const newTypes = isSelected
                                                            ? currentTypes.filter(t => t !== type.value)
                                                            : [...currentTypes, type.value as any];

                                                        // Ensure at least one type is selected
                                                        if (newTypes.length > 0) {
                                                            handleInputChange('supportedBookingTypes', newTypes);
                                                        }
                                                    }}
                                                >
                                                    <div className="text-center">
                                                        <div className="text-2xl mb-2">{type.icon}</div>
                                                        <h3 className="font-semibold text-gray-800 text-sm mb-1">{type.label}</h3>
                                                        <p className="text-xs text-gray-600">{type.description}</p>
                                                        {isSelected && (
                                                            <div className="mt-2">
                                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                                                    ✓ Selected
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {formData.supportedBookingTypes.includes('VIDEO_CALL') && (
                                        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                            <div className="flex items-start space-x-3">
                                                <div className="text-blue-500 mt-1">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-blue-800 mb-1">Video Consultation Features</h4>
                                                    <ul className="text-sm text-blue-700 space-y-1">
                                                        <li>• HD video calling with Jitsi Meet integration</li>
                                                        <li>• Screen sharing for document review</li>
                                                        <li>• Secure, encrypted conversations</li>
                                                        <li>• No additional software required</li>
                                                        <li>• Perfect for legal, medical, or educational consultations</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Equipment & Requirements */}
                            <div className="space-y-6">
                                <h2 className="text-2xl font-semibold text-gray-800 border-b pb-2">
                                    🔧 Equipment & Requirements
                                </h2>

                                <div>
                                    <div className="flex items-center space-x-3 mb-4">
                                        <input
                                            type="checkbox"
                                            id="requiresEquipment"
                                            checked={formData.requiresEquipment}
                                            onChange={(e) => handleInputChange('requiresEquipment', e.target.checked)}
                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <label htmlFor="requiresEquipment" className="text-sm font-medium text-gray-700">
                                            This service requires special equipment or tools
                                        </label>
                                    </div>

                                    {formData.requiresEquipment && (
                                        <div className="space-y-4">
                                            <div className="flex space-x-2">
                                                <input
                                                    type="text"
                                                    value={currentEquipment}
                                                    onChange={(e) => setCurrentEquipment(e.target.value)}
                                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddEquipment())}
                                                    placeholder="e.g., Vacuum cleaner, Cleaning supplies"
                                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleAddEquipment}
                                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                                >
                                                    Add
                                                </button>
                                            </div>

                                            {formData.equipmentList.length > 0 && (
                                                <div className="flex flex-wrap gap-2">
                                                    {formData.equipmentList.map((equipment, index) => (
                                                        <span
                                                            key={index}
                                                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                                                        >
                                                            {equipment}
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveEquipment(equipment)}
                                                                className="ml-2 text-blue-600 hover:text-blue-800"
                                                            >
                                                                ×
                                                            </button>
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Tags & Keywords */}
                            <div className="space-y-6">
                                <h2 className="text-2xl font-semibold text-gray-800 border-b pb-2">
                                    🏷️ Tags & Keywords
                                </h2>

                                <div className="space-y-4">
                                    <div className="flex space-x-2">
                                        <input
                                            type="text"
                                            value={currentTag}
                                            onChange={(e) => setCurrentTag(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                                            placeholder="e.g., deep cleaning, eco-friendly, fast service"
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddTag}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                        >
                                            Add Tag
                                        </button>
                                    </div>

                                    {formData.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {formData.tags.map((tag, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                                                >
                                                    {tag}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveTag(tag)}
                                                        className="ml-2 text-green-600 hover:text-green-800"
                                                    >
                                                        ×
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    <p className="text-sm text-gray-500">
                                        Add relevant keywords to help clients find your service
                                    </p>
                                </div>
                            </div>

                            {/* Cancellation Policy */}
                            <div className="space-y-6">
                                <h2 className="text-2xl font-semibold text-gray-800 border-b pb-2">
                                    📋 Policies
                                </h2>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Cancellation Policy
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={formData.cancellationPolicy}
                                        onChange={(e) => handleInputChange('cancellationPolicy', e.target.value)}
                                        placeholder="Describe your cancellation and refund policy..."
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            {/* Error Display */}
                            {errors.submit && (
                                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-red-700">{errors.submit}</p>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
                                <button
                                    type="button"
                                    onClick={() => handleSubmit(false)}
                                    disabled={isSubmitting || uploadingImages}
                                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-4 px-6 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105"
                                >
                                    {isSubmitting && !isDraft ? (
                                        <span className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            {uploadingImages ? 'Uploading Images...' : 'Publishing Service...'}
                                        </span>
                                    ) : (
                                        '🚀 Publish Service'
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleSubmit(true)}
                                    disabled={isSubmitting || uploadingImages}
                                    className="flex-1 bg-gray-100 text-gray-700 py-4 px-6 rounded-lg font-semibold hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                                >
                                    {isSubmitting && isDraft ? (
                                        <span className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Saving Draft...
                                        </span>
                                    ) : (
                                        '📝 Save as Draft'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </SetupGuard>
    );
}