# 🔒 EasyBuk Escrow System Documentation

## Overview

The EasyBuk platform implements a **48-hour automated escrow system** that holds payments in escrow after service completion and automatically releases them to providers after 48 hours, provided there are no disputes.

## How It Works

### 1. Payment Flow
1. **Client pays** → Funds held in escrow
2. **Service completed** → Provider marks job as completed
3. **48-hour waiting period** → Funds remain in escrow
4. **Auto-release** → Funds transferred to provider (if no disputes)

### 2. Escrow Status Fields

**In Booking Model:**
- `escrowReleased` (Boolean): Whether funds have been released
- `completedAt` (DateTime): When service was marked complete
- `isPaid` (Boolean): Whether payment was received

**In Transaction Model:**
- `type`: 'ESCROW_RELEASE' for released payments
- `status`: 'COMPLETED' when funds are released

## Key Features

### ✅ Automatic Release
- **Trigger**: 48 hours after `completedAt` timestamp
- **Condition**: No open disputes on the booking
- **Action**: Transfers funds from escrow to provider wallet

### 🛡️ Dispute Protection
- If dispute exists → Auto-release is **blocked**
- Manual admin review required for disputed payments
- Funds remain in escrow until dispute resolution

### 📊 Real-time Tracking
- Provider dashboard shows pending escrow amounts
- Earnings page displays both available and pending funds
- Transaction history includes escrow release records

## API Endpoints

### Provider Earnings
```
GET /api/provider/earnings/overview
GET /api/provider/earnings/transactions
GET /api/provider/earnings/monthly
```

### Admin Escrow Management
```
GET /api/admin/escrow/auto-release    # Check eligible bookings
POST /api/admin/escrow/auto-release   # Trigger manual release
```

## Automated Execution

### Script Location
```
scripts/auto-release-escrow.js
```

### Usage
```bash
# Manual execution
node scripts/auto-release-escrow.js

# Scheduled execution (recommended)
# Add to cron job: 0 */6 * * * (every 6 hours)
```

### Script Features
- ✅ Batch processing (50 bookings at a time)
- ✅ Error handling and logging
- ✅ Transaction consistency with Prisma transactions
- ✅ Automatic wallet creation if needed
- ✅ Push notifications to providers

## Implementation Details

### Database Schema Updates
```sql
-- Booking table has escrow tracking
escrowReleased: Boolean @default(false)
completedAt: DateTime?

-- Transaction types include escrow release
type: ESCROW_RELEASE

-- Provider wallet for released funds
ProviderWallet {
  balance: Float @default(0.0)
  escrowBalance: Float @default(0.0)
}
```

### Commission Calculation
- **Platform fee**: 5% of total booking amount
- **Provider amount**: 95% of total booking amount
- **Calculation**: `providerAmount = totalAmount - (totalAmount * 0.05)`

## Dashboard Integration

### Provider Dashboard Shows:
1. **Today's Earnings** (released funds only)
2. **Available Balance** (total released - pending escrow)
3. **Pending Escrow** (funds awaiting 48h release)
4. **Transaction History** (including escrow releases)

### Status Indicators:
- 🔒 **Pending Escrow**: Funds held, releasing in X hours
- 💰 **Released**: Funds available for withdrawal
- ⚠️ **Disputed**: Manual review required

## Business Logic Rules

### Auto-Release Conditions
1. ✅ Booking status = 'COMPLETED'
2. ✅ Payment received (`isPaid = true`)
3. ✅ 48+ hours since `completedAt`
4. ✅ No open disputes
5. ✅ `escrowReleased = false`

### Manual Release (Admin Only)
- Can override 48-hour rule
- Available via admin panel
- Creates audit trail in transaction log

## Security & Compliance

### Audit Trail
- All escrow releases logged in Transaction table
- Metadata includes:
  - Original booking amount
  - Commission amount
  - Release reason (AUTO_RELEASE_48_HOURS)
  - Timestamps

### Error Handling
- Failed releases logged but don't block others
- Database transactions ensure consistency
- Rollback on any error within release process

## Monitoring & Alerts

### Success Metrics
- Number of auto-releases per day
- Total amount released
- Average time to release

### Error Alerts
- Failed release attempts
- Database transaction failures
- Missing provider wallets

## Future Enhancements

### Planned Features
1. **Configurable Hold Period** (24h, 48h, 72h)
2. **Instant Release** for verified providers
3. **Partial Releases** for milestone-based projects
4. **Mobile Push Notifications** for releases
5. **Email Notifications** with release summaries

### Integration Possibilities
1. **Payment Gateway Integration** (real money transfers)
2. **Bank Account Verification** before releases
3. **Tax Reporting** for released payments
4. **Analytics Dashboard** for admin oversight

---

## Support & Troubleshooting

### Common Issues
- **Funds not releasing**: Check for open disputes
- **Missing transactions**: Verify `completedAt` timestamp
- **Provider wallet errors**: Run wallet creation script

### Debug Commands
```bash
# Check eligible bookings
node scripts/check-escrow-eligible.js

# View pending escrow amounts
node scripts/check-pending-escrow.js

# Manual release specific booking
node scripts/manual-release.js [bookingId]
```

---

**Last Updated**: January 2025  
**Version**: 1.0  
**Status**: ✅ Production Ready 