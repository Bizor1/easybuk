import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';

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

    // Check if current user is admin
    const currentUser = await prisma.user.findUnique({
      where: { id: tokenPayload.userId }
    });

    if (!currentUser || !currentUser.roles.includes('ADMIN')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions - Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userEmail, reason }: { userEmail: string; reason?: string } = body;
    
    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: 'User email is required' },
        { status: 400 }
      );
    }

    // Find target user
    const targetUser = await prisma.user.findUnique({
      where: { email: userEmail }
    });

    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user already has admin role
    if (targetUser.roles.includes('ADMIN')) {
      return NextResponse.json(
        { success: false, error: 'User already has admin privileges' },
        { status: 400 }
      );
    }

    // Execute admin role assignment in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update user roles
      const updatedUser = await tx.user.update({
        where: { id: targetUser.id },
        data: {
          roles: [...targetUser.roles, 'ADMIN'],
          updatedAt: new Date()
        }
      });

      // Create admin profile
      const adminProfile = await tx.admin.create({
        data: {
          id: uuidv4(),
          email: targetUser.email,
          emailVerified: targetUser.emailVerified,
          name: targetUser.name,
          role: 'ADMIN',
          permissions: [
            'USER_MANAGEMENT',
            'BOOKING_MANAGEMENT',
            'PAYMENT_MANAGEMENT',
            'REVIEW_MODERATION',
            'VERIFICATION_MANAGEMENT',
            'ANALYTICS_ACCESS',
            'SYSTEM_SETTINGS'
          ],
          lastActive: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      // Link user to admin profile
      await tx.userAdminProfile.create({
        data: {
          id: uuidv4(),
          userId: targetUser.id,
          adminId: adminProfile.id,
          createdAt: new Date()
        }
      });

      // Log admin action
      await tx.adminAction.create({
        data: {
          id: uuidv4(),
          adminId: currentUser.id,
          action: 'GRANT_ADMIN_ROLE',
          targetType: 'USER',
          targetId: targetUser.id,
          reason: reason || 'Admin role granted',
          createdAt: new Date()
        }
      });

      return { updatedUser, adminProfile };
    });

    return NextResponse.json({
      success: true,
      message: `Admin role successfully granted to ${userEmail}`,
      data: {
        userId: result.updatedUser.id,
        email: result.updatedUser.email,
        roles: result.updatedUser.roles,
        adminId: result.adminProfile.id
      }
    });

  } catch (error) {
    console.error('Admin role assignment error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Remove admin role endpoint
export async function DELETE(request: NextRequest) {
  try {
    const tokenPayload = getCurrentUser(request);
    
    if (!tokenPayload) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Check if current user is admin
    const currentUser = await prisma.user.findUnique({
      where: { id: tokenPayload.userId }
    });

    if (!currentUser || !currentUser.roles.includes('ADMIN')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userEmail, reason }: { userEmail: string; reason?: string } = body;

    const targetUser = await prisma.user.findUnique({
      where: { email: userEmail },
      include: {
        UserAdminProfile: {
          include: { Admin: true }
        }
      }
    });

    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    if (!targetUser.roles.includes('ADMIN')) {
      return NextResponse.json(
        { success: false, error: 'User does not have admin role' },
        { status: 400 }
      );
    }

    // Prevent self-removal (safety check)
    if (targetUser.id === currentUser.id) {
      return NextResponse.json(
        { success: false, error: 'Cannot remove your own admin privileges' },
        { status: 400 }
      );
    }

    // Remove admin role in transaction
    await prisma.$transaction(async (tx) => {
      // Update user roles
      await tx.user.update({
        where: { id: targetUser.id },
        data: {
          roles: targetUser.roles.filter(role => role !== 'ADMIN'),
          updatedAt: new Date()
        }
      });

      // Remove admin profile link
      if (targetUser.UserAdminProfile) {
        await tx.userAdminProfile.delete({
          where: { userId: targetUser.id }
        });

        // Remove admin profile
        await tx.admin.delete({
          where: { id: targetUser.UserAdminProfile.adminId }
        });
      }

      // Log admin action
      await tx.adminAction.create({
        data: {
          id: uuidv4(),
          adminId: currentUser.id,
          action: 'REVOKE_ADMIN_ROLE',
          targetType: 'USER',
          targetId: targetUser.id,
          reason: reason || 'Admin role revoked',
          createdAt: new Date()
        }
      });
    });

    return NextResponse.json({
      success: true,
      message: `Admin role successfully removed from ${userEmail}`
    });

  } catch (error) {
    console.error('Admin role removal error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 