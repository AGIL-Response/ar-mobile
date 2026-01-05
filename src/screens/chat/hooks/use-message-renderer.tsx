/**
 * Custom hook for message rendering logic
 * Single Responsibility: Determine message display properties and render messages
 */

import React, { JSX, useCallback } from 'react';
import type { ChatMessage, ChatRoom, ChatAttachment } from '@/services/chat';
import { isDifferentDay, formatDateSeparator } from '../utils/date-formatters';
import { Message } from '../components/message';

interface UseMessageRendererParams {
  messagesRef: React.MutableRefObject<ChatMessage[]>;
  room: ChatRoom | null;
  onAttachmentPress: (message: ChatMessage, attachment: ChatAttachment, index: number) => void;
}

interface UseMessageRendererReturn {
  keyExtractor: (item: ChatMessage) => string;
  renderItem: ({ item, index }: { item: ChatMessage; index: number }) => JSX.Element;
}

const GROUPING_TIME_THRESHOLD_MS = 60000; // 1 minute

/**
 * Hook to determine message display properties and render messages
 */
export function useMessageRenderer({
  messagesRef,
  room,
  onAttachmentPress,
}: UseMessageRendererParams): UseMessageRendererReturn {
  // Memoize keyExtractor - create unique key using id, clientId, and content hash
  // Include content hash to force re-render when content changes (important for transcribed messages)
  // This ensures LegendList doesn't recycle the view when only content changes
  const keyExtractor = useCallback((item: ChatMessage) => {
    if (!item) return '';
    const baseKey = item.clientId ? `${item.id}:${item.clientId}` : item.id;
    // Create a simple hash of content to force re-render when content changes
    // This is critical for transcribed messages where content updates but ID stays the same
    // Use a combination of content length and first/last few chars as a simple hash
    let contentHash = ':0';
    if (item.content && item.content.length > 0) {
      const len = item.content.length;
      const first = item.content.substring(0, Math.min(10, len));
      const last = item.content.substring(Math.max(0, len - 10));
      // Simple hash: length + first 10 chars + last 10 chars
      contentHash = `:${len}:${first.length}:${last.length}`;
    }
    return `${baseKey}${contentHash}`;
  }, []);

  // Memoize render item callback
  const renderItem = useCallback(
    ({ item, index }: { item: ChatMessage; index: number }) => {
      // Normal order: [oldest, ..., newest] (oldest first, newest last)
      // With alignItemsAtEnd: newest messages (last items) align to bottom
      const currentMessages = messagesRef.current;
      const previousMessage = index > 0 ? currentMessages[index - 1] : null; // Older message (above)
      const nextMessage =
        index < currentMessages.length - 1 ? currentMessages[index + 1] : null; // Newer message (below)

      // Show avatar when sender changes or it's the first message
      const showAvatar = !previousMessage || previousMessage.senderId !== item.senderId;

      // Show sender name for group chats when sender changes
      const showSenderName =
        room?.type === 'group' && (!previousMessage || previousMessage.senderId !== item.senderId);

      // Group messages from same sender (compact mode)
      // Group with next (newer) message if same sender and within 1 minute
      const isGrouped =
        nextMessage?.senderId === item.senderId &&
        Math.abs(
          new Date(item.timestamp).getTime() - new Date(nextMessage.timestamp).getTime()
        ) < GROUPING_TIME_THRESHOLD_MS;

      // Check if we need to show date separator
      const showDateSeparator =
        !previousMessage || isDifferentDay(previousMessage.timestamp, item.timestamp);
      const dateSeparatorText = showDateSeparator ? formatDateSeparator(item.timestamp) : undefined;

      return (
        <Message
          message={item}
          showAvatar={showAvatar}
          showSenderName={showSenderName}
          compact={!showAvatar && isGrouped}
          showDateSeparator={showDateSeparator}
          dateSeparatorText={dateSeparatorText}
          onAttachmentPress={(attachment, attachmentIndex) =>
            onAttachmentPress(item, attachment, attachmentIndex)
          }
        />
      );
    },
    [room?.type, messagesRef, onAttachmentPress]
  );

  return { keyExtractor, renderItem };
}

