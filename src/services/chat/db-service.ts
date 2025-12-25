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
    
    try {
      // Get existing message to check for local attachments
      // First try by messageId, then by clientId if messageId doesn't exist
      const dbModule = await import('./database/index');
      const QModule = await import('@nozbe/watermelondb');
      const db = dbModule.getDatabase();
      let existingMessages = await db
        .get('messages')
        .query(QModule.Q.where('message_id', messageId))
        .fetch();
      
      // If not found by messageId and we have a clientId, try finding by clientId
      if (existingMessages.length === 0 && messageData.clientId) {
        existingMessages = await db
          .get('messages')
          .query(QModule.Q.where('client_id', messageData.clientId))
          .fetch();
        
        if (existingMessages.length > 0) {
          existingMessageId = existingMessages[0].messageId;
          console.log('🔍 [DbService] Found existing message by clientId:', {
            clientId: messageData.clientId,
            existingMessageId,
            newMessageId: messageId,
          });
        }
      }
      
      if (existingMessages.length > 0) {
        // Check if existing message has attachments with local paths
        const existingAttachments = await AttachmentEntity.getAttachments(existingMessageId);
        const hasLocalAttachments = existingAttachments.some(a => {
          const hasEmptyUrl = !a.url || a.url.trim() === '';
          const hasLocalPath = a.localPath && a.localPath.trim().length > 0;
          return hasEmptyUrl && hasLocalPath;
        });
        
        // If server message has no attachments but existing message has local attachments, preserve them
        const serverHasNoAttachments = !messageData.attachments || messageData.attachments.length === 0;
        if (hasLocalAttachments && serverHasNoAttachments) {
          shouldPreserveLocalAttachments = true;
          console.log('🔒 [DbService] Preserving local attachments - server message has no attachments:', {
            messageId,
            existingMessageId,
            existingAttachmentCount: existingAttachments.length,
            localPaths: existingAttachments.filter(a => a.localPath).map(a => a.localPath?.substring(0, 50) + '...'),
          });
        }
      }
    } catch (error) {
      console.warn('⚠️ [DbService] Error checking for existing attachments:', error);
      // Continue with save even if check fails
    }
    
    await MessageEntity.upsertMessage(messageData, roomId);

    // Save attachments - only update if server message has attachments, or if this is a new message without local attachments to preserve
    if (messageData.attachments && messageData.attachments.length > 0) {
      // Server has attachments - update them (they should include URLs from server)
      await AttachmentEntity.upsertAttachments(messageData.id, messageData.attachments);
      console.log('✅ [DbService] Updated attachments from server:', {
        messageId,
        attachmentCount: messageData.attachments.length,
      });
    } else if (shouldPreserveLocalAttachments) {
      // Local attachments exist and should be preserved - don't call upsertAttachments
      // They will remain in the database from the previous save
      console.log('✅ [DbService] Preserving local attachments, skipping attachment update:', {
        messageId,
        existingMessageId,
      });
    } else {
      // No attachments in server message and no local attachments to preserve
      // This is fine for new messages or messages that never had attachments
      console.log('ℹ️ [DbService] No attachments in server message, and no local attachments to preserve:', {
        messageId,
      });
    }

    // Update room's last message
    await RoomEntity.updateRoomLastMessage(roomId, messageId, messageData.timestamp || new Date());
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
