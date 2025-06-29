import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: NextRequest, { params }: { params: { serviceId: string } }) {
    try {
        const tokenPayload = getCurrentUser(request);

        if (!tokenPayload?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { serviceId } = params;
        const { status } = await request.json();

        if (!['ACTIVE', 'INACTIVE'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

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

        // Update service status in database
        const updatedService = await prisma.service.update({
            where: {
                id: serviceId,
                providerId: providerId
            },
            data: {
                isActive: status === 'ACTIVE',
                updatedAt: new Date()
            }
        });

        console.log(`✅ Service ${serviceId} status updated to ${status}`);

        return NextResponse.json({
            success: true,
            service: {
                id: updatedService.id,
                status: updatedService.isActive ? 'ACTIVE' : 'INACTIVE',
                updatedAt: updatedService.updatedAt
            }
        });
    } catch (error) {
        console.error('Service status update error:', error);

        // Handle specific Prisma errors
        if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
            return NextResponse.json(
                { error: 'Service not found or you do not have permission to update it' },
                { status: 404 }
            );
        }

        return NextResponse.json({ error: 'Failed to update service status' }, { status: 500 });
    }
} 