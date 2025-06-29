# EasyBuk Database & Authentication Setup

## Overview

EasyBuk uses PostgreSQL with Prisma ORM and NextAuth.js for authentication. The system supports three user roles: CLIENT, PROVIDER, and ADMIN.

## Prerequisites

1. **PostgreSQL Database**: You need a PostgreSQL database running locally or remotely
2. **Node.js**: Version 16 or higher
3. **Environment Variables**: Properly configured `.env.local` file

## Setup Instructions

### 1. Database Setup

#### Option A: Local PostgreSQL

```bash
# Install PostgreSQL if not already installed
# On Windows: Download from https://www.postgresql.org/download/windows/
# On macOS: brew install postgresql
# On Ubuntu: sudo apt-get install postgresql postgresql-contrib

# Create a database
createdb easybuk_db
```

#### Option B: Cloud Database (Recommended)

- **Neon**: https://neon.tech (Free tier available)
- **Supabase**: https://supabase.com (Free tier available)
- **Railway**: https://railway.app
- **PlanetScale**: https://planetscale.com

### 2. Environment Configuration

Update your `.env.local` file with your database credentials:

```env
# Database - Replace with your actual database URL
DATABASE_URL="postgresql://username:password@localhost:5432/easybuk_db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-change-this-in-production"

# Optional: OAuth Providers
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Development
NODE_ENV="development"
```

### 3. Generate Prisma Client and Push Schema

```bash
# Generate the Prisma client
npx prisma generate

# Push the schema to your database (creates tables)
npx prisma db push

# Optional: Seed the database with sample data
npx prisma db seed
```

### 4. Run the Application

```bash
npm run dev
```

## User Flow Design

### For Clients (Service Seekers)

- **Guest Browsing**: Can browse all services without signing up
- **Auth Required**: Only when booking services or making payments
- **Seamless UX**: Minimal friction until critical actions

### For Providers (Service Offerers)

- **Immediate Signup**: Must sign up to access provider features
- **Dashboard Access**: Immediate access to provider dashboard
- **Verification Later**: Can add verification documents after signup
- **Profile Building**: Complete profile setup at their own pace

### For Admins

- **Full Access**: Complete platform management capabilities
- **User Management**: Approve, suspend, or ban users
- **Dispute Resolution**: Handle booking disputes
- **Analytics**: Platform performance and user metrics

## Database Schema Overview

### Core Models

- **User**: Base user information with role (CLIENT/PROVIDER/ADMIN)
- **ClientProfile**: Client-specific data (address, preferences)
- **ProviderProfile**: Provider-specific data (bio, rates, specializations)
- **Service**: Services offered by providers
- **Booking**: Service bookings with payment tracking
- **Review**: Rating and review system
- **Transaction**: Payment and financial tracking
- **Wallet**: User wallet for payments
- **Message**: In-app messaging system
- **Notification**: User notifications

### Key Features

- **Escrow System**: Payments held until service completion
- **Review System**: Bidirectional reviews between clients and providers
- **Verification System**: Document upload and verification
- **Real-time Messaging**: Communication between users
- **Multi-currency Support**: Primarily GHS (Ghana Cedis)

## Authentication Flow

### Sign Up Process

1. **Role Selection**: CLIENT or PROVIDER
2. **Basic Information**: Name, email, phone, password
3. **Profile Creation**: Automatic profile setup based on role
4. **Wallet Creation**: Automatic wallet creation for all users

### Sign In Process

1. **Credentials Validation**: Email and password verification
2. **Role-based Redirect**:
   - ADMIN → `/admin/dashboard`
   - PROVIDER → `/provider/dashboard`
   - CLIENT → Return to previous page or home

### Auth Guards

- **BookingAuthGuard**: Protects booking functionality
- **PaymentAuthGuard**: Protects payment operations
- **ContactAuthGuard**: Protects provider contact features

## API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/[...nextauth]` - NextAuth.js handlers

### Protected Routes

- `/provider/dashboard` - Provider dashboard (PROVIDER only)
- `/admin/dashboard` - Admin dashboard (ADMIN only)
- `/booking/*` - Booking routes (AUTH required)

## Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Sessions**: Secure session management
- **Role-based Access**: Granular permission system
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Protection**: Prisma ORM prevents SQL injection

## Development Commands

```bash
# Database management
npx prisma migrate dev        # Create and apply migrations
npx prisma db push           # Push schema changes without migration
npx prisma studio           # Open Prisma Studio (database GUI)
npx prisma generate         # Generate Prisma client

# Application
npm run dev                 # Start development server
npm run build              # Build for production
npm run start              # Start production server
```

## Production Considerations

1. **Environment Variables**: Use strong secrets in production
2. **Database**: Use SSL connections for cloud databases
3. **File Storage**: Implement proper file upload system for verification documents
4. **Email Service**: Configure email provider for notifications
5. **Payment Gateway**: Integrate mobile money and card payment systems
6. **Monitoring**: Add error tracking and performance monitoring

## Troubleshooting

### Common Issues

1. **Database Connection Failed**

   - Check DATABASE_URL format
   - Verify database server is running
   - Ensure database exists

2. **Prisma Client Not Found**

   - Run `npx prisma generate`
   - Check if @prisma/client is installed

3. **NextAuth Session Issues**

   - Verify NEXTAUTH_SECRET is set
   - Check NEXTAUTH_URL matches your domain

4. **Role-based Redirects Not Working**
   - Clear browser cookies/session
   - Check user role in database

### Getting Help

1. Check the terminal for error messages
2. Review the database logs
3. Use `npx prisma studio` to inspect database data
4. Check the browser developer console for client-side errors

## Next Steps

After setup, you can:

1. Test user registration and login
2. Explore the provider dashboard
3. Implement booking functionality
4. Add payment integration
5. Set up email notifications
6. Configure file upload for verification documents

## Overview

EasyBuk uses PostgreSQL with Prisma ORM and NextAuth.js for authentication. The system supports three user roles: CLIENT, PROVIDER, and ADMIN.

## Prerequisites

1. **PostgreSQL Database**: You need a PostgreSQL database running locally or remotely
2. **Node.js**: Version 16 or higher
3. **Environment Variables**: Properly configured `.env.local` file

## Setup Instructions

### 1. Database Setup

#### Option A: Local PostgreSQL

```bash
# Install PostgreSQL if not already installed
# On Windows: Download from https://www.postgresql.org/download/windows/
# On macOS: brew install postgresql
# On Ubuntu: sudo apt-get install postgresql postgresql-contrib

# Create a database
createdb easybuk_db
```

#### Option B: Cloud Database (Recommended)

- **Neon**: https://neon.tech (Free tier available)
- **Supabase**: https://supabase.com (Free tier available)
- **Railway**: https://railway.app
- **PlanetScale**: https://planetscale.com

### 2. Environment Configuration

Update your `.env.local` file with your database credentials:

```env
# Database - Replace with your actual database URL
DATABASE_URL="postgresql://username:password@localhost:5432/easybuk_db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-change-this-in-production"

# Optional: OAuth Providers
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Development
NODE_ENV="development"
```

### 3. Generate Prisma Client and Push Schema

```bash
# Generate the Prisma client
npx prisma generate

# Push the schema to your database (creates tables)
npx prisma db push

# Optional: Seed the database with sample data
npx prisma db seed
```

### 4. Run the Application

```bash
npm run dev
```

## User Flow Design

### For Clients (Service Seekers)

- **Guest Browsing**: Can browse all services without signing up
- **Auth Required**: Only when booking services or making payments
- **Seamless UX**: Minimal friction until critical actions

### For Providers (Service Offerers)

- **Immediate Signup**: Must sign up to access provider features
- **Dashboard Access**: Immediate access to provider dashboard
- **Verification Later**: Can add verification documents after signup
- **Profile Building**: Complete profile setup at their own pace

### For Admins

- **Full Access**: Complete platform management capabilities
- **User Management**: Approve, suspend, or ban users
- **Dispute Resolution**: Handle booking disputes
- **Analytics**: Platform performance and user metrics

## Database Schema Overview

### Core Models

- **User**: Base user information with role (CLIENT/PROVIDER/ADMIN)
- **ClientProfile**: Client-specific data (address, preferences)
- **ProviderProfile**: Provider-specific data (bio, rates, specializations)
- **Service**: Services offered by providers
- **Booking**: Service bookings with payment tracking
- **Review**: Rating and review system
- **Transaction**: Payment and financial tracking
- **Wallet**: User wallet for payments
- **Message**: In-app messaging system
- **Notification**: User notifications

### Key Features

- **Escrow System**: Payments held until service completion
- **Review System**: Bidirectional reviews between clients and providers
- **Verification System**: Document upload and verification
- **Real-time Messaging**: Communication between users
- **Multi-currency Support**: Primarily GHS (Ghana Cedis)

## Authentication Flow

### Sign Up Process

1. **Role Selection**: CLIENT or PROVIDER
2. **Basic Information**: Name, email, phone, password
3. **Profile Creation**: Automatic profile setup based on role
4. **Wallet Creation**: Automatic wallet creation for all users

### Sign In Process

1. **Credentials Validation**: Email and password verification
2. **Role-based Redirect**:
   - ADMIN → `/admin/dashboard`
   - PROVIDER → `/provider/dashboard`
   - CLIENT → Return to previous page or home

### Auth Guards

- **BookingAuthGuard**: Protects booking functionality
- **PaymentAuthGuard**: Protects payment operations
- **ContactAuthGuard**: Protects provider contact features

## API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/[...nextauth]` - NextAuth.js handlers

### Protected Routes

- `/provider/dashboard` - Provider dashboard (PROVIDER only)
- `/admin/dashboard` - Admin dashboard (ADMIN only)
- `/booking/*` - Booking routes (AUTH required)

## Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Sessions**: Secure session management
- **Role-based Access**: Granular permission system
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Protection**: Prisma ORM prevents SQL injection

## Development Commands

```bash
# Database management
npx prisma migrate dev        # Create and apply migrations
npx prisma db push           # Push schema changes without migration
npx prisma studio           # Open Prisma Studio (database GUI)
npx prisma generate         # Generate Prisma client

# Application
npm run dev                 # Start development server
npm run build              # Build for production
npm run start              # Start production server
```

## Production Considerations

1. **Environment Variables**: Use strong secrets in production
2. **Database**: Use SSL connections for cloud databases
3. **File Storage**: Implement proper file upload system for verification documents
4. **Email Service**: Configure email provider for notifications
5. **Payment Gateway**: Integrate mobile money and card payment systems
6. **Monitoring**: Add error tracking and performance monitoring

## Troubleshooting

### Common Issues

1. **Database Connection Failed**

   - Check DATABASE_URL format
   - Verify database server is running
   - Ensure database exists

2. **Prisma Client Not Found**

   - Run `npx prisma generate`
   - Check if @prisma/client is installed

3. **NextAuth Session Issues**

   - Verify NEXTAUTH_SECRET is set
   - Check NEXTAUTH_URL matches your domain

4. **Role-based Redirects Not Working**
   - Clear browser cookies/session
   - Check user role in database

### Getting Help

1. Check the terminal for error messages
2. Review the database logs
3. Use `npx prisma studio` to inspect database data
4. Check the browser developer console for client-side errors

## Next Steps

After setup, you can:

1. Test user registration and login
2. Explore the provider dashboard
3. Implement booking functionality
4. Add payment integration
5. Set up email notifications
6. Configure file upload for verification documents
