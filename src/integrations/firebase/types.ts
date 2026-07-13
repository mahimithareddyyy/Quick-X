// Firebase Firestore types for the QuickX application

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

export interface Profile {
  id: string;
  userId: string;
  firstName: string | null;
  lastName: string | null;
  collegeEmail: string | null;
  collegeRollNumber: string | null;
  studentId: string | null;
  phoneNumber: string | null;
  trustScore: number;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExchangeRequest {
  id: string;
  userId: string;
  amount: number;
  exchangeType: 'need_cash' | 'need_upi';
  status: 'active' | 'matched' | 'completed' | 'cancelled';
  location?: string;
  locationDetails?: string;
  availabilityStart?: Date;
  availabilityEnd?: Date;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
}

export interface Match {
  id: string;
  requesterId: string;
  responderId: string;
  exchangeRequestId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  matchId: string;
  senderId: string;
  content: string;
  messageType: 'text' | 'system' | 'location';
  createdAt: Date;
}

export interface Transaction {
  id: string;
  matchId: string;
  cashProviderId: string;
  upiProviderId: string;
  amount: number;
  status: 'pending' | 'cash_confirmed' | 'upi_confirmed' | 'completed' | 'cancelled';
  cashConfirmedAt?: Date;
  upiConfirmedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
}

export interface Rating {
  id: string;
  raterId: string;
  ratedUserId: string;
  transactionId: string;
  rating: number;
  review?: string;
  createdAt: Date;
}

export interface TrustScoreHistory {
  id: string;
  userId: string;
  previousScore: number;
  newScore: number;
  reason: string;
  createdAt: Date;
}

export interface VerificationDocument {
  id: string;
  userId: string;
  documentType: string;
  fileUrl: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  uploadedAt: Date;
  verifiedAt?: Date;
}

export interface CampusLocation {
  id: string;
  campusName: string;
  latitude: number;
  longitude: number;
  radiusMeters?: number;
  isActive: boolean;
  createdAt: Date;
}

// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  PROFILES: 'profiles',
  EXCHANGE_REQUESTS: 'exchangeRequests',
  MATCHES: 'matches',
  MESSAGES: 'messages',
  TRANSACTIONS: 'transactions',
  RATINGS: 'ratings',
  TRUST_SCORE_HISTORY: 'trustScoreHistory',
  VERIFICATION_DOCUMENTS: 'verificationDocuments',
  CAMPUS_LOCATIONS: 'campusLocations',
  TYPE1_REQUESTS: 'type1Requests',
  TYPE2_REQUESTS: 'type2Requests',
} as const;

// Firestore rules helpers
export const FIRESTORE_RULES = {
  // User can only access their own profile
  profileAccess: (userId: string) => `resource.data.userId == '${userId}'`,
  
  // User can access exchange requests they created or are active
  exchangeRequestAccess: (userId: string) => 
    `resource.data.userId == '${userId}' || resource.data.status == 'active'`,
  
  // User can access matches they are part of
  matchAccess: (userId: string) => 
    `resource.data.requesterId == '${userId}' || resource.data.responderId == '${userId}'`,
  
  // User can access messages in their matches
  messageAccess: (userId: string) => 
    `exists(/databases/$(database)/documents/matches/$(resource.data.matchId)) && 
     (get(/databases/$(database)/documents/matches/$(resource.data.matchId)).data.requesterId == '${userId}' || 
      get(/databases/$(database)/documents/matches/$(resource.data.matchId)).data.responderId == '${userId}')`,
} as const;
