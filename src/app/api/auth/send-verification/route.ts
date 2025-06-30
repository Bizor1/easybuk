import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

// Mark this route as dynamic to handle request body
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('=== EMAIL VERIFICATION REQUEST START ===');

    // Safely parse JSON body - handle empty/malformed requests
    let body: any = {};
    let requestEmail = null;

    try {
      const rawBody = await request.text();
      console.log('Raw request body:', rawBody);

      if (rawBody && rawBody.trim()) {
        body = JSON.parse(rawBody);
        requestEmail = body?.email || null;
      }
    } catch (jsonError) {
      console.log('No JSON body or malformed JSON - treating as authenticated request');
      // This is fine - might be an authenticated request without body
    }

    // Try to get user from token first (for authenticated requests)
    const tokenPayload = getCurrentUser(request);
    console.log('Token:', tokenPayload?.userId ? 'Found' : 'Missing');
    console.log('Request email:', requestEmail);

    let user;

    if (tokenPayload?.userId) {
      // Authenticated request - get user from token
      console.log('Authenticated request - looking up user:', tokenPayload.userId);
      user = await prisma.user.findUnique({
        where: { id: tokenPayload.userId }
      });
    } else if (requestEmail) {
      // Unauthenticated request - get user from email (signup flow)
      console.log('Unauthenticated request - looking up user by email:', requestEmail);
      user = await prisma.user.findUnique({
        where: { email: requestEmail }
      });
    } else {
      console.log('ERROR: No authentication token and no email provided');
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      );
    }

    console.log('User found:', user ? `${user.name} (${user.email})` : 'None');

    if (!user) {
      console.log('ERROR: User not found in database');
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Generate verification token
    const verificationToken = `VER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log('Generated token:', verificationToken);

    // Store verification token in database
    console.log('Attempting to store verification token in database...');
    try {
      await prisma.verificationToken.create({
        data: {
          id: `VTOKEN_${Date.now()}`,
          identifier: user.email,
          token: verificationToken,
          type: 'EMAIL_VERIFICATION',
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          userId: user.id
        }
      });
      console.log('✅ Verification token stored successfully');
    } catch (dbError) {
      console.error('❌ Database error storing token:', dbError);
      throw dbError;
    }

    // Send verification email
    try {
      const verificationLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/verify-email?token=${verificationToken}`;

      console.log('Attempting to send email to:', user.email);
      console.log('Verification link:', verificationLink);
      console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL);

      const emailResult = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/internal/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: user.email,
          type: 'email_verification',
          data: {
            userName: user.name,
            verificationLink: verificationLink,
            verificationToken
          }
        })
      });

      const emailResponse = await emailResult.json();
      console.log('Email API response status:', emailResult.status);
      console.log('Email API response:', emailResponse);

      if (!emailResult.ok) {
        throw new Error(`Email sending failed: ${emailResponse.error || 'Unknown error'}`);
      }

      console.log('✅ Email sent successfully!');

      return NextResponse.json({
        success: true,
        message: 'Verification email sent successfully! Please check your inbox.',
        verificationToken: verificationToken, // For demo purposes only
        verificationLink: verificationLink // For demo purposes only
      });

    } catch (emailError) {
      console.error('❌ Failed to send verification email:', emailError);
      console.error('Email error details:', emailError instanceof Error ? emailError.message : emailError);

      // If email fails, clean up the token
      try {
        await prisma.verificationToken.deleteMany({
          where: {
            token: verificationToken,
            used: false
          }
        });
        console.log('🗑️ Cleaned up verification token after email failure');
      } catch (cleanupError) {
        console.error('Failed to cleanup token:', cleanupError);
      }

      return NextResponse.json(
        {
          error: 'Failed to send verification email',
          details: emailError instanceof Error ? emailError.message : 'Unknown error'
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('❌ MAIN ERROR in send verification:', error);
    console.error('Error details:', error instanceof Error ? error.message : error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');

    return NextResponse.json(
      {
        error: 'Failed to send verification email',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 