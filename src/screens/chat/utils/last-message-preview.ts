/**
 * Last message preview utilities
 * Single Responsibility: Generate preview text for last message
 */

import type { ChatMessage } from '@/services/chat';

/**
 * Get preview text for the last message in a room
 */
export function getLastMessagePreview(lastMessage?: ChatMessage | null): string {
  if (!lastMessage) {
    return 'No messages yet';
  }

  const { content, attachments, files } = lastMessage;

  // If there's content, show it
  if (content && content.trim().length > 0) {
    return content;
  }

  // If no content but has attachments or files, show "Sent an attachment"
  const hasAttachments = (attachments && attachments.length > 0) || (files && files.length > 0);
  if (hasAttachments) {
    return 'Sent an attachment';
  }

  // Fallback for system messages or other types
  if (lastMessage.type === 'image') {
    return 'Image';
  }
  if (lastMessage.type === 'file') {
    return 'File';
  }

  return 'No messages yet';
}

