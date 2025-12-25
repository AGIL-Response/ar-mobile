/**
 * UUID utility functions
 * Generates UUID v4 compatible strings for React Native
 */

/**
 * Generate a UUID v4 string
 * Compatible with React Native (doesn't require crypto API)
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Generate a client ID for tracking message status
 */
export function generateClientId(): string {
  return `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

