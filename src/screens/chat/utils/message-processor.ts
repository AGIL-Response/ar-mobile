/**
 * Message processing utilities
 * Single Responsibility: Process and transform messages for display
 */

import type { ChatMessage } from '@/services/chat';

/**
 * Reverse messages array so newest messages are at the bottom
 * Messages come from DB sorted descending (newest first): [newest, ..., oldest]
 * After reversal: [oldest, ..., newest] - with alignItemsAtEnd, newest (last items) align to bottom
 */
export function reverseMessagesForDisplay(messages: ChatMessage[]): ChatMessage[] {
  return [...messages].reverse();
}

/**
 * Process messages for display: reverse only
 * Messages come from DB in descending order (newest first), need to reverse for display
 * Upserts handle deduplication at the database level, so no need to deduplicate here
 * Final order: [oldest, ..., newest] - with alignItemsAtEnd, newest (last items) align to bottom
 */
export function processMessagesForDisplay(messages: ChatMessage[]): ChatMessage[] {
  if (!messages || messages.length === 0) {
    return [];
  }
  return reverseMessagesForDisplay(messages);
}

