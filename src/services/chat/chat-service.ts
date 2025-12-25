import { ChatSocketService } from './socket-service';
import { chatDbService } from './db-service';
import type { SendMessageData, CreateRoomData, ChatMessage } from './types';
import useAuthStore from '@/stores/auth';
import Constants from 'expo-constants';
import { of } from 'rxjs';
import { transformConversationToRoom } from './utils';

const CHAT_SOCKET_URL = Constants.expoConfig?.extra?.CHAT_SOCKET_URL || 'https://dev.agilres.net/chat';

export class ChatService {
  private socketService: ChatSocketService;
  private isInitialized = false;
  private sendingMessageTimeouts = new Map<string, ReturnType<typeof setTimeout>>(); // Track timeouts for sending messages

  constructor() {
    this.socketService = new ChatSocketService(CHAT_SOCKET_URL);
    this.setupSocketHandlers();
  }

  private setupSocketHandlers(): void {
    // Handle new messages from server (both sent by us and received from others)
    this.socketService.on('onMessage', async (message) => {
      // Check if this message matches a sending message by clientId
      if (message.clientId) {
        // Find the message in DB by clientId and update its status to 'sent'
        try {
          const dbModule = await import('./database/index');
          const QModule = await import('@nozbe/watermelondb');
          const db = dbModule.getDatabase();
          const messages = await db
            .get('messages')
            .query(QModule.Q.where('client_id', message.clientId))
            .fetch();

          if (messages.length > 0) {
            const localMessage = messages[0];
            await db.write(async () => {
              await localMessage.update((msg: any) => {
                msg.status = 'sent';
                // Update message ID to server ID if different
                if (msg.messageId !== message.id) {
                  // We need to handle ID change - for now, just update status
                  // The server ID will be used going forward
                }
              });
            });
            // Clear timeout if exists
            const timeout = this.sendingMessageTimeouts.get(message.clientId);
            if (timeout) {
              clearTimeout(timeout);
              this.sendingMessageTimeouts.delete(message.clientId);
            }
          }
        } catch (error) {
          console.error('Error updating message status:', error);
        }
      }

      // Save message to DB - this will trigger the observable to update
      await chatDbService.saveMessage(message, message.roomId);
    });

    // Handle edited messages
    this.socketService.on('onMessageEdited', async (message) => {
      await chatDbService.saveMessage(message, message.roomId);
    });

    // Handle deleted messages
    this.socketService.on('onMessageDeleted', async (data) => {
      await chatDbService.deleteMessage(data.message_id);
    });

    // Handle message errors
    this.socketService.on('onMessageError', async (data) => {
      if (data.clientId) {
        // Find message by clientId and update status to 'error'
        try {
          const dbModule = await import('./database/index');
          const QModule = await import('@nozbe/watermelondb');
          const db = dbModule.getDatabase();
          const messages = await db
            .get('messages')
            .query(QModule.Q.where('client_id', data.clientId))
            .fetch();

          if (messages.length > 0) {
            const localMessage = messages[0];
            await db.write(async () => {
              await localMessage.update((msg: any) => {
                msg.status = 'error';
              });
            });
            // Clear timeout if exists
            const timeout = this.sendingMessageTimeouts.get(data.clientId);
            if (timeout) {
              clearTimeout(timeout);
              this.sendingMessageTimeouts.delete(data.clientId);
            }
          }
        } catch (error) {
          console.error('Error updating message status to error:', error);
        }
      }
    });

    // Handle message history loaded
    this.socketService.on('onMessageHistoryLoaded', async (data) => {
      await chatDbService.saveMessages(data.messages, data.conversation_id);
    });

    // Handle conversation list (from socket emit conversation:list)
    this.socketService.on('onConversationList', async (data) => {
      const conversations = data.conversations || [];
      const rooms = conversations.map((conv: any) => transformConversationToRoom(conv));
      await chatDbService.saveRooms(rooms);

      // Join all rooms via socket
      for (const room of rooms) {
        this.socketService.joinRoom(room.id);
      }
    });

    // Handle conversation created
    this.socketService.on('onConversationCreated', async (data) => {
      const room = transformConversationToRoom(data.conversation);
      await chatDbService.saveRoom(room);
      this.socketService.joinRoom(room.id);
    });

    // Handle conversation updated
    this.socketService.on('onConversationUpdated', async (data) => {
      const room = transformConversationToRoom(data.conversation);
      await chatDbService.saveRoom(room);
    });

    // Handle conversation details
    this.socketService.on('onConversationDetails', async (data) => {
      const room = transformConversationToRoom(data.conversation);
      await chatDbService.saveRoom(room);
    });

    // Handle room updates (legacy)
    this.socketService.on('onRoomUpdate', async (room) => {
      const transformedRoom = transformConversationToRoom(room);
      await chatDbService.saveRoom(transformedRoom);
    });

    // Handle rooms updated (legacy)
    this.socketService.on('onRoomsUpdated', async (rooms) => {
      const transformedRooms = rooms.map((room: any) => transformConversationToRoom(room));
      await chatDbService.saveRooms(transformedRooms);
    });
  }

  /**
   * Initialize chat service - connect socket and sync rooms
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    const token = useAuthStore.getState().token?.accessToken;
    if (!token) {
      throw new Error('No access token available');
    }

    // Connect socket
    await this.socketService.connect(token);

    // Sync rooms from API
    await this.syncRooms();

    this.isInitialized = true;
  }

  /**
   * Sync rooms via socket event (matching chat-client-js pattern)
   */
  async syncRooms(): Promise<void> {
    try {
      // Emit socket event to get conversation list
      if (this.socketService && typeof this.socketService.getConversations === 'function') {
        this.socketService.getConversations(100, 0);
        // The rooms will be saved via onConversationList handler
      } else {
        console.error('Socket service or getConversations method not available');
      }
    } catch (error) {
      console.error('Failed to sync rooms:', error);
    }
  }

  /**
   * Sync messages for a room via socket event (matching chat-client-js pattern)
   */
  async syncMessages(roomId: string, limit: number = 50, before?: string): Promise<void> {
    try {
      // Emit socket event to load message history
      this.socketService.loadHistory(roomId, limit, before);
      // The messages will be saved via onMessageHistoryLoaded handler
    } catch (error) {
      console.error('❌ [ChatService] Failed to sync messages:', error);
    }
  }

  /**
   * Get rooms observable
   */
  observeRooms() {
    return chatDbService.observeRooms();
  }

  /**
   * Get room observable
   */
  observeRoom(roomId: string) {
    // Validate roomId before passing to db service
    if (!roomId || typeof roomId !== 'string' || roomId.trim() === '') {
      // Return a safe observable that emits null
      return of(null);
    }
    return chatDbService.observeRoom(roomId);
  }

  /**
   * Get messages observable for a room (observes ALL messages, sorted by created_at)
   */
  observeMessages(roomId: string) {
    // Validate roomId before passing to db service
    if (!roomId || typeof roomId !== 'string' || roomId.trim() === '') {
      // Return a safe observable that emits empty array
      return of([]);
    }
    return chatDbService.observeMessages(roomId);
  }

  /**
   * Send a message via socket (matching chat-client-js pattern)
   */
  async sendMessage(data: SendMessageData, fileIds?: string[], localMessage?: ChatMessage): Promise<void> {
    // Emit to socket with fileIds, clientId, and id if provided
    this.socketService.sendMessage(data.roomId, data.content, data.type, data.replyTo, fileIds, data.clientId, localMessage?.id);

    // If localMessage is provided (with local paths), save it to DB immediately
    // This allows showing the message with local file paths while waiting for server response
    if (localMessage) {
      await chatDbService.saveMessage(localMessage, data.roomId);

      // Set timeout for sending status (10 minutes)
      if (data.clientId && localMessage.status === 'sending') {
        const timeout = setTimeout(async () => {
          // Update message status to 'error' if still sending after 10 minutes
          try {
            const dbModule = await import('./database/index');
            const QModule = await import('@nozbe/watermelondb');
            const db = dbModule.getDatabase();
            const messages = await db
              .get('messages')
              .query(QModule.Q.where('client_id', data.clientId || ''))
              .fetch();

            if (messages.length > 0) {
              const msg = messages[0];
              const currentStatus = (msg as any).status;
              // Only update if still in 'sending' status
              if (currentStatus === 'sending') {
                await db.write(async () => {
                  await msg.update((m: any) => {
                    m.status = 'error';
                  });
                });
              }
            }
            this.sendingMessageTimeouts.delete(data.clientId!);
          } catch (error) {
            console.error('Error updating message status to error after timeout:', error);
            this.sendingMessageTimeouts.delete(data.clientId!);
          }
        }, 10 * 60 * 1000); // 10 minutes

        this.sendingMessageTimeouts.set(data.clientId, timeout);
      }
    }
  }

  /**
   * Create a new room via socket (matching chat-client-js pattern)
   */
  createRoom(data: CreateRoomData): void {
    // Emit socket event to create conversation
    // Convert 'direct' to 'dm' for socket (chat-client-js uses 'dm')
    const socketType = data.type === 'direct' ? 'dm' : 'group';
    // members is string[] (user IDs) in CreateRoomData
    const memberIds = data.members || [];

    this.socketService.createConversation(
      socketType,
      data.name,
      memberIds
    );
    // The room will be saved via onConversationCreated handler
  }

  /**
   * Mark room as read via socket (matching chat-client-js pattern)
   */
  async markAsRead(roomId: string, messageId?: string): Promise<void> {
    await chatDbService.markRoomAsRead(roomId);
    this.socketService.markAsRead(roomId, messageId);
  }

  /**
   * Set typing indicator
   */
  setTyping(roomId: string, isTyping: boolean): void {
    this.socketService.setTyping(roomId, isTyping);
  }

  /**
   * Disconnect and cleanup
   */
  disconnect(): void {
    this.socketService.disconnect();
    this.isInitialized = false;
  }

  /**
   * Get socket service (for advanced usage)
   */
  getSocketService(): ChatSocketService {
    return this.socketService;
  }
}

export const chatService = new ChatService();

