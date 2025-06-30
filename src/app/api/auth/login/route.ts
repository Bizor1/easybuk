import { NextRequest, NextResponse } from 'next/server';
// Remove top-level imports that might be causing issues

// Mark this route as dynamic to handle request body and cookies
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('=== LOGIN REQUEST START ===');
    const body = await request.json();
    console.log('Login attempt for email:', body.email);

    // Validate input
    if (!body.email || !body.password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Attempt login - import AuthService dynamically
    const { AuthService } = await import('@/lib/auth');
    const result = await AuthService.login(body);
    console.log('Login result success:', result.success);
    console.log('Login result has tokens:', !!result.tokens);
    console.log('Login result has user:', !!result.user);

    if (!result.success) {
      console.log('Login failed:', result.error);
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 401 }
      );
    }

    // Create success response
    const response = NextResponse.json({
      success: true,
      user: result.user
    });

    // Set cookies directly in response headers
    if (result.tokens) {
      const isProduction = process.env.NODE_ENV === 'production';
      console.log('Setting cookies. isProduction:', isProduction);
      console.log('Access token length:', result.tokens.accessToken.length);
      console.log('Refresh token length:', result.tokens.refreshToken.length);

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

      console.log('Cookies set successfully');
    } else {
      console.log('WARNING: No tokens to set as cookies');
    }

    console.log('=== LOGIN REQUEST END ===');
    return response;

  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 