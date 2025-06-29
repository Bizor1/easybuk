import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Mark this route as dynamic to handle request.url during static generation
export const dynamic = 'force-dynamic';

// GET /api/explore - Fetch services and providers for explore page
export async function GET(request: NextRequest) {
    console.log('🔍 Explore: Starting fetch');
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const category = searchParams.get('category') || 'all';
        const search = searchParams.get('search') || '';
        const sortBy = searchParams.get('sortBy') || 'trending';

        const skip = (page - 1) * limit;

        console.log('🔍 Query params:', { page, limit, category, search, sortBy, skip });

        // Build where clause for services
        const serviceWhere: any = {
            isActive: true,
        };

        // Build where clause for providers
        const providerWhere: any = {
            verificationStatus: 'VERIFIED',
        };

        // Category filter
        if (category !== 'all') {
            const categoryMap: { [key: string]: string } = {
                'healthcare': 'HEALTHCARE',
                'creative': 'CREATIVE_SERVICES',
                'professional': 'PROFESSIONAL_SERVICES',
                'home': 'HOME_SERVICES',
                'education': 'EDUCATION',
                'technical': 'TECHNICAL_SERVICES'
            };

            if (categoryMap[category]) {
                serviceWhere.category = categoryMap[category];
                providerWhere.category = categoryMap[category];
            }
        }

        // Search filter
        if (search) {
            serviceWhere.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { tags: { has: search } }
            ];

            providerWhere.OR = [
                { businessName: { contains: search, mode: 'insensitive' } },
                { bio: { contains: search, mode: 'insensitive' } },
                { specializations: { has: search } }
            ];
        }

        console.log('🔍 Service where clause:', JSON.stringify(serviceWhere, null, 2));

        // Check total services in DB
        const totalServices = await prisma.service.count();
        const activeServices = await prisma.service.count({ where: { isActive: true } });
        console.log(`📊 Total services in DB: ${totalServices}, Active services: ${activeServices}`);

        // Fetch services with proper provider info
        const services = await prisma.service.findMany({
            where: serviceWhere,
            include: {
                ServiceProvider: {
                    select: {
                        id: true,
                        name: true,
                        businessName: true,
                        city: true,
                        rating: true,
                        verificationStatus: true,
                        responseTime: true,
                        UserProviderProfile: {
                            select: {
                                User: {
                                    select: {
                                        name: true
                                    }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip: skip,
            take: Math.ceil(limit / 2)
        });

        console.log(`📦 Fetched ${services.length} services from database`);

        if (services.length > 0) {
            console.log('🔍 First service:', {
                id: services[0].id,
                name: services[0].name,
                category: services[0].category,
                isActive: services[0].isActive,
                hasProvider: !!services[0].ServiceProvider
            });
        }

        // Fetch providers with proper name info
        const providers = await prisma.serviceProvider.findMany({
            where: providerWhere,
            include: {
                UserProviderProfile: {
                    select: {
                        User: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            },
            orderBy: { lastActive: 'desc' },
            skip: skip,
            take: Math.floor(limit / 2)
        });

        console.log(`👥 Fetched ${providers.length} providers from database`);

        // Transform services data
        const transformedServices = services.map(service => {
            const provider = service.ServiceProvider;
            const rating = provider?.rating || 0;

            // Get the provider's actual name (prioritize User name, fallback to provider name, then business name)
            const providerName = provider?.UserProviderProfile?.User?.name ||
                provider?.name ||
                provider?.businessName ||
                'Professional Provider';

            return {
                id: parseInt(service.id.replace(/\D/g, '')) || Math.floor(Math.random() * 10000),
                realServiceId: service.id,  // Keep real service ID
                realProviderId: provider?.id || null,  // Keep real provider ID
                type: 'service' as const,
                name: service.name,
                title: service.description || service.name,
                category: service.category.toLowerCase().replace('_services', '').replace('_', ''),
                image: service.images?.[0] || `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000000)}?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80`,
                rating: Math.round(rating * 10) / 10,
                reviews: 0,
                price: `GH₵${service.basePrice}`,
                location: provider?.city || 'Accra',
                badge: rating > 4.8 ? 'Top Rated' : rating > 4.5 ? 'Highly Rated' : 'Professional',
                badgeColor: rating > 4.8 ? 'bg-blue-500' : rating > 4.5 ? 'bg-green-500' : 'bg-gray-500',
                provider: providerName,
                height: ['h-64', 'h-72', 'h-80', 'h-96'][Math.floor(Math.random() * 4)],
                isLive: false,
                isHot: rating > 4.7,
                isTrending: false,
                isVerified: provider?.verificationStatus === 'VERIFIED',
                responseTime: provider?.responseTime ? `${provider.responseTime} min` : '2 hours',
                completedJobs: 0,
                discount: Math.random() > 0.8 ? Math.floor(Math.random() * 30) + 10 : 0,
                // Add booking-related fields
                basePrice: service.basePrice,
                currency: service.currency || 'GHS',
                pricingType: service.pricingType || 'HOURLY',
                duration: service.duration || 1,
                supportedBookingTypes: service.supportedBookingTypes || ['IN_PERSON'], // Include supported booking types
                description: service.description || service.name
            };
        });

        // Transform providers data  
        const transformedProviders = providers.map(provider => {
            const rating = provider.rating || 0;
            const averagePrice = provider.hourlyRate || 100;

            // Get the provider's actual name (prioritize User name, fallback to provider name, then business name)
            const providerName = provider.UserProviderProfile?.User?.name ||
                provider.name ||
                provider.businessName ||
                'Professional';

            return {
                id: parseInt(provider.id.replace(/\D/g, '')) || Math.floor(Math.random() * 10000),
                realProviderId: provider.id,  // Keep real provider ID
                type: 'professional' as const,
                name: providerName,
                title: provider.bio?.substring(0, 50) + '...' || `${provider.category.replace('_', ' ')} Professional`,
                category: provider.category.toLowerCase().replace('_services', '').replace('_', ''),
                image: `https://images.unsplash.com/photo-${1600000000000 + Math.floor(Math.random() * 100000000)}?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80`,
                rating: Math.round(rating * 10) / 10,
                reviews: 0,
                price: `GH₵${Math.round(averagePrice)}`,
                location: provider.city || 'Accra',
                badge: rating > 4.8 ? 'Expert' : rating > 4.5 ? 'Pro' : 'Professional',
                badgeColor: rating > 4.8 ? 'bg-blue-500' : rating > 4.5 ? 'bg-orange-500' : 'bg-gray-500',
                availability: provider.isAvailableForBooking ? 'Available Today' : 'Booking Required',
                specialties: provider.specializations?.slice(0, 3) || [],
                height: ['h-64', 'h-72', 'h-80', 'h-96'][Math.floor(Math.random() * 4)],
                isLive: false,
                isHot: rating > 4.7,
                isTrending: false,
                isVerified: provider.verificationStatus === 'VERIFIED',
                responseTime: provider.responseTime ? `${provider.responseTime} min` : '1 hour',
                completedJobs: 0,
                skills: provider.specializations?.slice(0, 5) || []
            };
        });

        // Combine and shuffle results
        const allItems = [...transformedServices, ...transformedProviders];
        const shuffledItems = allItems.sort(() => Math.random() - 0.5);

        console.log(`✨ Transformed ${transformedServices.length} services and ${transformedProviders.length} providers`);
        console.log(`🎯 Final result: ${shuffledItems.length} total items`);

        // Get total counts for pagination
        const totalServicesCount = await prisma.service.count({ where: serviceWhere });
        const totalProvidersCount = await prisma.serviceProvider.count({ where: providerWhere });
        const total = totalServicesCount + totalProvidersCount;

        console.log(`📊 Total counts - Services: ${totalServicesCount}, Providers: ${totalProvidersCount}, Combined: ${total}`);

        return NextResponse.json({
            success: true,
            items: shuffledItems,
            pagination: {
                page,
                limit,
                total,
                hasMore: page * limit < total
            },
            stats: {
                totalServices: totalServicesCount,
                totalProviders: totalProvidersCount,
                categories: {
                    healthcare: await prisma.service.count({ where: { category: 'HEALTHCARE', isActive: true } }),
                    creative: await prisma.service.count({ where: { category: 'CREATIVE_SERVICES', isActive: true } }),
                    professional: await prisma.service.count({ where: { category: 'PROFESSIONAL_SERVICES', isActive: true } }),
                    home: await prisma.service.count({ where: { category: 'HOME_SERVICES', isActive: true } }),
                    education: await prisma.service.count({ where: { category: 'EDUCATION', isActive: true } }),
                    technical: await prisma.service.count({ where: { category: 'TECHNICAL_SERVICES', isActive: true } })
                }
            },
            debug: {
                totalServicesInDB: totalServices,
                activeServicesInDB: activeServices,
                fetchedServices: services.length,
                fetchedProviders: providers.length,
                transformedServices: transformedServices.length,
                transformedProviders: transformedProviders.length
            }
        });

    } catch (error) {
        console.error('Explore API error:', error);
        return NextResponse.json(
            {
                error: 'Failed to fetch explore data',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
} 