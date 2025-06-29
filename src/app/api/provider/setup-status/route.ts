import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

// Mark this route as dynamic to handle headers during static generation
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  console.log('🔍 Setup Status: Checking provider setup status');
  try {
    // Use custom JWT system instead of NextAuth
    const tokenPayload = getCurrentUser(request);
    console.log('📋 Setup Status: Token found:', !!tokenPayload?.userId);

    if (!tokenPayload?.userId) {
      console.log('❌ Setup Status: No valid token');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('👤 Setup Status: Looking up user:', tokenPayload.userId);
    // Get user and their provider profile
    const user = await prisma.user.findUnique({
      where: { id: tokenPayload.userId },
      include: {
        UserProviderProfile: {
          include: {
            ServiceProvider: {
              include: {
                Service: true
              }
            }
          }
        }
      }
    });

    console.log('📦 Setup Status: User found:', !!user);
    console.log('📦 Setup Status: Has provider profile:', !!user?.UserProviderProfile);
    console.log('📧 Setup Status: Email verified:', !!user?.emailVerified);

    if (!user || !user.UserProviderProfile) {
      console.log('❌ Setup Status: Provider profile not found');
      return NextResponse.json(
        { error: 'Provider profile not found' },
        { status: 404 }
      );
    }

    const provider = user.UserProviderProfile.ServiceProvider;

    // Check setup status for each step
    const setupStatus = {
      email: user.emailVerified ? 'completed' : 'pending',
      bank: (provider.businessName && provider.businessRegistration) ? 'completed' : 'pending',
      services: provider.specializations && provider.specializations.length > 0 ? 'completed' : 'pending',
      documents: provider.verificationStatus === 'VERIFIED' ? 'completed' :
        provider.verificationStatus === 'PENDING' ? 'under_review' :
          provider.idDocumentUrl ? 'under_review' : 'not_started'
    };

    console.log('✅ Setup Status: Status determined:', setupStatus);
    console.log('📊 Setup Status: Provider verification status:', provider.verificationStatus);
    console.log('📊 Setup Status: Provider isVerified:', provider.isVerified);
    console.log('📊 Setup Status: Profile completed:', provider.profileCompleted);

    return NextResponse.json(setupStatus);

  } catch (error) {
    console.error('🚨 Setup Status: Fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch setup status' },
      { status: 500 }
    );
  }
} 