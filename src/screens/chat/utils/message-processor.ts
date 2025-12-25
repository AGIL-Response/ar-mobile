/**
 * Message processing utilities
 * Single Responsibility: Process and transform messages for display
 */

import type { ChatMessage } from '@/services/chat';

/**
 * Create unique key for message (handles local vs server messages)
 */
export function createMessageKey(message: ChatMessage): string {
  return message.clientId ? `${message.id}:${message.clientId}` : message.id;
}

/**
 * Deduplicate messages by creating a map keyed by unique identifier
 * Use id + clientId combination for uniqueness (handles local vs server messages)
 */
export function deduplicateMessages(messages: ChatMessage[]): ChatMessage[] {
  if (!messages || messages.length === 0) {
    return [];
  }

  const messageMap = new Map<string, ChatMessage>();
  for (const msg of messages) {
    const uniqueKey = createMessageKey(msg);
    // Only keep the first occurrence
    if (!messageMap.has(uniqueKey)) {
      messageMap.set(uniqueKey, msg);
    }
  }

  return Array.from(messageMap.values());
}

/**
 * Reverse messages array so newest messages are at the bottom
 * Array: [newest, ..., oldest] - with alignItemsAtEnd, newest (index 0) aligns to bottom
 */
export function reverseMessagesForDisplay(messages: ChatMessage[]): ChatMessage[] {
  return [...messages].reverse();
}

/**
 * Process messages for display: deduplicate and reverse
 */
export function processMessagesForDisplay(messages: ChatMessage[]): ChatMessage[] {
  const deduplicated = deduplicateMessages(messages);
  return reverseMessagesForDisplay(deduplicated);
}

