import { io, type Socket } from 'socket.io-client';
import type { ChatMessage, ChatRoom } from './types';
import { transformMessageToChatMessage } from './utils';

export interface ChatSocketEvents {
  onMessage: (message: ChatMessage) => void;
  onMessageEdited: (message: ChatMessage) => void;
  onMessageDeleted: (data: { message_id: string; conversation_id: string }) => void;
  onMessageHistoryLoaded: (data: { conversation_id: string; messages: ChatMessage[] }) => void;
  onConversationList: (data: { conversations: any[] }) => void;
  onConversationCreated: (data: { conversation: any }) => void;
  onConversationUpdated: (data: { conversation: any }) => void;
  onConversationDetails: (data: { conversation: any }) => void;
  onRoomUpdate: (room: ChatRoom) => void;
  onRoomsUpdated: (rooms: ChatRoom[]) => void;
  onTyping: (data: { userId: string; displayName: string; timestamp: Date }) => void;
  onPresenceUpdate: (data: { userId: string; status: 'online' | 'away' | 'offline'; lastSeen: Date }) => void;
  onError: (error: any) => void;
  onConnected: () => void;
  onDisconnected: (reason: string) => void;
  onMessageError?: (data: { type: string; clientId?: string; messageId?: string; error: any }) => void;
}

export class ChatSocketService {
  private socket: Socket | null = null;
  private token: string | null = null;
  private eventHandlers: Partial<ChatSocketEvents> = {};
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor(private socketUrl: string) { }

  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.token = token;

      if (this.socket?.connected) {
        resolve();
        return;
      }

      try {
        const url = new URL(this.socketUrl);
        const socketOrigin = url.origin;
        const socketPath = '/api/chat/socket.io';

        this.socket = io(socketOrigin, {
          path: socketPath,
          transports: ['websocket', 'polling'],
          upgrade: true,
          rememberUpgrade: true,
          timeout: 10000,
          auth: {
            token,
          },
        });

        let connectionTimeout: ReturnType<typeof setTimeout> | null = null;
        let hasResolved = false;
        const connectionTimeoutMs = 10000;

        connectionTimeout = setTimeout(() => {
          if (!hasResolved && !this.isConnected) {
            hasResolved = true;
            reject(new Error('Socket connection timeout'));
          }
        }, connectionTimeoutMs);

        this.socket.on('connect', () => {
          if (connectionTimeout) {
            clearTimeout(connectionTimeout);
            connectionTimeout = null;
          }
          if (!hasResolved) {
            this.isConnected = true;
            this.reconnectAttempts = 0;
            hasResolved = true;
            this.setupEventHandlers();
            this.eventHandlers.onConnected?.();
            resolve();
          }
        });

        this.socket.on('connect_error', (error) => {
          console.warn('Chat socket connection error:', error.message);
          if (!hasResolved && this.reconnectAttempts >= this.maxReconnectAttempts) {
            hasResolved = true;
            reject(error);
          }
        });

        this.socket.on('disconnect', (reason) => {
          this.isConnected = false;
          this.eventHandlers.onDisconnected?.(reason);

          if (reason === 'io server disconnect') {
            this.handleReconnect();
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts && this.token) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

      setTimeout(() => {
        this.connect(this.token!).catch(() => {
          this.handleReconnect();
        });
      }, delay);
    } else {
      this.eventHandlers.onError?.({
        type: 'reconnect_failed',
        message: 'Max reconnection attempts reached',
      });
    }
  }

  private setupEventHandlers(): void {
    if (!this.socket) return;

    // Message events
    this.socket.on('message:new', (data: { message: any }) => {
      // Transform the message to ensure it has the correct format with sender data
      // Handle case where message might be an array
      const messageData = Array.isArray(data.message) ? data.message[0] : data.message;

      if (!messageData) {
        console.error('❌ [SocketService] Invalid message data (empty array or null):', data);
        return;
      }

      try {
        const transformedMessage = transformMessageToChatMessage(messageData, messageData.conversationId || messageData.roomId);

        // Preserve clientId from server response if present
        if (messageData.clientId) {
          transformedMessage.clientId = messageData.clientId;
        }

        this.eventHandlers.onMessage?.(transformedMessage);
      } catch (error) {
        console.error('❌ [SocketService] Error transforming message:new:', error, { data, messageData });
        // Fallback: try to use the message as-is if transformation fails
        if (messageData.id) {
          this.eventHandlers.onMessage?.(messageData as ChatMessage);
        }
      }
    });

    // Handle message errors
    this.socket.on('message:send:error', (data: { messageId?: string; clientId?: string; error: any }) => {
      console.error('❌ [SocketService] Message error received:', data);

      // If clientId is provided, trigger error handler
      if (data.clientId && this.eventHandlers.onMessageError) {
        this.eventHandlers.onMessageError({
          type: 'message_error',
          clientId: data.clientId,
          messageId: data.messageId,
          error: data.error,
        });
      }
    });

    this.socket.on('message:edited', (data: { message: any }) => {
      // Transform the message to ensure it has the correct format with sender data
      // Handle case where message might be an array
      const messageData = Array.isArray(data.message) ? data.message[0] : data.message;

      if (!messageData) {
        console.error('❌ [SocketService] Invalid message data (empty array or null):', data);
        return;
      }

      try {
        const transformedMessage = transformMessageToChatMessage(messageData, messageData.conversationId || messageData.roomId);
        this.eventHandlers.onMessageEdited?.(transformedMessage);
      } catch (error) {
        console.error('❌ [SocketService] Error transforming message:edited:', error, { data });
        // Fallback: try to use the message as-is if transformation fails
        this.eventHandlers.onMessageEdited?.(data.message as ChatMessage);
      }
    });

    this.socket.on('message:deleted', (data: { message_id: string; conversation_id: string }) => {
      this.eventHandlers.onMessageDeleted?.(data);
    });

    this.socket.on('message:history:loaded', (data: { conversation_id: string; messages: any }) => {

      // Handle nested structure: data.messages.messages (server returns { messages: { messages: [...] } })
      let messagesArray: any[] = [];
      if (Array.isArray(data.messages)) {
        // Direct array
        messagesArray = data.messages;
      } else if (data.messages && typeof data.messages === 'object' && 'messages' in data.messages) {
        // Nested structure: { messages: [...] }
        messagesArray = Array.isArray(data.messages.messages) ? data.messages.messages : [];
      } else {
        // Fallback: try to extract from any structure
        messagesArray = [];
      }

      console.log('[Chat] - message:history:loaded - loaded history', messagesArray);

      // Transform messages to ChatMessage format using transformMessageToChatMessage utility
      const messages: ChatMessage[] = messagesArray
        .map((msg: any) => {
          if (!msg || typeof msg !== 'object') {
            console.warn('⚠️ [SocketService] Invalid message data received:', msg);
            return null;
          }
          try {
            return transformMessageToChatMessage(msg, data.conversation_id);
          } catch (error) {
            console.error('❌ [SocketService] Error transforming message:', error, { msg });
            return null;
          }
        })
        .filter((msg): msg is ChatMessage => msg !== null);

      console.log('[Chat] - message:history:loaded - loaded history', messages.length);
      this.eventHandlers.onMessageHistoryLoaded?.({
        conversation_id: data.conversation_id,
        messages,
      });
    });

    // Conversation events
    this.socket.on('conversation:list', (data: { conversations: any[] }) => {
      this.eventHandlers.onConversationList?.(data);
    });

    this.socket.on('conversation:created', (data: { conversation: any }) => {
      this.eventHandlers.onConversationCreated?.(data);
    });

    this.socket.on('conversation:updated', (data: { conversation: any }) => {
      this.eventHandlers.onConversationUpdated?.(data);
      // Also emit legacy event for backward compatibility
      this.eventHandlers.onRoomUpdate?.(data.conversation);
    });

    this.socket.on('conversation:details', (data: { conversation: any }) => {
      this.eventHandlers.onConversationDetails?.(data);
    });

    this.socket.on('conversation:roomsUpdated', (data: { conversations: ChatRoom[] }) => {
      this.eventHandlers.onRoomsUpdated?.(data.conversations);
    });

    // Typing events
    this.socket.on('typing:start', (data: { userId: string; displayName: string; timestamp: Date }) => {
      this.eventHandlers.onTyping?.(data);
    });

    // Presence events
    this.socket.on('presence:update', (data: { userId: string; status: 'online' | 'away' | 'offline'; lastSeen: Date }) => {
      this.eventHandlers.onPresenceUpdate?.(data);
    });

    // Error events
    this.socket.on('error', (error: any) => {
      this.eventHandlers.onError?.(error);
    });
  }

  /**
   * Register event handlers
   */
  on<K extends keyof ChatSocketEvents>(event: K, handler: ChatSocketEvents[K]): void {
    this.eventHandlers[event] = handler as any;
  }

  /**
   * Remove event handler
   */
  off<K extends keyof ChatSocketEvents>(event: K): void {
    delete this.eventHandlers[event];
  }

  /**
   * Send a message
   */
  sendMessage(roomId: string, content: string, type: 'text' | 'file' | 'image' = 'text', replyTo?: string, fileIds?: string[], clientId?: string, id?: string): void {
    if (!this.socket?.connected) {
      console.warn('Socket not connected, cannot send message');
      return;
    }

    const payload: any = {
      conversationId: roomId,
      content,
      type,
      reply_to: replyTo,
    };

    // Add id if provided (use id instead of messageId)
    if (id) {
      payload.id = id;
    }

    // Add fileIds if provided
    if (fileIds && fileIds.length > 0) {
      payload.fileIds = fileIds;
    }

    // Add clientId if provided (for message status tracking)
    if (clientId) {
      payload.clientId = clientId;
    }

    this.socket.emit('message:send', payload);
  }

  /**
   * Edit a message
   */
  editMessage(messageId: string, content: string): void {
    if (!this.socket?.connected) {
      console.warn('Socket not connected, cannot edit message');
      return;
    }

    this.socket.emit('message:edit', {
      message_id: messageId,
      content,
    });
  }

  /**
   * Delete a message
   */
  deleteMessage(messageId: string): void {
    if (!this.socket?.connected) {
      console.warn('Socket not connected, cannot delete message');
      return;
    }

    this.socket.emit('message:delete', {
      message_id: messageId,
    });
  }

  /**
   * Load message history
   */
  loadHistory(roomId: string, limit: number = 50, before?: string): void {
    if (!this.socket?.connected) {
      console.warn('⚠️ [SocketService] Socket not connected, cannot load history');
      return;
    }

    console.log('[Chat] - loadHistory - loading history', roomId, limit, before);
    this.socket.emit('message:history:load', {
      conversationId: roomId,
      limit,
      before,
    });
    console.log('[Chat] - loadHistory - loaded history', roomId, limit, before);
  }

  /**
   * Mark messages as read
   */
  markAsRead(roomId: string, messageId?: string): void {
    if (!this.socket?.connected) {
      console.warn('Socket not connected, cannot mark as read');
      return;
    }

    this.socket.emit('message:read', {
      conversation_id: roomId,
      message_id: messageId,
    });
  }

  /**
   * Join a room
   */
  joinRoom(roomId: string): void {
    if (!this.socket?.connected) {
      console.warn('Socket not connected, cannot join room');
      return;
    }

    this.socket.emit('conversation:join', {
      conversation_id: roomId,
    });
  }

  /**
   * Leave a room
   */
  leaveRoom(roomId: string): void {
    if (!this.socket?.connected) {
      console.warn('Socket not connected, cannot leave room');
      return;
    }

    this.socket.emit('conversation:leave', {
      conversation_id: roomId,
    });
  }

  /**
   * Set typing indicator
   */
  setTyping(roomId: string, isTyping: boolean): void {
    if (!this.socket?.connected) {
      return;
    }

    if (isTyping) {
      this.socket.emit('typing:start', {
        conversation_id: roomId,
      });
    } else {
      this.socket.emit('typing:stop', {
        conversation_id: roomId,
      });
    }
  }

  /**
   * Set presence status
   */
  setPresence(status: 'online' | 'away' | 'offline'): void {
    if (!this.socket?.connected) {
      return;
    }

    this.socket.emit(`presence:${status}`);
  }

  /**
   * Get conversations list (matching chat-client-js pattern)
   */
  getConversations(limit: number = 100, offset: number = 0): void {
    if (!this.socket?.connected) {
      console.warn('Socket not connected, cannot get conversations');
      return;
    }

    this.socket.emit('conversation:list', {
      limit,
      offset,
    });
  }

  /**
   * Create a conversation (matching chat-client-js pattern)
   */
  createConversation(type: 'group' | 'dm', name: string, memberIds: string[] = []): void {
    if (!this.socket?.connected) {
      console.warn('Socket not connected, cannot create conversation');
      return;
    }

    this.socket.emit('conversation:create', {
      type,
      name,
      memberIds,
    });
  }

  /**
   * Get conversation details
   */
  getConversationDetails(conversationId: string): void {
    if (!this.socket?.connected) {
      console.warn('Socket not connected, cannot get conversation details');
      return;
    }

    this.socket.emit('conversation:get', {
      conversationId,
    });
  }

  /**
   * Disconnect socket
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  /**
   * Check if socket is connected
   */
  get connected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }
}

