import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

// Mark this route as dynamic to handle request body
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  console.log('🔔 EMAIL_VERIFICATION: Starting email verification process');

  try {
    console.log('📥 EMAIL_VERIFICATION: Parsing request body');

    // Safely parse JSON body - handle empty/malformed requests
    let body: any = {};
    let requestEmail = null;

    try {
      const rawBody = await request.text();
      console.log('📄 EMAIL_VERIFICATION: Raw request body length:', rawBody.length);

      if (rawBody && rawBody.trim()) {
        body = JSON.parse(rawBody);
        requestEmail = body?.email || null;
        console.log('📧 EMAIL_VERIFICATION: Extracted email:', requestEmail);
      }
    } catch (jsonError) {
      console.log('⚠️ EMAIL_VERIFICATION: No JSON body or malformed JSON - treating as authenticated request');
      // This is fine - might be an authenticated request without body
    }

    // Try to get user from token first (for authenticated requests)
    console.log('🔐 EMAIL_VERIFICATION: Getting user authentication');
    let tokenPayload = null;

    try {
      tokenPayload = getCurrentUser(request);
      console.log('🎫 EMAIL_VERIFICATION: Token payload:', tokenPayload?.userId ? 'Found user ID' : 'No user ID');
    } catch (tokenError) {
      console.log('⚠️ EMAIL_VERIFICATION: Token parsing failed:', tokenError instanceof Error ? tokenError.message : 'Unknown error');
    }

    console.log('📧 EMAIL_VERIFICATION: Request email from body:', requestEmail);

    let user;

    if (tokenPayload?.userId) {
      // Authenticated request - get user from token
      console.log('🔍 EMAIL_VERIFICATION: Authenticated request - looking up user:', tokenPayload.userId);
      try {
        user = await prisma.user.findUnique({
          where: { id: tokenPayload.userId }
        });
        console.log('✅ EMAIL_VERIFICATION: User found by token:', !!user);
      } catch (dbError) {
        console.error('❌ EMAIL_VERIFICATION: Database error finding user by token:', dbError);
        throw dbError;
      }
    } else if (requestEmail) {
      // Unauthenticated request - get user from email (signup flow)
      console.log('🔍 EMAIL_VERIFICATION: Unauthenticated request - looking up user by email:', requestEmail);
      try {
        user = await prisma.user.findUnique({
          where: { email: requestEmail }
        });
        console.log('✅ EMAIL_VERIFICATION: User found by email:', !!user);
      } catch (dbError) {
        console.error('❌ EMAIL_VERIFICATION: Database error finding user by email:', dbError);
        throw dbError;
      }
    } else {
      console.log('❌ EMAIL_VERIFICATION: No authentication token and no email provided');
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
    console.log('📧 EMAIL_VERIFICATION: Starting email sending process');
    try {
      // Get the current origin from the request - ensure production URL on Vercel
      let origin = request.headers.get('origin') || request.url.split('/api')[0];

      // Fix for Vercel deployment - always use production URL
      if (process.env.VERCEL_URL) {
        origin = `https://${process.env.VERCEL_URL}`;
      } else if (process.env.NODE_ENV === 'production' && !origin.includes('easybuk.vercel.app')) {
        origin = 'https://easybuk.vercel.app';
      }

      const verificationLink = `${origin}/auth/verify-email?token=${verificationToken}`;

      console.log('📧 EMAIL_VERIFICATION: Email details:');
      console.log('   - To:', user.email);
      console.log('   - Origin:', origin);
      console.log('   - Verification link:', verificationLink);

      console.log('📡 EMAIL_VERIFICATION: Making request to internal email API');
      const emailPayload = {
        to: user.email,
        type: 'email_verification',
        data: {
          userName: user.name,
          verificationLink: verificationLink,
          verificationToken
        }
      };
      console.log('📦 EMAIL_VERIFICATION: Email payload prepared');

      const emailResult = await fetch(`${origin}/api/internal/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailPayload)
      });

      console.log('📊 EMAIL_VERIFICATION: Email API response status:', emailResult.status);
      console.log('📊 EMAIL_VERIFICATION: Email API response ok:', emailResult.ok);

      // Read response body only once
      const responseText = await emailResult.text();
      console.log('📄 EMAIL_VERIFICATION: Raw email API response length:', responseText.length);

      let emailResponse;
      try {
        emailResponse = JSON.parse(responseText);
        console.log('📦 EMAIL_VERIFICATION: Email API response data:', emailResponse);
      } catch (parseError) {
        console.error('❌ EMAIL_VERIFICATION: Failed to parse email API response as JSON:', parseError);
        console.error('📄 EMAIL_VERIFICATION: Raw email API response:', responseText.substring(0, 500));
        throw new Error(`Email API returned non-JSON response: ${responseText.substring(0, 100)}`);
      }

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
    console.error('🚨 EMAIL_VERIFICATION: MAIN ERROR in send verification:', error);
    console.error('🚨 EMAIL_VERIFICATION: Error name:', error instanceof Error ? error.name : 'Unknown');
    console.error('🚨 EMAIL_VERIFICATION: Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('🚨 EMAIL_VERIFICATION: Error stack:', error instanceof Error ? error.stack : 'No stack trace');

    return NextResponse.json(
      {
        error: 'Failed to send verification email',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 