import { getDatabase } from '../../index';
import type Attachment from '../../models/Attachment';
import type { ChatAttachment } from '../../../types';
import { Q } from '@nozbe/watermelondb';
import { chatAttachmentToAttachmentData, attachmentToChatAttachment } from './transformer';

const db = getDatabase();

/**
 * Upsert attachments for a message
 */
export async function upsertAttachments(messageId: string, attachments: ChatAttachment[]): Promise<void> {
  const validMessageId = typeof messageId === 'string' ? messageId : String(messageId);
  
  // Delete existing attachments for this message
  const existingAttachments = await db
    .get<Attachment>('attachments')
    .query(Q.where('message_id', validMessageId))
    .fetch();

  await db.write(async () => {
    for (const attachment of existingAttachments) {
      await attachment.destroyPermanently();
    }

    for (const attachmentData of attachments) {
      const attachmentDataTransformed = chatAttachmentToAttachmentData(attachmentData, validMessageId);
      await db.get<Attachment>('attachments').create((attachment) => {
        attachment.attachmentId = attachmentDataTransformed.attachmentId;
        attachment.messageId = attachmentDataTransformed.messageId;
        attachment.filename = attachmentDataTransformed.filename;
        attachment.url = attachmentDataTransformed.url;
        attachment.size = attachmentDataTransformed.size;
        attachment.mimeType = attachmentDataTransformed.mimeType;
        attachment.uploadedAt = attachmentDataTransformed.uploadedAt;
        if (attachmentDataTransformed.localPath) {
          attachment.localPath = attachmentDataTransformed.localPath;
        }
      });
    }
  });
}

/**
 * Get attachments for a message
 */
export async function getAttachments(messageId: string): Promise<ChatAttachment[]> {
  const validMessageId = typeof messageId === 'string' ? messageId : String(messageId);
  
  const attachments = await db
    .get<Attachment>('attachments')
    .query(Q.where('message_id', validMessageId))
    .fetch();

  return attachments.map(attachmentToChatAttachment);
}

