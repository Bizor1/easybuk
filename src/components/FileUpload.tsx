'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
    CloudArrowUpIcon,
    XMarkIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    DocumentIcon,
    PhotoIcon
} from '@heroicons/react/24/outline';

interface FileUploadProps {
    onUpload: (files: UploadedFile[]) => void;
    accept?: Record<string, string[]>;
    maxFiles?: number;
    maxSize?: number;
    multiple?: boolean;
    uploadType?: 'image' | 'document' | 'any';
    existingFiles?: UploadedFile[];
    disabled?: boolean;
    required?: boolean;
    label?: string;
    description?: string;
}

export interface UploadedFile {
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
    uploadedAt: Date;
    publicId?: string;
}

const FileUpload = ({
    onUpload,
    accept,
    maxFiles = 5,
    maxSize = 10 * 1024 * 1024, // 10MB
    multiple = true,
    uploadType = 'any',
    existingFiles = [],
    disabled = false,
    required = false,
    label,
    description
}: FileUploadProps) => {
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>(existingFiles);
    const [errors, setErrors] = useState<string[]>([]);

    const getAcceptTypes = () => {
        if (accept) return accept;

        switch (uploadType) {
            case 'image':
                return {
                    'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
                };
            case 'document':
                return {
                    'application/pdf': ['.pdf'],
                    'application/msword': ['.doc'],
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
                    'image/*': ['.jpeg', '.jpg', '.png']
                };
            default:
                return {
                    'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
                    'application/pdf': ['.pdf'],
                    'application/msword': ['.doc', '.docx']
                };
        }
    };

    const uploadToCloudinary = useCallback(async (file: File): Promise<UploadedFile> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'easybuk_uploads');
        formData.append('folder', `easybuk/${uploadType}`);

        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Upload failed');
        }

        const result = await response.json();

        return {
            id: Date.now().toString(),
            name: file.name,
            url: result.secure_url,
            type: file.type,
            size: file.size,
            uploadedAt: new Date(),
            publicId: result.public_id
        };
    }, [uploadType]);

    const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: any[]) => {
        setErrors([]);

        // Handle rejected files
        if (rejectedFiles.length > 0) {
            const errorMessages = rejectedFiles.map(({ file, errors }) => {
                const errorTypes = errors.map((e: any) => e.code);
                if (errorTypes.includes('file-too-large')) {
                    return `${file.name} is too large (max ${maxSize / (1024 * 1024)}MB)`;
                }
                if (errorTypes.includes('file-invalid-type')) {
                    return `${file.name} has invalid file type`;
                }
                return `${file.name} was rejected`;
            });
            setErrors(errorMessages);
        }

        if (acceptedFiles.length === 0) return;

        setUploading(true);

        try {
            const uploadPromises = acceptedFiles.map(async (file, index) => {
                const fileId = `${file.name}-${Date.now()}-${index}`;
                setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));

                try {
                    // Simulate progress
                    const progressInterval = setInterval(() => {
                        setUploadProgress(prev => ({
                            ...prev,
                            [fileId]: Math.min((prev[fileId] || 0) + 10, 90)
                        }));
                    }, 200);

                    const uploadedFile = await uploadToCloudinary(file);

                    clearInterval(progressInterval);
                    setUploadProgress(prev => ({ ...prev, [fileId]: 100 }));

                    return uploadedFile;
                } catch (error) {
                    setErrors(prev => [...prev, `Failed to upload ${file.name}`]);
                    return null;
                }
            });

            const results = await Promise.all(uploadPromises);
            const successfulUploads = results.filter(Boolean) as UploadedFile[];

            const newFiles = [...uploadedFiles, ...successfulUploads];
            setUploadedFiles(newFiles);
            onUpload(newFiles);

        } catch (error) {
            setErrors(['Upload failed. Please try again.']);
        } finally {
            setUploading(false);
            setUploadProgress({});
        }
    }, [uploadedFiles, onUpload, maxSize, uploadToCloudinary]);

    const removeFile = (fileId: string) => {
        const newFiles = uploadedFiles.filter(file => file.id !== fileId);
        setUploadedFiles(newFiles);
        onUpload(newFiles);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: getAcceptTypes(),
        maxFiles: maxFiles,
        maxSize: maxSize,
        multiple: multiple,
        disabled: disabled || uploading
    });

    const getFileIcon = (file: UploadedFile) => {
        if (file.type.startsWith('image/')) {
            return <PhotoIcon className="h-8 w-8 text-blue-500" />;
        }
        return <DocumentIcon className="h-8 w-8 text-gray-500" />;
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}

            {/* Upload Area */}
            <div
                {...getRootProps()}
                className={`
                    relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                    ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
                    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                    ${uploading ? 'pointer-events-none' : ''}
                `}
            >
                <input {...getInputProps()} />

                <div className="space-y-2">
                    <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />

                    {uploading ? (
                        <p className="text-sm text-gray-600">Uploading files...</p>
                    ) : isDragActive ? (
                        <p className="text-sm text-blue-600">Drop files here...</p>
                    ) : (
                        <>
                            <p className="text-sm text-gray-600">
                                <span className="font-medium text-blue-600 hover:text-blue-500">Click to upload</span>
                                {' '}or drag and drop
                            </p>
                            {description && (
                                <p className="text-xs text-gray-500">{description}</p>
                            )}
                            <p className="text-xs text-gray-500">
                                Max {maxFiles} files, {formatFileSize(maxSize)} each
                            </p>
                        </>
                    )}
                </div>
            </div>

            {/* Upload Progress */}
            {Object.keys(uploadProgress).length > 0 && (
                <div className="mt-4 space-y-2">
                    {Object.entries(uploadProgress).map(([fileId, progress]) => (
                        <div key={fileId} className="bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Error Messages */}
            {errors.length > 0 && (
                <div className="mt-4 space-y-1">
                    {errors.map((error, index) => (
                        <div key={index} className="flex items-center text-sm text-red-600">
                            <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
                            {error}
                        </div>
                    ))}
                </div>
            )}

            {/* Uploaded Files */}
            {uploadedFiles.length > 0 && (
                <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Uploaded Files ({uploadedFiles.length})
                    </h4>
                    <div className="space-y-2">
                        {uploadedFiles.map((file) => (
                            <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center">
                                    {getFileIcon(file)}
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-gray-900">{file.name}</p>
                                        <p className="text-xs text-gray-500">
                                            {formatFileSize(file.size)} • {file.uploadedAt.toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                                    <button
                                        onClick={() => removeFile(file.id)}
                                        className="text-gray-400 hover:text-red-500"
                                        disabled={disabled}
                                    >
                                        <XMarkIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FileUpload; 