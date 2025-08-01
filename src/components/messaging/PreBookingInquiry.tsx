'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import MessageBubble, { Message } from './MessageBubble';
import BookingForm from '../BookingForm';

interface PreBookingInquiryProps {
    providerId: string;
    providerName: string;
    providerImage?: string;
    className?: string;
    buttonText?: string;
    service?: {
        id: string;
        title: string;
        description: string;
        basePrice: number;
        currency: string;
        pricingType: 'fixed' | 'hourly' | 'package';
        duration: number;
        durationUnit: string;
        supportedBookingTypes: ('IN_PERSON' | 'VIDEO_CALL' | 'REMOTE' | 'PHONE_CALL')[];
        provider: {
            id: string;
            name: string;
            avatar?: string;
            rating: number;
        };
    };
}

export default function PreBookingInquiry({
    providerId,
    providerName,
    providerImage,
    className = '',
    buttonText = 'Ask a Question',
    service
}: PreBookingInquiryProps) {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [warning, setWarning] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom of messages
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Mark messages as read
    const markMessagesAsRead = useCallback(async () => {
        try {
            const response = await fetch('/api/messages/mark-read', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    providerId: providerId,
                    conversationType: 'pre-booking'
                })
            });

            if (response.ok) {
                // Trigger notification bell refresh
                window.dispatchEvent(new CustomEvent('notificationsChanged'));
            }
        } catch (error) {
            console.error('Error marking messages as read:', error);
        }
    }, [providerId]);

    // Fetch existing pre-booking messages
    const fetchMessages = useCallback(async () => {
        if (!user || !isOpen) return;

        try {
            setLoading(true);
            const response = await fetch(`/api/messages/pre-booking?providerId=${providerId}`);

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setMessages(data.messages.map((msg: any) => ({
                        ...msg,
                        attachments: [], // Pre-booking messages have no attachments
                        senderName: msg.senderType === 'CLIENT' ? user.name : providerName,
                        senderImage: msg.senderType === 'CLIENT' ? user.image : providerImage
                    })));

                    // Mark messages as read when opening the conversation
                    if (data.messages.length > 0) {
                        markMessagesAsRead();
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching pre-booking messages:', error);
        } finally {
            setLoading(false);
        }
    }, [user, isOpen, providerId, providerName, providerImage, markMessagesAsRead]);

    // Send pre-booking message
    const handleSendMessage = async () => {
        if (!newMessage.trim() || sending) return;

        setSending(true);
        setError(null);
        setWarning(null);

        try {
            const response = await fetch('/api/messages/pre-booking', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    providerId,
                    content: newMessage.trim(),
                    messageType: 'TEXT'
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Add the new message to the list
                const newMsg: Message = {
                    ...data.message,
                    attachments: [],
                    senderName: user?.name,
                    senderImage: user?.image
                };

                setMessages(prev => [...prev, newMsg]);
                setNewMessage('');
                scrollToBottom();
            } else {
                if (data.reason) {
                    setWarning(data.reason);
                } else {
                    setError(data.error || 'Failed to send message');
                }
            }
        } catch (error: any) {
            setError('Failed to send message. Please try again.');
        } finally {
            setSending(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // Determine if message is from current user
    const isOwnMessage = (message: Message): boolean => {
        if (!user) return false;

        // For pre-booking, clients are typically the senders
        if (user.roles?.includes('CLIENT')) {
            return message.senderType === 'CLIENT';
        } else if (user.roles?.includes('PROVIDER')) {
            return message.senderType === 'PROVIDER';
        }

        return false;
    };

    // Get sender display info
    const getSenderInfo = (message: Message) => {
        if (isOwnMessage(message)) {
            return {
                name: user?.name || 'You',
                image: user?.image
            };
        } else {
            return {
                name: providerName,
                image: providerImage
            };
        }
    };

    // Fetch messages when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchMessages();
        }
    }, [isOpen, fetchMessages]);

    // Auto-scroll when messages update
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Don't show if user is not logged in or doesn't have client role
    if (!user || !user.roles?.includes('CLIENT')) {
        return null;
    }

    return (
        <>
            {/* Ask Question Button */}
            <button
                onClick={() => setIsOpen(true)}
                className={`flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors ${className}`}
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.002 8.002 0 01-7.007-4.094c-.58-.58-.58-1.519 0-2.098A8.002 8.002 0 0121 12z" />
                </svg>
                {buttonText}
            </button>

            {/* Pre-booking Inquiry Modal */}
            {isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg w-full max-w-2xl h-[600px] flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <Image
                                        src={providerImage || '/default-avatar.svg'}
                                        alt={providerName}
                                        width={40}
                                        height={40}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gray-400 rounded-full border-2 border-white"></div>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">{providerName}</h3>
                                    <p className="text-sm text-gray-500">Service Inquiry</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Restrictions Notice */}
                        <div className="px-4 py-3 bg-amber-50 border-l-4 border-amber-400">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-amber-700">
                                        <strong>Service Inquiry:</strong> Ask questions about services, availability, and requirements.
                                        Files, contact info, and calls available after booking confirmation.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Messages Container */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {loading ? (
                                <div className="flex justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <p className="text-lg font-medium mb-2">Start a conversation</p>
                                    <p className="text-sm">Ask about this provider&apos;s services, availability, and requirements!</p>
                                </div>
                            ) : (
                                messages.map((message) => {
                                    const senderInfo = getSenderInfo(message);
                                    const messageWithSenderInfo = {
                                        ...message,
                                        senderName: senderInfo.name,
                                        senderImage: senderInfo.image || undefined
                                    };
                                    return (
                                        <MessageBubble
                                            key={message.id}
                                            message={messageWithSenderInfo}
                                            isOwn={isOwnMessage(message)}
                                            showSenderInfo={true}
                                        />
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Error/Warning Messages */}
                        {error && (
                            <div className="mx-4 mb-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        )}

                        {warning && (
                            <div className="mx-4 mb-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <p className="text-sm text-yellow-700">{warning}</p>
                            </div>
                        )}

                        {/* Message Input */}
                        <div className="p-4 border-t border-gray-200">
                            <div className="flex gap-2">
                                <textarea
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder={`Ask ${providerName} about their services...`}
                                    className="flex-1 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    rows={2}
                                    disabled={sending}
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!newMessage.trim() || sending}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors self-end"
                                >
                                    {sending ? (
                                        <div className="w-5 h-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Encourage Booking */}
                        {messages.length >= 2 && (
                            <div className="px-4 py-3 bg-green-50 border-t border-green-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <p className="text-sm text-green-700 mb-1">
                                            <strong>Ready to book?</strong> Unlock full messaging features including file sharing and video calls.
                                        </p>
                                    </div>
                                    <button
                                        onClick={async () => {
                                            setIsOpen(false);

                                            // If we have service data, show the booking modal directly
                                            if (service) {
                                                setShowBookingModal(true);
                                                return;
                                            }

                                            // Fallback: Try to trigger existing booking modal or redirect
                                            const bookingButton = document.querySelector('[data-booking-trigger]') as HTMLButtonElement;
                                            if (bookingButton) {
                                                bookingButton.click();
                                            } else {
                                                // If no booking trigger found, redirect to provider's profile page
                                                try {
                                                    const response = await fetch(`/api/providers/${providerId}`);
                                                    if (response.ok) {
                                                        const data = await response.json();
                                                        const category = data.specialty || data.category || '';

                                                        // Map category to the correct profile page route
                                                        let profileRoute = '/explore'; // fallback

                                                        if (category.toLowerCase().includes('health') || category.toLowerCase().includes('medical')) {
                                                            profileRoute = `/healthcare/professional/${providerId}`;
                                                        } else if (category.toLowerCase().includes('creative') || category.toLowerCase().includes('design') || category.toLowerCase().includes('art')) {
                                                            profileRoute = `/creative/professional/${providerId}`;
                                                        } else if (category.toLowerCase().includes('technical') || category.toLowerCase().includes('tech') || category.toLowerCase().includes('repair')) {
                                                            profileRoute = `/technical/professional/${providerId}`;
                                                        } else if (category.toLowerCase().includes('education') || category.toLowerCase().includes('tutor') || category.toLowerCase().includes('teach')) {
                                                            profileRoute = `/education/professional/${providerId}`;
                                                        } else if (category.toLowerCase().includes('home') || category.toLowerCase().includes('cleaning') || category.toLowerCase().includes('maintenance')) {
                                                            profileRoute = `/home-services/professional/${providerId}`;
                                                        } else if (category.toLowerCase().includes('legal') || category.toLowerCase().includes('law') || category.toLowerCase().includes('financial') || category.toLowerCase().includes('business')) {
                                                            profileRoute = `/professional-services/professional/${providerId}`;
                                                        } else {
                                                            // Try to match against common service categories
                                                            profileRoute = `/explore`; // fallback to explore page
                                                        }

                                                        window.location.href = profileRoute;
                                                    } else {
                                                        // Fallback to explore page
                                                        window.location.href = `/explore`;
                                                    }
                                                } catch (error) {
                                                    console.error('Failed to fetch provider details:', error);
                                                    // Fallback to explore page
                                                    window.location.href = `/explore`;
                                                }
                                            }
                                        }}
                                        className="ml-3 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                                    >
                                        Book Now
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Platform Safety Notice */}
                        <div className="px-4 py-2 bg-blue-50 border-t border-blue-200">
                            <p className="text-xs text-blue-700 text-center">
                                🛡️ Keep conversations on-platform for your protection. Full features unlock after booking confirmation.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Booking Modal */}
            {showBookingModal && service && (
                <BookingForm
                    service={service}
                    onClose={() => setShowBookingModal(false)}
                    onBookingComplete={() => {
                        setShowBookingModal(false);
                        // Optionally show a success message
                    }}
                    category={
                        service.title.toLowerCase().includes('health') || service.title.toLowerCase().includes('medical') ? 'healthcare' :
                            service.title.toLowerCase().includes('creative') || service.title.toLowerCase().includes('design') ? 'creative' :
                                service.title.toLowerCase().includes('technical') || service.title.toLowerCase().includes('repair') ? 'technical' :
                                    service.title.toLowerCase().includes('education') || service.title.toLowerCase().includes('tutor') ? 'education' :
                                        service.title.toLowerCase().includes('home') || service.title.toLowerCase().includes('cleaning') ? 'home' :
                                            service.title.toLowerCase().includes('legal') || service.title.toLowerCase().includes('law') ? 'professional' :
                                                'professional'
                    }
                />
            )}
        </>
    );
} 