import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

// Mark this route as dynamic to handle headers during static generation
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  console.log('⚖️ Admin Disputes: Getting real dispute data');
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
    const skip = (page - 1) * limit;

    console.log('⚖️ Fetching disputes with filters:', { search, status, type });

    // Build where clause
    const whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (status !== 'all') {
      whereClause.status = status;
    }

    if (type !== 'all') {
      whereClause.type = type;
    }

    // Fetch disputes with related data
    const [disputes, totalCount] = await Promise.all([
      prisma.dispute.findMany({
        where: whereClause,
        include: {
          Booking: {
            include: {
              Service: {
                select: {
                  name: true,
                  category: true
                }
              },
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
              }
            }
          },
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
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.dispute.count({
        where: whereClause
      })
    ]);

    // Format dispute data
    const formattedDisputes = disputes.map(dispute => ({
      id: dispute.id,
      bookingId: dispute.bookingId,
      subject: dispute.subject,
      description: dispute.description,
      type: dispute.type,
      status: dispute.status,
      createdAt: dispute.createdAt,
      resolvedAt: dispute.resolvedAt,
      resolution: dispute.resolution,
      evidence: dispute.evidence,
      raisedBy: dispute.raisedBy,
      raisedByType: dispute.raisedByType,
      booking: {
        id: dispute.Booking?.id,
        service: {
          name: dispute.Booking?.Service?.name || 'Unknown Service',
          category: dispute.Booking?.Service?.category || 'UNKNOWN'
        },
        totalAmount: dispute.Booking?.totalAmount || 0,
        scheduledDate: dispute.Booking?.scheduledDate,
        scheduledTime: dispute.Booking?.scheduledTime,
        client: {
          name: dispute.Booking?.Client?.UserClientProfile?.User?.name || 'Unknown Client',
          email: dispute.Booking?.Client?.UserClientProfile?.User?.email || '',
          image: dispute.Booking?.Client?.UserClientProfile?.User?.image
        },
        provider: {
          name: dispute.Booking?.ServiceProvider?.UserProviderProfile?.User?.name || 'Unknown Provider',
          email: dispute.Booking?.ServiceProvider?.UserProviderProfile?.User?.email || '',
          image: dispute.Booking?.ServiceProvider?.UserProviderProfile?.User?.image
        }
      },
      raisedByUser: {
        name: dispute.Client?.UserClientProfile?.User?.name || 'Unknown User',
        email: dispute.Client?.UserClientProfile?.User?.email || '',
        image: dispute.Client?.UserClientProfile?.User?.image
      }
    }));

    console.log(`✅ Retrieved ${formattedDisputes.length} disputes`);

    return NextResponse.json({
      success: true,
      disputes: formattedDisputes,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error('Admin disputes fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch disputes' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  console.log('⚖️ Admin Disputes: Updating dispute status');
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

    const { disputeId, status, resolution } = await request.json();

    if (!disputeId || !status) {
      return NextResponse.json(
        { error: 'Dispute ID and status are required' },
        { status: 400 }
      );
    }

    console.log(`🔄 Updating dispute ${disputeId} to ${status}`);

    const updateData: any = {
      status,
      updatedAt: new Date()
    };

    if (status === 'RESOLVED' || status === 'CLOSED') {
      updateData.resolvedAt = new Date();
      updateData.resolvedBy = adminUser.id;
      if (resolution) {
        updateData.resolution = resolution;
      }
    }

    // Update dispute
    const updatedDispute = await prisma.dispute.update({
      where: { id: disputeId },
      data: updateData,
      include: {
        Booking: {
          select: {
            id: true,
            Client: {
              include: {
                UserClientProfile: {
                  include: {
                    User: {
                      select: {
                        email: true,
                        name: true
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
                        email: true,
                        name: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    // Log admin action
    await prisma.adminAction.create({
      data: {
        id: require('crypto').randomUUID(),
        adminId: adminUser.UserAdminProfile!.adminId,
        action: `DISPUTE_${status}`,
        targetType: 'DISPUTE',
        targetId: disputeId,
        reason: resolution || null
      }
    });

    // Send notifications to involved parties
    try {
      const clientEmail = updatedDispute.Booking?.Client?.UserClientProfile?.User?.email;
      const providerEmail = updatedDispute.Booking?.ServiceProvider?.UserProviderProfile?.User?.email;

      const emailPromises = [];

      if (clientEmail) {
        emailPromises.push(
          prisma.notification.create({
            data: {
              id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              userId: updatedDispute.Booking!.Client!.id,
              userType: 'CLIENT',
              type: status === 'RESOLVED' ? 'DISPUTE_RESOLVED' : 'SYSTEM_ANNOUNCEMENT',
              title: `Dispute ${status.toLowerCase()}`,
              message: status === 'RESOLVED'
                ? `Your dispute has been resolved. ${resolution || ''}`
                : `Your dispute status has been updated to ${status.toLowerCase()}.`,
              data: JSON.stringify({
                disputeId,
                status,
                resolution
              })
            }
          })
        );
      }

      if (providerEmail) {
        emailPromises.push(
          prisma.notification.create({
            data: {
              id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              userId: updatedDispute.Booking!.ServiceProvider!.id,
              userType: 'PROVIDER',
              type: status === 'RESOLVED' ? 'DISPUTE_RESOLVED' : 'SYSTEM_ANNOUNCEMENT',
              title: `Dispute ${status.toLowerCase()}`,
              message: status === 'RESOLVED'
                ? `The dispute has been resolved. ${resolution || ''}`
                : `Dispute status has been updated to ${status.toLowerCase()}.`,
              data: JSON.stringify({
                disputeId,
                status,
                resolution
              })
            }
          })
        );
      }

      await Promise.all(emailPromises);
    } catch (notificationError) {
      console.error('Failed to send notifications:', notificationError);
    }

    console.log(`✅ Successfully updated dispute ${disputeId} to ${status}`);

    return NextResponse.json({
      success: true,
      message: `Dispute ${status.toLowerCase()} successfully`,
      dispute: {
        id: updatedDispute.id,
        status: updatedDispute.status,
        resolvedAt: updatedDispute.resolvedAt,
        resolution: updatedDispute.resolution
      }
    });

  } catch (error) {
    console.error('Admin dispute update error:', error);
    return NextResponse.json(
      { error: 'Failed to update dispute' },
      { status: 500 }
    );
  }
} 