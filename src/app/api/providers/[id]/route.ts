import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;

        if (!id) {
            return NextResponse.json(
                { error: 'Provider ID is required' },
                { status: 400 }
            );
        }

        // Fetch provider with all related data
        const provider = await prisma.serviceProvider.findUnique({
            where: { id },
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
                        duration: true
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
        });

        if (!provider) {
            return NextResponse.json(
                { error: 'Provider not found' },
                { status: 404 }
            );
        }

        const user = provider.UserProviderProfile?.User;

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
            name: review.Client.UserClientProfile?.User.name || 'Anonymous Client',
            rating: review.overallRating,
            date: review.createdAt.toLocaleDateString(),
            comment: review.comment,
            clientImage: review.Client.UserClientProfile?.User.image
        }));

        // Calculate average rating
        const avgRating = provider.Review.length > 0
            ? provider.Review.reduce((sum, review) => sum + review.overallRating, 0) / provider.Review.length
            : 0;

        // Format services
        const services = provider.Service.map(service => ({
            id: service.id,
            name: service.name,
            category: service.category,
            description: service.description,
            price: service.basePrice,
            duration: service.duration
        }));

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

        // Prepare profile data
        const profileData = {
            id: provider.id,
            name: user?.name || provider.name || '',
            specialty: provider.category || 'Professional Service',
            image: user?.image || provider.image || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
            rating: Math.round(avgRating * 10) / 10,
            reviews: provider.Review.length,
            experience: provider.experience || '5+ years',
            location: provider.city || 'Ghana',
            consultation: `GH₵${provider.hourlyRate || 100}`,
            availability: provider.isActive ? 'Available now' : 'Currently unavailable',
            verified: provider.isVerified || false,
            languages: ['English'], // Could be expanded in schema
            services: services.map(s => s.name),
            servicesDetailed: services,
            about: provider.bio || `Professional ${provider.category} with years of experience providing quality services.`,
            education: provider.certificateUrls || [],
            certifications: provider.licenseUrl ? [provider.licenseUrl] : [],
            portfolio: portfolioItems,
            reviewsData: reviews,
            workingHours: availability,
            contact: {
                businessName: provider.businessName || provider.name,
                address: `${provider.address || ''}, ${provider.city || 'Ghana'}`.trim().replace(/^,\s*/, ''),
                phone: user?.phone || provider.phone || '+233 XX XXX XXXX',
                hours: 'Mon-Fri: 9AM-5PM'
            },
            // Analytics data
            completedBookings: provider.completedBookings || 0,
            responseTime: '< 1 hour', // Could be calculated from message data
            isActive: provider.isActive
        };

        return NextResponse.json(profileData);

    } catch (error) {
        console.error('Error fetching provider:', error);
        return NextResponse.json(
            { error: 'Failed to fetch provider data' },
            { status: 500 }
        );
    }
} 