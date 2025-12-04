import { Model } from '@nozbe/watermelondb';
import { field, date, relation } from '@nozbe/watermelondb/decorators';
import type { Associations } from '@nozbe/watermelondb/Model';
import type Room from './Room';
import type User from './User';

export default class RoomMember extends Model {
  static table = 'room_members';
  
  static associations: Associations = {
    room: { type: 'belongs_to', key: 'room_id' },
    user: { type: 'belongs_to', key: 'user_id' },
  };

  @field('room_id') roomId!: string;
  @field('user_id') userId!: string;
  @field('username') username?: string;
  @field('display_name') displayName?: string;
  @field('avatar_url') avatarUrl?: string;
  @field('status') status?: 'online' | 'away' | 'offline';
  @field('last_seen') lastSeen?: number;
  @date('joined_at') joinedAt!: Date;

  @relation('rooms', 'room_id') room!: Room;
  @relation('users', 'user_id') user!: User;
}

