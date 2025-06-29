import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, extractToken } from '@/lib/jwt';
import { AuthService } from '@/lib/auth';

// Mark this route as dynamic to handle headers/cookies
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('=== AUTH ME REQUEST START ===');
    
    // Debug: Check what cookies are available
    const cookies = request.cookies.getAll();
    console.log('Available cookies:', cookies.map(c => ({ name: c.name, hasValue: !!c.value })));
    
    // Debug: Check auth-token specifically
    const authTokenCookie = request.cookies.get('auth-token');
    console.log('Auth token cookie:', authTokenCookie ? 'Found' : 'Missing');
    
    // Debug: Check Authorization header
    const authHeader = request.headers.get('authorization');
    console.log('Authorization header:', authHeader ? 'Found' : 'Missing');
    
    // Try to extract token
    const token = extractToken(request);
    console.log('Extracted token:', token ? 'Found' : 'Missing');
    
    // Use the custom JWT verification instead of NextAuth
    const tokenPayload = getCurrentUser(request);
    console.log('Token payload:', tokenPayload ? 'Valid' : 'Invalid');
    
    if (!tokenPayload) {
      console.log('ERROR: No valid token payload found');
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    // Get full user session using the AuthService
    const userSession = await AuthService.getUserSession(tokenPayload.userId);
    console.log('User session:', userSession ? 'Found' : 'Not found');
    
    if (!userSession) {
      console.log('ERROR: User session not found for userId:', tokenPayload.userId);
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    console.log('SUCCESS: Returning user session');
    return NextResponse.json({
      success: true,
      user: userSession
    });
  } catch (error) {
    console.error('Auth me error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 