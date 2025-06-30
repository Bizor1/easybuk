import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        console.log('=== SIMPLE SIGNUP START ===');

        const body = await request.json();

        // Basic validation
        if (!body.email || !body.password || !body.name || !body.role) {
            return NextResponse.json(
                { success: false, error: 'Email, password, name, and role are required' },
                { status: 400 }
            );
        }

        // Import dependencies
        const { prisma } = await import('@/lib/prisma');
        const bcrypt = await import('bcrypt');
        const { v4: uuidv4 } = await import('uuid');
        const { generateAccessToken, generateRefreshToken } = await import('@/lib/jwt');

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email: body.email },
        });

        if (existingUser) {
            return NextResponse.json(
                { success: false, error: 'User already exists' },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(body.password, 12);

        // Create user (simple version - no profiles)
        const user = await prisma.user.create({
            data: {
                id: uuidv4(),
                email: body.email,
                password: hashedPassword,
                name: body.name,
                roles: [body.role],
                emailVerified: null,
                phoneVerified: false,
                status: 'PENDING_VERIFICATION',
                lastActive: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        });

        // Generate tokens
        const accessToken = generateAccessToken({
            userId: user.id,
            email: user.email,
            roles: user.roles,
        });

        const refreshToken = generateRefreshToken({
            userId: user.id,
            email: user.email,
        });

        // Return success
        const response = NextResponse.json({
            success: true,
            user: {
                userId: user.id,
                email: user.email,
                name: user.name,
                roles: user.roles,
                activeRole: body.role,
                profiles: {} // Empty profiles for simple signup
            }
        });

        // Set cookies
        const isProduction = process.env.NODE_ENV === 'production';
        response.cookies.set('auth-token', accessToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60,
            path: '/',
        });

        response.cookies.set('refresh-token', refreshToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60,
            path: '/',
        });

        console.log('✅ Simple signup successful');
        return response;

    } catch (error) {
        console.error('❌ Simple signup error:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        );
    }
} 