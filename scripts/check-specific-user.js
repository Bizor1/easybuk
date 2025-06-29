const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUser() {
    try {
        const userId = 'cec8c0a2-b226-40fc-b082-9d56dd648cbe';
        
        console.log('🔍 Looking for user:', userId);
        
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                UserClientProfile: {
                    include: { Client: true }
                },
                UserProviderProfile: {
                    include: { ServiceProvider: true }
                },
                UserAdminProfile: {
                    include: { Admin: true }
                }
            }
        });

        if (!user) {
            console.log('❌ User not found with ID:', userId);
            
            // Try to find any users with pending email verification
            const unverifiedUsers = await prisma.user.findMany({
                where: { emailVerified: false },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    emailVerified: true,
                    createdAt: true
                }
            });
            
            console.log('\n📧 Unverified users:');
            unverifiedUsers.forEach((u, index) => {
                console.log(`${index + 1}. ${u.email} - ${u.name} - ID: ${u.id}`);
                console.log(`   Created: ${u.createdAt}`);
            });
            
            return;
        }

        console.log('✅ User found!');
        console.log('📧 Email:', user.email);
        console.log('👤 Name:', user.name);
        console.log('✉️ Email Verified:', user.emailVerified ? 'Yes' : 'No');
        console.log('📅 Created:', user.createdAt);
        console.log('🏷️ Roles:', user.roles);
        
        if (user.UserClientProfile) {
            console.log('🛍️ Has Client profile');
        }
        if (user.UserProviderProfile) {
            console.log('🔧 Has Service Provider profile');
        }
        if (user.UserAdminProfile) {
            console.log('👨‍💼 Has Admin profile');
        }

        // Check verification tokens
        const tokens = await prisma.verificationToken.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' }
        });

        console.log('\n🎫 Verification tokens:');
        if (tokens.length === 0) {
            console.log('   No verification tokens found');
        } else {
            tokens.forEach((token, index) => {
                console.log(`   ${index + 1}. Type: ${token.type}, Expires: ${token.expires}`);
                console.log(`      Token: ${token.token.substring(0, 20)}...`);
            });
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkUser(); 