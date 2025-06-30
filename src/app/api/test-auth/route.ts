import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, extractToken } from '@/lib/jwt';

// Mark this route as dynamic
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const results: any = {
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        tests: {}
    };

    // Test 1: Basic Prisma Connection
    try {
        await prisma.$connect();
        results.tests.prismaConnection = { success: true, message: "Prisma connection successful" };
    } catch (error) {
        results.tests.prismaConnection = {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            code: error && typeof error === 'object' && 'code' in error ? error.code : 'UNKNOWN'
        };
    }

    // Test 2: Database Query
    try {
        const userCount = await prisma.user.count();
        results.tests.databaseQuery = { success: true, userCount, message: "Database query successful" };
    } catch (error) {
        results.tests.databaseQuery = {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            code: error && typeof error === 'object' && 'code' in error ? error.code : 'UNKNOWN'
        };
    }

    // Test 3: JWT Token Extraction
    try {
        const token = extractToken(request);
        const currentUser = getCurrentUser(request);
        results.tests.jwtExtraction = {
            success: true,
            hasToken: !!token,
            hasValidUser: !!currentUser,
            message: token ? "Token found" : "No token (expected for unauthenticated request)"
        };
    } catch (error) {
        results.tests.jwtExtraction = {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }

    // Test 4: Check if tables exist
    try {
        const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
        results.tests.tablesExist = {
            success: true,
            tables: tables,
            message: "Database tables check successful"
        };
    } catch (error) {
        results.tests.tablesExist = {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }

    return NextResponse.json(results);
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        return NextResponse.json({
            success: true,
            message: 'POST method working for auth test!',
            receivedData: body,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
        }, { status: 400 });
    }
} 