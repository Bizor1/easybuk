import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';
import CloudinaryService from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
  console.log('📄 Provider Documents: Starting document upload');
  try {
    const tokenPayload = getCurrentUser(request);
    console.log('🔐 Provider Documents: Token found:', !!tokenPayload?.userId);
    
    if (!tokenPayload?.userId) {
      console.log('❌ Provider Documents: Unauthorized');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    
    // Get document type and files
    const documentType = formData.get('documentType') as string;
    const selfiePhoto = formData.get('selfiePhoto') as File;
    
    // Validate required fields
    if (!documentType || !selfiePhoto) {
      return NextResponse.json(
        { error: 'Document type and selfie photo are required' },
        { status: 400 }
      );
    }

    console.log('👤 Provider Documents: Looking up provider profile');
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

    const providerId = user.UserProviderProfile.ServiceProvider.id;
    const uploadedDocuments: any = {};

    try {
      // Upload selfie (always required)
      console.log('📤 Uploading selfie to Cloudinary...');
      const selfieBuffer = Buffer.from(await selfiePhoto.arrayBuffer());
      const selfieDataUrl = `data:${selfiePhoto.type};base64,${selfieBuffer.toString('base64')}`;
      const selfieResult = await CloudinaryService.uploadFile(
        selfieDataUrl,
        {
          folder: 'easybuk/documents/selfies',
          resource_type: 'image',
          public_id: `${providerId}_selfie_${Date.now()}`
        }
      );
      uploadedDocuments.selfieUrl = selfieResult.secure_url;

      // Handle ID documents based on type
      if (documentType === 'national_id') {
        const idFront = formData.get('idDocumentFront') as File;
        const idBack = formData.get('idDocumentBack') as File;
        
        if (!idFront || !idBack) {
          return NextResponse.json(
            { error: 'Both front and back of National ID are required' },
            { status: 400 }
          );
        }

        console.log('📤 Uploading National ID front to Cloudinary...');
        const frontBuffer = Buffer.from(await idFront.arrayBuffer());
        const frontDataUrl = `data:${idFront.type};base64,${frontBuffer.toString('base64')}`;
        const frontResult = await CloudinaryService.uploadFile(
          frontDataUrl,
          {
            folder: 'easybuk/documents/ids',
            resource_type: 'image',
            public_id: `${providerId}_id_front_${Date.now()}`
          }
        );
        uploadedDocuments.idFrontUrl = frontResult.secure_url;

        console.log('📤 Uploading National ID back to Cloudinary...');
        const backBuffer = Buffer.from(await idBack.arrayBuffer());
        const backDataUrl = `data:${idBack.type};base64,${backBuffer.toString('base64')}`;
        const backResult = await CloudinaryService.uploadFile(
          backDataUrl,
          {
            folder: 'easybuk/documents/ids',
            resource_type: 'image',
            public_id: `${providerId}_id_back_${Date.now()}`
          }
        );
        uploadedDocuments.idBackUrl = backResult.secure_url;

      } else if (documentType === 'passport') {
        const passport = formData.get('passportDocument') as File;
        
        if (!passport) {
          return NextResponse.json(
            { error: 'Passport document is required' },
            { status: 400 }
          );
        }

        console.log('📤 Uploading passport to Cloudinary...');
        const passportBuffer = Buffer.from(await passport.arrayBuffer());
        const passportDataUrl = `data:${passport.type};base64,${passportBuffer.toString('base64')}`;
        const passportResult = await CloudinaryService.uploadFile(
          passportDataUrl,
          {
            folder: 'easybuk/documents/passports',
            resource_type: 'image',
            public_id: `${providerId}_passport_${Date.now()}`
          }
        );
        uploadedDocuments.passportUrl = passportResult.secure_url;
      }

      // Handle certificates if any
      const certificateCount = parseInt(formData.get('certificateCount') as string || '0');
      if (certificateCount > 0) {
        console.log(`📤 Uploading ${certificateCount} certificates to Cloudinary...`);
        const certificateUrls: string[] = [];
        
        for (let i = 0; i < certificateCount; i++) {
          const certificate = formData.get(`certificate_${i}`) as File;
          if (certificate) {
            const certBuffer = Buffer.from(await certificate.arrayBuffer());
            const certDataUrl = `data:${certificate.type};base64,${certBuffer.toString('base64')}`;
            const certResult = await CloudinaryService.uploadFile(
              certDataUrl,
              {
                folder: 'easybuk/documents/certificates',
                resource_type: 'auto', // Handles both images and PDFs
                public_id: `${providerId}_cert_${i}_${Date.now()}`
              }
            );
            certificateUrls.push(certResult.secure_url);
          }
        }
        uploadedDocuments.certificateUrls = certificateUrls;
      }

      // Store document information in database
      console.log('💾 Storing document URLs in database...');
      
      // Create document verification record
      const documentVerification = await prisma.serviceProvider.update({
        where: { id: providerId },
        data: {
          // Store document URLs in existing fields for now
          idDocumentUrl: documentType === 'national_id' 
            ? JSON.stringify({
                type: 'national_id',
                front: uploadedDocuments.idFrontUrl,
                back: uploadedDocuments.idBackUrl
              })
            : uploadedDocuments.passportUrl,
          
          // Store selfie URL in portfolioUrls temporarily
          portfolioUrls: [uploadedDocuments.selfieUrl],
          
          // Store certificates
          certificateUrls: uploadedDocuments.certificateUrls || [],
          
          // Update verification status and mark onboarding as completed
          verificationStatus: 'PENDING',
          profileCompleted: true, // Mark onboarding as completed when documents are uploaded
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
            type: 'documents_uploaded',
            data: {
              providerName: user.name,
              providerEmail: user.email,
              providerId: providerId,
              documentType: documentType,
              documentCount: Object.keys(uploadedDocuments).length,
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
            type: 'documents_upload_success',
            data: {
              providerName: user.name,
              documentType: documentType,
              submittedAt: new Date().toISOString()
            }
          })
        });
      } catch (emailError) {
        console.error('Failed to send notifications:', emailError);
      }

      console.log('✅ Documents uploaded successfully');
      return NextResponse.json({
        success: true,
        message: 'Documents uploaded successfully and are under review',
        verificationId: `VER_${Date.now()}`,
        status: 'under_review',
        uploadedFiles: {
          selfie: !!uploadedDocuments.selfieUrl,
          idDocument: documentType === 'national_id' 
            ? !!(uploadedDocuments.idFrontUrl && uploadedDocuments.idBackUrl)
            : !!uploadedDocuments.passportUrl,
          certificates: uploadedDocuments.certificateUrls?.length || 0
        }
      });

    } catch (uploadError) {
      console.error('Cloudinary upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload documents to cloud storage' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Document upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload documents' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  console.log('📋 Provider Documents: Getting document status');
  try {
    const tokenPayload = getCurrentUser(request);
    console.log('🔐 Provider Documents: Token found:', !!tokenPayload?.userId);
    
    if (!tokenPayload?.userId) {
      console.log('❌ Provider Documents: Unauthorized');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('👤 Provider Documents: Looking up provider profile');
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
    
    // Parse document data
    let documentInfo: any = {};
    if (provider.idDocumentUrl) {
      try {
        const parsed = JSON.parse(provider.idDocumentUrl);
        if (parsed.type) {
          documentInfo = parsed;
        } else {
          // Legacy format - single URL
          documentInfo = { type: 'passport', url: provider.idDocumentUrl };
        }
      } catch {
        // Legacy format - single URL
        documentInfo = { type: 'passport', url: provider.idDocumentUrl };
      }
    }
    
    return NextResponse.json({
      verificationStatus: provider.verificationStatus,
      documentType: documentInfo.type || null,
      hasIdDocument: !!provider.idDocumentUrl,
      hasSelfiePhoto: provider.portfolioUrls && provider.portfolioUrls.length > 0,
      hasCertificates: provider.certificateUrls && provider.certificateUrls.length > 0,
      certificateCount: provider.certificateUrls?.length || 0,
      verifiedAt: provider.verifiedAt,
      submittedAt: provider.createdAt
    });

  } catch (error) {
    console.error('Get documents error:', error);
    return NextResponse.json(
      { error: 'Failed to get document status' },
      { status: 500 }
    );
  }
} 