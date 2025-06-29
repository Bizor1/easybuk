import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

// Mark this route as dynamic to handle headers during static generation
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  console.log('📊 Admin Dashboard: Getting real stats');
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

    // Get current date boundaries
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - 7);

    console.log('📊 Fetching user statistics...');

    // Get total users count and today's signups
    const [totalUsers, newUsersToday] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          createdAt: {
            gte: startOfToday
          }
        }
      })
    ]);

    console.log('📊 Fetching booking statistics...');

    // Get booking statistics
    const [totalBookings, bookingsToday, completedBookings] = await Promise.all([
      prisma.booking.count(),
      prisma.booking.count({
        where: {
          createdAt: {
            gte: startOfToday
          }
        }
      }),
      prisma.booking.count({
        where: {
          status: 'COMPLETED'
        }
      })
    ]);

    console.log('📊 Fetching payment statistics...');

    // Get payment/revenue statistics
    const [totalRevenueResult, revenueToday] = await Promise.all([
      prisma.transaction.aggregate({
        where: {
          status: 'COMPLETED',
          type: {
            in: ['BOOKING_PAYMENT', 'ESCROW_RELEASE']
          }
        },
        _sum: {
          amount: true
        }
      }),
      prisma.transaction.aggregate({
        where: {
          status: 'COMPLETED',
          type: {
            in: ['BOOKING_PAYMENT', 'ESCROW_RELEASE']
          },
          createdAt: {
            gte: startOfToday
          }
        },
        _sum: {
          amount: true
        }
      })
    ]);

    console.log('📊 Fetching dispute statistics...');

    // Get dispute statistics
    const activeDisputes = await prisma.dispute.count({
      where: {
        status: {
          in: ['OPEN', 'IN_REVIEW', 'ESCALATED']
        }
      }
    });

    console.log('📊 Fetching provider verification statistics...');

    // Get provider verification statistics
    const [pendingVerifications, totalProviders, verifiedProviders] = await Promise.all([
      prisma.serviceProvider.count({
        where: {
          verificationStatus: 'PENDING'
        }
      }),
      prisma.serviceProvider.count(),
      prisma.serviceProvider.count({
        where: {
          verificationStatus: 'VERIFIED'
        }
      })
    ]);

    console.log('📊 Calculating growth metrics...');

    // Calculate week-over-week growth
    const usersLastWeek = await prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
          lt: startOfWeek
        }
      }
    });

    const usersThisWeek = await prisma.user.count({
      where: {
        createdAt: {
          gte: startOfWeek
        }
      }
    });

    const userGrowthPercent = usersLastWeek > 0
      ? ((usersThisWeek - usersLastWeek) / usersLastWeek * 100)
      : usersThisWeek > 0 ? 100 : 0;

    // Calculate booking growth
    const bookingsLastWeek = await prisma.booking.count({
      where: {
        createdAt: {
          gte: new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000),
          lt: startOfWeek
        }
      }
    });

    const bookingsThisWeek = await prisma.booking.count({
      where: {
        createdAt: {
          gte: startOfWeek
        }
      }
    });

    const bookingGrowthPercent = bookingsLastWeek > 0
      ? ((bookingsThisWeek - bookingsLastWeek) / bookingsLastWeek * 100)
      : bookingsThisWeek > 0 ? 100 : 0;

    // Calculate revenue growth
    const revenueThisWeekResult = await prisma.transaction.aggregate({
      where: {
        status: 'COMPLETED',
        type: {
          in: ['BOOKING_PAYMENT', 'ESCROW_RELEASE']
        },
        createdAt: {
          gte: startOfWeek
        }
      },
      _sum: {
        amount: true
      }
    });

    const revenueLastWeekResult = await prisma.transaction.aggregate({
      where: {
        status: 'COMPLETED',
        type: {
          in: ['BOOKING_PAYMENT', 'ESCROW_RELEASE']
        },
        createdAt: {
          gte: new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000),
          lt: startOfWeek
        }
      },
      _sum: {
        amount: true
      }
    });

    const revenueThisWeek = revenueThisWeekResult._sum.amount || 0;
    const revenueLastWeek = revenueLastWeekResult._sum.amount || 0;
    const revenueGrowthPercent = revenueLastWeek > 0
      ? ((revenueThisWeek - revenueLastWeek) / revenueLastWeek * 100)
      : revenueThisWeek > 0 ? 100 : 0;

    console.log('✅ Dashboard stats calculated successfully');

    const stats = {
      totalUsers,
      totalRevenue: totalRevenueResult._sum.amount || 0,
      totalBookings,
      activeDisputes,
      pendingVerifications,
      newUsersToday,
      revenueToday: revenueToday._sum.amount || 0,
      bookingsToday,
      completedBookings,
      totalProviders,
      verifiedProviders,
      userGrowthPercent: Math.round(userGrowthPercent * 10) / 10,
      bookingGrowthPercent: Math.round(bookingGrowthPercent * 10) / 10,
      revenueGrowthPercent: Math.round(revenueGrowthPercent * 10) / 10
    };

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Admin dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
} 