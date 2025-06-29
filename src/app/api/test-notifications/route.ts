import { NextRequest, NextResponse } from 'next/server';
import { EmailService, type BookingEmailData } from '@/lib/email';
import { NotificationService } from '@/lib/notifications';
import { getCurrentUser } from '@/lib/jwt';

export async function POST(request: NextRequest) {
    try {
        console.log('🧪 Testing ALL notification services...');

        // Get current user for testing
        const tokenPayload = getCurrentUser(request);
        if (!tokenPayload?.userId) {
            return NextResponse.json({ error: 'Unauthorized - please login first' }, { status: 401 });
        }

        console.log('Testing notifications for user:', tokenPayload.userId);

        // Mock booking data for testing
        const mockBookingData: BookingEmailData = {
            bookingId: 'test_booking_123',
            clientName: 'John Doe',
            clientEmail: 'john.doe@example.com',
            providerName: 'Jane Smith',
            providerEmail: 'jane.smith@example.com',
            serviceTitle: 'Home Cleaning Service',
            scheduledDate: '2025-01-15',
            scheduledTime: '10:00 AM',
            location: 'Accra, Ghana',
            totalAmount: 100,
            currency: 'GHS'
        };

        const mockBooking = {
            id: 'test_booking_123',
            clientId: 'client_123',
            providerId: 'provider_user_123',
            serviceTitle: 'Home Cleaning Service',
            title: 'Home Cleaning Service',
            description: 'Booking for John Doe',
            scheduledDate: '2025-01-15',
            scheduledTime: '10:00 AM',
            location: 'Accra, Ghana',
            totalAmount: 100,
            currency: 'GHS'
        };

        console.log('📧 Testing basic email service...');
        const emailResults = await EmailService.sendBookingEmails(mockBookingData);

        console.log('🔔 Testing basic notification service...');
        const notificationResults = await NotificationService.sendBookingRequestNotifications(
            mockBooking,
            tokenPayload.userId
        );

        console.log('💳 Testing payment completion notifications...');
        const paymentNotificationResults = await NotificationService.sendPaymentCompletionNotifications(
            'test_booking_123',
            tokenPayload.userId,
            tokenPayload.userId,
            'Home Cleaning Service',
            '2025-01-15',
            '10:00 AM',
            100,
            'GHS'
        );

        console.log('✅ Testing provider response notifications...');
        const providerResponseResults = await NotificationService.sendProviderResponseNotification(
            'test_booking_123',
            tokenPayload.userId,
            'Jane Smith',
            'Home Cleaning Service',
            'ACCEPTED',
            'Looking forward to working with you!'
        );

        console.log('👋 Testing welcome notifications...');
        const welcomeResults = await NotificationService.sendWelcomeNotification(
            tokenPayload.userId,
            'CLIENT',
            'Test User'
        );

        console.log('📝 Testing enhanced status update notifications...');
        const statusUpdateResults = await NotificationService.sendEnhancedStatusUpdateNotification(
            'test_booking_123',
            tokenPayload.userId,
            'CLIENT',
            'PENDING',
            'CONFIRMED',
            'Home Cleaning Service',
            'Your booking has been confirmed and provider is ready!'
        );

        console.log('✅ All notification tests completed!');

        return NextResponse.json({
            success: true,
            message: 'All notification services tested successfully',
            results: {
                basicEmail: emailResults,
                bookingRequestNotifications: notificationResults,
                paymentNotifications: paymentNotificationResults,
                providerResponseNotifications: providerResponseResults,
                welcomeNotifications: welcomeResults,
                statusUpdateNotifications: statusUpdateResults
            },
            summary: {
                totalTestsRun: 6,
                allPassed: [
                    emailResults.success,
                    notificationResults.success,
                    paymentNotificationResults.success,
                    providerResponseResults.success,
                    welcomeResults.success,
                    statusUpdateResults.success
                ].every(Boolean)
            }
        });

    } catch (error) {
        console.error('❌ Notification test failed:', error);
        return NextResponse.json(
            { success: false, error: 'Test failed', details: error },
            { status: 500 }
        );
    }
} 