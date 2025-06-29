export type UserRole = 'CLIENT' | 'PROVIDER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  emailVerified: Date | null;
  password?: string | null;
  googleId?: string | null;
  name?: string | null;
  image?: string | null;
  phone?: string | null;
  phoneVerified: boolean;
  roles: UserRole[];
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION' | 'BANNED' | 'UNDER_REVIEW';
  lastActive: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthSession {
  userId: string;
  email: string;
  name?: string | null;
  image?: string | null;
  roles: UserRole[];
  activeRole: UserRole;
  profiles: {
    client?: {
      id: string;
      profileCompleted: boolean;
    };
    provider?: {
      id: string;
      profileCompleted: boolean;
      verificationStatus: string;
    };
    admin?: {
      id: string;
      permissions: string[];
    };
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  phone?: string;
}

export interface GoogleAuthData {
  email: string;
  name: string;
  image?: string;
  googleId: string;
  role: UserRole;
}

export interface RoleContext {
  role: UserRole;
  profileId: string;
  profileCompleted: boolean;
}

export interface AuthContextType {
  user: AuthSession | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  signup: (data: SignupData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => Promise<{ success: boolean; error?: string }>;
  addRole: (role: UserRole) => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
}

export interface TokenPayload {
  userId: string;
  email: string;
  roles: UserRole[];
  iat: number;
  exp: number;
} 