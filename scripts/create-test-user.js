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

async function createTestUser() {
  try {
    console.log('🚀 Creating test user that will stay in database...');
    
    // Test user data
    const testEmail = 'bizorebenezer@gmail.com';
    const testPassword = 'password123';
    const testName = 'Ebenezer Bizor';
    
    console.log('🔒 Hashing password...');
    const hashedPassword = await bcrypt.hash(testPassword, 10);
    
    console.log('👤 Creating user...');
    const newUser = await prisma.user.create({
      data: {
        id: uuidv4(),
        email: testEmail,
        password: hashedPassword,
        name: testName,
        roles: ['CLIENT'],
        status: 'PENDING_VERIFICATION',
        updatedAt: new Date()
      }
    });
    
    console.log('✅ User created:', {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      roles: newUser.roles
    });
    
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
    
    console.log('✅ Client profile created:', clientProfile.id);
    
    console.log('🔗 Linking user to client...');
    const userClientLink = await prisma.userClientProfile.create({
      data: {
        id: uuidv4(),
        userId: newUser.id,
        clientId: clientProfile.id
      }
    });
    
    console.log('✅ Link created:', userClientLink.id);
    
    console.log('🎉 SUCCESS! Test user created and will remain in database');
    console.log('📊 Check your Neon dashboard - you should see 1 user in the User table');
    console.log('📧 Email:', testEmail);
    console.log('🔑 Password:', testPassword);
    console.log('🆔 User ID:', newUser.id);
    
  } catch (error) {
    console.error('❌ Failed to create user:', error.message);
    if (error.code === 'P2002') {
      console.log('User with this email already exists - that\'s actually good!');
    }
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser(); 