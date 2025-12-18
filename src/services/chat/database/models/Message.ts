import { Model } from '@nozbe/watermelondb';
import { field, date, readonly, relation, children } from '@nozbe/watermelondb/decorators';
import type { Associations } from '@nozbe/watermelondb/Model';
import type Room from './Room';
import type User from './User';

export default class Message extends Model {
  static table = 'messages';

  static associations: Associations = {
    room: { type: 'belongs_to', key: 'room_id' },
    sender: { type: 'belongs_to', key: 'sender_id' },
    attachments: { type: 'has_many', foreignKey: 'message_id' },
  };

  @field('message_id') messageId!: string;
  @field('room_id') roomId!: string;
  @field('sender_id') senderId!: string;
  @field('content') content!: string;
  @field('type') type!: 'text' | 'file' | 'image' | 'system';
  @field('reply_to_id') replyToId?: string;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;
  @field('edited_at') editedAt?: number;
  @field('deleted_at') deletedAt?: number;
  @field('is_synced') isSynced!: boolean;
  @field('server_created_at') serverCreatedAt?: string;
  @field('server_updated_at') serverUpdatedAt?: string;
  @field('status') status?: 'sending' | 'sent' | 'error';
  @field('client_id') clientId?: string;

  @relation('rooms', 'room_id') room!: Room;
  @relation('users', 'sender_id') sender!: User;
  @children('attachments') attachments!: any;
}

