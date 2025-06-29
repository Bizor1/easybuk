import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET, // This should stay server-side only
    secure: true,
    timeout: 60000 // 60 seconds timeout
});

export interface CloudinaryUploadResult {
    public_id: string;
    secure_url: string;
    width: number;
    height: number;
    format: string;
    resource_type: string;
    bytes: number;
}

export class CloudinaryService {
    /**
     * Upload file to Cloudinary with retry logic
     */
    static async uploadFile(
        file: Buffer | string,
        options: {
            folder?: string;
            public_id?: string;
            resource_type?: 'image' | 'video' | 'raw' | 'auto';
            transformation?: any;
        } = {}
    ): Promise<CloudinaryUploadResult> {
        const maxRetries = 3;
        let lastError: any;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`Cloudinary upload attempt ${attempt}/${maxRetries}`);

                const result = await cloudinary.uploader.upload(file as string, {
                    folder: options.folder || 'easybuk',
                    public_id: options.public_id,
                    resource_type: options.resource_type || 'auto',
                    transformation: options.transformation,
                    quality: 'auto',
                    fetch_format: 'auto',
                    timeout: 60000 // 60 seconds timeout per attempt
                });

                console.log('Cloudinary upload successful:', result.public_id);

                return {
                    public_id: result.public_id,
                    secure_url: result.secure_url,
                    width: result.width || 0,
                    height: result.height || 0,
                    format: result.format,
                    resource_type: result.resource_type,
                    bytes: result.bytes
                };
            } catch (error) {
                lastError = error;
                console.error(`Cloudinary upload attempt ${attempt} failed:`, error);

                // If it's the last attempt, don't wait
                if (attempt < maxRetries) {
                    // Wait before retrying (exponential backoff)
                    const waitTime = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
                    console.log(`Waiting ${waitTime}ms before retry...`);
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                }
            }
        }

        // All attempts failed
        console.error('All Cloudinary upload attempts failed:', lastError);
        throw new Error(`Failed to upload file after ${maxRetries} attempts: ${lastError instanceof Error ? lastError.message : 'Unknown error'}`);
    }

    /**
     * Upload verification document
     */
    static async uploadVerificationDocument(
        file: Buffer | string,
        userId: string,
        documentType: 'id' | 'business_license' | 'certification' | 'portfolio'
    ): Promise<CloudinaryUploadResult> {
        return this.uploadFile(file, {
            folder: `easybuk/verifications/${userId}`,
            public_id: `${documentType}_${Date.now()}`,
            resource_type: 'auto'
        });
    }

    /**
     * Upload profile image
     */
    static async uploadProfileImage(
        file: Buffer | string,
        userId: string
    ): Promise<CloudinaryUploadResult> {
        return this.uploadFile(file, {
            folder: `easybuk/profiles/${userId}`,
            public_id: `avatar_${Date.now()}`,
            resource_type: 'image',
            transformation: {
                width: 400,
                height: 400,
                crop: 'fill',
                gravity: 'face'
            }
        });
    }

    /**
     * Upload service images
     */
    static async uploadServiceImage(
        file: Buffer | string,
        providerId: string,
        serviceId: string
    ): Promise<CloudinaryUploadResult> {
        return this.uploadFile(file, {
            folder: `easybuk/services/${providerId}`,
            public_id: `service_${serviceId}_${Date.now()}`,
            resource_type: 'image',
            transformation: {
                width: 800,
                height: 600,
                crop: 'fill',
                quality: 'auto'
            }
        });
    }

    /**
     * Delete file from Cloudinary
     */
    static async deleteFile(publicId: string): Promise<boolean> {
        try {
            const result = await cloudinary.uploader.destroy(publicId);
            return result.result === 'ok';
        } catch (error) {
            console.error('Cloudinary delete error:', error);
            return false;
        }
    }

    /**
     * Generate signed upload URL for client-side uploads
     */
    static generateSignedUploadUrl(folder: string = 'easybuk'): {
        uploadUrl: string;
        signature: string;
        timestamp: number;
        apiKey: string;
        cloudName: string;
    } {
        const timestamp = Math.round(new Date().getTime() / 1000);
        const signature = cloudinary.utils.api_sign_request(
            {
                timestamp,
                folder,
                upload_preset: 'easybuk_uploads'
            },
            process.env.CLOUDINARY_API_SECRET!
        );

        return {
            uploadUrl: `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME}/upload`,
            signature,
            timestamp,
            apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY!,
            cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME!
        };
    }
}

export default CloudinaryService; 