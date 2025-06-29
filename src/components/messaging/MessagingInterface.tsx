'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import MessageBubble, { Message, MessageAttachment } from './MessageBubble';
import MessageInput from './MessageInput';
import CallModal from '../CallModal';
import { useAuth } from '@/contexts/AuthContext';

interface MessagingInterfaceProps {
    bookingId: string;
    otherParticipant: {
        name: string;
        image?: string;
        type: 'CLIENT' | 'PROVIDER';
        isOnline?: boolean;
    };
    booking?: {
        bookingType: string;
        status: string;
        scheduledDate: string;
        scheduledTime: string;
    };
    className?: string;
}

export default function MessagingInterface({
    bookingId,
    otherParticipant,
    booking,
    className = ''
}: MessagingInterfaceProps) {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [typing, setTyping] = useState(false);
    const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom of messages
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Fetch messages
    const fetchMessages = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/messages?bookingId=${bookingId}`);

            if (!response.ok) {
                throw new Error('Failed to fetch messages');
            }

            const data = await response.json();
            if (data.success) {
                console.log('Raw messages from API:', data.messages);
                setMessages(data.messages.map((msg: any) => {
                    console.log('Processing message:', msg.id, 'attachments:', msg.attachments);

                    let parsedAttachments = [];
                    if (msg.attachments) {
                        try {
                            // First parse the JSON string to get the array
                            const attachmentsArray = JSON.parse(msg.attachments);
                            console.log('Parsed attachments array:', attachmentsArray);

                            // Then parse each attachment if it's a JSON string
                            parsedAttachments = attachmentsArray.map((att: any) => {
                                if (typeof att === 'string') {
                                    try {
                                        return JSON.parse(att);
                                    } catch (e) {
                                        console.warn('Failed to parse attachment string:', att);
                                        return att;
                                    }
                                }
                                return att;
                            });
                            console.log('Final parsed attachments:', parsedAttachments);
                        } catch (e) {
                            console.error('Failed to parse attachments:', e, msg.attachments);
                        }
                    }

                    return {
                        ...msg,
                        attachments: parsedAttachments,
                        createdAt: msg.createdAt
                    };
                }));
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
            setError('Failed to load messages');
        } finally {
            setLoading(false);
        }
    }, [bookingId]);

    // Send message
    const handleSendMessage = async (content: string, attachments?: MessageAttachment[]) => {
        try {
            const response = await fetch('/api/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    bookingId,
                    content,
                    messageType: attachments && attachments.length > 0 ?
                        (attachments.some(a => a.isImage) ? 'IMAGE' : 'DOCUMENT') : 'TEXT',
                    attachments: attachments || []
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.reason || errorData.error || 'Failed to send message');
            }

            const data = await response.json();
            if (data.success) {
                // Add the new message to the list
                const newMessage: Message = {
                    ...data.message,
                    attachments: attachments || [],
                    senderName: user?.name,
                    senderImage: user?.image
                };

                setMessages(prev => [...prev, newMessage]);
                scrollToBottom();
            }
        } catch (error: any) {
            console.error('Error sending message:', error);
            throw error; // Re-throw to let MessageInput handle the error display
        }
    };

    // Determine if message is from current user
    const isOwnMessage = (message: Message): boolean => {
        if (!user) return false;

        // For system messages, never show as own
        if (message.senderType === 'SYSTEM') return false;

        // Check based on user role and message sender type
        if (user.roles?.includes('CLIENT')) {
            return message.senderType === 'CLIENT';
        } else if (user.roles?.includes('PROVIDER')) {
            return message.senderType === 'PROVIDER';
        }

        return false;
    };

    // Get sender display info
    const getSenderInfo = (message: Message) => {
        if (message.senderType === 'SYSTEM') {
            return { name: 'System', image: undefined };
        }

        if (isOwnMessage(message)) {
            return {
                name: user?.name || 'You',
                image: user?.image
            };
        } else {
            return {
                name: otherParticipant.name,
                image: otherParticipant.image
            };
        }
    };

    // Mark messages as read
    const markMessagesAsRead = useCallback(async () => {
        try {
            await fetch('/api/messages/mark-read', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ bookingId })
            });
        } catch (error) {
            console.error('Error marking messages as read:', error);
        }
    }, [bookingId]);

    // Video call functionality
    const canStartVideoCall = () => {
        console.log('🔍 Checking call availability:', {
            bookingType: booking?.bookingType,
            status: booking?.status,
            booking: booking
        });

        // For testing, let's also allow calls for any confirmed booking
        const hasCallableBookingType = booking?.bookingType === 'VIDEO_CALL' || booking?.bookingType === 'PHONE_CALL';
        const hasValidStatus = booking?.status === 'CONFIRMED' || booking?.status === 'IN_PROGRESS';

        // Temporary: Allow calls for any confirmed booking (for testing)
        const isConfirmedBooking = booking?.status === 'CONFIRMED';

        console.log('🔍 Call check results:', {
            hasCallableBookingType,
            hasValidStatus,
            isConfirmedBooking,
            finalResult: hasCallableBookingType && hasValidStatus
        });

        return (hasCallableBookingType && hasValidStatus) || isConfirmedBooking;
    };

    const handleStartVideoCall = () => {
        if (canStartVideoCall()) {
            setIsVideoCallOpen(true);
        }
    };

    const generateRoomName = () => {
        // Generate a unique room name based on booking ID
        return `consultation-${bookingId}`;
    };

    // Initial load
    useEffect(() => {
        if (bookingId) {
            fetchMessages();
            markMessagesAsRead(); // Mark messages as read when conversation is opened
        }
    }, [bookingId, fetchMessages, markMessagesAsRead]);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Polling for new messages (in a real app, you'd use WebSockets)
    useEffect(() => {
        if (!bookingId) return;

        const interval = setInterval(() => {
            if (!loading && !error) {
                fetchMessages();
            }
        }, 15000); // Poll every 15 seconds (even less aggressive)

        return () => clearInterval(interval);
    }, [loading, bookingId, error, fetchMessages]);

    if (loading && messages.length === 0) {
        return (
            <div className={`flex items-center justify-center h-96 ${className}`}>
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading messages...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`flex items-center justify-center h-96 ${className}`}>
                <div className="text-center">
                    <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                    <button
                        onClick={() => {
                            setError(null);
                            fetchMessages();
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden ${className}`} style={{ maxHeight: '100%' }}>

            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20">
                <div className="flex items-center space-x-3">
                    {otherParticipant.image ? (
                        <Image
                            src={otherParticipant.image}
                            alt={otherParticipant.name}
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium">
                                {otherParticipant.name[0].toUpperCase()}
                            </span>
                        </div>
                    )}

                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                            {otherParticipant.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {otherParticipant.type === 'CLIENT' ? 'Client' : 'Service Provider'}
                            {booking?.bookingType === 'VIDEO_CALL' && (
                                <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                    Video Consultation
                                </span>
                            )}
                            {booking?.bookingType === 'PHONE_CALL' && (
                                <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    Audio Consultation
                                </span>
                            )}
                            {otherParticipant.isOnline && (
                                <span className="ml-2 inline-flex items-center">
                                    <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                                    Online
                                </span>
                            )}
                        </p>
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    {/* Call Buttons */}
                    {canStartVideoCall() && booking?.bookingType === 'VIDEO_CALL' && (
                        <button
                            onClick={handleStartVideoCall}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors shadow-sm"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            <span className="hidden sm:inline">Start Video Call</span>
                            <span className="sm:hidden">Video</span>
                        </button>
                    )}

                    {canStartVideoCall() && booking?.bookingType === 'PHONE_CALL' && (
                        <button
                            onClick={handleStartVideoCall}
                            className="flex items-center space-x-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors shadow-sm"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <span className="hidden sm:inline">Start Audio Call</span>
                            <span className="sm:hidden">Audio</span>
                        </button>
                    )}

                    {/* Default Video Call Button for confirmed bookings without specific type */}
                    {canStartVideoCall() && !booking?.bookingType && (
                        <button
                            onClick={handleStartVideoCall}
                            className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors shadow-sm"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            <span className="hidden sm:inline">Start Video Call</span>
                            <span className="sm:hidden">Video</span>
                        </button>
                    )}

                    {/* Default call button for old bookings (fallback) */}
                    {canStartVideoCall() && booking?.bookingType && !['VIDEO_CALL', 'PHONE_CALL'].includes(booking.bookingType) && (
                        <button
                            onClick={handleStartVideoCall}
                            className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors shadow-sm"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            <span className="hidden sm:inline">Start Call</span>
                            <span className="sm:hidden">Call</span>
                        </button>
                    )}

                    {/* Message count */}
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        {messages.length} message{messages.length !== 1 ? 's' : ''}
                    </div>
                </div>
            </div>

            {/* Messages Container */}
            <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50/30 to-white/30 dark:from-gray-900/30 dark:to-gray-800/30"
                style={{ minHeight: 0, maxHeight: '100%' }}
            >
                {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <div className="text-4xl mb-2">💬</div>
                            <p className="text-gray-600 dark:text-gray-400">No messages yet</p>
                            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                                Start a conversation with {otherParticipant.name}
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        {messages.map((message, index) => {
                            const senderInfo = getSenderInfo(message);
                            const isOwn = isOwnMessage(message);

                            return (
                                <MessageBubble
                                    key={message.id}
                                    message={{
                                        ...message,
                                        senderName: senderInfo.name,
                                        senderImage: senderInfo.image || undefined
                                    }}
                                    isOwn={isOwn}
                                    showSenderInfo={true}
                                />
                            );
                        })}

                        {/* Typing indicator */}
                        {typing && (
                            <div className="flex justify-start">
                                <div className="bg-gray-200 dark:bg-gray-700 rounded-lg px-4 py-2">
                                    <div className="flex space-x-1">
                                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Message Input */}
            <MessageInput
                bookingId={bookingId}
                onSendMessage={handleSendMessage}
                placeholder={`Message ${otherParticipant.name}...`}
            />

            {/* Platform Safety Notice */}
            <div className="px-4 py-2 bg-blue-50/50 dark:bg-blue-900/20 border-t border-blue-200/50 dark:border-blue-800/50">
                <p className="text-xs text-blue-700 dark:text-blue-300 text-center">
                    🛡️ Keep conversations on-platform for your protection. We monitor messages for safety and security.
                </p>
            </div>

            {/* Call Modal */}
            {isVideoCallOpen && (
                <CallModal
                    isOpen={isVideoCallOpen}
                    onClose={() => setIsVideoCallOpen(false)}
                    roomName={generateRoomName()}
                    displayName={user?.name || 'User'}
                    participantName={otherParticipant.name}
                    callType={booking?.bookingType === 'PHONE_CALL' ? 'PHONE_CALL' : 'VIDEO_CALL'}
                />
            )}
        </div>
    );
} 