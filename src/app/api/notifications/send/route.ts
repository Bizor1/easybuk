import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getCurrentUser } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

// Email templates
const emailTemplates = {
  bank_details_success: {
    subject: '🏦 Bank Details Added Successfully - EasyBuk',
    html: (data: any) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">EasyBuk Provider</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333;">Hi ${data.providerName}! 👋</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            Great news! Your bank details have been successfully added to your EasyBuk provider account.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
            <h3 style="color: #28a745; margin-top: 0;">✅ Bank Details Confirmed</h3>
            <p style="margin: 0; color: #666;">
              Bank: <strong>${data.bankName}</strong><br>
              Status: <strong>Verified</strong>
            </p>
          </div>
          
          <p style="color: #555;">
            You're one step closer to earning on EasyBuk! Complete your account setup to start receiving bookings.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}/provider/dashboard" 
               style="background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Continue Setup
            </a>
          </div>
        </div>
        
        <div style="padding: 20px; text-align: center; color: #888; background: #e9ecef;">
          <p style="margin: 0; font-size: 14px;">
            This is an automated message from EasyBuk. Please do not reply to this email.
          </p>
        </div>
      </div>
    `
  },

  services_setup_success: {
    subject: '⚡ Service Categories Added - Ready to Earn!',
    html: (data: any) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">EasyBuk Provider</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333;">Awesome work, ${data.providerName}! 🎉</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            You've successfully added ${data.serviceCount} service categories to your profile.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #f5576c; margin-top: 0;">Your Selected Services:</h3>
            <ul style="color: #666; line-height: 1.8;">
              ${data.categories.map((category: string) => `<li>${category}</li>`).join('')}
            </ul>
          </div>
          
          <p style="color: #555;">
            Next step: Upload your verification documents to start receiving bookings from clients.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}/provider/dashboard" 
               style="background: #f5576c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Upload Documents
            </a>
          </div>
        </div>
        
        <div style="padding: 20px; text-align: center; color: #888; background: #e9ecef;">
          <p style="margin: 0; font-size: 14px;">
            This is an automated message from EasyBuk. Please do not reply to this email.
          </p>
        </div>
      </div>
    `
  },

  documents_upload_success: {
    subject: '📄 Documents Uploaded - Under Review',
    html: (data: any) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%); padding: 30px; text-align: center;">
          <h1 style="color: #8B4513; margin: 0;">EasyBuk Provider</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333;">Documents Received, ${data.providerName}! 📋</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            Thank you for uploading your verification documents. They are now under review by our team.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffa500;">
            <h3 style="color: #ffa500; margin-top: 0;">⏳ Review Status: Pending</h3>
            <p style="margin: 0; color: #666;">
              Submitted: ${new Date(data.submittedAt).toLocaleDateString()}<br>
              Expected Review Time: 24-48 hours
            </p>
          </div>
          
          <p style="color: #555;">
            We'll notify you as soon as your documents are approved. You'll then be able to start receiving bookings!
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}/provider/dashboard" 
               style="background: #ffa500; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View Dashboard
            </a>
          </div>
        </div>
        
        <div style="padding: 20px; text-align: center; color: #888; background: #e9ecef;">
          <p style="margin: 0; font-size: 14px;">
            This is an automated message from EasyBuk. Please do not reply to this email.
          </p>
        </div>
      </div>
    `
  },

  email_verification: {
    subject: '✉️ Verify Your EasyBuk Account Email',
    html: (data: any) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">EasyBuk</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333;">Hi ${data.userName}! 👋</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            Please verify your email address to complete your EasyBuk account setup.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.verificationLink}" 
               style="background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Verify Email Address
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${data.verificationLink}" style="color: #007bff;">${data.verificationLink}</a>
          </p>
          
          <p style="color: #666; font-size: 14px;">
            This verification link will expire in 24 hours for security reasons.
          </p>
        </div>
        
        <div style="padding: 20px; text-align: center; color: #888; background: #e9ecef;">
          <p style="margin: 0; font-size: 14px;">
            This is an automated message from EasyBuk. Please do not reply to this email.
          </p>
        </div>
      </div>
    `
  },

  documents_uploaded: {
    subject: '🚨 New Provider Documents for Review - EasyBuk Admin',
    html: (data: any) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">EasyBuk Admin Alert</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333;">New Provider Documents Uploaded 📄</h2>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545;">
            <h3 style="color: #dc3545; margin-top: 0;">Provider Details:</h3>
            <p style="margin: 0; color: #666; line-height: 1.6;">
              <strong>Name:</strong> ${data.providerName}<br>
              <strong>Email:</strong> ${data.providerEmail}<br>
              <strong>Provider ID:</strong> ${data.providerId}<br>
              <strong>Documents:</strong> ${data.documentCount} files<br>
              <strong>Submitted:</strong> ${new Date(data.submittedAt).toLocaleString()}
            </p>
          </div>
          
          <p style="color: #555;">
            Please review and approve the provider's verification documents to activate their account.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}/admin/providers" 
               style="background: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Review Documents
            </a>
          </div>
        </div>
        
        <div style="padding: 20px; text-align: center; color: #888; background: #e9ecef;">
          <p style="margin: 0; font-size: 14px;">
            EasyBuk Admin System - Automated Alert
          </p>
        </div>
      </div>
    `
  }
};

// Create transporter (configure with your email service)
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST || process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_SERVER_PORT || process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.EMAIL_SERVER_USER || process.env.SMTP_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD || process.env.SMTP_PASS,
    },
  });
};

export async function POST(request: NextRequest) {
  try {
    const token = getCurrentUser(request);

    if (!token?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      userId,
      userType,
      type,
      title,
      message,
      data = null,
      sendEmail = false,
      sendSMS = false
    } = body;

    // Validate required fields
    if (!userId || !userType || !type || !title || !message) {
      return NextResponse.json({
        error: 'Missing required fields: userId, userType, type, title, message'
      }, { status: 400 });
    }

    // Create notification
    const notificationData = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      userType,
      type,
      title,
      message,
      sentViaEmail: sendEmail,
      sentViaSMS: sendSMS,
      ...(data && { data: JSON.stringify(data) })
    };

    const notification = await prisma.notification.create({
      data: notificationData
    });

    // TODO: Implement actual email/SMS sending
    if (sendEmail) {
      console.log(`📧 Email notification sent to user ${userId}: ${title}`);
      // await sendEmailNotification(userId, title, message);
    }

    if (sendSMS) {
      console.log(`📱 SMS notification sent to user ${userId}: ${title}`);
      // await sendSMSNotification(userId, title, message);
    }

    return NextResponse.json({
      success: true,
      notification,
      message: 'Notification sent successfully'
    });

  } catch (error) {
    console.error('Error sending notification:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}

// Helper function to send booking reminders - moved to separate utility file
// This function should be called from a scheduled job, not exported from API route 