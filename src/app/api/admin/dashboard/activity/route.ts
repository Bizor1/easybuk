import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

// Mark this route as dynamic to handle headers during static generation
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  console.log('📋 Admin Dashboard: Getting recent activity');
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
    const limit = parseInt(searchParams.get('limit') || '20');

    console.log('📋 Fetching recent activity from multiple sources...');

    // Get recent user signups
    const recentUsers = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      },
      include: {
        UserProviderProfile: {
          include: {
            ServiceProvider: {
              select: {
                category: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });

    // Get recent bookings
    const recentBookings = await prisma.booking.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      },
      include: {
        Client: {
          include: {
            UserClientProfile: {
              include: {
                User: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        },
        Service: {
          select: {
            name: true,
            category: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });

    // Get recent disputes
    const recentDisputes = await prisma.dispute.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      },
      include: {
        Client: {
          include: {
            UserClientProfile: {
              include: {
                User: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        },
        Booking: {
          select: {
            id: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });

    // Get recent completed transactions
    const recentTransactions = await prisma.transaction.findMany({
      where: {
        status: 'COMPLETED',
        type: {
          in: ['BOOKING_PAYMENT', 'ESCROW_RELEASE']
        },
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      },
      include: {
        Client: {
          include: {
            UserClientProfile: {
              include: {
                User: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });

    // Get recent verification requests
    const recentVerifications = await prisma.serviceProvider.findMany({
      where: {
        verificationStatus: 'PENDING',
        updatedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        },
        OR: [
          { idDocumentUrl: { not: null } },
          { portfolioUrls: { isEmpty: false } },
          { certificateUrls: { isEmpty: false } }
        ]
      },
      include: {
        UserProviderProfile: {
          include: {
            User: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: 10
    });

    // Format activities
    const activities: any[] = [];

    // Add user signups
    recentUsers.forEach(user => {
      const isProvider = user.UserProviderProfile !== null;
      activities.push({
        id: `user_${user.id}`,
        type: 'user_signup',
        user: user.name || user.email,
        description: isProvider
          ? `New provider registration (${user.UserProviderProfile?.ServiceProvider?.category?.replace('_', ' ') || 'Unknown'})`
          : 'New client registration',
        timestamp: user.createdAt,
        severity: 'low'
      });
    });

    // Add bookings
    recentBookings.forEach(booking => {
      activities.push({
        id: `booking_${booking.id}`,
        type: 'booking_created',
        user: booking.Client?.UserClientProfile?.User?.name || 'Unknown Client',
        description: `Booked ${booking.Service?.name || 'service'} - ${booking.Service?.category?.replace('_', ' ') || 'Unknown category'}`,
        timestamp: booking.createdAt,
        severity: 'low'
      });
    });

    // Add disputes
    recentDisputes.forEach(dispute => {
      activities.push({
        id: `dispute_${dispute.id}`,
        type: 'dispute_opened',
        user: dispute.Client?.UserClientProfile?.User?.name || 'Unknown User',
        description: `Opened dispute for booking #${dispute.Booking?.id?.slice(-8) || 'Unknown'}`,
        timestamp: dispute.createdAt,
        severity: 'high'
      });
    });

    // Add transactions
    recentTransactions.forEach(transaction => {
      activities.push({
        id: `transaction_${transaction.id}`,
        type: 'payment_processed',
        user: transaction.Client?.UserClientProfile?.User?.name || 'Unknown User',
        description: `Payment of GHS ${transaction.amount.toFixed(2)} processed`,
        timestamp: transaction.createdAt,
        severity: 'low'
      });
    });

    // Add verification requests
    recentVerifications.forEach(provider => {
      activities.push({
        id: `verification_${provider.id}`,
        type: 'verification_request',
        user: provider.UserProviderProfile?.User?.name || 'Unknown Provider',
        description: `Submitted verification documents`,
        timestamp: provider.updatedAt,
        severity: 'medium'
      });
    });

    // Sort by timestamp and limit results
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const limitedActivities = activities.slice(0, limit);

    // Format timestamps for display
    const formattedActivities = limitedActivities.map(activity => ({
      ...activity,
      timestamp: formatTimeAgo(activity.timestamp)
    }));

    console.log(`✅ Retrieved ${formattedActivities.length} recent activities`);

    return NextResponse.json({
      success: true,
      activities: formattedActivities
    });

  } catch (error) {
    console.error('Admin dashboard activity error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent activity' },
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