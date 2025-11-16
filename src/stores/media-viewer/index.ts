import type { IBaseState, InitStateType } from '@/stores/interfaces/IBaseState';
import { createStore, resetStore } from '@/stores/utils';
import type { MediaItem } from '@/components/media-viewer-modal';

export interface MediaViewerState extends IBaseState {
  // State properties
  mediaItems: MediaItem[];
  initialIndex: number;
  isOpen: boolean;

  // Actions namespace
  actions: {
    openMediaViewer: (items: MediaItem[], index: number) => void;
    closeMediaViewer: () => void;
    reset: () => void;
  };
}

const initialState: InitStateType<MediaViewerState> = {
  mediaItems: [],
  initialIndex: 0,
  isOpen: false,
};

const mediaViewerStore = (set: any, get: any) => ({
  ...initialState,
  actions: {
    openMediaViewer: (items: MediaItem[], index: number) => {
      set((state: MediaViewerState) => {
        state.mediaItems = items;
        state.initialIndex = index;
        state.isOpen = true;
      });
    },
    closeMediaViewer: () => {
      set((state: MediaViewerState) => {
        state.isOpen = false;
      });
      // Clear items after animation delay
      setTimeout(() => {
        set((state: MediaViewerState) => {
          state.mediaItems = [];
          state.initialIndex = 0;
        });
      }, 300);
    },
    reset: () => resetStore(initialState, set),
  },
  reset: () => resetStore(initialState, set),
});

export const useMediaViewerStore = createStore<MediaViewerState>(mediaViewerStore);

