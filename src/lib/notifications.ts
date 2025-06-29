import { prisma } from './prisma';

export interface BookingNotificationData {
    id: string;
    clientId: string;
    providerId: string;
    serviceTitle: string;
    scheduledDate: string;
    scheduledTime: string;
    location: string;
    totalAmount: number;
    currency: string;
}

export class NotificationService {

    // Helper function to get the correct entity ID for notifications
    private static async getEntityIdForNotification(userId: string, userType: 'CLIENT' | 'PROVIDER' | 'ADMIN'): Promise<string | null> {
        try {
            if (userType === 'CLIENT') {
                const clientProfile = await prisma.userClientProfile.findUnique({
                    where: { userId },
                    include: { Client: true }
                });
                return clientProfile?.Client?.id || null;
            } else if (userType === 'PROVIDER') {
                const providerProfile = await prisma.userProviderProfile.findUnique({
                    where: { userId },
                    include: { ServiceProvider: true }
                });
                return providerProfile?.ServiceProvider?.id || null;
            } else if (userType === 'ADMIN') {
                const adminProfile = await prisma.userAdminProfile.findUnique({
                    where: { userId },
                    include: { Admin: true }
                });
                return adminProfile?.Admin?.id || null;
            }
            return null;
        } catch (error) {
            console.error(`Failed to get entity ID for ${userType}:`, error);
            return null;
        }
    }

    // Enhanced notification creation (simplified - no foreign key constraints)
    private static async createNotification(
        userId: string,
        userType: 'CLIENT' | 'PROVIDER' | 'ADMIN',
        type: string,
        title: string,
        message: string,
        data: any,
        sentViaEmail: boolean = false,
        sentViaSMS: boolean = false
    ) {
        try {
            // Get the correct entity ID for the notification  
            const entityId = await this.getEntityIdForNotification(userId, userType);

            // If we can't find entity ID, we'll use the original user ID as fallback
            const notificationUserId = entityId || userId;

            console.log(`📝 Creating ${userType} notification for user:`, userId, 'entity:', entityId || 'fallback to userId');

            const notification = await prisma.notification.create({
                data: {
                    id: `notif_${type.toLowerCase()}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    userId: notificationUserId, // Use entity ID or fallback to user ID
                    userType,
                    type: type as any,
                    title,
                    message,
                    data: JSON.stringify(data),
                    sentViaEmail,
                    sentViaSMS
                }
            });

            console.log(`✅ ${userType} notification created:`, notification.id, 'for user:', notificationUserId);
            return notification;

        } catch (error) {
            console.error(`❌ Failed to create ${userType} notification:`, error);
            console.error('Error details:', error);
            return null;
        }
    }

    // FIXED: Booking request notifications with proper entity IDs
    static async sendBookingRequestNotifications(booking: BookingNotificationData, providerUserId: string) {
        try {
            console.log('📱 Creating system notifications for booking request:', booking.id);
            console.log('Client User ID:', booking.clientId, 'Provider User ID:', providerUserId);

            // Create notification for client - booking request sent
            const clientNotification = await this.createNotification(
                booking.clientId,
                'CLIENT',
                'BOOKING_REQUEST',
                'Booking Request Sent! 📨',
                `Your booking request for "${booking.serviceTitle}" has been sent to the provider. You'll be notified when they respond (usually within 24 hours).`,
                {
                    bookingId: booking.id,
                    serviceTitle: booking.serviceTitle,
                    scheduledDate: booking.scheduledDate,
                    scheduledTime: booking.scheduledTime,
                    amount: booking.totalAmount,
                    currency: booking.currency,
                    status: 'PENDING',
                    isUrgent: this.isUrgentBooking(booking.scheduledDate),
                    nextAction: 'WAIT_FOR_PROVIDER_RESPONSE'
                },
                true,
                false
            );

            // Create notification for provider - new booking request (action required)
            const providerNotification = await this.createNotification(
                providerUserId,
                'PROVIDER',
                'BOOKING_REQUEST',
                'New Booking Request! 🔔',
                `You have a new booking request for "${booking.serviceTitle}" on ${new Date(booking.scheduledDate).toLocaleDateString()} at ${booking.scheduledTime}. Please review and respond quickly!`,
                {
                    bookingId: booking.id,
                    clientId: booking.clientId,
                    serviceTitle: booking.serviceTitle,
                    scheduledDate: booking.scheduledDate,
                    scheduledTime: booking.scheduledTime,
                    location: booking.location,
                    amount: booking.totalAmount,
                    currency: booking.currency,
                    status: 'PENDING',
                    isUrgent: this.isUrgentBooking(booking.scheduledDate),
                    requiresAction: true,
                    nextAction: 'ACCEPT_OR_DECLINE',
                    timeToRespond: '24 hours'
                },
                true,
                false
            );

            const success = clientNotification && providerNotification;

            return {
                success,
                clientNotificationId: clientNotification?.id || null,
                providerNotificationId: providerNotification?.id || null,
                message: success ? 'Booking request notifications sent successfully' : 'Some notifications failed to send'
            };

        } catch (error) {
            console.error('❌ Failed to create booking request notifications:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
                clientNotificationId: null,
                providerNotificationId: null
            };
        }
    }

    // FIXED: Provider response notifications
    static async sendProviderResponseNotification(
        bookingId: string,
        clientUserId: string,
        providerName: string,
        serviceTitle: string,
        response: 'ACCEPTED' | 'DECLINED',
        message?: string
    ) {
        try {
            const notification = await this.createNotification(
                clientUserId,
                'CLIENT',
                response === 'ACCEPTED' ? 'BOOKING_CONFIRMED' : 'BOOKING_CANCELLED',
                response === 'ACCEPTED' ? 'Booking Request Accepted! ✅' : 'Booking Request Declined ❌',
                response === 'ACCEPTED'
                    ? `Great news! ${providerName} has accepted your booking request for "${serviceTitle}". Please complete your payment to confirm the booking.`
                    : `${providerName} has declined your booking request for "${serviceTitle}". ${message ? `Reason: ${message}` : 'You can try booking with another provider.'}`,
                {
                    bookingId,
                    serviceTitle,
                    providerName,
                    response,
                    providerMessage: message,
                    nextAction: response === 'ACCEPTED' ? 'COMPLETE_PAYMENT' : 'FIND_NEW_PROVIDER',
                    timestamp: new Date().toISOString()
                },
                false,
                false
            );

            return {
                success: !!notification,
                notificationId: notification?.id || null
            };

        } catch (error) {
            console.error('❌ Failed to create provider response notification:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }

    // FIXED: Enhanced status update notifications
    static async sendEnhancedStatusUpdateNotification(
        bookingId: string,
        userId: string,
        userType: 'CLIENT' | 'PROVIDER',
        oldStatus: string,
        newStatus: string,
        serviceTitle: string,
        updateMessage?: string
    ) {
        try {
            // Determine notification type and message based on status change
            let notificationType = 'BOOKING_CONFIRMED';
            let title = 'Booking Status Update';
            let message = `Your booking status has been updated to: ${newStatus}`;

            if (newStatus === 'CONFIRMED') {
                notificationType = 'BOOKING_CONFIRMED';
                title = 'Booking Confirmed! ✅';
                message = userType === 'CLIENT'
                    ? `Your booking for "${serviceTitle}" has been confirmed! The provider will contact you soon.`
                    : `You have confirmed the booking for "${serviceTitle}". Please contact the client to finalize details.`;
            } else if (newStatus === 'IN_PROGRESS') {
                title = 'Service Started! 🚀';
                message = userType === 'CLIENT'
                    ? `Your service "${serviceTitle}" has started. The provider is now working on your request.`
                    : `You have started working on "${serviceTitle}". Remember to mark it complete when finished.`;
            } else if (newStatus === 'COMPLETED') {
                title = 'Service Completed! ✅';
                notificationType = 'BOOKING_CONFIRMED';
                message = userType === 'CLIENT'
                    ? `Your service "${serviceTitle}" has been completed! Please leave a review and rating.`
                    : `You have completed the service "${serviceTitle}". Payment will be released to your account soon.`;
            } else if (newStatus === 'CANCELLED') {
                notificationType = 'BOOKING_CANCELLED';
                title = 'Booking Cancelled ❌';
                message = userType === 'CLIENT'
                    ? `Your booking for "${serviceTitle}" has been cancelled. Any payments will be refunded.`
                    : `The booking for "${serviceTitle}" has been cancelled. You are now available for this time slot.`;
            }

            if (updateMessage) {
                message += ` ${updateMessage}`;
            }

            const notification = await this.createNotification(
                userId,
                userType,
                notificationType,
                title,
                message,
                {
                    bookingId,
                    serviceTitle,
                    oldStatus,
                    newStatus,
                    updateMessage: updateMessage || '',
                    timestamp: new Date().toISOString()
                },
                ['CONFIRMED', 'COMPLETED', 'CANCELLED'].includes(newStatus),
                false
            );

            return {
                success: !!notification,
                notificationId: notification?.id || null
            };

        } catch (error) {
            console.error('❌ Failed to create enhanced status update notification:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }

    // FIXED: Payment completion notifications  
    static async sendPaymentCompletionNotifications(
        bookingId: string,
        clientUserId: string,
        providerUserId: string,
        serviceTitle: string,
        scheduledDate: string,
        scheduledTime: string,
        amount: number,
        currency: string
    ) {
        try {
            console.log('💳 Creating payment completion notifications for booking:', bookingId);

            // Notification for client - payment processed
            const clientNotification = await this.createNotification(
                clientUserId,
                'CLIENT',
                'PAYMENT_PROCESSED',
                'Payment Processed Successfully! 💳',
                `Your payment of ${currency} ${amount} for "${serviceTitle}" has been processed successfully. The service is confirmed for ${new Date(scheduledDate).toLocaleDateString()} at ${scheduledTime}.`,
                {
                    bookingId,
                    serviceTitle,
                    scheduledDate,
                    scheduledTime,
                    amount,
                    currency,
                    paymentStatus: 'COMPLETED',
                    nextAction: 'WAIT_FOR_SERVICE'
                },
                true,
                false
            );

            // Notification for provider - payment received
            const providerNotification = await this.createNotification(
                providerUserId,
                'PROVIDER',
                'PAYMENT_RECEIVED',
                'Payment Received! 💰',
                `Payment of ${currency} ${amount} has been received for "${serviceTitle}" scheduled for ${new Date(scheduledDate).toLocaleDateString()} at ${scheduledTime}. You can now contact the client to finalize service details.`,
                {
                    bookingId,
                    serviceTitle,
                    scheduledDate,
                    scheduledTime,
                    amount,
                    currency,
                    paymentStatus: 'RECEIVED',
                    nextAction: 'CONTACT_CLIENT'
                },
                true,
                false
            );

            const success = clientNotification && providerNotification;

            return {
                success,
                clientNotificationId: clientNotification?.id || null,
                providerNotificationId: providerNotification?.id || null
            };

        } catch (error) {
            console.error('❌ Failed to create payment completion notifications:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }

    // Helper method to check if booking is urgent (within 24 hours)
    private static isUrgentBooking(scheduledDate: string): boolean {
        const bookingDate = new Date(scheduledDate);
        const now = new Date();
        const diffHours = (bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60);
        return diffHours <= 24 && diffHours > 0;
    }

    // FIXED: Welcome notification
    static async sendWelcomeNotification(userId: string, userType: 'CLIENT' | 'PROVIDER', userName: string) {
        try {
            const welcomeMessage = userType === 'CLIENT'
                ? `Welcome to EasyBuk, ${userName}! 🎉 You can now browse and book amazing services from verified providers. Start exploring!`
                : `Welcome to EasyBuk, ${userName}! 🎉 Complete your provider profile to start receiving booking requests and grow your business.`;

            const notification = await this.createNotification(
                userId,
                userType,
                'SYSTEM_ANNOUNCEMENT',
                'Welcome to EasyBuk! 🎉',
                welcomeMessage,
                {
                    isWelcome: true,
                    userType,
                    joinedAt: new Date().toISOString()
                },
                false,
                false
            );

            return {
                success: !!notification,
                notificationId: notification?.id || null
            };

        } catch (error) {
            console.error('❌ Failed to create welcome notification:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }

    // FIXED: Get user notifications using correct entity ID resolution
    static async getUserNotifications(userId: string, limit: number = 20) {
        try {
            // Try to find notifications for this user across all entity types
            const [clientEntityId, providerEntityId, adminEntityId] = await Promise.all([
                this.getEntityIdForNotification(userId, 'CLIENT'),
                this.getEntityIdForNotification(userId, 'PROVIDER'),
                this.getEntityIdForNotification(userId, 'ADMIN')
            ]);

            const entityIds = [clientEntityId, providerEntityId, adminEntityId].filter(Boolean) as string[];

            if (entityIds.length === 0) {
                console.log('No entity IDs found for user:', userId);
                return {
                    success: true,
                    notifications: []
                };
            }

            const notifications = await prisma.notification.findMany({
                where: {
                    userId: { in: entityIds }
                },
                orderBy: { createdAt: 'desc' },
                take: limit
            });

            return {
                success: true,
                notifications: notifications.map(notification => ({
                    ...notification,
                    data: notification.data ? JSON.parse(notification.data as string) : null
                }))
            };

        } catch (error) {
            console.error('❌ Failed to fetch notifications:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
                notifications: []
            };
        }
    }

    static async markNotificationAsRead(notificationId: string) {
        try {
            await prisma.notification.update({
                where: { id: notificationId },
                data: {
                    isRead: true,
                    readAt: new Date()
                }
            });

            return { success: true };

        } catch (error) {
            console.error('❌ Failed to mark notification as read:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }

    // Additional notification methods can be added here following the same pattern...
} 