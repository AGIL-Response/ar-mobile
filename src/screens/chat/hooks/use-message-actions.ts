/**
 * Custom hook for message actions
 * Single Responsibility: Handle message-related actions (send, reply, typing)
 */

import { useCallback, useState } from 'react';
import { chatService } from '@/services/chat';
import type { ChatMessage, SendMessageData } from '@/services/chat';

interface UseMessageActionsParams {
  roomId: string | undefined;
}

interface UseMessageActionsReturn {
  replyTo: { messageId: string; content: string } | undefined;
  handleSend: (data: Omit<SendMessageData, 'roomId'> & { localMessage?: ChatMessage }) => Promise<void>;
  handleTyping: (isTyping: boolean) => void;
  handleMessagePress: (message: ChatMessage) => void;
  handleCancelReply: () => void;
}

/**
 * Hook to manage message actions (send, reply, typing)
 */
export function useMessageActions({ roomId }: UseMessageActionsParams): UseMessageActionsReturn {
  const [replyTo, setReplyTo] = useState<{ messageId: string; content: string } | undefined>();

  const handleSend = useCallback(
    async (data: Omit<SendMessageData, 'roomId'> & { localMessage?: ChatMessage }) => {
      if (!roomId) return;

      try {
        const { localMessage, ...sendData } = data;
        await chatService.sendMessage(
          {
            ...sendData,
            roomId,
          },
          sendData.fileIds,
          localMessage
        );

        // Clear reply
        setReplyTo(undefined);
      } catch (error) {
        console.error('Failed to send message:', error);
        throw error;
      }
    },
    [roomId]
  );

  const handleTyping = useCallback(
    (isTyping: boolean) => {
      if (roomId) {
        chatService.setTyping(roomId, isTyping);
      }
    },
    [roomId]
  );

  const handleMessagePress = useCallback((message: ChatMessage) => {
    // TODO: Show message options (reply, edit, delete, etc.)
    setReplyTo({
      messageId: message.id,
      content: message.content,
    });
  }, []);

  const handleCancelReply = useCallback(() => {
    setReplyTo(undefined);
  }, []);

  return {
    replyTo,
    handleSend,
    handleTyping,
    handleMessagePress,
    handleCancelReply,
  };
}

