/**
 * Video Thumbnail Hook
 * Custom hook for generating video thumbnails using expo-video-thumbnails
 */

import * as VideoThumbnails from 'expo-video-thumbnails';
import { useEffect, useState } from 'react';

interface UseVideoThumbnailOptions {
  videoUri: string | null | undefined;
  isVideo: boolean;
  time?: number;
  quality?: number;
}

interface UseVideoThumbnailResult {
  thumbnailUri: string | null;
  isGenerating: boolean;
  error: string | null;
}

/**
 * Custom hook to generate video thumbnails
 * @param options - Configuration options
 * @returns Thumbnail state and loading status
 */
export function useVideoThumbnail({
  videoUri,
  isVideo,
  time = 15000,
  quality = 1,
}: UseVideoThumbnailOptions): UseVideoThumbnailResult {
  const [thumbnailUri, setThumbnailUri] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateThumbnail = async () => {
      if (!isVideo || !videoUri || thumbnailUri) {
        return;
      }

      setIsGenerating(true);
      setError(null);

      try {
        const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, {
          time,
          quality,
        });
        setThumbnailUri(uri);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to generate thumbnail';
        console.log('Failed to generate video thumbnail:', errorMessage);
        setError(errorMessage);
        setThumbnailUri(null);
      } finally {
        setIsGenerating(false);
      }
    };

    generateThumbnail();
  }, [isVideo, videoUri, thumbnailUri, time, quality]);

  return {
    thumbnailUri,
    isGenerating,
    error,
  };
}
