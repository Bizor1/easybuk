import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  console.log('🏦 Payment Details: Starting payment details submission');
  try {
    const tokenPayload = getCurrentUser(request);
    console.log('🔐 Payment Details: Token found:', !!tokenPayload?.userId);

    if (!tokenPayload?.userId) {
      console.log('❌ Payment Details: Unauthorized');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const paymentData = await request.json();
    const { paymentType, ...details } = paymentData;

    console.log('💳 Payment Details: Payment type:', paymentType);

    // Validate payment type
    if (!paymentType || !['bank', 'momo'].includes(paymentType)) {
      console.log('❌ Payment Details: Invalid payment type');
      return NextResponse.json(
        { error: 'Payment type must be either "bank" or "momo"' },
        { status: 400 }
      );
    }

    let validatedDetails;

    if (paymentType === 'bank') {
      // Validate bank details
      const { bankName, accountNumber, accountName, branchCode, swiftCode } = details;

      if (!bankName || !accountNumber || !accountName) {
        console.log('❌ Payment Details: Missing required bank fields');
        return NextResponse.json(
          { error: 'Bank name, account number, and account name are required for bank accounts' },
          { status: 400 }
        );
      }

      validatedDetails = {
        paymentType: 'bank',
        bankName,
        accountNumber,
        accountName,
        branchCode: branchCode || '',
        swiftCode: swiftCode || ''
      };

      console.log('🏦 Payment Details: Bank details validated:', { bankName, accountName });

    } else if (paymentType === 'momo') {
      // Validate mobile money details
      const { network, phoneNumber, accountName } = details;

      const validNetworks = ['MTN', 'TELECEL', 'AIRTEL_TIGO'];

      if (!network || !validNetworks.includes(network)) {
        console.log('❌ Payment Details: Invalid mobile money network');
        return NextResponse.json(
          { error: `Mobile money network must be one of: ${validNetworks.join(', ')}` },
          { status: 400 }
        );
      }

      if (!phoneNumber || !accountName) {
        console.log('❌ Payment Details: Missing required mobile money fields');
        return NextResponse.json(
          { error: 'Network, phone number, and account name are required for mobile money' },
          { status: 400 }
        );
      }

      // Validate phone number format (basic validation)
      const phoneRegex = /^(\+233|0)[0-9]{9}$/; // Ghana phone number format
      if (!phoneRegex.test(phoneNumber.replace(/\s/g, ''))) {
        console.log('❌ Payment Details: Invalid phone number format');
        return NextResponse.json(
          { error: 'Please provide a valid Ghana phone number (e.g., +233241234567 or 0241234567)' },
          { status: 400 }
        );
      }

      validatedDetails = {
        paymentType: 'momo',
        network,
        phoneNumber: phoneNumber.replace(/\s/g, ''), // Remove spaces
        accountName
      };

      console.log('📱 Payment Details: Mobile money details validated:', { network, phoneNumber: phoneNumber.replace(/\s/g, ''), accountName });
    }

    console.log('👤 Payment Details: Looking up provider profile');
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
      console.log('❌ Payment Details: Provider profile not found');
      return NextResponse.json(
        { error: 'Provider profile not found' },
        { status: 404 }
      );
    }

    // Ensure validatedDetails exists before proceeding
    if (!validatedDetails) {
      console.log('❌ Payment Details: Validation details missing');
      return NextResponse.json(
        { error: 'Payment details validation failed' },
        { status: 400 }
      );
    }

    console.log('💳 Payment Details: Updating provider with payment details');
    // Update provider with payment details
    await prisma.serviceProvider.update({
      where: { id: user.UserProviderProfile.ServiceProvider.id },
      data: {
        // Store payment details in businessRegistration field as JSON
        businessRegistration: JSON.stringify({
          paymentMethod: validatedDetails,
          updatedAt: new Date().toISOString()
        }),
        // Use businessName to indicate payment method is set up
        businessName: paymentType === 'bank'
          ? `Bank: ${validatedDetails.bankName}`
          : `Mobile Money: ${validatedDetails.network}`
      }
    });

    console.log('📧 Payment Details: Sending notification email');
    // Send notification email to provider
    try {
      await fetch(`${process.env.NEXTAUTH_URL}/api/notifications/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: user.email,
          type: 'payment_details_success',
          data: {
            providerName: user.name,
            paymentType: paymentType === 'bank' ? 'Bank Account' : 'Mobile Money',
            details: paymentType === 'bank'
              ? `${validatedDetails.bankName} - ${validatedDetails.accountName}`
              : `${validatedDetails.network} - ${validatedDetails.phoneNumber}`
          }
        })
      });
      console.log('✅ Payment Details: Email sent successfully');
    } catch (emailError) {
      console.error('⚠️ Payment Details: Failed to send email notification:', emailError);
    }

    const successMessage = paymentType === 'bank'
      ? 'Bank account details saved successfully'
      : `Mobile money details saved successfully for ${validatedDetails.network}`;

    console.log('✅ Payment Details: Payment details saved successfully');
    return NextResponse.json({
      success: true,
      message: successMessage,
      paymentType,
      details: paymentType === 'bank'
        ? { bankName: validatedDetails.bankName, accountName: validatedDetails.accountName }
        : { network: validatedDetails.network, phoneNumber: validatedDetails.phoneNumber, accountName: validatedDetails.accountName }
    });

  } catch (error) {
    console.error('🚨 Payment Details: Submission error:', error);
    return NextResponse.json(
      { error: 'Failed to save payment details' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve saved payment details
export async function GET(request: NextRequest) {
  console.log('📋 Payment Details: Getting saved payment details');
  try {
    const tokenPayload = getCurrentUser(request);

    if (!tokenPayload?.userId) {
      console.log('❌ Payment Details: Unauthorized');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

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
      console.log('❌ Payment Details: Provider profile not found');
      return NextResponse.json(
        { error: 'Provider profile not found' },
        { status: 404 }
      );
    }

    const provider = user.UserProviderProfile.ServiceProvider;
    let paymentDetails = null;

    // Parse stored payment details
    if (provider.businessRegistration) {
      try {
        const parsed = JSON.parse(provider.businessRegistration);
        if (parsed.paymentMethod) {
          paymentDetails = parsed.paymentMethod;
        }
      } catch (parseError) {
        console.log('⚠️ Payment Details: Failed to parse stored payment details');
      }
    }

    console.log('✅ Payment Details: Retrieved payment details');
    return NextResponse.json({
      success: true,
      hasPaymentDetails: !!paymentDetails,
      paymentDetails: paymentDetails ? {
        paymentType: paymentDetails.paymentType,
        ...(paymentDetails.paymentType === 'bank'
          ? {
            bankName: paymentDetails.bankName,
            accountName: paymentDetails.accountName,
            // Don't return sensitive account number in GET request
          }
          : {
            network: paymentDetails.network,
            accountName: paymentDetails.accountName,
            // Don't return full phone number in GET request
            phoneNumber: paymentDetails.phoneNumber ?
              paymentDetails.phoneNumber.replace(/(\d{3})\d{6}(\d{3})/, '$1****$2') : null
          })
      } : null
    });

  } catch (error) {
    console.error('🚨 Payment Details: Get error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve payment details' },
      { status: 500 }
    );
  }
} 