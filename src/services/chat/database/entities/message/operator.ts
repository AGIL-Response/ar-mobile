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
      });
      return existingMessage;
    });
  } else {
    return await db.write(async () => {
      return await db.get<Message>('messages').create((message) => {
        message.messageId = messageDataTransformed.messageId;
        message.roomId = messageDataTransformed.roomId;
        message.senderId = messageDataTransformed.senderId;
        message.content = messageDataTransformed.content;
        message.type = messageDataTransformed.type;
        message.replyToId = messageDataTransformed.replyToId;
        if (messageDataTransformed.editedAt !== undefined) {
          message.editedAt = messageDataTransformed.editedAt;
        }
        message.isSynced = messageDataTransformed.isSynced;
        message.serverCreatedAt = messageDataTransformed.serverCreatedAt;
        message.serverUpdatedAt = messageDataTransformed.serverUpdatedAt;
      });
    });
  }
}

/**
 * Get observable for messages in a room
 */
export function observeMessages(
  roomId: string,
  limit: number,
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
    const query = db
      .get<Message>('messages')
      .query(
        Q.where('room_id', validRoomId),
        Q.where('deleted_at', null),
        Q.sortBy('created_at', Q.desc),
        Q.take(limit)
      );

    return query.observe().pipe(
      switchMap(async (messages) => {
        console.log('🔄 [MessageOperator] observeMessages triggered:', {
          roomId: validRoomId,
          messageCount: messages?.length || 0,
        });
        
        if (!messages || messages.length === 0) {
          return [];
        }

        // Sort messages by created_at descending (newest first, oldest last)
        const sortedMessages = [...messages].sort((a, b) => {
          const timeA = a.createdAt?.getTime() || (a.serverCreatedAt ? new Date(a.serverCreatedAt).getTime() : 0);
          const timeB = b.createdAt?.getTime() || (b.serverCreatedAt ? new Date(b.serverCreatedAt).getTime() : 0);
          // Descending: larger time (newer) comes first
          return timeB - timeA;
        });

        console.log('📋 [MessageOperator] Transforming messages:', {
          count: sortedMessages.length,
          firstMessageId: sortedMessages[0]?.messageId,
          lastMessageId: sortedMessages[sortedMessages.length - 1]?.messageId,
          firstMessageTime: sortedMessages[0]?.createdAt,
          lastMessageTime: sortedMessages[sortedMessages.length - 1]?.createdAt,
        });

        // Transform all messages (attachments will be fetched in messageToChatMessageFn)
        const transformed = await Promise.all(
          sortedMessages.map((message) => messageToChatMessageFn(message))
        );
        
        console.log('✅ [MessageOperator] Messages transformed:', {
          count: transformed.length,
          withAttachments: transformed.filter(m => (m.attachments?.length ?? 0) > 0).length,
          sample: transformed.filter(m => (m.attachments?.length ?? 0) > 0).slice(0, 2).map(m => ({
            id: m.id,
            attachmentCount: m.attachments?.length,
          })),
        });
        
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
      Q.sortBy('created_at', Q.desc),
      Q.take(limit)
    )
    .fetch();

  // Sort messages by created_at descending (newest first, oldest last)
  // Ensure we sort by timestamp to guarantee correct order
  const sortedMessages = [...messages].sort((a, b) => {
    const timeA = a.createdAt?.getTime() || (a.serverCreatedAt ? new Date(a.serverCreatedAt).getTime() : 0);
    const timeB = b.createdAt?.getTime() || (b.serverCreatedAt ? new Date(b.serverCreatedAt).getTime() : 0);
    // Descending: larger time (newer) comes first
    return timeB - timeA;
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

