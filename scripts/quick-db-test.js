const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

async function quickDbTest() {
  console.log('🧪 Quick database test for signup operations...');
  
  const testEmail = 'quicktest' + Date.now() + '@example.com';
  
  try {
    // Test 1: Database connection
    console.log('1️⃣ Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connected');

    // Test 2: Check user existence (should not exist)
    console.log('2️⃣ Testing user existence check...');
    const existingUser = await prisma.user.findUnique({
      where: { email: testEmail },
    });
    console.log('✅ User existence check completed:', !!existingUser);

    // Test 3: Password hashing
    console.log('3️⃣ Testing password hashing...');
    const hashedPassword = await bcrypt.hash('testpass123', 12);
    console.log('✅ Password hashed successfully, length:', hashedPassword.length);

    // Test 4: UUID generation
    console.log('4️⃣ Testing UUID generation...');
    const testUuid = uuidv4();
    console.log('✅ UUID generated:', testUuid);

    // Test 5: Simple user creation (no transaction)
    console.log('5️⃣ Testing simple user creation...');
    const user = await prisma.user.create({
      data: {
        id: uuidv4(),
        email: testEmail,
        password: hashedPassword,
        name: 'Test User',
        roles: ['CLIENT'],
        emailVerified: null,
        phoneVerified: false,
        status: 'PENDING_VERIFICATION',
        lastActive: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    console.log('✅ User created with ID:', user.id);

    // Test 6: Client creation
    console.log('6️⃣ Testing client creation...');
    const client = await prisma.client.create({
      data: {
        id: uuidv4(),
        email: testEmail,
        name: 'Test User',
        phoneVerified: false,
        status: 'PENDING_VERIFICATION',
        country: 'Ghana',
        profileCompleted: false,
        lastActive: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    console.log('✅ Client created with ID:', client.id);

    // Test 7: User-Client profile link
    console.log('7️⃣ Testing user-client profile link...');
    const userClientProfile = await prisma.userClientProfile.create({
      data: {
        id: uuidv4(),
        userId: user.id,
        clientId: client.id,
        createdAt: new Date(),
      },
    });
    console.log('✅ User-client profile link created');

    // Test 8: Client wallet
    console.log('8️⃣ Testing client wallet creation...');
    const wallet = await prisma.clientWallet.create({
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

    console.log('\n🎉 ALL DATABASE OPERATIONS SUCCESSFUL!');
    console.log('💡 The database and schema are working correctly.');
    console.log('💡 The issue might be in the server environment or API route.');

    // Cleanup
    console.log('\n🧹 Cleaning up test data...');
    await prisma.clientWallet.delete({ where: { id: wallet.id } });
    await prisma.userClientProfile.delete({ where: { id: userClientProfile.id } });
    await prisma.client.delete({ where: { id: client.id } });
    await prisma.user.delete({ where: { id: user.id } });
    console.log('✅ Test data cleaned up');

  } catch (error) {
    console.error('❌ Database test failed:', error);
    console.error('📊 Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      meta: error.meta
    });

    if (error.stack) {
      console.error('📚 Stack trace:', error.stack);
    }
  } finally {
    await prisma.$disconnect();
  }
}

quickDbTest(); 