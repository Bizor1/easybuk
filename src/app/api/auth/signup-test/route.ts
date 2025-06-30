import { NextRequest, NextResponse } from 'next/server';

// Test each import one by one
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        console.log('=== SIGNUP TEST START ===');

        // Test 1: Basic request handling
        const body = await request.json();
        console.log('✅ Request JSON parsed successfully');

        // Test 2: Import AuthService
        console.log('Testing AuthService import...');
        const { AuthService } = await import('@/lib/auth');
        console.log('✅ AuthService imported successfully');

        // Test 3: Try a simple operation
        console.log('Testing basic validation...');
        if (!body.email || !body.password) {
            return NextResponse.json(
                { success: false, error: 'Email and password required' },
                { status: 400 }
            );
        }
        console.log('✅ Basic validation successful');

        // Test 4: Test database connection
        console.log('Testing database connection...');
        const { prisma } = await import('@/lib/prisma');
        const userCount = await prisma.user.count();
        console.log('✅ Database connection successful, user count:', userCount);

        return NextResponse.json({
            success: true,
            message: 'All tests passed!',
            userCount: userCount,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Signup test error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined
            },
            { status: 500 }
        );
    }
} 