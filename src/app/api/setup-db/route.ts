import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Mark this route as dynamic
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        console.log('🚀 Starting database connection test...');

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

        console.log('🔌 Testing database connection...');
        await prisma.$connect();

        console.log('📋 Checking existing tables...');
        const tables = await prisma.$queryRaw`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name;
        `;

        console.log('👥 Testing User table...');
        try {
            const userCount = await prisma.user.count();

            return NextResponse.json({
                success: true,
                message: 'Database is fully configured and working!',
                userCount,
                tables,
                timestamp: new Date().toISOString()
            });

        } catch (schemaError) {
            console.log('❌ Schema missing - need to run migrations');

            return NextResponse.json({
                success: false,
                error: 'Database connected but schema is missing',
                tables,
                instructions: {
                    message: 'Your database is connected but tables need to be created.',
                    localSetup: 'Run locally: node scripts/setup-neon-db.js',
                    details: 'Vercel serverless functions cannot run migrations. You need to run them locally or from your development environment.'
                },
                troubleshoot: {
                    step1: 'Download and install the Neon CLI: https://neon.tech/docs/reference/cli-install',
                    step2: 'Or run migrations from your local development environment',
                    step3: 'Use the connection string in your local .env file and run: npx prisma migrate deploy'
                },
                timestamp: new Date().toISOString()
            }, { status: 500 });
        }

    } catch (error) {
        console.error('❌ Database connection failed:', error);
        return NextResponse.json({
            error: 'Database connection failed',
            details: error instanceof Error ? error.message : 'Unknown error',
            instructions: 'Check your DATABASE_URL environment variable in Vercel settings',
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    // Same logic for POST requests
    return GET(request);
} 