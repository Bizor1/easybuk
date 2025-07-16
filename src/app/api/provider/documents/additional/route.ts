import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';
import CloudinaryService from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
    console.log('📄 Provider Additional Documents: Starting additional document upload');
    try {
        const tokenPayload = getCurrentUser(request);
        console.log('🔐 Provider Additional Documents: Token found:', !!tokenPayload?.userId);

        if (!tokenPayload?.userId) {
            console.log('❌ Provider Additional Documents: Unauthorized');
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const formData = await request.formData();

        // Get uploaded files
        const files: File[] = [];
        let fileIndex = 0;

        while (true) {
            const file = formData.get(`certificate_${fileIndex}`) as File;
            if (!file || file.size === 0) break;
            files.push(file);
            fileIndex++;
        }

        // Validate that files were uploaded
        if (files.length === 0) {
            return NextResponse.json(
                { error: 'At least one file is required' },
                { status: 400 }
            );
        }

        console.log('👤 Provider Additional Documents: Looking up provider profile');
        // Get user's provider profile
        const user = await prisma.user.findUnique({
            where: { id: tokenPayload.userId },
            include: {
                UserProviderProfile: {
                    include: {
                        ServiceProvider: true
                    }
                }
            }
        });

        if (!user || !user.UserProviderProfile) {
            return NextResponse.json(
                { error: 'Provider profile not found' },
                { status: 404 }
            );
        }

        const provider = user.UserProviderProfile.ServiceProvider;
        const providerId = provider.id;

        try {
            console.log(`📤 Uploading ${files.length} additional documents to Cloudinary...`);
            const uploadedUrls: string[] = [];

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                console.log(`📤 Uploading file ${i + 1}/${files.length}: ${file.name}`);

                const fileBuffer = Buffer.from(await file.arrayBuffer());
                const fileDataUrl = `data:${file.type};base64,${fileBuffer.toString('base64')}`;

                const uploadResult = await CloudinaryService.uploadFile(
                    fileDataUrl,
                    {
                        folder: 'easybuk/documents/additional-certificates',
                        resource_type: 'auto', // Handles both images and PDFs
                        public_id: `${providerId}_additional_cert_${Date.now()}_${i}`
                    }
                );

                uploadedUrls.push(uploadResult.secure_url);
            }

            // Update provider's certificate URLs by appending new ones
            console.log('💾 Adding new certificate URLs to database...');

            const existingCertificates = provider.certificateUrls || [];
            const updatedCertificates = [...existingCertificates, ...uploadedUrls];

            await prisma.serviceProvider.update({
                where: { id: providerId },
                data: {
                    certificateUrls: updatedCertificates,
                    updatedAt: new Date()
                }
            });

            // Send notification emails
            try {
                console.log('📧 Sending notification emails...');

                // Admin notification
                await fetch(`${process.env.NEXTAUTH_URL}/api/notifications/send`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        to: process.env.ADMIN_EMAIL || 'admin@easybuk.com',
                        type: 'additional_documents_uploaded',
                        data: {
                            providerName: user.name,
                            providerEmail: user.email,
                            providerId: providerId,
                            additionalDocumentCount: files.length,
                            totalDocumentCount: updatedCertificates.length,
                            submittedAt: new Date().toISOString()
                        }
                    })
                });

                // Provider confirmation
                await fetch(`${process.env.NEXTAUTH_URL}/api/notifications/send`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        to: user.email,
                        type: 'additional_documents_upload_success',
                        data: {
                            providerName: user.name,
                            additionalDocumentCount: files.length,
                            totalDocumentCount: updatedCertificates.length,
                            submittedAt: new Date().toISOString()
                        }
                    })
                });
            } catch (emailError) {
                console.error('Failed to send notifications:', emailError);
                // Don't fail the whole operation for email errors
            }

            console.log('✅ Additional documents uploaded successfully');
            return NextResponse.json({
                success: true,
                message: `Successfully uploaded ${files.length} additional certificate(s)`,
                uploadedCount: files.length,
                totalCertificates: updatedCertificates.length,
                uploadedFiles: files.map(file => file.name)
            });

        } catch (uploadError) {
            console.error('Cloudinary upload error:', uploadError);
            return NextResponse.json(
                { error: 'Failed to upload documents to cloud storage' },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error('Additional document upload error:', error);
        return NextResponse.json(
            { error: 'Failed to upload additional documents' },
            { status: 500 }
        );
    }
} 