import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

export async function DELETE(request: NextRequest) {
    console.log('🧹 Service Cleanup: Starting cleanup of auto-created services');
    try {
        const tokenPayload = getCurrentUser(request);
        console.log('🔐 Service Cleanup: Token found:', !!tokenPayload?.userId);
        
        if (!tokenPayload?.userId) {
            console.log('❌ Service Cleanup: Unauthorized');
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        console.log('👤 Service Cleanup: Looking up provider profile');
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
        console.log('📋 Service Cleanup: Provider ID:', providerId);

        // Find and delete auto-created services (they have generic descriptions and specific price patterns)
        const autoCreatedServices = await prisma.service.findMany({
            where: {
                providerId: providerId,
                AND: [
                    {
                        OR: [
                            { description: { contains: 'Professional' } },
                            { description: { contains: 'services' } },
                            { basePrice: 50.0 }, // Default price used in auto-creation
                        ]
                    },
                    {
                        OR: [
                            { name: { contains: 'Services' } },
                            { name: { contains: 'Home Services' } },
                            { name: { contains: 'Healthcare Services' } },
                            { name: { contains: 'Education & Training' } },
                            { name: { contains: 'Technical Services' } },
                            { name: { contains: 'Creative Services' } },
                            { name: { contains: 'Professional Services' } }
                        ]
                    }
                ]
            }
        });

        console.log(`🗑️ Found ${autoCreatedServices.length} auto-created services to delete`);

        if (autoCreatedServices.length > 0) {
            // Delete the auto-created services
            const deleteResult = await prisma.service.deleteMany({
                where: {
                    id: {
                        in: autoCreatedServices.map(service => service.id)
                    }
                }
            });

            console.log(`✅ Deleted ${deleteResult.count} auto-created services`);

            return NextResponse.json({
                success: true,
                message: `Cleaned up ${deleteResult.count} auto-created services`,
                deletedCount: deleteResult.count,
                deletedServices: autoCreatedServices.map(s => ({ id: s.id, name: s.name }))
            });
        } else {
            return NextResponse.json({
                success: true,
                message: 'No auto-created services found to clean up',
                deletedCount: 0
            });
        }

    } catch (error) {
        console.error('Service cleanup error:', error);
        return NextResponse.json(
            { error: 'Failed to cleanup services' },
            { status: 500 }
        );
    }
} 