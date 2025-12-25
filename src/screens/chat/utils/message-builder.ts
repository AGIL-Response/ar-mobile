/**
 * Message builder utilities
 * Single Responsibility: Build message objects for sending
 */

import type { ChatMessage, ChatAttachment } from '@/services/chat';
import type { MediaFile } from '@/utils/media';
import { generateUUID, generateClientId } from '@/utils/uuid';
import { getMimeType } from '@/utils/media';

export interface MessageBuilderOptions {
  roomId: string;
  content: string;
  type: 'text' | 'file' | 'image';
  replyTo?: string;
  localAttachments?: ChatAttachment[];
  attachmentsToSend?: MediaFile[];
  currentUser: {
    id: string;
    username?: string;
    displayName?: string;
    avatarUrl?: string;
  };
}

/**
 * Build a local message object for optimistic UI updates
 */
export function buildLocalMessage(options: MessageBuilderOptions): ChatMessage {
  const {
    roomId,
    content,
    type,
    replyTo,
    localAttachments = [],
    attachmentsToSend = [],
    currentUser,
  } = options;

  const messageId = generateUUID();
  const clientId = generateClientId();

  return {
    id: messageId,
    roomId,
    senderId: currentUser.id,
    sender: {
      id: currentUser.id,
      username: currentUser.username,
      displayName: currentUser.displayName,
      avatarUrl: currentUser.avatarUrl,
    },
    content,
    type,
    attachments: localAttachments.length > 0
      ? localAttachments.map((att, idx) => ({
          ...att,
          url: attachmentsToSend[idx]?.uri || att.url, // Use local URI temporarily
        }))
      : undefined,
    timestamp: new Date(),
    replyTo,
    status: 'sending',
    clientId,
  };
}

/**
 * Determine message type based on attachments
 */
export function determineMessageType(
  attachments: MediaFile[]
): 'text' | 'file' | 'image' {
  if (attachments.length === 0) return 'text';
  
  const firstAttachment = attachments[0];
  const mediaType = firstAttachment.type;
  
  return mediaType === 'image' || mediaType === 'video' ? 'image' : 'file';
}

