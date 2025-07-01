import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

// Mark this route as dynamic to handle request body
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  console.log('🔔 EMAIL_VERIFICATION: Starting email verification process');

  try {
    console.log('📧 EMAIL_VERIFICATION: === NEW VERSION 2.0 STARTING ===');

    console.log('📥 EMAIL_VERIFICATION: Parsing request body');

    // Safely parse JSON body - handle empty/malformed requests
    const body: any = {};
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
      // Always use the main production URL for consistency
      const origin = 'https://easybuk.vercel.app';

      const verificationLink = `${origin}/auth/verify-email?token=${verificationToken}`;

      console.log('📧 EMAIL_VERIFICATION: Email details:');
      console.log('   - To:', user.email);
      console.log('   - Origin:', origin);
      console.log('   - Verification link:', verificationLink);

      // Use direct email approach to avoid internal fetch routing issues
      console.log('📧 EMAIL_VERIFICATION: Using direct email approach');

      try {
        const nodemailer = await import('nodemailer');

        const emailUser = process.env.EMAIL_SERVER_USER;
        const emailPass = process.env.EMAIL_SERVER_PASSWORD;

        if (!emailUser || !emailPass) {
          throw new Error('SMTP credentials not configured');
        }

        console.log('📧 EMAIL_VERIFICATION: Creating transporter...');
        const transporter = nodemailer.default.createTransporter({
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          auth: { user: emailUser, pass: emailPass },
        });

        const htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0;">EasyBuk</h1>
            </div>
            <div style="padding: 30px; background: #f8f9fa;">
              <h2 style="color: #333;">Hi ${user.name || 'there'}! 👋</h2>
              <p style="font-size: 16px; line-height: 1.6; color: #555;">
                Please verify your email address to complete your EasyBuk account setup.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationLink}" 
                   style="background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                  Verify Email Address
                </a>
              </div>
              <p style="color: #666; font-size: 14px;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${verificationLink}" style="color: #007bff;">${verificationLink}</a>
              </p>
              <p style="color: #666; font-size: 14px;">
                This verification link will expire in 24 hours for security reasons.
              </p>
            </div>
            <div style="padding: 20px; text-align: center; color: #888; background: #e9ecef;">
              <p style="margin: 0; font-size: 14px;">
                This is an automated message from EasyBuk. Please do not reply to this email.
              </p>
            </div>
          </div>
        `;

        console.log('📧 EMAIL_VERIFICATION: Sending email directly via SMTP...');
        const result = await transporter.sendMail({
          from: `"EasyBuk" <${emailUser}>`,
          to: user.email,
          subject: '✉️ Verify Your EasyBuk Account Email',
          html: htmlContent
        });

        console.log('✅ EMAIL_VERIFICATION: Direct email sent successfully:', result.messageId);

        return NextResponse.json({
          success: true,
          message: 'Verification email sent successfully! Please check your inbox.',
          verificationToken: verificationToken,
          verificationLink: verificationLink
        });

      } catch (directEmailError) {
        console.error('❌ EMAIL_VERIFICATION: Direct email failed:', directEmailError);
        throw new Error(`[NEW_VERSION_2.0] Direct email failed: ${directEmailError instanceof Error ? directEmailError.message : 'Unknown error'}`);
      }

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
          details: `[NEW_VERSION_2.0] ${emailError instanceof Error ? emailError.message : 'Unknown error'}`,
          version: 'NEW_VERSION_2.0'
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
        details: `[NEW_VERSION_2.0] ${error instanceof Error ? error.message : 'Unknown error'}`,
        version: 'NEW_VERSION_2.0'
      },
      { status: 500 }
    );
  }
} 