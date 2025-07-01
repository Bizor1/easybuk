import nodemailer from 'nodemailer';

export async function sendVerificationEmail(to: string, userName: string, verificationLink: string) {
  try {
    console.log('📧 DIRECT_EMAIL: Sending verification email to:', to);

    // Check if email credentials are configured
    const emailUser = process.env.EMAIL_SERVER_USER;
    const emailPass = process.env.EMAIL_SERVER_PASSWORD;

    if (!emailUser || !emailPass) {
      throw new Error('SMTP credentials not configured');
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">EasyBuk</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333;">Hi ${userName || 'there'}! 👋</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            Please verify your email address to complete your EasyBuk account setup.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" 
               style="background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Verify Email Address
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${verificationLink}" style="color: #007bff;">${verificationLink}</a>
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
    `;

    const mailOptions = {
      from: `"EasyBuk" <${emailUser}>`,
      to: to,
      subject: '✉️ Verify Your EasyBuk Account Email',
      html: htmlContent
    };

    console.log('📧 DIRECT_EMAIL: Sending email via SMTP...');
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ DIRECT_EMAIL: Email sent successfully:', result.messageId);

    return {
      success: true,
      messageId: result.messageId
    };

  } catch (error) {
    console.error('❌ DIRECT_EMAIL: Error sending email:', error);
    throw error;
  }
} 