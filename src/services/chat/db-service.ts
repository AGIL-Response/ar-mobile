import type { ChatRoom, ChatMessage } from './types';
import type Room from './database/models/Room';
import type Message from './database/models/Message';
import type Attachment from './database/models/Attachment';
import type RoomMember from './database/models/RoomMember';
import type User from './database/models/User';

// Entity operators
import * as RoomEntity from './database/entities/room';
import * as MessageEntity from './database/entities/message';
import * as AttachmentEntity from './database/entities/attachment';
import * as RoomMemberEntity from './database/entities/room-member';
import { messageToChatMessage } from './database/entities/message/transformer';
import { getUser } from './database/entities/user/operator';
import useAuthStore from '@/stores/auth';

export class ChatDbService {
  /**
   * Save or update a room
   */
  async saveRoom(roomData: ChatRoom & { _lastMessageAt?: string | Date }): Promise<void> {
    const roomId = typeof roomData.id === 'string' ? roomData.id : String(roomData.id);

    // Extract lastMessageAt from roomData if available (from conversation.lastMessageAt)
    // This ensures we use the correct lastMessageAt from the server instead of calculating from message timestamp
    const lastMessageAtOverride = roomData._lastMessageAt;

    await RoomEntity.upsertRoom(roomData, lastMessageAtOverride);

    // Save members
    if (roomData.members && roomData.members.length > 0) {
      await RoomMemberEntity.upsertRoomMembers(roomId, roomData.members);
    }

    // Save last message if exists
    if (roomData.lastMessage) {
      await this.saveMessage(roomData.lastMessage, roomId);
    }
  }

  /**
   * Save or update multiple rooms
   */
  async saveRooms(rooms: ChatRoom[]): Promise<void> {
    for (const room of rooms) {
      try {
        await this.saveRoom(room);
      } catch (error) {
        console.error('Failed to save room:', error, {
          roomId: room.id,
          roomName: room.name,
          roomType: typeof room.id,
          roomData: JSON.stringify(room, null, 2),
        });
        // Continue with other rooms instead of failing completely
      }
    }
  }

  /**
   * Save or update a message
   */
  async saveMessage(messageData: ChatMessage, roomId: string): Promise<void> {
    const messageId = typeof messageData.id === 'string' ? messageData.id : String(messageData.id);
    
    // Check if message exists (by messageId or clientId) and has local attachments that should be preserved
    let shouldPreserveLocalAttachments = false;
    let existingMessageId = messageId;
    let existingMessages: any[] = []; // Declare outside try block so it's accessible later
    let messageIdChanged = false; // Track if messageId changed during upsert
    
    try {
      // Get existing message to check for local attachments
      // First try by messageId, then by clientId if messageId doesn't exist
      const dbModule = await import('./database/index');
      const QModule = await import('@nozbe/watermelondb');
      const db = dbModule.getDatabase();
      existingMessages = await db
        .get('messages')
        .query(QModule.Q.where('message_id', messageId))
        .fetch();
      
      // If not found by messageId and we have a clientId, try finding by clientId
      // This handles the case where onMessage already migrated the messageId
      if (existingMessages.length === 0 && messageData.clientId) {
        existingMessages = await db
          .get('messages')
          .query(QModule.Q.where('client_id', messageData.clientId))
          .fetch();
        
        if (existingMessages.length > 0) {
          const foundMessageId = existingMessages[0].messageId;
          if (foundMessageId !== messageId) {
            // Message was found by clientId but has different messageId
            // This means onMessage already migrated it, so use the found messageId
            existingMessageId = foundMessageId;
            messageIdChanged = true;
          } else {
            existingMessageId = foundMessageId;
          }
        }
      } else if (existingMessages.length > 0) {
        // Message found by messageId - no migration needed
        existingMessageId = messageId;
      }
      
      // Always check attachments using the current messageId (which might have been migrated)
      // Use the messageId we'll query after upsert (which will be the finalMessageId)
      // But for now, check using existingMessageId to see if local attachments exist
      if (existingMessages.length > 0) {
        // Check if existing message has attachments with local paths
        // Use existingMessageId (which might be the migrated ID) to check for attachments
        const existingAttachments = await AttachmentEntity.getAttachments(existingMessageId);
        const hasLocalAttachments = existingAttachments.some(a => {
          const hasEmptyUrl = !a.url || a.url.trim() === '';
          const hasLocalPath = a.localPath && a.localPath.trim().length > 0;
          return hasEmptyUrl && hasLocalPath;
        });
        
        // Check if server has attachments (from attachments or files array)
        // Server has attachments if messageData.attachments is defined and has items
        const serverHasAttachments = messageData.attachments && messageData.attachments.length > 0;
        const serverHasNoAttachments = !messageData.attachments || messageData.attachments.length === 0;
        
        // Only preserve local attachments if:
        // 1. Local has attachments (with local paths)
        // 2. Server has NO attachments (undefined or empty array)
        if (hasLocalAttachments && serverHasNoAttachments) {
          shouldPreserveLocalAttachments = true;
        }
      }
    } catch (error) {
      console.warn('⚠️ [DbService] Error checking for existing attachments:', error);
      // Continue with save even if check fails
    }
    
    // Upsert message first to ensure it exists and get the final messageId
    const savedMessage = await MessageEntity.upsertMessage(messageData, roomId);
    const finalMessageId = savedMessage.messageId; // Use the final messageId (may have changed if messageId migration occurred)
    
    // After upsert, ALWAYS check for local attachments using finalMessageId
    // This handles cases where onMessage already migrated attachments or where messageId changed
    // Only check if we haven't already determined we should preserve (to avoid redundant checks)
    if (!shouldPreserveLocalAttachments) {
      try {
        const existingAttachmentsAtFinalId = await AttachmentEntity.getAttachments(finalMessageId);
        const hasLocalAttachments = existingAttachmentsAtFinalId.some(a => {
          const hasEmptyUrl = !a.url || a.url.trim() === '';
          const hasLocalPath = a.localPath && a.localPath.trim().length > 0;
          return hasEmptyUrl && hasLocalPath;
        });
        
        const serverHasNoAttachments = !messageData.attachments || messageData.attachments.length === 0;
        if (hasLocalAttachments && serverHasNoAttachments) {
          shouldPreserveLocalAttachments = true;
          existingMessageId = finalMessageId; // Update to use finalMessageId
        }
      } catch (error) {
        console.warn('⚠️ [DbService] Error checking attachments at finalMessageId:', error);
      }
    }
    
    // Save attachments based on server response
    // Rule: If server has attachments/files => override local. If server has none but local has => preserve local.
    if (messageData.attachments && messageData.attachments.length > 0) {
      // Server has attachments - merge with local paths if they exist
      // Get existing local attachments (raw DB models) to preserve local paths
      // Use finalMessageId because attachments might have been migrated by onMessage
      const dbModule = await import('./database/index');
      const QModule = await import('@nozbe/watermelondb');
      const db = dbModule.getDatabase();
      // Check both existingMessageId and finalMessageId to catch migrated attachments
      const existingAttachmentsRawAtOld = existingMessageId !== finalMessageId && existingMessageId !== messageId
        ? await db
            .get('attachments')
            .query(QModule.Q.where('message_id', existingMessageId))
            .fetch()
        : [];
      const existingAttachmentsRawAtNew = await db
        .get('attachments')
        .query(QModule.Q.where('message_id', finalMessageId))
        .fetch();
      // Combine both (shouldn't have duplicates if migration worked correctly)
      const existingAttachmentsRaw = [...existingAttachmentsRawAtOld, ...existingAttachmentsRawAtNew];
      
      // Create a map of local paths by attachment ID or filename
      const localPathMap = new Map<string, string>();
      for (const existingAtt of existingAttachmentsRaw) {
        const localPath = (existingAtt as any).localPath;
        if (localPath && localPath.trim().length > 0) {
          const attId = (existingAtt as any).attachmentId;
          const filename = (existingAtt as any).filename;
          // Try to match by ID first, then by filename
          if (attId) {
            localPathMap.set(attId, localPath);
          }
          if (filename) {
            localPathMap.set(`filename:${filename}`, localPath);
          }
        }
      }
      
      // Merge server attachments with local paths
      // If server attachment has no URL (or empty URL) and we have a local path, preserve the local path
      const mergedAttachments = messageData.attachments.map((att: any) => {
        const hasServerUrl = att.url && att.url.trim().length > 0;
        const localPath = localPathMap.get(att.id) || localPathMap.get(`filename:${att.filename}`);
        
        // If server has URL, use it. Otherwise, if we have local path, use it temporarily
        const finalUrl = hasServerUrl ? att.url : (localPath || att.url || '');
        
        return {
          ...att,
          url: finalUrl,
        };
      });
      
      // Server has attachments - ALWAYS override local attachments (even if local exists)
      // But we've merged local paths so they're preserved if server doesn't have URLs yet
      await AttachmentEntity.upsertAttachments(finalMessageId, mergedAttachments);
    } else if (shouldPreserveLocalAttachments) {
      // Local attachments exist and server has none - preserve local attachments
      // Don't call upsertAttachments, they remain linked to finalMessageId
      // Check if attachments need to be migrated from old messageId to finalMessageId
      if (existingMessageId !== finalMessageId && existingMessageId !== messageId) {
        // MessageId changed - check if attachments need migration
        const dbModule = await import('./database/index');
        const QModule = await import('@nozbe/watermelondb');
        const db = dbModule.getDatabase();
        
        // Check if attachments exist at old messageId (that haven't been migrated yet)
        const attachmentModelsAtOld = await db
          .get('attachments')
          .query(QModule.Q.where('message_id', existingMessageId))
          .fetch();
        
        // Check if attachments already exist at finalMessageId (maybe onMessage already migrated)
        const attachmentModelsAtNew = await db
          .get('attachments')
          .query(QModule.Q.where('message_id', finalMessageId))
          .fetch();
        
        if (attachmentModelsAtOld.length > 0 && attachmentModelsAtNew.length === 0) {
          // Attachments still at old messageId, migrate them
          await db.write(async () => {
            for (const attachment of attachmentModelsAtOld) {
              await attachment.update((att: any) => {
                att.messageId = finalMessageId;
              });
            }
          });
        }
      }
    }

    // Update room's last message using finalMessageId
    await RoomEntity.updateRoomLastMessage(roomId, finalMessageId, messageData.timestamp || new Date());
  }

  /**
   * Save or update multiple messages
   */
  async saveMessages(messages: ChatMessage[], roomId: string): Promise<void> {
    for (const message of messages) {
      try {
        await this.saveMessage(message, roomId);
      } catch (error) {
        console.error('❌ [DbService] Failed to save message:', error, { messageId: message.id });
      }
    }
  }

  /**
   * Get observable for all rooms
   */
  observeRooms() {
    return RoomEntity.observeRooms(async (room: Room) => {
      const members = await RoomMemberEntity.getRoomMembers(room.roomId);
      const currentUserId = useAuthStore.getState().user?.id;

      return RoomEntity.roomToChatRoom(
        room,
        {
          members: members.map((m) => ({
            id: m.id,
            username: m.username,
            displayName: m.displayName,
            avatarUrl: m.avatarUrl,
            status: m.status,
            lastSeen: m.lastSeen,
          })),
          currentUserId,
        },
        // Fallback function in case relation fetch fails
        async (messageId: string) => {
          return await this.getMessageById(messageId);
        }
      );
    });
  }

  /**
   * Get observable for a single room
   */
  observeRoom(roomId: string) {
    return RoomEntity.observeRoom(roomId, async (room: Room) => {
      const members = await RoomMemberEntity.getRoomMembers(room.roomId);
      const lastMessage = room.lastMessageId
        ? await this.getMessageById(room.lastMessageId)
        : undefined;
      const currentUserId = useAuthStore.getState().user?.id;

      return RoomEntity.roomToChatRoom(
        room,
        {
          members: members.map((m) => ({
            id: m.id,
            username: m.username,
            displayName: m.displayName,
            avatarUrl: m.avatarUrl,
            status: m.status,
            lastSeen: m.lastSeen,
          })),
          lastMessage,
          currentUserId,
        },
        async (messageId: string) => {
          return await this.getMessageById(messageId);
        }
      );
    });
  }

  /**
   * Get observable for messages in a room
   */
  observeMessages(roomId: string) {
    return MessageEntity.observeMessages(roomId, async (message: Message) => {
      return await messageToChatMessage(message, getUser);
    });
  }

  /**
   * Get messages for a room (non-observable)
   */
  async getMessages(roomId: string, limit: number = 50): Promise<ChatMessage[]> {
    return MessageEntity.getMessages(roomId, limit, async (message: Message) => {
      return await messageToChatMessage(message, getUser);
    });
  }

  /**
   * Get a single message by ID
   */
  private async getMessageById(messageId: string): Promise<ChatMessage | undefined> {
    const { getDatabase } = await import('./database');
    const db = getDatabase();
    const { Q } = await import('@nozbe/watermelondb');

    const messages = await db
      .get<Message>('messages')
      .query(Q.where('message_id', messageId))
      .fetch();

    if (messages.length === 0) {
      return undefined;
    }

    return await messageToChatMessage(messages[0], getUser);
  }

  /**
   * Get rooms (non-observable)
   */
  async getRooms(): Promise<ChatRoom[]> {
    return RoomEntity.getRooms(async (room: Room) => {
      const members = await RoomMemberEntity.getRoomMembers(room.roomId);
      const currentUserId = useAuthStore.getState().user?.id;

      return RoomEntity.roomToChatRoom(
        room,
        {
          members: members.map((m) => ({
            id: m.id,
            username: m.username,
            displayName: m.displayName,
            avatarUrl: m.avatarUrl,
            status: m.status,
            lastSeen: m.lastSeen,
          })),
          currentUserId,
        },
        // Fallback function in case relation fetch fails
        async (messageId: string) => {
          return await this.getMessageById(messageId);
        }
      );
    });
  }

  /**
   * Get a single room (non-observable)
   */
  async getRoom(roomId: string): Promise<ChatRoom | null> {
    return RoomEntity.getRoom(roomId, async (room: Room) => {
      const members = await RoomMemberEntity.getRoomMembers(room.roomId);
      const currentUserId = useAuthStore.getState().user?.id;

      return RoomEntity.roomToChatRoom(
        room,
        {
          members: members.map((m) => ({
            id: m.id,
            username: m.username,
            displayName: m.displayName,
            avatarUrl: m.avatarUrl,
            status: m.status,
            lastSeen: m.lastSeen,
          })),
          currentUserId,
        },
        // Fallback function in case relation fetch fails
        async (messageId: string) => {
          return await this.getMessageById(messageId);
        }
      );
    });
  }

  /**
   * Mark room as read (reset unread count)
   */
  async markRoomAsRead(roomId: string): Promise<void> {
    return RoomEntity.markRoomAsRead(roomId);
  }

  /**
   * Delete a message (soft delete)
   */
  async deleteMessage(messageId: string): Promise<void> {
    return MessageEntity.deleteMessage(messageId);
  }

  /**
   * Clear all chat data
   */
  async clearAll(): Promise<void> {
    const { getDatabase } = await import('./database');
    const db = getDatabase();

    await db.write(async () => {
      const rooms = await db.get<Room>('rooms').query().fetch();
      const messages = await db.get<Message>('messages').query().fetch();
      const attachments = await db.get<Attachment>('attachments').query().fetch();
      const members = await db.get<RoomMember>('room_members').query().fetch();
      const users = await db.get<User>('users').query().fetch();

      for (const room of rooms) {
        await room.destroyPermanently();
      }
      for (const message of messages) {
        await message.destroyPermanently();
      }
      for (const attachment of attachments) {
        await attachment.destroyPermanently();
      }
      for (const member of members) {
        await member.destroyPermanently();
      }
      for (const user of users) {
        await user.destroyPermanently();
      }
    });
  }
}

export const chatDbService = new ChatDbService();
