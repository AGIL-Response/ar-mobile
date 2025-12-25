/**
 * Hook for handling file uploads
 * Single Responsibility: Manage file upload state and progress
 */

import { useState, useCallback } from 'react';
import type { MediaFile } from '@/utils/media';
import type { ChatAttachment } from '@/services/chat';
import { filesApi } from '@/api/files';
import { getMimeType } from '@/utils/media';

export interface UseFileUploadReturn {
  uploadFiles: (files: MediaFile[]) => Promise<{
    fileIds: string[];
    localAttachments: ChatAttachment[];
  }>;
  uploadProgress: Record<string, number>;
  isUploading: boolean;
  resetProgress: () => void;
}

export function useFileUpload(): UseFileUploadReturn {
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [isUploading, setIsUploading] = useState(false);

  const uploadFiles = useCallback(async (files: MediaFile[]) => {
    if (files.length === 0) {
      return { fileIds: [], localAttachments: [] };
    }

    setIsUploading(true);
    const fileIds: string[] = [];
    const localAttachments: ChatAttachment[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileKey = `file-${i}`;

        try {
          setUploadProgress((prev) => ({ ...prev, [fileKey]: 0 }));

          const uploadResult = await filesApi.uploadChatFile({
            fileUri: file.uri,
            fileName: file.name,
            mimeType: file.mimeType || getMimeType(file.name),
            onProgress: (progress) => {
              setUploadProgress((prev) => ({ ...prev, [fileKey]: progress }));
            },
          });

          fileIds.push(uploadResult.fileId);

          localAttachments.push({
            id: uploadResult.fileId,
            filename: file.name,
            url: '', // Will be updated from server
            size: file.size,
            mimeType: file.mimeType || getMimeType(file.name),
            uploadedAt: new Date(),
          });

          setUploadProgress((prev) => ({ ...prev, [fileKey]: 100 }));
        } catch (error) {
          console.error(`❌ Failed to upload file ${file.name}:`, error);
          throw error;
        }
      }

      return { fileIds, localAttachments };
    } finally {
      setIsUploading(false);
    }
  }, []);

  const resetProgress = useCallback(() => {
    setUploadProgress({});
  }, []);

  return {
    uploadFiles,
    uploadProgress,
    isUploading,
    resetProgress,
  };
}

