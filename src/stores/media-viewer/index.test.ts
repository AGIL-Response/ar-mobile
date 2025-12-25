// Unmock the store to test the real implementation (must be before imports)
jest.unmock('@/stores/media-viewer');

import { act, renderHook } from '@testing-library/react-native';
import type { MediaItem } from '@/components/media-viewer-modal';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const realMediaViewerModule = jest.requireActual('./index') as typeof import('./index');
const useMediaViewerStore = realMediaViewerModule.useMediaViewerStore;

describe('MediaViewerStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    useMediaViewerStore.getState().reset?.();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Initial State', () => {
    it('initializes with correct default values', () => {
      const { result } = renderHook(() => useMediaViewerStore());

      expect(result.current.mediaItems).toEqual([]);
      expect(result.current.initialIndex).toBe(0);
      expect(result.current.isOpen).toBe(false);
    });
  });

  describe('openMediaViewer', () => {
    it('opens media viewer with items and index', () => {
      const { result } = renderHook(() => useMediaViewerStore());
      const mediaItems: MediaItem[] = [
        { fileId: '1', uri: 'uri1', mimeType: 'image/jpeg' },
        { fileId: '2', uri: 'uri2', mimeType: 'image/png' },
      ];

      act(() => {
        result.current.actions.openMediaViewer(mediaItems, 1);
      });

      expect(result.current.mediaItems).toEqual(mediaItems);
      expect(result.current.initialIndex).toBe(1);
      expect(result.current.isOpen).toBe(true);
    });

    it('can open with empty items array', () => {
      const { result } = renderHook(() => useMediaViewerStore());

      act(() => {
        result.current.actions.openMediaViewer([], 0);
      });

      expect(result.current.mediaItems).toEqual([]);
      expect(result.current.initialIndex).toBe(0);
      expect(result.current.isOpen).toBe(true);
    });
  });

  describe('closeMediaViewer', () => {
    it('closes media viewer and clears items after delay', () => {
      const { result } = renderHook(() => useMediaViewerStore());
      const mediaItems: MediaItem[] = [
        { fileId: '1', uri: 'uri1', mimeType: 'image/jpeg' },
      ];

      act(() => {
        result.current.actions.openMediaViewer(mediaItems, 0);
      });

      expect(result.current.isOpen).toBe(true);
      expect(result.current.mediaItems).toEqual(mediaItems);

      act(() => {
        result.current.actions.closeMediaViewer();
      });

      expect(result.current.isOpen).toBe(false);
      // Items should still be present immediately
      expect(result.current.mediaItems).toEqual(mediaItems);

      // After 300ms delay, items should be cleared
      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current.mediaItems).toEqual([]);
      expect(result.current.initialIndex).toBe(0);
    });
  });

  describe('reset', () => {
    it('resets store to initial state', () => {
      const { result } = renderHook(() => useMediaViewerStore());
      const mediaItems: MediaItem[] = [
        { fileId: '1', uri: 'uri1', mimeType: 'image/jpeg' },
      ];

      act(() => {
        result.current.actions.openMediaViewer(mediaItems, 1);
      });

      act(() => {
        result.current.actions.reset();
      });

      expect(result.current.mediaItems).toEqual([]);
      expect(result.current.initialIndex).toBe(0);
      expect(result.current.isOpen).toBe(false);
    });
  });
});
