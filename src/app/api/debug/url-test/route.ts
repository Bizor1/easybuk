import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        // Use the same logic as the verification route
        let origin = request.headers.get('origin') || request.url.split('/api')[0];

        // Always use the main production URL on Vercel
        if (process.env.NODE_ENV === 'production' || process.env.VERCEL_URL) {
            origin = 'https://easybuk.vercel.app';
        }

        const emailApiUrl = `${origin}/api/internal/send-email`;

        // Test if the email API URL is reachable
        let emailApiTest = null;
        try {
            const testResponse = await fetch(emailApiUrl, {
                method: 'GET', // Just test if endpoint exists
            });
            emailApiTest = {
                status: testResponse.status,
                ok: testResponse.ok,
                headers: Object.fromEntries(testResponse.headers.entries())
            };
        } catch (fetchError) {
            emailApiTest = {
                error: fetchError instanceof Error ? fetchError.message : 'Unknown error'
            };
        }

        return NextResponse.json({
            request_info: {
                url: request.url,
                origin_header: request.headers.get('origin'),
                headers: Object.fromEntries(request.headers.entries())
            },
            env_vars: {
                NODE_ENV: process.env.NODE_ENV,
                VERCEL_URL: process.env.VERCEL_URL,
                NEXTAUTH_URL: process.env.NEXTAUTH_URL
            },
            computed_origin: origin,
            email_api_url: emailApiUrl,
            email_api_test: emailApiTest
        });

    } catch (error) {
        return NextResponse.json(
            {
                error: 'Debug test failed',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
} 