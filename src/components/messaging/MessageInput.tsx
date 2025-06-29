'use client'

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { PaperAirplaneIcon, PaperClipIcon, PhotoIcon, DocumentIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface FilePreview {
    file: File;
    url: string;
    type: 'image' | 'document';
}

interface MessageInputProps {
    bookingId: string;
    onSendMessage: (content: string, attachments?: any[]) => Promise<void>;
    disabled?: boolean;
    placeholder?: string;
}

export default function MessageInput({
    bookingId,
    onSendMessage,
    disabled = false,
    placeholder = "Type a message..."
}: MessageInputProps) {
    const [message, setMessage] = useState('');
    const [files, setFiles] = useState<FilePreview[]>([]);
    const [uploading, setUploading] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [warning, setWarning] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(event.target.files || []);

        selectedFiles.forEach(file => {
            // Validate file size (10MB max)
            if (file.size > 10 * 1024 * 1024) {
                setError(`File "${file.name}" is too large. Maximum size is 10MB.`);
                return;
            }

            // Validate file type
            const allowedTypes = [
                'image/jpeg', 'image/png', 'image/gif', 'image/webp',
                'application/pdf', 'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'text/plain'
            ];

            if (!allowedTypes.includes(file.type)) {
                setError(`File type "${file.type}" is not allowed. Supported: Images (JPG, PNG, GIF, WebP) and Documents (PDF, DOC, DOCX, TXT)`);
                return;
            }

            // Create preview
            const url = URL.createObjectURL(file);
            const type = file.type.startsWith('image/') ? 'image' : 'document';

            setFiles(prev => [...prev, { file, url, type }]);
        });

        // Clear input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const removeFile = (index: number) => {
        setFiles(prev => {
            const newFiles = [...prev];
            URL.revokeObjectURL(newFiles[index].url);
            newFiles.splice(index, 1);
            return newFiles;
        });
    };

    const uploadFiles = async (): Promise<any[]> => {
        if (files.length === 0) return [];

        setUploading(true);
        const uploadedFiles: any[] = [];

        try {
            for (const filePreview of files) {
                const formData = new FormData();
                formData.append('file', filePreview.file);
                formData.append('bookingId', bookingId);
                formData.append('messageType', filePreview.type === 'image' ? 'IMAGE' : 'DOCUMENT');

                const response = await fetch('/api/messages/upload', {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to upload file');
                }

                const result = await response.json();
                uploadedFiles.push(result.file);
            }

            return uploadedFiles;
        } finally {
            setUploading(false);
        }
    };

    const handleSend = async () => {
        if ((!message.trim() && files.length === 0) || sending) return;

        setSending(true);
        setError(null);
        setWarning(null);

        try {
            // Upload files first
            const uploadedFiles = await uploadFiles();

            // Send message
            if (message.trim() || uploadedFiles.length > 0) {
                await onSendMessage(
                    message.trim() || (uploadedFiles.length > 0 ? `Sent ${uploadedFiles.length} file(s)` : ''),
                    uploadedFiles
                );

                // Clear input
                setMessage('');
                setFiles([]);
            }
        } catch (error: any) {
            console.error('Error sending message:', error);

            if (error.message.includes('blocked')) {
                setWarning(error.message);
            } else {
                setError(error.message || 'Failed to send message');
            }
        } finally {
            setSending(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="border-t border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            {/* Error/Warning Messages */}
            {error && (
                <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500">
                    <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                    <button
                        onClick={() => setError(null)}
                        className="text-red-500 hover:text-red-700 float-right"
                    >
                        <XMarkIcon className="w-4 h-4" />
                    </button>
                </div>
            )}

            {warning && (
                <div className="px-4 py-2 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500">
                    <p className="text-sm text-yellow-700 dark:text-yellow-400">{warning}</p>
                    <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-1">
                        💡 Keep conversations on-platform for your protection and security.
                    </p>
                    <button
                        onClick={() => setWarning(null)}
                        className="text-yellow-500 hover:text-yellow-700 float-right"
                    >
                        <XMarkIcon className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* File Previews */}
            {files.length > 0 && (
                <div className="px-4 py-2 border-b border-gray-200/50 dark:border-gray-700/50">
                    <div className="flex flex-wrap gap-2">
                        {files.map((filePreview, index) => (
                            <div key={index} className="relative group">
                                <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-2 pr-8">
                                    {filePreview.type === 'image' ? (
                                        <div className="relative">
                                            <Image
                                                src={filePreview.url}
                                                alt={filePreview.file.name}
                                                width={48}
                                                height={48}
                                                className="w-12 h-12 object-cover rounded"
                                                unoptimized
                                            />
                                            <PhotoIcon className="w-4 h-4 text-blue-500 absolute -top-1 -right-1 bg-white rounded-full p-0.5" />
                                        </div>
                                    ) : (
                                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded flex items-center justify-center">
                                            <DocumentIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                        </div>
                                    )}

                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                            {filePreview.file.name}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {formatFileSize(filePreview.file.size)}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => removeFile(index)}
                                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                >
                                    <XMarkIcon className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Input Area */}
            <div className="p-4">
                <div className="flex items-end space-x-3">
                    {/* File Upload Button */}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={disabled || uploading || sending}
                        className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors disabled:opacity-50"
                        title="Attach files"
                    >
                        <PaperClipIcon className="w-5 h-5" />
                    </button>

                    {/* Message Input */}
                    <div className="flex-1">
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder={placeholder}
                            disabled={disabled || sending}
                            rows={1}
                            className="w-full px-4 py-3 bg-gray-50/80 dark:bg-gray-700/50 border border-gray-200/50 dark:border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none disabled:opacity-50"
                            style={{ minHeight: '44px', maxHeight: '120px' }}
                        />
                    </div>

                    {/* Send Button */}
                    <button
                        onClick={handleSend}
                        disabled={disabled || (!message.trim() && files.length === 0) || sending || uploading}
                        className="p-3 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-lg transition-all duration-300 transform hover:scale-105 disabled:transform-none shadow-lg disabled:opacity-50"
                    >
                        {sending || uploading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                            <PaperAirplaneIcon className="w-5 h-5" />
                        )}
                    </button>
                </div>

                {/* Upload Status */}
                {uploading && (
                    <div className="mt-2 text-sm text-blue-600 dark:text-blue-400">
                        Uploading files...
                    </div>
                )}
            </div>

            {/* Hidden File Input */}
            <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx,.txt"
                onChange={handleFileSelect}
                className="hidden"
            />
        </div>
    );
} 