import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    return NextResponse.json({
        success: true,
        message: 'Simple auth test route working',
        timestamp: new Date().toISOString()
    });
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        return NextResponse.json({
            success: true,
            message: 'Simple auth POST test working',
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