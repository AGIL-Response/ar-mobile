import { requestQueue } from './request-queue';
import type { InternalAxiosRequestConfig } from 'axios';

describe('RequestQueue', () => {
  beforeEach(() => {
    // Clear the queue before each test
    requestQueue.clear();
    requestQueue.setRefreshing(false);
    requestQueue.setRefreshPromise(null);
  });

  describe('enqueue', () => {
    it('adds request to queue', () => {
      const mockResolve = jest.fn();
      const mockReject = jest.fn();
      const mockConfig = { url: '/test' } as InternalAxiosRequestConfig;

      expect(requestQueue.length()).toBe(0);

      requestQueue.enqueue({
        resolve: mockResolve,
        reject: mockReject,
        config: mockConfig,
      });

      expect(requestQueue.length()).toBe(1);
    });

    it('adds multiple requests to queue', () => {
      const mockConfig = { url: '/test' } as InternalAxiosRequestConfig;

      requestQueue.enqueue({
        resolve: jest.fn(),
        reject: jest.fn(),
        config: mockConfig,
      });

      requestQueue.enqueue({
        resolve: jest.fn(),
        reject: jest.fn(),
        config: { url: '/test2' } as InternalAxiosRequestConfig,
      });

      expect(requestQueue.length()).toBe(2);
    });
  });

  describe('processQueue', () => {
    it('processes all queued requests with error', async () => {
      const mockReject1 = jest.fn();
      const mockReject2 = jest.fn();
      const mockConfig = { url: '/test' } as InternalAxiosRequestConfig;
      const error = new Error('Token refresh failed');

      requestQueue.enqueue({
        resolve: jest.fn(),
        reject: mockReject1,
        config: mockConfig,
      });

      requestQueue.enqueue({
        resolve: jest.fn(),
        reject: mockReject2,
        config: mockConfig,
      });

      expect(requestQueue.length()).toBe(2);

      await requestQueue.processQueue(error);

      expect(mockReject1).toHaveBeenCalledWith(error);
      expect(mockReject2).toHaveBeenCalledWith(error);
      expect(requestQueue.length()).toBe(0);
    });

    it('clears queue after processing', async () => {
      const mockConfig = { url: '/test' } as InternalAxiosRequestConfig;

      requestQueue.enqueue({
        resolve: jest.fn(),
        reject: jest.fn(),
        config: mockConfig,
      });

      await requestQueue.processQueue(new Error('Test error'));

      expect(requestQueue.length()).toBe(0);
    });

    it('handles empty queue gracefully', async () => {
      expect(requestQueue.length()).toBe(0);
      
      // Should not throw
      await expect(requestQueue.processQueue(new Error('Test'))).resolves.toBeUndefined();
      
      expect(requestQueue.length()).toBe(0);
    });
  });

  describe('getQueuedRequests', () => {
    it('returns all queued requests', () => {
      const mockResolve1 = jest.fn();
      const mockReject1 = jest.fn();
      const mockConfig1 = { url: '/test1' } as InternalAxiosRequestConfig;

      const mockResolve2 = jest.fn();
      const mockReject2 = jest.fn();
      const mockConfig2 = { url: '/test2' } as InternalAxiosRequestConfig;

      requestQueue.enqueue({
        resolve: mockResolve1,
        reject: mockReject1,
        config: mockConfig1,
      });

      requestQueue.enqueue({
        resolve: mockResolve2,
        reject: mockReject2,
        config: mockConfig2,
      });

      const requests = requestQueue.getQueuedRequests();

      expect(requests).toHaveLength(2);
      expect(requests[0].resolve).toBe(mockResolve1);
      expect(requests[0].reject).toBe(mockReject1);
      expect(requests[0].config).toBe(mockConfig1);
      expect(requests[1].resolve).toBe(mockResolve2);
      expect(requests[1].reject).toBe(mockReject2);
      expect(requests[1].config).toBe(mockConfig2);
    });

    it('clears queue after getting requests', () => {
      const mockConfig = { url: '/test' } as InternalAxiosRequestConfig;

      requestQueue.enqueue({
        resolve: jest.fn(),
        reject: jest.fn(),
        config: mockConfig,
      });

      expect(requestQueue.length()).toBe(1);

      requestQueue.getQueuedRequests();

      expect(requestQueue.length()).toBe(0);
    });

    it('returns empty array when queue is empty', () => {
      const requests = requestQueue.getQueuedRequests();

      expect(requests).toEqual([]);
      expect(requestQueue.length()).toBe(0);
    });

    it('returns copy of queue (not reference)', () => {
      const mockConfig = { url: '/test' } as InternalAxiosRequestConfig;

      requestQueue.enqueue({
        resolve: jest.fn(),
        reject: jest.fn(),
        config: mockConfig,
      });

      const requests1 = requestQueue.getQueuedRequests();
      
      // Queue should be cleared
      expect(requestQueue.length()).toBe(0);
      
      // Add another request
      requestQueue.enqueue({
        resolve: jest.fn(),
        reject: jest.fn(),
        config: mockConfig,
      });

      const requests2 = requestQueue.getQueuedRequests();

      // They should be different arrays
      expect(requests1).not.toBe(requests2);
      expect(requests1).toHaveLength(1);
      expect(requests2).toHaveLength(1);
    });
  });

  describe('isRefreshInProgress', () => {
    it('returns false by default', () => {
      expect(requestQueue.isRefreshInProgress()).toBe(false);
    });

    it('returns true when refreshing', () => {
      requestQueue.setRefreshing(true);
      expect(requestQueue.isRefreshInProgress()).toBe(true);
    });

    it('returns false after setting to false', () => {
      requestQueue.setRefreshing(true);
      expect(requestQueue.isRefreshInProgress()).toBe(true);

      requestQueue.setRefreshing(false);
      expect(requestQueue.isRefreshInProgress()).toBe(false);
    });
  });

  describe('setRefreshing', () => {
    it('sets refreshing state to true', () => {
      requestQueue.setRefreshing(true);
      expect(requestQueue.isRefreshInProgress()).toBe(true);
    });

    it('sets refreshing state to false', () => {
      requestQueue.setRefreshing(true);
      requestQueue.setRefreshing(false);
      expect(requestQueue.isRefreshInProgress()).toBe(false);
    });
  });

  describe('getRefreshPromise', () => {
    it('returns null by default', () => {
      expect(requestQueue.getRefreshPromise()).toBeNull();
    });

    it('returns the set promise', () => {
      const promise = Promise.resolve();
      requestQueue.setRefreshPromise(promise);
      expect(requestQueue.getRefreshPromise()).toBe(promise);
    });
  });

  describe('setRefreshPromise', () => {
    it('sets the refresh promise', () => {
      const promise = Promise.resolve();
      requestQueue.setRefreshPromise(promise);
      expect(requestQueue.getRefreshPromise()).toBe(promise);
    });

    it('sets promise to null', () => {
      const promise = Promise.resolve();
      requestQueue.setRefreshPromise(promise);
      expect(requestQueue.getRefreshPromise()).toBe(promise);

      requestQueue.setRefreshPromise(null);
      expect(requestQueue.getRefreshPromise()).toBeNull();
    });
  });

  describe('clear', () => {
    it('clears the queue', () => {
      const mockConfig = { url: '/test' } as InternalAxiosRequestConfig;

      requestQueue.enqueue({
        resolve: jest.fn(),
        reject: jest.fn(),
        config: mockConfig,
      });

      expect(requestQueue.length()).toBe(1);

      requestQueue.clear();

      expect(requestQueue.length()).toBe(0);
    });

    it('handles clearing empty queue', () => {
      expect(requestQueue.length()).toBe(0);
      
      requestQueue.clear();
      
      expect(requestQueue.length()).toBe(0);
    });

    it('clears multiple requests', () => {
      const mockConfig = { url: '/test' } as InternalAxiosRequestConfig;

      for (let i = 0; i < 5; i++) {
        requestQueue.enqueue({
          resolve: jest.fn(),
          reject: jest.fn(),
          config: mockConfig,
        });
      }

      expect(requestQueue.length()).toBe(5);

      requestQueue.clear();

      expect(requestQueue.length()).toBe(0);
    });
  });

  describe('length', () => {
    it('returns 0 for empty queue', () => {
      expect(requestQueue.length()).toBe(0);
    });

    it('returns correct length after adding requests', () => {
      const mockConfig = { url: '/test' } as InternalAxiosRequestConfig;

      requestQueue.enqueue({
        resolve: jest.fn(),
        reject: jest.fn(),
        config: mockConfig,
      });

      expect(requestQueue.length()).toBe(1);

      requestQueue.enqueue({
        resolve: jest.fn(),
        reject: jest.fn(),
        config: mockConfig,
      });

      expect(requestQueue.length()).toBe(2);
    });

    it('returns correct length after clearing', () => {
      const mockConfig = { url: '/test' } as InternalAxiosRequestConfig;

      requestQueue.enqueue({
        resolve: jest.fn(),
        reject: jest.fn(),
        config: mockConfig,
      });

      requestQueue.clear();

      expect(requestQueue.length()).toBe(0);
    });
  });

  describe('Integration scenarios', () => {
    it('handles complete refresh flow', async () => {
      const mockConfig = { url: '/test' } as InternalAxiosRequestConfig;
      const mockResolve = jest.fn();
      const mockReject = jest.fn();

      // Start with no refresh in progress
      expect(requestQueue.isRefreshInProgress()).toBe(false);

      // Set refresh in progress
      requestQueue.setRefreshing(true);
      expect(requestQueue.isRefreshInProgress()).toBe(true);

      // Queue some requests
      requestQueue.enqueue({
        resolve: mockResolve,
        reject: mockReject,
        config: mockConfig,
      });

      expect(requestQueue.length()).toBe(1);

      // Get queued requests
      const requests = requestQueue.getQueuedRequests();
      expect(requests).toHaveLength(1);
      expect(requestQueue.length()).toBe(0);

      // Finish refresh
      requestQueue.setRefreshing(false);
      expect(requestQueue.isRefreshInProgress()).toBe(false);
    });

    it('handles refresh failure flow', async () => {
      const mockReject1 = jest.fn();
      const mockReject2 = jest.fn();
      const mockConfig = { url: '/test' } as InternalAxiosRequestConfig;
      const error = new Error('Refresh failed');

      // Set refresh in progress
      requestQueue.setRefreshing(true);

      // Queue multiple requests
      requestQueue.enqueue({
        resolve: jest.fn(),
        reject: mockReject1,
        config: mockConfig,
      });

      requestQueue.enqueue({
        resolve: jest.fn(),
        reject: mockReject2,
        config: mockConfig,
      });

      expect(requestQueue.length()).toBe(2);

      // Process queue with error
      await requestQueue.processQueue(error);

      // All should be rejected
      expect(mockReject1).toHaveBeenCalledWith(error);
      expect(mockReject2).toHaveBeenCalledWith(error);
      expect(requestQueue.length()).toBe(0);

      // Finish refresh
      requestQueue.setRefreshing(false);
    });

    it('maintains queue independence after getQueuedRequests', () => {
      const mockConfig = { url: '/test' } as InternalAxiosRequestConfig;

      // Add first batch
      requestQueue.enqueue({
        resolve: jest.fn(),
        reject: jest.fn(),
        config: mockConfig,
      });

      const firstBatch = requestQueue.getQueuedRequests();
      expect(firstBatch).toHaveLength(1);
      expect(requestQueue.length()).toBe(0);

      // Add second batch
      requestQueue.enqueue({
        resolve: jest.fn(),
        reject: jest.fn(),
        config: mockConfig,
      });

      const secondBatch = requestQueue.getQueuedRequests();
      expect(secondBatch).toHaveLength(1);
      expect(firstBatch).toHaveLength(1); // First batch unchanged
    });
  });
});

