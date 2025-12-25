import { schemaMigrations, addColumns } from '@nozbe/watermelondb/Schema/migrations';

export default schemaMigrations({
  migrations: [
    {
      toVersion: 3,
      steps: [
        addColumns({
          table: 'messages',
          columns: [
            { name: 'status', type: 'string', isOptional: true },
            { name: 'client_id', type: 'string', isOptional: true },
          ],
        }),
      ],
    },
    {
      toVersion: 4,
      steps: [
        addColumns({
          table: 'attachments',
          columns: [
            { name: 'thumbnail', type: 'string', isOptional: true },
            { name: 'duration', type: 'string', isOptional: true },
          ],
        }),
      ],
    },
  ],
});

