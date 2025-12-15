// Mock Model class
class MockModel {
  static table = '';
  static associations = {};
  
  id = 'mock-id';
  _raw = {};
  
  constructor(init?: any) {
    if (init) {
      Object.assign(this, init);
    }
  }
  
  async update(updates: any) {
    Object.assign(this, updates);
    return this;
  }
  
  async markAsDeleted() {
    return this;
  }
  
  async destroyPermanently() {
    return this;
  }
  
  observe() {
    return {
      subscribe: jest.fn(),
      unsubscribe: jest.fn(),
    };
  }
}

// Mock Database class
class MockDatabase {
  collections = {
    get: jest.fn(() => ({
      query: jest.fn(() => ({
        observe: jest.fn(() => ({
          subscribe: jest.fn(),
          unsubscribe: jest.fn(),
        })),
        fetch: jest.fn().mockResolvedValue([]),
      })),
      create: jest.fn().mockResolvedValue(new MockModel()),
      find: jest.fn().mockResolvedValue(new MockModel()),
      findAndObserve: jest.fn(() => ({
        subscribe: jest.fn(),
        unsubscribe: jest.fn(),
      })),
    })),
  };
  
  write = jest.fn((fn: any) => Promise.resolve(fn()));
  batch = jest.fn((fn: any) => Promise.resolve(fn()));
  adapter = {
    schema: {},
    migrations: [],
  };
  
  constructor(config?: any) {
    if (config) {
      this.adapter = config.adapter || this.adapter;
    }
  }
}

module.exports = {
  __esModule: true,
  default: {
    Model: MockModel,
    Database: MockDatabase,
  },
  Model: MockModel,
  Database: MockDatabase,
  Q: {
    where: jest.fn(),
    sortBy: jest.fn(),
    take: jest.fn(),
    skip: jest.fn(),
  },
  appSchema: jest.fn((schema: any) => schema),
  tableSchema: jest.fn((schema: any) => schema),
  columnSchema: jest.fn((schema: any) => schema),
  addColumns: jest.fn((schema: any, columns: any) => schema),
  createTable: jest.fn((schema: any) => schema),
  addIndex: jest.fn((schema: any, index: any) => schema),
};
