import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import Constants from 'expo-constants';
import { requestQueue } from '@/api/request-queue';
import type {
  ChatRoom,
  ChatMessage,
  SendMessageData,
  CreateRoomData,
  UpdateRoomData,
  PaginatedResponse,
} from './types';

// Chat service is a separate service, use its own base URL
// The chat service uses ROUTE_PREFIX=api/chat by default
// Configure CHAT_API_URL in your environment (e.g., https://dev.agilres.net or https://dev-api.agilres.net/chat)
const CHAT_API_BASE_URL = Constants.expoConfig?.extra?.CHAT_API_URL || 'https://dev.agilres.net';
// The chat service uses route prefix 'api/chat' (configured via ROUTE_PREFIX env var)
const CHAT_ROUTE_PREFIX = '/api/chat';

/**
 * Lazy getter for auth store to avoid circular dependency
 */
function getAuthStore() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('@/stores/auth').default;
}

/**
 * Lazy getter for auth API to avoid circular dependency
 */
function getAuthApi() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('@/api/auth').authApi;
}

const getTimestamp = () => {
  const now = new Date();
  return `[${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}]`;
};

// Create separate axios instance for chat API
const chatApiClient = axios.create({
  baseURL: CHAT_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: false,
});

/**
 * Retry a request with updated token
 */
const retryRequest = async (
  config: InternalAxiosRequestConfig
): Promise<any> => {
  const authStore = getAuthStore();
  const accessToken = authStore.getState().token?.accessToken;

  // Mark request as retried
  (config as any).__retryCount = ((config as any).__retryCount || 0) + 1;

  // Update authorization header
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  console.log(
    `\x1b[33m${getTimestamp()} 🔁 Retrying chat request: ${config.method?.toUpperCase()} ${config.url}\x1b[0m`
  );

  // Retry the request
  return axios(config);
};

/**
 * Handle token refresh and retry failed request
 */
const handleTokenRefresh = async (
  originalRequest: InternalAxiosRequestConfig
): Promise<any> => {
  const authStore = getAuthStore();
  const authApi = getAuthApi();
  const state = authStore.getState();

  // Check if request has already been retried
  const retryCount = (originalRequest as any).__retryCount || 0;
  if (retryCount >= 1) {
    // Already retried once, reject
    console.log(
      `\x1b[31m${getTimestamp()} ❌ Chat request already retried, rejecting: ${originalRequest.method?.toUpperCase()} ${originalRequest.url}\x1b[0m`
    );
    return Promise.reject(
      new Error('Request failed after token refresh retry')
    );
  }

  // Check if refresh token exists
  if (!state.token?.refreshToken || !state.user?.realm) {
    console.log(
      `\x1b[31m${getTimestamp()} ❌ No refresh token available for chat, logging out\x1b[0m`
    );
    if (state.actions.logout) {
      state.actions.logout();
    }
    return Promise.reject(new Error('No refresh token available'));
  }

  // If refresh is already in progress, queue this request
  if (requestQueue.isRefreshInProgress()) {
    console.log(
      `\x1b[33m${getTimestamp()} ⏳ Token refresh in progress, queuing chat request: ${originalRequest.method?.toUpperCase()} ${originalRequest.url}\x1b[0m`
    );
    return new Promise((resolve, reject) => {
      requestQueue.enqueue({
        resolve,
        reject,
        config: originalRequest,
      });
    });
  }

  // Start token refresh
  requestQueue.setRefreshing(true);
  console.log(
    `\x1b[33m${getTimestamp()} 🔄 Refreshing access token for chat...\x1b[0m`
  );

  try {
    const tokenData = await authApi.refreshToken(
      state.token.refreshToken,
      state.user.realm
    );

    // Update tokens in store
    const tokens = {
      accessToken: tokenData.access_token || '',
      refreshToken: tokenData.refresh_token || state.token.refreshToken || '',
      idToken: tokenData.id_token || state.token.idToken || '',
      expiresIn: tokenData.expires_in || state.token.expiresIn || 3600,
    };

    state.actions.setTokens(tokens);

    console.log(
      `\x1b[32m${getTimestamp()} ✅ Token refreshed successfully for chat\x1b[0m`
    );

    // Get queued requests and retry them
    const queuedRequests = requestQueue.getQueuedRequests();
    
    // Retry the original request
    const originalRetry = retryRequest(originalRequest);
    
    // Retry all queued requests - resolve their promises with the retry promise
    queuedRequests.forEach((queued) => {
      const retried = retryRequest(queued.config);
      // Resolve with the retry promise so the caller can await it
      queued.resolve(retried);
    });

    // Wait for original request retry
    return originalRetry;
  } catch (refreshError) {
    console.log(
      `\x1b[31m${getTimestamp()} ❌ Token refresh failed for chat: ${refreshError}\x1b[0m`
    );

    // Process queued requests with error
    const queuedRequests = requestQueue.getQueuedRequests();
    queuedRequests.forEach((queued) => {
      queued.reject(refreshError);
    });

    // Logout on refresh failure
    if (state.actions.logout) {
      state.actions.logout();
    }

    return Promise.reject(refreshError);
  } finally {
    requestQueue.setRefreshing(false);
    requestQueue.setRefreshPromise(null);
  }
};

// Add request interceptor for auth token
chatApiClient.interceptors.request.use((config) => {
  const authStore = getAuthStore();
  const accessToken = authStore.getState().token?.accessToken;
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Add response interceptor for error handling with token refresh
chatApiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig;

    // Handle 401 Unauthorized - attempt token refresh
    if (error.response?.status === 401 && originalRequest) {
      // Skip refresh for auth endpoints
      const isAuthEndpoint =
        originalRequest.url?.includes('/auth') ||
        originalRequest.url?.includes('/token');

      if (isAuthEndpoint) {
        // For auth endpoints, just logout
        const authStore = getAuthStore();
        const storeState = authStore.getState();
        if (storeState.actions.logout) {
          storeState.actions.logout();
        }
        return Promise.reject(error);
      }

      // Attempt token refresh and retry
      try {
        return await handleTokenRefresh(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Safely convert a value to a string ID
 */
function ensureStringId(value: any, fieldName: string = 'id'): string {
  if (value === null || value === undefined) {
    throw new Error(`${fieldName} is null or undefined`);
  }

  if (typeof value === 'string') {
    if (value === '' || value === 'undefined' || value === 'null' || value === '[object Object]') {
      throw new Error(`${fieldName} is an invalid string: "${value}"`);
    }
    return value;
  }

  if (typeof value === 'number') {
    return String(value);
  }

  if (typeof value === 'object') {
    // Try to extract an ID field from the object
    if ('id' in value) {
      const nestedId = value.id;
      if (typeof nestedId === 'string' && nestedId !== '' && nestedId !== '[object Object]') {
        return nestedId;
      }
      if (typeof nestedId === 'number') {
        return String(nestedId);
      }
      // If nested id is also an object, recurse (but limit depth)
      if (typeof nestedId === 'object' && nestedId !== null) {
        console.warn(`Nested object ID found in ${fieldName}, attempting to extract:`, nestedId);
        return ensureStringId(nestedId, `${fieldName}.id`);
      }
    }

    // Try other common ID field names
    for (const key of ['_id', 'uuid', 'uid']) {
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
export function transformConversationToRoom(conversation: any): ChatRoom {
  // Ensure ID is a string - handle all cases
  const id = ensureStringId(conversation.id, 'conversation.id');

  return {
    id,
    name: conversation.name || '',
    description: conversation.description,
    type: conversation.type === 'dm' ? 'direct' : 'group',
    avatar: conversation.avatarUrl,
    isPrivate: conversation.isPrivate ?? false,
    members: (conversation.members || []).map((m: any) => ({
      id: ensureStringId(m.userId || m.id, 'member.id'),
      username: m.username,
      displayName: m.displayName,
      avatarUrl: m.avatarUrl,
      status: m.status,
      lastSeen: m.lastSeen ? new Date(m.lastSeen) : undefined,
    })),
    lastMessage: conversation.lastMessage ? transformMessageToChatMessage(conversation.lastMessage, id) : undefined,
    unreadCount: conversation.unreadCount || 0,
    createdAt: conversation.createdAt
      ? (conversation.createdAt instanceof Date ? conversation.createdAt : new Date(conversation.createdAt))
      : new Date(),
    updatedAt: conversation.updatedAt
      ? (conversation.updatedAt instanceof Date ? conversation.updatedAt : new Date(conversation.updatedAt))
      : new Date(),
  };
}

/**
 * Transform API message response to ChatMessage
 */
function transformMessageToChatMessage(message: any, roomId: string): ChatMessage {
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
      return attachmentsArray.map((a: any) => ({
        id: ensureStringId(a.id || a.fileId || a.key || '', 'attachment.id'),
        filename: a.filename || a.name || a.key || 'file',
        url: a.url || a.key || '',
        size: a.size || 0,
        mimeType: a.mimeType || a.contentType || a.type || 'application/octet-stream',
        uploadedAt: a.uploadedAt ? new Date(a.uploadedAt) : new Date(),
      }));
    })(),
    timestamp: message.createdAt ? new Date(message.createdAt) : new Date(),
    editedAt: message.editedAt ? new Date(message.editedAt) : undefined,
    replyTo: message.replyToId ? ensureStringId(message.replyToId, 'replyToId') : undefined,
    reactions: [],
  };
}

export const chatApi = {
  /**
   * Get all conversations/rooms
   */
  getRooms: async (limit: number = 100, offset: number = 0): Promise<ChatRoom[]> => {
    const response = await chatApiClient.get(`${CHAT_ROUTE_PREFIX}/conversations`, {
      params: {
        limit,
        offset,
      },
    });
    const conversations = response.data.conversations || response.data.data || [];

    // Transform with error handling
    const transformedRooms: ChatRoom[] = [];
    for (const conversation of conversations) {
      try {
        const room = transformConversationToRoom(conversation);
        transformedRooms.push(room);
      } catch (error) {
        console.error('Failed to transform conversation:', error, conversation);
        // Skip invalid conversations instead of failing completely
      }
    }
    return transformedRooms;
  },

  /**
   * Get a single room by ID
   */
  getRoom: async (roomId: string): Promise<ChatRoom> => {
    const response = await chatApiClient.get(`${CHAT_ROUTE_PREFIX}/conversations/${roomId}`);
    const conversation = response.data.conversation || response.data.data;
    return transformConversationToRoom(conversation);
  },

  /**
   * Create a new room
   */
  createRoom: async (data: CreateRoomData): Promise<ChatRoom> => {
    const response = await chatApiClient.post(`${CHAT_ROUTE_PREFIX}/conversations`, data);
    const conversation = response.data.conversation || response.data.data;
    return transformConversationToRoom(conversation);
  },

  /**
   * Update a room
   */
  updateRoom: async (roomId: string, data: UpdateRoomData): Promise<ChatRoom> => {
    const response = await chatApiClient.put(`${CHAT_ROUTE_PREFIX}/conversations/${roomId}`, data);
    const conversation = response.data.conversation || response.data.data;
    return transformConversationToRoom(conversation);
  },

  /**
   * Delete a room
   */
  deleteRoom: async (roomId: string): Promise<void> => {
    await chatApiClient.delete(`${CHAT_ROUTE_PREFIX}/conversations/${roomId}`);
  },

  /**
   * Get room members
   */
  getRoomMembers: async (roomId: string): Promise<any[]> => {
    const response = await chatApiClient.get(`${CHAT_ROUTE_PREFIX}/conversations/${roomId}/members`);
    return response.data.members || response.data.data || [];
  },

  /**
   * Get messages for a room
   */
  getMessages: async (
    roomId: string,
    limit: number = 50,
    before?: string
  ): Promise<PaginatedResponse<ChatMessage>> => {
    const params: any = { limit };
    if (before) {
      params.before = before;
    }
    const response = await chatApiClient.get(`${CHAT_ROUTE_PREFIX}/conversations/${roomId}/messages`, {
      params,
    });
    const messages = response.data.messages || response.data.data || [];
    const transformed = messages.map((msg: any) => transformMessageToChatMessage(msg, roomId));
    return {
      ...response.data,
      data: transformed,
    };
  },

  /**
   * Send a message
   */
  sendMessage: async (data: SendMessageData): Promise<ChatMessage> => {
    const formData = new FormData();
    formData.append('conversationId', data.roomId);
    formData.append('content', data.content);
    formData.append('type', data.type);

    if (data.replyTo) {
      formData.append('replyToId', data.replyTo);
    }

    if (data.attachments && data.attachments.length > 0) {
      data.attachments.forEach((file, index) => {
        formData.append(`attachments[${index}]`, file as any);
      });
    }

    const response = await chatApiClient.post(`${CHAT_ROUTE_PREFIX}/messages`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    const message = response.data.message || response.data.data;
    const transformed = transformMessageToChatMessage(message, data.roomId);
    return transformed;
  },

  /**
   * Edit a message
   */
  editMessage: async (messageId: string, content: string): Promise<ChatMessage> => {
    const response = await chatApiClient.put(`${CHAT_ROUTE_PREFIX}/messages/${messageId}`, {
      content,
    });
    const message = response.data.message || response.data.data;
    // We need roomId from the message response
    const roomId = message.conversationId || '';
    return transformMessageToChatMessage(message, roomId);
  },

  /**
   * Delete a message
   */
  deleteMessage: async (messageId: string): Promise<void> => {
    await chatApiClient.delete(`${CHAT_ROUTE_PREFIX}/messages/${messageId}`);
  },

  /**
   * Mark messages as read
   */
  markAsRead: async (roomId: string, messageId?: string): Promise<void> => {
    await chatApiClient.post(`${CHAT_ROUTE_PREFIX}/messages/read`, {
      conversation_id: roomId,
      message_id: messageId,
    });
  },

  /**
   * Search messages
   */
  searchMessages: async (
    query: string,
    roomId?: string,
    limit: number = 20
  ): Promise<ChatMessage[]> => {
    const params: any = { query, limit };
    if (roomId) {
      params.conversationId = roomId;
    }
    const response = await chatApiClient.get(`${CHAT_ROUTE_PREFIX}/messages/search`, { params });
    const messages = response.data.messages || response.data.data || [];
    return messages.map((msg: any) => transformMessageToChatMessage(msg, roomId || msg.conversationId || ''));
  },
};

