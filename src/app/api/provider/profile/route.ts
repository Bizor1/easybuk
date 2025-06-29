import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

// Mark this route as dynamic to handle headers during static generation
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    console.log('👤 Provider Profile: Getting profile data');
    try {
        const tokenPayload = getCurrentUser(request);
        console.log('🔐 Provider Profile: Token found:', !!tokenPayload?.userId);

        if (!tokenPayload?.userId) {
            console.log('❌ Provider Profile: Unauthorized');
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        console.log('👤 Provider Profile: Looking up provider profile');
        // Get user's provider profile with all related data
        const user = await prisma.user.findUnique({
            where: { id: tokenPayload.userId },
            include: {
                UserProviderProfile: {
                    include: {
                        ServiceProvider: {
                            include: {
                                Service: {
                                    where: { isActive: true },
                                    select: {
                                        id: true,
                                        name: true,
                                        category: true,
                                        description: true
                                    }
                                }
                            }
                        }
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

        const provider = user.UserProviderProfile.ServiceProvider;

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

        // Parse portfolio URLs - only if they exist
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

        console.log('🖼️ Provider Profile: Portfolio data:', {
            hasPortfolioUrls: !!(provider.portfolioUrls && provider.portfolioUrls.length > 0),
            portfolioCount: portfolioItems.length
        });

        // Format verification status based on actual database fields
        const verificationStatus = {
            email: !!user.emailVerified,
            phone: !!provider.phoneVerified,
            identity: provider.verificationStatus === 'VERIFIED' || provider.isVerified,
            address: !!(provider.address && provider.city),
            background: provider.verificationStatus === 'VERIFIED' && !!provider.idDocumentUrl
        };

        console.log('🔍 Provider Profile: Verification Status Details:', {
            email: {
                value: verificationStatus.email,
                source: user.emailVerified ? 'verified' : 'not verified'
            },
            phone: {
                value: verificationStatus.phone,
                source: provider.phoneVerified ? 'verified' : 'not verified'
            },
            identity: {
                value: verificationStatus.identity,
                source: `status: ${provider.verificationStatus}, isVerified: ${provider.isVerified}`
            },
            address: {
                value: verificationStatus.address,
                source: `address: ${!!provider.address}, city: ${!!provider.city}`
            },
            background: {
                value: verificationStatus.background,
                source: `status: ${provider.verificationStatus}, hasIdDocument: ${!!provider.idDocumentUrl}`
            }
        });

        const verificationCount = Object.values(verificationStatus).filter(Boolean).length;
        const verificationPercentage = Math.round((verificationCount / 5) * 100);

        console.log('📊 Provider Profile: Verification Summary:', {
            verifiedCount: verificationCount,
            totalCount: 5,
            percentage: verificationPercentage + '%'
        });

        // Format availability from working hours
        const defaultAvailability = {
            monday: { start: '08:00', end: '18:00', available: true },
            tuesday: { start: '08:00', end: '18:00', available: true },
            wednesday: { start: '08:00', end: '18:00', available: true },
            thursday: { start: '08:00', end: '18:00', available: true },
            friday: { start: '08:00', end: '18:00', available: true },
            saturday: { start: '09:00', end: '15:00', available: true },
            sunday: { start: '09:00', end: '15:00', available: false }
        };

        // Ensure we always have a complete availability object
        const availability = workingHours && typeof workingHours === 'object' ? {
            ...defaultAvailability,
            ...workingHours
        } : defaultAvailability;

        console.log('📅 Provider Profile: Availability data:', {
            hasWorkingHours: !!workingHours,
            availabilityKeys: Object.keys(availability)
        });

        // Format social links - this would need to be added to schema if needed
        const socialLinks = {
            website: provider.businessName ? `https://${provider.businessName.toLowerCase().replace(/\s+/g, '')}.com` : undefined,
            linkedin: undefined,
            facebook: undefined,
            instagram: undefined
        };

        // Create response data matching the frontend interface with proper defaults
        const profileData = {
            id: provider.id,
            name: user.name || provider.name || '',
            email: user.email || '',
            phone: user.phone || provider.phone || '',
            image: user.image || provider.image || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
            bio: provider.bio || '',
            location: provider.city || '',
            experience: provider.experience ? parseInt(provider.experience) : 0,
            hourlyRate: provider.hourlyRate || 0,
            services: provider.Service?.map(service => service.name) || [],
            skills: provider.specializations || [],
            languages: ['English'], // This would need to be added to schema if needed
            verificationStatus,
            portfolio: portfolioItems,
            availability,
            socialLinks,
            // Additional fields from database
            businessName: provider.businessName || '',
            category: provider.category,
            rating: provider.rating || 0,
            totalReviews: provider.totalReviews || 0,
            completedBookings: provider.completedBookings || 0,
            isVerified: provider.isVerified || false,
            profileCompleted: provider.profileCompleted || false
        };

        console.log('✅ Provider Profile: Profile data prepared:', {
            id: profileData.id,
            name: profileData.name,
            email: profileData.email,
            phone: profileData.phone,
            bio: profileData.bio ? 'Has bio' : 'No bio',
            experience: profileData.experience,
            hourlyRate: profileData.hourlyRate,
            portfolioItemsCount: profileData.portfolio.length,
            availabilityDays: Object.keys(profileData.availability)
        });

        console.log('✅ Provider Profile: Profile data prepared successfully');
        return NextResponse.json(profileData);

    } catch (error) {
        console.error('🚨 Provider Profile: Fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch profile data' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    console.log('💾 Provider Profile: Updating profile data');
    try {
        const tokenPayload = getCurrentUser(request);
        console.log('🔐 Provider Profile: Token found:', !!tokenPayload?.userId);

        if (!tokenPayload?.userId) {
            console.log('❌ Provider Profile: Unauthorized');
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const updateData = await request.json();
        console.log('📝 Provider Profile: Update data received:', Object.keys(updateData));

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

        // Update user table fields
        const userUpdateData: any = {};
        if (updateData.name !== undefined) userUpdateData.name = updateData.name;
        if (updateData.phone !== undefined) userUpdateData.phone = updateData.phone;
        if (updateData.image !== undefined) userUpdateData.image = updateData.image;

        // Update provider table fields
        const providerUpdateData: any = {};
        if (updateData.bio !== undefined) providerUpdateData.bio = updateData.bio;
        if (updateData.hourlyRate !== undefined) {
            const hourlyRate = parseFloat(updateData.hourlyRate);
            providerUpdateData.hourlyRate = hourlyRate >= 0 ? hourlyRate : 0; // Prevent negative rates
        }
        if (updateData.experience !== undefined) providerUpdateData.experience = updateData.experience.toString();
        if (updateData.location !== undefined) providerUpdateData.city = updateData.location;
        if (updateData.skills !== undefined && Array.isArray(updateData.skills)) {
            providerUpdateData.specializations = updateData.skills
                .filter((skill: any): skill is string => typeof skill === 'string')
                .filter((skill: string) => skill.trim().length > 0);
        }
        if (updateData.businessName !== undefined) providerUpdateData.businessName = updateData.businessName;

        // Handle availability/working hours
        if (updateData.availability !== undefined) {
            providerUpdateData.workingHours = JSON.stringify(updateData.availability);
        }

        console.log('📝 Provider Profile: Processing services update');
        // Handle services - these are stored in the Service table, not as an array field
        if (updateData.services !== undefined && Array.isArray(updateData.services)) {
            // For now, we'll store services in specializations as well
            // In a full implementation, you'd want to create/update Service records
            const existingServices = providerUpdateData.specializations || user.UserProviderProfile.ServiceProvider.specializations || [];
            const newServices = updateData.services.filter((service: any) => service.trim().length > 0);

            // Combine services with existing specializations - convert Set to Array properly
            const combinedArray = [...existingServices, ...newServices];
            const uniqueSpecializations = combinedArray.filter((item, index) => combinedArray.indexOf(item) === index);
            providerUpdateData.specializations = uniqueSpecializations;

            console.log('🔧 Provider Profile: Updated services/specializations:', uniqueSpecializations);
        }

        // Handle languages - would need to be added to schema or stored as JSON
        if (updateData.languages !== undefined && Array.isArray(updateData.languages)) {
            // For now, we could store this in a JSON field if added to schema
            // Or handle it separately - for this implementation, we'll skip storing languages
            console.log('🗣️ Provider Profile: Languages update received (not stored in current schema):', updateData.languages);
        }

        // Handle portfolio updates
        if (updateData.portfolio !== undefined && Array.isArray(updateData.portfolio)) {
            // Extract image URLs from portfolio items for storage
            const portfolioUrls = updateData.portfolio
                .filter((item: any) => item.image)
                .map((item: any) => item.image);

            providerUpdateData.portfolioUrls = portfolioUrls;
            console.log('🖼️ Provider Profile: Portfolio URLs updated:', portfolioUrls.length, 'items');
        }

        // Perform updates in a transaction
        await prisma.$transaction(async (tx) => {
            // Update user data if there are changes
            if (Object.keys(userUpdateData).length > 0) {
                await tx.user.update({
                    where: { id: tokenPayload.userId },
                    data: userUpdateData
                });
            }

            // Update provider data if there are changes
            if (Object.keys(providerUpdateData).length > 0) {
                await tx.serviceProvider.update({
                    where: { id: providerId },
                    data: {
                        ...providerUpdateData,
                        updatedAt: new Date()
                    }
                });
            }
        });

        console.log('✅ Provider Profile: Profile updated successfully');
        return NextResponse.json({ success: true, message: 'Profile updated successfully' });

    } catch (error) {
        console.error('🚨 Provider Profile: Update error:', error);
        return NextResponse.json(
            { error: 'Failed to update profile data' },
            { status: 500 }
        );
    }
} 