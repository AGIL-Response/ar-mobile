import { Model } from '@nozbe/watermelondb';
import { field, date, relation } from '@nozbe/watermelondb/decorators';
import type { Associations } from '@nozbe/watermelondb/Model';
import type Message from './Message';

export default class Attachment extends Model {
  static table = 'attachments';
  
  static associations: Associations = {
    message: { type: 'belongs_to', key: 'message_id' },
  };

  @field('attachment_id') attachmentId!: string;
  @field('message_id') messageId!: string;
  @field('filename') filename!: string;
  @field('url') url!: string;
  @field('size') size!: number;
  @field('mime_type') mimeType!: string;
  @date('uploaded_at') uploadedAt!: Date;
  @field('local_path') localPath?: string;

  @relation('messages', 'message_id') message!: Message;
}

