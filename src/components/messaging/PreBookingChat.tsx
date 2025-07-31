'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';

interface PreBookingMessage {
    id: string;
    content: string;
    senderId: string;
    senderType: 'CLIENT' | 'PROVIDER';
    senderName?: string;
    senderImage?: string;
    createdAt: string;
}

interface PreBookingChatProps {
    clientId: string;
    clientName: string;
    clientImage?: string;
    className?: string;
}

export default function PreBookingChat({
    clientId,
    clientName,
    clientImage,
    className = ''
}: PreBookingChatProps) {
    const { user } = useAuth();
    const [messages, setMessages] = useState<PreBookingMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Fetch pre-booking messages
    const fetchMessages = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/messages/pre-booking?clientId=${clientId}`);

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setMessages(data.messages);
                }
            }
        } catch (error) {
            console.error('Error fetching pre-booking messages:', error);
            setError('Failed to load messages');
        } finally {
            setLoading(false);
        }
    }, [clientId]);

    // Send message
    const handleSendMessage = async () => {
        if (!newMessage.trim() || sending) return;

        setSending(true);
        setError(null);

        try {
            const response = await fetch('/api/messages/pre-booking', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    clientId: clientId,
                    content: newMessage.trim(),
                    messageType: 'TEXT'
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Add the new message to the list
                const newMsg = {
                    ...data.message,
                    senderName: user?.name,
                    senderImage: user?.image
                };

                setMessages(prev => [...prev, newMsg]);
                setNewMessage('');
                scrollToBottom();
            } else {
                setError(data.reason || data.error || 'Failed to send message');
            }
        } catch (error) {
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

    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const isOwnMessage = (message: PreBookingMessage): boolean => {
        return message.senderType === 'PROVIDER';
    };

    return (
        <div className={`flex flex-col h-full ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Image
                            src={clientImage || '/default-avatar.svg'}
                            alt={clientName}
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-full object-cover"
                        />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{clientName}</h3>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Service Inquiry</span>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                                Pre-booking
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loading ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <p>No messages yet</p>
                    </div>
                ) : (
                    messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${isOwnMessage(message) ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${isOwnMessage(message)
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                                    }`}
                            >
                                <p className="text-sm">{message.content}</p>
                                <p className={`text-xs mt-1 ${isOwnMessage(message) ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                                    }`}>
                                    {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Restrictions Notice */}
            <div className="px-4 py-3 bg-amber-50 dark:bg-amber-900/20 border-t border-amber-200 dark:border-amber-800">
                <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div>
                        <p className="text-xs font-medium text-amber-800 dark:text-amber-200">Service Inquiry Chat</p>
                        <p className="text-xs text-amber-700 dark:text-amber-300">Text messages only. Full features unlock after booking confirmation.</p>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mx-4 mb-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                </div>
            )}

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex gap-2">
                    <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={`Reply to ${clientName}...`}
                        className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        rows={2}
                        disabled={sending}
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || sending}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors self-end"
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
        </div>
    );
} 