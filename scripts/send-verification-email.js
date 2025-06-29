const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function sendVerificationEmail(userEmail) {
    try {
        console.log('📧 Manually sending verification email to:', userEmail);
        
        // Find the user
        const user = await prisma.user.findUnique({
            where: { email: userEmail }
        });

        if (!user) {
            console.error('❌ User not found:', userEmail);
            return;
        }

        console.log('👤 User found:', user.name, '- Verified:', user.emailVerified ? 'Yes' : 'No');

        // Generate verification token
        const verificationToken = `VER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Store verification token in database
        await prisma.verificationToken.create({
            data: {
                id: `VTOKEN_${Date.now()}`,
                identifier: user.email,
                token: verificationToken,
                type: 'EMAIL_VERIFICATION',
                expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
                userId: user.id
            }
        });

        console.log('✅ Verification token created:', verificationToken);

        // Create verification link
        const verificationLink = `http://localhost:3000/auth/verify-email?token=${verificationToken}`;
        console.log('🔗 Verification link:', verificationLink);

        // Check if SMTP is configured
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.log('📧 SMTP not configured - Email would be sent to:', user.email);
            console.log('📋 Email template: email_verification');
            console.log('📝 Data:');
            console.log('  userName:', user.name);
            console.log('  verificationLink:', verificationLink);
            console.log('');
            console.log('🎯 To test manually, visit:', verificationLink);
            return;
        }

        // If SMTP is configured, we could send the actual email here
        console.log('📧 SMTP configured - would send real email');

    } catch (error) {
        console.error('❌ Error sending verification email:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Get email from command line argument
const userEmail = process.argv[2];

if (!userEmail) {
    console.error('❌ Please provide a user email:');
    console.log('📝 Usage: node scripts/send-verification-email.js user@example.com');
    process.exit(1);
}

sendVerificationEmail(userEmail); 