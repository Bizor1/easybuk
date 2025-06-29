const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createUserProfileLinks() {
    try {
        console.log('🔗 Creating missing user profile links...\n');
        
        // Get the specific user who is logged in
        const user = await prisma.user.findFirst({
            where: { email: 'ebenezernachinabapplications@gmail.com' },
            include: {
                UserClientProfile: true,
                UserProviderProfile: true
            }
        });

        if (!user) {
            console.log('❌ User not found');
            return;
        }

        console.log(`✅ Found user: ${user.name} (${user.email})`);
        console.log(`   Roles: ${user.roles.join(', ')}`);
        console.log(`   Existing Client Profiles: ${user.UserClientProfile.length}`);
        console.log(`   Existing Provider Profiles: ${user.UserProviderProfile.length}`);
        console.log('');

        // Get the client record with the same email
        const client = await prisma.client.findFirst({
            where: { email: user.email }
        });

        if (!client) {
            console.log('❌ No client record found with matching email');
            return;
        }

        console.log(`✅ Found client record: ${client.name} (${client.email})`);
        console.log('');

        // Check if UserClientProfile already exists
        const existingClientProfile = await prisma.userClientProfile.findFirst({
            where: {
                userId: user.id,
                clientId: client.id
            }
        });

        if (existingClientProfile) {
            console.log('✅ UserClientProfile already exists');
        } else {
            // Create the missing UserClientProfile
            const clientProfile = await prisma.userClientProfile.create({
                data: {
                    id: `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    userId: user.id,
                    clientId: client.id
                }
            });
            console.log(`✅ Created UserClientProfile: ${clientProfile.id}`);
            
            // Ensure user has CLIENT role
            if (!user.roles.includes('CLIENT')) {
                await prisma.user.update({
                    where: { id: user.id },
                    data: { roles: [...user.roles, 'CLIENT'] }
                });
                console.log(`✅ Added CLIENT role to user`);
            }
        }

        console.log('\n🎉 Profile linking complete!');
        console.log('✨ Now refresh your client dashboard - the booking should appear!');
        console.log('💳 You should see the CONFIRMED booking with a "Complete Payment" button');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createUserProfileLinks(); 