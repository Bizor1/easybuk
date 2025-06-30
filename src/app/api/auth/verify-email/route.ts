import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Mark this route as dynamic to handle request body
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    // Find the verification token
    const verificationRecord = await prisma.verificationToken.findUnique({
      where: { token },
      include: { User: true }
    });

    if (!verificationRecord) {
      return NextResponse.json(
        { error: 'Invalid verification token' },
        { status: 400 }
      );
    }

    // Check if token is expired
    if (verificationRecord.expires < new Date()) {
      // Clean up expired token
      await prisma.verificationToken.delete({
        where: { id: verificationRecord.id }
      });

      return NextResponse.json(
        { error: 'Verification token has expired', expired: true },
        { status: 400 }
      );
    }

    // Check if token is already used
    if (verificationRecord.used) {
      return NextResponse.json(
        { error: 'Verification token has already been used' },
        { status: 400 }
      );
    }

    // Verify the email
    await prisma.user.update({
      where: { id: verificationRecord.userId! },
      data: { emailVerified: new Date() }
    });

    // Mark token as used
    await prisma.verificationToken.update({
      where: { id: verificationRecord.id },
      data: { used: true }
    });

    console.log(`Email verified for user ${verificationRecord.userId}`);

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully! You can now continue with your account setup.'
    });

  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify email' },
      { status: 500 }
    );
  }
} 