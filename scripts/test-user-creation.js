const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

// Use your Neon connection string
const DATABASE_URL = "postgresql://easybukdb_owner:npg_xnhDHbVEY49k@ep-weathered-morning-abb9ifik-pooler.eu-west-2.aws.neon.tech/easybukdb?sslmode=require&channel_binding=require";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL
    }
  }
});

async function testUserCreation() {
  try {
    console.log('🚀 Starting user creation test...');
    
    // Test 1: Check database connection
    console.log('📡 Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Test 2: Check existing users
    console.log('👥 Checking existing users...');
    const existingUsers = await prisma.user.findMany();
    console.log(`📊 Found ${existingUsers.length} existing users:`, existingUsers.map(u => ({ id: u.id, email: u.email, name: u.name })));
    
    // Test 3: Try to create a test user
    const testEmail = 'test@example.com';
    const testPassword = 'testpassword123';
    
    console.log('🔒 Hashing password...');
    const hashedPassword = await bcrypt.hash(testPassword, 10);
    console.log('✅ Password hashed successfully');
    
    console.log('👤 Creating test user...');
    const newUser = await prisma.user.create({
      data: {
        id: uuidv4(),
        email: testEmail,
        password: hashedPassword,
        name: 'Test User',
        roles: ['CLIENT'],
        status: 'PENDING_VERIFICATION',
        updatedAt: new Date()
      }
    });
    
    console.log('✅ User created successfully:', {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      roles: newUser.roles,
      status: newUser.status
    });
    
    // Test 4: Create associated client profile
    console.log('🏢 Creating client profile...');
    const clientProfile = await prisma.client.create({
      data: {
        id: uuidv4(),
        email: newUser.email,
        name: newUser.name,
        status: 'PENDING_VERIFICATION',
        updatedAt: new Date()
      }
    });
    
    console.log('✅ Client profile created:', {
      id: clientProfile.id,
      email: clientProfile.email,
      name: clientProfile.name
    });
    
    // Test 5: Link user to client profile
    console.log('🔗 Linking user to client profile...');
    const userClientLink = await prisma.userClientProfile.create({
      data: {
        id: uuidv4(),
        userId: newUser.id,
        clientId: clientProfile.id
      }
    });
    
    console.log('✅ User-Client link created:', {
      id: userClientLink.id,
      userId: userClientLink.userId,
      clientId: userClientLink.clientId
    });
    
    // Test 6: Verify the complete setup
    console.log('🔍 Verifying complete user setup...');
    const completeUser = await prisma.user.findUnique({
      where: { id: newUser.id },
      include: {
        UserClientProfile: {
          include: {
            Client: true
          }
        }
      }
    });
    
    console.log('📋 Complete user data:', {
      user: {
        id: completeUser.id,
        email: completeUser.email,
        name: completeUser.name,
        roles: completeUser.roles
      },
      hasClientProfile: !!completeUser.UserClientProfile,
      clientData: completeUser.UserClientProfile?.Client ? {
        id: completeUser.UserClientProfile.Client.id,
        email: completeUser.UserClientProfile.Client.email,
        name: completeUser.UserClientProfile.Client.name
      } : null
    });
    
    console.log('🎉 All tests passed! User creation is working correctly.');
    
    // Cleanup: Remove the test user
    console.log('🧹 Cleaning up test data...');
    await prisma.userClientProfile.delete({ where: { id: userClientLink.id } });
    await prisma.client.delete({ where: { id: clientProfile.id } });
    await prisma.user.delete({ where: { id: newUser.id } });
    console.log('✅ Test data cleaned up');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Error details:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Database disconnected');
  }
}

testUserCreation(); 