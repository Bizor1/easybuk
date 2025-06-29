import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, generateAccessToken, setAuthCookies } from '@/lib/jwt';
import { AuthService } from '@/lib/auth';
import { UserRole } from '@/types/auth';

export async function POST(request: NextRequest) {
  try {
    // Get current user from JWT
    const tokenPayload = getCurrentUser(request);
    
    if (!tokenPayload) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { role }: { role: UserRole } = body;
    
    // Validate role
    if (!role || !['CLIENT', 'PROVIDER'].includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Invalid role specified' },
        { status: 400 }
      );
    }

    // Add role to user
    const result = await AuthService.addRoleToUser(tokenPayload.userId, role);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    // Get updated user session
    const userSession = await AuthService.getUserSession(tokenPayload.userId);
    
    if (!userSession) {
      return NextResponse.json(
        { success: false, error: 'Failed to retrieve updated user' },
        { status: 500 }
      );
    }

    // Generate new access token with updated roles
    const newAccessToken = generateAccessToken({
      userId: userSession.userId,
      email: userSession.email,
      roles: userSession.roles
    });

    // Create response with updated user data
    const response = NextResponse.json({
      success: true,
      user: userSession,
      message: `${role} role added successfully`
    });

    // Update cookies with new token
    const refreshToken = request.cookies.get('refresh-token')?.value || '';
    response.cookies.set('auth-token', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    if (refreshToken) {
      response.cookies.set('refresh-token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/',
      });
    }

    return response;

  } catch (error) {
    console.error('Add role API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 