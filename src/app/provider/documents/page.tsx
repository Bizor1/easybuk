'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface DocumentStatus {
    verificationStatus: string;
    documentType: string | null;
    hasIdDocument: boolean;
    hasSelfiePhoto: boolean;
    hasCertificates: boolean;
    certificateCount: number;
    verifiedAt: string | null;
    submittedAt: string;
}

export default function ProviderDocuments() {
    const [documentStatus, setDocumentStatus] = useState<DocumentStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadingType, setUploadingType] = useState('');
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        fetchDocumentStatus();
    }, []);

    const fetchDocumentStatus = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/provider/documents', {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to fetch document status');
            }

            const data = await response.json();
            setDocumentStatus(data);
        } catch (error) {
            console.error('Error fetching document status:', error);
            setError('Failed to load document information');
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        setSelectedFiles(files);
        setError(null);
    };

    const handleUploadAdditionalCertificates = async () => {
        if (selectedFiles.length === 0) {
            setError('Please select at least one certificate to upload');
            return;
        }

        try {
            setUploading(true);
            setUploadingType('certificates');
            setError(null);
            setSuccess(null);

            const formData = new FormData();

            selectedFiles.forEach((file, index) => {
                formData.append(`certificate_${index}`, file);
            });

            const response = await fetch('/api/provider/documents/additional', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to upload certificates');
            }

            const result = await response.json();
            setSuccess(`Successfully uploaded ${selectedFiles.length} additional certificate(s)`);
            setSelectedFiles([]);

            // Reset file input
            const fileInput = document.getElementById('certificate-files') as HTMLInputElement;
            if (fileInput) fileInput.value = '';

            // Refresh document status
            await fetchDocumentStatus();

        } catch (error: any) {
            console.error('Error uploading certificates:', error);
            setError(error.message || 'Failed to upload certificates');
        } finally {
            setUploading(false);
            setUploadingType('');
        }
    };

    const getVerificationStatusColor = (status: string) => {
        switch (status) {
            case 'VERIFIED': return 'text-green-600 bg-green-100';
            case 'PENDING': return 'text-yellow-600 bg-yellow-100';
            case 'REJECTED': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getVerificationStatusIcon = (status: string) => {
        switch (status) {
            case 'VERIFIED': return '✅';
            case 'PENDING': return '⏳';
            case 'REJECTED': return '❌';
            default: return '📄';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 dark:from-slate-900 dark:via-gray-900 dark:to-slate-800">
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                        <p className="text-gray-600 dark:text-gray-400 text-lg">Loading document information...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 dark:from-slate-900 dark:via-gray-900 dark:to-slate-800">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="relative group mb-8">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl opacity-25 group-hover:opacity-40 blur transition-opacity"></div>
                    <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                                    📄 Document Management
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400 mt-2">
                                    View your verification documents and upload additional certificates
                                </p>
                            </div>
                            <Link
                                href="/provider/dashboard"
                                className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105"
                            >
                                ← Back to Dashboard
                            </Link>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-4 bg-green-100 border border-green-300 text-green-700 rounded-lg">
                        {success}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Current Document Status */}
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl opacity-25 group-hover:opacity-40 blur transition-opacity"></div>
                        <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-6">
                            <h2 className="text-xl font-semibold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-6">
                                Current Verification Status
                            </h2>

                            {documentStatus && (
                                <div className="space-y-4">
                                    {/* Verification Status */}
                                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <span className="text-2xl">{getVerificationStatusIcon(documentStatus.verificationStatus)}</span>
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">Verification Status</p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    Submitted on {new Date(documentStatus.submittedAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getVerificationStatusColor(documentStatus.verificationStatus)}`}>
                                            {documentStatus.verificationStatus}
                                        </span>
                                    </div>

                                    {/* ID Document */}
                                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <span className="text-2xl">🆔</span>
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">ID Document</p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {documentStatus.documentType || 'Not specified'}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${documentStatus.hasIdDocument ? 'text-green-600 bg-green-100' : 'text-gray-600 bg-gray-100'}`}>
                                            {documentStatus.hasIdDocument ? 'Uploaded' : 'Not uploaded'}
                                        </span>
                                    </div>

                                    {/* Selfie Photo */}
                                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <span className="text-2xl">🤳</span>
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">Selfie Photo</p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    Identity verification photo
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${documentStatus.hasSelfiePhoto ? 'text-green-600 bg-green-100' : 'text-gray-600 bg-gray-100'}`}>
                                            {documentStatus.hasSelfiePhoto ? 'Uploaded' : 'Not uploaded'}
                                        </span>
                                    </div>

                                    {/* Certificates */}
                                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <span className="text-2xl">📜</span>
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">Certificates</p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    Professional qualifications
                                                </p>
                                            </div>
                                        </div>
                                        <span className="px-3 py-1 rounded-full text-sm font-medium text-blue-600 bg-blue-100">
                                            {documentStatus.certificateCount} uploaded
                                        </span>
                                    </div>

                                    {documentStatus.verifiedAt && (
                                        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                            <p className="text-sm text-green-700 dark:text-green-400">
                                                ✅ Verified on {new Date(documentStatus.verifiedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Add Additional Documents */}
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl opacity-25 group-hover:opacity-40 blur transition-opacity"></div>
                        <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-6">
                            <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
                                Add Additional Certificates
                            </h2>

                            <div className="space-y-6">
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                    <div className="flex items-start space-x-3">
                                        <span className="text-blue-500 text-xl">ℹ️</span>
                                        <div>
                                            <p className="text-sm text-blue-700 dark:text-blue-400 font-medium">Important Notes:</p>
                                            <ul className="text-sm text-blue-600 dark:text-blue-400 mt-1 space-y-1">
                                                <li>• You can only add new certificates</li>
                                                <li>• Existing documents cannot be removed</li>
                                                <li>• Supported formats: PDF, JPG, PNG</li>
                                                <li>• Maximum file size: 10MB per file</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="certificate-files" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Select Certificate Files
                                    </label>
                                    <input
                                        type="file"
                                        id="certificate-files"
                                        multiple
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={handleFileSelect}
                                        disabled={uploading}
                                        className="block w-full text-sm text-gray-500 dark:text-gray-400
                                                 file:mr-4 file:py-2 file:px-4
                                                 file:rounded-lg file:border-0
                                                 file:text-sm file:font-medium
                                                 file:bg-gradient-to-r file:from-purple-500 file:to-pink-600
                                                 file:text-white file:cursor-pointer
                                                 hover:file:from-purple-600 hover:file:to-pink-700
                                                 file:transition-all file:duration-300
                                                 disabled:opacity-50 disabled:cursor-not-allowed"
                                    />
                                </div>

                                {selectedFiles.length > 0 && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Selected Files ({selectedFiles.length}):
                                        </p>
                                        <div className="space-y-2 max-h-32 overflow-y-auto">
                                            {selectedFiles.map((file, index) => (
                                                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                                                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                                                        {file.name}
                                                    </span>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={handleUploadAdditionalCertificates}
                                    disabled={uploading || selectedFiles.length === 0}
                                    className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white py-3 px-4 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
                                >
                                    {uploading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            <span>Uploading...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>📤</span>
                                            <span>Upload Certificates</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional Information */}
                <div className="mt-8">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-gray-600 to-gray-800 rounded-xl opacity-25 group-hover:opacity-40 blur transition-opacity"></div>
                        <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                Document Guidelines
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">✅ Accepted Documents</h3>
                                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                        <li>• Professional certificates</li>
                                        <li>• Educational qualifications</li>
                                        <li>• Training certificates</li>
                                        <li>• Industry licenses</li>
                                        <li>• Awards and recognitions</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">📋 Requirements</h3>
                                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                        <li>• Clear, readable documents</li>
                                        <li>• Original or certified copies</li>
                                        <li>• Current and valid certificates</li>
                                        <li>• English or with translation</li>
                                        <li>• Maximum 10MB per file</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 