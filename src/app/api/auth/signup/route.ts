import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { SignupData } from '@/types/auth';

// Mark this route as dynamic to handle request body and cookies
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body: SignupData = await request.json();

    // Validate input
    if (!body.email || !body.password || !body.name || !body.role) {
      return NextResponse.json(
        { success: false, error: 'Email, password, name, and role are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (body.password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Validate role
    if (!['CLIENT', 'PROVIDER'].includes(body.role)) {
      return NextResponse.json(
        { success: false, error: 'Invalid role specified' },
        { status: 400 }
      );
    }

    // Attempt signup
    const result = await AuthService.signup(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    // Automatically send verification email after successful signup
    try {
      console.log('📧 Automatically sending verification email to:', body.email);

      const emailResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/send-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: body.email })
      });

      const emailResult = await emailResponse.json();

      if (emailResponse.ok) {
        console.log('✅ Verification email sent successfully during signup');
      } else {
        console.error('❌ Failed to send verification email during signup:', emailResult.error);
        // Don't fail signup if email fails, just log it
      }
    } catch (emailError) {
      console.error('❌ Error sending verification email during signup:', emailError);
      // Don't fail signup if email fails, just log it
    }

    // Create success response
    const response = NextResponse.json({
      success: true,
      user: result.user
    });

    // Set cookies directly in response headers
    if (result.tokens) {
      const isProduction = process.env.NODE_ENV === 'production';

      response.cookies.set('auth-token', result.tokens.accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
        path: '/',
      });

      response.cookies.set('refresh-token', result.tokens.refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
        path: '/',
      });
    }

    return response;

  } catch (error) {
    console.error('Signup API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 