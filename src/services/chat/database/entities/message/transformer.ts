import { getDatabase } from '../../index';
import type Message from '../../models/Message';
import type Attachment from '../../models/Attachment';
import type User from '../../models/User';
import type { ChatMessage, ChatUser } from '../../../types';
import { Q } from '@nozbe/watermelondb';

const db = getDatabase();

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
    content: messageData.content,
    type: messageData.type,
    replyToId: messageData.replyTo,
    editedAt: messageData.editedAt ? messageData.editedAt.getTime() : undefined,
    isSynced: true,
    serverCreatedAt: timestamp.toISOString(),
    serverUpdatedAt: timestamp.toISOString(),
  };
}

/**
 * Convert WatermelonDB Message to ChatMessage
 */
export async function messageToChatMessage(message: Message, getUserFn: (userId: string) => Promise<ChatUser | null>): Promise<ChatMessage> {
  const attachments = await message.attachments.fetch();

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
    console.log('✅ [MessageTransformer] Fetched sender via relation:', {
      messageId: message.messageId,
      senderId: message.senderId,
      displayName: sender.displayName,
      username: sender.username,
    });
  } catch (error) {
    // If relation fetch fails, try to fetch directly from users table
    console.warn('⚠️ [MessageTransformer] Relation fetch failed, trying direct query:', {
      messageId: message.messageId,
      senderId: message.senderId,
      error: error instanceof Error ? error.message : String(error),
    });
    
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
        console.log('✅ [MessageTransformer] Fetched sender via direct query:', {
          messageId: message.messageId,
          senderId: message.senderId,
          displayName: sender.displayName,
          username: sender.username,
        });
      } else {
        // Try using the provided getUserFn as fallback
        const fallbackSender = await getUserFn(message.senderId);
        if (fallbackSender) {
          sender = fallbackSender;
        } else {
          console.warn('⚠️ [MessageTransformer] Sender user not found in database:', {
            messageId: message.messageId,
            senderId: message.senderId,
          });
        }
      }
    } catch (queryError) {
      console.error('❌ [MessageTransformer] Failed to fetch sender via direct query:', queryError, {
        messageId: message.messageId,
        senderId: message.senderId,
      });
    }
  }

  return {
    id: message.messageId,
    roomId: message.roomId,
    senderId: message.senderId,
    sender,
    content: message.content,
    type: message.type,
    attachments: attachments.map((a) => ({
      id: a.attachmentId,
      filename: a.filename,
      url: a.url,
      size: a.size,
      mimeType: a.mimeType,
      uploadedAt: a.uploadedAt,
    })),
    timestamp: message.createdAt,
    editedAt: message.editedAt ? new Date(message.editedAt) : undefined,
    replyTo: message.replyToId,
    reactions: [], // TODO: Implement reactions if needed
  };
}

