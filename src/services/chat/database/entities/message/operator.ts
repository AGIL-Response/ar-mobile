import { getDatabase } from '../../index';
import type Message from '../../models/Message';
import type { ChatMessage } from '../../../types';
import { Q } from '@nozbe/watermelondb';
import { switchMap, of } from 'rxjs';
import { chatMessageToMessageData } from './transformer';
import { upsertUser } from '../user/operator';

const db = getDatabase();

/**
 * Upsert a message (create or update)
 */
export async function upsertMessage(messageData: ChatMessage, roomId: string): Promise<Message> {
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
        message.type = messageDataTransformed.type;
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
      return existingMessage;
    });
  } else {
    return await db.write(async () => {
      return await db.get<Message>('messages').create((message) => {
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
    });
  }
}

/**
 * Get observable for messages in a room (observes ALL messages, sorted by created_at)
 */
export function observeMessages(
  roomId: string,
  messageToChatMessageFn: (message: Message) => Promise<ChatMessage>
) {
  // Validate roomId
  if (roomId === undefined || roomId === null || typeof roomId !== 'string') {
    return of([]);
  }

  const validRoomId = String(roomId).trim();
  if (validRoomId === '' || validRoomId === 'undefined' || validRoomId === 'null' || validRoomId === '[object Object]') {
    return of([]);
  }

  if (!validRoomId || validRoomId.length === 0) {
    return of([]);
  }

  try {
    // Observe ALL messages for the room, sorted by created_at ascending (oldest first)
    const query = db
      .get<Message>('messages')
      .query(
        Q.where('room_id', validRoomId),
        Q.where('deleted_at', null),
        Q.sortBy('created_at', Q.asc)
      );

    return query.observe().pipe(
      switchMap(async (messages) => {
        if (!messages || messages.length === 0) {
          return [];
        }

        // Sort messages by created_at ascending (oldest first, newest last)
        // This ensures new messages appear at the bottom of the chat
        const sortedMessages = [...messages].sort((a, b) => {
          const timeA = a.createdAt?.getTime() || (a.serverCreatedAt ? new Date(a.serverCreatedAt).getTime() : 0);
          const timeB = b.createdAt?.getTime() || (b.serverCreatedAt ? new Date(b.serverCreatedAt).getTime() : 0);
          // Ascending: smaller time (older) comes first
          return timeA - timeB;
        });

        // Transform all messages (attachments will be fetched in messageToChatMessageFn)
        const transformed = await Promise.all(
          sortedMessages.map((message) => messageToChatMessageFn(message))
        );
        
        return transformed;
      })
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
  // Validate roomId
  const validRoomId = typeof roomId === 'string' && roomId.trim() !== '' ? roomId.trim() : null;
  if (!validRoomId || validRoomId === 'undefined' || validRoomId === 'null') {
    return [];
  }

  // Query for messages where deleted_at is null (not deleted)
  const messages = await db
    .get<Message>('messages')
    .query(
      Q.where('room_id', validRoomId),
      Q.where('deleted_at', null),
      Q.sortBy('created_at', Q.asc),
      Q.take(limit)
    )
    .fetch();

  // Sort messages by created_at ascending (oldest first, newest last)
  // This ensures new messages appear at the bottom of the chat
  const sortedMessages = [...messages].sort((a, b) => {
    const timeA = a.createdAt?.getTime() || (a.serverCreatedAt ? new Date(a.serverCreatedAt).getTime() : 0);
    const timeB = b.createdAt?.getTime() || (b.serverCreatedAt ? new Date(b.serverCreatedAt).getTime() : 0);
    // Ascending: smaller time (older) comes first
    return timeA - timeB;
  });

  return Promise.all(sortedMessages.map((message) => messageToChatMessageFn(message)));
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

