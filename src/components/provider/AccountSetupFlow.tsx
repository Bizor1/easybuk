'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface SetupStep {
    id: string;
    title: string;
    description: string;
    completed: boolean;
    required: boolean;
    icon: string;
}

interface AccountSetupFlowProps {
    onComplete: () => void;
}

export default function AccountSetupFlow({ onComplete }: AccountSetupFlowProps) {
    const { user } = useAuth();
    const [currentStep, setCurrentStep] = useState<string>('email');
    const [loading, setLoading] = useState(false);
    const [setupSteps, setSetupSteps] = useState<SetupStep[]>([
        {
            id: 'email',
            title: 'Email Verification',
            description: 'Verify your email address to secure your account',
            completed: false,
            required: true,
            icon: '✉️'
        },
        {
            id: 'bank',
            title: 'Payment Details',
            description: 'Add your bank or mobile money details to receive payments',
            completed: false,
            required: true,
            icon: '💳'
        },
        {
            id: 'services',
            title: 'Service Categories',
            description: 'Select the services you offer',
            completed: false,
            required: true,
            icon: '⚡'
        },
        {
            id: 'documents',
            title: 'Document Verification',
            description: 'Upload your ID and take a photo for verification',
            completed: false,
            required: true,
            icon: '📄'
        }
    ]);

    const [paymentType, setPaymentType] = useState<'bank' | 'momo'>('momo');
    const [bankDetails, setBankDetails] = useState({
        bankName: '',
        accountNumber: '',
        accountName: '',
        branchCode: '',
        swiftCode: ''
    });
    const [momoDetails, setMomoDetails] = useState({
        network: '',
        phoneNumber: '',
        accountName: ''
    });

    const momoNetworks = [
        { id: 'MTN', name: 'MTN Mobile Money', icon: '📱', color: 'bg-yellow-500' },
        { id: 'TELECEL', name: 'Telecel Cash', icon: '📱', color: 'bg-blue-500' },
        { id: 'AIRTEL_TIGO', name: 'AirtelTigo Money', icon: '📱', color: 'bg-red-500' }
    ];

    const ghanaBanks = [
        'Ghana Commercial Bank (GCB)',
        'Ecobank Ghana',
        'Standard Chartered Bank Ghana',
        'Absa Bank Ghana',
        'Fidelity Bank Ghana',
        'CAL Bank',
        'Universal Merchant Bank (UMB)',
        'Access Bank Ghana',
        'Prudential Bank',
        'First National Bank Ghana',
        'Zenith Bank Ghana',
        'GT Bank Ghana',
        'Agricultural Development Bank (ADB)',
        'National Investment Bank (NIB)',
        'Societe Generale Ghana',
        'Stanbic Bank Ghana'
    ];

    const [selectedServices, setSelectedServices] = useState<string[]>([]);

    // Document verification states
    const [documentType, setDocumentType] = useState<'national_id' | 'passport'>('national_id');
    const [idDocumentFront, setIdDocumentFront] = useState<File | null>(null);
    const [idDocumentBack, setIdDocumentBack] = useState<File | null>(null);
    const [passportDocument, setPassportDocument] = useState<File | null>(null);
    const [certificates, setCertificates] = useState<File[]>([]);
    const [selfiePhoto, setSelfiePhoto] = useState<File | null>(null);
    const [verificationStatus, setVerificationStatus] = useState<string>('not_started');

    // Camera states
    const [showCamera, setShowCamera] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);

    const serviceCategories = [
        { id: 'HOME_SERVICES', name: 'Home Services', icon: '🏠' },
        { id: 'HEALTHCARE', name: 'Healthcare', icon: '🏥' },
        { id: 'EDUCATION', name: 'Education & Training', icon: '📚' },
        { id: 'TECHNICAL_SERVICES', name: 'Technical Services', icon: '🔧' },
        { id: 'CREATIVE_SERVICES', name: 'Creative Services', icon: '🎨' },
        { id: 'PROFESSIONAL_SERVICES', name: 'Professional Services', icon: '💼' }
    ];

    const updateStepsFromStatus = useCallback((status: any) => {
        setSetupSteps(prev => prev.map(step => ({
            ...step,
            completed: status[step.id] === 'completed'
        })));

        setVerificationStatus(status.documents || 'not_started');

        // Find first incomplete step
        const incompleteStep = setupSteps.find(step => !status[step.id] || status[step.id] !== 'completed');
        if (incompleteStep) {
            setCurrentStep(incompleteStep.id);
        }
    }, [setupSteps]);

    const fetchSetupStatus = useCallback(async () => {
        try {
            const response = await fetch('/api/provider/setup-status');
            if (response.ok) {
                const status = await response.json();
                updateStepsFromStatus(status);
            }
        } catch (error) {
            console.error('Failed to fetch setup status:', error);
        }
    }, [updateStepsFromStatus]);

    useEffect(() => {
        fetchSetupStatus();
    }, [fetchSetupStatus]);

    const handleEmailVerification = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/auth/send-verification', {
                method: 'POST'
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Email verification result:', result);

                // Show success message with verification link for demo
                const message = result.message || 'Verification email sent!';
                let alertMessage = message;

                // For demo purposes, include the verification link
                if (result.verificationLink) {
                    alertMessage += `\n\nFor demo purposes, here's your verification link:\n${result.verificationLink}`;
                }

                alert(alertMessage);

                // Show pending verification message
                const pendingDiv = document.getElementById('email-pending');
                if (pendingDiv) {
                    pendingDiv.classList.remove('hidden');
                }

                // Don't automatically advance - user needs to click email link
                // The step will be completed when they verify via email

                // Refresh status periodically to check if email gets verified
                const checkInterval = setInterval(async () => {
                    try {
                        const statusResponse = await fetch('/api/provider/setup-status');
                        if (statusResponse.ok) {
                            const status = await statusResponse.json();
                            if (status.email === 'completed') {
                                clearInterval(checkInterval);
                                setSetupSteps(prev => prev.map(step =>
                                    step.id === 'email' ? { ...step, completed: true } : step
                                ));
                                setCurrentStep('bank');
                                alert('Email verified successfully! Moving to next step.');
                            }
                        }
                    } catch (error) {
                        console.error('Status check failed:', error);
                    }
                }, 3000); // Check every 3 seconds

                // Stop checking after 5 minutes
                setTimeout(() => clearInterval(checkInterval), 300000);
            } else {
                const errorData = await response.json();
                console.error('Verification API error:', errorData);
                alert('Verification failed: ' + (errorData.error || 'Unknown error') + (errorData.details ? '\nDetails: ' + errorData.details : ''));
            }
        } catch (error) {
            console.error('Email verification failed:', error);
            alert('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentDetailsSubmit = async () => {
        // Validate based on payment type
        if (paymentType === 'bank') {
            if (!bankDetails.bankName || !bankDetails.accountNumber || !bankDetails.accountName) {
                alert('Please fill in all required bank details');
                return;
            }
        } else if (paymentType === 'momo') {
            if (!momoDetails.network || !momoDetails.phoneNumber || !momoDetails.accountName) {
                alert('Please fill in all required mobile money details');
                return;
            }
        }

        setLoading(true);
        try {
            const paymentData = {
                paymentType,
                ...(paymentType === 'bank' ? bankDetails : momoDetails)
            };

            const response = await fetch('/api/provider/bank-details', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(paymentData)
            });

            if (response.ok) {
                const result = await response.json();
                alert(result.message);
                setSetupSteps(prev => prev.map(step =>
                    step.id === 'bank' ? { ...step, completed: true } : step
                ));
                setCurrentStep('services');
            } else {
                const errorData = await response.json();
                alert('Error: ' + (errorData.error || 'Failed to save payment details'));
            }
        } catch (error) {
            console.error('Payment details submission failed:', error);
            alert('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleServicesSubmit = async () => {
        if (selectedServices.length === 0) {
            alert('Please select at least one service category');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/provider/services', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ categories: selectedServices })
            });

            if (response.ok) {
                setSetupSteps(prev => prev.map(step =>
                    step.id === 'services' ? { ...step, completed: true } : step
                ));
                setCurrentStep('documents');
            }
        } catch (error) {
            console.error('Services submission failed:', error);
        } finally {
            setLoading(false);
        }
    };

    // Check if certificates are required based on selected services
    const requiresCertificates = selectedServices.some(service =>
        service === 'PROFESSIONAL_SERVICES' || service === 'HEALTHCARE'
    );

    const handleDocumentUpload = async () => {
        // Validate based on document type
        if (documentType === 'national_id') {
            if (!idDocumentFront || !idDocumentBack) {
                alert('Please upload both front and back of your National ID');
                return;
            }
        } else if (documentType === 'passport') {
            if (!passportDocument) {
                alert('Please upload your passport document');
                return;
            }
        }

        if (!selfiePhoto) {
            alert('Please take a selfie photo');
            return;
        }

        if (requiresCertificates && certificates.length === 0) {
            alert('Please upload at least one professional certificate');
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();

            // Add ID documents based on type
            if (documentType === 'national_id' && idDocumentFront && idDocumentBack) {
                formData.append('idDocumentFront', idDocumentFront);
                formData.append('idDocumentBack', idDocumentBack);
                formData.append('documentType', 'national_id');
            } else if (documentType === 'passport' && passportDocument) {
                formData.append('passportDocument', passportDocument);
                formData.append('documentType', 'passport');
            }

            if (selfiePhoto) {
                formData.append('selfiePhoto', selfiePhoto);
            }

            // Add certificates if required
            if (requiresCertificates) {
                certificates.forEach((cert, index) => {
                    formData.append(`certificate_${index}`, cert);
                });
                formData.append('certificateCount', certificates.length.toString());
            }

            const response = await fetch('/api/provider/documents', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const result = await response.json();
                setSetupSteps(prev => prev.map(step =>
                    step.id === 'documents' ? { ...step, completed: true } : step
                ));
                setVerificationStatus('under_review');

                // Show success message and redirect to create service
                alert('Documents submitted successfully! Let\'s create your first service while we verify your documents.');
                onComplete();

                // Redirect to create service page
                setTimeout(() => {
                    window.location.href = '/provider/services/create';
                }, 1500);
            }
        } catch (error) {
            console.error('Document upload failed:', error);
        } finally {
            setLoading(false);
        }
    };

    // Camera functions
    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user' },
                audio: false
            });
            setStream(mediaStream);
            setShowCamera(true);
        } catch (error) {
            console.error('Error accessing camera:', error);
            alert('Camera access denied. Please allow camera access or upload a selfie photo.');
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setShowCamera(false);
    };

    const capturePhoto = () => {
        const video = document.getElementById('camera-video') as HTMLVideoElement;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(video, 0, 0);

        canvas.toBlob((blob) => {
            if (blob) {
                const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' });
                setSelfiePhoto(file);
                stopCamera();
            }
        }, 'image/jpeg', 0.8);
    };

    const handleCertificateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setCertificates(prev => [...prev, ...files]);
    };

    const removeCertificate = (index: number) => {
        setCertificates(prev => prev.filter((_, i) => i !== index));
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 'email':
                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <div className="text-6xl mb-4">✉️</div>
                            <h3 className="text-2xl font-bold mb-2">Verify Your Email</h3>
                            <p className="text-gray-600 mb-6">
                                We need to verify your email address: <strong>{user?.email}</strong>
                            </p>

                            {/* Show pending verification message if email was sent */}
                            <div id="email-pending" className="hidden bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                                <div className="flex items-center">
                                    <div className="text-yellow-400 mr-3">📧</div>
                                    <div>
                                        <h4 className="font-semibold text-yellow-800">Verification Email Sent!</h4>
                                        <p className="text-yellow-700 text-sm">
                                            Please check your inbox and click the verification link. We&apos;ll automatically continue once verified.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handleEmailVerification}
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 disabled:opacity-50"
                        >
                            {loading ? 'Sending...' : 'Send Verification Email'}
                        </button>
                    </div>
                );

            case 'bank':
                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <div className="text-6xl mb-4">💳</div>
                            <h3 className="text-2xl font-bold mb-2">Payment Details</h3>
                            <p className="text-gray-600 mb-6">
                                Choose how you want to receive payments
                            </p>
                        </div>

                        {/* Payment Type Selection */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <button
                                onClick={() => setPaymentType('momo')}
                                className={`p-4 border-2 rounded-lg transition-all ${paymentType === 'momo'
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-300 hover:border-gray-400'
                                    }`}
                            >
                                <div className="text-center">
                                    <div className="text-3xl mb-2">📱</div>
                                    <h4 className="font-semibold">Mobile Money</h4>
                                    <p className="text-sm text-gray-600">MTN, Telecel, AirtelTigo</p>
                                </div>
                            </button>
                            <button
                                onClick={() => setPaymentType('bank')}
                                className={`p-4 border-2 rounded-lg transition-all ${paymentType === 'bank'
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-300 hover:border-gray-400'
                                    }`}
                            >
                                <div className="text-center">
                                    <div className="text-3xl mb-2">🏦</div>
                                    <h4 className="font-semibold">Bank Account</h4>
                                    <p className="text-sm text-gray-600">Traditional banking</p>
                                </div>
                            </button>
                        </div>

                        {/* Mobile Money Form */}
                        {paymentType === 'momo' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Mobile Money Network *
                                    </label>
                                    <div className="grid grid-cols-1 gap-3">
                                        {momoNetworks.map((network) => (
                                            <button
                                                key={network.id}
                                                type="button"
                                                onClick={() => setMomoDetails(prev => ({ ...prev, network: network.id }))}
                                                className={`p-3 border-2 rounded-lg transition-all flex items-center space-x-3 ${momoDetails.network === network.id
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-300 hover:border-gray-400'
                                                    }`}
                                            >
                                                <div className={`w-8 h-8 rounded-full ${network.color} flex items-center justify-center text-white text-sm font-bold`}>
                                                    {network.id[0]}
                                                </div>
                                                <span className="font-medium">{network.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Phone Number *
                                    </label>
                                    <input
                                        type="tel"
                                        value={momoDetails.phoneNumber}
                                        onChange={(e) => setMomoDetails(prev => ({ ...prev, phoneNumber: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="+233 24 123 4567 or 024 123 4567"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Account Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={momoDetails.accountName}
                                        onChange={(e) => setMomoDetails(prev => ({ ...prev, accountName: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Full name as registered with mobile money"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Bank Account Form */}
                        {paymentType === 'bank' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Bank Name *
                                    </label>
                                    <select
                                        value={bankDetails.bankName}
                                        onChange={(e) => setBankDetails(prev => ({ ...prev, bankName: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">Select your bank</option>
                                        {ghanaBanks.map((bank) => (
                                            <option key={bank} value={bank}>{bank}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Account Number *
                                    </label>
                                    <input
                                        type="text"
                                        value={bankDetails.accountNumber}
                                        onChange={(e) => setBankDetails(prev => ({ ...prev, accountNumber: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter account number"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Account Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={bankDetails.accountName}
                                        onChange={(e) => setBankDetails(prev => ({ ...prev, accountName: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Account holder name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Branch Code
                                    </label>
                                    <input
                                        type="text"
                                        value={bankDetails.branchCode}
                                        onChange={(e) => setBankDetails(prev => ({ ...prev, branchCode: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Branch code (optional)"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        SWIFT Code
                                    </label>
                                    <input
                                        type="text"
                                        value={bankDetails.swiftCode}
                                        onChange={(e) => setBankDetails(prev => ({ ...prev, swiftCode: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="SWIFT code (optional, for international transfers)"
                                    />
                                </div>
                            </div>
                        )}

                        <button
                            onClick={handlePaymentDetailsSubmit}
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : `Save ${paymentType === 'bank' ? 'Bank' : 'Mobile Money'} Details`}
                        </button>
                    </div>
                );

            case 'services':
                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <div className="text-6xl mb-4">⚡</div>
                            <h3 className="text-2xl font-bold mb-2">Select Your Services</h3>
                            <p className="text-gray-600 mb-6">
                                Choose the service categories you want to offer
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {serviceCategories.map((category) => (
                                <div
                                    key={category.id}
                                    onClick={() => {
                                        if (selectedServices.includes(category.id)) {
                                            setSelectedServices(prev => prev.filter(id => id !== category.id));
                                        } else {
                                            setSelectedServices(prev => [...prev, category.id]);
                                        }
                                    }}
                                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedServices.includes(category.id)
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-300 hover:border-gray-400'
                                        }`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="text-2xl">{category.icon}</div>
                                        <div>
                                            <h4 className="font-semibold">{category.name}</h4>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={handleServicesSubmit}
                            disabled={loading || selectedServices.length === 0}
                            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Continue'}
                        </button>
                    </div>
                );

            case 'documents':
                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <div className="text-6xl mb-4">📄</div>
                            <h3 className="text-2xl font-bold mb-2">Document Verification</h3>
                            <p className="text-gray-600 mb-6">
                                Upload your ID documents and take a selfie for verification
                            </p>
                        </div>

                        {verificationStatus === 'under_review' && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                                <div className="flex items-center">
                                    <div className="text-yellow-400 mr-3">⏳</div>
                                    <div>
                                        <h4 className="font-semibold text-yellow-800">Under Review</h4>
                                        <p className="text-yellow-700 text-sm">
                                            Your documents are being reviewed. We&apos;ll notify you once verification is complete.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-6">
                            {/* Document Type Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Choose Document Type *
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setDocumentType('national_id')}
                                        className={`p-4 border-2 rounded-lg transition-all ${documentType === 'national_id'
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-300 hover:border-gray-400'
                                            }`}
                                    >
                                        <div className="text-center">
                                            <div className="text-3xl mb-2">🆔</div>
                                            <h4 className="font-semibold">National ID</h4>
                                            <p className="text-sm text-gray-600">Front & Back required</p>
                                        </div>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setDocumentType('passport')}
                                        className={`p-4 border-2 rounded-lg transition-all ${documentType === 'passport'
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-300 hover:border-gray-400'
                                            }`}
                                    >
                                        <div className="text-center">
                                            <div className="text-3xl mb-2">📔</div>
                                            <h4 className="font-semibold">Passport</h4>
                                            <p className="text-sm text-gray-600">Photo page only</p>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* ID Document Uploads */}
                            {documentType === 'national_id' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            National ID - Front *
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setIdDocumentFront(e.target.files?.[0] || null)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                        <p className="text-sm text-gray-500 mt-1">
                                            Upload a clear photo of the front of your National ID
                                        </p>
                                        {idDocumentFront && (
                                            <p className="text-sm text-green-600 mt-1">✓ Front uploaded: {idDocumentFront.name}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            National ID - Back *
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setIdDocumentBack(e.target.files?.[0] || null)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                        <p className="text-sm text-gray-500 mt-1">
                                            Upload a clear photo of the back of your National ID
                                        </p>
                                        {idDocumentBack && (
                                            <p className="text-sm text-green-600 mt-1">✓ Back uploaded: {idDocumentBack.name}</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {documentType === 'passport' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Passport Photo Page *
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setPassportDocument(e.target.files?.[0] || null)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    <p className="text-sm text-gray-500 mt-1">
                                        Upload a clear photo of your passport photo page
                                    </p>
                                    {passportDocument && (
                                        <p className="text-sm text-green-600 mt-1">✓ Passport uploaded: {passportDocument.name}</p>
                                    )}
                                </div>
                            )}

                            {/* Certificates Section - Only for Professional/Healthcare */}
                            {requiresCertificates && (
                                <div className="border-t pt-6">
                                    <div className="mb-4">
                                        <h4 className="text-lg font-semibold text-gray-800 mb-2">Professional Certificates *</h4>
                                        <p className="text-sm text-gray-600">
                                            Upload your professional certificates, licenses, or qualifications relevant to your selected services.
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Upload Certificates
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/*,.pdf"
                                            multiple
                                            onChange={handleCertificateUpload}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                        <p className="text-sm text-gray-500 mt-1">
                                            You can select multiple files. Accepted formats: images and PDF
                                        </p>
                                    </div>

                                    {/* Show uploaded certificates */}
                                    {certificates.length > 0 && (
                                        <div className="mt-4">
                                            <h5 className="text-sm font-medium text-gray-700 mb-2">Uploaded Certificates:</h5>
                                            <div className="space-y-2">
                                                {certificates.map((cert, index) => (
                                                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                                                        <span className="text-sm text-gray-700">{cert.name}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeCertificate(index)}
                                                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Selfie Section with Camera */}
                            <div className="border-t pt-6">
                                <div className="mb-4">
                                    <h4 className="text-lg font-semibold text-gray-800 mb-2">Selfie Verification *</h4>
                                    <p className="text-sm text-gray-600">
                                        Take a selfie holding your ID document. This helps us verify your identity.
                                    </p>
                                </div>

                                {!selfiePhoto && !showCamera && (
                                    <div className="space-y-3">
                                        <button
                                            type="button"
                                            onClick={startCamera}
                                            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                                        >
                                            📸 Take Selfie with Camera
                                        </button>
                                        <p className="text-center text-gray-500 text-sm">
                                            Camera access required for identity verification
                                        </p>
                                    </div>
                                )}

                                {showCamera && (
                                    <div className="space-y-4">
                                        <div className="relative bg-black rounded-lg overflow-hidden">
                                            <video
                                                id="camera-video"
                                                autoPlay
                                                playsInline
                                                muted
                                                ref={(video) => {
                                                    if (video && stream) {
                                                        video.srcObject = stream;
                                                    }
                                                }}
                                                className="w-full h-64 object-cover"
                                            />
                                            <div className="absolute inset-0 border-4 border-dashed border-white/50 m-4 rounded-lg"></div>
                                            <div className="absolute bottom-4 left-4 right-4 text-white text-sm text-center bg-black/50 rounded p-2">
                                                Hold your ID document visible in the frame
                                            </div>
                                        </div>
                                        <div className="flex space-x-3">
                                            <button
                                                type="button"
                                                onClick={capturePhoto}
                                                className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                                            >
                                                📷 Capture Photo
                                            </button>
                                            <button
                                                type="button"
                                                onClick={stopCamera}
                                                className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {selfiePhoto && (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="text-green-600">✓</div>
                                                <div>
                                                    <p className="font-medium text-green-800">Selfie captured successfully!</p>
                                                    <p className="text-sm text-green-600">{selfiePhoto.name}</p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelfiePhoto(null);
                                                    setShowCamera(false);
                                                }}
                                                className="text-green-600 hover:text-green-800 text-sm font-medium"
                                            >
                                                Retake
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={handleDocumentUpload}
                            disabled={
                                loading ||
                                !selfiePhoto ||
                                (documentType === 'national_id' && (!idDocumentFront || !idDocumentBack)) ||
                                (documentType === 'passport' && !passportDocument) ||
                                (requiresCertificates && certificates.length === 0)
                            }
                            className="w-full bg-gradient-to-r from-orange-600 to-orange-700 text-white py-3 px-6 rounded-lg font-semibold hover:from-orange-700 hover:to-orange-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Uploading...' : 'Submit for Verification'}
                        </button>
                    </div>
                );

            default:
                return null;
        }
    };

    const completedSteps = setupSteps.filter(step => step.completed).length;
    const totalSteps = setupSteps.length;
    const progressPercentage = (completedSteps / totalSteps) * 100;

    return (
        <div className="max-w-2xl mx-auto p-6">
            {/* Progress Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-3xl font-bold text-gray-800">Account Setup</h2>
                    <span className="text-sm text-gray-600">
                        {completedSteps} of {totalSteps} completed
                    </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                    <div
                        className="bg-gradient-to-r from-blue-600 to-green-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercentage}%` }}
                    ></div>
                </div>

                {/* Steps Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {setupSteps.map((step) => (
                        <div
                            key={step.id}
                            className={`p-3 rounded-lg text-center cursor-pointer transition-all ${step.completed
                                ? 'bg-green-100 text-green-800 border-2 border-green-200'
                                : currentStep === step.id
                                    ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                                    : 'bg-gray-100 text-gray-600 border-2 border-gray-200'
                                }`}
                            onClick={() => !step.completed && setCurrentStep(step.id)}
                        >
                            <div className="text-lg mb-1">
                                {step.completed ? '✅' : step.icon}
                            </div>
                            <div className="text-xs font-medium">{step.title}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Step Content */}
            <div className="bg-white rounded-xl shadow-lg p-8">
                {renderStepContent()}
            </div>
        </div>
    );
} 