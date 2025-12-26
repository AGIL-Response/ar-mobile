export interface ChatUser {
  id: string;
  username?: string;
  email?: string;
  displayName?: string;
  avatarUrl?: string;
  status?: 'online' | 'away' | 'offline';
  lastSeen?: Date;
}

export interface ChatRoom {
  id: string;
  name: string;
  description?: string;
  type: 'dm' | 'group';
  avatar?: string;
  isPrivate?: boolean;
  members: ChatUser[];
  lastMessage?: ChatMessage;
  lastMessageAt?: Date; // Timestamp from server (conversation.lastMessageAt)
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  sender: ChatUser;
  content: string;
  type: 'text' | 'file' | 'image' | 'system';
  attachments?: ChatAttachment[];
  files?: ChatAttachment[];
  timestamp: Date;
  editedAt?: Date;
  replyTo?: string;
  reactions?: ChatMessageReaction[];
  status?: 'sending' | 'sent' | 'error';
  clientId?: string; // Client-generated ID for tracking message status
}

export interface ChatAttachment {
  id: string;
  filename: string;
  url: string;
  size: number;
  mimeType: string;
  uploadedAt: Date;
  duration?: string; // Duration in seconds as string (e.g., "4.226032")
  thumbnail?: string; // Thumbnail URL for images
}

export interface ChatMessageReaction {
  emoji: string;
  users: string[];
  count: number;
}

export interface SendMessageData {
  roomId: string;
  content: string;
  type: 'text' | 'file' | 'image';
  attachments?: File[];
  fileIds?: string[]; // File IDs from uploaded files
  replyTo?: string;
  clientId?: string; // Client-generated ID for tracking message status
  isVoice?: boolean; // Indicates if message contains voice/audio for transcription
}

export interface CreateRoomData {
  name: string;
  description?: string;
  type: 'direct' | 'group';
  members?: string[];
  isPrivate?: boolean;
}

export interface UpdateRoomData {
  name?: string;
  description?: string;
  avatar?: string;
  isPrivate?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

