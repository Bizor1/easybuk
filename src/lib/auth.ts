import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { generateAccessToken, generateRefreshToken } from './jwt';
import { UserRole } from '@/types/auth';

interface LoginCredentials {
  email: string;
  password: string;
}

interface SignupData {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  phone?: string;
}

interface GoogleAuthData {
  email: string;
  name: string;
  image?: string;
  googleId: string;
  role: UserRole;
}

interface AuthResult {
  success: boolean;
  user?: any;
  tokens?: {
    accessToken: string;
    refreshToken: string;
  };
  error?: string;
}

export class AuthService {
  /**
   * Generate tokens for a user
   */
  private static generateTokens(user: { userId: string; email: string; roles: UserRole[] }) {
    const accessToken = generateAccessToken({
      userId: user.userId,
      email: user.email,
      roles: user.roles,
    });

    const refreshToken = generateRefreshToken({
      userId: user.userId,
      email: user.email,
    });

    return { accessToken, refreshToken };
  }

  /**
   * Get user session with profile data
   */
  static async getUserSession(userId: string) {
    console.log('👤 AuthService: Getting user session for userId:', userId);
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          UserClientProfile: {
            include: {
              Client: {
                include: {
                  ClientWallet: true,
                },
              },
            },
          },
          UserProviderProfile: {
            include: {
              ServiceProvider: {
                include: {
                  ProviderWallet: true,
                },
              },
            },
          },
          UserAdminProfile: {
            include: {
              Admin: true,
            },
          },
        },
      });

      if (!user) {
        console.log('❌ AuthService: User not found in database for userId:', userId);
        return null;
      }

      console.log('📦 AuthService: User found:', {
        id: user.id,
        email: user.email,
        name: user.name,
        roles: user.roles,
        hasClientProfile: !!user.UserClientProfile,
        hasProviderProfile: !!user.UserProviderProfile,
        hasAdminProfile: !!user.UserAdminProfile
      });

      // Build profiles object according to AuthSession interface
      const profiles: any = {};

      if (user.UserClientProfile?.Client) {
        profiles.client = {
          id: user.UserClientProfile.Client.id,
          profileCompleted: user.UserClientProfile.Client.profileCompleted,
          wallet: user.UserClientProfile.Client.ClientWallet,
        };
        console.log('🔍 AuthService: Client profile added');
      }

      if (user.UserProviderProfile?.ServiceProvider) {
        profiles.provider = {
          id: user.UserProviderProfile.ServiceProvider.id,
          profileCompleted: user.UserProviderProfile.ServiceProvider.profileCompleted,
          verificationStatus: user.UserProviderProfile.ServiceProvider.verificationStatus,
          wallet: user.UserProviderProfile.ServiceProvider.ProviderWallet,
        };
        console.log('🔍 AuthService: Provider profile added');
      }

      if (user.UserAdminProfile?.Admin) {
        profiles.admin = {
          id: user.UserAdminProfile.Admin.id,
          permissions: user.UserAdminProfile.Admin.permissions,
        };
        console.log('🔍 AuthService: Admin profile added');
      }

      // Determine active role - prefer CLIENT if user has both roles for better UX
      let activeRole: UserRole = 'CLIENT';
      if (user.roles.length > 0) {
        if (user.roles.includes('CLIENT')) {
          activeRole = 'CLIENT';
        } else if (user.roles.includes('PROVIDER')) {
          activeRole = 'PROVIDER';
        } else if (user.roles.includes('ADMIN')) {
          activeRole = 'ADMIN';
        } else {
          activeRole = user.roles[0];
        }
      }

      console.log('🎯 AuthService: Determined active role:', activeRole);

      // Return data in AuthSession format
      const sessionData = {
        userId: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        roles: user.roles,
        activeRole: activeRole,
        profiles,
      };

      console.log('✅ AuthService: Session data prepared successfully:', {
        userId: sessionData.userId,
        email: sessionData.email,
        name: sessionData.name,
        activeRole: sessionData.activeRole,
        roles: sessionData.roles,
        profileKeys: Object.keys(sessionData.profiles)
      });

      return sessionData;
    } catch (error) {
      console.error('🚨 AuthService: Get user session error:', error);
      return null;
    }
  }

  /**
   * Login with email and password
   */
  static async login(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      const { email, password } = credentials;

      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user || !user.password) {
        return {
          success: false,
          error: 'Invalid email or password',
        };
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return {
          success: false,
          error: 'Invalid email or password',
        };
      }

      // Update last active
      await prisma.user.update({
        where: { id: user.id },
        data: {
          lastActive: new Date(),
          updatedAt: new Date(),
        },
      });

      // Generate tokens
      const tokens = this.generateTokens({
        userId: user.id,
        email: user.email,
        roles: user.roles,
      });

      // Get full user session
      const userSession = await this.getUserSession(user.id);

      return {
        success: true,
        user: userSession,
        tokens,
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'An error occurred during login',
      };
    }
  }

  /**
   * Sign up a new user
   */
  static async signup(data: SignupData): Promise<AuthResult> {
    console.log('🏁 AuthService.signup: Starting signup process');
    try {
      const { email, password, name, role, phone } = data;
      console.log('📝 AuthService.signup: Data received:', {
        email,
        name,
        role,
        hasPhone: !!phone,
        passwordLength: password.length
      });

      // Check if user already exists
      console.log('🔍 AuthService.signup: Checking if user exists');
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });
      console.log('📊 AuthService.signup: User exists check result:', !!existingUser);

      if (existingUser) {
        console.log('❌ AuthService.signup: User already exists');
        return {
          success: false,
          error: 'User with this email already exists',
        };
      }

      // Hash password
      console.log('🔐 AuthService.signup: Hashing password');
      const hashedPassword = await bcrypt.hash(password, 12);
      console.log('✅ AuthService.signup: Password hashed successfully');

      // Create user in transaction
      console.log('💾 AuthService.signup: Starting database transaction');
      const result = await prisma.$transaction(async (tx) => {
        // Create user
        console.log('👤 AuthService.signup: Creating user record');
        const user = await tx.user.create({
          data: {
            id: uuidv4(),
            email,
            password: hashedPassword,
            name,
            phone,
            roles: [role],
            emailVerified: null,
            phoneVerified: false,
            status: 'PENDING_VERIFICATION',
            lastActive: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
        console.log('✅ AuthService.signup: User created with ID:', user.id);

        // Create appropriate profile and linked entity
        if (role === 'CLIENT') {
          console.log('🏠 AuthService.signup: Creating client profile');
          const client = await tx.client.create({
            data: {
              id: uuidv4(),
              email,
              name,
              phone,
              phoneVerified: false,
              status: 'PENDING_VERIFICATION',
              country: 'Ghana',
              profileCompleted: false,
              lastActive: new Date(),
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          });
          console.log('✅ AuthService.signup: Client created with ID:', client.id);

          console.log('🔗 AuthService.signup: Creating user-client profile link');
          await tx.userClientProfile.create({
            data: {
              id: uuidv4(),
              userId: user.id,
              clientId: client.id,
              createdAt: new Date(),
            },
          });
          console.log('✅ AuthService.signup: User-client profile link created');

          console.log('💰 AuthService.signup: Creating client wallet');
          await tx.clientWallet.create({
            data: {
              id: uuidv4(),
              clientId: client.id,
              balance: 0.0,
              currency: 'GHS',
              escrowBalance: 0.0,
              canWithdraw: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          });
          console.log('✅ AuthService.signup: Client wallet created');
        } else if (role === 'PROVIDER') {
          console.log('🏢 AuthService.signup: Creating provider profile');
          const provider = await tx.serviceProvider.create({
            data: {
              id: uuidv4(),
              email,
              name,
              phone,
              phoneVerified: false,
              status: 'PENDING_VERIFICATION',
              country: 'Ghana',
              profileCompleted: false,
              category: 'TECHNICAL_SERVICES', // Default category
              verificationStatus: 'PENDING',
              isAvailableForBooking: false,
              isVerified: false,
              rating: 0.0,
              totalReviews: 0,
              totalEarnings: 0.0,
              completedBookings: 0,
              cancellationRate: 0.0,
              isActive: true,
              lastActive: new Date(),
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          });

          await tx.userProviderProfile.create({
            data: {
              id: uuidv4(),
              userId: user.id,
              providerId: provider.id,
              createdAt: new Date(),
            },
          });

          await tx.providerWallet.create({
            data: {
              id: uuidv4(),
              providerId: provider.id,
              balance: 0.0,
              currency: 'GHS',
              escrowBalance: 0.0,
              canWithdraw: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          });
        }

        return user;
      });
      console.log('🎉 AuthService.signup: Database transaction completed successfully');

      // Generate tokens
      console.log('🎫 AuthService.signup: Generating tokens');
      const tokens = this.generateTokens({
        userId: result.id,
        email: result.email,
        roles: result.roles,
      });
      console.log('✅ AuthService.signup: Tokens generated successfully');

      // Get full user session
      console.log('👤 AuthService.signup: Getting user session');
      const userSession = await this.getUserSession(result.id);
      console.log('✅ AuthService.signup: User session retrieved:', {
        userId: userSession?.userId,
        email: userSession?.email,
        activeRole: userSession?.activeRole
      });

      console.log('🎊 AuthService.signup: Signup completed successfully');
      return {
        success: true,
        user: userSession,
        tokens,
      };
    } catch (error) {
      console.error('🚨 AuthService.signup: Signup error:', error);
      console.error('🚨 AuthService.signup: Error name:', error instanceof Error ? error.name : 'Unknown');
      console.error('🚨 AuthService.signup: Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('🚨 AuthService.signup: Error stack:', error instanceof Error ? error.stack : 'No stack trace');

      return {
        success: false,
        error: 'An error occurred during signup',
      };
    }
  }

  /**
   * Google OAuth authentication
   */
  static async googleAuth(data: GoogleAuthData): Promise<AuthResult> {
    try {
      const { email, name, image, googleId, role } = data;

      // Check if user exists
      let user = await prisma.user.findUnique({
        where: { email },
      });

      if (user) {
        // Update Google ID if not set
        if (!user.googleId) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              googleId,
              updatedAt: new Date(),
              lastActive: new Date(),
            },
          });
        } else {
          // Just update last active
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              lastActive: new Date(),
              updatedAt: new Date(),
            },
          });
        }

        // Check if user has the requested role
        const hasRole = user.roles.includes(role);
        if (!hasRole) {
          // Add the new role
          const addRoleResult = await this.addRoleToUser(user.id, role);
          if (!addRoleResult.success) {
            return addRoleResult;
          }
        }
      } else {
        // Create new user with Google auth (similar to signup but no password)
        const result = await prisma.$transaction(async (tx) => {
          const newUser = await tx.user.create({
            data: {
              id: uuidv4(),
              email,
              name,
              image,
              googleId,
              roles: [role],
              emailVerified: new Date(), // Google emails are verified
              phoneVerified: false,
              status: 'PENDING_VERIFICATION',
              lastActive: new Date(),
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          });

          // Create appropriate profile
          if (role === 'CLIENT') {
            const client = await tx.client.create({
              data: {
                id: uuidv4(),
                email,
                name,
                image,
                emailVerified: new Date(),
                phoneVerified: false,
                status: 'PENDING_VERIFICATION',
                country: 'Ghana',
                profileCompleted: false,
                lastActive: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            });

            await tx.userClientProfile.create({
              data: {
                id: uuidv4(),
                userId: newUser.id,
                clientId: client.id,
                createdAt: new Date(),
              },
            });

            await tx.clientWallet.create({
              data: {
                id: uuidv4(),
                clientId: client.id,
                balance: 0.0,
                currency: 'GHS',
                escrowBalance: 0.0,
                canWithdraw: true,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            });
          } else if (role === 'PROVIDER') {
            const provider = await tx.serviceProvider.create({
              data: {
                id: uuidv4(),
                email,
                name,
                image,
                emailVerified: new Date(),
                phoneVerified: false,
                status: 'PENDING_VERIFICATION',
                country: 'Ghana',
                profileCompleted: false,
                category: 'TECHNICAL_SERVICES',
                verificationStatus: 'PENDING',
                isAvailableForBooking: false,
                isVerified: false,
                rating: 0.0,
                totalReviews: 0,
                totalEarnings: 0.0,
                completedBookings: 0,
                cancellationRate: 0.0,
                isActive: true,
                lastActive: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            });

            await tx.userProviderProfile.create({
              data: {
                id: uuidv4(),
                userId: newUser.id,
                providerId: provider.id,
                createdAt: new Date(),
              },
            });

            await tx.providerWallet.create({
              data: {
                id: uuidv4(),
                providerId: provider.id,
                balance: 0.0,
                currency: 'GHS',
                escrowBalance: 0.0,
                canWithdraw: true,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            });
          }

          return newUser;
        });

        user = result;
      }

      // Generate tokens
      const tokens = this.generateTokens({
        userId: user.id,
        email: user.email,
        roles: user.roles,
      });

      // Get full user session
      const userSession = await this.getUserSession(user.id);

      return {
        success: true,
        user: userSession,
        tokens,
      };
    } catch (error) {
      console.error('Google auth error:', error);
      return {
        success: false,
        error: 'An error occurred during Google authentication',
      };
    }
  }

  /**
   * Add a role to an existing user
   */
  static async addRoleToUser(userId: string, role: UserRole): Promise<AuthResult> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return {
          success: false,
          error: 'User not found',
        };
      }

      // Check if user already has this role
      if (user.roles.includes(role)) {
        return {
          success: false,
          error: 'User already has this role',
        };
      }

      await prisma.$transaction(async (tx) => {
        // Add role to user
        await tx.user.update({
          where: { id: userId },
          data: {
            roles: [...user.roles, role],
            updatedAt: new Date(),
          },
        });

        // Create appropriate profile if it doesn't exist
        if (role === 'CLIENT') {
          const existingProfile = await tx.userClientProfile.findUnique({
            where: { userId },
          });

          if (!existingProfile) {
            const client = await tx.client.create({
              data: {
                id: uuidv4(),
                email: user.email,
                name: user.name,
                image: user.image,
                emailVerified: user.emailVerified,
                phone: user.phone,
                phoneVerified: user.phoneVerified,
                status: user.status,
                country: 'Ghana',
                profileCompleted: false,
                lastActive: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            });

            await tx.userClientProfile.create({
              data: {
                id: uuidv4(),
                userId,
                clientId: client.id,
                createdAt: new Date(),
              },
            });

            await tx.clientWallet.create({
              data: {
                id: uuidv4(),
                clientId: client.id,
                balance: 0.0,
                currency: 'GHS',
                escrowBalance: 0.0,
                canWithdraw: true,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            });
          }
        } else if (role === 'PROVIDER') {
          const existingProfile = await tx.userProviderProfile.findUnique({
            where: { userId },
          });

          if (!existingProfile) {
            const provider = await tx.serviceProvider.create({
              data: {
                id: uuidv4(),
                email: user.email,
                name: user.name,
                image: user.image,
                emailVerified: user.emailVerified,
                phone: user.phone,
                phoneVerified: user.phoneVerified,
                status: user.status,
                country: 'Ghana',
                profileCompleted: false,
                category: 'TECHNICAL_SERVICES',
                verificationStatus: 'PENDING',
                isAvailableForBooking: false,
                isVerified: false,
                rating: 0.0,
                totalReviews: 0,
                totalEarnings: 0.0,
                completedBookings: 0,
                cancellationRate: 0.0,
                isActive: true,
                lastActive: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            });

            await tx.userProviderProfile.create({
              data: {
                id: uuidv4(),
                userId,
                providerId: provider.id,
                createdAt: new Date(),
              },
            });

            await tx.providerWallet.create({
              data: {
                id: uuidv4(),
                providerId: provider.id,
                balance: 0.0,
                currency: 'GHS',
                escrowBalance: 0.0,
                canWithdraw: true,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            });
          }
        }
      });

      // Get updated user session
      const updatedUser = await this.getUserSession(userId);

      return {
        success: true,
        user: updatedUser,
      };
    } catch (error) {
      console.error('Add role error:', error);
      return {
        success: false,
        error: 'An error occurred while adding role',
      };
    }
  }
}