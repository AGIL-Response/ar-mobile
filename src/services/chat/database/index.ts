import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { chatSchema } from './schema';
import * as models from './models';

let database: Database | null = null;

export const getDatabase = (): Database => {
  if (!database) {
    const adapter = new SQLiteAdapter({
      schema: chatSchema,
      // migrations: migrations, // Add migrations if needed
      // onSetUpError: (error) => {
      //   console.error('Database setup error:', error);
      // },
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

