import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

// Mark this route as dynamic to handle headers during static generation
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  console.log('📋 Admin Documents: Getting pending documents');
  try {
    const tokenPayload = getCurrentUser(request);
    console.log('🔐 Admin Documents: Token found:', !!tokenPayload?.userId);

    if (!tokenPayload?.userId) {
      console.log('❌ Admin Documents: Unauthorized');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: tokenPayload.userId },
      include: {
        UserAdminProfile: true
      }
    });

    if (!user || !user.roles.includes('ADMIN') || !user.UserAdminProfile) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'PENDING';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    console.log(`📄 Fetching documents with status: ${status}`);

    // Get providers with documents to review
    const providers = await prisma.serviceProvider.findMany({
      where: {
        verificationStatus: status as any
      },
      include: {
        UserProviderProfile: {
          include: {
            User: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                createdAt: true
              }
            }
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      },
      skip,
      take: limit
    });

    // Get total count for pagination
    const totalCount = await prisma.serviceProvider.count({
      where: {
        verificationStatus: status as any
      }
    });

    // Filter providers who have actually submitted documents
    const providersWithDocuments = providers.filter(provider => {
      return provider.idDocumentUrl ||
        (provider.portfolioUrls && provider.portfolioUrls.length > 0) ||
        (provider.certificateUrls && provider.certificateUrls.length > 0);
    });

    // Format the response data
    const documentsData = providersWithDocuments.map(provider => {
      let documentInfo: any = { type: 'unknown' };

      // Parse ID document data
      if (provider.idDocumentUrl) {
        try {
          const parsed = JSON.parse(provider.idDocumentUrl);
          if (parsed.type) {
            documentInfo = parsed;
          } else {
            // Legacy format - single URL
            documentInfo = { type: 'passport', url: provider.idDocumentUrl };
          }
        } catch {
          // Legacy format - single URL
          documentInfo = { type: 'passport', url: provider.idDocumentUrl };
        }
      }

      return {
        id: provider.id,
        verificationStatus: provider.verificationStatus,
        submittedAt: provider.updatedAt,
        verifiedAt: provider.verifiedAt,
        user: provider.UserProviderProfile?.User,
        documents: {
          type: documentInfo.type,
          idDocument: documentInfo,
          selfiePhoto: provider.portfolioUrls?.[0] || null,
          certificates: provider.certificateUrls || [],
          hasCertificates: (provider.certificateUrls || []).length > 0
        },
        providerInfo: {
          category: provider.category,
          specializations: provider.specializations,
          businessName: provider.businessName,
          city: provider.city,
          bio: provider.bio
        }
      };
    });

    console.log(`✅ Found ${providers.length} providers with status ${status}, ${documentsData.length} have documents`);

    return NextResponse.json({
      success: true,
      documents: documentsData,
      pagination: {
        page,
        limit,
        total: documentsData.length,
        pages: Math.ceil(documentsData.length / limit)
      }
    });

  } catch (error) {
    console.error('Admin documents fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
} 