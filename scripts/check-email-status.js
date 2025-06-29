const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkEmailStatus() {
    try {
        console.log('📧 Checking email verification status for all users...\n');
        
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                emailVerified: true,
                roles: true,
                createdAt: true
            },
            orderBy: { createdAt: 'desc' }
        });

        console.log(`Found ${users.length} users:\n`);

        users.forEach((user, index) => {
            console.log(`${index + 1}. ${user.email}`);
            console.log(`   Name: ${user.name || 'Not set'}`);
            console.log(`   ID: ${user.id}`);
            console.log(`   Email Verified: ${user.emailVerified ? '✅ Yes' : '❌ No'}`);
            console.log(`   Roles: ${user.roles.join(', ')}`);
            console.log(`   Created: ${user.createdAt.toLocaleString()}`);
            console.log('');
        });

        // Check for unverified users specifically
        const unverifiedUsers = users.filter(user => !user.emailVerified);
        
        if (unverifiedUsers.length > 0) {
            console.log(`\n🚨 ${unverifiedUsers.length} users need email verification:`);
            unverifiedUsers.forEach((user, index) => {
                console.log(`${index + 1}. ${user.email} (${user.name || 'No name'})`);
            });
            
            // Check verification tokens for unverified users
            console.log('\n🎫 Checking verification tokens...');
            for (const user of unverifiedUsers) {
                const tokens = await prisma.verificationToken.findMany({
                    where: { 
                        userId: user.id,
                        type: 'EMAIL_VERIFICATION'
                    },
                    orderBy: { createdAt: 'desc' }
                });
                
                console.log(`\n📧 ${user.email}:`);
                if (tokens.length === 0) {
                    console.log('   ❌ No verification tokens found');
                } else {
                    tokens.forEach((token, idx) => {
                        const isExpired = new Date() > token.expires;
                        console.log(`   ${idx + 1}. Token: ${token.token.substring(0, 20)}...`);
                        console.log(`      Created: ${token.createdAt.toLocaleString()}`);
                        console.log(`      Expires: ${token.expires.toLocaleString()}`);
                        console.log(`      Status: ${isExpired ? '❌ Expired' : '✅ Valid'}`);
                        console.log(`      Used: ${token.used ? 'Yes' : 'No'}`);
                    });
                }
            }
        } else {
            console.log('✅ All users have verified emails!');
        }

    } catch (error) {
        console.error('❌ Error checking email status:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkEmailStatus(); 