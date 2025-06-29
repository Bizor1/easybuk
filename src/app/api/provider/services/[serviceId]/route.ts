import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

export async function DELETE(
    request: NextRequest,
    { params }: { params: { serviceId: string } }
) {
    console.log('🗑️ Provider Service Delete: Starting service deletion');
    try {
        const tokenPayload = getCurrentUser(request);

        if (!tokenPayload?.userId) {
            console.log('❌ Provider Service Delete: Unauthorized');
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { serviceId } = params;

        console.log(`🗑️ Provider Service Delete: Deleting service ${serviceId}`);

        // Get user's provider profile
        const user = await prisma.user.findUnique({
            where: { id: tokenPayload.userId },
            include: {
                UserProviderProfile: {
                    include: {
                        ServiceProvider: true
                    }
                }
            }
        });

        if (!user || !user.UserProviderProfile) {
            return NextResponse.json(
                { error: 'Provider profile not found' },
                { status: 404 }
            );
        }

        const providerId = user.UserProviderProfile.ServiceProvider.id;

        // Check if service exists and belongs to this provider
        const service = await prisma.service.findFirst({
            where: {
                id: serviceId,
                providerId: providerId
            }
        });

        if (!service) {
            return NextResponse.json(
                { error: 'Service not found or you do not have permission to delete it' },
                { status: 404 }
            );
        }

        // Check if service has active bookings
        const activeBookings = await prisma.booking.count({
            where: {
                serviceId: serviceId,
                status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] }
            }
        });

        if (activeBookings > 0) {
            return NextResponse.json(
                { error: `Cannot delete service with ${activeBookings} active booking(s). Please complete or cancel them first.` },
                { status: 400 }
            );
        }

        // Delete the service
        await prisma.service.delete({
            where: {
                id: serviceId
            }
        });

        console.log('✅ Provider Service Delete: Service deleted successfully');
        return NextResponse.json({
            success: true,
            message: 'Service deleted successfully'
        });

    } catch (error) {
        console.error('Provider service deletion error:', error);
        return NextResponse.json(
            { error: 'Failed to delete service' },
            { status: 500 }
        );
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: { serviceId: string } }
) {
    console.log('📋 Provider Service: Getting single service');
    try {
        const tokenPayload = getCurrentUser(request);

        if (!tokenPayload?.userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { serviceId } = params;

        // Get user's provider profile
        const user = await prisma.user.findUnique({
            where: { id: tokenPayload.userId },
            include: {
                UserProviderProfile: {
                    include: {
                        ServiceProvider: true
                    }
                }
            }
        });

        if (!user || !user.UserProviderProfile) {
            return NextResponse.json(
                { error: 'Provider profile not found' },
                { status: 404 }
            );
        }

        const providerId = user.UserProviderProfile.ServiceProvider.id;

        // Get service from database
        const service = await prisma.service.findFirst({
            where: {
                id: serviceId,
                providerId: providerId
            },
            include: {
                Booking: {
                    select: {
                        id: true,
                        status: true,
                        totalAmount: true
                    }
                }
            }
        });

        if (!service) {
            return NextResponse.json(
                { error: 'Service not found' },
                { status: 404 }
            );
        }

        // Calculate service statistics
        const bookingsCount = service.Booking.length;
        const earnings = service.Booking
            .filter(booking => booking.status === 'COMPLETED')
            .reduce((total, booking) => total + booking.totalAmount, 0);

        // Transform the data to match frontend expectations
        const transformedService = {
            id: service.id,
            name: service.name, // Add the name field
            title: service.name,
            description: service.description,
            category: service.category,
            basePrice: service.basePrice,
            currency: service.currency,
            pricingType: service.pricingType,
            duration: service.duration,
            location: service.location.toLowerCase(),
            status: service.isActive ? 'ACTIVE' : 'INACTIVE',
            images: service.images,
            supportedBookingTypes: service.supportedBookingTypes, // Include supported booking types
            bookingsCount,
            rating: 0, // TODO: Calculate from reviews when implemented
            reviewsCount: 0, // TODO: Get from reviews when implemented
            earnings,
            createdAt: service.createdAt.toISOString(),
            updatedAt: service.updatedAt.toISOString()
        };

        return NextResponse.json(transformedService);

    } catch (error) {
        console.error('Get service error:', error);
        return NextResponse.json(
            { error: 'Failed to get service' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { serviceId: string } }
) {
    console.log('✏️ Provider Service Update: Starting service update');
    try {
        const tokenPayload = getCurrentUser(request);

        if (!tokenPayload?.userId) {
            console.log('❌ Provider Service Update: Unauthorized');
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { serviceId } = params;
        const updateData = await request.json();

        console.log(`✏️ Provider Service Update: Updating service ${serviceId}`);

        // Get user's provider profile
        const user = await prisma.user.findUnique({
            where: { id: tokenPayload.userId },
            include: {
                UserProviderProfile: {
                    include: {
                        ServiceProvider: true
                    }
                }
            }
        });

        if (!user || !user.UserProviderProfile) {
            return NextResponse.json(
                { error: 'Provider profile not found' },
                { status: 404 }
            );
        }

        const providerId = user.UserProviderProfile.ServiceProvider.id;

        // Update service in database
        const updatedService = await prisma.service.update({
            where: {
                id: serviceId,
                providerId: providerId
            },
            data: {
                name: updateData.title || updateData.name,
                description: updateData.description,
                category: updateData.category,
                basePrice: updateData.basePrice,
                duration: updateData.duration,
                location: updateData.location?.toUpperCase() || 'CLIENT_LOCATION',
                isActive: updateData.status === 'ACTIVE',
                updatedAt: new Date()
            }
        });

        console.log('✅ Provider Service Update: Service updated successfully');
        return NextResponse.json({
            success: true,
            service: {
                id: updatedService.id,
                title: updatedService.name,
                description: updatedService.description,
                category: updatedService.category,
                basePrice: updatedService.basePrice,
                duration: updatedService.duration,
                location: updatedService.location.toLowerCase(),
                status: updatedService.isActive ? 'ACTIVE' : 'INACTIVE',
                updatedAt: updatedService.updatedAt.toISOString()
            }
        });

    } catch (error) {
        console.error('Provider service update error:', error);

        // Handle specific Prisma errors
        if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
            return NextResponse.json(
                { error: 'Service not found or you do not have permission to update it' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to update service' },
            { status: 500 }
        );
    }
} 