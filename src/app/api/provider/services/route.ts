import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    console.log('🔧 Provider Services: Starting services submission');
    try {
        const tokenPayload = getCurrentUser(request);
        console.log('🔐 Provider Services: Token found:', !!tokenPayload?.userId);
        
        if (!tokenPayload?.userId) {
            console.log('❌ Provider Services: Unauthorized');
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { categories } = await request.json();

        if (!categories || !Array.isArray(categories) || categories.length === 0) {
            return NextResponse.json(
                { error: 'At least one service category is required' },
                { status: 400 }
            );
        }

        console.log('✅ Provider Services: Categories validated:', categories);

        console.log('👤 Provider Services: Looking up provider profile');
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

        // Update provider category (using the first selected category as primary)
        await prisma.serviceProvider.update({
            where: { id: providerId },
            data: {
                category: categories[0], // No cast needed - we have correct enum values
                specializations: categories
            }
        });

        console.log('✅ Provider Services: Categories saved without creating default services');

        // Send notification email to provider
        try {
            await fetch(`${process.env.NEXTAUTH_URL}/api/notifications/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: user.email,
                    type: 'services_setup_success',
                    data: {
                        providerName: user.name,
                        categoriesSelected: categories.length,
                        categories: categories.map(getServiceNameFromCategory)
                    }
                })
            });
        } catch (emailError) {
            console.error('Failed to send email notification:', emailError);
        }

        return NextResponse.json({
            success: true,
            message: 'Service categories saved successfully',
            categoriesSelected: categories.length
        });

    } catch (error) {
        console.error('Services submission error:', error);
        return NextResponse.json(
            { error: 'Failed to save service categories' },
            { status: 500 }
        );
    }
}

function getServiceNameFromCategory(category: string): string {
    const categoryNames: { [key: string]: string } = {
        'HOME_SERVICES': 'Home Services',
        'HEALTHCARE': 'Healthcare Services',
        'EDUCATION': 'Education & Training',
        'TECHNICAL_SERVICES': 'Technical Services',
        'CREATIVE_SERVICES': 'Creative Services',
        'PROFESSIONAL_SERVICES': 'Professional Services',
        'AUTOMOTIVE': 'Automotive Services',
        'BEAUTY_WELLNESS': 'Beauty & Wellness',
        'EVENTS_ENTERTAINMENT': 'Events & Entertainment',
        'AGRICULTURE': 'Agriculture Services',
        'SECURITY': 'Security Services',
        'DELIVERY_LOGISTICS': 'Delivery & Logistics'
    };
    
    return categoryNames[category] || category.replace('_', ' ');
}

export async function GET(request: NextRequest) {
    console.log('📋 Provider Services: Getting services');
    try {
        const tokenPayload = getCurrentUser(request);
        console.log('🔐 Provider Services: Token found:', !!tokenPayload?.userId);
        
        if (!tokenPayload?.userId) {
            console.log('❌ Provider Services: Unauthorized');
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        console.log('👤 Provider Services: Looking up provider profile');
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
            console.log('❌ Provider Services: Provider profile not found');
            return NextResponse.json(
                { error: 'Provider profile not found' },
                { status: 404 }
            );
        }

        const providerId = user.UserProviderProfile.ServiceProvider.id;
        console.log('📋 Provider Services: Fetching services for provider:', providerId);

        // Fetch actual services from database
        const dbServices = await prisma.service.findMany({
            where: {
                providerId: providerId
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        console.log('✅ Provider Services: Found services:', dbServices.length);

        // Transform database services to match frontend interface
        const services = dbServices.map(service => ({
            id: service.id,
            title: service.name,
            description: service.description || '',
            category: service.category,
            subcategory: service.category.replace('_', ' '),
            basePrice: service.basePrice,
            currency: service.currency,
            duration: service.duration,
            location: service.location === 'CLIENT_LOCATION' ? 'client' : 
                     service.location === 'PROVIDER_LOCATION' ? 'provider' : 'remote',
            status: service.isActive ? 'ACTIVE' : 'INACTIVE',
            images: service.images || [],
            createdAt: service.createdAt.toISOString(),
            bookingsCount: 0, // Will be calculated from actual bookings later
            rating: 0, // Will be calculated from actual reviews later
            reviewsCount: 0, // Will be calculated from actual reviews later
            earnings: 0, // Will be calculated from actual transactions later
            lastBooking: undefined,
            // Additional fields from the comprehensive form
            pricingType: service.pricingType,
            tags: service.tags,
            requiresEquipment: service.requiresEquipment,
            equipmentList: service.equipmentList,
            minimumNotice: service.minimumNotice,
            serviceRadius: service.serviceRadius,
            availableSlots: service.availableSlots,
            cancellationPolicy: service.cancellationPolicy
        }));

        return NextResponse.json(services);

    } catch (error) {
        console.error('Get services error:', error);
        return NextResponse.json(
            { error: 'Failed to get services' },
            { status: 500 }
        );
    }
} 