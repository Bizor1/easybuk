import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';

// Mark this route as dynamic to handle request.cookies during static generation
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const token = await getToken({ req: request });

        if (!token?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
        const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString());

        // Get provider profile
        const provider = await prisma.serviceProvider.findFirst({
            where: {
                UserProviderProfile: {
                    userId: token.userId
                }
            },
            include: {
                UserProviderProfile: {
                    include: {
                        User: true
                    }
                }
            }
        });

        if (!provider) {
            return NextResponse.json({ error: 'Provider profile not found' }, { status: 404 });
        }

        // Calculate date range for the month
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        console.log(`Fetching calendar events for provider ${provider.id} from ${startDate.toISOString()} to ${endDate.toISOString()}`);

        // Fetch bookings for the month
        const bookings = await prisma.booking.findMany({
            where: {
                providerId: provider.id,
                scheduledDate: {
                    gte: startDate,
                    lte: endDate
                }
            },
            include: {
                Client: {
                    include: {
                        UserClientProfile: {
                            include: {
                                User: {
                                    select: {
                                        name: true,
                                        email: true
                                    }
                                }
                            }
                        }
                    }
                },
                Service: {
                    select: {
                        name: true,
                        category: true
                    }
                }
            },
            orderBy: {
                scheduledDate: 'asc'
            }
        });

        console.log(`Found ${bookings.length} bookings for the month`);

        // Format bookings as calendar events grouped by date
        const events: { [key: string]: any[] } = {};

        bookings.forEach(booking => {
            const dateKey = booking.scheduledDate.toISOString().split('T')[0];

            if (!events[dateKey]) {
                events[dateKey] = [];
            }

            // Determine event type and status
            let eventType: 'booking' | 'blocked' | 'break' = 'booking';
            let eventStatus: 'confirmed' | 'pending' | 'completed' = 'pending';

            switch (booking.status) {
                case 'CONFIRMED':
                case 'IN_PROGRESS':
                    eventStatus = 'confirmed';
                    break;
                case 'COMPLETED':
                    eventStatus = 'completed';
                    break;
                default:
                    eventStatus = 'pending';
            }

            const clientName = booking.Client?.UserClientProfile?.User?.name || 'Unknown Client';
            const serviceName = booking.Service?.name || booking.title;

            events[dateKey].push({
                id: booking.id,
                title: serviceName,
                client: clientName,
                time: booking.scheduledTime,
                duration: booking.duration || 60,
                type: eventType,
                status: eventStatus,
                amount: booking.totalAmount,
                location: booking.location,
                description: booking.description
            });
        });

        // Add any blocked dates or breaks if they exist in the future
        // For now, we'll just return the booking events

        return NextResponse.json({
            success: true,
            events,
            month: month,
            year: year,
            totalEvents: bookings.length
        });

    } catch (error) {
        console.error('Error fetching calendar events:', error);
        return NextResponse.json(
            { error: 'Failed to fetch calendar events' },
            { status: 500 }
        );
    }
} 