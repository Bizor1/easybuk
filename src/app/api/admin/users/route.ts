import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

// Mark this route as dynamic to handle headers during static generation
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  console.log('👥 Admin Users: Getting real user data');
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || 'all';
    const status = searchParams.get('status') || 'all';
    const verification = searchParams.get('verification') || 'all';
    const skip = (page - 1) * limit;

    console.log('👥 Fetching users with filters:', { search, role, status, verification });

    // Build where clause based on filters
    const whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (role !== 'all') {
      whereClause.roles = {
        has: role.toUpperCase()
      };
    }

    if (status !== 'all') {
      whereClause.status = status;
    }

    // Get users with related data
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        include: {
          UserClientProfile: {
            include: {
              Client: {
                include: {
                  Booking: {
                    select: {
                      id: true,
                      totalAmount: true,
                      status: true
                    }
                  },
                  Transaction: {
                    where: {
                      type: {
                        in: ['BOOKING_PAYMENT', 'DEPOSIT']
                      },
                      status: 'COMPLETED'
                    },
                    select: {
                      amount: true
                    }
                  }
                }
              }
            }
          },
          UserProviderProfile: {
            include: {
              ServiceProvider: {
                include: {
                  Booking: {
                    select: {
                      id: true,
                      totalAmount: true,
                      status: true
                    }
                  },
                  Transaction: {
                    where: {
                      type: {
                        in: ['ESCROW_RELEASE', 'COMMISSION']
                      },
                      status: 'COMPLETED'
                    },
                    select: {
                      amount: true
                    }
                  }
                }
              }
            }
          },
          UserAdminProfile: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.user.count({
        where: whereClause
      })
    ]);

    // Format user data
    const formattedUsers = users.map(user => {
      const clientData = user.UserClientProfile?.Client;
      const providerData = user.UserProviderProfile?.ServiceProvider;

      // Calculate stats
      const clientBookings = clientData?.Booking || [];
      const providerBookings = providerData?.Booking || [];
      const totalBookings = clientBookings.length + providerBookings.length;

      const clientSpent = clientData?.Transaction?.reduce((sum, t) => sum + t.amount, 0) || 0;
      const providerEarnings = providerData?.Transaction?.reduce((sum, t) => sum + t.amount, 0) || 0;

      // Check verification status
      let verificationFilter = false;
      if (verification === 'verified') {
        verificationFilter = !!user.emailVerified && !!user.phoneVerified;
      } else if (verification === 'unverified') {
        verificationFilter = !user.emailVerified || !user.phoneVerified;
      } else {
        verificationFilter = true; // 'all'
      }

      const formattedUser = {
        id: user.id,
        name: user.name || 'Unknown',
        email: user.email,
        image: user.image,
        roles: user.roles,
        status: user.status,
        joinDate: user.createdAt.toISOString().split('T')[0],
        lastActive: formatTimeAgo(user.lastActive),
        totalBookings,
        totalSpent: clientSpent,
        totalEarnings: providerEarnings,
        profileCompleted: user.UserProviderProfile?.ServiceProvider ?
          !!user.UserProviderProfile.ServiceProvider.profileCompleted : true,
        emailVerified: !!user.emailVerified,
        phoneVerified: !!user.phoneVerified,
        createdAt: user.createdAt
      };

      return { user: formattedUser, passesVerificationFilter: verificationFilter };
    });

    // Filter by verification status if needed
    const filteredUsers = verification === 'all'
      ? formattedUsers.map(item => item.user)
      : formattedUsers.filter(item => item.passesVerificationFilter).map(item => item.user);

    console.log(`✅ Retrieved ${filteredUsers.length} users`);

    return NextResponse.json({
      success: true,
      users: filteredUsers,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error('Admin users fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  console.log('👥 Admin Users: Updating user status');
  try {
    const tokenPayload = getCurrentUser(request);

    if (!tokenPayload?.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const adminUser = await prisma.user.findUnique({
      where: { id: tokenPayload.userId },
      include: {
        UserAdminProfile: true
      }
    });

    if (!adminUser || !adminUser.roles.includes('ADMIN') || !adminUser.UserAdminProfile) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { userIds, action, reason } = await request.json();

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: 'User IDs are required' },
        { status: 400 }
      );
    }

    console.log(`🔄 ${action.toUpperCase()} action for ${userIds.length} users`);

    let updateData: any = {};
    let actionType = '';

    switch (action) {
      case 'activate':
        updateData = { status: 'ACTIVE' };
        actionType = 'USER_ACTIVATED';
        break;
      case 'suspend':
        updateData = {
          status: 'SUSPENDED'
        };
        actionType = 'USER_SUSPENDED';
        break;
      case 'ban':
        updateData = { status: 'BANNED' };
        actionType = 'USER_BANNED';
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    // Update users
    const updatedUsers = await prisma.user.updateMany({
      where: {
        id: {
          in: userIds
        }
      },
      data: updateData
    });

    // Log admin actions
    const adminActions = userIds.map(userId => ({
      id: require('crypto').randomUUID(),
      adminId: adminUser.UserAdminProfile!.adminId,
      action: actionType,
      targetType: 'USER' as const,
      targetId: userId,
      reason: reason || null
    }));

    await prisma.adminAction.createMany({
      data: adminActions
    });

    console.log(`✅ Successfully ${action}d ${updatedUsers.count} users`);

    return NextResponse.json({
      success: true,
      message: `Successfully ${action}d ${updatedUsers.count} users`,
      updatedCount: updatedUsers.count
    });

  } catch (error) {
    console.error('Admin user update error:', error);
    return NextResponse.json(
      { error: 'Failed to update users' },
      { status: 500 }
    );
  }
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60));

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;

  return new Date(date).toLocaleDateString();
} 