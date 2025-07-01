const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

async function testSignupDebug() {
  console.log('🧪 Testing signup process with debug info...');
  
  const testData = {
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User',
    role: 'CLIENT'
  };

  try {
    console.log('📝 Test signup data:', testData);

    // Check if user already exists
    console.log('🔍 Checking if user exists...');
    const existingUser = await prisma.user.findUnique({
      where: { email: testData.email },
    });

    if (existingUser) {
      console.log('❌ User already exists, cleaning up first...');
      // Delete related records first due to foreign key constraints
      await prisma.userClientProfile.deleteMany({
        where: { userId: existingUser.id }
      });
      await prisma.user.delete({
        where: { id: existingUser.id }
      });
      console.log('✅ Existing user cleaned up');
    }

    // Hash password
    console.log('🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash(testData.password, 12);
    console.log('✅ Password hashed successfully');

    // Create user in transaction
    console.log('💾 Creating user in transaction...');
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      console.log('👤 Creating user record...');
      const user = await tx.user.create({
        data: {
          id: uuidv4(),
          email: testData.email,
          password: hashedPassword,
          name: testData.name,
          roles: [testData.role],
          emailVerified: null,
          phoneVerified: false,
          status: 'PENDING_VERIFICATION',
          lastActive: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      console.log('✅ User created:', user.id);

      // Create client profile and wallet
      if (testData.role === 'CLIENT') {
        console.log('🏠 Creating client record...');
        const client = await tx.client.create({
          data: {
            id: uuidv4(),
            email: testData.email,
            name: testData.name,
            phoneVerified: false,
            status: 'PENDING_VERIFICATION',
            country: 'Ghana',
            profileCompleted: false,
            lastActive: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
        console.log('✅ Client created:', client.id);

        console.log('🔗 Creating user-client profile link...');
        await tx.userClientProfile.create({
          data: {
            id: uuidv4(),
            userId: user.id,
            clientId: client.id,
            createdAt: new Date(),
          },
        });
        console.log('✅ User-client profile link created');

        console.log('💰 Creating client wallet...');
        await tx.clientWallet.create({
          data: {
            id: uuidv4(),
            clientId: client.id,
            balance: 0.0,
            currency: 'GHS',
            escrowBalance: 0.0,
            canWithdraw: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
        console.log('✅ Client wallet created');
      }

      return user;
    });

    console.log('🎉 Signup successful! User ID:', result.id);
    console.log('📧 User email:', result.email);
    console.log('👤 User name:', result.name);
    console.log('🏷️ User roles:', result.roles);

  } catch (error) {
    console.error('❌ Signup debug error:', error);
    console.error('📊 Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      meta: error.meta
    });
  } finally {
    await prisma.$disconnect();
  }
}

testSignupDebug(); 