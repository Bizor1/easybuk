// Test auth components locally to identify the issue
async function testAuthComponents() {
  console.log('🔍 Testing auth components locally...\n');
  
  try {
    // Test 1: Import AuthService
    console.log('📦 Test 1: Importing AuthService...');
    const authModule = require('../src/lib/auth.ts');
    console.log('✅ AuthService imported successfully');
    console.log('Available exports:', Object.keys(authModule));
    
    // Test 2: Import Prisma
    console.log('\n📦 Test 2: Importing Prisma...');
    const prismaModule = require('../src/lib/prisma.ts');
    console.log('✅ Prisma imported successfully');
    console.log('Available exports:', Object.keys(prismaModule));
    
    // Test 3: Import JWT utilities
    console.log('\n📦 Test 3: Importing JWT utilities...');
    const jwtModule = require('../src/lib/jwt.ts');
    console.log('✅ JWT utilities imported successfully');
    console.log('Available exports:', Object.keys(jwtModule));
    
    // Test 4: Import types
    console.log('\n📦 Test 4: Importing auth types...');
    const typesModule = require('../src/types/auth.ts');
    console.log('✅ Auth types imported successfully');
    console.log('Available exports:', Object.keys(typesModule));
    
  } catch (error) {
    console.error('❌ Error during local testing:', error);
    console.error('Stack trace:', error.stack);
  }
}

testAuthComponents(); 