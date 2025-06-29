import nodemailer from 'nodemailer';

export interface BookingEmailData {
  bookingId: string;
  clientName: string;
  clientEmail: string;
  providerName: string;
  providerEmail: string;
  serviceTitle: string;
  scheduledDate: string;
  scheduledTime: string;
  location: string;
  totalAmount: number;
  currency: string;
}

// Create transporter using environment variables
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  });
};

// Email templates
const createClientConfirmationEmail = (data: BookingEmailData) => {
  return {
    subject: `Booking Confirmation - ${data.serviceTitle}`,
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background: #f8f9fa;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">Booking Confirmed! ✅</h1>
          <p style="margin: 10px 0 0; font-size: 16px; opacity: 0.9;">Your service has been successfully booked</p>
        </div>
        
        <div style="padding: 30px; background: white;">
          <h2 style="color: #333; margin-top: 0;">Hi ${data.clientName},</h2>
          
          <p style="color: #555; line-height: 1.6;">
            Great news! Your booking has been confirmed and payment processed successfully. 
            Here are your booking details:
          </p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #495057; margin-top: 0;">Booking Details</h3>
            <p style="margin: 0; color: #666; line-height: 1.8;">
              <strong>Service:</strong> ${data.serviceTitle}<br>
              <strong>Provider:</strong> ${data.providerName}<br>
              <strong>Date:</strong> ${new Date(data.scheduledDate).toLocaleDateString()}<br>
              <strong>Time:</strong> ${data.scheduledTime}<br>
              <strong>Location:</strong> ${data.location}<br>
              <strong>Total Amount:</strong> ${data.currency} ${data.totalAmount}<br>
              <strong>Booking ID:</strong> ${data.bookingId}
            </p>
          </div>
          
          <div style="background: #e7f3ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #007bff;">
            <h3 style="color: #007bff; margin-top: 0;">Next Steps</h3>
            <ul style="color: #666; margin: 0; padding-left: 20px;">
              <li>Your provider will confirm the booking shortly</li>
              <li>You'll receive their contact details once confirmed</li>
              <li>Check your dashboard for updates</li>
              <li>Contact support if you have any questions</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}/client/dashboard" 
               style="background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              View Booking Details
            </a>
          </div>
        </div>
        
        <div style="padding: 20px; text-align: center; color: #888; background: #e9ecef;">
          <p style="margin: 0; font-size: 14px;">
            Thanks for choosing EasyBuk! Need help? Reply to this email or contact our support team.
          </p>
        </div>
      </div>
    `
  };
};

const createProviderNotificationEmail = (data: BookingEmailData) => {
  return {
    subject: `New Booking Request - ${data.serviceTitle}`,
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background: #f8f9fa;">
        <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">New Booking Request! 🔔</h1>
          <p style="margin: 10px 0 0; font-size: 16px; opacity: 0.9;">You have a new service booking request</p>
        </div>
        
        <div style="padding: 30px; background: white;">
          <h2 style="color: #333; margin-top: 0;">Hi ${data.providerName},</h2>
          
          <p style="color: #555; line-height: 1.6;">
            You have received a new booking request! Please review the details below and confirm your availability.
          </p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #495057; margin-top: 0;">Booking Request Details</h3>
            <p style="margin: 0; color: #666; line-height: 1.8;">
              <strong>Service:</strong> ${data.serviceTitle}<br>
              <strong>Client:</strong> ${data.clientName}<br>
              <strong>Date:</strong> ${new Date(data.scheduledDate).toLocaleDateString()}<br>
              <strong>Time:</strong> ${data.scheduledTime}<br>
              <strong>Location:</strong> ${data.location}<br>
              <strong>Amount:</strong> ${data.currency} ${data.totalAmount}<br>
              <strong>Booking ID:</strong> ${data.bookingId}
            </p>
          </div>
          
          <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <h3 style="color: #856404; margin-top: 0;">⚡ Action Required</h3>
            <p style="color: #856404; margin: 0;">
              Please log in to your dashboard to accept or decline this booking request. 
              Quick response helps maintain your service rating!
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}/provider/bookings" 
               style="background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; margin-right: 10px;">
              Accept Booking
            </a>
            <a href="${process.env.NEXTAUTH_URL}/provider/dashboard" 
               style="background: #6c757d; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              View Dashboard
            </a>
          </div>
        </div>
        
        <div style="padding: 20px; text-align: center; color: #888; background: #e9ecef;">
          <p style="margin: 0; font-size: 14px;">
            EasyBuk Provider System - Respond quickly to maintain your service rating!
          </p>
        </div>
      </div>
    `
  };
};

// Email templates for booking REQUESTS
const createClientBookingRequestEmail = (data: BookingEmailData) => {
  return {
    subject: `Booking Request Sent - ${data.serviceTitle}`,
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background: #f8f9fa;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">Request Sent! 📨</h1>
          <p style="margin: 10px 0 0; font-size: 16px; opacity: 0.9;">Your booking request has been sent to the provider</p>
        </div>
        
        <div style="padding: 30px; background: white;">
          <h2 style="color: #333; margin-top: 0;">Hi ${data.clientName},</h2>
          
          <p style="color: #555; line-height: 1.6;">
            Great! Your booking request has been sent to <strong>${data.providerName}</strong>. 
            They will review your request and respond soon.
          </p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #495057; margin-top: 0;">Request Details</h3>
            <p style="margin: 0; color: #666; line-height: 1.8;">
              <strong>Service:</strong> ${data.serviceTitle}<br>
              <strong>Provider:</strong> ${data.providerName}<br>
              <strong>Requested Date:</strong> ${new Date(data.scheduledDate).toLocaleDateString()}<br>
              <strong>Requested Time:</strong> ${data.scheduledTime}<br>
              <strong>Location:</strong> ${data.location}<br>
              <strong>Estimated Amount:</strong> ${data.currency} ${data.totalAmount}<br>
              <strong>Request ID:</strong> ${data.bookingId}
            </p>
          </div>
          
          <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <h3 style="color: #856404; margin-top: 0;">⏳ What Happens Next?</h3>
            <ul style="color: #856404; margin: 0; padding-left: 20px;">
              <li>The provider will review your request</li>
              <li>You'll get notified when they respond (usually within 24 hours)</li>
              <li>If accepted, you'll be prompted to complete payment</li>
              <li>Your service will then be confirmed</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}/client/dashboard" 
               style="background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Track Request Status
            </a>
          </div>
        </div>
        
        <div style="padding: 20px; text-align: center; color: #888; background: #e9ecef;">
          <p style="margin: 0; font-size: 14px;">
            Thanks for using EasyBuk! Need help? Reply to this email or contact our support team.
          </p>
        </div>
      </div>
    `
  };
};

const createProviderBookingRequestEmail = (data: BookingEmailData, specialRequests: string) => {
  return {
    subject: `New Booking Request - ${data.serviceTitle}`,
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background: #f8f9fa;">
        <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">New Booking Request! 🔔</h1>
          <p style="margin: 10px 0 0; font-size: 16px; opacity: 0.9;">A client wants to book your service</p>
        </div>
        
        <div style="padding: 30px; background: white;">
          <h2 style="color: #333; margin-top: 0;">Hi ${data.providerName},</h2>
          
          <p style="color: #555; line-height: 1.6;">
            You have received a new booking request! Please review the details below and respond as soon as possible.
          </p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #495057; margin-top: 0;">Request Details</h3>
            <p style="margin: 0; color: #666; line-height: 1.8;">
              <strong>Service:</strong> ${data.serviceTitle}<br>
              <strong>Client:</strong> ${data.clientName}<br>
              <strong>Requested Date:</strong> ${new Date(data.scheduledDate).toLocaleDateString()}<br>
              <strong>Requested Time:</strong> ${data.scheduledTime}<br>
              <strong>Location:</strong> ${data.location}<br>
              <strong>Service Fee:</strong> ${data.currency} ${data.totalAmount}<br>
              <strong>Request ID:</strong> ${data.bookingId}
            </p>
            ${specialRequests ? `
              <div style="margin-top: 15px; padding: 15px; background: #e7f3ff; border-radius: 6px; border-left: 3px solid #007bff;">
                <strong style="color: #007bff;">Special Requests:</strong><br>
                <span style="color: #666;">${specialRequests}</span>
              </div>
            ` : ''}
          </div>
          
          <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <h3 style="color: #856404; margin-top: 0;">⚡ Action Required</h3>
            <p style="color: #856404; margin: 0;">
              Please respond within 24 hours to maintain your response rating. 
              Payment will only be processed after you accept the request.
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}/provider/bookings" 
               style="background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; margin-right: 10px;">
              Accept Request
            </a>
            <a href="${process.env.NEXTAUTH_URL}/provider/bookings" 
               style="background: #dc3545; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Decline Request
            </a>
          </div>
        </div>
        
        <div style="padding: 20px; text-align: center; color: #888; background: #e9ecef;">
          <p style="margin: 0; font-size: 14px;">
            EasyBuk Provider System - Quick response helps maintain your service rating!
          </p>
        </div>
      </div>
    `
  };
};

export class EmailService {
  static async sendBookingEmails(data: BookingEmailData) {
    try {
      const transporter = createTransporter();

      // Prepare emails
      const clientEmail = createClientConfirmationEmail(data);
      const providerEmail = createProviderNotificationEmail(data);

      // Send emails in parallel
      const [clientResult, providerResult] = await Promise.all([
        transporter.sendMail({
          from: process.env.EMAIL_SERVER_USER,
          to: data.clientEmail,
          subject: clientEmail.subject,
          html: clientEmail.html
        }),
        transporter.sendMail({
          from: process.env.EMAIL_SERVER_USER,
          to: data.providerEmail,
          subject: providerEmail.subject,
          html: providerEmail.html
        })
      ]);

      console.log('✅ Client email sent:', clientResult.messageId);
      console.log('✅ Provider email sent:', providerResult.messageId);

      return {
        success: true,
        clientEmailSent: true,
        providerEmailSent: true,
        clientMessageId: clientResult.messageId,
        providerMessageId: providerResult.messageId
      };

    } catch (error) {
      console.error('❌ Email sending failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        clientEmailSent: false,
        providerEmailSent: false
      };
    }
  }

  // NEW: Booking request emails (different messaging)
  static async sendBookingRequestEmails(data: BookingEmailData, specialRequests: string = '') {
    try {
      const transporter = createTransporter();

      // Prepare emails for booking REQUEST
      const clientEmail = createClientBookingRequestEmail(data);
      const providerEmail = createProviderBookingRequestEmail(data, specialRequests);

      // Send emails in parallel
      const [clientResult, providerResult] = await Promise.all([
        transporter.sendMail({
          from: process.env.EMAIL_SERVER_USER,
          to: data.clientEmail,
          subject: clientEmail.subject,
          html: clientEmail.html
        }),
        transporter.sendMail({
          from: process.env.EMAIL_SERVER_USER,
          to: data.providerEmail,
          subject: providerEmail.subject,
          html: providerEmail.html
        })
      ]);

      console.log('✅ Client request email sent:', clientResult.messageId);
      console.log('✅ Provider request email sent:', providerResult.messageId);

      return {
        success: true,
        clientEmailSent: true,
        providerEmailSent: true,
        clientMessageId: clientResult.messageId,
        providerMessageId: providerResult.messageId
      };

    } catch (error) {
      console.error('❌ Request email sending failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        clientEmailSent: false,
        providerEmailSent: false
      };
    }
  }

  static async sendServiceCompletionConfirmationEmail(data: BookingEmailData) {
    try {
      const transporter = createTransporter();

      // Email to client asking for confirmation
      const clientEmailTemplate = {
        subject: `Service Completed - Please Confirm - ${data.serviceTitle}`,
        html: `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background: #f8f9fa;">
            <div style="background: linear-gradient(135deg, #6f42c1 0%, #e83e8c 100%); color: white; padding: 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px;">Service Completed! ⏰</h1>
              <p style="margin: 10px 0 0; font-size: 16px; opacity: 0.9;">Please confirm or report any issues</p>
            </div>
            
            <div style="padding: 30px; background: white;">
              <h2 style="color: #333; margin-top: 0;">Hi ${data.clientName},</h2>
              
              <p style="color: #555; line-height: 1.6;">
                <strong>${data.providerName}</strong> has marked your service as completed. 
                Please review the service and confirm if you're satisfied with the work.
              </p>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #495057; margin-top: 0;">Service Details</h3>
                <p style="margin: 0; color: #666; line-height: 1.8;">
                  <strong>Service:</strong> ${data.serviceTitle}<br>
                  <strong>Provider:</strong> ${data.providerName}<br>
                  <strong>Date:</strong> ${new Date(data.scheduledDate).toLocaleDateString()}<br>
                  <strong>Time:</strong> ${data.scheduledTime}<br>
                  <strong>Amount:</strong> ${data.currency} ${data.totalAmount}<br>
                  <strong>Booking ID:</strong> ${data.bookingId}
                </p>
              </div>
              
              <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
                <h3 style="color: #856404; margin-top: 0;">⚡ Action Required (48 hours)</h3>
                <p style="color: #856404; margin: 0;">
                  Please confirm the service completion or report any issues within 48 hours. 
                  If no action is taken, the service will be automatically confirmed and payment released.
                </p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXTAUTH_URL}/client/dashboard" 
                   style="background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; margin-right: 10px;">
                  Confirm Service
                </a>
                <a href="${process.env.NEXTAUTH_URL}/client/dashboard" 
                   style="background: #dc3545; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                  Report Issue
                </a>
              </div>
            </div>
            
            <div style="padding: 20px; text-align: center; color: #888; background: #e9ecef;">
              <p style="margin: 0; font-size: 14px;">
                Your feedback helps maintain service quality. Payment will be released after confirmation.
              </p>
            </div>
          </div>
        `
      };

      // Email to provider notifying completion
      const providerEmailTemplate = {
        subject: `Service Marked Complete - Awaiting Client Confirmation - ${data.serviceTitle}`,
        html: `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background: #f8f9fa;">
            <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px;">Service Completed! ✅</h1>
              <p style="margin: 10px 0 0; font-size: 16px; opacity: 0.9;">Awaiting client confirmation</p>
            </div>
            
            <div style="padding: 30px; background: white;">
              <h2 style="color: #333; margin-top: 0;">Hi ${data.providerName},</h2>
              
              <p style="color: #555; line-height: 1.6;">
                You have successfully marked the service as completed. The client has been notified 
                and has 48 hours to confirm or report any issues.
              </p>
              
              <div style="background: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
                <h3 style="color: #155724; margin-top: 0;">💰 Payment Release</h3>
                <p style="color: #155724; margin: 0;">
                  Your payment will be released once the client confirms the service completion, 
                  or automatically after 48 hours if no issues are reported.
                </p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXTAUTH_URL}/provider/dashboard" 
                   style="background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                  View Dashboard
                </a>
              </div>
            </div>
            
            <div style="padding: 20px; text-align: center; color: #888; background: #e9ecef;">
              <p style="margin: 0; font-size: 14px;">
                Thank you for providing quality service! Your payment will be processed soon.
              </p>
            </div>
          </div>
        `
      };

      // Send emails
      await Promise.all([
        transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to: data.clientEmail,
          ...clientEmailTemplate
        }),
        transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to: data.providerEmail,
          ...providerEmailTemplate
        })
      ]);

      console.log('✅ Service completion confirmation emails sent successfully');
      return { success: true };

    } catch (error) {
      console.error('❌ Failed to send service completion emails:', error);
      return { success: false, error };
    }
  }

  static async sendClientConfirmationEmails(data: BookingEmailData & { action: 'ACCEPT' | 'DISPUTE'; message?: string }) {
    try {
      const transporter = createTransporter();

      if (data.action === 'ACCEPT') {
        // Email to provider: client confirmed
        const providerEmailTemplate = {
          subject: `Payment Released - Service Confirmed - ${data.serviceTitle}`,
          html: `
            <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background: #f8f9fa;">
              <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center;">
                <h1 style="margin: 0; font-size: 28px;">Payment Released! 💰</h1>
                <p style="margin: 10px 0 0; font-size: 16px; opacity: 0.9;">Client has confirmed service completion</p>
              </div>
              
              <div style="padding: 30px; background: white;">
                <h2 style="color: #333; margin-top: 0;">Hi ${data.providerName},</h2>
                
                <p style="color: #555; line-height: 1.6;">
                  Great news! <strong>${data.clientName}</strong> has confirmed that the service was completed satisfactorily. 
                  Your payment has been released and will appear in your account shortly.
                </p>
                
                <div style="background: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
                  <h3 style="color: #155724; margin-top: 0;">💸 Payment Details</h3>
                  <p style="color: #155724; margin: 0;">
                    <strong>Amount:</strong> ${data.currency} ${data.totalAmount}<br>
                    <strong>Service:</strong> ${data.serviceTitle}<br>
                    <strong>Client:</strong> ${data.clientName}
                  </p>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${process.env.NEXTAUTH_URL}/provider/earnings" 
                     style="background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                    View Earnings
                  </a>
                </div>
              </div>
            </div>
          `
        };

        await transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to: data.providerEmail,
          ...providerEmailTemplate
        });

      } else {
        // Email to both parties: dispute created
        const disputeEmailTemplate = {
          subject: `Service Dispute Created - ${data.serviceTitle}`,
          html: `
            <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background: #f8f9fa;">
              <div style="background: linear-gradient(135deg, #ffc107 0%, #fd7e14 100%); color: white; padding: 30px; text-align: center;">
                <h1 style="margin: 0; font-size: 28px;">Dispute Created ⚠️</h1>
                <p style="margin: 10px 0 0; font-size: 16px; opacity: 0.9;">Our team will review and resolve this matter</p>
              </div>
              
              <div style="padding: 30px; background: white;">
                <p style="color: #555; line-height: 1.6;">
                  A dispute has been created for the service booking. Our customer service team will review 
                  the matter and contact both parties within 24-48 hours to resolve the issue.
                </p>
                
                ${data.message ? `
                <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
                  <h3 style="color: #856404; margin-top: 0;">Client's Concern</h3>
                  <p style="color: #856404; margin: 0;">${data.message}</p>
                </div>
                ` : ''}
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${process.env.NEXTAUTH_URL}/support" 
                     style="background: #ffc107; color: #212529; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                    Contact Support
                  </a>
                </div>
              </div>
            </div>
          `
        };

        await Promise.all([
          transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: data.clientEmail,
            ...disputeEmailTemplate
          }),
          transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: data.providerEmail,
            ...disputeEmailTemplate
          })
        ]);
      }

      console.log(`✅ Client ${data.action.toLowerCase()} emails sent successfully`);
      return { success: true };

    } catch (error) {
      console.error(`❌ Failed to send client ${data.action.toLowerCase()} emails:`, error);
      return { success: false, error };
    }
  }

  static async sendStatusUpdateEmail(data: BookingEmailData & { newStatus: string; updateMessage: string }) {
    try {
      const transporter = createTransporter();

      const statusEmail = {
        subject: `Booking Update - ${data.serviceTitle}`,
        html: `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
            <h2>Booking Status Update</h2>
            <p>Hi ${data.clientName},</p>
            <p>Your booking status has been updated:</p>
            <div style="background: #f8f9fa; padding: 20px; margin: 20px 0;">
              <p><strong>Status:</strong> ${data.newStatus}</p>
              <p><strong>Message:</strong> ${data.updateMessage}</p>
              <p><strong>Booking ID:</strong> ${data.bookingId}</p>
            </div>
          </div>
        `
      };

      const result = await transporter.sendMail({
        from: process.env.EMAIL_SERVER_USER,
        to: data.clientEmail,
        subject: statusEmail.subject,
        html: statusEmail.html
      });

      console.log('✅ Status update email sent:', result.messageId);
      return { success: true, messageId: result.messageId };

    } catch (error) {
      console.error('❌ Status email sending failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
} 