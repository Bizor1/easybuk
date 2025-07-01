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
    }
};

// Create email transporter
const createTransporter = () => {
    return nodemailer.createTransporter({
        host: process.env.EMAIL_SERVER_HOST || process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_SERVER_PORT || process.env.SMTP_PORT || '587'),
        secure: false,
        auth: {
            user: process.env.EMAIL_SERVER_USER || process.env.SMTP_USER,
            pass: process.env.EMAIL_SERVER_PASSWORD || process.env.SMTP_PASS,
        },
    });
};

export interface EmailData {
    to: string;
    type: keyof typeof emailTemplates;
    data: any;
}

export async function sendEmail({ to, type, data = {} }: EmailData) {
    try {
        console.log('📧 SHARED_EMAIL_SERVICE: Sending email:', { to, type, hasData: !!data });

        // Check if email template exists
        const template = emailTemplates[type];
        if (!template) {
            throw new Error(`Unknown email template: ${type}`);
        }

        // Check if email credentials are configured
        const emailUser = process.env.EMAIL_SERVER_USER || process.env.SMTP_USER;
        const emailPass = process.env.EMAIL_SERVER_PASSWORD || process.env.SMTP_PASS;

        if (!emailUser || !emailPass) {
            console.log('❌ SMTP credentials not configured');
            throw new Error('SMTP credentials not configured');
        }

        // Create transporter and send email
        const transporter = createTransporter();

        const mailOptions = {
            from: `"EasyBuk" <${emailUser}>`,
            to: to,
            subject: template.subject,
            html: template.html(data)
        };

        console.log('📧 SHARED_EMAIL_SERVICE: Sending email via SMTP...');
        const result = await transporter.sendMail(mailOptions);
        console.log('✅ SHARED_EMAIL_SERVICE: Email sent successfully:', result.messageId);

        return {
            success: true,
            message: 'Email sent successfully',
            messageId: result.messageId,
            email: {
                to,
                subject: template.subject,
                type
            }
        };

    } catch (error) {
        console.error('❌ SHARED_EMAIL_SERVICE: Error sending email:', error);
        throw error;
    }
} 