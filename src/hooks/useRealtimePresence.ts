import { useState, useEffect } from 'react';
import { 
  doc, 
  onSnapshot, 
  setDoc, 
  serverTimestamp,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { db } from '@/integrations/firebase/client';
import { useAuth } from './useAuth';

interface PresenceData {
  userId: string;
  isOnline: boolean;
  lastSeen: any;
}

export const useRealtimePresence = () => {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [totalOnline, setTotalOnline] = useState(0);

  useEffect(() => {
    if (!user) return;

    // Set user as online when they connect
    const userPresenceRef = doc(db, 'presence', user.uid);
    setDoc(userPresenceRef, {
      userId: user.uid,
      isOnline: true,
      lastSeen: serverTimestamp(),
    }, { merge: true }); // Use merge to prevent creating duplicate documents

    // Listen to all presence documents
    const presenceQuery = query(collection(db, 'presence'));
    const unsubscribe = onSnapshot(presenceQuery, (snapshot) => {
      const online = new Set<string>();
      snapshot.forEach((doc) => {
        const data = doc.data() as PresenceData;
        if (data.isOnline) {
          online.add(data.userId);
        }
      });
      setOnlineUsers(online);
      setTotalOnline(online.size);
    });

    // Set user as offline when they disconnect
    const handleBeforeUnload = () => {
      setDoc(userPresenceRef, {
        userId: user.uid,
        isOnline: false,
        lastSeen: serverTimestamp(),
      }, { merge: true });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      unsubscribe();
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Set user as offline when component unmounts
      setDoc(userPresenceRef, {
        userId: user.uid,
        isOnline: false,
        lastSeen: serverTimestamp(),
      }, { merge: true });
    };
  }, [user]);

  const isUserOnline = (userId: string): boolean => {
    return onlineUsers.has(userId);
  };

  return {
    onlineUsers: Array.from(onlineUsers),
    totalOnline,
    isUserOnline,
  };
};