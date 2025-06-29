# Admin User Setup Guide

This guide explains how to create and manage admin users in the EasyBuk platform.

## Overview

EasyBuk uses a role-based access control system where users can have multiple roles:

- `CLIENT` - Can book services
- `PROVIDER` - Can offer services
- `ADMIN` - Platform administration access

Admin users have access to the admin dashboard at `/admin/dashboard` with full platform management capabilities.

## 🚀 Creating Your First Admin User

### Method 1: Database Script (Recommended for Initial Setup)

1. **Ensure you have a regular user account first**

   ```bash
   # Sign up normally through the website at /auth/signup
   # Choose either CLIENT or PROVIDER role initially
   ```

2. **Run the admin creation script**

   ```bash
   # Navigate to your project directory
   cd /path/to/easybuk

   # Run the script with your email
   node scripts/create-admin.js your-email@example.com
   ```

3. **Verify admin access**
   - Log out and log back in
   - Navigate to `/admin/dashboard`
   - You should now have admin access

### Method 2: Direct Database Update (Advanced)

If you prefer direct database manipulation:

```sql
-- Update user roles (add ADMIN to existing roles)
UPDATE "User"
SET roles = array_append(roles, 'ADMIN'),
    "updatedAt" = NOW()
WHERE email = 'your-email@example.com';

-- Create admin profile
INSERT INTO "Admin" (id, email, "emailVerified", name, role, permissions, "lastActive", "createdAt", "updatedAt")
SELECT
    gen_random_uuid(),
    email,
    "emailVerified",
    name,
    'ADMIN',
    ARRAY['USER_MANAGEMENT', 'BOOKING_MANAGEMENT', 'PAYMENT_MANAGEMENT', 'REVIEW_MODERATION', 'VERIFICATION_MANAGEMENT', 'ANALYTICS_ACCESS', 'SYSTEM_SETTINGS'],
    NOW(),
    NOW(),
    NOW()
FROM "User"
WHERE email = 'your-email@example.com';

-- Link user to admin profile
INSERT INTO "UserAdminProfile" (id, "userId", "adminId", "createdAt")
SELECT
    gen_random_uuid(),
    u.id,
    a.id,
    NOW()
FROM "User" u, "Admin" a
WHERE u.email = 'your-email@example.com'
AND a.email = 'your-email@example.com';
```

## 👥 Managing Additional Admin Users

### From the Admin Dashboard

Once you have admin access, you can grant admin privileges to other users:

1. **Navigate to User Management**

   - Go to `/admin/users`
   - Search for the user you want to make admin

2. **Grant Admin Role**

   - Click the menu button (⋮) next to the user
   - Select "Grant Admin Access"
   - Provide a reason for the audit trail
   - Confirm the action

3. **Revoke Admin Role**
   - Same process but select "Revoke Admin Access"
   - Note: You cannot revoke your own admin access (safety feature)

### Using the API

You can also use the admin API endpoints:

```bash
# Grant admin role
curl -X POST /api/admin/assign-admin-role \
  -H "Content-Type: application/json" \
  -d '{
    "userEmail": "new-admin@example.com",
    "reason": "Platform administration needs"
  }'

# Revoke admin role
curl -X DELETE /api/admin/assign-admin-role \
  -H "Content-Type: application/json" \
  -d '{
    "userEmail": "former-admin@example.com",
    "reason": "Role no longer needed"
  }'
```

## 🔐 Security Considerations

### Access Control

- **Admin-only actions**: Only existing admins can grant/revoke admin access
- **Self-protection**: Admins cannot remove their own admin privileges
- **Audit trail**: All admin role changes are logged in `AdminAction` table
- **Reason required**: All role changes require a justification

### Best Practices

1. **Minimal admins**: Only grant admin access to trusted individuals
2. **Regular audits**: Periodically review admin user list
3. **Remove unused access**: Revoke admin access when no longer needed
4. **Strong authentication**: Consider enabling 2FA for admin users

## 📊 Admin Capabilities

Admin users have access to:

### Dashboard & Analytics

- Platform overview and metrics
- User growth and engagement stats
- Revenue and booking analytics
- System health monitoring

### User Management

- View all users (clients, providers, admins)
- Activate/suspend/ban users
- Grant/revoke admin privileges
- Export user data

### Booking Management

- Monitor all platform bookings
- View booking details and status
- Release payments manually
- Handle booking issues

### Dispute Resolution

- View and manage user disputes
- Take ownership of dispute cases
- Issue refunds or release payments
- Communicate with involved parties

### Platform Settings

- Configure commission rates
- Set payment hold periods
- Manage notification settings
- Control feature availability

## 🛠 Troubleshooting

### Cannot Access Admin Dashboard

1. **Check user roles**:

   ```sql
   SELECT email, roles FROM "User" WHERE email = 'your-email@example.com';
   ```

2. **Verify admin profile exists**:

   ```sql
   SELECT u.email, a.id as admin_id
   FROM "User" u
   JOIN "UserAdminProfile" uap ON u.id = uap."userId"
   JOIN "Admin" a ON uap."adminId" = a.id
   WHERE u.email = 'your-email@example.com';
   ```

3. **Clear browser cache** and try logging in again

### Script Errors

- Ensure the user account exists before running the script
- Check database connection in your `.env` file
- Verify Prisma client is properly configured

### Permission Issues

- Only existing admins can grant admin access to others
- The initial admin must be created via script or direct database access
- Check the `AdminAction` table for audit logs of permission changes

## 📝 Database Schema Reference

### User Model

```prisma
model User {
  id            String   @id
  email         String   @unique
  roles         UserRole[] // Can include 'ADMIN'
  // ... other fields
}
```

### Admin Model

```prisma
model Admin {
  id          String   @id
  email       String   @unique
  permissions String[] // Admin capabilities
  // ... other fields
}
```

### Admin Actions (Audit Log)

```prisma
model AdminAction {
  id         String @id
  adminId    String // Who performed the action
  action     String // GRANT_ADMIN_ROLE, REVOKE_ADMIN_ROLE, etc.
  targetId   String // Target user ID
  reason     String // Justification
  createdAt  DateTime
}
```

## 🔄 Migration Notes

If upgrading from a previous version:

1. Run database migrations: `npx prisma migrate deploy`
2. Create your first admin using the script method
3. Test admin dashboard access
4. Grant admin access to other team members as needed

---

**⚠️ Important**: Keep this documentation secure and only share with authorized personnel. Admin access provides full platform control.
