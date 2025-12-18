/**
 * Media utilities for handling images, videos, and audio files
 */

export const ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
export const ALLOWED_VIDEO_EXTENSIONS = ['mp4', 'mov', 'avi', 'webm', 'mkv', 'flv', 'wmv'];
export const ALLOWED_AUDIO_EXTENSIONS = ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac'];

export const MAX_FILE_SIZE_MB = 100;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export interface MediaFile {
  uri: string;
  name: string;
  type: string;
  size: number;
  mimeType?: string;
}

export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

/**
 * Get file extension from mimeType
 */
export function getExtensionFromMimeType(mimeType: string): string {
  const mimeToExt: Record<string, string> = {
    // Images
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    // Videos
    'video/mp4': 'mp4',
    'video/quicktime': 'mov',
    'video/x-msvideo': 'avi',
    'video/webm': 'webm',
    'video/x-matroska': 'mkv',
    // Audio
    'audio/mpeg': 'mp3',
    'audio/wav': 'wav',
    'audio/ogg': 'ogg',
    'audio/mp4': 'm4a',
    'audio/aac': 'aac',
    'audio/flac': 'flac',
  };
  return mimeToExt[mimeType.toLowerCase()] || '';
}

/**
 * Ensure filename has proper extension based on mimeType
 */
export function ensureFileExtension(filename: string, mimeType?: string): string {
  // If filename already has extension, return as is
  if (filename.includes('.')) {
    return filename;
  }
  
  // Try to get extension from mimeType
  if (mimeType) {
    const ext = getExtensionFromMimeType(mimeType);
    if (ext) {
      return `${filename}.${ext}`;
    }
  }
  
  // Fallback: try to extract from filename or use default
  const existingExt = getFileExtension(filename);
  if (existingExt) {
    return filename;
  }
  
  // Last resort: default to jpg for images
  return `${filename}.jpg`;
}

export function isImage(filename: string): boolean {
  const extension = getFileExtension(filename);
  return ALLOWED_IMAGE_EXTENSIONS.includes(extension);
}

export function isVideo(filename: string): boolean {
  const extension = getFileExtension(filename);
  return ALLOWED_VIDEO_EXTENSIONS.includes(extension);
}

export function isAudio(filename: string): boolean {
  const extension = getFileExtension(filename);
  return ALLOWED_AUDIO_EXTENSIONS.includes(extension);
}

export function getMediaType(filename: string): 'image' | 'video' | 'audio' | 'file' {
  if (isImage(filename)) return 'image';
  if (isVideo(filename)) return 'video';
  if (isAudio(filename)) return 'audio';
  return 'file';
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function isFileSizeValid(size: number, maxSizeMB: number = MAX_FILE_SIZE_MB): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return size <= maxSizeBytes;
}

export function validateMediaFile(file: MediaFile): { valid: boolean; error?: string } {
  // Check file size
  if (!isFileSizeValid(file.size)) {
    return {
      valid: false,
      error: `File size exceeds ${MAX_FILE_SIZE_MB}MB limit`,
    };
  }

  const allAllowedExtensions = [
    ...ALLOWED_IMAGE_EXTENSIONS,
    ...ALLOWED_VIDEO_EXTENSIONS,
    ...ALLOWED_AUDIO_EXTENSIONS,
  ];

  // First, check if mimeType is valid (most reliable)
  if (file.mimeType) {
    const mimeLower = file.mimeType.toLowerCase();
    // Accept files with valid mimeType prefixes
    if (
      mimeLower.startsWith('image/') ||
      mimeLower.startsWith('video/') ||
      mimeLower.startsWith('audio/')
    ) {
      return { valid: true };
    }
  }

  // Fallback: check extension from filename
  const extension = getFileExtension(file.name);
  if (extension && allAllowedExtensions.includes(extension)) {
    return { valid: true };
  }

  // If we have mimeType but couldn't validate, try to get extension from mimeType
  if (file.mimeType) {
    const extensionFromMime = getExtensionFromMimeType(file.mimeType);
    if (extensionFromMime && allAllowedExtensions.includes(extensionFromMime)) {
      return { valid: true };
    }
  }

  // If we get here, neither mimeType nor extension is valid
  console.warn('File validation failed:', {
    name: file.name,
    mimeType: file.mimeType,
    extension,
    allAllowedExtensions,
  });

  return {
    valid: false,
    error: 'Unsupported file type',
  };
}

export function getMimeType(filename: string): string {
  const extension = getFileExtension(filename);
  
  // Images
  if (extension === 'jpg' || extension === 'jpeg') return 'image/jpeg';
  if (extension === 'png') return 'image/png';
  if (extension === 'gif') return 'image/gif';
  if (extension === 'webp') return 'image/webp';
  
  // Videos
  if (extension === 'mp4') return 'video/mp4';
  if (extension === 'mov') return 'video/quicktime';
  if (extension === 'avi') return 'video/x-msvideo';
  if (extension === 'webm') return 'video/webm';
  if (extension === 'mkv') return 'video/x-matroska';
  
  // Audio
  if (extension === 'mp3') return 'audio/mpeg';
  if (extension === 'wav') return 'audio/wav';
  if (extension === 'ogg') return 'audio/ogg';
  if (extension === 'm4a') return 'audio/mp4';
  if (extension === 'aac') return 'audio/aac';
  if (extension === 'flac') return 'audio/flac';
  
  return 'application/octet-stream';
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

