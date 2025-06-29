import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';

export async function PUT(
    request: NextRequest,
    { params }: { params: { bookingId: string } }
) {
    try {
        const token = await getToken({ req: request });

        if (!token?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { bookingId } = params;
        const body = await request.json();
        const { status, reason } = body;

        // Validate status
        if (!['CONFIRMED', 'CANCELLED'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        // Get booking with provider info
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                ServiceProvider: {
                    include: {
                        UserProviderProfile: true
                    }
                },
                Client: {
                    include: {
                        UserClientProfile: true
                    }
                }
            }
        });

        if (!booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }

        // Check if user is the provider for this booking
        const isProvider = booking.ServiceProvider?.UserProviderProfile?.userId === token.userId;
        const isAdmin = Array.isArray(token.roles) && token.roles.includes('ADMIN');

        if (!isProvider && !isAdmin) {
            return NextResponse.json({ error: 'Not authorized to update this booking' }, { status: 403 });
        }

        // Check if booking is in a valid state for status change
        if (booking.status !== 'PENDING') {
            return NextResponse.json({ error: 'Booking cannot be modified in current state' }, { status: 400 });
        }

        // Update booking status
        const updateData: any = {
            status,
            updatedAt: new Date()
        };

        if (status === 'CANCELLED') {
            updateData.cancellationReason = reason || 'Cancelled by provider';
            updateData.cancelledBy = token.userId;
            updateData.cancelledAt = new Date();
        }

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

        // Send notifications based on status change
        await sendStatusChangeNotifications(updatedBooking, status);

        // Handle refund if booking is cancelled
        if (status === 'CANCELLED' && booking.isPaid) {
            await processRefund(bookingId);
        }

        return NextResponse.json({
            success: true,
            booking: updatedBooking,
            message: status === 'CONFIRMED' ? 'Booking confirmed successfully' : 'Booking cancelled successfully'
        });

    } catch (error) {
        console.error('Error updating booking status:', error);
        return NextResponse.json(
            { error: 'Failed to update booking status' },
            { status: 500 }
        );
    }
}

async function sendStatusChangeNotifications(booking: any, newStatus: string) {
    try {
        const clientUserId = booking.Client?.UserClientProfile?.userId;
        const providerUserId = booking.ServiceProvider?.UserProviderProfile?.userId;

        if (newStatus === 'CONFIRMED') {
            // Notify client that booking is confirmed
            if (clientUserId) {
                await prisma.notification.create({
                    data: {
                        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        userId: clientUserId,
                        userType: 'CLIENT',
                        type: 'BOOKING_CONFIRMED',
                        title: 'Booking Confirmed!',
                        message: `Your booking for ${booking.scheduledDate.toLocaleDateString()} has been confirmed by the provider`,
                        data: JSON.stringify({ bookingId: booking.id })
                    }
                });
            }

            // Send system message to conversation
            await prisma.message.create({
                data: {
                    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    content: `🎉 Great news! Your booking has been confirmed for ${booking.scheduledDate.toLocaleDateString()} at ${booking.scheduledTime}. The provider will be ready to serve you!`,
                    senderId: 'system',
                    senderType: 'SYSTEM',
                    receiverId: clientUserId || '',
                    receiverType: 'CLIENT',
                    bookingId: booking.id,
                    messageType: 'TEXT'
                }
            });

        } else if (newStatus === 'CANCELLED') {
            // Notify client that booking is cancelled
            if (clientUserId) {
                await prisma.notification.create({
                    data: {
                        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        userId: clientUserId,
                        userType: 'CLIENT',
                        type: 'BOOKING_CANCELLED',
                        title: 'Booking Cancelled',
                        message: `Your booking for ${booking.scheduledDate.toLocaleDateString()} has been cancelled. ${booking.cancellationReason ? 'Reason: ' + booking.cancellationReason : ''}`,
                        data: JSON.stringify({ bookingId: booking.id })
                    }
                });
            }

            // Send system message to conversation
            await prisma.message.create({
                data: {
                    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    content: `❌ Unfortunately, your booking for ${booking.scheduledDate.toLocaleDateString()} has been cancelled. ${booking.cancellationReason ? 'Reason: ' + booking.cancellationReason : ''} Any payments will be refunded within 3-5 business days.`,
                    senderId: 'system',
                    senderType: 'SYSTEM',
                    receiverId: clientUserId || '',
                    receiverType: 'CLIENT',
                    bookingId: booking.id,
                    messageType: 'TEXT'
                }
            });
        }
    } catch (error) {
        console.error('Error sending status change notifications:', error);
    }
}

async function processRefund(bookingId: string) {
    try {
        // Find the original payment transaction
        const transaction = await prisma.transaction.findFirst({
            where: {
                bookingId,
                type: 'BOOKING_PAYMENT',
                status: 'COMPLETED'
            }
        });

        if (transaction) {
            // Create refund transaction (mock - always succeeds)
            await prisma.transaction.create({
                data: {
                    id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    bookingId,
                    userId: transaction.userId,
                    userType: transaction.userType,
                    type: 'REFUND',
                    amount: transaction.amount,
                    currency: transaction.currency,
                    status: 'COMPLETED',
                    paymentMethod: 'MOCK_REFUND',
                    updatedAt: new Date(),
                    metadata: JSON.stringify({
                        originalTransactionId: transaction.id,
                        refundReason: 'Booking cancelled by provider'
                    })
                }
            });

            console.log(`Mock refund processed for booking ${bookingId}: ${transaction.amount} ${transaction.currency}`);
        }
    } catch (error) {
        console.error('Error processing refund:', error);
    }
} 