import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Mark this route as dynamic to handle request.url during static generation
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const providerId = searchParams.get('providerId');
        const date = searchParams.get('date');
        const serviceDuration = parseInt(searchParams.get('duration') || '60');

        if (!providerId || !date) {
            return NextResponse.json({ error: 'Provider ID and date are required' }, { status: 400 });
        }

        // Get provider profile with working hours
        const provider = await prisma.serviceProvider.findUnique({
            where: { id: providerId },
            include: {
                UserProviderProfile: {
                    include: {
                        User: true
                    }
                }
            }
        });

        if (!provider) {
            return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
        }

        // Parse working hours
        let workingHours = null;
        if (provider.workingHours) {
            try {
                workingHours = typeof provider.workingHours === 'string'
                    ? JSON.parse(provider.workingHours)
                    : provider.workingHours;
            } catch (error) {
                console.error('Error parsing working hours:', error);
            }
        }

        // Get day of week for the requested date
        const requestedDate = new Date(date);
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const dayName = dayNames[requestedDate.getDay()];

        // Check if provider is available on this day
        const daySchedule = workingHours?.[dayName];
        if (!daySchedule || !daySchedule.available) {
            return NextResponse.json({
                success: true,
                available: false,
                message: 'Provider is not available on this day',
                timeSlots: []
            });
        }

        // Get existing bookings for this date
        const existingBookings = await prisma.booking.findMany({
            where: {
                providerId,
                scheduledDate: requestedDate,
                status: {
                    in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS']
                }
            },
            select: {
                scheduledTime: true,
                duration: true
            }
        });

        // Generate available time slots
        const availableSlots = generateTimeSlots(
            daySchedule.start,
            daySchedule.end,
            serviceDuration,
            existingBookings
        );

        return NextResponse.json({
            success: true,
            available: availableSlots.length > 0,
            timeSlots: availableSlots,
            workingHours: {
                start: daySchedule.start,
                end: daySchedule.end
            }
        });

    } catch (error) {
        console.error('Error checking availability:', error);
        return NextResponse.json(
            { error: 'Failed to check availability' },
            { status: 500 }
        );
    }
}

function generateTimeSlots(
    startTime: string,
    endTime: string,
    duration: number,
    existingBookings: { scheduledTime: string; duration: number | null }[]
): string[] {
    const slots: string[] = [];

    // Parse start and end times
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    // Create array of blocked time ranges from existing bookings
    const blockedRanges = existingBookings.map(booking => {
        const [bookingHour, bookingMinute] = booking.scheduledTime.split(':').map(Number);
        const bookingStart = bookingHour * 60 + bookingMinute;
        const bookingDuration = booking.duration || 60;

        return {
            start: bookingStart,
            end: bookingStart + bookingDuration
        };
    });

    // Generate slots every 30 minutes (can be adjusted)
    const slotInterval = 30;

    for (let currentMinutes = startMinutes; currentMinutes + duration <= endMinutes; currentMinutes += slotInterval) {
        const slotEnd = currentMinutes + duration;

        // Check if this slot conflicts with any existing booking
        const hasConflict = blockedRanges.some(blocked =>
            (currentMinutes < blocked.end && slotEnd > blocked.start)
        );

        if (!hasConflict) {
            const hour = Math.floor(currentMinutes / 60);
            const minute = currentMinutes % 60;
            const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            slots.push(timeString);
        }
    }

    return slots;
} 