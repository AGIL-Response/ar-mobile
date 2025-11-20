import * as FileSystem from 'expo-file-system';

import { storage } from '@/lib/storage';

import { apiClient, handleApiError } from '../api-client';

export interface FileUploadOptions {
  incidentId: string;
  fileUri: string;
  fileName: string;
  mimeType: string;
}

export interface FileUploadResponse {
  code: string;
  data?: any;
  message?: string;
}

export interface FileViewOptions {
  fileId: string;
}

/**
 * Convert blob to data URI for displaying in React Native (for images)
 */
export const blobToDataUri = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Convert blob to file URI for React Native (for videos)
 * Saves blob to temporary file and returns file:// URI
 */
export const blobToFileUri = async (
  blob: Blob,
  mimeType?: string
): Promise<string> => {
  try {
    const extension = mimeType?.includes('video/mp4')
      ? 'mp4'
      : mimeType?.includes('video/quicktime')
        ? 'mov'
        : mimeType?.includes('video/webm')
          ? 'webm'
          : 'mp4'; // default to mp4

    // Create temporary file path
    const fileName = `temp_${Date.now()}_${Math.random().toString(36).substring(7)}.${extension}`;
    const fileUri = `${FileSystem.cacheDirectory}${fileName}`;

    // Convert blob to base64
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64Data = result.includes(',') ? result.split(',')[1] : result;
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    // Write to file system
    await FileSystem.writeAsStringAsync(fileUri, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return fileUri;
  } catch (error) {
    console.error('Failed to convert blob to file URI:', error);
    throw error;
  }
};

/**
 * Convert blob to appropriate URI based on mime type
 * - Images: data URI (for React Native Image component)
 * - Videos: file URI (for expo-video player)
 */
export const blobToUri = async (
  blob: Blob,
  mimeType?: string | null
): Promise<string> => {
  const isVideo = mimeType?.startsWith('video/') ?? false;

  if (isVideo) {
    return blobToFileUri(blob, mimeType || undefined);
  } else {
    return blobToDataUri(blob);
  }
};

/**
 * File cache interface
 */
interface FileCacheEntry {
  uri: string;
  mimeType: string | null;
}

/**
 * Storage key prefix for file cache entries
 */
const CACHE_KEY_PREFIX = 'file_cache_';
const CACHE_KEYS_KEY = 'file_cache_keys';

/**
 * In-memory cache for file URIs by fileId (for fast access)
 * Synced with persistent MMKV storage
 */
const fileUriCache = new Map<string, FileCacheEntry>();

/**
 * Initialize cache from persistent storage
 * Called once to load existing cache entries into memory
 */
let cacheInitialized = false;

const initializeCache = (): void => {
  if (cacheInitialized) return;

  try {
    const cacheKeys = storage.getString(CACHE_KEYS_KEY);
    if (cacheKeys) {
      const keys: string[] = JSON.parse(cacheKeys);
      keys.forEach((fileId) => {
        const cacheKey = `${CACHE_KEY_PREFIX}${fileId}`;
        const cachedValue = storage.getString(cacheKey);
        if (cachedValue) {
          const entry: FileCacheEntry = JSON.parse(cachedValue);
          fileUriCache.set(fileId, entry);
        }
      });
    }
  } catch (error) {
    console.log('Failed to initialize file cache from storage:', error);
  }

  cacheInitialized = true;
};

/**
 * Get all cache keys from storage
 */
const getCacheKeys = (): string[] => {
  try {
    const keys = storage.getString(CACHE_KEYS_KEY);
    return keys ? JSON.parse(keys) : [];
  } catch {
    return [];
  }
};

/**
 * Save cache keys to storage
 */
const saveCacheKeys = (keys: string[]): void => {
  storage.set(CACHE_KEYS_KEY, JSON.stringify(keys));
};

/**
 * Validate if a file URI exists (for file:// URIs only)
 * Returns true if file exists or if URI is not a file:// URI (e.g., data://)
 */
const validateFileUri = async (uri: string): Promise<boolean> => {
  // Only validate file:// URIs, data URIs are always valid
  if (!uri.startsWith('file://')) {
    return true;
  }

  try {
    const fileInfo = await FileSystem.getInfoAsync(uri);
    return fileInfo.exists;
  } catch (error) {
    console.log('Failed to validate file URI:', uri, error);
    return false;
  }
};

/**
 * Get cached file URI for a fileId
 * Checks in-memory cache first, then persistent storage
 * Validates file:// URIs to ensure they still exist
 */
export const getCachedFileUri = async (
  fileId: string | null | undefined
): Promise<FileCacheEntry | null> => {
  if (!fileId) return null;

  // Initialize cache on first access
  if (!cacheInitialized) {
    initializeCache();
  }

  // Get from in-memory cache (initialized from persistent storage on first access)
  const cachedEntry = fileUriCache.get(fileId);
  if (!cachedEntry) {
    return null;
  }

  const isValid = await validateFileUri(cachedEntry.uri);
  if (!isValid) {
    console.log('Cached file no longer exists, clearing cache:', fileId);
    clearCachedFileUri(fileId);
    return null;
  }

  return cachedEntry;
};

/**
 * Cache file URI for a fileId
 * Saves to both in-memory cache and persistent storage
 */
export const cacheFileUri = (
  fileId: string,
  uri: string,
  mimeType: string | null
): void => {
  const entry: FileCacheEntry = { uri, mimeType };

  // Update in-memory cache
  fileUriCache.set(fileId, entry);

  // Save to persistent storage
  try {
    const cacheKey = `${CACHE_KEY_PREFIX}${fileId}`;
    storage.set(cacheKey, JSON.stringify(entry));

    // Update cache keys list
    const keys = getCacheKeys();
    if (!keys.includes(fileId)) {
      keys.push(fileId);
      saveCacheKeys(keys);
    }
  } catch (error) {
    console.log('Failed to save file URI to cache storage:', error);
  }
};

/**
 * Clear cache for a specific fileId
 */
export const clearCachedFileUri = (fileId: string): void => {
  // Remove from in-memory cache
  fileUriCache.delete(fileId);

  // Remove from persistent storage
  try {
    const cacheKey = `${CACHE_KEY_PREFIX}${fileId}`;
    storage.delete(cacheKey);

    // Update cache keys list
    const keys = getCacheKeys().filter((key) => key !== fileId);
    saveCacheKeys(keys);
  } catch (error) {
    console.log('Failed to clear cached file URI from storage:', error);
  }
};

/**
 * Clear all cached file URIs
 */
export const clearAllCachedFileUris = (): void => {
  // Clear in-memory cache
  fileUriCache.clear();

  // Clear persistent storage
  try {
    const keys = getCacheKeys();
    keys.forEach((fileId) => {
      const cacheKey = `${CACHE_KEY_PREFIX}${fileId}`;
      storage.delete(cacheKey);
    });
    storage.delete(CACHE_KEYS_KEY);
  } catch (error) {
    console.log('Failed to clear all cached file URIs from storage:', error);
  }
};

export const filesApi = {
  /**
   * Upload a file attachment to an incident
   * Matches the web app's uploadFile function behavior
   */
  uploadIncidentAttachment: async (
    options: FileUploadOptions
  ): Promise<FileUploadResponse> => {
    try {
      const { incidentId, fileUri, fileName, mimeType } = options;

      console.log('🚀 File Upload Request:', {
        incidentId,
        fileName,
        mimeType,
        fileUri: fileUri.substring(0, 50) + '...', // Log truncated URI for privacy
      });

      // Read file as base64 to match web app's raw binary approach
      // The web app sends File object directly as body with Content-Type header
      // In React Native, we read the file and convert to a format axios can send
      const fileBase64 = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Convert base64 to binary string (Uint8Array) to match web app's File object
      // This matches how the web app sends raw binary data
      const binaryString = atob(fileBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      console.log('📁 File Info:', {
        size: bytes.length,
        type: mimeType,
      });

      // Send raw binary data matching web app's approach
      // Web app sends: body: file with Content-Type: file.type
      const response = await apiClient.post<FileUploadResponse>(
        '/files/upload',
        bytes,
        {
          headers: {
            'x-attached-id': incidentId,
            'x-file-name': fileName,
            'x-attached-type': 'incident_attachment',
            'Content-Type': mimeType, // Match web app's Content-Type header
          },
        }
      );

      console.log('✅ File Upload Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ File Upload Error:', error);
      throw handleApiError(error);
    }
  },

  /**
   * View/download a file by ID
   * Returns the raw file content as blob
   */
  viewFile: async (options: FileViewOptions): Promise<{ blob: Blob; type: string }> => {
    try {
      const { fileId } = options;

      console.log('🚀 File View Request:', { fileId });

      const url = `/files/view/${fileId}`;

      const response = await apiClient.get(url, {
        responseType: 'blob', // Important: Get raw binary data
      });

      return {
        blob: response.data,
        type: response.data.type || response.headers['content-type'],
      };
    } catch (error) {
      console.error('❌ File View Error:', error);
      throw handleApiError(error);
    }
  },
};
