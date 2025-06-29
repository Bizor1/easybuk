'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthContextType, AuthSession, LoginCredentials, SignupData, UserRole } from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<AuthSession | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch current user on mount
    useEffect(() => {
        console.log('🔄 AuthProvider: Checking authentication on mount');
        checkAuth();
    }, []);

    async function checkAuth() {
        console.log('🔍 AuthContext: Starting authentication check');
        try {
            const response = await fetch('/api/auth/me', {
                credentials: 'include'
            });

            console.log('📡 AuthContext: /api/auth/me response status:', response.status);
            console.log('📡 AuthContext: /api/auth/me response ok:', response.ok);

            if (response.ok) {
                const data = await response.json();
                console.log('📦 AuthContext: Response data success:', data.success);
                console.log('👤 AuthContext: Response has user:', !!data.user);

                if (data.success) {
                    console.log('✅ AuthContext: Setting user in context:', {
                        name: data.user?.name,
                        email: data.user?.email,
                        activeRole: data.user?.activeRole,
                        roles: data.user?.roles
                    });
                    setUser(data.user);
                } else {
                    console.log('❌ AuthContext: Response success=false, error:', data.error);
                    setUser(null);
                }
            } else {
                console.log('❌ AuthContext: Response not ok, status:', response.status);
                setUser(null);
            }
        } catch (error) {
            console.error('🚨 AuthContext: Auth check failed with error:', error);
            setUser(null);
        } finally {
            console.log('🏁 AuthContext: Auth check complete, setting loading=false');
            setLoading(false);
        }
    }

    async function login(credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> {
        console.log('🔐 AuthContext: Starting login for email:', credentials.email);
        try {
            setLoading(true);

            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(credentials),
            });

            console.log('📡 AuthContext: Login response status:', response.status);
            const data = await response.json();
            console.log('📦 AuthContext: Login response success:', data.success);

            if (data.success) {
                console.log('✅ AuthContext: Login successful, setting user');
                console.log('👤 AuthContext: User data:', {
                    name: data.user?.name,
                    email: data.user?.email,
                    activeRole: data.user?.activeRole,
                    roles: data.user?.roles
                });
                setUser(data.user);
                return { success: true };
            } else {
                console.log('❌ AuthContext: Login failed:', data.error);
                return { success: false, error: data.error };
            }
        } catch (error) {
            console.error('🚨 AuthContext: Login error:', error);
            return { success: false, error: 'Login failed' };
        } finally {
            setLoading(false);
        }
    }

    async function signup(signupData: SignupData): Promise<{ success: boolean; error?: string }> {
        console.log('📝 AuthContext: Starting signup for email:', signupData.email);
        try {
            setLoading(true);

            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(signupData),
            });

            const data = await response.json();
            console.log('📦 AuthContext: Signup response success:', data.success);

            if (data.success) {
                console.log('✅ AuthContext: Signup successful, setting user');
                setUser(data.user);
                return { success: true };
            } else {
                console.log('❌ AuthContext: Signup failed:', data.error);
                return { success: false, error: data.error };
            }
        } catch (error) {
            console.error('🚨 AuthContext: Signup error:', error);
            return { success: false, error: 'Signup failed' };
        } finally {
            setLoading(false);
        }
    }

    async function logout(): Promise<void> {
        console.log('🚪 AuthContext: Starting logout');
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include',
            });
            console.log('✅ AuthContext: Logout API call completed');
        } catch (error) {
            console.error('🚨 AuthContext: Logout error:', error);
        } finally {
            console.log('🔄 AuthContext: Clearing user from context');
            setUser(null);
        }
    }

    async function switchRole(role: UserRole): Promise<{ success: boolean; error?: string }> {
        console.log('🔄 AuthContext: Switching role to:', role);
        if (!user) {
            console.log('❌ AuthContext: Cannot switch role - no user');
            return { success: false, error: 'Not authenticated' };
        }

        if (!user.roles.includes(role)) {
            console.log('❌ AuthContext: User does not have role:', role);
            return { success: false, error: 'User does not have this role' };
        }

        console.log('✅ AuthContext: Role switch successful');
        // Update active role locally
        setUser(prev => prev ? { ...prev, activeRole: role } : null);

        return { success: true };
    }

    async function addRole(role: UserRole): Promise<{ success: boolean; error?: string }> {
        console.log('➕ AuthContext: Adding role:', role);
        try {
            const response = await fetch('/api/auth/add-role', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ role }),
            });

            const data = await response.json();

            if (data.success) {
                console.log('✅ AuthContext: Role added successfully');
                setUser(data.user);
                // Force refresh to ensure UI updates
                await checkAuth();
                return { success: true };
            } else {
                console.log('❌ AuthContext: Add role failed:', data.error);
                return { success: false, error: data.error };
            }
        } catch (error) {
            console.error('🚨 AuthContext: Add role error:', error);
            return { success: false, error: 'Failed to add role' };
        }
    }

    async function refreshUser(): Promise<void> {
        console.log('🔄 AuthContext: Refreshing user');
        await checkAuth();
    }

    const value: AuthContextType = {
        user,
        loading,
        login,
        signup,
        logout,
        switchRole,
        addRole,
        refreshUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

// Helper hooks for specific roles
export function useClientProfile() {
    const { user } = useAuth();
    return user?.profiles.client || null;
}

export function useProviderProfile() {
    const { user } = useAuth();
    return user?.profiles.provider || null;
}

export function useAdminProfile() {
    const { user } = useAuth();
    return user?.profiles.admin || null;
}

// Role checking helpers
export function useHasRole(role: UserRole): boolean {
    const { user } = useAuth();
    return user?.roles.includes(role) || false;
}

export function useIsActive(role: UserRole): boolean {
    const { user } = useAuth();
    return user?.activeRole === role || false;
} 