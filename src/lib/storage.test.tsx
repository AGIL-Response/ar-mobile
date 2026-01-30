
// Unmock storage to test the actual implementation
jest.mock('@/lib/storage', () => {
  return jest.requireActual('@/lib/storage');
});

import { getItem, setItem, removeItem, storage } from './storage';

// Get the mock instance from the mocked module
// eslint-disable-next-line @typescript-eslint/no-require-imports
const mmkvModule = require('react-native-mmkv');
const mockMMKVInstanceFromModule = mmkvModule.__mockMMKVInstance;
const mockStorageFromModule = mmkvModule.__mockStorage;

describe('storage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStorageFromModule.clear();
    // Reset mock functions
    mockMMKVInstanceFromModule.getString.mockImplementation((key: string) => {
      return mockStorageFromModule.get(key) || undefined;
    });
    mockMMKVInstanceFromModule.set.mockImplementation((key: string, value: string) => {
      mockStorageFromModule.set(key, value);
    });
    mockMMKVInstanceFromModule.remove.mockImplementation((key: string) => {
      mockStorageFromModule.delete(key);
    });
  });

  describe('storage instance', () => {
    it('creates MMKV storage instance', () => {
      // createMMKV is called when the module is imported, so it should have been called
      // We verify that storage is the mocked instance
      expect(storage).toBe(mockMMKVInstanceFromModule);
      expect(storage).toBeDefined();
      expect(typeof storage.getString).toBe('function');
      expect(typeof storage.set).toBe('function');
      expect(typeof storage.remove).toBe('function');
    });
  });

  describe('getItem', () => {
    it('returns parsed JSON value when key exists', () => {
      const testData = { name: 'test', value: 123 };
      mockStorageFromModule.set('test-key', JSON.stringify(testData));

      const result = getItem<typeof testData>('test-key');

      expect(mockMMKVInstanceFromModule.getString).toHaveBeenCalledWith('test-key');
      expect(result).toEqual(testData);
    });

    it('returns null when key does not exist', () => {
      const result = getItem('non-existent-key');

      expect(mockMMKVInstanceFromModule.getString).toHaveBeenCalledWith('non-existent-key');
      expect(result).toBeNull();
    });

    it('returns null when value is empty string', () => {
      mockStorageFromModule.set('empty-key', '');

      const result = getItem('empty-key');

      expect(result).toBeNull();
    });

    it('returns null when JSON.parse returns falsy value', () => {
      mockStorageFromModule.set('falsy-key', 'null');

      const result = getItem('falsy-key');

      expect(result).toBeNull();
    });

    it('handles string values', () => {
      const testValue = 'test-string';
      mockStorageFromModule.set('string-key', JSON.stringify(testValue));

      const result = getItem<string>('string-key');

      expect(result).toBe(testValue);
    });

    it('handles number values', () => {
      const testValue = 42;
      mockStorageFromModule.set('number-key', JSON.stringify(testValue));

      const result = getItem<number>('number-key');

      expect(result).toBe(testValue);
    });

    it('handles boolean values', () => {
      const testValue = true;
      mockStorageFromModule.set('boolean-key', JSON.stringify(testValue));

      const result = getItem<boolean>('boolean-key');

      expect(result).toBe(testValue);
    });

    it('handles array values', () => {
      const testValue = [1, 2, 3, 'test'];
      mockStorageFromModule.set('array-key', JSON.stringify(testValue));

      const result = getItem<typeof testValue>('array-key');

      expect(result).toEqual(testValue);
    });

    it('handles nested object values', () => {
      const testValue = {
        user: {
          name: 'John',
          age: 30,
          address: {
            city: 'New York',
            zip: '10001',
          },
        },
      };
      mockStorageFromModule.set('nested-key', JSON.stringify(testValue));

      const result = getItem<typeof testValue>('nested-key');

      expect(result).toEqual(testValue);
    });

    it('handles complex nested structures', () => {
      const testValue = {
        items: [
          { id: 1, name: 'Item 1' },
          { id: 2, name: 'Item 2' },
        ],
        metadata: {
          count: 2,
          timestamp: Date.now(),
        },
      };
      mockStorageFromModule.set('complex-key', JSON.stringify(testValue));

      const result = getItem<typeof testValue>('complex-key');

      expect(result).toEqual(testValue);
    });

    it('handles null values stored as JSON', () => {
      mockStorageFromModule.set('null-key', JSON.stringify(null));

      const result = getItem<null>('null-key');

      expect(result).toBeNull();
    });

    it('handles undefined when getString returns undefined', () => {
      mockMMKVInstanceFromModule.getString.mockReturnValueOnce(undefined);

      const result = getItem('undefined-key');

      expect(result).toBeNull();
    });
  });

  describe('setItem', () => {
    it('stores string value as JSON', async () => {
      const testValue = 'test-string';
      await setItem('string-key', testValue);

      expect(mockMMKVInstanceFromModule.set).toHaveBeenCalledWith(
        'string-key',
        JSON.stringify(testValue)
      );
      expect(mockStorageFromModule.get('string-key')).toBe(JSON.stringify(testValue));
    });

    it('stores number value as JSON', async () => {
      const testValue = 42;
      await setItem('number-key', testValue);

      expect(mockMMKVInstanceFromModule.set).toHaveBeenCalledWith(
        'number-key',
        JSON.stringify(testValue)
      );
      expect(mockStorageFromModule.get('number-key')).toBe(JSON.stringify(testValue));
    });

    it('stores boolean value as JSON', async () => {
      const testValue = true;
      await setItem('boolean-key', testValue);

      expect(mockMMKVInstanceFromModule.set).toHaveBeenCalledWith(
        'boolean-key',
        JSON.stringify(testValue)
      );
      expect(mockStorageFromModule.get('boolean-key')).toBe(JSON.stringify(testValue));
    });

    it('stores object value as JSON', async () => {
      const testValue = { name: 'test', value: 123 };
      await setItem('object-key', testValue);

      expect(mockMMKVInstanceFromModule.set).toHaveBeenCalledWith(
        'object-key',
        JSON.stringify(testValue)
      );
      expect(mockStorageFromModule.get('object-key')).toBe(JSON.stringify(testValue));
    });

    it('stores array value as JSON', async () => {
      const testValue = [1, 2, 3, 'test'];
      await setItem('array-key', testValue);

      expect(mockMMKVInstanceFromModule.set).toHaveBeenCalledWith(
        'array-key',
        JSON.stringify(testValue)
      );
      expect(mockStorageFromModule.get('array-key')).toBe(JSON.stringify(testValue));
    });

    it('stores nested object value as JSON', async () => {
      const testValue = {
        user: {
          name: 'John',
          age: 30,
          address: {
            city: 'New York',
            zip: '10001',
          },
        },
      };
      await setItem('nested-key', testValue);

      expect(mockMMKVInstanceFromModule.set).toHaveBeenCalledWith(
        'nested-key',
        JSON.stringify(testValue)
      );
      expect(mockStorageFromModule.get('nested-key')).toBe(JSON.stringify(testValue));
    });

    it('stores null value as JSON', async () => {
      await setItem('null-key', null);

      expect(mockMMKVInstanceFromModule.set).toHaveBeenCalledWith(
        'null-key',
        JSON.stringify(null)
      );
      expect(mockStorageFromModule.get('null-key')).toBe(JSON.stringify(null));
    });

    it('overwrites existing value', async () => {
      const firstValue = 'first';
      const secondValue = 'second';

      await setItem('overwrite-key', firstValue);
      await setItem('overwrite-key', secondValue);

      expect(mockStorageFromModule.get('overwrite-key')).toBe(JSON.stringify(secondValue));
    });

    it('stores empty object', async () => {
      await setItem('empty-object-key', {});

      expect(mockMMKVInstanceFromModule.set).toHaveBeenCalledWith(
        'empty-object-key',
        JSON.stringify({})
      );
    });

    it('stores empty array', async () => {
      await setItem('empty-array-key', []);

      expect(mockMMKVInstanceFromModule.set).toHaveBeenCalledWith(
        'empty-array-key',
        JSON.stringify([])
      );
    });

    it('handles special characters in values', async () => {
      const testValue = { message: 'Hello "world" & <test>' };
      await setItem('special-chars-key', testValue);

      const stored = mockStorageFromModule.get('special-chars-key');
      expect(stored).toBe(JSON.stringify(testValue));
      expect(getItem('special-chars-key')).toEqual(testValue);
    });

    it('handles unicode characters', async () => {
      const testValue = { message: 'Hello 世界 🌍' };
      await setItem('unicode-key', testValue);

      const stored = mockStorageFromModule.get('unicode-key');
      expect(stored).toBe(JSON.stringify(testValue));
      expect(getItem('unicode-key')).toEqual(testValue);
    });
  });

  describe('removeItem', () => {
    it('removes existing item', async () => {
      mockStorageFromModule.set('remove-key', 'test-value');

      await removeItem('remove-key');

      expect(mockMMKVInstanceFromModule.remove).toHaveBeenCalledWith('remove-key');
      expect(mockStorageFromModule.has('remove-key')).toBe(false);
    });

    it('does not throw when removing non-existent key', async () => {
      await expect(removeItem('non-existent-key')).resolves.not.toThrow();
      expect(mockMMKVInstanceFromModule.remove).toHaveBeenCalledWith('non-existent-key');
    });

    it('removes item and subsequent getItem returns null', async () => {
      await setItem('remove-test-key', 'test-value');
      expect(getItem('remove-test-key')).toBe('test-value');

      await removeItem('remove-test-key');

      expect(getItem('remove-test-key')).toBeNull();
    });
  });

  describe('Integration', () => {
    it('setItem and getItem work together', async () => {
      const testData = { id: 1, name: 'Test' };
      await setItem('integration-key', testData);

      const retrieved = getItem<typeof testData>('integration-key');

      expect(retrieved).toEqual(testData);
    });

    it('setItem, getItem, and removeItem work together', async () => {
      const testData = { id: 1, name: 'Test' };
      await setItem('full-cycle-key', testData);
      expect(getItem('full-cycle-key')).toEqual(testData);

      await removeItem('full-cycle-key');
      expect(getItem('full-cycle-key')).toBeNull();
    });

    it('handles multiple keys independently', async () => {
      await setItem('key1', 'value1');
      await setItem('key2', 'value2');
      await setItem('key3', 'value3');

      expect(getItem('key1')).toBe('value1');
      expect(getItem('key2')).toBe('value2');
      expect(getItem('key3')).toBe('value3');

      await removeItem('key2');

      expect(getItem('key1')).toBe('value1');
      expect(getItem('key2')).toBeNull();
      expect(getItem('key3')).toBe('value3');
    });

    it('preserves data type through setItem and getItem cycle', async () => {
      const testCases = [
        { key: 'string', value: 'test' },
        { key: 'number', value: 42 },
        { key: 'boolean', value: true },
        { key: 'array', value: [1, 2, 3] },
        { key: 'object', value: { a: 1, b: 2 } },
        { key: 'null', value: null },
      ];

      for (const testCase of testCases) {
        await setItem(testCase.key, testCase.value);
        const retrieved = getItem(testCase.key);
        expect(retrieved).toEqual(testCase.value);
      }
    });
  });
});

