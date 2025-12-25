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

  // Build attachments with local file paths for immediate preview
  // Priority: use local file URI from attachmentsToSend, otherwise use localAttachments URL
  const attachments: ChatAttachment[] | undefined = 
    attachmentsToSend.length > 0
      ? attachmentsToSend.map((file, idx) => {
          const localAtt = localAttachments[idx];
          const attachment = {
            id: localAtt?.id || generateUUID(), // Use uploaded fileId if available, otherwise generate UUID
            filename: file.name || localAtt?.filename || 'file',
            url: file.uri || localAtt?.url || '', // Use local file URI for immediate preview
            size: file.size || localAtt?.size || 0,
            mimeType: file.mimeType || getMimeType(file.name) || localAtt?.mimeType || 'application/octet-stream',
            uploadedAt: localAtt?.uploadedAt || new Date(),
            thumbnail: localAtt?.thumbnail,
            // Priority: use duration from file (for audio recordings), then localAtt, then undefined
            duration: file.duration || localAtt?.duration,
          };
          
          // Debug logging
          console.log('[MessageBuilder] Building attachment with local path:', {
            filename: attachment.filename,
            url: attachment.url?.substring(0, 50) + '...',
            hasLocalUri: !!file.uri,
            hasLocalAttUrl: !!localAtt?.url,
          });
          
          return attachment;
        })
      : localAttachments.length > 0
      ? localAttachments
      : undefined;
  
  // Debug logging
  if (attachments && attachments.length > 0) {
    console.log('[MessageBuilder] Built local message with attachments:', {
      messageId,
      attachmentCount: attachments.length,
      type,
      hasContent: !!content,
    });
  }

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
    attachments,
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

