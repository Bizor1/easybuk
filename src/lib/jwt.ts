import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { TokenPayload, UserRole } from '@/types/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRY = '7d'; // 7 days
const REFRESH_TOKEN_EXPIRY = '30d'; // 30 days

export interface JWTPayload extends TokenPayload {
  type: 'access' | 'refresh';
}

/**
 * Generate access token for authenticated user
 */
export function generateAccessToken(payload: {
  userId: string;
  email: string;
  roles: UserRole[];
}): string {
  return jwt.sign(
    {
      ...payload,
      type: 'access',
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRY,
      issuer: 'easybuk',
      audience: 'easybuk-users',
    }
  );
}

/**
 * Generate refresh token for token renewal
 */
export function generateRefreshToken(payload: {
  userId: string;
  email: string;
}): string {
  return jwt.sign(
    {
      ...payload,
      type: 'refresh',
    },
    JWT_SECRET,
    {
      expiresIn: REFRESH_TOKEN_EXPIRY,
      issuer: 'easybuk',
      audience: 'easybuk-users',
    }
  );
}

/**
 * Verify and decode JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'easybuk',
      audience: 'easybuk-users',
    }) as JWTPayload;
    
    return decoded;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

/**
 * Extract token from Authorization header or cookies
 */
export function extractToken(request: NextRequest): string | null {
  // Try Authorization header first
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Try cookies
  const token = request.cookies.get('auth-token')?.value;
  return token || null;
}

/**
 * Set authentication cookies
 */
export function setAuthCookies(accessToken: string, refreshToken: string) {
  const cookieStore = cookies();
  
  // Set access token cookie
  cookieStore.set('auth-token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    path: '/',
  });

  // Set refresh token cookie
  cookieStore.set('refresh-token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
    path: '/',
  });
}

/**
 * Clear authentication cookies
 */
export function clearAuthCookies() {
  console.log('🧹 JWT: Clearing authentication cookies');
  const cookieStore = cookies();
  
  cookieStore.set('auth-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });

  cookieStore.set('refresh-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
  
  console.log('✅ JWT: Auth cookies cleared');
}

/**
 * Get current user from request
 */
export function getCurrentUser(request: NextRequest): JWTPayload | null {
  const token = extractToken(request);
  if (!token) return null;
  
  return verifyToken(token);
}

/**
 * Check if user has required role
 */
export function hasRole(user: JWTPayload | null, requiredRole: UserRole): boolean {
  if (!user) return false;
  return user.roles.includes(requiredRole);
}

/**
 * Check if user has any of the required roles
 */
export function hasAnyRole(user: JWTPayload | null, requiredRoles: UserRole[]): boolean {
  if (!user) return false;
  return requiredRoles.some(role => user.roles.includes(role));
} 