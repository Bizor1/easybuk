import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './jwt';
import type { UserRole, ApiResponse, ApiError } from '@/types';

// API Error Classes
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(400, 'VALIDATION_ERROR', message, details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(401, 'AUTHENTICATION_ERROR', message);
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(403, 'AUTHORIZATION_ERROR', message);
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(404, 'NOT_FOUND', `${resource} not found`);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, 'CONFLICT', message);
  }
}

// Authentication middleware
export async function requireAuth(request: NextRequest) {
  // Try Authorization header first
  const authHeader = request.headers.get('authorization');
  let token = authHeader?.replace('Bearer ', '');

  // If no Bearer token, try cookies
  if (!token) {
    token = request.cookies.get('auth-token')?.value;
  }

  if (!token) {
    throw new AuthenticationError('No token provided');
  }

  try {
    const payload = verifyToken(token);
    if (!payload) {
      throw new AuthenticationError('Invalid token');
    }
    return payload;
  } catch (error) {
    throw new AuthenticationError('Invalid token');
  }
}

// Role-based authorization middleware
export function requireRole(roles: UserRole[]) {
  return async (request: NextRequest, userPayload: any) => {
    if (!userPayload.roles || !Array.isArray(userPayload.roles)) {
      throw new AuthorizationError('No roles found');
    }

    const hasRole = roles.some(role => userPayload.roles.includes(role));
    if (!hasRole) {
      throw new AuthorizationError(`Requires one of: ${roles.join(', ')}`);
    }

    return userPayload;
  };
}

// Input validation middleware
export function validateRequest<T>(schema: any) {
  return async (request: NextRequest): Promise<T> => {
    try {
      const body = await request.json();

      // Basic validation - in production, use a library like Zod or Joi
      if (!body || typeof body !== 'object') {
        throw new ValidationError('Invalid request body');
      }

      return body as T;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new ValidationError('Invalid JSON in request body');
    }
  };
}

// Rate limiting middleware (basic implementation)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(maxRequests: number, windowMs: number) {
  return async (request: NextRequest) => {
    const ip = request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';

    const now = Date.now();
    const windowStart = now - windowMs;

    const requestInfo = requestCounts.get(ip);

    if (!requestInfo || requestInfo.resetTime < windowStart) {
      requestCounts.set(ip, { count: 1, resetTime: now });
      return;
    }

    if (requestInfo.count >= maxRequests) {
      throw new AppError(429, 'RATE_LIMIT_EXCEEDED', 'Too many requests');
    }

    requestInfo.count++;
  };
}

// Error handler wrapper
export function withErrorHandler(handler: Function) {
  return async (request: NextRequest, context?: any) => {
    try {
      return await handler(request, context);
    } catch (error) {
      console.error('API Error:', error);

      if (error instanceof AppError) {
        return NextResponse.json(
          {
            success: false,
            error: error.code,
            message: error.message,
            details: error.details
          } as ApiResponse,
          { status: error.statusCode }
        );
      }

      // Unexpected errors
      return NextResponse.json(
        {
          success: false,
          error: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred'
        } as ApiResponse,
        { status: 500 }
      );
    }
  };
}

// Success response helper
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }
): NextResponse {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
    pagination
  };

  return NextResponse.json(response);
}

// Pagination helper
export function calculatePagination(page: number, limit: number, total: number) {
  const totalPages = Math.ceil(total / limit);

  return {
    page: Math.max(1, page),
    limit: Math.max(1, Math.min(100, limit)), // Max 100 items per page
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1
  };
}

// Extract query parameters with defaults
export function getQueryParams(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  return {
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '20'),
    search: searchParams.get('search') || '',
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc',
    filters: Object.fromEntries(
      Array.from(searchParams.entries()).filter(([key]) =>
        !['page', 'limit', 'search', 'sortBy', 'sortOrder'].includes(key)
      )
    )
  };
}

// CORS headers helper
export function addCorsHeaders(response: NextResponse): NextResponse {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

// Options handler for CORS
export async function handleOptions(): Promise<NextResponse> {
  const response = new NextResponse(null, { status: 200 });
  return addCorsHeaders(response);
} 