// Mock SQLiteAdapter
class MockSQLiteAdapter {
  schema = {};
  migrations = [];
  
  constructor(config?: any) {
    if (config) {
      this.schema = config.schema || {};
      this.migrations = config.migrations || [];
    }
  }
}

export default MockSQLiteAdapter;

