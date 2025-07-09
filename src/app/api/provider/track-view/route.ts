import { NextRequest, NextResponse } from 'next/server';
import { trackProfileView } from '@/lib/tracking';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { providerId, source = 'direct' } = body;

        if (!providerId) {
            return NextResponse.json(
                { error: 'Provider ID is required' },
                { status: 400 }
            );
        }

        // Get client information
        const headersList = headers();
        const userAgent = headersList.get('user-agent');
        const referer = headersList.get('referer');
        const forwarded = headersList.get('x-forwarded-for');
        const realIp = headersList.get('x-real-ip');
        const clientIp = forwarded?.split(',')[0] || realIp || 'unknown';

        // Track the profile view
        await trackProfileView({
            providerId,
            viewerId: null, // Could be extracted from auth if user is logged in
            viewerType: 'GUEST', // Could be 'CLIENT' or 'PROVIDER' if authenticated
            ipAddress: clientIp,
            userAgent,
            referrer: referer,
            source
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error tracking profile view:', error);
        return NextResponse.json(
            { error: 'Failed to track profile view' },
            { status: 500 }
        );
    }
} 