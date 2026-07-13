import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot, 
  serverTimestamp,
  Timestamp,
  DocumentData,
  QueryConstraint,
  Unsubscribe
} from 'firebase/firestore';
import { setDoc } from 'firebase/firestore';
import type { User as FirebaseAuthUser } from 'firebase/auth';
import { db } from './client';
import { COLLECTIONS } from './types';

// Helper function to convert Firestore timestamp to Date
export const timestampToDate = (timestamp: any): Date => {
  if (timestamp && timestamp.toDate) {
    return timestamp.toDate();
  }
  if (timestamp instanceof Date) {
    return timestamp;
  }
  return new Date(timestamp);
};

// Helper function to convert Date to Firestore timestamp
export const dateToTimestamp = (date: Date) => {
  return Timestamp.fromDate(date);
};

// Generic function to add a document to a collection
export const addDocument = async <T extends DocumentData>(
  collectionName: string,
  data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  const docRef = await addDoc(collection(db, collectionName), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

// Generic function to update a document
export const updateDocument = async <T extends DocumentData>(
  collectionName: string,
  id: string,
  data: Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> => {
  const docRef = doc(db, collectionName, id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

// Generic function to delete a document
export const deleteDocument = async (
  collectionName: string,
  id: string
): Promise<void> => {
  const docRef = doc(db, collectionName, id);
  await deleteDoc(docRef);
};

// Generic function to get a document by ID
export const getDocument = async <T extends DocumentData>(
  collectionName: string,
  id: string
): Promise<T | null> => {
  const docRef = doc(db, collectionName, id);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return ({ id: docSnap.id, ...docSnap.data() } as unknown) as T;
  }
  return null;
};

// Generic function to get documents with query constraints
export const getDocuments = async <T extends DocumentData>(
  collectionName: string,
  constraints: QueryConstraint[] = []
): Promise<T[]> => {
  const q = query(collection(db, collectionName), ...constraints);
  const querySnapshot = await getDocs(q);
  
  return (querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as unknown) as T[];
};

// Generic function to listen to documents with real-time updates
export const listenToDocuments = <T extends DocumentData>(
  collectionName: string,
  constraints: QueryConstraint[] = [],
  callback: (docs: T[]) => void
): Unsubscribe => {
  const q = query(collection(db, collectionName), ...constraints);
  
  return onSnapshot(q, (querySnapshot) => {
    const docs = (querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as unknown) as T[];
    callback(docs);
  });
};

// Generic function to listen to a single document
export const listenToDocument = <T extends DocumentData>(
  collectionName: string,
  id: string,
  callback: (doc: T | null) => void
): Unsubscribe => {
  const docRef = doc(db, collectionName, id);
  
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback(({ id: docSnap.id, ...docSnap.data() } as unknown) as T);
    } else {
      callback(null);
    }
  });
};

// Specific utility functions for common queries
export const getActiveExchangeRequests = () => {
  return getDocuments(COLLECTIONS.EXCHANGE_REQUESTS, [
    where('status', '==', 'active'),
    orderBy('createdAt', 'desc')
  ]);
};

export const getUserMatches = (userId: string) => {
  return getDocuments(COLLECTIONS.MATCHES, [
    where('requesterId', '==', userId)
  ]);
};

export const getMatchMessages = (matchId: string) => {
  return getDocuments(COLLECTIONS.MESSAGES, [
    where('matchId', '==', matchId),
    orderBy('createdAt', 'asc')
  ]);
};

export const listenToActiveExchangeRequests = (callback: (requests: any[]) => void) => {
  return listenToDocuments(COLLECTIONS.EXCHANGE_REQUESTS, [
    where('status', '==', 'active'),
    orderBy('createdAt', 'desc')
  ], callback);
};

export const listenToUserMatches = (userId: string, callback: (matches: any[]) => void) => {
  return listenToDocuments(COLLECTIONS.MATCHES, [
    where('requesterId', '==', userId)
  ], callback);
};

export const listenToMatchMessages = (matchId: string, callback: (messages: any[]) => void) => {
  return listenToDocuments(COLLECTIONS.MESSAGES, [
    where('matchId', '==', matchId),
    orderBy('createdAt', 'asc')
  ], callback);
};

// Ensure a user document exists and is up-to-date in `users` collection
export const ensureUserDocument = async (
  authUser: FirebaseAuthUser | null,
  overrides?: { firstName?: string | null; lastName?: string | null }
) => {
  if (!authUser) return;

  const userDocRef = doc(db, COLLECTIONS.USERS, authUser.uid);

  // Derive names
  const displayName = authUser.displayName ?? '';
  const [derivedFirst, ...rest] = displayName.trim().split(/\s+/).filter(Boolean);
  const derivedLast = rest.length ? rest.join(' ') : '';

  // Fallback derivation from email local-part if displayName not available
  let fromEmailFirst: string | null = null;
  let fromEmailLast: string | null = null;
  if (!derivedFirst && authUser.email) {
    const localPart = authUser.email.split('@')[0] ?? '';
    const tokens = localPart
      .replace(/[^a-zA-Z]+/g, ' ')
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (tokens.length > 0) {
      const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
      fromEmailFirst = cap(tokens[0]);
      fromEmailLast = tokens.length > 1 ? cap(tokens.slice(1).join(' ')) : null;
    }
  }

  const firstName = (overrides?.firstName ?? derivedFirst ?? fromEmailFirst ?? null) as string | null;
  const lastName = (overrides?.lastName ?? derivedLast ?? fromEmailLast ?? null) as string | null;

  // Only keep required fields and fully replace the document (removes unwanted keys)
  const data = {
    uid: authUser.uid,
    email: authUser.email ?? null,
    firstName,
    lastName,
  } as const;

  await setDoc(userDocRef, data as any, { merge: true });
};

// Create or update the user's profile document with optional fields like phoneNumber
export const upsertUserProfile = async (
  userId: string,
  profile: { phoneNumber?: string | null; phoneVerified?: boolean }
) => {
  const profileRef = doc(db, COLLECTIONS.USERS, userId);
  await setDoc(
    profileRef,
    {
      userId,
      phoneNumber: profile.phoneNumber ?? null,
      phoneVerified: profile.phoneVerified ?? false,
      trustScore: 50,
      verificationStatus: 'pending',
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
};

// Merge phone details into users/{uid}
export const setUserPhoneOnUserDoc = async (
  userId: string,
  phoneNumber: string | null,
  phoneVerified: boolean
) => {
  const userDocRef = doc(db, COLLECTIONS.USERS, userId);
  await setDoc(
    userDocRef,
    {
      phoneNumber,
      phoneVerified,
      updatedAt: serverTimestamp(),
    } as any,
    { merge: true }
  );
};

// Create a request document for Type1 or Type2 clicks
export const createTypeRequest = async (
  kind: 'type1' | 'type2',
  data: {
    receiverId: string; // Firestore doc id of the receiver user (if known)
    money: number;
    status: 'pending' | 'active' | 'completed' | 'cancelled';
    location?: string | null;
    createdBy: string; // uid of current user
  }
) => {
  const collectionName = kind === 'type1' ? COLLECTIONS.TYPE1_REQUESTS : COLLECTIONS.TYPE2_REQUESTS;
  const id = await addDocument(collectionName, {
    receiverId: data.receiverId,
    money: data.money,
    status: data.status,
    location: data.location ?? null,
    createdBy: data.createdBy,
  } as any);
  return id;
};
