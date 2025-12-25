import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const chatSchema = appSchema({
  version: 4,
  tables: [
    tableSchema({
      name: 'rooms',
      columns: [
        { name: 'room_id', type: 'string', isIndexed: true },
        { name: 'name', type: 'string' },
        { name: 'description', type: 'string', isOptional: true },
        { name: 'type', type: 'string' }, // 'direct' | 'group'
        { name: 'avatar_url', type: 'string', isOptional: true },
        { name: 'is_private', type: 'boolean' },
        { name: 'unread_count', type: 'number' },
        { name: 'last_message_id', type: 'string', isOptional: true },
        { name: 'last_message_at', type: 'number', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'server_created_at', type: 'string', isOptional: true },
        { name: 'server_updated_at', type: 'string', isOptional: true },
      ],
    }),
    tableSchema({
      name: 'messages',
      columns: [
        { name: 'message_id', type: 'string', isIndexed: true },
        { name: 'room_id', type: 'string', isIndexed: true },
        { name: 'sender_id', type: 'string', isIndexed: true },
        { name: 'content', type: 'string' },
        { name: 'type', type: 'string' }, // 'text' | 'file' | 'image' | 'system'
        { name: 'reply_to_id', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number', isIndexed: true },
        { name: 'updated_at', type: 'number' },
        { name: 'edited_at', type: 'number', isOptional: true },
        { name: 'deleted_at', type: 'number', isOptional: true },
        { name: 'is_synced', type: 'boolean' },
        { name: 'server_created_at', type: 'string', isOptional: true },
        { name: 'server_updated_at', type: 'string', isOptional: true },
        { name: 'status', type: 'string', isOptional: true }, // 'sending' | 'sent' | 'error'
        { name: 'client_id', type: 'string', isOptional: true },
      ],
    }),
    tableSchema({
      name: 'attachments',
      columns: [
        { name: 'attachment_id', type: 'string', isIndexed: true },
        { name: 'message_id', type: 'string', isIndexed: true },
        { name: 'filename', type: 'string' },
        { name: 'url', type: 'string' },
        { name: 'size', type: 'number' },
        { name: 'mime_type', type: 'string' },
        { name: 'uploaded_at', type: 'number' },
        { name: 'local_path', type: 'string', isOptional: true },
        { name: 'thumbnail', type: 'string', isOptional: true },
        { name: 'duration', type: 'string', isOptional: true },
      ],
    }),
    tableSchema({
      name: 'room_members',
      columns: [
        { name: 'room_id', type: 'string', isIndexed: true },
        { name: 'user_id', type: 'string', isIndexed: true },
        { name: 'username', type: 'string', isOptional: true },
        { name: 'display_name', type: 'string', isOptional: true },
        { name: 'avatar_url', type: 'string', isOptional: true },
        { name: 'status', type: 'string', isOptional: true }, // 'online' | 'away' | 'offline'
        { name: 'last_seen', type: 'number', isOptional: true },
        { name: 'joined_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'users',
      columns: [
        { name: 'user_id', type: 'string', isIndexed: true },
        { name: 'username', type: 'string', isOptional: true },
        { name: 'email', type: 'string', isOptional: true },
        { name: 'display_name', type: 'string', isOptional: true },
        { name: 'avatar_url', type: 'string', isOptional: true },
        { name: 'status', type: 'string', isOptional: true }, // 'online' | 'away' | 'offline'
        { name: 'last_seen', type: 'number', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
  ],
});

