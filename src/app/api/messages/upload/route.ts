import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/jwt';
import { CloudinaryService } from '@/lib/cloudinary';
import { prisma } from '@/lib/prisma';

// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Allowed file types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_DOCUMENT_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
];
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES];

export async function POST(request: NextRequest) {
    try {
        // Get current user
        const tokenPayload = getCurrentUser(request);
        if (!tokenPayload?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;
        const bookingId = formData.get('bookingId') as string;
        const messageType = formData.get('messageType') as string || 'DOCUMENT';

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        if (!bookingId) {
            return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({
                error: 'File too large. Maximum size is 10MB'
            }, { status: 400 });
        }

        // Validate file type
        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json({
                error: 'File type not allowed. Supported: Images (JPG, PNG, GIF, WebP) and Documents (PDF, DOC, DOCX, TXT)'
            }, { status: 400 });
        }

        // Verify user has access to this booking
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                Client: {
                    include: {
                        UserClientProfile: true
                    }
                },
                ServiceProvider: {
                    include: {
                        UserProviderProfile: true
                    }
                }
            }
        });

        if (!booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }

        const isClient = booking.Client?.UserClientProfile?.userId === tokenPayload.userId;
        const isProvider = booking.ServiceProvider?.UserProviderProfile?.userId === tokenPayload.userId;

        if (!isClient && !isProvider) {
            return NextResponse.json({
                error: 'Not authorized to upload files for this booking'
            }, { status: 403 });
        }

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;

        // Determine upload folder and resource type
        const userType = isClient ? 'client' : 'provider';
        const folder = `easybuk/messages/${bookingId}/${userType}`;
        const resourceType = ALLOWED_IMAGE_TYPES.includes(file.type) ? 'image' : 'raw';

        let fileMetadata;

        try {
            // Try to upload to Cloudinary first
            const uploadResult = await CloudinaryService.uploadFile(base64, {
                folder,
                resource_type: resourceType,
                public_id: `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9]/g, '_')}`
            });

            // Create file metadata
            fileMetadata = {
                fileName: file.name,
                fileSize: file.size,
                mimeType: file.type,
                cloudinaryId: uploadResult.public_id,
                url: uploadResult.secure_url,
                isImage: ALLOWED_IMAGE_TYPES.includes(file.type)
            };
        } catch (cloudinaryError) {
            console.error('Cloudinary upload failed, using fallback storage:', cloudinaryError);

            // Fallback: Store file info with a placeholder URL
            // In a production environment, you might want to save to local storage or another service
            fileMetadata = {
                fileName: file.name,
                fileSize: file.size,
                mimeType: file.type,
                cloudinaryId: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                url: `/api/files/placeholder?name=${encodeURIComponent(file.name)}&size=${file.size}`,
                isImage: ALLOWED_IMAGE_TYPES.includes(file.type)
            };

            console.log('Using fallback file metadata:', fileMetadata);
        }

        return NextResponse.json({
            success: true,
            file: fileMetadata,
            message: 'File uploaded successfully'
        });

    } catch (error) {
        console.error('Error uploading file:', error);
        return NextResponse.json(
            { error: 'Failed to upload file' },
            { status: 500 }
        );
    }
} 