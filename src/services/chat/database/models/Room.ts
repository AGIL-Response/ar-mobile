import { Model } from '@nozbe/watermelondb';
import { field, date, readonly, children } from '@nozbe/watermelondb/decorators';
import type { Associations } from '@nozbe/watermelondb/Model';

export default class Room extends Model {
  static table = 'rooms';

  static associations: Associations = {
    messages: { type: 'has_many', foreignKey: 'room_id' },
    room_members: { type: 'has_many', foreignKey: 'room_id' },
  };

  @field('room_id') roomId!: string;
  @field('name') name!: string;
  @field('description') description?: string;
  @field('type') type!: 'dm' | 'group';
  @field('avatar_url') avatarUrl?: string;
  @field('is_private') isPrivate!: boolean;
  @field('unread_count') unreadCount!: number;
  @field('last_message_id') lastMessageId?: string;
  @field('last_message_at') lastMessageAt?: number;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;
  @field('server_created_at') serverCreatedAt?: string;
  @field('server_updated_at') serverUpdatedAt?: string;

  @children('messages') messages!: any;
  @children('room_members') members!: any;
}

