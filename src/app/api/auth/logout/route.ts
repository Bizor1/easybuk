import { NextResponse } from 'next/server';
import { clearAuthCookies } from '@/lib/jwt';

export async function POST() {
  console.log('🚪 Logout API: Starting logout process');
  try {
    // Clear authentication cookies
    console.log('🍪 Logout API: Clearing auth cookies');
    clearAuthCookies();

    console.log('✅ Logout API: Logout completed successfully');
    return NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('🚨 Logout API: Logout error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 