# Google OAuth Setup for EasyBuk

## Overview

EasyBuk now supports Google OAuth authentication alongside email/password login. This allows users to sign up and sign in using their Google accounts.

## Environment Variables Required

Add these to your `.env.local` file:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID="your-google-client-id-here"
GOOGLE_CLIENT_SECRET="your-google-client-secret-here"
```

## How to Get Google OAuth Credentials

1. **Go to Google Cloud Console**

   - Visit: https://console.cloud.google.com/

2. **Create or Select a Project**

   - Create a new project or select an existing one

3. **Enable Google+ API**

   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it

4. **Create OAuth 2.0 Credentials**

   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (for development)
     - `https://yourdomain.com/api/auth/callback/google` (for production)

5. **Copy Credentials**
   - Copy the Client ID and Client Secret
   - Add them to your `.env.local` file

## Features

### Simplified Signup Form

- **Email and Password only** (removed name and phone fields)
- **Google OAuth option** for one-click signup
- **Role selection** (Client or Provider)
- **Automatic profile creation** based on role

### Authentication Flow

- **Clients**: Can browse as guests, only need auth for booking/payments
- **Providers**: Must signup to access dashboard immediately
- **Google users**: Default to CLIENT role, can be changed later

### Navigation Integration

- **Sign In/Sign Up buttons** added to all navigation bars
- **Consistent styling** across all category pages
- **Mobile responsive** navigation

## Testing

1. **Email/Password Signup**:

   - Visit `/auth/signup`
   - Enter email and password
   - Choose role (Client/Provider)
   - Account created with automatic profile setup

2. **Google OAuth Signup**:

   - Click "Continue with Google"
   - Authorize with Google
   - Account created automatically as CLIENT
   - Profile and wallet created automatically

3. **Role-based Redirects**:
   - **ADMIN** → `/admin/dashboard`
   - **PROVIDER** → `/provider/dashboard`
   - **CLIENT** → Return to previous page or home

## Database Integration

- **Automatic profile creation** for both OAuth and email signups
- **Wallet creation** for all new users
- **Default values**: Country set to 'Ghana', currency to 'GHS'
- **Provider default category**: 'HEALTHCARE' (can be updated later)

## Security Features

- **Password hashing** with bcryptjs (12 rounds)
- **JWT session strategy** for better performance
- **Role-based access control** ready for implementation
- **Email validation** and password strength requirements

## Next Steps

1. **Set up Google OAuth credentials** using the instructions above
2. **Test the authentication flow** with both methods
3. **Implement AuthGuard components** for protecting booking/payment actions
4. **Add user dashboard** functionality based on roles

## Overview

EasyBuk now supports Google OAuth authentication alongside email/password login. This allows users to sign up and sign in using their Google accounts.

## Environment Variables Required

Add these to your `.env.local` file:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID="your-google-client-id-here"
GOOGLE_CLIENT_SECRET="your-google-client-secret-here"
```

## How to Get Google OAuth Credentials

1. **Go to Google Cloud Console**

   - Visit: https://console.cloud.google.com/

2. **Create or Select a Project**

   - Create a new project or select an existing one

3. **Enable Google+ API**

   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it

4. **Create OAuth 2.0 Credentials**

   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (for development)
     - `https://yourdomain.com/api/auth/callback/google` (for production)

5. **Copy Credentials**
   - Copy the Client ID and Client Secret
   - Add them to your `.env.local` file

## Features

### Simplified Signup Form

- **Email and Password only** (removed name and phone fields)
- **Google OAuth option** for one-click signup
- **Role selection** (Client or Provider)
- **Automatic profile creation** based on role

### Authentication Flow

- **Clients**: Can browse as guests, only need auth for booking/payments
- **Providers**: Must signup to access dashboard immediately
- **Google users**: Default to CLIENT role, can be changed later

### Navigation Integration

- **Sign In/Sign Up buttons** added to all navigation bars
- **Consistent styling** across all category pages
- **Mobile responsive** navigation

## Testing

1. **Email/Password Signup**:

   - Visit `/auth/signup`
   - Enter email and password
   - Choose role (Client/Provider)
   - Account created with automatic profile setup

2. **Google OAuth Signup**:

   - Click "Continue with Google"
   - Authorize with Google
   - Account created automatically as CLIENT
   - Profile and wallet created automatically

3. **Role-based Redirects**:
   - **ADMIN** → `/admin/dashboard`
   - **PROVIDER** → `/provider/dashboard`
   - **CLIENT** → Return to previous page or home

## Database Integration

- **Automatic profile creation** for both OAuth and email signups
- **Wallet creation** for all new users
- **Default values**: Country set to 'Ghana', currency to 'GHS'
- **Provider default category**: 'HEALTHCARE' (can be updated later)

## Security Features

- **Password hashing** with bcryptjs (12 rounds)
- **JWT session strategy** for better performance
- **Role-based access control** ready for implementation
- **Email validation** and password strength requirements

## Next Steps

1. **Set up Google OAuth credentials** using the instructions above
2. **Test the authentication flow** with both methods
3. **Implement AuthGuard components** for protecting booking/payment actions
4. **Add user dashboard** functionality based on roles
