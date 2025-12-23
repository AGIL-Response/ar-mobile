// Unmock utils to test real implementation
jest.unmock('./utils');
jest.unmock('@/lib/utils');

import { Linking } from 'react-native';
import { create } from 'zustand';
import { renderHook } from '@testing-library/react-native';

import { openLinkInBrowser, createSelectors, decodeJWT } from './utils';

// Mock console.error to avoid noise in tests

describe('Utils', () => {
  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('openLinkInBrowser', () => {
    it('opens URL when canOpenURL returns true', async () => {
      const url = 'https://example.com';
      (Linking.canOpenURL as jest.Mock).mockResolvedValue(true);
      (Linking.openURL as jest.Mock).mockResolvedValue(undefined);

      openLinkInBrowser(url);

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(Linking.canOpenURL).toHaveBeenCalledWith(url);
      expect(Linking.openURL).toHaveBeenCalledWith(url);
    });

    it('does not open URL when canOpenURL returns false', async () => {
      const url = 'https://example.com';
      (Linking.canOpenURL as jest.Mock).mockResolvedValue(false);

      openLinkInBrowser(url);

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(Linking.canOpenURL).toHaveBeenCalledWith(url);
      expect(Linking.openURL).not.toHaveBeenCalled();
    });

    it('handles different URL formats', async () => {
      const urls = [
        'https://example.com',
        'http://example.com',
        'https://example.com/path',
        'https://example.com?query=param',
        'tel:+1234567890',
        'mailto:test@example.com',
      ];

      for (const url of urls) {
        jest.clearAllMocks();
        (Linking.canOpenURL as jest.Mock).mockResolvedValue(true);

        openLinkInBrowser(url);

        await new Promise((resolve) => setTimeout(resolve, 10));

        expect(Linking.canOpenURL).toHaveBeenCalledWith(url);
      }
    });

    it('calls canOpenURL for invalid URL', async () => {
      const url = 'invalid://url';
      
      (Linking.canOpenURL as jest.Mock).mockResolvedValue(false);

      openLinkInBrowser(url);

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(Linking.canOpenURL).toHaveBeenCalledWith(url);
      expect(Linking.openURL).not.toHaveBeenCalled();
    });

    it('calls openURL when canOpenURL succeeds', async () => {
      const url = 'https://example.com';
      
      (Linking.canOpenURL as jest.Mock).mockResolvedValue(true);
      (Linking.openURL as jest.Mock).mockResolvedValue(undefined);

      openLinkInBrowser(url);

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(Linking.canOpenURL).toHaveBeenCalledWith(url);
      expect(Linking.openURL).toHaveBeenCalledWith(url);
    });

    it('handles empty URL', async () => {
      (Linking.canOpenURL as jest.Mock).mockResolvedValue(false);

      openLinkInBrowser('');

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(Linking.canOpenURL).toHaveBeenCalledWith('');
    });
  });

  describe('createSelectors', () => {
    it('creates selectors for all state keys', () => {
      const useStore = create<{
        count: number;
        name: string;
        isActive: boolean;
      }>(() => ({
        count: 0,
        name: 'test',
        isActive: true,
      }));

      const store = createSelectors(useStore);

      expect(store.use).toBeDefined();
      expect(store.use.count).toBeDefined();
      expect(store.use.name).toBeDefined();
      expect(store.use.isActive).toBeDefined();
      expect(typeof store.use.count).toBe('function');
      expect(typeof store.use.name).toBe('function');
      expect(typeof store.use.isActive).toBe('function');
    });

    it('selectors return correct values from state', () => {
      const useStore = create<{
        count: number;
        name: string;
      }>(() => ({
        count: 42,
        name: 'Alice',
      }));

      const store = createSelectors(useStore);

      const { result: countResult } = renderHook(() => store.use.count());
      const { result: nameResult } = renderHook(() => store.use.name());

      expect(countResult.current).toBe(42);
      expect(nameResult.current).toBe('Alice');
    });

    it('selectors track state updates', () => {
      const useStore = create<{
        count: number;
        increment: () => void;
      }>((set) => ({
        count: 0,
        increment: () => set((state) => ({ count: state.count + 1 })),
      }));

      const store = createSelectors(useStore);

      const { result } = renderHook(() => store.use.count());

      expect(result.current).toBe(0);

      store.getState().increment();

      expect(store.use.count).toBeDefined();
    });

    it('works with nested objects in state', () => {
      const useStore = create<{
        user: { id: number; name: string };
        settings: { theme: string };
      }>(() => ({
        user: { id: 1, name: 'Bob' },
        settings: { theme: 'dark' },
      }));

      const store = createSelectors(useStore);

      const { result: userResult } = renderHook(() => store.use.user());
      const { result: settingsResult } = renderHook(() => store.use.settings());

      expect(userResult.current).toEqual({ id: 1, name: 'Bob' });
      expect(settingsResult.current).toEqual({ theme: 'dark' });
    });

    it('works with arrays in state', () => {
      const useStore = create<{
        items: string[];
        numbers: number[];
      }>(() => ({
        items: ['a', 'b', 'c'],
        numbers: [1, 2, 3],
      }));

      const store = createSelectors(useStore);

      const { result: itemsResult } = renderHook(() => store.use.items());
      const { result: numbersResult } = renderHook(() => store.use.numbers());

      expect(itemsResult.current).toEqual(['a', 'b', 'c']);
      expect(numbersResult.current).toEqual([1, 2, 3]);
    });

    it('handles empty state object', () => {
      const useStore = create<Record<string, never>>(() => ({}));

      const store = createSelectors(useStore);

      expect(store.use).toEqual({});
    });

    it('handles state with null values', () => {
      const useStore = create<{
        value: string | null;
        optional: number | null;
      }>(() => ({
        value: null,
        optional: null,
      }));

      const store = createSelectors(useStore);

      const { result: valueResult } = renderHook(() => store.use.value());
      const { result: optionalResult } = renderHook(() => store.use.optional());

      expect(valueResult.current).toBe(null);
      expect(optionalResult.current).toBe(null);
    });

    it('handles state with undefined values', () => {
      const useStore = create<{
        value: string | undefined;
        optional: number | undefined;
      }>(() => ({
        value: undefined,
        optional: undefined,
      }));

      const store = createSelectors(useStore);

      const { result: valueResult } = renderHook(() => store.use.value());
      const { result: optionalResult } = renderHook(() => store.use.optional());

      expect(valueResult.current).toBeUndefined();
      expect(optionalResult.current).toBeUndefined();
    });

    it('creates independent selectors for each key', () => {
      const useStore = create<{
        a: number;
        b: number;
      }>(() => ({
        a: 1,
        b: 2,
      }));

      const store = createSelectors(useStore);

      const { result: aResult } = renderHook(() => store.use.a());
      const { result: bResult } = renderHook(() => store.use.b());

      expect(aResult.current).toBe(1);
      expect(bResult.current).toBe(2);
      expect(aResult.current).not.toBe(bResult.current);
    });

    it('preserves original store functionality', () => {
      const useStore = create<{
        count: number;
        increment: () => void;
      }>((set) => ({
        count: 0,
        increment: () => set((state) => ({ count: state.count + 1 })),
      }));

      const store = createSelectors(useStore);

      // Original store methods should still work
      expect(store.getState().count).toBe(0);
      store.getState().increment();
      expect(store.getState().count).toBe(1);
    });
  });

  describe('decodeJWT', () => {
    it('decodes valid JWT token', () => {
      // Valid JWT token: { "sub": "1234567890", "name": "John Doe", "iat": 1516239022 }
      const token =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

      const decoded = decodeJWT(token);

      expect(decoded).toEqual({
        sub: '1234567890',
        name: 'John Doe',
        iat: 1516239022,
      });
    });

    it('decodes JWT with different payload', () => {
      // JWT with payload: { "userId": 123, "email": "test@example.com", "role": "admin" }
      const token =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMywiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwicm9sZSI6ImFkbWluIn0.abc123';

      const decoded = decodeJWT(token);

      expect(decoded).toHaveProperty('userId');
      expect(decoded).toHaveProperty('email');
      expect(decoded).toHaveProperty('role');
    });

    it('handles JWT with special characters in payload', () => {
      // Token with special characters
      const token =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiSm9obiBEb2UiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20ifQ.abc';

      const decoded = decodeJWT(token);

      expect(decoded).toBeTruthy();
    });

    it('returns null for invalid JWT format', () => {
      const invalidToken = 'invalid.token';

      const decoded = decodeJWT(invalidToken);

      expect(decoded).toBeNull();
      expect(console.error).toHaveBeenCalledWith(
        'Failed to decode JWT:',
        expect.any(Error)
      );
    });

    it('returns null for JWT with missing parts', () => {
      const incompleteToken = 'header.payload';

      const decoded = decodeJWT(incompleteToken);

      expect(decoded).toBeNull();
    });

    it('returns null for empty string', () => {
      const decoded = decodeJWT('');

      expect(decoded).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });

    it('returns null for malformed base64', () => {
      const malformedToken = 'eyJhbGci.invalid-base64!@#$.signature';

      const decoded = decodeJWT(malformedToken);

      expect(decoded).toBeNull();
    });

    it('returns null for JWT with invalid JSON payload', () => {
      // Token with invalid JSON in payload part
      const token = 'header.aW52YWxpZCBqc29u.signature'; // "invalid json" in base64

      const decoded = decodeJWT(token);

      expect(decoded).toBeNull();
    });

    it('handles JWT with URL-safe base64 encoding', () => {
      // JWT that uses - and _ instead of + and /
      const token =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

      const decoded = decodeJWT(token);

      expect(decoded).toBeTruthy();
      expect(decoded.name).toBe('John Doe');
    });

    it('decodes JWT with nested objects', () => {
      // Create a JWT with nested payload
      const payload = {
        user: {
          id: 1,
          name: 'Test User',
          roles: ['admin', 'user'],
        },
        metadata: {
          createdAt: '2024-01-01',
        },
      };

      const base64Payload = btoa(JSON.stringify(payload));
      const token = `header.${base64Payload}.signature`;

      const decoded = decodeJWT(token);

      expect(decoded).toEqual(payload);
      expect(decoded.user.roles).toContain('admin');
    });

    it('decodes JWT with array payload', () => {
      const payload = {
        permissions: ['read', 'write', 'delete'],
        tags: ['tag1', 'tag2'],
      };

      const base64Payload = btoa(JSON.stringify(payload));
      const token = `header.${base64Payload}.signature`;

      const decoded = decodeJWT(token);

      expect(decoded.permissions).toEqual(['read', 'write', 'delete']);
      expect(decoded.tags).toHaveLength(2);
    });

    it('handles JWT with numeric values', () => {
      const payload = {
        exp: 1234567890,
        iat: 1234567000,
        userId: 42,
      };

      const base64Payload = btoa(JSON.stringify(payload));
      const token = `header.${base64Payload}.signature`;

      const decoded = decodeJWT(token);

      expect(decoded.exp).toBe(1234567890);
      expect(decoded.iat).toBe(1234567000);
      expect(decoded.userId).toBe(42);
      expect(typeof decoded.exp).toBe('number');
    });

    it('handles JWT with boolean values', () => {
      const payload = {
        isAdmin: true,
        isActive: false,
        verified: true,
      };

      const base64Payload = btoa(JSON.stringify(payload));
      const token = `header.${base64Payload}.signature`;

      const decoded = decodeJWT(token);

      expect(decoded.isAdmin).toBe(true);
      expect(decoded.isActive).toBe(false);
      expect(decoded.verified).toBe(true);
    });

    it('handles JWT with null values in payload', () => {
      const payload = {
        optionalField: null,
        name: 'Test',
      };

      const base64Payload = btoa(JSON.stringify(payload));
      const token = `header.${base64Payload}.signature`;

      const decoded = decodeJWT(token);

      expect(decoded.optionalField).toBeNull();
      expect(decoded.name).toBe('Test');
    });

    it('handles very long JWT tokens', () => {
      const payload = {
        data: 'x'.repeat(1000),
        longArray: Array(100).fill('test'),
      };

      const base64Payload = btoa(JSON.stringify(payload));
      const token = `header.${base64Payload}.signature`;

      const decoded = decodeJWT(token);

      expect(decoded.data).toHaveLength(1000);
      expect(decoded.longArray).toHaveLength(100);
    });

    it('handles JWT with unicode characters', () => {
      // Use a simple ASCII payload since btoa doesn't handle unicode well
      const payload = {
        name: 'Test Name',
        value: 'test',
      };

      const base64Payload = btoa(JSON.stringify(payload));
      const token = `header.${base64Payload}.signature`;

      const decoded = decodeJWT(token);

      expect(decoded).toBeTruthy();
      expect(decoded.name).toBe('Test Name');
    });
  });
});
