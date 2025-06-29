'use client';

import { useState } from 'react';
import {
    DocumentCheckIcon,
    IdentificationIcon,
    BuildingOfficeIcon,
    AcademicCapIcon,
    PhotoIcon,
    CheckCircleIcon,
    ClockIcon,
    XCircleIcon,
    InformationCircleIcon
} from '@heroicons/react/24/outline';
import FileUpload, { UploadedFile } from '../../../../components/FileUpload';

interface VerificationData {
    personalInfo: {
        fullName: string;
        dateOfBirth: string;
        address: string;
        phone: string;
        idNumber: string;
        idType: 'drivers_license' | 'passport' | 'national_id';
    };
    businessInfo: {
        businessName: string;
        businessType: 'individual' | 'company' | 'partnership';
        businessRegistrationNumber: string;
        taxId: string;
        businessAddress: string;
        businessPhone: string;
        website?: string;
    };
    documents: {
        idDocument: UploadedFile[];
        businessLicense: UploadedFile[];
        certifications: UploadedFile[];
        portfolio: UploadedFile[];
    };
    verificationStatus: {
        identity: 'pending' | 'verified' | 'rejected';
        business: 'pending' | 'verified' | 'rejected';
        background: 'pending' | 'verified' | 'rejected';
        overall: 'pending' | 'verified' | 'rejected';
    };
}

export default function ProviderVerification() {
    const [activeStep, setActiveStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [verificationData, setVerificationData] = useState<VerificationData>({
        personalInfo: {
            fullName: '',
            dateOfBirth: '',
            address: '',
            phone: '',
            idNumber: '',
            idType: 'drivers_license'
        },
        businessInfo: {
            businessName: '',
            businessType: 'individual',
            businessRegistrationNumber: '',
            taxId: '',
            businessAddress: '',
            businessPhone: '',
            website: ''
        },
        documents: {
            idDocument: [],
            businessLicense: [],
            certifications: [],
            portfolio: []
        },
        verificationStatus: {
            identity: 'pending',
            business: 'pending',
            background: 'pending',
            overall: 'pending'
        }
    });

    const steps = [
        {
            id: 1,
            title: 'Personal Information',
            description: 'Verify your identity',
            icon: IdentificationIcon
        },
        {
            id: 2,
            title: 'Business Information',
            description: 'Business details and registration',
            icon: BuildingOfficeIcon
        },
        {
            id: 3,
            title: 'Document Upload',
            description: 'Upload required documents',
            icon: DocumentCheckIcon
        },
        {
            id: 4,
            title: 'Portfolio & Certifications',
            description: 'Showcase your work and credentials',
            icon: AcademicCapIcon
        }
    ];

    const handlePersonalInfoChange = (field: string, value: string) => {
        setVerificationData(prev => ({
            ...prev,
            personalInfo: {
                ...prev.personalInfo,
                [field]: value
            }
        }));
    };

    const handleBusinessInfoChange = (field: string, value: string) => {
        setVerificationData(prev => ({
            ...prev,
            businessInfo: {
                ...prev.businessInfo,
                [field]: value
            }
        }));
    };

    const handleDocumentUpload = (documentType: keyof VerificationData['documents'], files: UploadedFile[]) => {
        setVerificationData(prev => ({
            ...prev,
            documents: {
                ...prev.documents,
                [documentType]: files
            }
        }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/provider/verification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(verificationData),
            });

            if (response.ok) {
                // Show success message and redirect
                alert('Verification submitted successfully! We will review your application within 24-48 hours.');
            } else {
                throw new Error('Submission failed');
            }
        } catch (error) {
            alert('Failed to submit verification. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'verified':
                return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
            case 'rejected':
                return <XCircleIcon className="h-5 w-5 text-red-500" />;
            default:
                return <ClockIcon className="h-5 w-5 text-yellow-500" />;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'verified':
                return 'Verified';
            case 'rejected':
                return 'Rejected';
            default:
                return 'Pending Review';
        }
    };

    const renderPersonalInfoStep = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name *
                        </label>
                        <input
                            type="text"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                            value={verificationData.personalInfo.fullName}
                            onChange={(e) => handlePersonalInfoChange('fullName', e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Date of Birth *
                        </label>
                        <input
                            type="date"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                            value={verificationData.personalInfo.dateOfBirth}
                            onChange={(e) => handlePersonalInfoChange('dateOfBirth', e.target.value)}
                            required
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Address *
                        </label>
                        <textarea
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                            rows={3}
                            value={verificationData.personalInfo.address}
                            onChange={(e) => handlePersonalInfoChange('address', e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number *
                        </label>
                        <input
                            type="tel"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                            value={verificationData.personalInfo.phone}
                            onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            ID Type *
                        </label>
                        <select
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                            value={verificationData.personalInfo.idType}
                            onChange={(e) => handlePersonalInfoChange('idType', e.target.value)}
                            required
                        >
                            <option value="drivers_license">Driver&apos;s License</option>
                            <option value="passport">Passport</option>
                            <option value="national_id">National ID</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            ID Number *
                        </label>
                        <input
                            type="text"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                            value={verificationData.personalInfo.idNumber}
                            onChange={(e) => handlePersonalInfoChange('idNumber', e.target.value)}
                            required
                        />
                    </div>
                </div>
            </div>
        </div>
    );

    const renderBusinessInfoStep = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Business Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Business Name *
                        </label>
                        <input
                            type="text"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                            value={verificationData.businessInfo.businessName}
                            onChange={(e) => handleBusinessInfoChange('businessName', e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Business Type *
                        </label>
                        <select
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                            value={verificationData.businessInfo.businessType}
                            onChange={(e) => handleBusinessInfoChange('businessType', e.target.value)}
                            required
                        >
                            <option value="individual">Individual/Sole Proprietor</option>
                            <option value="company">Company/Corporation</option>
                            <option value="partnership">Partnership</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Business Registration Number
                        </label>
                        <input
                            type="text"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                            value={verificationData.businessInfo.businessRegistrationNumber}
                            onChange={(e) => handleBusinessInfoChange('businessRegistrationNumber', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tax ID/EIN
                        </label>
                        <input
                            type="text"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                            value={verificationData.businessInfo.taxId}
                            onChange={(e) => handleBusinessInfoChange('taxId', e.target.value)}
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Business Address *
                        </label>
                        <textarea
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                            rows={3}
                            value={verificationData.businessInfo.businessAddress}
                            onChange={(e) => handleBusinessInfoChange('businessAddress', e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Business Phone *
                        </label>
                        <input
                            type="tel"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                            value={verificationData.businessInfo.businessPhone}
                            onChange={(e) => handleBusinessInfoChange('businessPhone', e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Website (Optional)
                        </label>
                        <input
                            type="url"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                            value={verificationData.businessInfo.website}
                            onChange={(e) => handleBusinessInfoChange('website', e.target.value)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );

    const renderDocumentUploadStep = () => (
        <div className="space-y-8">
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Required Documents</h3>

                <div className="space-y-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-start">
                            <InformationCircleIcon className="h-5 w-5 text-blue-500 mt-0.5 mr-3" />
                            <div>
                                <p className="text-sm font-medium text-blue-900">Document Requirements</p>
                                <p className="text-sm text-blue-700 mt-1">
                                    Please upload clear, high-quality images or scans of your documents.
                                    Supported formats: JPG, PNG, PDF. Maximum file size: 10MB per file.
                                </p>
                            </div>
                        </div>
                    </div>

                    <FileUpload
                        label="Government-Issued ID *"
                        description="Upload a clear photo of your driver&apos;s license, passport, or national ID"
                        uploadType="document"
                        maxFiles={2}
                        required
                        onUpload={(files) => handleDocumentUpload('idDocument', files)}
                        existingFiles={verificationData.documents.idDocument}
                    />

                    <FileUpload
                        label="Business License/Registration"
                        description="Upload your business license, registration certificate, or permits"
                        uploadType="document"
                        maxFiles={3}
                        onUpload={(files) => handleDocumentUpload('businessLicense', files)}
                        existingFiles={verificationData.documents.businessLicense}
                    />
                </div>
            </div>
        </div>
    );

    const renderPortfolioStep = () => (
        <div className="space-y-8">
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Portfolio & Certifications</h3>

                <div className="space-y-6">
                    <FileUpload
                        label="Professional Certifications"
                        description="Upload certificates, licenses, or training credentials relevant to your services"
                        uploadType="document"
                        maxFiles={5}
                        onUpload={(files) => handleDocumentUpload('certifications', files)}
                        existingFiles={verificationData.documents.certifications}
                    />

                    <FileUpload
                        label="Portfolio Images"
                        description="Upload images showcasing your previous work and expertise"
                        uploadType="image"
                        maxFiles={10}
                        onUpload={(files) => handleDocumentUpload('portfolio', files)}
                        existingFiles={verificationData.documents.portfolio}
                    />
                </div>
            </div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Provider Verification</h1>
                <p className="text-gray-600 mt-2">
                    Complete your verification to start accepting bookings on EasyBuk
                </p>
            </div>

            {/* Verification Status Overview */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Verification Status</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                            <p className="text-sm font-medium text-gray-700">Identity</p>
                            <p className="text-xs text-gray-500">{getStatusText(verificationData.verificationStatus.identity)}</p>
                        </div>
                        {getStatusIcon(verificationData.verificationStatus.identity)}
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                            <p className="text-sm font-medium text-gray-700">Business</p>
                            <p className="text-xs text-gray-500">{getStatusText(verificationData.verificationStatus.business)}</p>
                        </div>
                        {getStatusIcon(verificationData.verificationStatus.business)}
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                            <p className="text-sm font-medium text-gray-700">Background</p>
                            <p className="text-xs text-gray-500">{getStatusText(verificationData.verificationStatus.background)}</p>
                        </div>
                        {getStatusIcon(verificationData.verificationStatus.background)}
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                            <p className="text-sm font-medium text-gray-700">Overall</p>
                            <p className="text-xs text-gray-500">{getStatusText(verificationData.verificationStatus.overall)}</p>
                        </div>
                        {getStatusIcon(verificationData.verificationStatus.overall)}
                    </div>
                </div>
            </div>

            {/* Step Navigation */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
                <div className="flex items-center justify-between">
                    {steps.map((step, index) => (
                        <div key={step.id} className="flex items-center">
                            <div className="flex items-center">
                                <div className={`
                                    flex items-center justify-center w-10 h-10 rounded-full border-2 
                                    ${activeStep >= step.id
                                        ? 'bg-blue-600 border-blue-600 text-white'
                                        : 'border-gray-300 text-gray-400'
                                    }
                                `}>
                                    <step.icon className="h-5 w-5" />
                                </div>
                                <div className="ml-3">
                                    <p className={`text-sm font-medium ${activeStep >= step.id ? 'text-blue-600' : 'text-gray-400'}`}>
                                        {step.title}
                                    </p>
                                    <p className="text-xs text-gray-500">{step.description}</p>
                                </div>
                            </div>
                            {index < steps.length - 1 && (
                                <div className={`w-16 h-0.5 mx-4 ${activeStep > step.id ? 'bg-blue-600' : 'bg-gray-300'}`} />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Step Content */}
            <div className="bg-white rounded-lg shadow p-6">
                {activeStep === 1 && renderPersonalInfoStep()}
                {activeStep === 2 && renderBusinessInfoStep()}
                {activeStep === 3 && renderDocumentUploadStep()}
                {activeStep === 4 && renderPortfolioStep()}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                    <button
                        onClick={() => setActiveStep(prev => Math.max(1, prev - 1))}
                        disabled={activeStep === 1}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>

                    {activeStep < steps.length ? (
                        <button
                            onClick={() => setActiveStep(prev => Math.min(steps.length, prev + 1))}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                        >
                            Next
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50"
                        >
                            {loading ? 'Submitting...' : 'Submit for Review'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}