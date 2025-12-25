/**
 * Custom hook for messages management
 * Single Responsibility: Manage messages observables and processing
 */

import { useMemo, useRef } from 'react';
import { useObservable } from '@/lib/hooks/use-observable';
import { chatService } from '@/services/chat';
import type { ChatMessage } from '@/services/chat';
import { processMessagesForDisplay } from '../utils/message-processor';

interface UseMessagesParams {
  roomId: string | undefined;
}

interface UseMessagesReturn {
  messages: ChatMessage[];
  messagesRef: React.MutableRefObject<ChatMessage[]>;
}

/**
 * Hook to manage messages observables and processing
 */
export function useMessages({ roomId }: UseMessagesParams): UseMessagesReturn {
  const messagesRef = useRef<ChatMessage[]>([]);

  // Memoize messages observable to prevent recreation on every render
  const observableMessages = useMemo(() => {
    if (!roomId || typeof roomId !== 'string' || roomId.trim() === '') {
      return null;
    }
    try {
      // Observe ALL messages for the room (no limit) - sorted by created_at ascending
      // The observable will automatically update when new messages are inserted into DB
      return chatService.observeMessages(roomId);
    } catch (error) {
      console.error('❌ [RoomScreen] Error creating messages observable:', error, { roomId });
      return null;
    }
  }, [roomId]);

  const messagesObservableResult = useObservable(observableMessages, []);

  // Process messages for display: deduplicate and reverse
  // Messages are already sorted by created_at ascending (oldest first, newest last)
  // With alignItemsAtEnd, keep normal order - newest messages (last items) will align to bottom
  // Stable reference: only create new array when messagesObservableResult reference changes
  const messages = useMemo(() => {
    if (!messagesObservableResult || messagesObservableResult.length === 0) {
      messagesRef.current = [];
      return [];
    }

    const processed = processMessagesForDisplay(messagesObservableResult);
    
    // Debug logging for messages with attachments
    const messagesWithAttachments = processed.filter(m => m.attachments && m.attachments.length > 0);
    if (messagesWithAttachments.length > 0) {
      console.log('🔍 [useMessages] Processed messages with attachments:', {
        totalMessages: processed.length,
        messagesWithAttachments: messagesWithAttachments.length,
        messages: messagesWithAttachments.map(m => ({
          id: m.id,
          type: m.type,
          attachmentCount: m.attachments?.length || 0,
          hasContent: !!m.content,
          attachments: m.attachments?.map(a => ({
            id: a.id,
            filename: a.filename,
            hasUrl: !!a.url,
            url: a.url?.substring(0, 30) + '...',
          })),
        })),
      });
    }
    
    messagesRef.current = processed;
    return processed;
  }, [messagesObservableResult]);

  return { messages, messagesRef };
}

