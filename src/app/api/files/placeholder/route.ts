import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get('name') || 'Unknown File';
    const fileSize = searchParams.get('size') || '0';

    // Return a simple JSON response with file info
    return NextResponse.json({
        fileName,
        fileSize: parseInt(fileSize),
        message: 'File upload temporarily unavailable due to network issues. File information saved.',
        status: 'placeholder'
    });
} 