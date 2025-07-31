import { SWRConfiguration } from 'swr';

// Custom fetcher function with error handling
const fetcher = async (url: string) => {
    const res = await fetch(url, {
        credentials: 'include', // Include cookies for authentication
    });

    if (!res.ok) {
        const error = new Error('An error occurred while fetching the data.');
        // Attach extra info to the error object
        (error as any).info = await res.json();
        (error as any).status = res.status;
        throw error;
    }

    return res.json();
};

// Global SWR configuration
export const swrConfig: SWRConfiguration = {
    fetcher,
    // Cache data for 5 minutes by default
    dedupingInterval: 5 * 60 * 1000,
    // Revalidate on focus (when user comes back to tab)
    revalidateOnFocus: true,
    // Revalidate on reconnect
    revalidateOnReconnect: true,
    // Don't revalidate on mount if data is fresh
    revalidateIfStale: true,
    // Retry on error
    errorRetryCount: 3,
    errorRetryInterval: 5000,
    // Load fresh data in background
    revalidateOnMount: true,
    // Cache options
    refreshInterval: 0, // No automatic refresh by default
    // Optimistic updates
    compare: (a, b) => JSON.stringify(a) === JSON.stringify(b),
    // Performance optimization
    shouldRetryOnError: (error) => {
        // Don't retry on 4xx errors (client errors)
        return error.status >= 500;
    },
};

// Cache keys for consistent cache management
export const CACHE_KEYS = {
    // Dashboard data
    PROVIDER_DASHBOARD_STATS: '/api/provider/dashboard-stats',
    CLIENT_BOOKINGS: '/api/client/bookings',
    PROVIDER_BOOKINGS: '/api/provider/bookings',

    // Explore page data
    EXPLORE_PROFESSIONALS: '/api/explore',
    SEARCH_PROFESSIONALS: (query: string) => `/api/explore?search=${encodeURIComponent(query)}`,

    // Messages and notifications
    MESSAGES: '/api/messages',
    UNREAD_COUNT: '/api/messages/unread-count',
    NOTIFICATIONS: '/api/notifications',

    // Provider data
    PROVIDER_PROFILE: (id: string) => `/api/providers/${id}`,
    PROVIDER_SERVICES: '/api/provider/services',
    PROVIDER_REVIEWS: '/api/provider/reviews',
    PROVIDER_ANALYTICS: '/api/provider/analytics/overview',
    PROVIDER_EARNINGS_OVERVIEW: '/api/provider/earnings/overview',
    PROVIDER_SETUP_STATUS: '/api/provider/setup-status',

    // Availability
    PROVIDER_AVAILABILITY: '/api/provider/calendar/availability',

    // User data
    USER_PROFILE: '/api/auth/me',
} as const; 