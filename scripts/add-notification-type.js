const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addNotificationType() {
    try {
        console.log('Adding PRE_BOOKING_INQUIRY to NotificationType enum...');

        // Use raw SQL to add the enum value
        await prisma.$executeRaw`
            ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'PRE_BOOKING_INQUIRY';
        `;

        console.log('✅ Successfully added PRE_BOOKING_INQUIRY to NotificationType enum');
        console.log('The messaging system should now work properly.');

    } catch (error) {
        console.error('Error adding notification type:', error);
        
        // Check if it already exists
        if (error.message.includes('already exists')) {
            console.log('✅ PRE_BOOKING_INQUIRY already exists in the enum');
        } else {
            throw error;
        }
    } finally {
        await prisma.$disconnect();
    }
}

addNotificationType(); 