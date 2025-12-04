import { Model } from '@nozbe/watermelondb';
import { field, date, readonly, children } from '@nozbe/watermelondb/decorators';
import type { Associations } from '@nozbe/watermelondb/Model';
import type Message from './Message';
import type RoomMember from './RoomMember';

export default class User extends Model {
    static table = 'users';

    static associations: Associations = {
        messages: { type: 'has_many', foreignKey: 'sender_id' },
        room_members: { type: 'has_many', foreignKey: 'user_id' },
    };

    @field('user_id') userId!: string;
    @field('username') username?: string;
    @field('email') email?: string;
    @field('display_name') displayName?: string;
    @field('avatar_url') avatarUrl?: string;
    @field('status') status?: 'online' | 'away' | 'offline';
    @field('last_seen') lastSeen?: number;
    @readonly @date('created_at') createdAt!: Date;
    @readonly @date('updated_at') updatedAt!: Date;

    @children('messages') messages!: any;
    @children('room_members') roomMembers!: any;
}

