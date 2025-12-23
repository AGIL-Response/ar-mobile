import type { InternalAxiosRequestConfig } from 'axios';

/**
 * Queue item for failed requests that need to be retried after token refresh
 */
interface QueuedRequest {
  resolve: (value: any) => void;
  reject: (error: any) => void;
  config: InternalAxiosRequestConfig;
}

/**
 * Request queue manager to handle concurrent 401 errors
 * Ensures only one token refresh happens at a time
 */
class RequestQueue {
  private queue: QueuedRequest[] = [];
  private isRefreshing = false;
  private refreshPromise: Promise<void> | null = null;

  /**
   * Add a request to the queue
   */
  enqueue(request: QueuedRequest): void {
    this.queue.push(request);
  }

  /**
   * Process all queued requests with error
   */
  async processQueue(error: any): Promise<void> {
    const requests = [...this.queue];
    this.queue = [];
    requests.forEach((request) => {
      request.reject(error);
    });
  }

  /**
   * Process all queued requests with success
   * Returns a function that will retry all queued requests
   */
  getQueuedRequests(): QueuedRequest[] {
    const requests = [...this.queue];
    this.queue = [];
    return requests;
  }

  /**
   * Check if a refresh is in progress
   */
  isRefreshInProgress(): boolean {
    return this.isRefreshing;
  }

  /**
   * Set refresh in progress state
   */
  setRefreshing(refreshing: boolean): void {
    this.isRefreshing = refreshing;
  }

  /**
   * Get or create refresh promise
   */
  getRefreshPromise(): Promise<void> | null {
    return this.refreshPromise;
  }

  /**
   * Set refresh promise
   */
  setRefreshPromise(promise: Promise<void> | null): void {
    this.refreshPromise = promise;
  }

  /**
   * Clear the queue
   */
  clear(): void {
    this.queue = [];
  }

  /**
   * Get queue length
   */
  length(): number {
    return this.queue.length;
  }
}

// Singleton instance
export const requestQueue = new RequestQueue();

