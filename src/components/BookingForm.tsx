'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    CalendarIcon,
    ClockIcon,
    MapPinIcon,
    CreditCardIcon,
    UserIcon,
    PhoneIcon,
    EnvelopeIcon,
    InformationCircleIcon,
    CheckCircleIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

interface DaySlot {
    date: string;
    slots: string[];
}

interface BookingFormProps {
    service: {
        id: string;
        title: string;
        description: string;
        basePrice: number;
        currency: string;
        pricingType: 'fixed' | 'hourly' | 'package';
        duration: number;
        durationUnit: string;
        supportedBookingTypes?: ('IN_PERSON' | 'REMOTE' | 'VIDEO_CALL' | 'PHONE_CALL')[];
        provider: {
            id: string;
            name: string;
            avatar?: string;
            rating: number;
        };
        packages?: {
            name: string;
            description: string;
            price: number;
            duration?: string;
        }[];
        availability?: {
            timeSlots: {
                day: string;
                startTime: string;
                endTime: string;
                available: boolean;
            }[];
            maxDistance: number;
        };
    };
    onBookingComplete: (bookingData: any) => void;
    onClose: () => void;
}

interface BookingData {
    serviceId: string;
    providerId: string;
    selectedPackage?: string;
    bookingType: 'IN_PERSON' | 'REMOTE' | 'VIDEO_CALL' | 'PHONE_CALL';
    selectedDate: string;
    selectedTime: string;
    duration: number;
    location: {
        address: string;
        coordinates?: { lat: number; lng: number };
    };
    customerInfo: {
        name: string;
        email: string;
        phone: string;
        specialRequests?: string;
    };
    pricing: {
        subtotal: number;
        serviceFee: number;
        tax: number;
        total: number;
    };
    paymentMethod: 'card' | 'momo' | 'bank_transfer';
}

export default function BookingForm({ service, onBookingComplete, onClose }: BookingFormProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loadingSlots, setLoadingSlots] = useState(true);
    const [availableSlots, setAvailableSlots] = useState<DaySlot[]>([]);

    const [selectedHours, setSelectedHours] = useState(1); // New state for hours

    // Booking type display information
    const bookingTypeIcons: Record<string, string> = {
        'IN_PERSON': '🤝',
        'REMOTE': '💻',
        'VIDEO_CALL': '🎥',
        'PHONE_CALL': '📞'
    };

    const bookingTypeTitles: Record<string, string> = {
        'IN_PERSON': 'In-Person',
        'REMOTE': 'Remote',
        'VIDEO_CALL': 'Video Call',
        'PHONE_CALL': 'Phone Call'
    };

    const bookingTypeDescriptions: Record<string, string> = {
        'IN_PERSON': 'Traditional face-to-face service',
        'REMOTE': 'Service delivered remotely',
        'VIDEO_CALL': 'Live video consultation',
        'PHONE_CALL': 'Voice-only consultation'
    };

    const calculatePricing = (hours: number) => {
        const baseTotal = service.basePrice * hours;
        const serviceFee = Math.round(baseTotal * 0.1);
        const tax = Math.round(baseTotal * 0.08);
        return {
            subtotal: baseTotal,
            serviceFee,
            tax,
            total: baseTotal + serviceFee + tax
        };
    };

    const [bookingData, setBookingData] = useState<BookingData>({
        serviceId: service.id,
        providerId: service.provider.id,
        bookingType: (service.supportedBookingTypes && service.supportedBookingTypes.length > 0)
            ? service.supportedBookingTypes[0]
            : 'IN_PERSON', // Default to first supported type or IN_PERSON
        selectedDate: '',
        selectedTime: '',
        duration: 60, // Will be updated based on selectedHours
        location: {
            address: ''
        },
        customerInfo: {
            name: '',
            email: '',
            phone: '',
            specialRequests: ''
        },
        pricing: calculatePricing(1), // Initialize with 1 hour
        paymentMethod: 'momo' // Default payment method for when accepted
    });

    const steps = [
        { id: 1, title: 'Service Details', description: 'Choose package and customizations' },
        { id: 2, title: 'Date & Time', description: 'Select when you need the service' },
        { id: 3, title: 'Location', description: 'Where should the service be provided' },
        { id: 4, title: 'Contact Info', description: 'Your contact information' },
        { id: 5, title: 'Success', description: 'Booking request sent' }
    ];

    const generateAvailableSlots = useCallback(async () => {
        const slots: { date: string; slots: string[] }[] = [];
        const today = new Date();

        console.log('Generating slots for provider:', service.provider.id);

        // Generate dates for the next 30 days
        for (let i = 1; i <= 30; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            const dateString = date.toISOString().split('T')[0];

            try {
                // Check availability for this specific date
                const response = await fetch(
                    `/api/explore/availability?providerId=${service.provider.id}&date=${dateString}&duration=${selectedHours * 60}`,
                    {
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include'
                    }
                );

                if (response.ok) {
                    const availabilityData = await response.json();
                    console.log('Availability data for', dateString, ':', availabilityData);
                    if (availabilityData.success && availabilityData.available) {
                        slots.push({
                            date: dateString,
                            slots: availabilityData.timeSlots
                        });
                    }
                } else {
                    console.log('API response not ok for', dateString, '- status:', response.status);
                }
            } catch (error) {
                console.error(`Error checking availability for ${dateString}:`, error);
            }
        }

        // If no slots were found from API, add some fallback slots
        if (slots.length === 0) {
            console.log('No API slots found, adding fallback slots');
            for (let i = 1; i <= 14; i++) {
                const date = new Date(today);
                date.setDate(today.getDate() + i);
                const dateString = date.toISOString().split('T')[0];

                // Skip weekends for fallback
                if (date.getDay() !== 0 && date.getDay() !== 6) {
                    slots.push({
                        date: dateString,
                        slots: [
                            '9:00 AM', '10:00 AM', '11:00 AM',
                            '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
                        ]
                    });
                }
            }
        }

        console.log('Final slots array:', slots);
        setAvailableSlots(slots);
        setLoadingSlots(false);
    }, [service.provider.id, selectedHours]);

    useEffect(() => {
        // Generate available time slots for the next 30 days
        const loadSlots = async () => {
            setLoadingSlots(true);
            await generateAvailableSlots();
        };
        loadSlots();
    }, [generateAvailableSlots]);

    // Regenerate slots when duration changes
    useEffect(() => {
        if (selectedHours > 0) {
            const reloadSlots = async () => {
                setLoadingSlots(true);
                await generateAvailableSlots();
            };
            reloadSlots();
        }
    }, [selectedHours, generateAvailableSlots]);

    const generateTimeSlotsForDay = (startTime: string, endTime: string): string[] => {
        const slots = [];
        const start = parseTime(startTime);
        const end = parseTime(endTime);

        const current = new Date(start);
        while (current < end) {
            slots.push(formatTime(current));
            current.setHours(current.getHours() + 1);
        }

        return slots;
    };

    const parseTime = (timeString: string): Date => {
        const [hours, minutes] = timeString.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        return date;
    };

    const formatTime = (date: Date): string => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const updateBookingData = (field: string, value: any) => {
        setBookingData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const updateNestedField = (parent: string, field: string, value: any) => {
        setBookingData(prev => {
            const parentObj = prev[parent as keyof BookingData];
            if (typeof parentObj === 'object' && parentObj !== null) {
                return {
                    ...prev,
                    [parent]: {
                        ...parentObj,
                        [field]: value
                    }
                };
            }
            return prev;
        });
    };

    const updatePricing = (basePrice: number) => {
        const serviceFee = Math.round(basePrice * 0.1);
        const tax = Math.round(basePrice * 0.08);
        const total = basePrice + serviceFee + tax;

        updateBookingData('pricing', {
            subtotal: basePrice,
            serviceFee,
            tax,
            total
        });
    };

    const handleHourChange = (hours: number) => {
        setSelectedHours(hours);
        const newPricing = calculatePricing(hours);
        setBookingData(prev => ({
            ...prev,
            duration: hours * 60, // Convert hours to minutes
            pricing: newPricing
        }));
    };

    const handlePackageSelect = (packageData: any) => {
        updateBookingData('selectedPackage', packageData.name);
        updatePricing(packageData.price * selectedHours); // Multiply by selected hours
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const submissionData = {
                serviceId: service.id,
                providerId: service.provider.id,
                bookingType: bookingData.bookingType,
                selectedDate: bookingData.selectedDate,
                selectedTime: bookingData.selectedTime,
                duration: bookingData.duration, // Use calculated duration (hours * 60)
                location: { address: bookingData.location.address },
                customerInfo: {
                    name: bookingData.customerInfo.name,
                    email: bookingData.customerInfo.email,
                    phone: bookingData.customerInfo.phone,
                    specialRequests: bookingData.customerInfo.specialRequests
                },
                pricing: {
                    total: bookingData.pricing.total
                },
                paymentMethod: bookingData.paymentMethod || 'MOBILE_MONEY',
                specialRequests: bookingData.customerInfo.specialRequests
            };

            console.log('Submitting booking request:', submissionData);

            const response = await fetch('/api/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(submissionData),
            });

            const result = await response.json();
            console.log('Booking response:', result);

            if (!response.ok) {
                throw new Error(result.error || 'Failed to submit booking request');
            }

            if (result.success) {
                // Update messaging for request/approval workflow
                setSuccessMessage(`🎉 Booking request sent successfully!
                
📨 Your request has been sent to the provider for review
⏰ Duration: ${selectedHours} ${selectedHours === 1 ? 'hour' : 'hours'}
💰 Total: ${bookingData.pricing.total} ${service.currency}
⏰ You&apos;ll be notified when they respond (usually within 24 hours)
💳 Payment will be processed only after they accept

Request ID: ${result.booking.id}
Status: ${result.booking.status}

${result.nextSteps?.forClient || 'Wait for provider response'}
                `);
                setCurrentStep(5); // Go directly to success step (step 5, not 6)

                // Auto-close modal after showing success
                setTimeout(() => {
                    onClose();
                }, 8000); // Show success message for 8 seconds
            }
        } catch (error) {
            console.error('Booking submission error:', error);
            setError(error instanceof Error ? error.message : 'Failed to submit booking request. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderServiceDetailsStep = () => (
        <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {service.provider.name.charAt(0)}
                        </div>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">{service.title}</h3>
                        <p className="text-sm text-gray-600">by {service.provider.name}</p>
                        <p className="text-sm text-gray-500 mt-1">{service.description}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">
                            ${service.basePrice} {service.currency}
                        </p>
                        <p className="text-sm text-gray-500">per hour</p>
                    </div>
                </div>
            </div>

            {/* Duration Selection */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Select Duration</h4>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[1, 2, 3, 4, 5, 6, 8, 12].map((hours) => (
                            <button
                                key={hours}
                                onClick={() => handleHourChange(hours)}
                                className={`p-3 rounded-lg border-2 transition-all ${selectedHours === hours
                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                    : 'border-gray-200 hover:border-blue-300 text-gray-700'
                                    }`}
                            >
                                <div className="text-center">
                                    <div className="text-lg font-semibold">{hours}</div>
                                    <div className="text-xs">{hours === 1 ? 'hour' : 'hours'}</div>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Custom hours input for longer durations */}
                    <div className="flex items-center space-x-3">
                        <label className="text-sm font-medium text-gray-700">Custom duration:</label>
                        <div className="flex items-center space-x-2">
                            <input
                                type="number"
                                min="1"
                                max="24"
                                value={selectedHours > 12 ? selectedHours : ''}
                                onChange={(e) => {
                                    const hours = parseInt(e.target.value) || 1;
                                    if (hours >= 1 && hours <= 24) {
                                        handleHourChange(hours);
                                    }
                                }}
                                className="w-20 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Hours"
                            />
                            <span className="text-sm text-gray-500">hours (max 24)</span>
                        </div>
                    </div>

                    {/* Pricing breakdown */}
                    <div className="bg-gray-50 rounded-lg p-4 mt-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Service ({selectedHours} {selectedHours === 1 ? 'hour' : 'hours'})</span>
                                <span>${bookingData.pricing.subtotal} {service.currency}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Service fee (10%)</span>
                                <span>${bookingData.pricing.serviceFee} {service.currency}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Tax (8%)</span>
                                <span>${bookingData.pricing.tax} {service.currency}</span>
                            </div>
                            <div className="border-t pt-2 flex justify-between font-semibold">
                                <span>Total</span>
                                <span className="text-lg text-blue-600">${bookingData.pricing.total} {service.currency}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Booking Type Selection */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">How would you like to receive this service?</h4>
                {service.supportedBookingTypes && service.supportedBookingTypes.length > 0 && service.supportedBookingTypes.length < 4 && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-700">
                            <span className="font-medium">Available delivery modes:</span> This provider offers {service.supportedBookingTypes.length} of 4 service delivery options.
                        </p>
                    </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {(service.supportedBookingTypes && service.supportedBookingTypes.length > 0
                        ? service.supportedBookingTypes
                        : ['IN_PERSON', 'REMOTE', 'VIDEO_CALL', 'PHONE_CALL'] as const).map((type) => (
                            <button
                                key={type}
                                onClick={() => updateBookingData('bookingType', type)}
                                className={`p-4 border-2 rounded-lg transition-all text-center ${bookingData.bookingType === type
                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                    : 'border-gray-200 hover:border-blue-300 text-gray-700'
                                    }`}
                            >
                                <div className="text-2xl mb-2">{bookingTypeIcons[type]}</div>
                                <h5 className="font-semibold text-sm mb-1">{bookingTypeTitles[type]}</h5>
                                <p className="text-xs opacity-75">{bookingTypeDescriptions[type]}</p>
                            </button>
                        ))}
                </div>

                {/* Information based on selected booking type */}
                {bookingData.bookingType === 'VIDEO_CALL' && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start space-x-3">
                            <div className="text-blue-500 mt-1">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h6 className="font-medium text-blue-800 mb-1">Video Consultation Features</h6>
                                <ul className="text-sm text-blue-700 space-y-1">
                                    <li>• HD video calling with screen sharing</li>
                                    <li>• Secure, encrypted conversations</li>
                                    <li>• No additional software required</li>
                                    <li>• Perfect for consultations and remote services</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {bookingData.bookingType === 'PHONE_CALL' && (
                    <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                        <div className="flex items-start space-x-3">
                            <div className="text-purple-500 mt-1">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                            </div>
                            <div>
                                <h6 className="font-medium text-purple-800 mb-1">Audio Consultation Features</h6>
                                <ul className="text-sm text-purple-700 space-y-1">
                                    <li>• High-quality voice calling</li>
                                    <li>• Secure, encrypted conversations</li>
                                    <li>• Great for consultations and advice</li>
                                    <li>• Works on any device with internet</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {bookingData.bookingType === 'REMOTE' && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-start space-x-3">
                            <div className="text-green-500 mt-1">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <h6 className="font-medium text-green-800 mb-1">Remote Service Features</h6>
                                <ul className="text-sm text-green-700 space-y-1">
                                    <li>• Service delivered online or digitally</li>
                                    <li>• No physical meeting required</li>
                                    <li>• Communication via messages and files</li>
                                    <li>• Perfect for digital services and consulting</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {service.packages && service.packages.length > 0 && (
                <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Available Packages</h4>
                    <div className="space-y-3">
                        <div
                            className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${!bookingData.selectedPackage ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                                }`}
                            onClick={() => {
                                updateBookingData('selectedPackage', undefined);
                                const newPricing = calculatePricing(selectedHours);
                                updateBookingData('pricing', newPricing);
                            }}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h5 className="font-medium text-gray-900">Standard Service</h5>
                                    <p className="text-sm text-gray-600">Basic service without packages</p>
                                    <p className="text-xs text-gray-500">{selectedHours} {selectedHours === 1 ? 'hour' : 'hours'}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-gray-900">${service.basePrice * selectedHours}</p>
                                    <p className="text-xs text-gray-500">${service.basePrice}/hour</p>
                                </div>
                            </div>
                        </div>

                        {service.packages.map((pkg, index) => (
                            <div
                                key={index}
                                className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${bookingData.selectedPackage === pkg.name ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                onClick={() => handlePackageSelect(pkg)}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h5 className="font-medium text-gray-900">{pkg.name}</h5>
                                        <p className="text-sm text-gray-600">{pkg.description}</p>
                                        {pkg.duration && (
                                            <p className="text-xs text-gray-500 mt-1">Duration: {pkg.duration}</p>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-gray-900">${pkg.price * selectedHours}</p>
                                        <p className="text-xs text-gray-500">${pkg.price}/hour</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    const renderDateTimeStep = () => (
        <div className="space-y-6">
            <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Select Date</h4>
                {loadingSlots ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-b-4 border-blue-500"></div>
                        <span className="ml-2 text-gray-600">Loading available dates...</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-7 gap-2">
                        {availableSlots.slice(0, 14).map((daySlot) => {
                            const date = new Date(daySlot.date);
                            const isSelected = bookingData.selectedDate === daySlot.date;

                            return (
                                <button
                                    key={daySlot.date}
                                    onClick={() => updateBookingData('selectedDate', daySlot.date)}
                                    disabled={daySlot.slots.length === 0}
                                    className={`p-3 rounded-lg text-center transition-colors ${isSelected
                                        ? 'bg-blue-600 text-white'
                                        : daySlot.slots.length > 0
                                            ? 'bg-white border border-gray-300 hover:border-blue-500 text-gray-900'
                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        }`}
                                >
                                    <div className="text-xs font-medium">
                                        {date.toLocaleDateString('en-US', { weekday: 'short' })}
                                    </div>
                                    <div className="text-sm">
                                        {date.getDate()}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {bookingData.selectedDate && (
                <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Select Time</h4>
                    <div className="grid grid-cols-4 gap-3">
                        {availableSlots
                            .find(slot => slot.date === bookingData.selectedDate)
                            ?.slots.map((timeSlot) => (
                                <button
                                    key={timeSlot}
                                    onClick={() => updateBookingData('selectedTime', timeSlot)}
                                    className={`p-3 rounded-lg text-center transition-colors ${bookingData.selectedTime === timeSlot
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white border border-gray-300 hover:border-blue-500 text-gray-900'
                                        }`}
                                >
                                    {timeSlot}
                                </button>
                            ))}
                    </div>
                </div>
            )}
        </div>
    );

    const renderLocationStep = () => (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Location *
                </label>
                <div className="relative">
                    <MapPinIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                    <textarea
                        className="w-full pl-10 border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={3}
                        placeholder="Enter the full address where the service should be provided..."
                        value={bookingData.location.address}
                        onChange={(e) => updateNestedField('location', 'address', e.target.value)}
                        required
                    />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                    Please provide a detailed address including apartment/unit numbers if applicable
                </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-start">
                    <InformationCircleIcon className="h-5 w-5 text-blue-500 mt-0.5 mr-3" />
                    <div>
                        <p className="text-sm font-medium text-blue-900">Service Area Information</p>
                        <p className="text-sm text-blue-700 mt-1">
                            This provider services within {service.availability?.maxDistance || 25} km of their location.
                            Additional travel charges may apply for longer distances.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderContactInfoStep = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                    </label>
                    <div className="relative">
                        <UserIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            className="w-full pl-10 border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                            value={bookingData.customerInfo.name}
                            onChange={(e) => updateNestedField('customerInfo', 'name', e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                    </label>
                    <div className="relative">
                        <PhoneIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                        <input
                            type="tel"
                            className="w-full pl-10 border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                            value={bookingData.customerInfo.phone}
                            onChange={(e) => updateNestedField('customerInfo', 'phone', e.target.value)}
                            required
                        />
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                </label>
                <div className="relative">
                    <EnvelopeIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                    <input
                        type="email"
                        className="w-full pl-10 border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                        value={bookingData.customerInfo.email}
                        onChange={(e) => updateNestedField('customerInfo', 'email', e.target.value)}
                        required
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Requests (Optional)
                </label>
                <textarea
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Any special instructions or requirements..."
                    value={bookingData.customerInfo.specialRequests || ''}
                    onChange={(e) => updateNestedField('customerInfo', 'specialRequests', e.target.value)}
                />
            </div>
        </div>
    );

    const renderSuccessStep = () => (
        <div className="text-center space-y-6">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100">
                <CheckCircleIcon className="h-10 w-10 text-blue-600" />
            </div>

            <div className="space-y-4">
                <h3 className="text-2xl font-bold text-gray-900">🎉 Request Sent Successfully!</h3>

                {error ? (
                    <div className="bg-red-50 p-4 rounded-lg">
                        <p className="text-red-800">{error}</p>
                    </div>
                ) : (
                    <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg text-left">
                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                                <InformationCircleIcon className="h-6 w-6 text-blue-600 mt-1" />
                            </div>
                            <div className="text-blue-800 space-y-3">
                                <div>
                                    <h4 className="font-semibold text-blue-900 mb-2">📨 Your Request is on its way!</h4>
                                    <p className="text-sm">Your booking request has been sent to <strong>{service.provider.name}</strong> for review.</p>
                                </div>

                                <div className="bg-white/50 rounded-lg p-3 text-sm">
                                    <h5 className="font-medium text-blue-900 mb-2">⏰ What happens next?</h5>
                                    <ul className="space-y-1 text-blue-700">
                                        <li>• Provider reviews your request (usually within 24 hours)</li>
                                        <li>• You&apos;ll get instant notification of their response</li>
                                        <li>• If accepted, complete payment to confirm booking</li>
                                        <li>• If declined, you can book with another provider</li>
                                    </ul>
                                </div>

                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                    <h5 className="font-medium text-yellow-800 mb-1">💳 Safe & Secure</h5>
                                    <p className="text-sm text-yellow-700">No payment charged until provider accepts your request!</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">📱 Stay Updated</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                        <p>✅ Email notifications sent to your inbox</p>
                        <p>🔔 In-app notifications in your dashboard</p>
                        <p>📊 Track progress in your bookings section</p>
                    </div>
                </div>
            </div>

            <div className="pt-4 space-y-3">
                <button
                    onClick={onClose}
                    className="w-full px-6 py-3 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 transition-colors"
                >
                    Got it, Close
                </button>
                <p className="text-xs text-gray-500">This window will close automatically in a few seconds</p>
            </div>
        </div>
    );

    const canProceedToNext = () => {
        switch (currentStep) {
            case 1: // Service Details
                return true; // Always can proceed from service details
            case 2: // Date & Time
                return bookingData.selectedDate && bookingData.selectedTime;
            case 3: // Location
                return bookingData.location.address.trim().length > 0;
            case 4: // Contact Info
                return bookingData.customerInfo.name.trim().length > 0 &&
                    bookingData.customerInfo.email.trim().length > 0;
            default:
                return false;
        }
    };

    const handleNext = () => {
        if (currentStep < 4) { // Max step is now 4 (Contact Info)
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span className="text-xl">📨</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Request Service</h2>
                            <p className="text-sm text-gray-600">Send a booking request to the provider</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Progress Steps - Updated to show only 5 steps */}
                <div className="px-6 py-4 bg-gray-50">
                    <div className="flex items-center justify-between">
                        {[
                            { step: 1, label: 'Service\nDetails', icon: '📋' },
                            { step: 2, label: 'Date &\nTime', icon: '📅' },
                            { step: 3, label: 'Location', icon: '📍' },
                            { step: 4, label: 'Contact\nInfo', icon: '👤' },
                            { step: 5, label: 'Success', icon: '✅' }
                        ].map(({ step, label, icon }) => (
                            <div key={step} className="flex flex-col items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${currentStep >= step
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-500'
                                    }`}>
                                    {currentStep > step ? '✓' : step}
                                </div>
                                <span className="text-xs text-gray-600 mt-1 text-center whitespace-pre-line">{label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Request Workflow Notice - Show on all steps except success */}
                {currentStep < 5 && (
                    <div className="mx-6 mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h4 className="text-sm font-medium text-blue-900">📨 Request Workflow</h4>
                                <div className="mt-1 text-sm text-blue-800">
                                    <p>• Your request will be sent to the provider for review</p>
                                    <p>• Payment will be processed ONLY after they accept</p>
                                    <p>• No charges until confirmation - completely safe!</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Form Content */}
                <div className="p-6">
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    {currentStep === 1 && renderServiceDetailsStep()}
                    {currentStep === 2 && renderDateTimeStep()}
                    {currentStep === 3 && renderLocationStep()}
                    {currentStep === 4 && renderContactInfoStep()}
                    {currentStep === 5 && renderSuccessStep()}
                </div>

                {/* Footer - Updated navigation */}
                {currentStep < 5 && (
                    <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
                        <button
                            type="button"
                            onClick={handlePrevious}
                            disabled={currentStep === 1}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                            Previous
                        </button>

                        {currentStep === 4 ? (
                            <button
                                onClick={handleSubmit}
                                disabled={!canProceedToNext() || isSubmitting}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        <span>Sending Request...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>📨 Send Booking Request</span>
                                    </>
                                )}
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleNext}
                                disabled={!canProceedToNext()}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Next
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}