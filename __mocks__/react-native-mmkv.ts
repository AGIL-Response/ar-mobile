// Shared mock storage that persists across imports
const mockStorage = new Map<string, string>();

const mockMMKVInstance = {
  getString: jest.fn((key: string) => {
    return mockStorage.get(key) || undefined;
  }),
  set: jest.fn((key: string, value: string) => {
    mockStorage.set(key, value);
  }),
  remove: jest.fn((key: string) => {
    mockStorage.delete(key);
  }),
  getAllKeys: jest.fn(() => Array.from(mockStorage.keys())),
  clearAll: jest.fn(() => {
    mockStorage.clear();
  }),
};

export const createMMKV = jest.fn(() => mockMMKVInstance);
export const useMMKVString = jest.fn();

// Export for testing purposes
export const __mockMMKVInstance = mockMMKVInstance;
export const __mockStorage = mockStorage;