// Core platform types for WorkLink Africa
export * from './auth';
import type { User } from './auth';

// Service Categories
export type ServiceCategory =
  | 'HOME_SERVICES'
  | 'TECHNICAL'
  | 'HEALTHCARE'
  | 'EDUCATION'
  | 'CREATIVE'
  | 'PROFESSIONAL_SERVICES'
  | 'OTHER';

// Location types
export interface Location {
  id: string;
  country: string;
  region: string;
  city: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Provider Profile
export interface ProviderProfile {
  id: string;
  userId: string;
  displayName: string;
  bio: string;
  hourlyRate: number;
  currency: string;
  categories: ServiceCategory[];
  services: string[];
  skills: string[];
  languages: string[];
  experience: number; // years
  locationId: string;
  location: Location;
  verificationStatus: 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
  verificationDocuments: VerificationDocument[];
  portfolio: PortfolioItem[];
  availability: ProviderAvailability;
  socialLinks: SocialLinks;
  rating: number;
  reviewCount: number;
  completedBookings: number;
  responseTime: number; // minutes
  completionRate: number; // percentage
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Client Profile
export interface ClientProfile {
  id: string;
  userId: string;
  preferredName?: string;
  locationId?: string;
  location?: Location;
  preferences: ClientPreferences;
  paymentMethods: PaymentMethod[];
  bookingHistory: Booking[];
  reviewsGiven: Review[];
  favoriteProviders: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Admin Profile
export interface AdminProfile {
  id: string;
  userId: string;
  permissions: AdminPermission[];
  department: string;
  createdAt: Date;
  updatedAt: Date;
}

// Verification Documents
export interface VerificationDocument {
  id: string;
  providerId: string;
  type: 'ID' | 'LICENSE' | 'CERTIFICATE' | 'ADDRESS_PROOF' | 'BACKGROUND_CHECK';
  title: string;
  documentUrl: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewedBy?: string;
  reviewedAt?: Date;
  notes?: string;
  expiryDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Portfolio Items
export interface PortfolioItem {
  id: string;
  providerId: string;
  title: string;
  description: string;
  imageUrls: string[];
  category: ServiceCategory;
  completedDate?: Date;
  clientTestimonial?: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Provider Availability
export interface ProviderAvailability {
  id: string;
  providerId: string;
  timezone: string;
  workingHours: WeeklySchedule;
  blockedDates: BlockedDate[];
  advanceBookingDays: number;
  minimumBookingHours: number;
  isInstantBooking: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WeeklySchedule {
  [key: string]: DaySchedule; // monday, tuesday, etc.
}

export interface DaySchedule {
  isAvailable: boolean;
  startTime: string; // HH:mm format
  endTime: string;
  breaks: TimeSlot[];
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
}

export interface BlockedDate {
  id: string;
  date: Date;
  reason: string;
  isFullDay: boolean;
  startTime?: string;
  endTime?: string;
}

// Social Links
export interface SocialLinks {
  website?: string;
  linkedin?: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
}

// Client Preferences
export interface ClientPreferences {
  preferredServiceCategories: ServiceCategory[];
  maxBudget?: number;
  preferredLanguages: string[];
  communicationPreferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  locationRadius: number; // km
}

// Booking System
export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'AWAITING_CLIENT_CONFIRMATION'
  | 'CANCELLED'
  | 'DISPUTED'
  | 'REFUNDED';

export interface Booking {
  id: string;
  clientId: string;
  client: ClientProfile;
  providerId: string;
  provider: ProviderProfile;
  serviceTitle: string;
  serviceDescription: string;
  category: ServiceCategory;
  scheduledDate: Date;
  startTime: string;
  endTime: string;
  duration: number; // minutes
  locationId?: string;
  location?: Location;
  isRemote: boolean;
  hourlyRate: number;
  totalAmount: number;
  currency: string;
  status: BookingStatus;
  paymentId?: string;
  payment?: Payment;
  notes?: string;
  cancellationReason?: string;
  cancelledBy?: string;
  cancelledAt?: Date;
  completedAt?: Date;
  messages: Message[];
  reviews: Review[];
  createdAt: Date;
  updatedAt: Date;
}

// Payment System
export type PaymentStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED';

export type PaymentMethod =
  | 'MOBILE_MONEY'
  | 'CARD'
  | 'BANK_TRANSFER'
  | 'WALLET';

export interface Payment {
  id: string;
  bookingId: string;
  booking: Booking;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  escrowStatus: 'HELD' | 'RELEASED' | 'REFUNDED';
  platformFee: number;
  providerAmount: number;
  paymentIntentId?: string; // Stripe payment intent
  mobileMoneyTransactionId?: string;
  refundAmount?: number;
  refundReason?: string;
  releasedAt?: Date;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Review System
export interface Review {
  id: string;
  bookingId: string;
  booking: Booking;
  reviewerId: string;
  reviewer: ClientProfile | ProviderProfile;
  revieweeId: string;
  reviewee: ClientProfile | ProviderProfile;
  rating: number; // 1-5
  comment: string;
  isPublic: boolean;
  response?: ReviewResponse;
  helpfulCount: number;
  reportCount: number;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReviewResponse {
  id: string;
  reviewId: string;
  text: string;
  createdAt: Date;
}

// Messaging System
export interface Conversation {
  id: string;
  bookingId?: string;
  booking?: Booking;
  participants: ConversationParticipant[];
  lastMessageId?: string;
  lastMessage?: Message;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationParticipant {
  id: string;
  conversationId: string;
  userId: string;
  user: User;
  joinedAt: Date;
  leftAt?: Date;
  lastReadAt?: Date;
}

export type MessageType = 'TEXT' | 'IMAGE' | 'DOCUMENT' | 'SYSTEM';

export interface Message {
  id: string;
  conversationId: string;
  conversation: Conversation;
  senderId: string;
  sender: User;
  type: MessageType;
  content: string;
  metadata?: MessageMetadata;
  isRead: boolean;
  readBy: MessageRead[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MessageMetadata {
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  imageUrl?: string;
  systemEventType?: string;
}

export interface MessageRead {
  id: string;
  messageId: string;
  userId: string;
  readAt: Date;
}

// Notification System
export type NotificationType =
  | 'BOOKING_REQUEST'
  | 'BOOKING_CONFIRMED'
  | 'BOOKING_CANCELLED'
  | 'PAYMENT_RECEIVED'
  | 'REVIEW_RECEIVED'
  | 'MESSAGE_RECEIVED'
  | 'PROFILE_VERIFIED'
  | 'SYSTEM_ANNOUNCEMENT';

export interface Notification {
  id: string;
  userId: string;
  user: User;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  readAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
}

// Search and Analytics
export interface SearchQuery {
  query?: string;
  category?: ServiceCategory;
  location?: {
    city: string;
    radius: number;
  };
  priceRange?: {
    min: number;
    max: number;
  };
  rating?: number;
  availability?: {
    date: Date;
    startTime: string;
    endTime: string;
  };
  sortBy: 'RELEVANCE' | 'PRICE_LOW' | 'PRICE_HIGH' | 'RATING' | 'DISTANCE';
  limit: number;
  offset: number;
}

export interface SearchResult {
  providers: ProviderProfile[];
  total: number;
  hasMore: boolean;
  filters: SearchFilters;
}

export interface SearchFilters {
  categories: { category: ServiceCategory; count: number }[];
  priceRanges: { range: string; count: number }[];
  locations: { city: string; count: number }[];
  ratings: { rating: number; count: number }[];
}

// Admin types
export type AdminPermission =
  | 'USER_MANAGEMENT'
  | 'BOOKING_MANAGEMENT'
  | 'PAYMENT_MANAGEMENT'
  | 'REVIEW_MODERATION'
  | 'VERIFICATION_MANAGEMENT'
  | 'ANALYTICS_ACCESS'
  | 'SYSTEM_SETTINGS';

export interface AdminDashboardStats {
  users: {
    total: number;
    clients: number;
    providers: number;
    newThisMonth: number;
  };
  bookings: {
    total: number;
    pending: number;
    completed: number;
    cancelled: number;
    revenue: number;
  };
  verification: {
    pending: number;
    approved: number;
    rejected: number;
  };
  disputes: {
    open: number;
    resolved: number;
  };
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// File Upload types
export interface UploadedFile {
  url: string;
  key: string;
  size: number;
  mimeType: string;
  originalName: string;
} 