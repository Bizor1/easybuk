import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/jwt';
import CloudinaryService from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
    try {
        const tokenPayload = getCurrentUser(request);
        
        if (!tokenPayload?.userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;
        const type = formData.get('type') as string || 'general';

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            return NextResponse.json(
                { error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' },
                { status: 400 }
            );
        }

        // Validate file size (5MB max)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: 'File size too large. Maximum size is 5MB.' },
                { status: 400 }
            );
        }

        // Convert file to buffer and upload to Cloudinary
        const buffer = Buffer.from(await file.arrayBuffer());
        const dataUrl = `data:${file.type};base64,${buffer.toString('base64')}`;

        console.log(`📤 Uploading ${type} image to Cloudinary...`);
        
        const result = await CloudinaryService.uploadFile(
            dataUrl,
            {
                folder: `easybuk/${type}`,
                resource_type: 'image',
                public_id: `${tokenPayload.userId}_${type}_${Date.now()}`
            }
        );

        console.log('✅ Image uploaded successfully to Cloudinary');

        return NextResponse.json({
            success: true,
            url: result.secure_url,
            public_id: result.public_id,
            filename: file.name,
            size: file.size,
            type: file.type,
            width: result.width,
            height: result.height
        });

    } catch (error) {
        console.error('File upload error:', error);
        return NextResponse.json(
            { error: 'Failed to upload file' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const tokenPayload = getCurrentUser(request);
        
        if (!tokenPayload?.userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const publicId = searchParams.get('public_id');

        if (!publicId) {
            return NextResponse.json(
                { error: 'No public_id provided' },
                { status: 400 }
            );
        }

        console.log(`🗑️ Deleting image from Cloudinary: ${publicId}`);
        const result = await CloudinaryService.deleteFile(publicId);

        console.log('✅ Image deleted successfully from Cloudinary');

        return NextResponse.json({
            success: result,
            message: result ? 'Image deleted successfully' : 'Failed to delete image'
        });

    } catch (error) {
        console.error('Delete error:', error);
        return NextResponse.json(
            { error: 'Delete failed', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
} 