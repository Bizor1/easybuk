import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { setAuthCookies } from '@/lib/jwt';
import { UserRole } from '@/types/auth';

// Mark this route as dynamic to handle searchParams
export const dynamic = 'force-dynamic';

// Function to determine redirect path based on user role
function getRedirectPath(user: any, originalRedirectPath: string): string {
  // If redirect is not 'auto', use the original path
  if (originalRedirectPath !== 'auto' && originalRedirectPath !== '/') {
    return originalRedirectPath;
  }

  // Check active role first, then fallback to first role
  const role = user.activeRole || user.roles[0];

  switch (role) {
    case 'PROVIDER':
      return '/provider/dashboard';
    case 'CLIENT':
      return '/explore';
    case 'ADMIN':
      return '/admin/dashboard'; // Assuming admin dashboard exists
    default:
      return '/explore'; // Default fallback
  }
}

// Helper function to get base URL
function getBaseUrl(request: NextRequest): string {
  const host = request.headers.get('host') || 'localhost:3000';
  const protocol = request.headers.get('x-forwarded-proto') || 'http';
  return `${protocol}://${host}`;
}

export async function GET(request: NextRequest) {
  const baseUrl = getBaseUrl(request);
  console.log('🔗 GoogleAuth: Callback started, baseUrl:', baseUrl);
  
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    console.log('📥 GoogleAuth: Received params - code:', !!code, 'state:', !!state, 'error:', error);

    if (error) {
      console.log('❌ GoogleAuth: OAuth error received:', error);
      return NextResponse.redirect(`${baseUrl}/auth/login?error=${encodeURIComponent('Google authentication failed')}`);
    }

    if (!code) {
      console.log('❌ GoogleAuth: No authorization code received');
      return NextResponse.redirect(`${baseUrl}/auth/login?error=${encodeURIComponent('No authorization code received')}`);
    }

    // Decode state parameter
    let role: UserRole = 'CLIENT';
    let redirectPath = '/';
    
    if (state) {
      try {
        const decodedState = JSON.parse(Buffer.from(state, 'base64').toString());
        role = decodedState.role || 'CLIENT';
        redirectPath = decodedState.redirectPath || '/';
        console.log('📦 GoogleAuth: Decoded state - role:', role, 'redirectPath:', redirectPath);
      } catch (error) {
        console.error('🚨 GoogleAuth: Failed to decode state:', error);
      }
    }

    console.log('🔄 GoogleAuth: Exchanging code for tokens...');
    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${process.env.NEXTAUTH_URL || baseUrl}/api/auth/google/callback`,
      }),
    });

    if (!tokenResponse.ok) {
      console.error('❌ GoogleAuth: Token exchange failed:', await tokenResponse.text());
      return NextResponse.redirect(`${baseUrl}/auth/login?error=${encodeURIComponent('Failed to exchange authorization code')}`);
    }

    const tokenData = await tokenResponse.json();
    console.log('✅ GoogleAuth: Token exchange successful');

    console.log('👤 GoogleAuth: Fetching user info from Google...');
    // Get user information from Google
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    if (!userResponse.ok) {
      console.error('❌ GoogleAuth: User info fetch failed:', await userResponse.text());
      return NextResponse.redirect(`${baseUrl}/auth/login?error=${encodeURIComponent('Failed to get user information')}`);
    }

    const googleUser = await userResponse.json();
    console.log('👤 GoogleAuth: User info received:', {
      email: googleUser.email,
      name: googleUser.name,
      id: googleUser.id
    });

    console.log('🔐 GoogleAuth: Authenticating with AuthService...');
    // Authenticate user with our service
    const authResult = await AuthService.googleAuth({
      email: googleUser.email,
      name: googleUser.name,
      image: googleUser.picture,
      googleId: googleUser.id,
      role: role as UserRole,
    });

    console.log('📊 GoogleAuth: AuthService result:', {
      success: authResult.success,
      hasUser: !!authResult.user,
      hasTokens: !!authResult.tokens,
      error: authResult.error
    });

    if (!authResult.success) {
      console.log('❌ GoogleAuth: Authentication failed:', authResult.error);
      return NextResponse.redirect(`${baseUrl}/auth/login?error=${encodeURIComponent(authResult.error || 'Authentication failed')}`);
    }

    // Determine the final redirect path based on user role
    let finalRedirectPath = redirectPath;
    
    if (redirectPath === 'auto' || redirectPath === '/') {
      finalRedirectPath = getRedirectPath(authResult.user, redirectPath);
    }

    console.log('🎯 GoogleAuth: Redirecting to:', finalRedirectPath);

    // Create redirect response with absolute URL
    const redirectResponse = NextResponse.redirect(`${baseUrl}${finalRedirectPath}`);

    // Set authentication cookies directly in the response headers
    if (authResult.tokens) {
      const isProduction = process.env.NODE_ENV === 'production';
      console.log('🍪 GoogleAuth: Setting auth cookies, isProduction:', isProduction);
      
      // Set access token cookie
      redirectResponse.cookies.set('auth-token', authResult.tokens.accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
        path: '/',
      });

      // Set refresh token cookie
      redirectResponse.cookies.set('refresh-token', authResult.tokens.refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
        path: '/',
      });
      
      console.log('✅ GoogleAuth: Cookies set successfully');
    } else {
      console.log('⚠️ GoogleAuth: No tokens to set as cookies');
    }

    console.log('✅ GoogleAuth: Callback completed successfully');
    return redirectResponse;

  } catch (error) {
    console.error('🚨 GoogleAuth: Callback error:', error);
    return NextResponse.redirect(`${baseUrl}/auth/login?error=${encodeURIComponent('An unexpected error occurred')}`);
  }
} 