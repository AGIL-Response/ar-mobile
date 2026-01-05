import type { ChatRoom, ChatMessage, ChatUser, ChatAttachment } from './types';

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
    // Try to extract an ID field from the object
    const possibleIdFields = ['id', '_id', 'uuid', 'uid'];
    for (const key of possibleIdFields) {
      if (key in value && typeof value[key] === 'string') {
        return value[key];
      }
    }

    // If it has a toString method that returns something useful, use it
    if (typeof value.toString === 'function') {
      const stringValue = value.toString();
      if (stringValue !== '[object Object]' && stringValue !== '') {
        return stringValue;
      }
    }

    // Last resort: try JSON.stringify, but this is not ideal for IDs
    try {
      const stringified = JSON.stringify(value);
      if (stringified && stringified !== 'null' && stringified !== 'undefined' && stringified.length < 200) {
        console.warn(`Converted object to string ID for ${fieldName} using JSON.stringify:`, value);
        return stringified;
      }
    } catch (e) {
      // JSON.stringify failed (circular reference, etc.)
    }

    // If we get here, we couldn't convert the object to a valid string ID
    console.error(`Cannot convert object to string ID for ${fieldName}:`, value);
    throw new Error(`${fieldName} is an object that cannot be converted to a string ID: ${JSON.stringify(value)}`);
  }

  // For any other type, try String() conversion
  const stringValue = String(value);
  if (stringValue === '[object Object]' || stringValue === 'undefined' || stringValue === 'null') {
    throw new Error(`${fieldName} cannot be converted to a valid string ID (got: ${typeof value})`);
  }
  return stringValue;
}

/**
 * Transform API conversation response to ChatRoom
 */
export function transformConversationToRoom(conversation: any): ChatRoom & { _lastMessageAt?: string | Date } {
  // Ensure ID is a string - handle all cases
  const id = ensureStringId(conversation.id, 'conversation.id');

  const room: ChatRoom & { _lastMessageAt?: string | Date } = {
    id,
    name: conversation.name || '',
    description: conversation.description,
    type: conversation.type,
    avatar: conversation.avatarUrl,
    isPrivate: conversation.isPrivate ?? false,
    members: (conversation.members || []).map((m: any) => ({
      id: ensureStringId(m.userId || m.id, 'transformConversationToRoom.member.id'),
      username: m.username,
      displayName: m.displayName,
      // Use avatar.id (file ID) if available, otherwise fall back to avatarUrl
      avatarUrl: m.avatar?.id || m.avatarUrl,
      status: m.status,
      lastSeen: m.lastSeen ? new Date(m.lastSeen) : undefined,
    })),
    lastMessage: conversation.lastMessage ? transformMessageToChatMessage(conversation.lastMessage, id) : undefined,
    unreadCount: conversation.unreadCount || 0,
    createdAt: conversation.createdAt ? new Date(conversation.createdAt) : new Date(),
    updatedAt: conversation.updatedAt ? new Date(conversation.updatedAt) : new Date(),
  };

  // Extract lastMessageAt from conversation object if available
  if (conversation.lastMessageAt) {
    room._lastMessageAt = conversation.lastMessageAt;
  }

  return room;
}

/**
 * Transform API message response to ChatMessage
 */
export function transformMessageToChatMessage(message: any, roomId: string): ChatMessage {
  try {
    const id = ensureStringId(message.id, 'message.id');
    const senderId = ensureStringId(message.senderId, 'message.senderId');
    const conversationId = message.conversationId ? ensureStringId(message.conversationId, 'message.conversationId') : roomId;

    return {
      id,
      roomId: conversationId,
      senderId,
      sender: message.sender ? {
        id: ensureStringId(message.sender.id, 'sender.id'),
        username: message.sender.username,
        displayName: message.sender.displayName,
        avatarUrl: message.sender.avatarUrl,
        avatar: message.sender.avatar ? {
          id: message.sender.avatar.id,
          name: message.sender.avatar.name,
          size: message.sender.avatar.size,
          type: message.sender.avatar.type,
          url: message.sender.avatar.url,
          thumbnail: message.sender.avatar.thumbnail,
        } : undefined,
      } : {
        id: senderId,
      },
      content: message.content || '',
      type: message.type || 'text',
      attachments: (() => {
        // Handle both attachments and files arrays (like svelte-chat-kit)
        // CRITICAL: Must concatenate both arrays, not use OR logic!
        // Empty arrays are truthy, so || would stop at empty attachments array
        const attachmentsArray = [
          ...(Array.isArray(message.attachments) ? message.attachments : []),
          ...(Array.isArray(message.files) ? message.files : []),
        ].filter((a) => a != null); // Filter out null and undefined values

        // If no attachments from server, return undefined (not empty array)
        // This allows local attachments to be preserved in the database
        if (attachmentsArray.length === 0) {
          return undefined;
        }

        const transformed = attachmentsArray.map((a: any) => ({
          id: ensureStringId(a.id || a.fileId || a.key || '', 'attachment.id'),
          filename: a.filename || a.name || a.key || 'file',
          url: a.url || a.key || '',
          size: a.size || 0,
          mimeType: a.mimeType || a.contentType || a.type || 'application/octet-stream',
          uploadedAt: a.uploadedAt ? new Date(a.uploadedAt) : new Date(),
          thumbnail: a.thumbnail || undefined,
          duration: a.duration ? String(a.duration) : undefined, // Ensure duration is a string
        }));
        return transformed;
      })(),
      timestamp: message.createdAt ? new Date(message.createdAt) : new Date(),
      editedAt: message.editedAt ? new Date(message.editedAt) : undefined,
      replyTo: message.replyToId ? ensureStringId(message.replyToId, 'replyToId') : undefined,
      reactions: [],
      status: message.status || 'sent', // Default to 'sent' for messages from server
      clientId: message.clientId, // Preserve clientId if present
    };
  } catch (error) {
    console.error('Error transforming message to ChatMessage:', message, error);
    throw error;
  }
}

