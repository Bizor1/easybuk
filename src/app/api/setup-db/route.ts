import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Mark this route as dynamic
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        console.log('🚀 Starting database setup...');

        // Check if DATABASE_URL is set
        if (!process.env.DATABASE_URL) {
            return NextResponse.json({
                error: 'DATABASE_URL not configured'
            }, { status: 500 });
        }

        if (!process.env.DATABASE_URL.includes('neon.tech')) {
            return NextResponse.json({
                error: 'DATABASE_URL does not point to Neon database'
            }, { status: 500 });
        }

        console.log('🔄 Running database migrations...');
        await execAsync('npx prisma migrate deploy');

        console.log('✅ Database setup complete!');

        return NextResponse.json({
            success: true,
            message: 'Database migrations applied successfully!',
            note: 'Prisma client was generated during build time',
            tablesCreated: [
                'User', 'Client', 'ServiceProvider', 'Admin',
                'Booking', 'Service', 'Review', 'Message',
                'Transaction', 'Notification', 'Dispute',
                'ClientWallet', 'ProviderWallet', 'FileUpload',
                'AdminAction', 'AdminSettings', 'VerificationToken'
            ],
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Database setup failed:', error);
        return NextResponse.json({
            error: 'Database setup failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    // Same logic for POST requests
    return GET(request);
} 