import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

// Mark this route as dynamic to handle headers during static generation
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  console.log('💳 Admin Payments: Getting real payment data');
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
    const type = searchParams.get('type') || 'all';
    const dateRange = searchParams.get('dateRange') || 'all';
    const skip = (page - 1) * limit;

    console.log('💳 Fetching transactions with filters:', { search, status, type, dateRange });

    // Build where clause
    const whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        { gatewayRef: { contains: search, mode: 'insensitive' } },
        { phoneNumber: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (status !== 'all') {
      whereClause.status = status;
    }

    if (type !== 'all') {
      whereClause.type = type;
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

    // Fetch transactions with related data
    const [transactions, totalCount] = await Promise.all([
      prisma.transaction.findMany({
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
          ServiceProvider_Transaction: {
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
          Booking: {
            include: {
              Service: {
                select: {
                  name: true,
                  category: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.transaction.count({
        where: whereClause
      })
    ]);

    // Format transaction data
    const formattedTransactions = transactions.map(transaction => {
      const isClientTransaction = transaction.Client !== null;
      const user = isClientTransaction
        ? transaction.Client?.UserClientProfile?.User
        : transaction.ServiceProvider_Transaction?.UserProviderProfile?.User;

      return {
        id: transaction.id,
        type: transaction.type,
        amount: transaction.amount,
        currency: transaction.currency,
        status: transaction.status,
        paymentMethod: transaction.paymentMethod,
        gatewayRef: transaction.gatewayRef,
        phoneNumber: transaction.phoneNumber,
        description: transaction.description,
        platformFee: transaction.platformFee,
        processingFee: transaction.processingFee,
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt,
        userType: transaction.userType,
        user: {
          name: user?.name || 'Unknown User',
          email: user?.email || '',
          image: user?.image
        },
        booking: transaction.Booking ? {
          id: transaction.Booking.id,
          service: {
            name: transaction.Booking.Service?.name || 'Unknown Service',
            category: transaction.Booking.Service?.category || 'UNKNOWN'
          }
        } : null,
        metadata: transaction.metadata
      };
    });

    // Calculate summary stats
    const completedTransactions = transactions.filter(t => t.status === 'COMPLETED');
    const totalVolume = completedTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalFees = completedTransactions.reduce((sum, t) =>
      sum + (t.platformFee || 0) + (t.processingFee || 0), 0);

    console.log(`✅ Retrieved ${formattedTransactions.length} transactions`);

    return NextResponse.json({
      success: true,
      transactions: formattedTransactions,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      },
      summary: {
        totalVolume,
        totalFees,
        completedCount: completedTransactions.length,
        pendingCount: transactions.filter(t => t.status === 'PENDING').length,
        failedCount: transactions.filter(t => t.status === 'FAILED').length
      }
    });

  } catch (error) {
    console.error('Admin payments fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
} 