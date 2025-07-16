import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: { serviceId: string } }) {
    try {
        const { serviceId } = params;

        if (!serviceId) {
            return NextResponse.json(
                { error: 'Service ID is required' },
                { status: 400 }
            );
        }

        console.log('🔍 Professional by Service: Looking up service:', serviceId);

        // First, find the service and get its provider
        const service = await prisma.service.findUnique({
            where: { id: serviceId },
            include: {
                ServiceProvider: {
                    include: {
                        UserProviderProfile: {
                            include: {
                                User: {
                                    select: {
                                        id: true,
                                        name: true,
                                        email: true,
                                        image: true,
                                        phone: true
                                    }
                                }
                            }
                        },
                        Service: {
                            where: { isActive: true },
                            select: {
                                id: true,
                                name: true,
                                category: true,
                                description: true,
                                basePrice: true,
                                duration: true,
                                pricingType: true
                            }
                        },
                        Review: {
                            include: {
                                Client: {
                                    include: {
                                        UserClientProfile: {
                                            include: {
                                                User: {
                                                    select: {
                                                        id: true,
                                                        name: true,
                                                        image: true
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            },
                            orderBy: { createdAt: 'desc' },
                            take: 10
                        }
                    }
                }
            }
        });

        if (!service) {
            console.log('❌ Professional by Service: Service not found:', serviceId);
            return NextResponse.json(
                { error: 'Service not found' },
                { status: 404 }
            );
        }

        if (!service.ServiceProvider) {
            console.log('❌ Professional by Service: No provider found for service:', serviceId);
            return NextResponse.json(
                { error: 'Provider not found for this service' },
                { status: 404 }
            );
        }

        const provider = service.ServiceProvider;
        const user = provider.UserProviderProfile?.User;

        console.log('✅ Professional by Service: Found provider:', provider.id, 'for service:', service.name);

        // Parse working hours if available
        let workingHours = null;
        if (provider.workingHours) {
            try {
                workingHours = typeof provider.workingHours === 'string'
                    ? JSON.parse(provider.workingHours)
                    : provider.workingHours;
            } catch (error) {
                console.log('Failed to parse working hours:', error);
                workingHours = null;
            }
        }

        // Parse portfolio URLs
        let portfolioItems: any[] = [];
        if (provider.portfolioUrls && provider.portfolioUrls.length > 0) {
            portfolioItems = provider.portfolioUrls.map((url: string, index: number) => ({
                id: `${provider.id}_${index}`,
                title: `Portfolio Item ${index + 1}`,
                description: `Work sample`,
                image: url,
                category: provider.category || 'General'
            }));
        }

        // Format reviews
        const reviews = provider.Review.map(review => ({
            id: review.id,
            clientName: review.Client.UserClientProfile?.User.name || 'Anonymous Client',
            rating: review.overallRating,
            createdAt: review.createdAt,
            comment: review.comment,
            clientImage: review.Client.UserClientProfile?.User.image
        }));

        // Calculate average rating
        const avgRating = provider.Review.length > 0
            ? provider.Review.reduce((sum, review) => sum + review.overallRating, 0) / provider.Review.length
            : 0;

        // Format all services (not just the clicked one)
        const allServices = provider.Service.map(svc => ({
            id: svc.id,
            name: svc.name,
            title: svc.name,
            category: svc.category,
            description: svc.description,
            basePrice: svc.basePrice,
            duration: svc.duration,
            pricingType: svc.pricingType
        }));

        // Highlight the specific service that was clicked
        const primaryService = allServices.find(s => s.id === serviceId) || allServices[0];

        // Default availability structure
        const defaultAvailability = {
            monday: { start: '09:00', end: '17:00', available: true },
            tuesday: { start: '09:00', end: '17:00', available: true },
            wednesday: { start: '09:00', end: '17:00', available: true },
            thursday: { start: '09:00', end: '17:00', available: true },
            friday: { start: '09:00', end: '17:00', available: true },
            saturday: { start: '10:00', end: '16:00', available: false },
            sunday: { start: '10:00', end: '16:00', available: false }
        };

        const availability = workingHours && typeof workingHours === 'object' ? {
            ...defaultAvailability,
            ...workingHours
        } : defaultAvailability;

        // Prepare profile data with service context
        const profileData = {
            id: provider.id,
            name: user?.name || provider.name || provider.businessName || 'Professional',
            businessName: provider.businessName || provider.name,
            categorySpecialty: service.name, // The specific service clicked
            category: provider.category,
            profilePicture: user?.image || provider.image || 'https://res.cloudinary.com/duhfv8nqy/image/upload/v1733764031/default-avatar_cugq40.png',
            averageRating: Math.round(avgRating * 10) / 10,
            totalReviews: provider.Review.length,
            yearsOfExperience: provider.experience ? parseInt(provider.experience) : null,
            location: provider.city || 'Ghana',
            phone: user?.phone || provider.phone,
            businessAddress: provider.address ? `${provider.address}, ${provider.city || ''}`.trim() : null,
            isVerified: provider.verificationStatus === 'VERIFIED' || provider.isVerified,
            languages: ['English'], // Could be expanded from database

            // Services array - all services with primary one first
            services: [primaryService, ...allServices.filter(s => s.id !== serviceId)],

            // Bio/description
            bio: provider.bio,
            description: provider.bio,

            // Education and certifications
            education: provider.certificateUrls || [],
            certifications: provider.licenseUrl ? [provider.licenseUrl] : [],

            // Portfolio
            portfolio: portfolioItems,

            // Reviews
            reviewsData: reviews,

            // Availability
            workingHours: availability,

            // Contact info
            contact: {
                businessName: provider.businessName || provider.name,
                address: provider.address ? `${provider.address}, ${provider.city || ''}`.trim() : null,
                phone: user?.phone || provider.phone,
                hours: 'Available by appointment'
            },

            // Analytics
            completedBookings: provider.completedBookings || 0,
            responseTime: provider.responseTime || 60,
            isActive: provider.isActive,

            // Service context - the specific service that brought user here
            primaryService: {
                id: service.id,
                name: service.name,
                description: service.description,
                basePrice: service.basePrice,
                duration: service.duration,
                pricingType: service.pricingType,
                category: service.category
            }
        };

        console.log('✅ Professional by Service: Profile data prepared for:', profileData.name);
        return NextResponse.json(profileData);

    } catch (error) {
        console.error('❌ Professional by Service error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch professional data' },
            { status: 500 }
        );
    }
} 