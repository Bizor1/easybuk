const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUsers() {
    try {
        console.log('👥 Checking all users in database...');
        
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                roles: true,
                createdAt: true
            }
        });
        
        console.log(`Found ${users.length} users:`);
        users.forEach((user, index) => {
            console.log(`${index + 1}. ${user.email} - ${user.name || 'No name'} - Roles: [${user.roles.join(', ')}]`);
            console.log(`   ID: ${user.id}`);
            console.log(`   Created: ${user.createdAt}`);
            console.log('');
        });

        if (users.length === 0) {
            console.log('❌ No users found in database! You need to sign up first.');
        }

        // Check profiles
        console.log('👤 Checking client profiles...');
        const clients = await prisma.client.findMany({
            select: { id: true, email: true }
        });
        console.log('Clients:', clients);

        console.log('🏢 Checking provider profiles...');
        const providers = await prisma.serviceProvider.findMany({
            select: { id: true, email: true }
        });
        console.log('Providers:', providers);

        console.log('👑 Checking admin profiles...');
        const admins = await prisma.admin.findMany({
            select: { id: true, email: true }
        });
        console.log('Admins:', admins);

    } catch (error) {
        console.error('❌ Error checking users:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkUsers(); 