import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/jwt';

export async function POST(request: NextRequest) {
    console.log('📝 Provider Verification: Starting verification submission');
    try {
        // Get user from custom JWT token
        const tokenPayload = getCurrentUser(request);
        console.log('🔐 Provider Verification: Token found:', !!tokenPayload?.userId);
        
        if (!tokenPayload?.userId) {
            console.log('❌ Provider Verification: Unauthorized');
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const verificationData = await request.json();

        // Here you would typically:
        // 1. Validate the verification data
        // 2. Save to database
        // 3. Trigger verification workflow
        // 4. Send notifications to admin

        // For now, we'll just log and return success
        console.log('📋 Provider Verification: Data received:', {
            userId: tokenPayload.userId,
            personalInfo: verificationData.personalInfo,
            businessInfo: verificationData.businessInfo,
            documentsCount: {
                idDocument: verificationData.documents.idDocument.length,
                businessLicense: verificationData.documents.businessLicense.length,
                certifications: verificationData.documents.certifications.length,
                portfolio: verificationData.documents.portfolio.length
            }
        });

        // TODO: Implement database operations
        // const verification = await prisma.providerVerification.create({
        //     data: {
        //         userId: tokenPayload.userId,
        //         personalInfo: verificationData.personalInfo,
        //         businessInfo: verificationData.businessInfo,
        //         documents: verificationData.documents,
        //         status: 'PENDING',
        //         submittedAt: new Date()
        //     }
        // });

        console.log('✅ Provider Verification: Submission successful');
        return NextResponse.json({
            success: true,
            message: 'Verification submitted successfully',
            verificationId: `VER_${Date.now()}` // Mock ID
        });

    } catch (error) {
        console.error('🚨 Provider Verification: Submission error:', error);
        return NextResponse.json(
            { error: 'Failed to submit verification' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    console.log('📋 Provider Verification: Getting verification status');
    try {
        const tokenPayload = getCurrentUser(request);
        console.log('🔐 Provider Verification: Token found:', !!tokenPayload?.userId);
        
        if (!tokenPayload?.userId) {
            console.log('❌ Provider Verification: Unauthorized');
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // TODO: Get verification status from database
        // const verification = await prisma.providerVerification.findFirst({
        //     where: { userId: tokenPayload.userId },
        //     orderBy: { submittedAt: 'desc' }
        // });

        // Mock verification status
        const verificationStatus = {
            identity: 'pending',
            business: 'pending',
            background: 'pending',
            overall: 'pending',
            submittedAt: new Date(),
            reviewedAt: null,
            notes: null
        };

        console.log('✅ Provider Verification: Status retrieved');
        return NextResponse.json(verificationStatus);

    } catch (error) {
        console.error('🚨 Provider Verification: Get error:', error);
        return NextResponse.json(
            { error: 'Failed to get verification status' },
            { status: 500 }
        );
    }
} 