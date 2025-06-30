import { NextRequest, NextResponse } from 'next/server';

// Mark this route as dynamic
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    return NextResponse.json({
        success: true,
        message: 'API is working!',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        hasDatabase: !!process.env.DATABASE_URL,
        hasJwtSecret: !!process.env.JWT_SECRET,
        hasNextAuthUrl: !!process.env.NEXTAUTH_URL
    });
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        return NextResponse.json({
            success: true,
            message: 'POST method working!',
            receivedData: body,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: 'Failed to parse JSON',
            timestamp: new Date().toISOString()
        }, { status: 400 });
    }
} 