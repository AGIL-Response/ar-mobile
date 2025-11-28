import { ChatSocketService } from './socket-service';
import { chatDbService } from './db-service';
import type { SendMessageData, CreateRoomData } from './types';
import useAuthStore from '@/stores/auth';
import Constants from 'expo-constants';
import { of } from 'rxjs';
import { transformConversationToRoom } from './utils';

const CHAT_SOCKET_URL = Constants.expoConfig?.extra?.CHAT_SOCKET_URL || 'https://dev.agilres.net/chat';

export class ChatService {
  private socketService: ChatSocketService;
  private isInitialized = false;

  constructor() {
    this.socketService = new ChatSocketService(CHAT_SOCKET_URL);
    this.setupSocketHandlers();
  }

  private setupSocketHandlers(): void {
    // Handle new messages from server (both sent by us and received from others)
    this.socketService.on('onMessage', async (message) => {
      // Save message to DB - this will trigger the observable to update
      console.log('📥 [ChatService] Saving message from server:', {
        messageId: message.id,
        roomId: message.roomId,
        content: message.content.substring(0, 50),
      });
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

    // Handle message history loaded
    this.socketService.on('onMessageHistoryLoaded', async (data) => {
      console.log('📥 [ChatService] Message history loaded:', {
        conversation_id: data.conversation_id,
        messageCount: data.messages?.length || 0,
        messages: data.messages,
      });
      await chatDbService.saveMessages(data.messages, data.conversation_id);
      console.log('✅ [ChatService] Messages saved to DB');
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
        this.socketService.getConversations();
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
      console.log('📤 [ChatService] Syncing messages for room:', { roomId, limit, before });
      // Emit socket event to load message history
      this.socketService.loadHistory(roomId, limit, before);
      console.log('✅ [ChatService] Load history event emitted');
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
   * Get messages observable for a room
   */
  observeMessages(roomId: string, limit: number = 50) {
    // Validate roomId before passing to db service
    if (!roomId || typeof roomId !== 'string' || roomId.trim() === '') {
      // Return a safe observable that emits empty array
      return of([]);
    }
    return chatDbService.observeMessages(roomId, limit);
  }

  /**
   * Send a message via socket (matching chat-client-js pattern)
   */
  async sendMessage(data: SendMessageData): Promise<void> {
    // Just emit to socket - don't save to DB yet
    // The message will be saved when we receive message:new event from server
    this.socketService.sendMessage(data.roomId, data.content, data.type, data.replyTo);
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

