const { execSync } = require('child_process');

// Your Neon connection string
const NEON_DATABASE_URL = "postgresql://easybukdb_owner:npg_xnhDHbVEY49k@ep-weathered-morning-abb9ifik-pooler.eu-west-2.aws.neon.tech/easybukdb?sslmode=require&channel_binding=require";

console.log('🚀 Setting up Neon database...');

try {
  // Set environment variable for this script only
  process.env.DATABASE_URL = NEON_DATABASE_URL;
  
  console.log('📦 Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  console.log('🔄 Running database migrations...');
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  
  console.log('✅ Database setup complete!');
  console.log('📊 Tables created:', [
    'User', 'Client', 'ServiceProvider', 'Admin',
    'Booking', 'Service', 'Review', 'Message',
    'Transaction', 'Notification', 'Dispute', 'Wallet'
  ].join(', '));
  
} catch (error) {
  console.error('❌ Setup failed:', error.message);
  process.exit(1);
} 