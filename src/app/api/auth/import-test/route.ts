import { NextRequest, NextResponse } from 'next/server';

// Test imports one by one
export const dynamic = 'force-dynamic';

// First, let's try importing just the types
import { SignupData } from '@/types/auth';

export async function GET(request: NextRequest) {
    return NextResponse.json({
        success: true,
        message: 'Import test GET - types only',
        timestamp: new Date().toISOString()
    });
}

export async function POST(request: NextRequest) {
    return NextResponse.json({
        success: true,
        message: 'Import test POST - types only',
        timestamp: new Date().toISOString()
    });
} 