import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';
import { ContentFilterService } from '@/lib/content-filter';

// Mark this route as dynamic to handle headers during static generation
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const tokenPayload = getCurrentUser(request);

    if (!tokenPayload?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('bookingId');

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }

    // Verify user has access to this booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        Client: {
          include: {
            UserClientProfile: true
          }
        },
        ServiceProvider: {
          include: {
            UserProviderProfile: true
          }
        }
      }
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const isClient = booking.Client?.UserClientProfile?.userId === tokenPayload.userId;
    const isProvider = booking.ServiceProvider?.UserProviderProfile?.userId === tokenPayload.userId;

    if (!isClient && !isProvider) {
      return NextResponse.json({ error: 'Not authorized to view these messages' }, { status: 403 });
    }

    // Get messages for this booking using raw SQL to avoid foreign key issues
    const messages = await prisma.$queryRaw`
      SELECT * FROM "Message" 
      WHERE "bookingId" = ${bookingId}
      ORDER BY "createdAt" ASC
    `;

    // Mark messages as read for the current user using raw SQL
    const currentUserEntityId = isClient ? booking.Client.id : booking.ServiceProvider.id;
    await prisma.$executeRaw`
      UPDATE "Message" 
      SET "isRead" = true, "readAt" = NOW()
      WHERE "bookingId" = ${bookingId} 
        AND "receiverId" = ${currentUserEntityId} 
        AND "isRead" = false
    `;

    return NextResponse.json({
      success: true,
      messages,
      booking: {
        id: booking.id,
        title: booking.title,
        scheduledDate: booking.scheduledDate,
        scheduledTime: booking.scheduledTime,
        status: booking.status
      }
    });

  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const tokenPayload = getCurrentUser(request);

    if (!tokenPayload?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { bookingId, content, messageType = 'TEXT', attachments = [] } = body;

    if (!bookingId || !content?.trim()) {
      return NextResponse.json({ error: 'Booking ID and content are required' }, { status: 400 });
    }

    // Filter content for violations
    const filterResult = ContentFilterService.filterContent(content.trim());

    if (!filterResult.isAllowed) {
      // Log the violation
      await ContentFilterService.logViolation(
        tokenPayload.userId,
        bookingId,
        content,
        filterResult.violations,
        filterResult.riskScore
      );

      return NextResponse.json({
        error: 'Message blocked',
        reason: ContentFilterService.getWarningMessage(filterResult.violations),
        violations: filterResult.violations
      }, { status: 400 });
    }

    // Verify user has access to this booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        Client: {
          include: {
            UserClientProfile: true
          }
        },
        ServiceProvider: {
          include: {
            UserProviderProfile: true
          }
        }
      }
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const isClient = booking.Client?.UserClientProfile?.userId === tokenPayload.userId;
    const isProvider = booking.ServiceProvider?.UserProviderProfile?.userId === tokenPayload.userId;

    if (!isClient && !isProvider) {
      return NextResponse.json({ error: 'Not authorized to send messages for this booking' }, { status: 403 });
    }

    // Add detailed logging to debug the issue
    console.log('Debug message creation:');
    console.log('- isClient:', isClient);
    console.log('- isProvider:', isProvider);
    console.log('- booking.Client:', booking.Client ? 'exists' : 'missing');
    console.log('- booking.ServiceProvider:', booking.ServiceProvider ? 'exists' : 'missing');
    console.log('- booking.Client?.id:', booking.Client?.id);
    console.log('- booking.ServiceProvider?.id:', booking.ServiceProvider?.id);

    // Ensure we have both client and provider data
    if (!booking.Client || !booking.ServiceProvider) {
      console.error('Missing client or provider data in booking');
      return NextResponse.json({ error: 'Booking data incomplete' }, { status: 500 });
    }

    // Determine sender and receiver IDs (Client/Provider IDs, not User IDs)
    const senderId = isClient ? booking.Client.id : booking.ServiceProvider.id;
    const senderType = isClient ? 'CLIENT' : 'PROVIDER';
    const receiverId = isClient ? booking.ServiceProvider.id : booking.Client.id;
    const receiverType = isClient ? 'PROVIDER' : 'CLIENT';

    console.log('Message participants:');
    console.log('- senderId:', senderId);
    console.log('- senderType:', senderType);
    console.log('- receiverId:', receiverId);
    console.log('- receiverType:', receiverType);

    // Create message using raw SQL to bypass foreign key constraints
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const flaggedValue = filterResult.violations.length > 0;
    const flagReasonValue = filterResult.violations.length > 0 ? filterResult.violations.join(', ') : null;

    // Handle empty attachments array properly for PostgreSQL
    const attachmentsArray = attachments.length > 0 ? attachments : null;

    // Use raw SQL to insert the message to bypass the problematic foreign key constraints
    if (attachmentsArray) {
      await prisma.$executeRaw`
        INSERT INTO "Message" (
          id, content, "senderId", "senderType", "receiverId", "receiverType", 
          "bookingId", "messageType", attachments, "isRead", flagged, "flagReason", "createdAt"
        ) VALUES (
          ${messageId}, ${filterResult.filteredContent}, ${senderId}, ${senderType}, 
          ${receiverId}, ${receiverType}, ${bookingId}, ${messageType}::"MessageType", 
          ${attachmentsArray}, false, ${flaggedValue}, ${flagReasonValue}, NOW()
        )
      `;
    } else {
      await prisma.$executeRaw`
        INSERT INTO "Message" (
          id, content, "senderId", "senderType", "receiverId", "receiverType", 
          "bookingId", "messageType", "isRead", flagged, "flagReason", "createdAt"
        ) VALUES (
          ${messageId}, ${filterResult.filteredContent}, ${senderId}, ${senderType}, 
          ${receiverId}, ${receiverType}, ${bookingId}, ${messageType}::"MessageType", 
          false, ${flaggedValue}, ${flagReasonValue}, NOW()
        )
      `;
    }

    // Fetch the created message to return
    const message = await prisma.message.findUnique({
      where: { id: messageId }
    });

    // Send notification to receiver (using User ID for notifications)
    const receiverUserId = isClient
      ? booking.ServiceProvider?.UserProviderProfile?.userId || ''
      : booking.Client?.UserClientProfile?.userId || '';
    await sendMessageNotification(receiverUserId, receiverType, booking, content);

    return NextResponse.json({
      success: true,
      message,
      messageText: 'Message sent successfully'
    });

  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}

async function sendMessageNotification(
  receiverId: string,
  receiverType: string,
  booking: any,
  messageContent: string
) {
  try {
    await prisma.notification.create({
      data: {
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: receiverId,
        userType: receiverType,
        type: 'MESSAGE_RECEIVED',
        title: 'New Message',
        message: `New message about your booking for ${booking.scheduledDate.toLocaleDateString()}: ${messageContent.substring(0, 50)}${messageContent.length > 50 ? '...' : ''}`,
        data: JSON.stringify({
          bookingId: booking.id,
          messagePreview: messageContent.substring(0, 100)
        })
      }
    });
  } catch (error) {
    console.error('Error sending message notification:', error);
  }
} 