import { useState, useEffect } from 'react';
import { 
  addDocument, 
  updateDocument, 
  listenToActiveExchangeRequests,
  COLLECTIONS,
  ExchangeRequest 
} from '@/integrations/firebase/client';
import { useAuth } from './useAuth';

export const useRealtimeExchangeRequests = (exchangeType: 'need_cash' | 'need_upi') => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ExchangeRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRequests([]);
      setLoading(false);
      return;
    }

    const unsubscribe = listenToActiveExchangeRequests((data) => {
      // Filter out the current user's requests and filter by exchange type
      const filteredRequests = data.filter((request: any) => 
        request.userId !== user.uid && 
        request.exchangeType === exchangeType &&
        request.status === 'active'
      );
      setRequests(filteredRequests);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, exchangeType]);

  const createExchangeRequest = async (amount: number, type: 'need_cash' | 'need_upi', location?: string) => {
    if (!user) throw new Error('User not authenticated');

    // First, cancel any existing active requests for this user
    const existingRequests = requests.filter(req => 
      req.userId === user.uid && 
      req.status === 'active'
    );
    
    // Cancel existing requests
    for (const existingReq of existingRequests) {
      try {
        await updateDocument(COLLECTIONS.EXCHANGE_REQUESTS, existingReq.id, { 
          status: 'cancelled' 
        });
      } catch (error) {
        console.error('Failed to cancel existing request:', error);
      }
    }

    const requestData = {
      userId: user.uid,
      amount,
      exchangeType: type,
      status: 'active' as const,
      location: location ?? undefined,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
    };

    try {
      const requestId = await addDocument(COLLECTIONS.EXCHANGE_REQUESTS, requestData);
      return { data: { id: requestId }, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const updateExchangeRequest = async (requestId: string, updates: Partial<ExchangeRequest>) => {
    try {
      await updateDocument(COLLECTIONS.EXCHANGE_REQUESTS, requestId, updates);
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const cancelExchangeRequest = async (requestId: string) => {
    return updateExchangeRequest(requestId, { status: 'cancelled' });
  };

  return {
    requests,
    loading,
    createExchangeRequest,
    updateExchangeRequest,
    cancelExchangeRequest,
  };
};