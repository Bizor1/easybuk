import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        console.log('=== SIGNUP DEBUG START ===');

        const body = await request.json();
        console.log('✅ Request body parsed:', { email: body.email, name: body.name, role: body.role });

        // Step 1: Test database connection
        console.log('🔍 Step 1: Testing database connection...');
        const { prisma } = await import('@/lib/prisma');
        const userCount = await prisma.user.count();
        console.log('✅ Database connected, user count:', userCount);

        // Step 2: Check if user exists
        console.log('🔍 Step 2: Checking if user exists...');
        const existingUser = await prisma.user.findUnique({
            where: { email: body.email },
        });
        console.log('✅ User check complete, exists:', !!existingUser);

        if (existingUser) {
            return NextResponse.json({
                success: false,
                error: 'User already exists',
                debug: 'Found existing user'
            }, { status: 400 });
        }

        // Step 3: Test bcryptjs
        console.log('🔍 Step 3: Testing bcryptjs...');
        const bcrypt = await import('bcryptjs');
        const hashedPassword = await bcrypt.hash(body.password, 12);
        console.log('✅ Password hashed successfully, length:', hashedPassword.length);

        // Step 4: Test UUID generation
        console.log('🔍 Step 4: Testing UUID generation...');
        const { v4: uuidv4 } = await import('uuid');
        const testId = uuidv4();
        console.log('✅ UUID generated:', testId);

        // Step 5: Test simple user creation (without transaction first)
        console.log('🔍 Step 5: Testing simple user creation...');
        const newUser = await prisma.user.create({
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
        console.log('✅ User created successfully:', newUser.id);

        return NextResponse.json({
            success: true,
            message: 'Debug signup successful',
            userId: newUser.id,
            steps: 'All steps passed'
        });

    } catch (error) {
        console.error('❌ Signup debug error:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            debug: 'Error in signup debug route'
        }, { status: 500 });
    }
} 