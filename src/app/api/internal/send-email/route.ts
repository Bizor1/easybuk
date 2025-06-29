import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Email templates
const emailTemplates = {
  email_verification: {
    subject: '✉️ Verify Your EasyBuk Account Email',
    html: (data: any) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">EasyBuk</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333;">Hi ${data.userName || 'there'}! 👋</h2>
          
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

  password_reset: {
    subject: '🔐 Reset Your EasyBuk Password',
    html: (data: any) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ff7b7b 0%, #667eea 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">EasyBuk</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333;">Password Reset Request</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            We received a request to reset your password. Click the button below to create a new password:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.resetLink}" 
               style="background: #dc3545; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            If you didn't request this password reset, please ignore this email. Your password will not be changed.
          </p>
          
          <p style="color: #666; font-size: 14px;">
            This password reset link will expire in 1 hour for security reasons.
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

  welcome: {
    subject: '🎉 Welcome to EasyBuk!',
    html: (data: any) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Welcome to EasyBuk!</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333;">Hi ${data.userName || 'there'}! 🎉</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            Welcome to EasyBuk! We're excited to have you join our community of ${data.userType === 'CLIENT' ? 'clients' : 'service providers'}.
          </p>
          
          ${data.userType === 'CLIENT' ? `
            <p style="color: #555;">
              You can now browse and book amazing services from verified providers in your area.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/explore" 
                 style="background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Start Exploring Services
              </a>
            </div>
          ` : `
            <p style="color: #555;">
              Complete your provider profile to start receiving bookings and grow your business.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/provider/dashboard" 
                 style="background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Complete Your Profile
              </a>
            </div>
          `}
        </div>
        
        <div style="padding: 20px; text-align: center; color: #888; background: #e9ecef;">
          <p style="margin: 0; font-size: 14px;">
            This is an automated message from EasyBuk. Please do not reply to this email.
          </p>
        </div>
      </div>
    `
  }
};

// Create email transporter
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
    console.log('=== INTERNAL EMAIL API START ===');

    // This is an internal API - no authentication required
    // But we should validate the request structure

    const body = await request.json();
    const { to, type, data = {} } = body;

    console.log('Email request:', { to, type, hasData: !!data });

    // Validate required fields
    if (!to || !type) {
      console.log('❌ Missing required fields');
      return NextResponse.json({
        error: 'Missing required fields: to, type'
      }, { status: 400 });
    }

    // Check if email template exists
    const template = emailTemplates[type as keyof typeof emailTemplates];
    if (!template) {
      console.log('❌ Unknown email template:', type);
      return NextResponse.json({
        error: `Unknown email template: ${type}`
      }, { status: 400 });
    }

    // Check if email credentials are configured
    const emailUser = process.env.EMAIL_SERVER_USER || process.env.SMTP_USER;
    const emailPass = process.env.EMAIL_SERVER_PASSWORD || process.env.SMTP_PASS;

    if (!emailUser || !emailPass) {
      console.log('❌ SMTP credentials not configured');
      console.log('Available env vars:', {
        SMTP_HOST: !!process.env.SMTP_HOST,
        SMTP_USER: !!process.env.SMTP_USER,
        SMTP_PASS: !!process.env.SMTP_PASS,
        EMAIL_SERVER_HOST: !!process.env.EMAIL_SERVER_HOST,
        EMAIL_SERVER_USER: !!process.env.EMAIL_SERVER_USER,
        EMAIL_SERVER_PASSWORD: !!process.env.EMAIL_SERVER_PASSWORD
      });

      // For development, just log and return success
      console.log('📧 [DEVELOPMENT] Would send email:');
      console.log('  To:', to);
      console.log('  Subject:', template.subject);
      console.log('  Template:', type);

      return NextResponse.json({
        success: true,
        message: 'Email would be sent (development mode - SMTP not configured)',
        email: {
          to,
          subject: template.subject,
          type
        }
      });
    }

    // Create transporter and send email
    const transporter = createTransporter();

    const mailOptions = {
      from: `"EasyBuk" <${emailUser}>`,
      to: to,
      subject: template.subject,
      html: template.html(data)
    };

    console.log('📧 Sending email via SMTP...');
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', result.messageId);

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      messageId: result.messageId,
      email: {
        to,
        subject: template.subject,
        type
      }
    });

  } catch (error) {
    console.error('❌ Error sending email:', error);
    return NextResponse.json(
      {
        error: 'Failed to send email',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 