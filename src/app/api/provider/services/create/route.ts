import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    console.log('🔧 Create Service: Starting service creation');
    try {
        const tokenPayload = getCurrentUser(request);
        console.log('🔐 Create Service: Token found:', !!tokenPayload?.userId);

        if (!tokenPayload?.userId) {
            console.log('❌ Create Service: Unauthorized');
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const serviceData = await request.json();
        console.log('📋 Create Service: Received data:', { ...serviceData, description: '[TRUNCATED]' });

        // Validate required fields
        const requiredFields = ['name', 'description', 'category', 'basePrice'];
        const missingFields = requiredFields.filter(field => !serviceData[field]);

        if (missingFields.length > 0) {
            return NextResponse.json(
                { error: `Missing required fields: ${missingFields.join(', ')}` },
                { status: 400 }
            );
        }

        // Get user's provider profile
        console.log('👤 Create Service: Looking up provider profile');
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
        console.log('📋 Create Service: Provider ID:', providerId);

        // Generate unique service ID
        const serviceId = `SRV_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Create the service
        console.log('💾 Create Service: Creating service in database');
        const newService = await prisma.service.create({
            data: {
                id: serviceId,
                name: serviceData.name,
                description: serviceData.description,
                basePrice: serviceData.basePrice,
                currency: 'GHS',
                pricingType: serviceData.pricingType || 'HOURLY',
                duration: serviceData.duration || null,
                category: serviceData.category,
                tags: serviceData.tags || [],
                location: serviceData.location || 'CLIENT_LOCATION',
                supportedBookingTypes: serviceData.supportedBookingTypes || ['IN_PERSON'],
                isActive: serviceData.isActive !== false, // Default to true unless explicitly false
                requiresEquipment: serviceData.requiresEquipment || false,
                equipmentList: serviceData.equipmentList || [],
                images: serviceData.images || [],
                minimumNotice: serviceData.minimumNotice || 24,
                serviceRadius: serviceData.serviceRadius || 10,
                availableSlots: serviceData.availableSlots || 8,
                cancellationPolicy: serviceData.cancellationPolicy || 'Free cancellation up to 24 hours before the service',
                providerId: providerId,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        });

        console.log('✅ Create Service: Service created successfully:', newService.id);

        // Update provider's last active time
        await prisma.serviceProvider.update({
            where: { id: providerId },
            data: { lastActive: new Date() }
        });

        // Send notification email to provider (optional)
        try {
            await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/notifications/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: user.email,
                    type: 'service_created',
                    data: {
                        providerName: user.name,
                        serviceName: serviceData.name,
                        serviceId: newService.id,
                        status: newService.isActive ? 'published' : 'draft'
                    }
                })
            });
        } catch (emailError) {
            console.error('Failed to send email notification:', emailError);
        }

        return NextResponse.json({
            success: true,
            message: `Service ${newService.isActive ? 'published' : 'saved as draft'} successfully`,
            service: {
                id: newService.id,
                name: newService.name,
                category: newService.category,
                basePrice: newService.basePrice,
                pricingType: newService.pricingType,
                isActive: newService.isActive,
                createdAt: newService.createdAt
            }
        });

    } catch (error) {
        console.error('Create Service error:', error);

        // Handle Prisma errors
        if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
            return NextResponse.json(
                { error: 'A service with this name already exists' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to create service. Please try again.' },
            { status: 500 }
        );
    }
} 