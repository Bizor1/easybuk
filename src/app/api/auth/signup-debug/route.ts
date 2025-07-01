import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        console.log('🧪 Debug signup: Starting process');

        const body = await request.json();
        console.log('📝 Debug signup: Request body received:', {
            email: body.email,
            name: body.name,
            role: body.role,
            hasPassword: !!body.password
        });

        // Step 1: Validate input
        console.log('1️⃣ Debug signup: Validating input');
        if (!body.email || !body.password || !body.name || !body.role) {
            console.log('❌ Debug signup: Missing required fields');
            return NextResponse.json({
                success: false,
                error: 'Email, password, name, and role are required',
                step: 'validation'
            }, { status: 400 });
        }

        // Step 2: Validate email format
        console.log('2️⃣ Debug signup: Validating email format');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(body.email)) {
            console.log('❌ Debug signup: Invalid email format');
            return NextResponse.json({
                success: false,
                error: 'Invalid email format',
                step: 'email_validation'
            }, { status: 400 });
        }

        // Step 3: Validate password strength
        console.log('3️⃣ Debug signup: Validating password strength');
        if (body.password.length < 6) {
            console.log('❌ Debug signup: Password too short');
            return NextResponse.json({
                success: false,
                error: 'Password must be at least 6 characters',
                step: 'password_validation'
            }, { status: 400 });
        }

        // Step 4: Validate role
        console.log('4️⃣ Debug signup: Validating role');
        if (!['CLIENT', 'PROVIDER'].includes(body.role)) {
            console.log('❌ Debug signup: Invalid role');
            return NextResponse.json({
                success: false,
                error: 'Invalid role specified',
                step: 'role_validation'
            }, { status: 400 });
        }

        // Step 5: Check database connection
        console.log('5️⃣ Debug signup: Testing database connection');
        try {
            await prisma.$connect();
            console.log('✅ Debug signup: Database connected');
        } catch (dbError) {
            console.error('❌ Debug signup: Database connection failed:', dbError);
            return NextResponse.json({
                success: false,
                error: 'Database connection failed',
                step: 'database_connection',
                details: dbError instanceof Error ? dbError.message : 'Unknown error'
            }, { status: 500 });
        }

        // Step 6: Check if user already exists
        console.log('6️⃣ Debug signup: Checking if user exists');
        try {
            const existingUser = await prisma.user.findUnique({
                where: { email: body.email },
            });

            if (existingUser) {
                console.log('❌ Debug signup: User already exists');
                return NextResponse.json({
                    success: false,
                    error: 'User with this email already exists',
                    step: 'user_exists_check'
                }, { status: 400 });
            }
            console.log('✅ Debug signup: User does not exist, can proceed');
        } catch (checkError) {
            console.error('❌ Debug signup: Error checking user existence:', checkError);
            return NextResponse.json({
                success: false,
                error: 'Error checking user existence',
                step: 'user_exists_check',
                details: checkError instanceof Error ? checkError.message : 'Unknown error'
            }, { status: 500 });
        }

        // Step 7: Hash password
        console.log('7️⃣ Debug signup: Hashing password');
        let hashedPassword;
        try {
            hashedPassword = await bcrypt.hash(body.password, 12);
            console.log('✅ Debug signup: Password hashed successfully');
        } catch (hashError) {
            console.error('❌ Debug signup: Password hashing failed:', hashError);
            return NextResponse.json({
                success: false,
                error: 'Password hashing failed',
                step: 'password_hashing',
                details: hashError instanceof Error ? hashError.message : 'Unknown error'
            }, { status: 500 });
        }

        // Step 8: Create user in transaction
        console.log('8️⃣ Debug signup: Starting database transaction');
        try {
            const result = await prisma.$transaction(async (tx) => {
                console.log('📝 Debug signup: Creating user record');
                const user = await tx.user.create({
                    data: {
                        id: uuidv4(),
                        email: body.email,
                        password: hashedPassword,
                        name: body.name,
                        phone: body.phone,
                        roles: [body.role],
                        emailVerified: null,
                        phoneVerified: false,
                        status: 'PENDING_VERIFICATION',
                        lastActive: new Date(),
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                });
                console.log('✅ Debug signup: User created with ID:', user.id);

                // Create profile based on role
                if (body.role === 'CLIENT') {
                    console.log('🏠 Debug signup: Creating client profile');
                    const client = await tx.client.create({
                        data: {
                            id: uuidv4(),
                            email: body.email,
                            name: body.name,
                            phone: body.phone,
                            phoneVerified: false,
                            status: 'PENDING_VERIFICATION',
                            country: 'Ghana',
                            profileCompleted: false,
                            lastActive: new Date(),
                            createdAt: new Date(),
                            updatedAt: new Date(),
                        },
                    });
                    console.log('✅ Debug signup: Client created with ID:', client.id);

                    console.log('🔗 Debug signup: Creating user-client profile link');
                    await tx.userClientProfile.create({
                        data: {
                            id: uuidv4(),
                            userId: user.id,
                            clientId: client.id,
                            createdAt: new Date(),
                        },
                    });
                    console.log('✅ Debug signup: User-client profile link created');

                    console.log('💰 Debug signup: Creating client wallet');
                    await tx.clientWallet.create({
                        data: {
                            id: uuidv4(),
                            clientId: client.id,
                            balance: 0.0,
                            currency: 'GHS',
                            escrowBalance: 0.0,
                            canWithdraw: true,
                            createdAt: new Date(),
                            updatedAt: new Date(),
                        },
                    });
                    console.log('✅ Debug signup: Client wallet created');
                }

                return user;
            });

            console.log('🎉 Debug signup: Transaction completed successfully');

            return NextResponse.json({
                success: true,
                message: 'Signup completed successfully',
                user: {
                    id: result.id,
                    email: result.email,
                    name: result.name,
                    roles: result.roles
                }
            });

        } catch (transactionError) {
            console.error('❌ Debug signup: Transaction failed:', transactionError);
            return NextResponse.json({
                success: false,
                error: 'Database transaction failed',
                step: 'database_transaction',
                details: transactionError instanceof Error ? transactionError.message : 'Unknown error',
                stack: transactionError instanceof Error ? transactionError.stack : undefined
            }, { status: 500 });
        }

    } catch (error) {
        console.error('❌ Debug signup: Unexpected error:', error);
        return NextResponse.json({
            success: false,
            error: 'Unexpected error occurred',
            step: 'unexpected_error',
            details: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        }, { status: 500 });
    }
} 