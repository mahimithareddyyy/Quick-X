import { useState, useEffect } from 'react';
import { 
  addDocument, 
  updateDocument, 
  listenToUserMatches,
  COLLECTIONS,
  Match 
} from '@/integrations/firebase/client';
import { useAuth } from './useAuth';

export const useRealtimeMatches = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setMatches([]);
      setLoading(false);
      return;
    }

    const unsubscribe = listenToUserMatches(user.uid, (data) => {
      setMatches(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const createMatch = async (exchangeRequestId: string) => {
    if (!user) throw new Error('User not authenticated');

    const matchData = {
      requesterId: user.uid,
      responderId: '', // This will be set when the match is accepted
      exchangeRequestId,
      status: 'pending' as const,
    };

    try {
      const matchId = await addDocument(COLLECTIONS.MATCHES, matchData);
      return { data: { id: matchId }, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const updateMatch = async (matchId: string, updates: Partial<Match>) => {
    try {
      await updateDocument(COLLECTIONS.MATCHES, matchId, updates);
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const acceptMatch = async (matchId: string, responderId: string) => {
    return updateMatch(matchId, { 
      status: 'accepted', 
      responderId 
    });
  };

  const rejectMatch = async (matchId: string) => {
    return updateMatch(matchId, { status: 'rejected' });
  };

  const completeMatch = async (matchId: string) => {
    return updateMatch(matchId, { status: 'completed' });
  };

  return {
    matches,
    loading,
    createMatch,
    updateMatch,
    acceptMatch,
    rejectMatch,
    completeMatch,
  };
};