import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';
import { NotificationService } from '@/lib/notifications';
import { EmailService } from '@/lib/email';

// Helper function to update provider rating
async function updateProviderRating(providerId: string) {
    try {
        const reviews = await prisma.review.findMany({
            where: {
                providerId: providerId,
                overallRating: { gt: 0 }
            }
        });

        if (reviews.length > 0) {
            const averageRating = reviews.reduce((sum, review) => sum + review.overallRating, 0) / reviews.length;

            await prisma.serviceProvider.update({
                where: { id: providerId },
                data: {
                    rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
                    totalReviews: reviews.length,
                    updatedAt: new Date()
                }
            });
        }
    } catch (error) {
        console.error('Error updating provider rating:', error);
    }
}

// POST /api/bookings/[bookingId]/confirm - Client confirms service completion
export async function POST(
    request: NextRequest,
    { params }: { params: { bookingId: string } }
) {
    try {
        const tokenPayload = getCurrentUser(request);

        if (!tokenPayload?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { bookingId } = params;
        const body = await request.json();
        const { action, reason, rating, review } = body; // action: 'ACCEPT' | 'DISPUTE'

        if (!action || !['ACCEPT', 'DISPUTE'].includes(action)) {
            return NextResponse.json({ error: 'Invalid action. Must be ACCEPT or DISPUTE' }, { status: 400 });
        }

        // Get booking with client info
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

        // Check if user is the client for this booking
        const isClient = booking.Client?.UserClientProfile?.userId === tokenPayload.userId;
        const isAdmin = tokenPayload.roles?.includes('ADMIN');

        if (!isClient && !isAdmin) {
            return NextResponse.json({ error: 'Only the client can confirm completion' }, { status: 403 });
        }

        // Check if booking is in awaiting confirmation status
        if (booking.status !== 'AWAITING_CLIENT_CONFIRMATION') {
            return NextResponse.json({ error: 'Booking is not awaiting client confirmation' }, { status: 400 });
        }

        if (action === 'ACCEPT') {
            // Client accepts the service completion
            const updatedBooking = await prisma.booking.update({
                where: { id: bookingId },
                data: {
                    status: 'COMPLETED',
                    clientConfirmedAt: new Date(),
                    updatedAt: new Date()
                }
            });

            // Create review if rating or review text is provided
            let createdReview = null;
            if (rating > 0 || (review && review.trim())) {
                try {
                    // Get client profile to use as reviewer
                    const clientProfile = await prisma.userClientProfile.findFirst({
                        where: { userId: booking.Client.UserClientProfile?.User?.id }
                    });

                    // Get provider profile to use as reviewee
                    const providerProfile = await prisma.userProviderProfile.findFirst({
                        where: { userId: booking.ServiceProvider.UserProviderProfile?.User?.id }
                    });

                    if (clientProfile && providerProfile) {
                        createdReview = await prisma.review.create({
                            data: {
                                id: `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                                bookingId: booking.id,
                                clientId: booking.clientId,
                                providerId: booking.providerId,
                                overallRating: rating || 5, // Default to 5 if review text but no rating
                                comment: review?.trim() || '',
                                createdAt: new Date()
                            }
                        });

                        // Update provider rating after review creation (using providerId)
                        await updateProviderRating(booking.providerId);
                    }
                } catch (reviewError) {
                    console.error('Failed to create review:', reviewError);
                    // Don't fail the confirmation if review creation fails
                }
            }

            // Send notifications and emails
            const providerUserId = booking.ServiceProvider.UserProviderProfile?.userId;
            const clientUserId = booking.Client.UserClientProfile?.userId;

            if (providerUserId) {
                await NotificationService.sendEnhancedStatusUpdateNotification(
                    bookingId,
                    providerUserId,
                    'PROVIDER',
                    'AWAITING_CLIENT_CONFIRMATION',
                    'COMPLETED',
                    booking.title,
                    'The client has confirmed the service completion. Payment will be released shortly.'
                );

                // Create notification for provider
                await prisma.notification.create({
                    data: {
                        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        userId: providerUserId,
                        userType: 'PROVIDER',
                        type: 'BOOKING_CONFIRMED',
                        title: 'Service Confirmed! ✅',
                        message: `The client has confirmed completion of "${booking.title}". Your payment has been released immediately and is now available in your wallet!`,
                        data: JSON.stringify({
                            bookingId: booking.id,
                            serviceTitle: booking.title,
                            rating: rating || null,
                            nextAction: 'AWAIT_PAYMENT_RELEASE'
                        })
                    }
                });
            }

            // Send email notifications
            try {
                await EmailService.sendClientConfirmationEmails({
                    bookingId: booking.id,
                    clientName: booking.Client?.UserClientProfile?.User?.name || 'Client',
                    clientEmail: booking.Client?.UserClientProfile?.User?.email || '',
                    providerName: booking.ServiceProvider.UserProviderProfile?.User?.name || 'Provider',
                    providerEmail: booking.ServiceProvider.UserProviderProfile?.User?.email || '',
                    serviceTitle: booking.title,
                    scheduledDate: booking.scheduledDate.toISOString(),
                    scheduledTime: booking.scheduledTime,
                    location: booking.location || '',
                    totalAmount: booking.totalAmount,
                    currency: booking.currency,
                    action: 'ACCEPT'
                });
            } catch (emailError) {
                console.error('Failed to send confirmation emails:', emailError);
                // Don't fail the request if email fails
            }

            // IMMEDIATE PAYMENT RELEASE - Two-party confirmation
            let paymentReleased = false;
            try {
                console.log('💰 Releasing payment immediately due to client confirmation');

                // Calculate provider amount (total - commission)
                const providerAmount = booking.providerAmount || (booking.totalAmount - (booking.commissionAmount || booking.totalAmount * 0.05));

                // Mark escrow as released
                await prisma.booking.update({
                    where: { id: bookingId },
                    data: {
                        escrowReleased: true,
                        updatedAt: new Date()
                    }
                });

                // Create transaction record for immediate release
                await prisma.transaction.create({
                    data: {
                        id: `escrow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        userId: booking.providerId,
                        userType: 'PROVIDER',
                        bookingId: booking.id,
                        type: 'ESCROW_RELEASE',
                        amount: providerAmount,
                        currency: booking.currency,
                        status: 'COMPLETED',
                        description: `Immediate release - Client confirmed completion of "${booking.title}"`,
                        metadata: {
                            originalAmount: booking.totalAmount,
                            commission: booking.commissionAmount || booking.totalAmount * 0.05,
                            releaseReason: 'IMMEDIATE_TWO_PARTY_CONFIRMATION',
                            clientConfirmedAt: new Date(),
                            releaseType: 'instant'
                        },
                        createdAt: new Date(),
                        updatedAt: new Date()
                    }
                });

                // Update or create provider wallet
                const existingWallet = await prisma.providerWallet.findUnique({
                    where: { providerId: booking.providerId }
                });

                if (existingWallet) {
                    await prisma.providerWallet.update({
                        where: { providerId: booking.providerId },
                        data: {
                            balance: { increment: providerAmount },
                            updatedAt: new Date()
                        }
                    });
                } else {
                    await prisma.providerWallet.create({
                        data: {
                            id: `wallet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                            providerId: booking.providerId,
                            balance: providerAmount,
                            currency: booking.currency,
                            canWithdraw: true,
                            createdAt: new Date(),
                            updatedAt: new Date()
                        }
                    });
                }

                paymentReleased = true;
                console.log(`✅ Payment released immediately: ${providerAmount} ${booking.currency}`);

            } catch (paymentError) {
                console.error('❌ Failed to release payment immediately:', paymentError);
                // Don't fail the confirmation if payment release fails
            }

            return NextResponse.json({
                success: true,
                booking: updatedBooking,
                review: createdReview,
                paymentReleased,
                message: createdReview ?
                    'Service completion confirmed with your review! Payment has been released immediately to the provider.' :
                    'Service completion confirmed successfully. Payment has been released immediately to the provider.'
            });

        } else if (action === 'DISPUTE') {
            // Client disputes the service completion
            const dispute = await prisma.dispute.create({
                data: {
                    id: `dispute_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    bookingId: booking.id,
                    raisedBy: booking.clientId,
                    raisedByType: 'CLIENT',
                    type: 'SERVICE_QUALITY',
                    subject: 'Service completion dispute',
                    description: reason || 'Client disputes the completion of the service',
                    evidence: [],
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            });

            // Update booking status to disputed
            const updatedBooking = await prisma.booking.update({
                where: { id: bookingId },
                data: {
                    status: 'DISPUTED',
                    updatedAt: new Date()
                }
            });

            // Send notifications to both parties
            const providerUserId = booking.ServiceProvider.UserProviderProfile?.userId;
            const clientUserId = booking.Client.UserClientProfile?.userId;

            const notificationPromises = [];

            if (providerUserId) {
                notificationPromises.push(
                    prisma.notification.create({
                        data: {
                            id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                            userId: providerUserId,
                            userType: 'PROVIDER',
                            type: 'DISPUTE_CREATED',
                            title: 'Service Disputed ⚠️',
                            message: `The client has disputed the completion of "${booking.title}". Our team will review the case.`,
                            data: JSON.stringify({
                                bookingId: booking.id,
                                disputeId: dispute.id,
                                serviceTitle: booking.title,
                                nextAction: 'AWAIT_ADMIN_REVIEW'
                            })
                        }
                    })
                );
            }

            if (clientUserId) {
                notificationPromises.push(
                    prisma.notification.create({
                        data: {
                            id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                            userId: clientUserId,
                            userType: 'CLIENT',
                            type: 'DISPUTE_CREATED',
                            title: 'Dispute Created 📝',
                            message: `Your dispute for "${booking.title}" has been submitted. Our team will review and respond within 24-48 hours.`,
                            data: JSON.stringify({
                                bookingId: booking.id,
                                disputeId: dispute.id,
                                serviceTitle: booking.title,
                                nextAction: 'AWAIT_ADMIN_REVIEW'
                            })
                        }
                    })
                );
            }

            await Promise.all(notificationPromises);

            // Send email notifications for dispute
            try {
                await EmailService.sendClientConfirmationEmails({
                    bookingId: booking.id,
                    clientName: booking.Client?.UserClientProfile?.User?.name || 'Client',
                    clientEmail: booking.Client?.UserClientProfile?.User?.email || '',
                    providerName: booking.ServiceProvider.UserProviderProfile?.User?.name || 'Provider',
                    providerEmail: booking.ServiceProvider.UserProviderProfile?.User?.email || '',
                    serviceTitle: booking.title,
                    scheduledDate: booking.scheduledDate.toISOString(),
                    scheduledTime: booking.scheduledTime,
                    location: booking.location || '',
                    totalAmount: booking.totalAmount,
                    currency: booking.currency,
                    action: 'DISPUTE',
                    message: reason
                });
            } catch (emailError) {
                console.error('Failed to send dispute emails:', emailError);
                // Don't fail the request if email fails
            }

            return NextResponse.json({
                success: true,
                booking: updatedBooking,
                dispute: dispute,
                message: 'Dispute has been created. Our team will review the case within 24-48 hours.'
            });
        }

    } catch (error) {
        console.error('Error handling client confirmation:', error);
        return NextResponse.json(
            { error: 'Failed to process confirmation' },
            { status: 500 }
        );
    }
} 