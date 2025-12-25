// @ts-nocheck
import * as VideoThumbnails from 'expo-video-thumbnails';
import { renderHook, act } from '@testing-library/react-native';

import { useVideoThumbnail } from './use-video-thumbnail';

jest.mock('expo-video-thumbnails', () => ({
  getThumbnailAsync: jest.fn(),
}));

describe('useVideoThumbnail', () => {
  const getThumbnailAsyncMock =
    VideoThumbnails.getThumbnailAsync as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does nothing when not a video or no uri', async () => {
    const { result } = renderHook(() =>
      useVideoThumbnail({ videoUri: null, isVideo: false })
    );

    expect(result.current.thumbnailUri).toBeNull();
    expect(result.current.isGenerating).toBe(false);
    expect(result.current.error).toBeNull();
    expect(getThumbnailAsyncMock).not.toHaveBeenCalled();
  });

  it('generates thumbnail successfully', async () => {
    getThumbnailAsyncMock.mockResolvedValueOnce({ uri: 'thumb-uri' });

    const { result } = renderHook(() =>
      useVideoThumbnail({ videoUri: 'video.mp4', isVideo: true, time: 1000 })
    );

    await act(async () => {
      // allow hook effect to run
      await Promise.resolve();
    });

    expect(getThumbnailAsyncMock).toHaveBeenCalledWith('video.mp4', {
      time: 1000,
      quality: 1,
    });
    expect(result.current.thumbnailUri).toBe('thumb-uri');
    expect(result.current.isGenerating).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('handles errors from getThumbnailAsync', async () => {
    getThumbnailAsyncMock.mockRejectedValueOnce(new Error('boom'));

    const { result } = renderHook(() =>
      useVideoThumbnail({ videoUri: 'video.mp4', isVideo: true })
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.thumbnailUri).toBeNull();
    expect(result.current.isGenerating).toBe(false);
    expect(result.current.error).toBe('boom');
  });
});
