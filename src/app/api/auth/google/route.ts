import { NextRequest, NextResponse } from 'next/server';

// Mark this route as dynamic to handle searchParams during static generation
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const role = searchParams.get('role') || 'CLIENT';
    const redirectPath = searchParams.get('redirect') || '/';

    // Google OAuth configuration
    const googleClientId = process.env.GOOGLE_CLIENT_ID;

    if (!googleClientId) {
      return NextResponse.json(
        { success: false, error: 'Google OAuth not configured' },
        { status: 500 }
      );
    }

    // Store role and redirect in state parameter
    const state = Buffer.from(JSON.stringify({ role, redirectPath })).toString('base64');

    // Google OAuth parameters
    const params = new URLSearchParams({
      client_id: googleClientId,
      redirect_uri: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/google/callback`,
      response_type: 'code',
      scope: 'openid email profile',
      state: state,
    });

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

    return NextResponse.redirect(googleAuthUrl);

  } catch (error) {
    console.error('Google OAuth redirect error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to initiate Google OAuth' },
      { status: 500 }
    );
  }
} 