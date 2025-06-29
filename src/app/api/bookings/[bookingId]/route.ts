import { NextRequest, NextResponse } from 'next/server';
import {
  withErrorHandler,
  requireAuth,
  createSuccessResponse,
  ValidationError,
  NotFoundError
} from '@/lib/api-middleware';
import { prisma } from '@/lib/prisma';
import type { BookingStatus } from '@/types';
import { getCurrentUser } from '@/lib/jwt';
import { EmailService } from '@/lib/email';
import { NotificationService } from '@/lib/notifications';

interface RouteParams {
  params: {
    bookingId: string;
  };
}

// GET /api/bookings/[bookingId] - Get booking details
async function handleGet(request: NextRequest, { params }: RouteParams) {
  const user = await requireAuth(request);
  const { bookingId } = params;

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      Client: {
        include: {
          UserClientProfile: {
            include: {
              User: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                  phone: true
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
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                  phone: true
                }
              }
            }
          }
        }
      },
      Service: true,
      Message: {
        orderBy: { createdAt: 'desc' }
      },
      Review: {
        include: {
          Client: {
            include: {
              UserClientProfile: {
                include: {
                  User: {
                    select: {
                      id: true,
                      name: true,
                      image: true
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

  if (!booking) {
    throw new NotFoundError('Booking');
  }

  // Check access permissions
  const isClient = user.roles.includes('CLIENT') && booking.Client.UserClientProfile?.userId === user.userId;
  const isProvider = user.roles.includes('PROVIDER') && booking.ServiceProvider.UserProviderProfile?.userId === user.userId;
  const isAdmin = user.roles.includes('ADMIN');

  if (!isClient && !isProvider && !isAdmin) {
    throw new ValidationError('Access denied to this booking');
  }

  return createSuccessResponse(booking, 'Booking retrieved successfully');
}

// PUT /api/bookings/[bookingId] - Update booking status or details
async function handlePut(request: NextRequest, { params }: RouteParams) {
  const user = await requireAuth(request);
  const { bookingId } = params;
  const body = await request.json();

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      Client: {
        include: {
          UserClientProfile: {
            include: {
              User: true
            }
          }
        }
      },
      ServiceProvider: {
        include: {
          UserProviderProfile: {
            include: {
              User: true
            }
          }
        }
      },
      Transaction: true
    }
  });

  if (!booking) {
    throw new NotFoundError('Booking');
  }

  // Check permissions
  const isClient = user.roles.includes('CLIENT') && booking.Client.UserClientProfile?.userId === user.userId;
  const isProvider = user.roles.includes('PROVIDER') && booking.ServiceProvider.UserProviderProfile?.userId === user.userId;
  const isAdmin = user.roles.includes('ADMIN');

  if (!isClient && !isProvider && !isAdmin) {
    throw new ValidationError('Access denied to this booking');
  }

  const { status, cancellationReason, notes } = body;

  // Validate status transitions
  if (status) {
    const validTransitions = getValidStatusTransitions(booking.status, isClient, isProvider, isAdmin);

    if (!validTransitions.includes(status)) {
      throw new ValidationError(`Cannot transition from ${booking.status} to ${status}`);
    }
  }

  // Prepare update data
  const updateData: any = {};

  if (status) {
    updateData.status = status;

    // Handle status-specific logic
    switch (status) {
      case 'CONFIRMED':
        if (!isProvider && !isAdmin) {
          throw new ValidationError('Only providers can confirm bookings');
        }
        break;

      case 'CANCELLED':
        updateData.cancelledBy = user.userId;
        updateData.cancelledAt = new Date();
        if (cancellationReason) {
          updateData.cancellationReason = cancellationReason;
        }
        break;

      case 'COMPLETED':
        if (!isProvider && !isAdmin) {
          throw new ValidationError('Only providers can mark bookings as completed');
        }
        // When provider marks as completed, set status to awaiting client confirmation
        updateData.status = 'AWAITING_CLIENT_CONFIRMATION';
        updateData.completedAt = new Date();
        updateData.clientConfirmDeadline = new Date(Date.now() + (48 * 60 * 60 * 1000)); // 48 hours from now
        break;

      case 'IN_PROGRESS':
        if (!isProvider && !isAdmin) {
          throw new ValidationError('Only providers can start bookings');
        }
        break;
    }
  }

  if (notes !== undefined) {
    updateData.notes = notes;
  }

  // Update booking
  const updatedBooking = await prisma.booking.update({
    where: { id: bookingId },
    data: updateData,
    include: {
      Client: {
        include: {
          UserClientProfile: {
            include: {
              User: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                  phone: true
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
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                  phone: true
                }
              }
            }
          }
        }
      },
      Service: true,
      Transaction: true
    }
  });

  // Send comprehensive notifications based on status change
  if (status && updatedBooking) {
    const clientUserId = updatedBooking.Client.UserClientProfile?.userId;
    const providerUserId = updatedBooking.ServiceProvider.UserProviderProfile?.userId;

    if (clientUserId && providerUserId) {
      console.log(`📧 Sending notifications for status change: ${booking.status} → ${status}`);

      try {
        // Send appropriate notifications based on status
        switch (status) {
          case 'IN_PROGRESS':
            await Promise.all([
              NotificationService.sendEnhancedStatusUpdateNotification(
                booking.id,
                clientUserId,
                'CLIENT',
                booking.status,
                'IN_PROGRESS',
                booking.title,
                'Your service has started! The provider is now working on your request.'
              ),
              NotificationService.sendEnhancedStatusUpdateNotification(
                booking.id,
                providerUserId,
                'PROVIDER',
                booking.status,
                'IN_PROGRESS',
                booking.title,
                'Service has started. Please keep the client updated on your progress.'
              )
            ]);
            break;

          case 'COMPLETED':
            // This handles when status is explicitly set to COMPLETED (client confirmation)
            await NotificationService.sendEnhancedStatusUpdateNotification(
              booking.id,
              providerUserId,
              'PROVIDER',
              booking.status,
              'COMPLETED',
              booking.title,
              'Service has been confirmed as completed. Payment will be released shortly.'
            );
            break;

          case 'AWAITING_CLIENT_CONFIRMATION':
            // Send notification to client for confirmation request
            await Promise.all([
              NotificationService.sendEnhancedStatusUpdateNotification(
                booking.id,
                clientUserId,
                'CLIENT',
                booking.status,
                'AWAITING_CLIENT_CONFIRMATION',
                booking.title,
                'The provider has marked this service as completed. Please confirm if you are satisfied with the service. You have 48 hours to review.'
              ),
              // Create specific notification for client action required
              prisma.notification.create({
                data: {
                  id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                  userId: clientUserId,
                  userType: 'CLIENT',
                  type: 'BOOKING_REMINDER',
                  title: 'Action Required: Confirm Service Completion ⏰',
                  message: `Please review and confirm the completion of "${booking.title}". You have 48 hours to confirm or dispute. If no action is taken, the service will be auto-confirmed.`,
                  data: JSON.stringify({
                    bookingId: booking.id,
                    serviceTitle: booking.title,
                    deadline: new Date(Date.now() + (48 * 60 * 60 * 1000)).toISOString(),
                    requiresAction: true,
                    nextAction: 'CONFIRM_OR_DISPUTE',
                    autoConfirmIn: '48 hours'
                  })
                }
              })
            ]);
            break;

          case 'CANCELLED':
            // Use enhanced status notifications for cancellation
            await Promise.all([
              NotificationService.sendEnhancedStatusUpdateNotification(
                booking.id,
                clientUserId,
                'CLIENT',
                booking.status,
                status,
                booking.title,
                cancellationReason || 'Booking has been cancelled'
              ),
              NotificationService.sendEnhancedStatusUpdateNotification(
                booking.id,
                providerUserId,
                'PROVIDER',
                booking.status,
                status,
                booking.title,
                cancellationReason || 'Booking has been cancelled'
              )
            ]);
            break;

          default:
            // Send enhanced status update for other status changes
            await Promise.all([
              NotificationService.sendEnhancedStatusUpdateNotification(
                booking.id,
                clientUserId,
                'CLIENT',
                booking.status,
                status,
                booking.title,
                notes
              ),
              NotificationService.sendEnhancedStatusUpdateNotification(
                booking.id,
                providerUserId,
                'PROVIDER',
                booking.status,
                status,
                booking.title,
                notes
              )
            ]);
        }

        console.log('✅ Status change notifications sent successfully');
      } catch (notificationError) {
        console.error('❌ Failed to send status change notifications:', notificationError);
        // Don't fail the whole request if notifications fail
      }
    }
  }

  return createSuccessResponse(updatedBooking, 'Booking updated successfully');
}

// DELETE /api/bookings/[bookingId] - Cancel booking
async function handleDelete(request: NextRequest, { params }: RouteParams) {
  const user = await requireAuth(request);
  const { bookingId } = params;

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      Client: {
        include: {
          UserClientProfile: {
            include: {
              User: true
            }
          }
        }
      },
      ServiceProvider: {
        include: {
          UserProviderProfile: {
            include: {
              User: true
            }
          }
        }
      }
    }
  });

  if (!booking) {
    throw new NotFoundError('Booking');
  }

  // Check permissions
  const isClient = user.roles.includes('CLIENT') && booking.Client.UserClientProfile?.userId === user.userId;
  const isProvider = user.roles.includes('PROVIDER') && booking.ServiceProvider.UserProviderProfile?.userId === user.userId;
  const isAdmin = user.roles.includes('ADMIN');

  if (!isClient && !isProvider && !isAdmin) {
    throw new ValidationError('Access denied to this booking');
  }

  // Check if booking can be cancelled
  if (!['PENDING', 'CONFIRMED'].includes(booking.status)) {
    throw new ValidationError('Booking cannot be cancelled at this stage');
  }

  // Calculate cancellation policy (simplified)
  const now = new Date();
  const bookingTime = new Date(`${booking.scheduledDate.toDateString()} ${booking.scheduledTime}`);
  const hoursUntilBooking = (bookingTime.getTime() - now.getTime()) / (1000 * 60 * 60);

  let refundPercentage = 100;
  if (hoursUntilBooking < 24) {
    refundPercentage = 50; // 50% refund if cancelled within 24 hours
  }
  if (hoursUntilBooking < 2) {
    refundPercentage = 0; // No refund if cancelled within 2 hours
  }

  // Update booking status
  const updatedBooking = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: 'CANCELLED',
      cancelledBy: user.userId,
      cancelledAt: now,
      cancellationReason: `Cancelled by ${isClient ? 'client' : 'provider'}`
    },
    include: {
      Client: {
        include: {
          UserClientProfile: {
            include: {
              User: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true
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
                  id: true,
                  name: true,
                  email: true,
                  phone: true
                }
              }
            }
          }
        }
      }
    }
  });

  // TODO: Process refund based on cancellation policy
  // TODO: Send cancellation notifications
  // TODO: Update provider availability

  return createSuccessResponse(
    {
      booking: updatedBooking,
      refundPercentage
    },
    'Booking cancelled successfully'
  );
}

// Helper function to determine valid status transitions
function getValidStatusTransitions(
  currentStatus: BookingStatus,
  isClient: boolean,
  isProvider: boolean,
  isAdmin: boolean
): BookingStatus[] {
  const transitions: Record<BookingStatus, BookingStatus[]> = {
    PENDING: isProvider || isAdmin ? ['CONFIRMED', 'CANCELLED'] : isClient ? ['CANCELLED'] : [],
    CONFIRMED: isProvider || isAdmin ? ['IN_PROGRESS', 'CANCELLED'] : isClient ? ['CANCELLED'] : [],
    IN_PROGRESS: isProvider || isAdmin ? ['COMPLETED', 'CANCELLED'] : [],
    AWAITING_CLIENT_CONFIRMATION: isClient || isAdmin ? ['COMPLETED', 'DISPUTED'] : [],
    COMPLETED: isAdmin ? ['DISPUTED'] : [],
    CANCELLED: isAdmin ? ['PENDING', 'CONFIRMED', 'REFUNDED'] : [],
    DISPUTED: isAdmin ? ['COMPLETED', 'CANCELLED', 'REFUNDED'] : [],
    REFUNDED: isAdmin ? ['CANCELLED'] : []
  };

  return transitions[currentStatus] || [];
}

// GET /api/bookings/[bookingId] - Get specific booking details
export async function GET(
  request: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  const tokenPayload = getCurrentUser(request);

  if (!tokenPayload?.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { bookingId } = params;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        Client: {
          include: {
            UserClientProfile: {
              include: {
                User: true
              }
            }
          }
        },
        ServiceProvider: {
          include: {
            UserProviderProfile: {
              include: {
                User: true
              }
            }
          }
        }
      }
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Check if user has access to this booking
    const hasAccess =
      booking.Client.UserClientProfile?.userId === tokenPayload.userId ||
      booking.ServiceProvider.UserProviderProfile?.userId === tokenPayload.userId;

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json({ booking });

  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json(
      { error: 'Failed to fetch booking' },
      { status: 500 }
    );
  }
}

// PATCH /api/bookings/[bookingId] - Update booking status (accept/decline)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  console.log('=== BOOKING STATUS UPDATE API START ===');

  const tokenPayload = getCurrentUser(request);

  if (!tokenPayload?.userId) {
    console.log('Authentication failed');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { bookingId } = params;
    const body = await request.json();
    const { action, message } = body; // action: 'ACCEPT' | 'DECLINE'

    console.log('Booking status update request:', { bookingId, action, message });

    if (!action || !['ACCEPT', 'DECLINE'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action. Must be ACCEPT or DECLINE' }, { status: 400 });
    }

    // Fetch booking with all relations
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        Client: {
          include: {
            UserClientProfile: {
              include: {
                User: true
              }
            }
          }
        },
        ServiceProvider: {
          include: {
            UserProviderProfile: {
              include: {
                User: true
              }
            }
          }
        }
      }
    });

    if (!booking) {
      console.log('Booking not found');
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Verify that the current user is the provider for this booking
    const isProvider = booking.ServiceProvider.UserProviderProfile?.userId === tokenPayload.userId;

    if (!isProvider) {
      console.log('Access denied - user is not the provider');
      return NextResponse.json({ error: 'Only the provider can update booking status' }, { status: 403 });
    }

    // Check if booking is in PENDING status
    if (booking.status !== 'PENDING') {
      console.log('Booking is not in PENDING status');
      return NextResponse.json({ error: 'Booking request has already been processed' }, { status: 400 });
    }

    const providerUser = booking.ServiceProvider.UserProviderProfile?.User;
    const clientUser = booking.Client.UserClientProfile?.User;

    if (!providerUser || !clientUser) {
      console.log('Provider or client user not found');
      return NextResponse.json({ error: 'Provider or client information not found' }, { status: 500 });
    }

    if (action === 'ACCEPT') {
      console.log('Processing ACCEPT action');

      // Update booking status to CONFIRMED
      const updatedBooking = await prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: 'CONFIRMED',
          updatedAt: new Date()
        }
      });

      console.log('✅ Booking status updated to CONFIRMED');

      // Prepare notification data
      const emailData = {
        bookingId: booking.id,
        clientName: clientUser.name || 'Client',
        clientEmail: clientUser.email,
        providerName: providerUser.name || 'Provider',
        providerEmail: providerUser.email,
        serviceTitle: booking.title,
        scheduledDate: booking.scheduledDate.toISOString().split('T')[0],
        scheduledTime: booking.scheduledTime,
        location: booking.location || 'No location specified',
        totalAmount: booking.totalAmount,
        currency: booking.currency
      };

      // Send notifications for accepted booking
      console.log('📧 Sending acceptance notifications...');
      const [emailResult, notificationResult, statusNotificationResult] = await Promise.all([
        EmailService.sendStatusUpdateEmail({
          ...emailData,
          newStatus: 'ACCEPTED',
          updateMessage: `Your booking request has been accepted! ${message ? `Message from provider: ${message}` : ''} Please complete your payment to confirm the booking.`
        }),
        NotificationService.sendProviderResponseNotification(
          bookingId,
          clientUser.id,
          providerUser.name || 'Provider',
          booking.title,
          'ACCEPTED',
          message
        ),
        // NEW: Enhanced status notification for provider too
        NotificationService.sendEnhancedStatusUpdateNotification(
          bookingId,
          providerUser.id,
          'PROVIDER',
          'PENDING',
          'CONFIRMED',
          booking.title,
          `You have accepted the booking request. ${message ? `Your message: "${message}"` : ''} Wait for client payment to complete the process.`
        )
      ]);

      console.log('Email result:', emailResult);
      console.log('Notification result:', notificationResult);

      return NextResponse.json({
        success: true,
        booking: updatedBooking,
        message: 'Booking request accepted successfully',
        nextSteps: {
          forClient: 'Complete payment to confirm the booking',
          forProvider: 'Wait for client to complete payment',
          paymentRequired: true
        }
      });

    } else if (action === 'DECLINE') {
      console.log('Processing DECLINE action');

      // Update booking status to CANCELLED
      const updatedBooking = await prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
          updatedAt: new Date()
        }
      });

      console.log('✅ Booking status updated to CANCELLED');

      // Send notifications for declined booking
      console.log('📧 Sending decline notifications...');
      try {
        const [emailResult, notificationResult] = await Promise.all([
          EmailService.sendStatusUpdateEmail({
            bookingId: booking.id,
            clientName: clientUser.name || 'Client',
            clientEmail: clientUser.email,
            providerName: providerUser.name || 'Provider',
            providerEmail: providerUser.email,
            serviceTitle: booking.title,
            scheduledDate: booking.scheduledDate.toISOString().split('T')[0],
            scheduledTime: booking.scheduledTime,
            location: booking.location || 'No location specified',
            totalAmount: booking.totalAmount,
            currency: booking.currency,
            newStatus: 'DECLINED',
            updateMessage: `Your booking request has been declined. ${message ? `Reason: ${message}` : ''} You can try booking with another provider.`
          }),
          NotificationService.sendProviderResponseNotification(
            bookingId,
            clientUser.id,
            providerUser.name || 'Provider',
            booking.title,
            'DECLINED',
            message
          )
        ]);

        console.log('Email result:', emailResult);
        console.log('Notification result:', notificationResult);

        // Send enhanced status notifications as fallback
        await Promise.all([
          NotificationService.sendEnhancedStatusUpdateNotification(
            bookingId,
            clientUser.id,
            'CLIENT',
            'PENDING',
            'CANCELLED',
            booking.title,
            `Your booking request has been declined. ${message ? `Reason: ${message}` : ''}`
          ),
          NotificationService.sendEnhancedStatusUpdateNotification(
            bookingId,
            providerUser.id,
            'PROVIDER',
            'PENDING',
            'CANCELLED',
            booking.title,
            `You have declined the booking request. ${message ? `Your message: "${message}"` : ''}`
          )
        ]);

      } catch (notificationError) {
        console.error('❌ Failed to send decline notifications:', notificationError);
        // Don't fail the whole request if notifications fail
      }

      return NextResponse.json({
        success: true,
        booking: updatedBooking,
        message: 'Booking request declined',
        nextSteps: {
          forClient: 'Try booking with another provider',
          forProvider: 'Request has been declined and client notified'
        }
      });
    }

  } catch (error) {
    console.error('Error updating booking status:', error);
    return NextResponse.json(
      { error: 'Failed to update booking status: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}

// PUT /api/bookings/[bookingId] - Update booking status (for completion)
export async function PUT(
  request: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  console.log('=== BOOKING COMPLETION API START ===');

  const tokenPayload = getCurrentUser(request);

  if (!tokenPayload?.userId) {
    console.log('Authentication failed');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { bookingId } = params;
    const body = await request.json();
    const { status } = body;

    console.log('Booking completion request:', { bookingId, status });

    if (!status || status !== 'COMPLETED') {
      return NextResponse.json({ error: 'Invalid status. Only COMPLETED is allowed for PUT requests' }, { status: 400 });
    }

    // Fetch booking with all relations
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        Client: {
          include: {
            UserClientProfile: {
              include: {
                User: true
              }
            }
          }
        },
        ServiceProvider: {
          include: {
            UserProviderProfile: {
              include: {
                User: true
              }
            }
          }
        }
      }
    });

    if (!booking) {
      console.log('Booking not found');
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Verify that the current user is the provider for this booking
    const isProvider = booking.ServiceProvider.UserProviderProfile?.userId === tokenPayload.userId;

    if (!isProvider) {
      console.log('Access denied - user is not the provider');
      return NextResponse.json({ error: 'Only the provider can mark service as completed' }, { status: 403 });
    }

    // Check if booking is in IN_PROGRESS or ACTIVE status
    if (!['IN_PROGRESS', 'ACTIVE'].includes(booking.status)) {
      console.log('Booking is not in progress');
      return NextResponse.json({ error: 'Booking must be in IN_PROGRESS or ACTIVE status to be completed' }, { status: 400 });
    }

    const providerUser = booking.ServiceProvider.UserProviderProfile?.User;
    const clientUser = booking.Client.UserClientProfile?.User;

    if (!providerUser || !clientUser) {
      console.log('Provider or client user not found');
      return NextResponse.json({ error: 'Provider or client information not found' }, { status: 500 });
    }

    console.log('Processing COMPLETION action');

    // Update booking status to AWAITING_CLIENT_CONFIRMATION
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'AWAITING_CLIENT_CONFIRMATION',
        completedAt: new Date(),
        clientConfirmDeadline: new Date(Date.now() + (48 * 60 * 60 * 1000)), // 48 hours from now
        updatedAt: new Date()
      }
    });

    console.log('✅ Booking status updated to AWAITING_CLIENT_CONFIRMATION');

    // Prepare notification data
    const emailData = {
      bookingId: booking.id,
      clientName: clientUser.name || 'Client',
      clientEmail: clientUser.email,
      providerName: providerUser.name || 'Provider',
      providerEmail: providerUser.email,
      serviceTitle: booking.title,
      scheduledDate: booking.scheduledDate.toISOString().split('T')[0],
      scheduledTime: booking.scheduledTime,
      location: booking.location || '',
      totalAmount: booking.totalAmount,
      currency: booking.currency
    };

    // Send notifications for service completion
    console.log('📧 Sending completion notifications...');
    try {
      const [notificationResultClient, notificationResultProvider, emailResult] = await Promise.all([
        NotificationService.sendEnhancedStatusUpdateNotification(
          bookingId,
          clientUser.id,
          'CLIENT',
          booking.status,
          'AWAITING_CLIENT_CONFIRMATION',
          booking.title,
          'Service has been completed. Please confirm or dispute within 48 hours.'
        ),
        NotificationService.sendEnhancedStatusUpdateNotification(
          bookingId,
          providerUser.id,
          'PROVIDER',
          booking.status,
          'AWAITING_CLIENT_CONFIRMATION',
          booking.title,
          'Service marked as completed. Awaiting client confirmation for payment release.'
        ),
        // Send email notifications
        EmailService.sendServiceCompletionConfirmationEmail(emailData)
      ]);

      console.log('Notification results:', { notificationResultClient, notificationResultProvider, emailResult });
    } catch (notificationError) {
      console.error('❌ Failed to send completion notifications:', notificationError);
      // Don't fail the whole request if notifications fail
    }

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
      message: 'Service marked as completed successfully',
      nextSteps: {
        forClient: 'Please confirm service completion or report any issues within 48 hours',
        forProvider: 'Awaiting client confirmation. Payment will be released after confirmation or automatically after 48 hours'
      }
    });

  } catch (error) {
    console.error('Error completing service:', error);
    return NextResponse.json(
      { error: 'Failed to complete service: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}

// Note: Export handlers are already defined above as GET, PUT, PATCH functions 