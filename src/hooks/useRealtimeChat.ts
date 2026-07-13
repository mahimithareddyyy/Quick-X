import { useState, useEffect } from 'react';
import { 
  addDocument, 
  listenToMatchMessages,
  COLLECTIONS,
  Message 
} from '@/integrations/firebase/client';
import { useAuth } from './useAuth';

export const useRealtimeChat = (matchId: string) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!matchId || !user) {
      setMessages([]);
      setLoading(false);
      return;
    }

    const unsubscribe = listenToMatchMessages(matchId, (data) => {
      setMessages(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [matchId, user]);

  const sendMessage = async (content: string, messageType: 'text' | 'system' | 'location' = 'text') => {
    if (!user || !matchId) throw new Error('User not authenticated or match ID missing');

    const messageData = {
      matchId,
      senderId: user.uid,
      content,
      messageType,
    };

    try {
      const messageId = await addDocument(COLLECTIONS.MESSAGES, messageData);
      return { data: { id: messageId }, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const sendTextMessage = async (content: string) => {
    return sendMessage(content, 'text');
  };

  const sendSystemMessage = async (content: string) => {
    return sendMessage(content, 'system');
  };

  const sendLocationMessage = async (location: string) => {
    return sendMessage(location, 'location');
  };

  return {
    messages,
    loading,
    sendMessage,
    sendTextMessage,
    sendSystemMessage,
    sendLocationMessage,
  };
};