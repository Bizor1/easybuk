const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testNotifications() {
    try {
        console.log('🧪 Testing direct notification creation...');

        // First, let's see what entities exist in the database
        console.log('\n📊 Checking existing entities...');
        
        const clients = await prisma.client.findMany({
            take: 5,
            select: { id: true, email: true }
        });
        console.log('Clients found:', clients.length, clients);

        const providers = await prisma.serviceProvider.findMany({
            take: 5,
            select: { id: true, email: true }
        });
        console.log('Providers found:', providers.length, providers);

        const admins = await prisma.admin.findMany({
            take: 5,
            select: { id: true, email: true }
        });
        console.log('Admins found:', admins.length, admins);

        // Try to create test notifications for available entities
        if (providers.length > 0) {
            console.log('\n📝 Creating test notification for provider...');
            
            const testNotificationProvider = await prisma.notification.create({
                data: {
                    id: `test_notif_provider_${Date.now()}`,
                    userId: providers[0].id, // Use first provider's ID
                    userType: 'PROVIDER',
                    type: 'SYSTEM_ANNOUNCEMENT',
                    title: 'Test Provider Notification 🧪',
                    message: 'This is a test notification for a provider created directly by script',
                    data: JSON.stringify({
                        test: true,
                        createdBy: 'debug script',
                        userType: 'PROVIDER',
                        timestamp: new Date().toISOString()
                    }),
                    sentViaEmail: false,
                    sentViaSMS: false
                }
            });

            console.log('✅ Provider test notification created successfully!');
            console.log('Notification ID:', testNotificationProvider.id);
            console.log('For Provider ID:', testNotificationProvider.userId);
        }

        if (admins.length > 0) {
            console.log('\n📝 Creating test notification for admin...');
            
            const testNotificationAdmin = await prisma.notification.create({
                data: {
                    id: `test_notif_admin_${Date.now()}`,
                    userId: admins[0].id, // Use first admin's ID
                    userType: 'ADMIN',
                    type: 'SYSTEM_ANNOUNCEMENT',
                    title: 'Test Admin Notification 🧪',
                    message: 'This is a test notification for an admin created directly by script',
                    data: JSON.stringify({
                        test: true,
                        createdBy: 'debug script',
                        userType: 'ADMIN',
                        timestamp: new Date().toISOString()
                    }),
                    sentViaEmail: false,
                    sentViaSMS: false
                }
            });

            console.log('✅ Admin test notification created successfully!');
            console.log('Notification ID:', testNotificationAdmin.id);
            console.log('For Admin ID:', testNotificationAdmin.userId);
        }

        // Check if any notifications exist now
        console.log('\n📋 Checking all notifications in database...');
        const allNotifications = await prisma.notification.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                userId: true,
                userType: true,
                title: true,
                message: true,
                isRead: true,
                createdAt: true
            }
        });
        
        console.log(`Found ${allNotifications.length} notifications:`);
        allNotifications.forEach((notif, index) => {
            console.log(`${index + 1}. [${notif.userType}] ${notif.title} (User: ${notif.userId})`);
        });

        if (allNotifications.length === 0) {
            console.log('❌ NO NOTIFICATIONS FOUND IN DATABASE!');
            console.log('This confirms that notification creation is failing completely.');
        }

    } catch (error) {
        console.error('❌ Error testing notifications:', error);
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            meta: error.meta
        });
    } finally {
        await prisma.$disconnect();
    }
}

testNotifications(); 