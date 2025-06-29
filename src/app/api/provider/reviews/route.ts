import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

// Mark this route as dynamic to handle headers during static generation
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        // Get the current user (provider)
        const tokenPayload = getCurrentUser(request);

        if (!tokenPayload?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user has provider role
        if (!tokenPayload.roles?.includes('PROVIDER')) {
            return NextResponse.json({ error: 'Provider access required' }, { status: 403 });
        }

        // Get provider profile
        const provider = await prisma.serviceProvider.findFirst({
            where: {
                UserProviderProfile: {
                    userId: tokenPayload.userId
                }
            },
            include: {
                UserProviderProfile: {
                    include: {
                        User: true
                    }
                }
            }
        });

        if (!provider) {
            return NextResponse.json({ error: 'Provider profile not found' }, { status: 404 });
        }

        // Fetch reviews for this provider
        const reviews = await prisma.review.findMany({
            where: {
                providerId: provider.id
            },
            include: {
                Client: {
                    select: {
                        id: true,
                        name: true,
                        image: true
                    }
                },
                Booking: {
                    select: {
                        id: true,
                        title: true,
                        createdAt: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Calculate statistics
        const totalReviews = reviews.length;
        const averageRating = totalReviews > 0
            ? reviews.reduce((sum, review) => sum + review.overallRating, 0) / totalReviews
            : 0;

        // Calculate rating distribution
        const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviews.forEach(review => {
            distribution[review.overallRating as keyof typeof distribution]++;
        });

        // Calculate response rate
        const reviewsWithResponse = reviews.filter(review => review.providerResponse);
        const responseRate = totalReviews > 0
            ? Math.round((reviewsWithResponse.length / totalReviews) * 100)
            : 0;

        // Calculate average response time (mock for now)
        const averageResponseTime = '2 hours'; // TODO: Calculate actual response time

        // Transform reviews for frontend
        const transformedReviews = reviews.map(review => ({
            id: review.id,
            client: {
                name: review.Client.name,
                image: review.Client.image || '/default-avatar.svg'
            },
            rating: review.overallRating,
            comment: review.comment,
            service: review.Booking?.title || 'Service',
            date: review.createdAt.toISOString(),
            helpful: 0, // Field doesn't exist in schema
            response: review.providerResponse ? {
                text: review.providerResponse,
                date: review.respondedAt?.toISOString() || review.createdAt.toISOString()
            } : undefined,
            verified: review.isVerified
        }));

        const stats = {
            averageRating,
            totalReviews,
            distribution,
            responseRate,
            averageResponseTime
        };

        return NextResponse.json({
            success: true,
            reviews: transformedReviews,
            stats
        });

    } catch (error) {
        console.error('Error fetching provider reviews:', error);
        return NextResponse.json(
            { error: 'Failed to fetch reviews' },
            { status: 500 }
        );
    }
} 