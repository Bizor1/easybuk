import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

export async function POST(
    request: NextRequest,
    { params }: { params: { reviewId: string } }
) {
    try {
        const { reviewId } = params;

        // Get the current user (provider)
        const tokenPayload = getCurrentUser(request);

        if (!tokenPayload?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user has provider role
        if (!tokenPayload.roles?.includes('PROVIDER')) {
            return NextResponse.json({ error: 'Provider access required' }, { status: 403 });
        }

        const body = await request.json();
        const { response: responseText } = body;

        if (!responseText || !responseText.trim()) {
            return NextResponse.json({ error: 'Response text is required' }, { status: 400 });
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

        // Find the review and verify it belongs to this provider
        const review = await prisma.review.findUnique({
            where: { id: reviewId },
            include: {
                Booking: true
            }
        });

        if (!review) {
            return NextResponse.json({ error: 'Review not found' }, { status: 404 });
        }

        // Verify this review is for the current provider
        if (review.providerId !== provider.id) {
            return NextResponse.json({ error: 'You can only respond to your own reviews' }, { status: 403 });
        }

        // Check if response already exists
        if (review.providerResponse) {
            return NextResponse.json({ error: 'Response already exists for this review' }, { status: 400 });
        }

        // Update the review with the provider response
        const updatedReview = await prisma.review.update({
            where: { id: reviewId },
            data: {
                providerResponse: responseText.trim(),
                respondedAt: new Date()
            }
        });

        // TODO: Send notification to the reviewer about the response
        // TODO: Update provider response stats

        return NextResponse.json({
            success: true,
            message: 'Response added successfully',
            response: {
                id: updatedReview.id,
                text: updatedReview.providerResponse,
                date: updatedReview.respondedAt?.toISOString() || new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Error responding to review:', error);
        return NextResponse.json(
            { error: 'Failed to respond to review' },
            { status: 500 }
        );
    }
} 