import { getDatabase } from '../../index';
import type Message from '../../models/Message';
import type { ChatMessage, ChatAttachment } from '../../../types';
import { Q } from '@nozbe/watermelondb';
import { switchMap, of } from 'rxjs';
import { chatMessageToMessageData } from './transformer';
import { upsertUser } from '../user/operator';
import { chatAttachmentToAttachmentData } from '../attachment/transformer';
import type Attachment from '../../models/Attachment';

const db = getDatabase();

/**
 * Upsert a message (create or update)
 * Optionally saves attachments in the same write transaction to ensure they're available when observable emits
 */
export async function upsertMessage(
  messageData: ChatMessage,
  roomId: string,
  attachments?: ChatAttachment[]
): Promise<Message> {
  const messageDataTransformed = chatMessageToMessageData(messageData, roomId);
  const messageId = messageDataTransformed.messageId;

  // Upsert sender user if sender data is available
  if (messageData.sender) {
    try {
      await upsertUser(messageData.sender);
    } catch (error) {
      console.error('❌ [MessageOperator] Failed to upsert sender user:', error, {
        messageId,
        senderId: messageData.senderId,
        sender: messageData.sender,
      });
      // Continue with message save even if user upsert fails
    }
  } else {
    console.warn('⚠️ [MessageOperator] No sender data in message:', {
      messageId,
      senderId: messageData.senderId,
      messageData: {
        id: messageData.id,
        content: messageData.content,
        hasSender: !!messageData.sender,
      },
    });
  }

  // Check if message exists
  const existingMessages = await db
    .get<Message>('messages')
    .query(Q.where('message_id', messageId))
    .fetch();

  const existingMessage = existingMessages.length > 0 ? existingMessages[0] : null;

  if (existingMessage) {
    return await db.write(async () => {
      await existingMessage.update((message) => {
        message.content = messageDataTransformed.content;
        // Preserve more specific type ('image' or 'file') when updating
        // Only update type if:
        // 1. New type is more specific than current (e.g., 'image'/'file' vs 'text')
        // 2. Or both are the same type
        // This prevents overwriting 'image'/'file' with 'text' when server response doesn't include correct type
        const currentType = message.type;
        const newType = messageDataTransformed.type || 'text';
        
        // Define type hierarchy: 'text' < 'file'/'image'
        const typeHierarchy: Record<string, number> = { 'text': 0, 'file': 1, 'image': 1, 'system': 0 };
        const currentTypePriority = typeHierarchy[currentType] || 0;
        const newTypePriority = typeHierarchy[newType] || 0;
        
        // Only update if new type has same or higher priority, or if current type is 'text'
        if (newTypePriority >= currentTypePriority || currentType === 'text') {
          message.type = newType;
        }
        // Otherwise, preserve existing type (especially if it's 'image' or 'file')
        
        message.replyToId = messageDataTransformed.replyToId;
        if (messageDataTransformed.editedAt !== undefined) {
          message.editedAt = messageDataTransformed.editedAt;
        }
        message.isSynced = messageDataTransformed.isSynced;
        message.serverUpdatedAt = messageDataTransformed.serverUpdatedAt;
        // Update status and clientId if provided (for status tracking)
        // Only update if the value is explicitly provided (not undefined)
        // Wrap in try-catch to handle case where columns don't exist yet (migration not applied)
        try {
          if (messageDataTransformed.status !== undefined && messageDataTransformed.status !== null) {
            message.status = messageDataTransformed.status;
          }
          if (messageDataTransformed.clientId !== undefined && messageDataTransformed.clientId !== null) {
            message.clientId = messageDataTransformed.clientId;
          }
        } catch (error: any) {
          // If status/client_id columns don't exist yet, log warning but continue
          if (error?.message?.includes('no column named status') || error?.message?.includes('no column named client_id')) {
            console.warn('⚠️ [MessageOperator] Status/clientId columns not available yet. Migration may not have run. Please restart the app.', {
              messageId,
              error: error.message,
            });
          } else {
            throw error; // Re-throw if it's a different error
          }
        }
      });
      
      // Save attachments in the same transaction if provided
      // This ensures attachments are available when the observable emits
      if (attachments && attachments.length > 0) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/fe8ebf07-0ebe-4741-a941-900aecb34d86',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'message/operator.ts:110',message:'upsertMessage - saving attachments in same transaction (update)',data:{messageId,attachmentCount:attachments.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H'})}).catch(()=>{});
        // #endregion
        
        // Get existing attachments to preserve local paths
        const existingAttachments = await db
          .get<Attachment>('attachments')
          .query(Q.where('message_id', messageId))
          .fetch();
        
        const localPathMap = new Map<string, string>();
        for (const existingAtt of existingAttachments) {
          if (existingAtt.localPath) {
            localPathMap.set(existingAtt.attachmentId, existingAtt.localPath);
          }
        }
        
        // Delete existing attachments that aren't in the new list
        const newIds = new Set(attachments.map(a => a.id));
        for (const existingAtt of existingAttachments) {
          if (!newIds.has(existingAtt.attachmentId)) {
            await existingAtt.destroyPermanently();
          }
        }
        
        // Create or update attachments
        for (const attachment of attachments) {
          const attachmentData = chatAttachmentToAttachmentData(attachment, messageId);
          const preservedLocalPath = localPathMap.get(attachmentData.attachmentId);
          
          const existingAtt = existingAttachments.find(a => a.attachmentId === attachmentData.attachmentId);
          if (existingAtt) {
            await existingAtt.update((att: any) => {
              att.filename = attachmentData.filename;
              att.url = attachmentData.url;
              att.size = attachmentData.size;
              att.mimeType = attachmentData.mimeType;
              att.uploadedAt = attachmentData.uploadedAt;
              if (preservedLocalPath || attachmentData.localPath) {
                att.localPath = preservedLocalPath || attachmentData.localPath;
              }
              if (attachmentData.thumbnail) {
                att.thumbnail = attachmentData.thumbnail;
              }
              if (attachmentData.duration) {
                att.duration = attachmentData.duration;
              }
            });
          } else {
            await db.get<Attachment>('attachments').create((att: any) => {
              att.attachmentId = attachmentData.attachmentId;
              att.messageId = attachmentData.messageId;
              att.filename = attachmentData.filename;
              att.url = attachmentData.url;
              att.size = attachmentData.size;
              att.mimeType = attachmentData.mimeType;
              att.uploadedAt = attachmentData.uploadedAt;
              if (preservedLocalPath || attachmentData.localPath) {
                att.localPath = preservedLocalPath || attachmentData.localPath;
              }
              if (attachmentData.thumbnail) {
                att.thumbnail = attachmentData.thumbnail;
              }
              if (attachmentData.duration) {
                att.duration = attachmentData.duration;
              }
            });
          }
        }
      }
      
      return existingMessage;
    });
  } else {
    return await db.write(async () => {
      const createdMessage = await db.get<Message>('messages').create((message) => {
        // Set all required fields first
        message.messageId = messageDataTransformed.messageId;
        message.roomId = messageDataTransformed.roomId;
        message.senderId = messageDataTransformed.senderId;
        message.content = messageDataTransformed.content || '';
        message.type = messageDataTransformed.type || 'text'; // Ensure type is always set
        message.isSynced = messageDataTransformed.isSynced;
        message.serverCreatedAt = messageDataTransformed.serverCreatedAt;
        message.serverUpdatedAt = messageDataTransformed.serverUpdatedAt;

        // Set optional fields
        if (messageDataTransformed.replyToId !== undefined) {
          message.replyToId = messageDataTransformed.replyToId;
        }
        if (messageDataTransformed.editedAt !== undefined) {
          message.editedAt = messageDataTransformed.editedAt;
        }
        // Only set status and clientId if they are provided
        // Wrap in try-catch to handle case where columns don't exist yet (migration not applied)
        try {
          if (messageDataTransformed.status !== undefined && messageDataTransformed.status !== null) {
            message.status = messageDataTransformed.status;
          }
          if (messageDataTransformed.clientId !== undefined && messageDataTransformed.clientId !== null) {
            message.clientId = messageDataTransformed.clientId;
          }
        } catch (error: any) {
          // If status/client_id columns don't exist yet, log warning but continue
          if (error?.message?.includes('no column named status') || error?.message?.includes('no column named client_id')) {
            console.warn('⚠️ [MessageOperator] Status/clientId columns not available yet. Migration may not have run. Please restart the app.', {
              messageId: messageDataTransformed.messageId,
              error: error.message,
            });
          } else {
            throw error; // Re-throw if it's a different error
          }
        }
      });
      
      // Save attachments in the same transaction if provided
      // This ensures attachments are available when the observable emits
      if (attachments && attachments.length > 0) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/fe8ebf07-0ebe-4741-a941-900aecb34d86',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'message/operator.ts:180',message:'upsertMessage - saving attachments in same transaction (create)',data:{messageId,attachmentCount:attachments.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H'})}).catch(()=>{});
        // #endregion
        
        for (const attachment of attachments) {
          const attachmentData = chatAttachmentToAttachmentData(attachment, messageId);
          await db.get<Attachment>('attachments').create((att: any) => {
            att.attachmentId = attachmentData.attachmentId;
            att.messageId = attachmentData.messageId;
            att.filename = attachmentData.filename;
            att.url = attachmentData.url;
            att.size = attachmentData.size;
            att.mimeType = attachmentData.mimeType;
            att.uploadedAt = attachmentData.uploadedAt;
            if (attachmentData.localPath) {
              att.localPath = attachmentData.localPath;
            }
            if (attachmentData.thumbnail) {
              att.thumbnail = attachmentData.thumbnail;
            }
            if (attachmentData.duration) {
              att.duration = attachmentData.duration;
            }
          });
        }
      }
      
      return createdMessage;
    });
  }
}

/**
 * Validate and normalize roomId
 */
function validateRoomId(roomId: string | undefined | null): string | null {
  if (roomId === undefined || roomId === null || typeof roomId !== 'string') {
    return null;
  }

  const validRoomId = String(roomId).trim();
  if (validRoomId === '' || validRoomId === 'undefined' || validRoomId === 'null' || validRoomId === '[object Object]') {
    return null;
  }

  return validRoomId.length > 0 ? validRoomId : null;
}

/**
 * Sort messages by serverCreatedAt (message timestamp) descending (newest first, oldest last)
 * Use serverCreatedAt first since it's the actual message timestamp, fallback to createdAt if not available
 * Note: This will be reversed in processMessagesForDisplay, so final order is [oldest, ..., newest]
 */
function sortMessagesByTimestamp(messages: Message[]): Message[] {
  return [...messages].sort((a, b) => {
    const timeA = a.serverCreatedAt ? new Date(a.serverCreatedAt).getTime() : (a.createdAt?.getTime() || 0);
    const timeB = b.serverCreatedAt ? new Date(b.serverCreatedAt).getTime() : (b.createdAt?.getTime() || 0);
    // Descending: larger time (newer) comes first - will be reversed later for display
    return timeB - timeA;
  });
}

/**
 * Process and transform messages: sort and convert to ChatMessage
 */
async function processAndTransformMessages(
  messages: Message[],
  messageToChatMessageFn: (message: Message) => Promise<ChatMessage>
): Promise<ChatMessage[]> {
  if (!messages || messages.length === 0) {
    return [];
  }

  const sortedMessages = sortMessagesByTimestamp(messages);
  return Promise.all(sortedMessages.map((message) => messageToChatMessageFn(message)));
}

/**
 * Get observable for messages in a room (observes ALL messages, sorted by created_at)
 */
export function observeMessages(
  roomId: string,
  messageToChatMessageFn: (message: Message) => Promise<ChatMessage>
) {
  const validRoomId = validateRoomId(roomId);
  if (!validRoomId) {
    return of([]);
  }

  try {
    // Observe ALL messages for the room, sorted by created_at descending
    // Note: Will be re-sorted by serverCreatedAt in processAndTransformMessages
    const query = db
      .get<Message>('messages')
      .query(
        Q.where('room_id', validRoomId),
        Q.where('deleted_at', null),
        Q.sortBy('created_at', Q.desc)
      );

    return query.observe().pipe(
      switchMap((messages) => processAndTransformMessages(messages, messageToChatMessageFn))
    );
  } catch (error) {
    console.error('Error creating messages observable:', error, { roomId, validRoomId });
    return of([]);
  }
}

/**
 * Get messages for a room (non-observable)
 */
export async function getMessages(
  roomId: string,
  limit: number,
  messageToChatMessageFn: (message: Message) => Promise<ChatMessage>
): Promise<ChatMessage[]> {
  const validRoomId = validateRoomId(roomId);
  if (!validRoomId) {
    return [];
  }

  try {
    // Query for messages where deleted_at is null (not deleted)
    // Note: Will be re-sorted by serverCreatedAt in processAndTransformMessages
    const messages = await db
      .get<Message>('messages')
      .query(
        Q.where('room_id', validRoomId),
        Q.where('deleted_at', null),
        Q.sortBy('created_at', Q.desc),
        Q.take(limit)
      )
      .fetch();

    return processAndTransformMessages(messages, messageToChatMessageFn);
  } catch (error) {
    console.error('Error fetching messages:', error, { roomId, validRoomId });
    return [];
  }
}

/**
 * Delete a message (soft delete)
 */
export async function deleteMessage(messageId: string): Promise<void> {
  const messages = await db
    .get<Message>('messages')
    .query(Q.where('message_id', messageId))
    .fetch();

  const message = messages.length > 0 ? messages[0] : null;

  if (message) {
    await db.write(async () => {
      await message.update((m) => {
        m.deletedAt = Date.now();
      });
    });
  }
}

