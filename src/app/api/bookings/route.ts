import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/jwt';
import {
  withErrorHandler,
  requireAuth,
  createSuccessResponse,
  getQueryParams,
  calculatePagination,
  ValidationError
} from '@/lib/api-middleware';
import { prisma } from '@/lib/prisma';
import type { Booking, BookingStatus } from '@/types';
import { EmailService, type BookingEmailData } from '@/lib/email';
import { NotificationService, type BookingNotificationData } from '@/lib/notifications';

// GET /api/bookings - List bookings with filtering
async function handleGet(request: NextRequest) {
  const user = await requireAuth(request);
  const { page, limit, filters, sortBy, sortOrder } = getQueryParams(request);

  // Build where clause based on user role and filters
  const where: any = {};

  // Role-based filtering - simplified approach
  if (user.roles.includes('CLIENT')) {
    // Simple approach: find bookings where client email matches user email
    console.log('🔍 Searching for bookings with client email:', user.email);

    // Debug: Check if any clients exist with this email
    const clientCheck = await prisma.client.findMany({
      where: { email: user.email }
    });
    console.log('🔍 Clients found with this email:', clientCheck.length);

    // Debug: Check all clients in the system
    const allClients = await prisma.client.findMany();
    console.log('🔍 All clients in system:', allClients.map(c => ({ name: c.name, email: c.email })));

    where.Client = {
      email: user.email
    };
  } else if (user.roles.includes('PROVIDER')) {
    // Find the ServiceProvider ID for this user
    const userWithProvider = await prisma.user.findUnique({
      where: { id: user.userId },
      include: {
        UserProviderProfile: {
          include: { ServiceProvider: true }
        }
      }
    });

    if (!userWithProvider?.UserProviderProfile?.ServiceProvider?.id) {
      throw new ValidationError('Provider profile not found');
    }

    where.providerId = userWithProvider.UserProviderProfile.ServiceProvider.id;
  } else if (!user.roles.includes('ADMIN')) {
    throw new ValidationError('Unauthorized role');
  }

  // Status filter
  if (filters.status) {
    where.status = filters.status as BookingStatus;
  }

  // Date range filter
  if (filters.startDate || filters.endDate) {
    where.scheduledDate = {};
    if (filters.startDate) {
      where.scheduledDate.gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      where.scheduledDate.lte = new Date(filters.endDate);
    }
  }

  // Service category filter
  if (filters.category) {
    where.category = filters.category;
  }

  // Debug logging
  console.log('📋 Final where clause:', JSON.stringify(where, null, 2));

  // Debug: Check total bookings in system
  const allBookingsCount = await prisma.booking.count();
  console.log('📊 Total bookings in entire system:', allBookingsCount);

  // Get total count for pagination
  const total = await prisma.booking.count({ where });
  console.log('📊 Total bookings found with filter:', total);

  // Calculate pagination
  const pagination = calculatePagination(page, limit, total);

  // Fetch bookings with related data
  const bookings = await prisma.booking.findMany({
    where,
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
      Service: {
        select: {
          id: true,
          name: true,
          category: true,
          basePrice: true
        }
      },
      Transaction: true
    },
    orderBy: {
      [sortBy]: sortOrder
    },
    skip: (pagination.page - 1) * pagination.limit,
    take: pagination.limit
  });

  console.log('📦 Raw bookings from database:', bookings.length);

  // Transform the data to match expected format for client dashboard
  const transformedBookings = bookings.map(booking => ({
    id: booking.id,
    title: booking.title, // Frontend expects 'title'
    description: booking.description, // Frontend expects 'description'
    status: booking.status,
    isPaid: booking.isPaid,
    scheduledDate: booking.scheduledDate,
    scheduledTime: booking.scheduledTime,
    duration: booking.duration,
    location: booking.location,
    totalAmount: booking.totalAmount,
    currency: booking.currency,
    paymentMethod: booking.paymentMethod || 'MOBILE_MONEY',
    createdAt: booking.createdAt,
    updatedAt: booking.updatedAt,
    provider: {
      id: booking.ServiceProvider?.UserProviderProfile?.User?.id || '',
      name: booking.ServiceProvider?.UserProviderProfile?.User?.name || 'Unknown Provider',
      email: booking.ServiceProvider?.UserProviderProfile?.User?.email || '',
      profileImage: booking.ServiceProvider?.UserProviderProfile?.User?.image || null
    },
    client: {
      id: booking.Client?.UserClientProfile?.User?.id || '',
      name: booking.Client?.UserClientProfile?.User?.name || 'Unknown Client',
      email: booking.Client?.UserClientProfile?.User?.email || '',
      image: booking.Client?.UserClientProfile?.User?.image || null
    },
    service: booking.Service ? {
      id: booking.Service.id,
      title: booking.Service.name,
      category: booking.Service.category
    } : null,
    canPay: booking.status === 'CONFIRMED' && !booking.isPaid,
    needsAction: (booking.status === 'CONFIRMED' && !booking.isPaid) || booking.status === 'PENDING'
  }));

  return createSuccessResponse({
    bookings: transformedBookings,
    pagination
  });
}

// GET /api/bookings - List bookings with filtering
export async function GET(request: NextRequest) {
  return await withErrorHandler(handleGet)(request);
}

// POST /api/bookings - Create new booking REQUEST (not confirmed booking)
export async function POST(request: NextRequest) {
  console.log('=== BOOKING REQUEST API START ===');

  const tokenPayload = getCurrentUser(request);
  console.log('Token payload:', tokenPayload ? 'Found' : 'Missing');

  if (!tokenPayload?.userId) {
    console.log('Authentication failed - no token payload');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    console.log('Booking request body:', body);
    console.log('Extracted serviceId:', body.serviceId);
    console.log('serviceId type:', typeof body.serviceId);
    console.log('serviceId value:', body.serviceId, 'is empty?', !body.serviceId);

    // Validate required fields
    const {
      serviceId,
      providerId,
      bookingType,
      selectedDate,
      selectedTime,
      duration,
      location,
      customerInfo,
      pricing,
      paymentMethod,
      specialRequests
    } = body;

    if (!providerId || !selectedDate || !selectedTime || !location?.address || !customerInfo?.name || !customerInfo?.email) {
      console.log('Missing required fields');
      return NextResponse.json({ error: 'Missing required booking fields' }, { status: 400 });
    }

    console.log('All validation passed');

    // Validate serviceId if provided
    if (serviceId) {
      console.log('Validating serviceId:', serviceId);
      const service = await prisma.service.findUnique({
        where: { id: serviceId }
      });

      if (!service) {
        console.log('Service not found for serviceId:', serviceId);
        return NextResponse.json({ error: 'Service not found' }, { status: 404 });
      }
      console.log('Service found:', service.name);
    } else {
      console.log('No serviceId provided - creating general booking');
    }

    // Fetch provider information for emails
    const providerUser = await prisma.user.findFirst({
      where: {
        UserProviderProfile: {
          ServiceProvider: {
            id: providerId
          }
        }
      }
    });

    if (!providerUser) {
      console.log('Provider not found');
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
    }

    // Get or create client record
    let client = await prisma.client.findFirst({
      where: {
        UserClientProfile: {
          userId: tokenPayload.userId
        }
      }
    });

    if (!client) {
      // Create client if doesn't exist
      client = await prisma.client.create({
        data: {
          id: `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          email: customerInfo.email,
          name: customerInfo.name,
          phone: customerInfo.phone || null,
          updatedAt: new Date()
        }
      });

      // Create UserClientProfile
      await prisma.userClientProfile.create({
        data: {
          id: `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: tokenPayload.userId,
          clientId: client.id
        }
      });
    }

    // Create booking REQUEST (PENDING status - no payment yet)
    console.log('Creating booking request in database...');
    const booking = await prisma.booking.create({
      data: {
        id: `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        clientId: client.id,
        providerId: providerId,
        serviceId: serviceId || null,
        title: `Service Booking Request`,
        description: `Booking request for ${customerInfo.name}`,
        bookingType: bookingType || 'IN_PERSON',
        scheduledDate: new Date(selectedDate),
        scheduledTime: selectedTime,
        duration: duration || 60,
        location: location.address,
        totalAmount: pricing.total,
        currency: 'GHS',
        status: 'PENDING', // Key change: starts as PENDING
        isPaid: false, // Key change: no payment yet
        paymentMethod: paymentMethod || 'MOBILE_MONEY',
        updatedAt: new Date()
      }
    });

    console.log('✅ Booking request saved to database:', booking.id);

    // Prepare email data for booking REQUEST
    const emailData: BookingEmailData = {
      bookingId: booking.id,
      clientName: customerInfo.name,
      clientEmail: customerInfo.email,
      providerName: providerUser.name || 'Provider',
      providerEmail: providerUser.email,
      serviceTitle: booking.title,
      scheduledDate: selectedDate,
      scheduledTime: selectedTime,
      location: location.address,
      totalAmount: pricing.total,
      currency: 'GHS'
    };

    // Prepare notification data
    const notificationData: BookingNotificationData = {
      id: booking.id,
      clientId: tokenPayload.userId,
      providerId: providerId,
      serviceTitle: booking.title,
      scheduledDate: selectedDate,
      scheduledTime: selectedTime,
      location: location.address,
      totalAmount: pricing.total,
      currency: 'GHS'
    };

    // Send booking REQUEST notifications (different messaging)
    console.log('📧 Sending booking request notifications...');
    const [emailResults, notificationResults] = await Promise.all([
      EmailService.sendBookingRequestEmails(emailData, specialRequests || ''),
      NotificationService.sendBookingRequestNotifications(notificationData, providerUser.id)
    ]);

    console.log('Email results:', emailResults);
    console.log('Notification results:', notificationResults);

    console.log('Returning booking request:', booking.id);

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        clientId: booking.clientId,
        providerId: booking.providerId,
        serviceId: booking.serviceId,
        title: booking.title,
        description: booking.description,
        scheduledDate: booking.scheduledDate,
        scheduledTime: booking.scheduledTime,
        duration: booking.duration,
        location: booking.location,
        totalAmount: booking.totalAmount,
        currency: booking.currency,
        status: booking.status,
        isPaid: booking.isPaid,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt
      },
      message: 'Booking request sent successfully! The provider will review and respond soon.',
      notifications: {
        emailSent: emailResults.success,
        systemNotificationsSent: notificationResults.success,
        emailDetails: {
          clientEmailSent: emailResults.clientEmailSent || false,
          providerEmailSent: emailResults.providerEmailSent || false
        },
        notificationDetails: {
          clientNotificationId: notificationResults.clientNotificationId,
          providerNotificationId: notificationResults.providerNotificationId
        }
      },
      nextSteps: {
        forClient: "Wait for provider response. You'll be notified when they accept or decline.",
        forProvider: "Review the booking request in your dashboard and respond.",
        paymentNote: "Payment will be processed only after the provider accepts your request."
      }
    });

  } catch (error) {
    console.error('Error creating booking request:', error);
    return NextResponse.json(
      { error: 'Failed to create booking request: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}

// PATCH /api/bookings - Update booking status
export async function PATCH(request: NextRequest) {
  try {
    const tokenPayload = getCurrentUser(request);
    if (!tokenPayload?.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { bookingId, status, reason } = await request.json();

    if (!bookingId || !status) {
      return NextResponse.json(
        { error: 'Missing booking ID or status' },
        { status: 400 }
      );
    }

    // Update booking status in database
    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status,
        updatedAt: new Date(),
        ...(reason && { cancellationReason: reason })
      }
    });

    console.log('Booking status updated:', {
      bookingId,
      newStatus: status,
      updatedBy: tokenPayload.userId,
      reason
    });

    // Send comprehensive status change notifications
    const bookingDetails = await prisma.booking.findUnique({
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

    if (bookingDetails) {
      const clientUserId = bookingDetails.Client.UserClientProfile?.userId;
      const providerUserId = bookingDetails.ServiceProvider.UserProviderProfile?.userId;

      if (clientUserId && providerUserId) {
        // Send enhanced notifications for both client and provider
        await Promise.all([
          NotificationService.sendEnhancedStatusUpdateNotification(
            bookingId,
            clientUserId,
            'CLIENT',
            bookingDetails.status,
            status,
            bookingDetails.title,
            reason || 'Status updated'
          ),
          NotificationService.sendEnhancedStatusUpdateNotification(
            bookingId,
            providerUserId,
            'PROVIDER',
            bookingDetails.status,
            status,
            bookingDetails.title,
            reason || 'Status updated'
          )
        ]);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Booking status updated successfully',
      booking
    });

  } catch (error) {
    console.error('Booking update error:', error);
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    );
  }
} 