import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const token = await getToken({ req: request });

        if (!token?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get provider profile
        const provider = await prisma.serviceProvider.findFirst({
            where: {
                UserProviderProfile: {
                    userId: token.userId
                }
            }
        });

        if (!provider) {
            return NextResponse.json({ error: 'Provider profile not found' }, { status: 404 });
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
                workingHours = null;
            }
        }

        return NextResponse.json({
            success: true,
            availability: {
                workingHours: workingHours || {
                    monday: { available: true, start: '08:00', end: '18:00' },
                    tuesday: { available: true, start: '08:00', end: '18:00' },
                    wednesday: { available: true, start: '08:00', end: '18:00' },
                    thursday: { available: true, start: '08:00', end: '18:00' },
                    friday: { available: true, start: '08:00', end: '18:00' },
                    saturday: { available: true, start: '09:00', end: '15:00' },
                    sunday: { available: false, start: '09:00', end: '17:00' }
                },
                blockedDates: [], // Future enhancement
                breaks: [] // Future enhancement
            }
        });

    } catch (error) {
        console.error('Error fetching availability:', error);
        return NextResponse.json(
            { error: 'Failed to fetch availability' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const token = await getToken({ req: request });

        if (!token?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { action, data } = body;

        // Get provider profile
        const provider = await prisma.serviceProvider.findFirst({
            where: {
                UserProviderProfile: {
                    userId: token.userId
                }
            }
        });

        if (!provider) {
            return NextResponse.json({ error: 'Provider profile not found' }, { status: 404 });
        }

        switch (action) {
            case 'block_date':
                // Future: Add blocked date functionality
                return NextResponse.json({
                    success: true,
                    message: 'Date blocking feature coming soon'
                });

            case 'add_break':
                // Future: Add break functionality
                return NextResponse.json({
                    success: true,
                    message: 'Break management feature coming soon'
                });

            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

    } catch (error) {
        console.error('Error updating availability:', error);
        return NextResponse.json(
            { error: 'Failed to update availability' },
            { status: 500 }
        );
    }
} 