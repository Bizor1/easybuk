'use client'

import React from 'react';
import Image from 'next/image';
import { DocumentIcon, ArrowDownTrayIcon, PhotoIcon } from '@heroicons/react/24/outline';

export interface MessageAttachment {
    fileName: string;
    fileSize: number;
    mimeType: string;
    url: string;
    isImage: boolean;
    cloudinaryId: string;
    // Video call invitation properties
    isVideoCallInvitation?: boolean;
    buttonText?: string;
    type?: string;
    name?: string;
}

export interface Message {
    id: string;
    content: string;
    senderId: string;
    senderType: 'CLIENT' | 'PROVIDER' | 'SYSTEM';
    messageType: 'TEXT' | 'IMAGE' | 'DOCUMENT' | 'SYSTEM';
    attachments?: MessageAttachment[];
    isRead: boolean;
    flagged?: boolean;
    createdAt: string;
    senderName?: string;
    senderImage?: string;
}

interface MessageBubbleProps {
    message: Message;
    isOwn: boolean;
    showSenderInfo?: boolean;
    className?: string;
}

export default function MessageBubble({
    message,
    isOwn,
    showSenderInfo = true,
    className = ''
}: MessageBubbleProps) {
    const [downloadingFiles, setDownloadingFiles] = React.useState<Set<string>>(new Set());

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatTime = (timestamp: string): string => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

        if (diffInHours < 24) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else {
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
    };

    const downloadFile = async (url: string, fileName: string) => {
        const fileKey = `${url}-${fileName}`;

        try {
            // Set loading state
            setDownloadingFiles(prev => new Set([...Array.from(prev), fileKey]));

            // For Cloudinary URLs, we need to fetch the file and create a blob
            // to ensure the correct filename is preserved
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Failed to fetch file');
            }

            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = fileName; // This ensures the original filename is used
            link.style.display = 'none';

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Clean up the blob URL
            window.URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            console.error('Download failed:', error);
            // Fallback to direct link if fetch fails
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } finally {
            // Remove loading state
            setDownloadingFiles(prev => {
                const newSet = new Set(prev);
                newSet.delete(fileKey);
                return newSet;
            });
        }
    };

    // System messages
    if (message.senderType === 'SYSTEM') {
        return (
            <div className={`flex justify-center my-4 ${className}`}>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg px-4 py-2 max-w-md">
                    <p className="text-sm text-blue-700 dark:text-blue-300 text-center">
                        {message.content}
                    </p>
                    <p className="text-xs text-blue-500 dark:text-blue-400 text-center mt-1">
                        {formatTime(message.createdAt)}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4 ${className}`}>
            <div className={`flex ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2 max-w-xs lg:max-w-md`}>

                {/* Avatar */}
                {!isOwn && showSenderInfo && (
                    <div className="flex-shrink-0">
                        {message.senderImage ? (
                            <Image
                                src={message.senderImage}
                                alt={message.senderName || 'User'}
                                width={32}
                                height={32}
                                className="rounded-full"
                            />
                        ) : (
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-medium">
                                    {(message.senderName || 'U')[0].toUpperCase()}
                                </span>
                            </div>
                        )}
                    </div>
                )}

                {/* Message Content */}
                <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>

                    {/* Sender Name */}
                    {!isOwn && showSenderInfo && message.senderName && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 px-1">
                            {message.senderName}
                        </p>
                    )}

                    {/* Message Bubble */}
                    <div
                        className={`rounded-lg px-4 py-3 transition-all duration-300 transform hover:scale-105 ${isOwn
                            ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg'
                            : 'bg-gradient-to-r from-gray-100/80 to-gray-200/80 dark:from-gray-700/50 dark:to-gray-600/50 text-gray-900 dark:text-white backdrop-blur-sm border border-white/20 dark:border-gray-700/20'
                            }`}
                    >

                        {/* Text Content */}
                        {message.content && (
                            <div className="mb-2 last:mb-0">
                                <p className="text-sm whitespace-pre-wrap break-words">
                                    {message.content}
                                </p>

                                {/* Flagged Content Warning */}
                                {message.flagged && (
                                    <div className="mt-2 text-xs opacity-75">
                                        ⚠️ Content filtered for safety
                                    </div>
                                )}
                            </div>
                        )}

                        {/* File Attachments */}
                        {message.attachments && message.attachments.length > 0 && (
                            <div className="space-y-2">
                                {message.attachments.map((attachment, index) => (
                                    <div key={index} className="border-t border-white/20 pt-2 first:border-t-0 first:pt-0">

                                        {/* Video Call Invitation */}
                                        {attachment.isVideoCallInvitation ? (
                                            <div className="flex flex-col space-y-2">
                                                <button
                                                    onClick={() => window.open(attachment.url, '_blank')}
                                                    className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 ${attachment.type === 'VIDEO_CALL'
                                                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg'
                                                        : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg'
                                                        }`}
                                                >
                                                    {attachment.type === 'VIDEO_CALL' ? (
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 002 2v8a2 2 0 002 2z" />
                                                        </svg>
                                                    ) : (
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                        </svg>
                                                    )}
                                                    <span>{attachment.buttonText || 'Join Call'}</span>
                                                </button>
                                                <p className="text-xs opacity-75 text-center">
                                                    Click to join the {attachment.type === 'VIDEO_CALL' ? 'video' : 'audio'} call
                                                </p>
                                            </div>
                                        ) : (
                                            <>
                                                {/* Image Attachments */}
                                                {attachment.isImage ? (
                                                    <div className="relative group">
                                                        <Image
                                                            src={attachment.url}
                                                            alt={attachment.fileName}
                                                            width={200}
                                                            height={150}
                                                            className="rounded-lg object-cover cursor-pointer"
                                                            onClick={() => window.open(attachment.url, '_blank')}
                                                        />
                                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                                            <PhotoIcon className="w-8 h-8 text-white" />
                                                        </div>
                                                        <p className="text-xs mt-1 opacity-75">
                                                            {attachment.fileName} • {formatFileSize(attachment.fileSize)}
                                                        </p>
                                                    </div>
                                                ) : (

                                                    /* Document Attachments */
                                                    <div
                                                        className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${isOwn
                                                            ? 'bg-white/20 hover:bg-white/30'
                                                            : 'bg-gray-200/50 dark:bg-gray-600/50 hover:bg-gray-300/50 dark:hover:bg-gray-500/50'
                                                            }`}
                                                        onClick={async () => {
                                                            if (attachment.url.includes('/api/files/placeholder')) {
                                                                // Handle placeholder files
                                                                alert('File temporarily unavailable due to upload issues. Please try again later.');
                                                            } else {
                                                                await downloadFile(attachment.url, attachment.fileName);
                                                            }
                                                        }}
                                                    >
                                                        <div className={`p-2 rounded ${isOwn ? 'bg-white/20' : 'bg-blue-100 dark:bg-blue-900/30'
                                                            }`}>
                                                            <DocumentIcon className={`w-5 h-5 ${isOwn ? 'text-white' : 'text-blue-600 dark:text-blue-400'
                                                                }`} />
                                                        </div>

                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium truncate">
                                                                {attachment.fileName}
                                                                {attachment.url.includes('/api/files/placeholder') && (
                                                                    <span className="ml-2 text-xs bg-yellow-500 text-white px-2 py-1 rounded">
                                                                        Upload Failed
                                                                    </span>
                                                                )}
                                                                {downloadingFiles.has(`${attachment.url}-${attachment.fileName}`) && (
                                                                    <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-1 rounded">
                                                                        Downloading...
                                                                    </span>
                                                                )}
                                                            </p>
                                                            <p className="text-xs opacity-75">
                                                                {formatFileSize(attachment.fileSize)}
                                                                {attachment.url.includes('/api/files/placeholder') && (
                                                                    <span className="ml-2 text-yellow-600 dark:text-yellow-400">
                                                                        • Retry needed
                                                                    </span>
                                                                )}
                                                            </p>
                                                        </div>

                                                        {downloadingFiles.has(`${attachment.url}-${attachment.fileName}`) ? (
                                                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                                        ) : (
                                                            <ArrowDownTrayIcon className={`w-4 h-4 ${isOwn ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'
                                                                }`} />
                                                        )}
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Timestamp and Read Status */}
                    <div className={`flex items-center space-x-1 mt-1 px-1 ${isOwn ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
                        <p className={`text-xs ${isOwn
                            ? 'text-blue-100'
                            : 'text-gray-500 dark:text-gray-400'
                            }`}>
                            {formatTime(message.createdAt)}
                        </p>

                        {isOwn && (
                            <div className="flex items-center space-x-1">
                                {message.isRead ? (
                                    <div className="text-blue-100 text-xs">✓✓</div>
                                ) : (
                                    <div className="text-blue-200 text-xs">✓</div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
} 