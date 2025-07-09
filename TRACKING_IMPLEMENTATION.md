# Analytics Tracking Implementation Guide

## ✅ What's Been Set Up

1. **Database Tables Added**: `ProfileView` and `MessageResponseTime` tables
2. **Tracking Helper Functions**: Created in `src/lib/tracking.ts`
3. **Analytics API Updated**: Now uses real data when available
4. **Track View Endpoint**: `/api/provider/track-view` for profile views

## 🚀 How to Start Collecting Real Data

### 1. Track Profile Views

Add this to any provider profile page (e.g., when someone visits `/creative/professional/[id]`):

```tsx
// In your provider profile component
useEffect(() => {
    const trackView = async () => {
        try {
            await fetch('/api/provider/track-view', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    providerId: provider.id,
                    source: 'profile_page' // or 'search_results', 'category_browse', etc.
                })
            });
        } catch (error) {
            console.log('Failed to track profile view');
        }
    };

    trackView();
}, [provider.id]);
```

### 2. Track Message Response Times

When someone sends a message to a provider:

```tsx
// When client sends message
const messageTrackingId = await trackMessageSent({
    providerId: provider.id,
    bookingId: booking?.id,
    clientId: currentUser.id,
    messageType: 'BOOKING_INQUIRY' // or 'GENERAL', 'BOOKING_UPDATE'
});

// Store messageTrackingId with the message record
```

When provider responds:

```tsx
// When provider responds
await trackMessageResponse({
    messageTrackingId: message.trackingId, // from the message record
    responseAt: new Date()
});
```

### 3. Example Integration in Messaging System

```tsx
// In MessagingInterface.tsx
import { trackMessageSent, trackMessageResponse } from '@/lib/tracking';

const sendMessage = async (content: string) => {
    try {
        // Create message
        const response = await fetch('/api/messages', {
            method: 'POST',
            body: JSON.stringify({ content, recipientId })
        });
        
        const message = await response.json();
        
        // Track if sending to provider
        if (recipient.role === 'PROVIDER') {
            const trackingId = await trackMessageSent({
                providerId: recipient.id,
                bookingId: currentBooking?.id,
                clientId: currentUser.id,
                messageType: 'GENERAL'
            });
            
            // Update message with tracking ID
            await fetch(`/api/messages/${message.id}`, {
                method: 'PATCH',
                body: JSON.stringify({ trackingId })
            });
        }
    } catch (error) {
        console.error('Error sending message:', error);
    }
};
```

### 4. Current Analytics Status

- ✅ **Real Data**: Bookings, Revenue, Conversion Rates, Reviews, Client Analytics
- 🔄 **Starting at 0**: Profile Views, Response Times (will grow as tracking is implemented)
- 📊 **Next Step**: Add tracking calls to existing pages

### 5. Quick Implementation Priority

1. **Profile Views**: Add to `/creative/professional/[id]`, `/education/professional/[id]`, etc.
2. **Message Tracking**: Add to messaging interface
3. **Search Analytics**: Track when providers appear in search results

### 6. Testing the Tracking

You can test the profile view tracking immediately:

```bash
curl -X POST https://easybuk.vercel.app/api/provider/track-view \
  -H "Content-Type: application/json" \
  -d '{"providerId":"your-provider-id","source":"test"}'
```

Once you add tracking calls to the frontend, you'll see real data in the analytics dashboard instead of 0s!

## Example: Complete Profile Page Integration

```tsx
'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function ProviderProfilePage({ provider }) {
    const { user } = useAuth();
    
    useEffect(() => {
        // Track profile view
        const trackView = async () => {
            try {
                await fetch('/api/provider/track-view', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        providerId: provider.id,
                        source: 'profile_page'
                    })
                });
            } catch (error) {
                // Fail silently - tracking is not critical
            }
        };

        trackView();
    }, [provider.id]);

    return (
        <div>
            {/* Your existing profile UI */}
        </div>
    );
}
```

The analytics will start showing real data as soon as you add these tracking calls! 