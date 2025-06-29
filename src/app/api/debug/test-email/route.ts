import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    console.log('=== EMAIL CONFIGURATION TEST ===');
    
    // Check environment variables
    const emailHost = process.env.EMAIL_SERVER_HOST;
    const emailPort = process.env.EMAIL_SERVER_PORT;
    const emailUser = process.env.EMAIL_SERVER_USER;
    const emailPass = process.env.EMAIL_SERVER_PASSWORD;
    const emailFrom = process.env.EMAIL_FROM;
    const nextAuthUrl = process.env.NEXTAUTH_URL;
    
    console.log('Environment variables:');
    console.log('EMAIL_SERVER_HOST:', emailHost);
    console.log('EMAIL_SERVER_PORT:', emailPort);
    console.log('EMAIL_SERVER_USER:', emailUser);
    console.log('EMAIL_SERVER_PASSWORD:', emailPass ? '***SET***' : 'NOT SET');
    console.log('EMAIL_FROM:', emailFrom);
    console.log('NEXTAUTH_URL:', nextAuthUrl);
    
    // Check for missing variables
    const missing = [];
    if (!emailHost) missing.push('EMAIL_SERVER_HOST');
    if (!emailPort) missing.push('EMAIL_SERVER_PORT');
    if (!emailUser) missing.push('EMAIL_SERVER_USER');
    if (!emailPass) missing.push('EMAIL_SERVER_PASSWORD');
    if (!emailFrom) missing.push('EMAIL_FROM');
    if (!nextAuthUrl) missing.push('NEXTAUTH_URL');
    
    if (missing.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Missing environment variables',
        missing: missing,
        message: 'Please create a .env.local file in your project root with the missing variables'
      });
    }
    
    // Test SMTP connection
    const transporter = nodemailer.createTransport({
      host: emailHost,
      port: parseInt(emailPort || '587'),
      secure: false, // Use TLS
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });
    
    console.log('Testing SMTP connection...');
    await transporter.verify();
    console.log('SMTP connection successful!');
    
    // Send test email
    const { testEmail } = await request.json();
    const emailToTest = testEmail || emailUser;
    
    console.log('Sending test email to:', emailToTest);
    
    const result = await transporter.sendMail({
      from: `"EasyBuk Test" <${emailFrom}>`,
      to: emailToTest,
      subject: '🧪 EasyBuk Email Test',
      html: `
        <h2>Email Configuration Test</h2>
        <p>✅ Your email configuration is working correctly!</p>
        <p>This test email was sent at: ${new Date().toISOString()}</p>
        <p>From: EasyBuk Email System</p>
      `
    });
    
    console.log('Test email sent successfully:', result.messageId);
    
    return NextResponse.json({
      success: true,
      message: 'Email test successful!',
      messageId: result.messageId,
      sentTo: emailToTest
    });
    
  } catch (error) {
    console.error('Email test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Email test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      troubleshooting: {
        commonIssues: [
          'Check if your Gmail App Password is correct',
          'Ensure 2-factor authentication is enabled on Gmail',
          'Verify the app password was generated correctly',
          'Check if NEXTAUTH_URL is set to http://localhost:3000',
          'Make sure .env.local file exists in project root'
        ]
      }
    }, { status: 500 });
  }
} 