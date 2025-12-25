import { getDatabase } from '../../index';
import type Message from '../../models/Message';
import type Attachment from '../../models/Attachment';
import type User from '../../models/User';
import type { ChatMessage, ChatUser } from '../../../types';
import { Q } from '@nozbe/watermelondb';

const db = getDatabase();

// Cache to track which senderIds we've already warned about to reduce log spam
const warnedMissingUsers = new Set<string>();

/**
 * Safely convert a value to a string ID
 */
function ensureStringId(value: any, fieldName: string = 'id'): string {
  if (value === null || value === undefined) {
    throw new Error(`${fieldName} is null or undefined`);
  }

  if (typeof value === 'string') {
    if (value.trim() === '' || value === '[object Object]' || value === 'undefined' || value === 'null') {
      throw new Error(`Invalid string ID for ${fieldName}: '${value}'`);
    }
    return value;
  }

  if (typeof value === 'number') {
    return String(value);
  }

  if (typeof value === 'object') {
    const possibleIdFields = ['id', '_id', 'uuid', 'uid'];
    for (const key of possibleIdFields) {
      if (key in value && typeof value[key] === 'string') {
        return value[key];
      }
    }

    if (typeof value.toString === 'function') {
      const stringValue = value.toString();
      if (stringValue !== '[object Object]' && stringValue !== '') {
        return stringValue;
      }
    }

    try {
      const stringified = JSON.stringify(value);
      if (stringified && stringified !== 'null' && stringified !== 'undefined' && stringified.length < 200) {
        console.warn(`Converted object to string ID for ${fieldName} using JSON.stringify:`, value);
        return stringified;
      }
    } catch (e) {
      // JSON.stringify failed
    }

    console.error(`Cannot convert object to string ID for ${fieldName}:`, value);
    throw new Error(`${fieldName} is an object that cannot be converted to a string ID: ${JSON.stringify(value)}`);
  }

  const stringValue = String(value);
  if (stringValue === '[object Object]' || stringValue === 'undefined' || stringValue === 'null') {
    throw new Error(`${fieldName} cannot be converted to a valid string ID (got: ${typeof value})`);
  }
  return stringValue;
}

/**
 * Convert ChatMessage to WatermelonDB Message model data
 */
export function chatMessageToMessageData(messageData: ChatMessage, roomId: string): {
  messageId: string;
  roomId: string;
  senderId: string;
  content: string;
  type: 'text' | 'file' | 'image' | 'system';
  replyToId?: string;
  editedAt?: number;
  isSynced: boolean;
  serverCreatedAt: string;
  serverUpdatedAt: string;
  status?: 'sending' | 'sent' | 'error';
  clientId?: string;
} {
  let messageId: string;
  if (typeof messageData.id === 'string') {
    messageId = messageData.id;
  } else if (typeof messageData.id === 'number') {
    messageId = String(messageData.id);
  } else if (messageData.id && typeof messageData.id === 'object' && 'id' in messageData.id) {
    messageId = String((messageData.id as any).id);
  } else {
    messageId = String(messageData.id);
  }

  const validRoomId = typeof roomId === 'string' ? roomId : String(roomId);

  if (!messageId || messageId === 'undefined' || messageId === 'null' || messageId === '[object Object]') {
    throw new Error(`Invalid message ID: ${messageData.id} (type: ${typeof messageData.id})`);
  }

  const timestamp = messageData.timestamp || new Date();

  return {
    messageId,
    roomId: validRoomId,
    senderId: typeof messageData.senderId === 'string' ? messageData.senderId : String(messageData.senderId),
    content: messageData.content || '',
    type: messageData.type || 'text', // Ensure type is always set
    replyToId: messageData.replyTo,
    editedAt: messageData.editedAt ? messageData.editedAt.getTime() : undefined,
    isSynced: true,
    serverCreatedAt: timestamp.toISOString(),
    serverUpdatedAt: timestamp.toISOString(),
    status: messageData.status,
    clientId: messageData.clientId,
  };
}

/**
 * Convert WatermelonDB Message to ChatMessage
 */
export async function messageToChatMessage(message: Message, getUserFn: (userId: string) => Promise<ChatUser | null>): Promise<ChatMessage> {
  // Query attachments directly by message_id field (not using the broken relation)
  // The relation tries to match against WatermelonDB's internal id, but we store business IDs
  let rawAttachments = await db
    .get<Attachment>('attachments')
    .query(Q.where('message_id', message.messageId))
    .fetch();

  // Debug logging - always log, even if no attachments found
  console.log('🔍 [MessageTransformer] Querying attachments for message:', {
    messageId: message.messageId,
    messageType: message.type,
    hasContent: !!message.content,
    clientId: message.clientId,
    foundAttachmentCount: rawAttachments.length,
  });

  // If no attachments found by messageId, try multiple strategies:
  // 1. Retry query with the same messageId (in case attachments were just saved)
  // 2. If message has clientId, find all messages with that clientId and check their attachments
  if (rawAttachments.length === 0) {
    // Strategy 1: Retry with the same messageId (handles race conditions)
    const retryAttachments = await db
      .get<Attachment>('attachments')
      .query(Q.where('message_id', message.messageId))
      .fetch();

    if (retryAttachments.length > 0) {
      rawAttachments = retryAttachments;
      console.log('✅ [MessageTransformer] Found attachments on retry:', {
        messageId: message.messageId,
        attachmentCount: rawAttachments.length,
      });
    }
  }

  // Strategy 2: If still no attachments and message has clientId, try finding by clientId
  // This handles cases where the messageId might have changed (e.g., local UUID to server ID)
  if (rawAttachments.length === 0 && message.clientId) {
    // Find the message(s) with this clientId
    const messagesByClientId = await db
      .get<Message>('messages')
      .query(Q.where('client_id', message.clientId))
      .fetch();

    console.log('🔍 [MessageTransformer] No attachments found, trying clientId strategy:', {
      messageId: message.messageId,
      clientId: message.clientId,
      messagesWithClientId: messagesByClientId.map(m => m.messageId),
    });

    // Try to find attachments for ANY message with this clientId (including same messageId)
    for (const msgWithClientId of messagesByClientId) {
      const alternateAttachments = await db
        .get<Attachment>('attachments')
        .query(Q.where('message_id', msgWithClientId.messageId))
        .fetch();

      if (alternateAttachments.length > 0) {
        rawAttachments = alternateAttachments;
        console.log('✅ [MessageTransformer] Found attachments with messageId (by clientId):', {
          queriedMessageId: message.messageId,
          foundAtMessageId: msgWithClientId.messageId,
          sameMessageId: msgWithClientId.messageId === message.messageId,
          clientId: message.clientId,
          attachmentCount: rawAttachments.length,
        });
        break; // Found attachments, stop searching
      }
    }
  }

  // Debug logging for attachments query
  if (rawAttachments.length > 0) {
    console.log('✅ [MessageTransformer] Found attachments in DB:', {
      messageId: message.messageId,
      attachmentCount: rawAttachments.length,
      attachments: rawAttachments.map(a => ({
        id: a.attachmentId,
        filename: a.filename,
        hasUrl: !!a.url && a.url.trim().length > 0,
        url: a.url?.substring(0, 30) || 'empty',
        hasLocalPath: !!a.localPath && a.localPath.trim().length > 0,
        localPath: a.localPath?.substring(0, 30) || 'none',
        messageId: (a as any).messageId, // Log the messageId the attachment is linked to
      })),
    });
  } else {
    console.warn('⚠️ [MessageTransformer] No attachments found in DB for message:', {
      messageId: message.messageId,
      messageType: message.type,
      clientId: message.clientId,
      hasContent: !!message.content,
    });

    // Additional debug: Query all attachments in the room to see what exists
    if (message.type === 'image' || message.type === 'file') {
      try {
        const allRoomAttachments = await db
          .get<Attachment>('attachments')
          .query(Q.where('message_id', message.roomId))
          .fetch();

        // Actually, query doesn't work that way. Let's try a different approach - query recent attachments
        // But this is expensive, so only do it as debug
        console.warn('⚠️ [MessageTransformer] Debug: Message type suggests it should have attachments', {
          messageId: message.messageId,
          type: message.type,
        });
      } catch (e) {
        // Ignore debug query errors
      }
    }
  }

  // Deduplicate by attachment_id (keep first occurrence of each unique ID)
  const attachments = rawAttachments.reduce((acc, current) => {
    const exists = acc.find(item => item.attachmentId === current.attachmentId);
    if (!exists) {
      acc.push(current);
    }
    return acc;
  }, [] as Attachment[]);


  // Fetch sender from users table
  let sender: ChatUser = {
    id: message.senderId,
  };

  try {
    // Try to fetch via relation first
    const senderUser = await (message.sender as any).fetch();
    sender = {
      id: senderUser.userId,
      username: senderUser.username,
      email: senderUser.email,
      displayName: senderUser.displayName,
      avatarUrl: senderUser.avatarUrl,
      status: senderUser.status,
      lastSeen: senderUser.lastSeen ? new Date(senderUser.lastSeen) : undefined,
    };
  } catch (error) {
    // If relation fetch fails, try to fetch directly from users table
    // Don't log here - only log if user is actually missing after all attempts

    try {
      const users = await db
        .get<User>('users')
        .query(Q.where('user_id', message.senderId))
        .fetch();

      if (users.length > 0) {
        const senderUser = users[0];
        sender = {
          id: senderUser.userId,
          username: senderUser.username,
          email: senderUser.email,
          displayName: senderUser.displayName,
          avatarUrl: senderUser.avatarUrl,
          status: senderUser.status,
          lastSeen: senderUser.lastSeen ? new Date(senderUser.lastSeen) : undefined,
        };
        // User found, remove from warned set in case it was previously missing
        warnedMissingUsers.delete(message.senderId);
      } else {
        // Try using the provided getUserFn as fallback
        const fallbackSender = await getUserFn(message.senderId);
        if (fallbackSender) {
          sender = fallbackSender;
          // User found via fallback, remove from warned set
          warnedMissingUsers.delete(message.senderId);
        } else {
          // User is definitely missing - only warn once per senderId
          if (!warnedMissingUsers.has(message.senderId)) {
            warnedMissingUsers.add(message.senderId);
            console.warn('⚠️ [MessageTransformer] Sender user not found in database (will only warn once per user):', {
              senderId: message.senderId,
            });
          }
        }
      }
    } catch (queryError) {
      // Query failed - try fallback before logging
      try {
        const fallbackSender = await getUserFn(message.senderId);
        if (fallbackSender) {
          sender = fallbackSender;
          warnedMissingUsers.delete(message.senderId);
        } else {
          // Only log error once per senderId after all attempts failed
          if (!warnedMissingUsers.has(message.senderId)) {
            warnedMissingUsers.add(message.senderId);
            console.warn('⚠️ [MessageTransformer] Sender user not found in database (will only warn once per user):', {
              senderId: message.senderId,
            });
          }
        }
      } catch (fallbackError) {
        // All attempts failed - only log once per senderId
        if (!warnedMissingUsers.has(message.senderId)) {
          warnedMissingUsers.add(message.senderId);
          console.warn('⚠️ [MessageTransformer] Sender user not found in database (will only warn once per user):', {
            senderId: message.senderId,
          });
        }
      }
    }
  }

  // Transform attachments, prioritizing localPath if url is empty
  const transformedAttachments = attachments.map((a) => {
    // Use localPath if url is empty or whitespace (file hasn't been uploaded to server yet)
    // Empty strings are falsy, so this should work, but be explicit about it
    const urlValue = (a.url && a.url.trim().length > 0) ? a.url.trim() : '';
    const localPathValue = (a.localPath && a.localPath.trim().length > 0) ? a.localPath.trim() : '';
    const url = urlValue || localPathValue || '';

    // Debug logging for attachments
    console.log('🔍 [MessageTransformer] Transforming attachment:', {
      messageId: message.messageId,
      attachmentId: a.attachmentId,
      filename: a.filename,
      hasUrl: !!a.url && a.url.trim().length > 0,
      urlValue: a.url?.substring(0, 30),
      hasLocalPath: !!a.localPath && a.localPath.trim().length > 0,
      localPathValue: a.localPath?.substring(0, 30),
      finalUrl: url.substring(0, 50) + '...',
      duration: a.duration,
    });

    return {
      id: a.attachmentId,
      filename: a.filename,
      url,
      size: a.size,
      mimeType: a.mimeType,
      uploadedAt: a.uploadedAt,
      thumbnail: a.thumbnail,
      duration: a.duration,
    };
  });

  // Debug logging for message
  if (transformedAttachments.length > 0) {
    console.log('[MessageTransformer] Message loaded with attachments:', {
      messageId: message.messageId,
      attachmentCount: transformedAttachments.length,
      hasContent: !!message.content,
      type: message.type,
    });
  }

  const result: ChatMessage = {
    id: message.messageId,
    roomId: message.roomId,
    senderId: message.senderId,
    sender,
    content: message.content,
    type: message.type,
    attachments: transformedAttachments.length > 0 ? transformedAttachments : undefined,
    timestamp: message.createdAt,
    editedAt: message.editedAt ? new Date(message.editedAt) : undefined,
    replyTo: message.replyToId,
    reactions: [], // TODO: Implement reactions if needed
    status: message.status,
    clientId: message.clientId,
  };

  // Final debug logging
  console.log('📤 [MessageTransformer] Returning ChatMessage:', {
    messageId: result.id,
    hasAttachments: !!result.attachments,
    attachmentCount: result.attachments?.length || 0,
    type: result.type,
    hasContent: !!result.content,
  });

  return result;
}

