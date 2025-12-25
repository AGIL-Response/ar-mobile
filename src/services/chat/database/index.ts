import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { chatSchema } from './schema';
import * as models from './models';
import migrations from './migrations';

let database: Database | null = null;

export const getDatabase = (): Database => {
  if (!database) {
    const adapter = new SQLiteAdapter({
      schema: chatSchema,
      migrations,
      onSetUpError: (error) => {
        console.error('❌ [Database] Setup error:', error);
      },
    });

    database = new Database({
      adapter,
      modelClasses: [models.Room, models.Message, models.Attachment, models.RoomMember, models.User],
    });
  }

  return database;
};

export * from './schema';
export * from './models';

