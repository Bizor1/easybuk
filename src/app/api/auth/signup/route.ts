import { NextRequest, NextResponse } from 'next/server';
// Remove top-level imports that might be causing issues

// Mark this route as dynamic to handle request body and cookies
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  console.log('🔄 SIGNUP: Starting signup process');

  try {
    console.log('📥 SIGNUP: Parsing request body');
    const body = await request.json();
    console.log('📝 SIGNUP: Body received:', {
      email: body.email,
      name: body.name,
      role: body.role,
      hasPassword: !!body.password,
      hasPhone: !!body.phone
    });

    // Validate input
    console.log('✅ SIGNUP: Starting input validation');
    if (!body.email || !body.password || !body.name || !body.role) {
      console.log('❌ SIGNUP: Missing required fields');
      return NextResponse.json(
        { success: false, error: 'Email, password, name, and role are required' },
        { status: 400 }
      );
    }
    console.log('✅ SIGNUP: Required fields present');

    // Validate email format
    console.log('📧 SIGNUP: Validating email format');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      console.log('❌ SIGNUP: Invalid email format:', body.email);
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }
    console.log('✅ SIGNUP: Email format valid');

    // Validate password strength
    console.log('🔐 SIGNUP: Validating password strength');
    if (body.password.length < 6) {
      console.log('❌ SIGNUP: Password too short, length:', body.password.length);
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }
    console.log('✅ SIGNUP: Password strength valid');

    // Validate role
    console.log('🏷️ SIGNUP: Validating role');
    if (!['CLIENT', 'PROVIDER'].includes(body.role)) {
      console.log('❌ SIGNUP: Invalid role:', body.role);
      return NextResponse.json(
        { success: false, error: 'Invalid role specified' },
        { status: 400 }
      );
    }
    console.log('✅ SIGNUP: Role valid:', body.role);

    // Attempt signup - import AuthService dynamically
    console.log('📦 SIGNUP: Importing AuthService dynamically');
    const { AuthService } = await import('@/lib/auth');
    console.log('✅ SIGNUP: AuthService imported successfully');

    console.log('🚀 SIGNUP: Calling AuthService.signup');
    const result = await AuthService.signup(body);
    console.log('📊 SIGNUP: AuthService.signup completed:', {
      success: result.success,
      hasUser: !!result.user,
      hasTokens: !!result.tokens,
      error: result.error
    });

    if (!result.success) {
      console.log('❌ SIGNUP: AuthService.signup failed:', result.error);
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }
    console.log('✅ SIGNUP: AuthService.signup successful');

    // Automatically send verification email after successful signup
    console.log('📧 SIGNUP: Starting verification email process');
    try {
      console.log('📧 SIGNUP: Automatically sending verification email to:', body.email);

      // Get the current origin from the request
      const origin = request.headers.get('origin') || request.url.split('/api')[0];
      console.log('🌐 SIGNUP: Using origin for email API call:', origin);

      const emailResponse = await fetch(`${origin}/api/auth/send-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: body.email })
      });
      console.log('📧 SIGNUP: Email API response status:', emailResponse.status);

      const emailResult = await emailResponse.json();
      console.log('📧 SIGNUP: Email API response:', {
        success: emailResult.success,
        error: emailResult.error
      });

      if (emailResponse.ok) {
        console.log('✅ SIGNUP: Verification email sent successfully during signup');
      } else {
        console.error('❌ SIGNUP: Failed to send verification email during signup:', emailResult.error);
        // Don't fail signup if email fails, just log it
      }
    } catch (emailError) {
      console.error('❌ SIGNUP: Error sending verification email during signup:', emailError);
      // Don't fail signup if email fails, just log it
    }

    // Create success response
    console.log('🎉 SIGNUP: Creating success response');
    const response = NextResponse.json({
      success: true,
      user: result.user
    });

    // Set cookies directly in response headers
    console.log('🍪 SIGNUP: Setting authentication cookies');
    if (result.tokens) {
      const isProduction = process.env.NODE_ENV === 'production';
      console.log('🍪 SIGNUP: Environment is production:', isProduction);

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
      console.log('✅ SIGNUP: Authentication cookies set');
    } else {
      console.log('⚠️ SIGNUP: No tokens to set in cookies');
    }

    console.log('🎊 SIGNUP: Signup process completed successfully');
    return response;

  } catch (error) {
    console.error('🚨 SIGNUP: Top-level signup error:', error);
    console.error('🚨 SIGNUP: Error name:', error instanceof Error ? error.name : 'Unknown');
    console.error('🚨 SIGNUP: Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('🚨 SIGNUP: Error stack:', error instanceof Error ? error.stack : 'No stack trace');

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 