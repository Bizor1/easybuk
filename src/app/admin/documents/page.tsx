'use client'

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface DocumentSubmission {
    id: string;
    verificationStatus: string;
    submittedAt: string;
    verifiedAt?: string;
    user: {
        id: string;
        name: string;
        email: string;
        phone?: string;
        createdAt: string;
    };
    documents: {
        type: string;
        idDocument: any;
        selfiePhoto?: string;
        certificates: string[];
        hasCertificates: boolean;
    };
    providerInfo: {
        category: string;
        specializations: string[];
        businessName?: string;
        city?: string;
        bio?: string;
    };
}

export default function AdminDocumentsPage() {
    const [documents, setDocuments] = useState<DocumentSubmission[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedStatus, setSelectedStatus] = useState('PENDING');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedDocument, setSelectedDocument] = useState<DocumentSubmission | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

    const fetchDocuments = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/admin/documents?status=${selectedStatus}&page=${currentPage}&limit=10`);

            if (response.ok) {
                const data = await response.json();
                setDocuments(data.documents);
                setTotalPages(data.pagination.pages);
            } else {
                console.error('Failed to fetch documents');
            }
        } catch (error) {
            console.error('Error fetching documents:', error);
        } finally {
            setLoading(false);
        }
    }, [selectedStatus, currentPage]);

    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

    const handleViewDocument = async (submission: DocumentSubmission) => {
        try {
            const response = await fetch(`/api/admin/documents/${submission.id}`);
            if (response.ok) {
                const data = await response.json();
                setSelectedDocument(data.provider);
                setShowModal(true);
            }
        } catch (error) {
            console.error('Error fetching document details:', error);
        }
    };

    const handleApproveReject = async (action: 'approve' | 'reject') => {
        if (!selectedDocument) return;

        try {
            setActionLoading(true);
            const response = await fetch(`/api/admin/documents/${selectedDocument.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action,
                    reason: action === 'reject' ? rejectReason : undefined
                }),
            });

            if (response.ok) {
                const data = await response.json();
                alert(`Provider verification ${action}d successfully!`);
                setShowModal(false);
                setSelectedDocument(null);
                setRejectReason('');
                fetchDocuments(); // Refresh the list
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.error}`);
            }
        } catch (error) {
            console.error('Error updating verification:', error);
            alert('Error updating verification status');
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            PENDING: 'bg-yellow-100 text-yellow-800',
            VERIFIED: 'bg-green-100 text-green-800',
            REJECTED: 'bg-red-100 text-red-800'
        };
        return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="py-6">
                        <h1 className="text-3xl font-bold text-gray-900">Document Verification</h1>
                        <p className="mt-2 text-gray-600">Review and manage provider document submissions</p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Filter Tabs */}
                <div className="mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8">
                            {['PENDING', 'VERIFIED', 'REJECTED'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => {
                                        setSelectedStatus(status);
                                        setCurrentPage(1);
                                    }}
                                    className={`py-2 px-1 border-b-2 font-medium text-sm ${selectedStatus === status
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    {status}
                                    {documents.length > 0 && selectedStatus === status && (
                                        <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                                            {documents.length}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Documents List */}
                <div className="bg-white shadow rounded-lg">
                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <p className="mt-2 text-gray-600">Loading documents...</p>
                        </div>
                    ) : documents.length === 0 ? (
                        <div className="p-8 text-center">
                            <div className="text-gray-400 text-lg">📄</div>
                            <p className="mt-2 text-gray-600">No documents found for {selectedStatus.toLowerCase()} status</p>
                        </div>
                    ) : (
                        <div className="overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Provider
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Documents
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Category
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Submitted
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {documents.map((submission) => (
                                        <tr key={submission.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                                        <span className="text-sm font-medium text-gray-700">
                                                            {submission.user.name?.charAt(0) || 'U'}
                                                        </span>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {submission.user.name}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {submission.user.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex space-x-2">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${submission.documents.type === 'national_id' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                                                        }`}>
                                                        {submission.documents.type === 'national_id' ? '🆔 National ID' : '📔 Passport'}
                                                    </span>
                                                    {submission.documents.hasCertificates && (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                            📜 {submission.documents.certificates.length} Cert(s)
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {submission.providerInfo.category.replace('_', ' ')}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {submission.providerInfo.city || 'Location not set'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatDate(submission.submittedAt)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(submission.verificationStatus)}`}>
                                                    {submission.verificationStatus}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={() => handleViewDocument(submission)}
                                                    className="text-blue-600 hover:text-blue-900 mr-4"
                                                >
                                                    View Documents
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                            <div className="flex-1 flex justify-between sm:hidden">
                                <button
                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Page <span className="font-medium">{currentPage}</span> of{' '}
                                        <span className="font-medium">{totalPages}</span>
                                    </p>
                                </div>
                                <div>
                                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                        <button
                                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                            disabled={currentPage === 1}
                                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            Previous
                                        </button>
                                        <button
                                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                            disabled={currentPage === totalPages}
                                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            Next
                                        </button>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Document Review Modal */}
            {showModal && selectedDocument && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Document Review - {selectedDocument.user?.name}
                                </h3>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <span className="sr-only">Close</span>
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Provider Info */}
                            <div className="bg-gray-50 p-4 rounded-lg mb-6">
                                <h4 className="font-medium text-gray-900 mb-2">Provider Information</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="font-medium">Name:</span> {selectedDocument.user?.name}
                                    </div>
                                    <div>
                                        <span className="font-medium">Email:</span> {selectedDocument.user?.email}
                                    </div>
                                    <div>
                                        <span className="font-medium">Phone:</span> {selectedDocument.user?.phone || 'Not provided'}
                                    </div>
                                    <div>
                                        <span className="font-medium">Category:</span> {selectedDocument.providerInfo?.category?.replace('_', ' ')}
                                    </div>
                                    <div>
                                        <span className="font-medium">City:</span> {selectedDocument.providerInfo?.city || 'Not provided'}
                                    </div>
                                    <div>
                                        <span className="font-medium">Registered:</span> {selectedDocument.user?.createdAt ? formatDate(selectedDocument.user.createdAt) : 'Unknown'}
                                    </div>
                                </div>
                            </div>

                            {/* Documents */}
                            <div className="space-y-6">
                                {/* ID Document */}
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-3">
                                        {selectedDocument.documents?.type === 'national_id' ? 'National ID' : 'Passport'}
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {selectedDocument.documents?.type === 'national_id' ? (
                                            <>
                                                {selectedDocument.documents.idDocument?.front && (
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-700 mb-2">Front</p>
                                                        <Image
                                                            src={selectedDocument.documents.idDocument.front}
                                                            alt="ID Front"
                                                            width={300}
                                                            height={200}
                                                            className="border rounded-lg object-cover"
                                                        />
                                                    </div>
                                                )}
                                                {selectedDocument.documents.idDocument?.back && (
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-700 mb-2">Back</p>
                                                        <Image
                                                            src={selectedDocument.documents.idDocument.back}
                                                            alt="ID Back"
                                                            width={300}
                                                            height={200}
                                                            className="border rounded-lg object-cover"
                                                        />
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            selectedDocument.documents?.idDocument?.url && (
                                                <div>
                                                    <p className="text-sm font-medium text-gray-700 mb-2">Passport</p>
                                                    <Image
                                                        src={selectedDocument.documents.idDocument.url}
                                                        alt="Passport"
                                                        width={300}
                                                        height={200}
                                                        className="border rounded-lg object-cover"
                                                    />
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>

                                {/* Selfie */}
                                {selectedDocument.documents?.selfiePhoto && (
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-3">Verification Selfie</h4>
                                        <Image
                                            src={selectedDocument.documents.selfiePhoto}
                                            alt="Verification Selfie"
                                            width={300}
                                            height={200}
                                            className="border rounded-lg object-cover"
                                        />
                                    </div>
                                )}

                                {/* Certificates */}
                                {selectedDocument.documents?.hasCertificates && (
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-3">
                                            Professional Certificates ({selectedDocument.documents.certificates.length})
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {selectedDocument.documents.certificates.map((cert, index) => (
                                                <div key={index}>
                                                    <p className="text-sm font-medium text-gray-700 mb-2">Certificate {index + 1}</p>
                                                    <Image
                                                        src={cert}
                                                        alt={`Certificate ${index + 1}`}
                                                        width={300}
                                                        height={200}
                                                        className="border rounded-lg object-cover"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            {selectedDocument.verificationStatus === 'PENDING' && (
                                <div className="mt-8 border-t pt-6">
                                    <div className="space-y-4">
                                        {/* Reject Reason */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Rejection Reason (optional)
                                            </label>
                                            <textarea
                                                value={rejectReason}
                                                onChange={(e) => setRejectReason(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                                rows={3}
                                                placeholder="Provide a reason if rejecting..."
                                            />
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex space-x-4">
                                            <button
                                                onClick={() => handleApproveReject('approve')}
                                                disabled={actionLoading}
                                                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
                                            >
                                                {actionLoading ? 'Processing...' : '✅ Approve'}
                                            </button>
                                            <button
                                                onClick={() => handleApproveReject('reject')}
                                                disabled={actionLoading}
                                                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50"
                                            >
                                                {actionLoading ? 'Processing...' : '❌ Reject'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {selectedDocument.verificationStatus !== 'PENDING' && (
                                <div className="mt-8 border-t pt-6">
                                    <div className={`p-4 rounded-lg ${selectedDocument.verificationStatus === 'VERIFIED'
                                        ? 'bg-green-50 text-green-800'
                                        : 'bg-red-50 text-red-800'
                                        }`}>
                                        <p className="font-medium">
                                            This verification has been {selectedDocument.verificationStatus.toLowerCase()}.
                                        </p>
                                        {selectedDocument.verifiedAt && (
                                            <p className="text-sm mt-1">
                                                Reviewed on: {formatDate(selectedDocument.verifiedAt)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 