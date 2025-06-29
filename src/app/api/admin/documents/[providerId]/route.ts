import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { providerId: string } }
) {
  console.log('✅ Admin Documents: Updating verification status');
  try {
    const tokenPayload = getCurrentUser(request);
    console.log('🔐 Admin Documents: Token found:', !!tokenPayload?.userId);

    if (!tokenPayload?.userId) {
      console.log('❌ Admin Documents: Unauthorized');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: tokenPayload.userId },
      include: {
        UserAdminProfile: true
      }
    });

    if (!user || !user.roles.includes('ADMIN') || !user.UserAdminProfile) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { providerId } = params;
    const { action, reason } = await request.json();

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "approve" or "reject"' },
        { status: 400 }
      );
    }

    console.log(`🔄 ${action.toUpperCase()} verification for provider: ${providerId}`);

    // Get provider with user info
    const provider = await prisma.serviceProvider.findUnique({
      where: { id: providerId },
      include: {
        UserProviderProfile: {
          include: {
            User: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider not found' },
        { status: 404 }
      );
    }

    // Update verification status
    const newStatus = action === 'approve' ? 'VERIFIED' : 'REJECTED';
    const updateData: any = {
      verificationStatus: newStatus,
      updatedAt: new Date()
    };

    if (action === 'approve') {
      updateData.verifiedAt = new Date();
      updateData.isVerified = true;
    }

    const updatedProvider = await prisma.serviceProvider.update({
      where: { id: providerId },
      data: updateData
    });

    // Log admin action
    await prisma.adminAction.create({
      data: {
        id: require('crypto').randomUUID(),
        adminId: user.UserAdminProfile!.adminId,
        action: `DOCUMENT_${action.toUpperCase()}`,
        targetType: 'PROVIDER',
        targetId: providerId,
        reason: reason || null
      }
    });

    // Send notification email to provider
    try {
      console.log('📧 Sending notification email to provider...');

      const emailType = action === 'approve' ? 'documents_approved' : 'documents_rejected';
      await fetch(`${process.env.NEXTAUTH_URL}/api/notifications/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: provider.UserProviderProfile?.User?.email,
          type: emailType,
          data: {
            providerName: provider.UserProviderProfile?.User?.name,
            reason: reason,
            reviewedAt: new Date().toISOString(),
            reviewedBy: user.name
          }
        })
      });
    } catch (emailError) {
      console.error('Failed to send notification email:', emailError);
    }

    // Send notification to provider in app
    try {
      await prisma.notification.create({
        data: {
          id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: provider.UserProviderProfile?.User?.id!,
          userType: 'PROVIDER',
          type: action === 'approve' ? 'ACCOUNT_VERIFIED' : 'VERIFICATION_UPDATE',
          title: action === 'approve'
            ? 'Document Verification Approved!'
            : 'Document Verification Rejected',
          message: action === 'approve'
            ? 'Your documents have been verified successfully. You can now accept bookings!'
            : `Your document verification was rejected. ${reason ? `Reason: ${reason}` : 'Please resubmit with correct documents.'}`,
          data: JSON.stringify({
            action,
            reason,
            reviewedBy: user.name,
            reviewedAt: new Date().toISOString()
          })
        }
      });
    } catch (notificationError) {
      console.error('Failed to create in-app notification:', notificationError);
    }

    console.log(`✅ Successfully ${action}d provider verification`);
    return NextResponse.json({
      success: true,
      message: `Provider verification ${action}d successfully`,
      provider: {
        id: updatedProvider.id,
        verificationStatus: updatedProvider.verificationStatus,
        verifiedAt: updatedProvider.verifiedAt,
        isVerified: updatedProvider.isVerified
      }
    });

  } catch (error) {
    console.error('Admin document verification error:', error);
    return NextResponse.json(
      { error: 'Failed to update verification status' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { providerId: string } }
) {
  console.log('📄 Admin Documents: Getting specific provider documents');
  try {
    const tokenPayload = getCurrentUser(request);

    if (!tokenPayload?.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: tokenPayload.userId },
      include: {
        UserAdminProfile: true
      }
    });

    if (!user || !user.roles.includes('ADMIN') || !user.UserAdminProfile) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { providerId } = params;

    // Get provider with all details
    const provider = await prisma.serviceProvider.findUnique({
      where: { id: providerId },
      include: {
        UserProviderProfile: {
          include: {
            User: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                createdAt: true
              }
            }
          }
        },
        Service: {
          select: {
            id: true,
            name: true,
            category: true,
            isActive: true
          }
        }
      }
    });

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider not found' },
        { status: 404 }
      );
    }

    // Parse document data
    let documentInfo: any = { type: 'unknown' };
    if (provider.idDocumentUrl) {
      try {
        const parsed = JSON.parse(provider.idDocumentUrl);
        if (parsed.type) {
          documentInfo = parsed;
        } else {
          documentInfo = { type: 'passport', url: provider.idDocumentUrl };
        }
      } catch {
        documentInfo = { type: 'passport', url: provider.idDocumentUrl };
      }
    }

    return NextResponse.json({
      success: true,
      provider: {
        id: provider.id,
        verificationStatus: provider.verificationStatus,
        submittedAt: provider.updatedAt,
        verifiedAt: provider.verifiedAt,
        user: provider.UserProviderProfile?.User,
        documents: {
          type: documentInfo.type,
          idDocument: documentInfo,
          selfiePhoto: provider.portfolioUrls?.[0] || null,
          certificates: provider.certificateUrls || [],
          hasCertificates: (provider.certificateUrls || []).length > 0
        },
        providerInfo: {
          category: provider.category,
          specializations: provider.specializations,
          businessName: provider.businessName,
          city: provider.city,
          bio: provider.bio,
          rating: provider.rating,
          totalReviews: provider.totalReviews,
          completedBookings: provider.completedBookings
        },
        services: provider.Service
      }
    });

  } catch (error) {
    console.error('Admin get provider documents error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch provider documents' },
      { status: 500 }
    );
  }
} 