# Converting Provider Profile Pages to Real Data

## ✅ **Completed**: Creative Professional Page
- `/creative/professional/[id]/page.tsx` ✅ **DONE**
- Uses real database data via `/api/providers/[id]`
- Tracks profile views automatically 
- Shows loading and error states

## 🔄 **Remaining Pages to Convert**:

### **1. Healthcare Professional** `/healthcare/professional/[id]/page.tsx`
### **2. Education Professional** `/education/professional/[id]/page.tsx`
### **3. Professional Services** `/professional-services/professional/[id]/page.tsx`
### **4. Technical Professional** `/technical/professional/[id]/page.tsx`
### **5. Home Services Professional** `/home-services/professional/[id]/page.tsx`

## 🚀 **Conversion Pattern** (Apply to Each Page):

### **Step 1: Replace Imports & State**
```tsx
// OLD (mock data approach)
import React, { useState } from 'react';

export default function [Category]Professional() {
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    
    // Mock professional data
    const professional = {
        id: 1,
        name: "Mock Name",
        // ... mock data
    };

// NEW (real data approach)
import React, { useState, useEffect } from 'react';

export default function [Category]Professional() {
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [professional, setProfessional] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
```

### **Step 2: Add Data Fetching**
```tsx
// Add these useEffects after the state declarations:

// Fetch real provider data
useEffect(() => {
    const fetchProviderData = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/providers/${params.id}`);
            
            if (!response.ok) {
                throw new Error('Provider not found');
            }
            
            const data = await response.json();
            setProfessional(data);
        } catch (error) {
            console.error('Error fetching provider:', error);
            setError('Failed to load provider profile');
        } finally {
            setLoading(false);
        }
    };

    if (params.id) {
        fetchProviderData();
    }
}, [params.id]);

// Track profile view
useEffect(() => {
    const trackProfileView = async () => {
        if (!params.id) return;
        
        try {
            await fetch('/api/provider/track-view', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    providerId: params.id,
                    source: '[category]_profile' // e.g., healthcare_profile, education_profile
                })
            });
        } catch (error) {
            console.log('Profile view tracking failed');
        }
    };

    trackProfileView();
}, [params.id]);
```

### **Step 3: Add Loading & Error States**
```tsx
// Add before the main return statement:

// Loading state
if (loading) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-[color]-50 via-white to-[color]-50 flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[color]-500 mx-auto"></div>
                <p className="mt-4 text-lg text-gray-600">Loading provider profile...</p>
            </div>
        </div>
    );
}

// Error state
if (error || !professional) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-[color]-50 via-white to-[color]-50 flex items-center justify-center">
            <div className="text-center">
                <div className="text-6xl mb-4">😞</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Provider Not Found</h2>
                <p className="text-gray-600 mb-4">{error || 'The provider profile you are looking for does not exist.'}</p>
                <Link href="/[category]" className="bg-[color]-600 text-white px-6 py-3 rounded-lg hover:bg-[color]-700 transition-colors">
                    Back to [Category] Services
                </Link>
            </div>
        </div>
    );
}
```

### **Step 4: Fix Data References**
Replace all hardcoded mock data references:

**OLD:**
```tsx
// Mock reviews
const reviews = [
    { name: "Mock Client", rating: 5, ... }
];

// Mock contact info  
professional.clinic.name
professional.studio.address
```

**NEW:**
```tsx
// Real reviews from API
const reviews = professional.reviewsData || [];

// Real contact info
professional.contact.businessName
professional.contact.address
professional.contact.phone
professional.contact.hours
```

### **Step 5: Add TypeScript Types**
Add `: any` to all map function parameters:
```tsx
// Fix TypeScript errors
{professional.services.map((service: any, index: any) => (...))}
{professional.education.map((edu: any, index: any) => (...))}
{professional.certifications.map((cert: any, index: any) => (...))}
{reviews.map((review: any, index: any) => (...))}
```

### **Step 6: Update Portfolio Section**
```tsx
{/* Portfolio Preview */}
<div className="mb-6">
    <h3 className="text-xl font-bold text-gray-800 mb-3">📁 Portfolio Preview</h3>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {professional.portfolio && professional.portfolio.length > 0 ? (
            professional.portfolio.slice(0, 4).map((item: any, index: any) => (
                <div key={index} className="aspect-square bg-gradient-to-br from-[color]-100 to-[color]-100 rounded-lg overflow-hidden">
                    <img 
                        src={item.image} 
                        alt={item.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                </div>
            ))
        ) : (
            // Fallback placeholder
            [1, 2, 3, 4].map((item) => (
                <div key={item} className="aspect-square bg-gradient-to-br from-[color]-100 to-[color]-100 rounded-lg flex items-center justify-center">
                    <span className="text-[color]-600 text-2xl">[icon]</span>
                </div>
            ))
        )}
    </div>
</div>
```

## 🎯 **Quick Conversion Checklist**:

For each provider profile page:
- [ ] Import `useEffect` 
- [ ] Add state for `professional`, `loading`, `error`
- [ ] Add data fetching `useEffect`
- [ ] Add tracking `useEffect` with correct source name
- [ ] Add loading/error state JSX
- [ ] Replace `const reviews = [...]` with `const reviews = professional.reviewsData || []`
- [ ] Update contact section: `professional.studio` → `professional.contact`
- [ ] Add `: any` types to all map functions
- [ ] Update portfolio section to use real data
- [ ] Test with real provider ID

## 🔗 **API Endpoint**:
All pages use the same endpoint: `/api/providers/[id]`

## 📊 **Tracking Sources**:
- `creative_profile`
- `healthcare_profile` 
- `education_profile`
- `professional_services_profile`
- `technical_profile`
- `home_services_profile`

## 🎉 **Result**:
✅ Real provider data from database  
✅ Automatic profile view tracking  
✅ Better user experience with loading states  
✅ Error handling for missing providers  
✅ Analytics data will start flowing immediately! 