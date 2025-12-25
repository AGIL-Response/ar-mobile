import type { AVPlaybackStatusSuccess } from 'expo-av';
import { Audio } from 'expo-av';
import * as FileSystemLegacy from 'expo-file-system/legacy';
import type { IBaseState, InitStateType } from '@/stores/interfaces/IBaseState';
import { createStore, resetStore } from '@/stores/utils';
import { mediaApiClient } from '@/api/api-client';

type AudioStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'error';

interface AudioTrack {
  id: string;
  url: string;
  title?: string;
}

export interface AudioPlayerState extends IBaseState {
  currentId: string | null;
  title: string | null;
  status: AudioStatus;
  positionMillis: number;
  durationMillis: number;
  error: string | null;
  actions: {
    play: (track: AudioTrack) => Promise<void>;
    togglePlayPause: (track: AudioTrack) => Promise<void>;
    pause: () => Promise<void>;
    resume: () => Promise<void>;
    seek: (millis: number) => Promise<void>;
    stop: () => Promise<void>;
    reset: () => void;
  };
}

const initialState: InitStateType<AudioPlayerState> = {
  currentId: null,
  title: null,
  status: 'idle',
  positionMillis: 0,
  durationMillis: 0,
  error: null,
};

let soundRef: Audio.Sound | null = null;

const setAudioModeForPlayback = async () => {
  await Audio.setAudioModeAsync({
    playsInSilentModeIOS: true,
    allowsRecordingIOS: false,
    staysActiveInBackground: false,
    shouldDuckAndroid: true,
    playThroughEarpieceAndroid: false,
  });
};

const unloadCurrentSound = async () => {
  if (soundRef) {
    try {
      await soundRef.stopAsync();
    } catch {
      // no-op
    }
    try {
      await soundRef.unloadAsync();
    } catch {
      // no-op
    } finally {
      soundRef = null;
    }
  }
};

const updateFromStatus = (
  status: AVPlaybackStatusSuccess,
  set: (fn: (state: AudioPlayerState) => void) => void,
  trackId: string
) => {
  set((state: AudioPlayerState) => {
    if (state.currentId !== trackId) return;
    state.positionMillis = status.positionMillis ?? 0;
    state.durationMillis = status.durationMillis ?? 0;

    if (status.didJustFinish) {
      state.currentId = null;
      state.title = null;
      state.status = 'idle';
      state.positionMillis = 0;
      state.durationMillis = status.durationMillis ?? 0;
      return;
    }

    state.status = status.isPlaying ? 'playing' : 'paused';
  });

  if (status.didJustFinish) {
    void unloadCurrentSound();
  }
};

const audioPlayerStore = (set: any, get: any) => ({
  ...initialState,
  actions: {
    play: async (track: AudioTrack) => {
      set((state: AudioPlayerState) => {
        state.currentId = track.id;
        state.title = track.title || null;
        state.status = 'loading';
        state.error = null;
      });

      try {
        await setAudioModeForPlayback();
        await unloadCurrentSound();

        const loadAndPlay = async (uri: string) => {
          return new Promise<void>((resolve, reject) => {
            let statusUpdateTimeout: ReturnType<typeof setTimeout> | null = null;
            let hasResolved = false;

            Audio.Sound.createAsync(
              { uri },
              { shouldPlay: true }
            )
              .then(({ sound, status }) => {
                soundRef = sound;

                // Set timeout to detect if audio never loads
                statusUpdateTimeout = setTimeout(() => {
                  if (!hasResolved) {
                    console.error('Audio loading timeout - no status update received');
                    reject(new Error('Audio loading timeout'));
                  }
                }, 10000); // 10 second timeout

                sound.setOnPlaybackStatusUpdate((playbackStatus) => {
                  if (statusUpdateTimeout) {
                    clearTimeout(statusUpdateTimeout);
                    statusUpdateTimeout = null;
                  }

                  if (!playbackStatus.isLoaded) {
                    if (playbackStatus.error) {
                      set((state: AudioPlayerState) => {
                        if (state.currentId !== track.id) return;
                        state.status = 'error';
                        state.error = playbackStatus.error || 'Failed to load audio';
                      });
                      if (!hasResolved) {
                        hasResolved = true;
                        reject(new Error(playbackStatus.error || 'Failed to load audio'));
                      }
                    }
                    return;
                  }

                  if (!hasResolved) {
                    hasResolved = true;
                    resolve();
                  }

                  updateFromStatus(playbackStatus, set, track.id);
                });

                if (status.isLoaded) {
                  if (statusUpdateTimeout) {
                    clearTimeout(statusUpdateTimeout);
                    statusUpdateTimeout = null;
                  }
                  if (!hasResolved) {
                    hasResolved = true;
                    resolve();
                  }
                  updateFromStatus(status, set, track.id);
                }
              })
              .catch((error) => {
                if (statusUpdateTimeout) {
                  clearTimeout(statusUpdateTimeout);
                  statusUpdateTimeout = null;
                }
                if (!hasResolved) {
                  hasResolved = true;
                  reject(error);
                }
              });
          });
        };

        // Extract file ID from URL if it's a media API URL
        const isMediaApiUrl = track.url.includes('/api/media/files/');
        let localUri: string | null = null;

        if (isMediaApiUrl) {
          // Download with authentication headers first
          try {
            const fileId = track.url.split('/files/')[1]?.split('?')[0];
            if (fileId) {
              console.log('Downloading audio file with auth:', fileId);
              const response = await mediaApiClient.get(`/files/${fileId}`, {
                responseType: 'arraybuffer',
              });

              const extension = track.title?.split('.').pop() || 'm4a';
              const fileName = `audio-cache-${track.id}.${extension}`;
              localUri = `${FileSystemLegacy.cacheDirectory ?? ''}${fileName}`;

              // Convert arraybuffer to base64
              const uint8Array = new Uint8Array(response.data as ArrayBuffer);
              let binary = '';
              const len = uint8Array.length;
              for (let i = 0; i < len; i++) {
                binary += String.fromCharCode(uint8Array[i]);
              }
              const base64 = btoa(binary);

              await FileSystemLegacy.writeAsStringAsync(localUri, base64, {
                encoding: FileSystemLegacy.EncodingType.Base64,
              });

              console.log('Audio file downloaded successfully');
            }
          } catch (downloadError) {
            console.warn('Authenticated download failed, trying direct URL', downloadError);
          }
        }

        // Try playing from local file first, then fallback to direct URL
        if (localUri) {
          try {
            await loadAndPlay(localUri);
          } catch (localError) {
            console.warn('Local file playback failed, trying direct URL', localError);
            await loadAndPlay(track.url);
          }
        } else {
          // Try direct URL first, then download fallback
          try {
            await loadAndPlay(track.url);
          } catch (streamError) {
            console.warn('Streaming audio failed, attempting download fallback', streamError);
            const extension = track.title?.split('.').pop() || 'm4a';
            const fileName = `audio-cache-${track.id}.${extension}`;
            localUri = `${FileSystemLegacy.cacheDirectory ?? ''}${fileName}`;
            try {
              await FileSystemLegacy.downloadAsync(track.url, localUri);
              await loadAndPlay(localUri);
            } catch (downloadError) {
              console.error('Audio download fallback failed', downloadError);
              throw downloadError;
            }
          }
        }
      } catch (error) {
        console.error('Audio playback error', error);
        await unloadCurrentSound();
        set((state: AudioPlayerState) => {
          state.status = 'error';
          state.error = error instanceof Error ? error.message : 'Failed to play audio';
        });
      }
    },

    togglePlayPause: async (track: AudioTrack) => {
      const { currentId, status } = get() as AudioPlayerState;

      if (currentId !== track.id) {
        await get().actions.play(track);
        return;
      }

      if (status === 'playing') {
        await get().actions.pause();
      } else if (status === 'paused' || status === 'idle') {
        await get().actions.resume();
      }
    },

    pause: async () => {
      if (!soundRef) return;
      try {
        const status = await soundRef.getStatusAsync();
        if (status.isLoaded && status.isPlaying) {
          await soundRef.pauseAsync();
          set((state: AudioPlayerState) => {
            state.status = 'paused';
          });
        }
      } catch (error) {
        console.error('Pause failed', error);
      }
    },

    resume: async () => {
      if (!soundRef) return;
      try {
        const status = await soundRef.getStatusAsync();
        if (status.isLoaded && !status.isPlaying) {
          await soundRef.playAsync();
          set((state: AudioPlayerState) => {
            state.status = 'playing';
          });
        }
      } catch (error) {
        console.error('Resume failed', error);
      }
    },

    seek: async (millis: number) => {
      if (!soundRef) return;
      try {
        const status = await soundRef.getStatusAsync();
        if (status.isLoaded) {
          await soundRef.setPositionAsync(millis);
          set((state: AudioPlayerState) => {
            state.positionMillis = millis;
            if (state.status === 'idle') {
              state.status = 'paused';
            }
          });
        }
      } catch (error) {
        console.error('Seek failed', error);
      }
    },

    stop: async () => {
      await unloadCurrentSound();
      set((state: AudioPlayerState) => {
        state.currentId = null;
        state.title = null;
        state.status = 'idle';
        state.positionMillis = 0;
        state.durationMillis = 0;
        state.error = null;
      });
    },

    reset: () => resetStore(initialState, set),
  },
  reset: () => resetStore(initialState, set),
});

export const useAudioPlayerStore = createStore<AudioPlayerState>(audioPlayerStore);


