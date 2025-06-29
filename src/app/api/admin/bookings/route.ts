import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

// Mark this route as dynamic to handle headers during static generation
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  console.log('📅 Admin Bookings: Getting real booking data');
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
    const status = searchParams.get('status') || 'all';
    const dateRange = searchParams.get('dateRange') || 'all';
    const skip = (page - 1) * limit;

    console.log('📅 Fetching bookings with filters:', { search, status, dateRange });

    // Build where clause
    const whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        {
          Service: {
            name: { contains: search, mode: 'insensitive' }
          }
        },
        {
          Client: {
            UserClientProfile: {
              User: {
                name: { contains: search, mode: 'insensitive' }
              }
            }
          }
        }
      ];
    }

    if (status !== 'all') {
      whereClause.status = status;
    }

    if (dateRange !== 'all') {
      const now = new Date();
      let startDate: Date;

      switch (dateRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        default:
          startDate = new Date(0);
      }

      whereClause.createdAt = { gte: startDate };
    }

    // Fetch bookings with related data
    const [bookings, totalCount] = await Promise.all([
      prisma.booking.findMany({
        where: whereClause,
        include: {
          Client: {
            include: {
              UserClientProfile: {
                include: {
                  User: {
                    select: {
                      name: true,
                      email: true,
                      image: true
                    }
                  }
                }
              }
            }
          },
          ServiceProvider: {
            include: {
              UserProviderProfile: {
                include: {
                  User: {
                    select: {
                      name: true,
                      email: true,
                      image: true
                    }
                  }
                }
              }
            }
          },
          Service: {
            select: {
              name: true,
              category: true,
              basePrice: true
            }
          },
          Transaction: {
            where: {
              type: 'BOOKING_PAYMENT'
            },
            select: {
              amount: true,
              status: true,
              paymentMethod: true
            }
          },
          Review: {
            select: {
              overallRating: true,
              comment: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.booking.count({
        where: whereClause
      })
    ]);

    // Format booking data
    const formattedBookings = bookings.map(booking => ({
      id: booking.id,
      service: {
        name: booking.Service?.name || 'Unknown Service',
        category: booking.Service?.category || 'UNKNOWN',
        basePrice: booking.Service?.basePrice || 0
      },
      client: {
        name: booking.Client?.UserClientProfile?.User?.name || 'Unknown Client',
        email: booking.Client?.UserClientProfile?.User?.email || '',
        image: booking.Client?.UserClientProfile?.User?.image
      },
      provider: {
        name: booking.ServiceProvider?.UserProviderProfile?.User?.name || 'Unknown Provider',
        email: booking.ServiceProvider?.UserProviderProfile?.User?.email || '',
        image: booking.ServiceProvider?.UserProviderProfile?.User?.image
      },
      status: booking.status,
      totalAmount: booking.totalAmount,
      scheduledDate: booking.scheduledDate,
      scheduledTime: booking.scheduledTime,
      completedAt: booking.completedAt,
      createdAt: booking.createdAt,
      location: booking.location,
      cancellationReason: booking.cancellationReason,
      payment: booking.Transaction?.[0] ? {
        amount: booking.Transaction[0].amount,
        status: booking.Transaction[0].status,
        method: booking.Transaction[0].paymentMethod
      } : null,
      review: booking.Review ? {
        rating: booking.Review.overallRating,
        comment: booking.Review.comment
      } : null
    }));

    console.log(`✅ Retrieved ${formattedBookings.length} bookings`);

    return NextResponse.json({
      success: true,
      bookings: formattedBookings,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error('Admin bookings fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
} 