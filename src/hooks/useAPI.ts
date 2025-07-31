import useSWR, { mutate } from 'swr';
import { CACHE_KEYS } from '@/lib/swr-config';

// Hook for fetching user profile data
export function useUserProfile() {
    const { data, error, isLoading, mutate: mutateUser } = useSWR(
        CACHE_KEYS.USER_PROFILE,
        {
            revalidateOnFocus: false, // Don't revalidate user data on focus
            dedupingInterval: 10 * 60 * 1000, // Cache for 10 minutes
        }
    );

    return {
        user: data,
        isLoading,
        isError: error,
        mutateUser,
    };
}

// Hook for fetching explore/search data
export function useExploreData(params?: string) {
    const cacheKey = params
        ? `/api/explore?${params}`
        : CACHE_KEYS.EXPLORE_PROFESSIONALS;

    const { data, error, isLoading, mutate: mutateExplore } = useSWR(
        cacheKey,
        {
            dedupingInterval: 2 * 60 * 1000, // Cache search results for 2 minutes
            revalidateOnFocus: false,
        }
    );

    return {
        professionals: data?.items || [],
        totalCount: data?.pagination?.total || 0,
        isLoading,
        isError: error,
        mutateExplore,
    };
}

// Hook for provider dashboard stats
export function useProviderDashboardStats() {
    const { data, error, isLoading, mutate: mutateStats } = useSWR(
        CACHE_KEYS.PROVIDER_DASHBOARD_STATS,
        {
            refreshInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
            dedupingInterval: 60 * 1000, // Cache for 1 minute
        }
    );

    return {
        stats: data,
        isLoading,
        isError: error,
        mutateStats,
    };
}

// Hook for notifications
export function useNotifications() {
    const { data, error, isLoading, mutate: mutateNotifications } = useSWR(
        CACHE_KEYS.NOTIFICATIONS,
        {
            refreshInterval: 30 * 1000, // Auto-refresh every 30 seconds
            dedupingInterval: 10 * 1000, // Cache for 10 seconds
        }
    );

    const markAllAsRead = async () => {
        try {
            const response = await fetch('/api/notifications/mark-all-read', {
                method: 'POST',
                credentials: 'include',
            });

            if (response.ok) {
                // Optimistically update the cache
                mutateNotifications();
                // Also trigger notification count refresh
                window.dispatchEvent(new CustomEvent('notificationsChanged'));
            }
        } catch (error) {
            console.error('Error marking notifications as read:', error);
        }
    };

    return {
        notifications: data?.notifications || [],
        unreadCount: data?.unreadCount || 0,
        isLoading,
        isError: error,
        mutateNotifications,
        markAllAsRead,
    };
}

// Hook for unread message count
export function useUnreadCount() {
    const { data, error, isLoading, mutate: mutateUnreadCount } = useSWR(
        CACHE_KEYS.UNREAD_COUNT,
        {
            refreshInterval: 30 * 1000, // Auto-refresh every 30 seconds
            dedupingInterval: 5 * 1000, // Cache for 5 seconds
        }
    );

    return {
        totalUnread: data?.totalUnread || 0,
        unreadByBooking: data?.unreadByBooking || {},
        unreadByInquiry: data?.unreadByInquiry || {},
        isLoading,
        isError: error,
        mutateUnreadCount,
    };
}

// Hook for provider profile
export function useProviderProfile(providerId: string) {
    const { data, error, isLoading, mutate: mutateProvider } = useSWR(
        providerId ? CACHE_KEYS.PROVIDER_PROFILE(providerId) : null,
        {
            dedupingInterval: 5 * 60 * 1000, // Cache for 5 minutes
            revalidateOnFocus: false,
        }
    );

    return {
        provider: data,
        isLoading,
        isError: error,
        mutateProvider,
    };
}

// Hook for provider services
export function useProviderServices() {
    const { data, error, isLoading, mutate: mutateServices } = useSWR(
        CACHE_KEYS.PROVIDER_SERVICES,
        {
            dedupingInterval: 2 * 60 * 1000, // Cache for 2 minutes
        }
    );

    return {
        services: data?.services || [],
        isLoading,
        isError: error,
        mutateServices,
    };
}

// Hook for provider reviews/performance data
export function useProviderReviews() {
    const { data, error, isLoading, mutate: mutateReviews } = useSWR(
        CACHE_KEYS.PROVIDER_REVIEWS,
        {
            dedupingInterval: 5 * 60 * 1000, // Cache for 5 minutes
        }
    );

    return {
        reviews: data?.reviews || [],
        stats: data?.stats || {},
        isLoading,
        isError: error,
        mutateReviews,
    };
}

// Hook for provider earnings overview
export function useProviderEarnings() {
    const { data, error, isLoading, mutate: mutateEarnings } = useSWR(
        CACHE_KEYS.PROVIDER_EARNINGS_OVERVIEW,
        {
            refreshInterval: 2 * 60 * 1000, // Auto-refresh every 2 minutes
            dedupingInterval: 30 * 1000, // Cache for 30 seconds
        }
    );

    return {
        earnings: data || {},
        isLoading,
        isError: error,
        mutateEarnings,
    };
}

// Hook for provider setup status
export function useProviderSetupStatus() {
    const { data, error, isLoading, mutate: mutateSetupStatus } = useSWR(
        CACHE_KEYS.PROVIDER_SETUP_STATUS,
        {
            dedupingInterval: 60 * 1000, // Cache for 1 minute
            revalidateOnFocus: true, // Check when user focuses tab
        }
    );

    return {
        setupStatus: data || {},
        isLoading,
        isError: error,
        mutateSetupStatus,
    };
}

// Hook for bookings (both client and provider)
export function useBookings(type: 'client' | 'provider') {
    const cacheKey = type === 'client' ? CACHE_KEYS.CLIENT_BOOKINGS : CACHE_KEYS.PROVIDER_BOOKINGS;

    const { data, error, isLoading, mutate: mutateBookings } = useSWR(
        cacheKey,
        {
            refreshInterval: 2 * 60 * 1000, // Auto-refresh every 2 minutes
            dedupingInterval: 30 * 1000, // Cache for 30 seconds
        }
    );

    return {
        bookings: data?.bookings || [],
        isLoading,
        isError: error,
        mutateBookings,
    };
}

// Hook for category pages (healthcare, creative, etc.)
export function useCategoryData(category: string, searchParams?: string) {
    const baseUrl = `/api/explore?category=${category}&limit=50`;
    const cacheKey = searchParams ? `${baseUrl}&${searchParams}` : baseUrl;

    const { data, error, isLoading, mutate: mutateCategory } = useSWR(
        cacheKey,
        {
            dedupingInterval: 2 * 60 * 1000, // Cache for 2 minutes
            revalidateOnFocus: false,
        }
    );

    return {
        items: data?.items || [],
        totalCount: data?.pagination?.total || 0,
        isLoading,
        isError: error,
        mutateCategory,
    };
}

// Global cache invalidation helpers
export const cacheUtils = {
    // Invalidate all user-related caches
    invalidateUserData: () => {
        mutate(CACHE_KEYS.USER_PROFILE);
        mutate(CACHE_KEYS.NOTIFICATIONS);
        mutate(CACHE_KEYS.UNREAD_COUNT);
    },

    // Invalidate provider-related caches
    invalidateProviderData: () => {
        mutate(CACHE_KEYS.PROVIDER_DASHBOARD_STATS);
        mutate(CACHE_KEYS.PROVIDER_SERVICES);
        mutate(CACHE_KEYS.PROVIDER_BOOKINGS);
        mutate(CACHE_KEYS.PROVIDER_ANALYTICS);
    },

    // Invalidate explore/search caches
    invalidateExploreData: () => {
        mutate(
            (key) => typeof key === 'string' && key.startsWith('/api/explore'),
            undefined,
            { revalidate: true }
        );
    },

    // Invalidate message-related caches
    invalidateMessageData: () => {
        mutate(CACHE_KEYS.MESSAGES);
        mutate(CACHE_KEYS.UNREAD_COUNT);
        mutate(CACHE_KEYS.NOTIFICATIONS);
    },
}; 