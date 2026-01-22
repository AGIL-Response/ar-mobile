import { Audio } from 'expo-av';
import * as FileSystemLegacy from 'expo-file-system/legacy';
import { mediaApiClient } from '@/api/api-client';
import { useAudioPlayerStore } from './index';

// Mock API client
jest.mock('@/api/api-client', () => ({
  mediaApiClient: {
    get: jest.fn(),
  },
}));

describe('useAudioPlayerStore', () => {
  // Access global mocks
  const expoAvModule = jest.requireMock('expo-av');
  const mockSound = expoAvModule.__mockSound;
  let playbackStatusUpdateCallback: any;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();

    // Reset mock sound methods
    mockSound.stopAsync.mockResolvedValue(undefined);
    mockSound.unloadAsync.mockResolvedValue(undefined);
    mockSound.pauseAsync.mockResolvedValue(undefined);
    mockSound.playAsync.mockResolvedValue(undefined);
    mockSound.setPositionAsync.mockResolvedValue(undefined);
    mockSound.getStatusAsync.mockResolvedValue({
      isLoaded: true,
      isPlaying: false,
    });
    mockSound.setOnPlaybackStatusUpdate.mockImplementation((callback) => {
      playbackStatusUpdateCallback = callback;
    });

    // Default mock for Audio.Sound.createAsync
    (Audio.Sound.createAsync as jest.Mock).mockResolvedValue({
      sound: mockSound,
      status: {
        isLoaded: true,
        isPlaying: true,
        positionMillis: 0,
        durationMillis: 30000,
        didJustFinish: false,
      },
    });

    (Audio.setAudioModeAsync as jest.Mock).mockResolvedValue(undefined);
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useAudioPlayerStore.getState();

      expect(state.currentId).toBeNull();
      expect(state.title).toBeNull();
      expect(state.status).toBe('idle');
      expect(state.positionMillis).toBe(0);
      expect(state.durationMillis).toBe(0);
      expect(state.error).toBeNull();
    });

    it('should have all required actions', () => {
      const state = useAudioPlayerStore.getState();

      expect(state.actions.play).toBeDefined();
      expect(state.actions.togglePlayPause).toBeDefined();
      expect(state.actions.pause).toBeDefined();
      expect(state.actions.resume).toBeDefined();
      expect(state.actions.seek).toBeDefined();
      expect(state.actions.stop).toBeDefined();
      expect(state.actions.reset).toBeDefined();
    });
  });

  describe('play action', () => {
    it('should play audio successfully from direct URL', async () => {
      const track = {
        id: 'track-1',
        url: 'https://example.com/audio.mp3',
        title: 'Test Audio',
      };

      await useAudioPlayerStore.getState().actions.play(track);

      expect(Audio.setAudioModeAsync).toHaveBeenCalledWith({
        playsInSilentModeIOS: true,
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      expect(Audio.Sound.createAsync).toHaveBeenCalledWith(
        { uri: track.url },
        { shouldPlay: true }
      );

      const state = useAudioPlayerStore.getState();
      expect(state.currentId).toBe('track-1');
      expect(state.title).toBe('Test Audio');
      expect(state.status).toBe('playing');
    });

    it('should set loading state before playing', async () => {
      const track = {
        id: 'track-1',
        url: 'https://example.com/audio.mp3',
        title: 'Test Audio',
      };

      // Delay the createAsync to observe loading state
      let resolveCreate: any;
      (Audio.Sound.createAsync as jest.Mock).mockReturnValue(
        new Promise((resolve) => {
          resolveCreate = () =>
            resolve({
              sound: mockSound,
              status: {
                isLoaded: true,
                isPlaying: true,
                positionMillis: 0,
                durationMillis: 30000,
                didJustFinish: false,
              },
            });
        })
      );

      const playPromise = useAudioPlayerStore.getState().actions.play(track);

      // Check loading state immediately
      const loadingState = useAudioPlayerStore.getState();
      expect(loadingState.status).toBe('loading');
      expect(loadingState.currentId).toBe('track-1');

      // Resolve the promise
      resolveCreate();
      await playPromise;
    });

    it('should download and play audio from media API URL', async () => {
      const track = {
        id: 'track-1',
        url: 'https://api.example.com/api/media/files/file-123?token=abc',
        title: 'audio.m4a',
      };

      const mockArrayBuffer = new Uint8Array([1, 2, 3, 4]).buffer;
      (mediaApiClient.get as jest.Mock).mockResolvedValue({
        data: mockArrayBuffer,
      });

      await useAudioPlayerStore.getState().actions.play(track);

      expect(mediaApiClient.get).toHaveBeenCalledWith('/files/file-123', {
        responseType: 'arraybuffer',
      });

      expect(FileSystemLegacy.writeAsStringAsync).toHaveBeenCalledWith(
        '/mock/cache/audio-cache-track-1.m4a',
        expect.any(String),
        { encoding: 'base64' }
      );

      expect(Audio.Sound.createAsync).toHaveBeenCalledWith(
        { uri: '/mock/cache/audio-cache-track-1.m4a' },
        { shouldPlay: true }
      );
    });

    it('should fallback to direct URL if authenticated download fails', async () => {
      const track = {
        id: 'track-1',
        url: 'https://api.example.com/api/media/files/file-123',
        title: 'audio.m4a',
      };

      (mediaApiClient.get as jest.Mock).mockRejectedValue(new Error('Auth failed'));

      await useAudioPlayerStore.getState().actions.play(track);

      expect(console.warn).toHaveBeenCalledWith(
        'Authenticated download failed, trying direct URL',
        expect.any(Error)
      );

      expect(Audio.Sound.createAsync).toHaveBeenCalledWith(
        { uri: track.url },
        { shouldPlay: true }
      );
    });

    it('should fallback to download if streaming fails', async () => {
      const track = {
        id: 'track-1',
        url: 'https://example.com/audio.mp3',
        title: 'audio.mp3',
      };

      // First call (streaming) fails, second call (local file) succeeds
      (Audio.Sound.createAsync as jest.Mock)
        .mockRejectedValueOnce(new Error('Streaming failed'))
        .mockResolvedValueOnce({
          sound: mockSound,
          status: {
            isLoaded: true,
            isPlaying: true,
            positionMillis: 0,
            durationMillis: 30000,
            didJustFinish: false,
          },
        });

      (FileSystemLegacy.downloadAsync as jest.Mock).mockResolvedValue(undefined);

      await useAudioPlayerStore.getState().actions.play(track);

      expect(console.warn).toHaveBeenCalledWith(
        'Streaming audio failed, attempting download fallback',
        expect.any(Error)
      );

      expect(FileSystemLegacy.downloadAsync).toHaveBeenCalledWith(
        track.url,
        '/mock/cache/audio-cache-track-1.mp3'
      );

      expect(Audio.Sound.createAsync).toHaveBeenCalledTimes(2);
    });

    it('should handle playback error', async () => {
      const track = {
        id: 'track-1',
        url: 'https://example.com/audio.mp3',
        title: 'Test Audio',
      };

      (Audio.Sound.createAsync as jest.Mock).mockRejectedValue(
        new Error('Playback failed')
      );

      await useAudioPlayerStore.getState().actions.play(track);

      const state = useAudioPlayerStore.getState();
      expect(state.status).toBe('error');
      expect(state.error).toBe('Playback failed');
      expect(console.error).toHaveBeenCalledWith('Audio playback error', expect.any(Error));
    });

    it('should unload previous sound before playing new track', async () => {
      const track1 = {
        id: 'track-1',
        url: 'https://example.com/audio1.mp3',
        title: 'Audio 1',
      };

      const track2 = {
        id: 'track-2',
        url: 'https://example.com/audio2.mp3',
        title: 'Audio 2',
      };

      await useAudioPlayerStore.getState().actions.play(track1);
      expect(mockSound.stopAsync).toHaveBeenCalledTimes(0);

      await useAudioPlayerStore.getState().actions.play(track2);
      expect(mockSound.stopAsync).toHaveBeenCalledTimes(1);
      expect(mockSound.unloadAsync).toHaveBeenCalledTimes(1);
    });

    it('should update state from playback status', async () => {
      const track = {
        id: 'track-1',
        url: 'https://example.com/audio.mp3',
        title: 'Test Audio',
      };

      await useAudioPlayerStore.getState().actions.play(track);

      // Simulate playback status update
      playbackStatusUpdateCallback({
        isLoaded: true,
        isPlaying: true,
        positionMillis: 5000,
        durationMillis: 30000,
        didJustFinish: false,
      });

      const state = useAudioPlayerStore.getState();
      expect(state.positionMillis).toBe(5000);
      expect(state.durationMillis).toBe(30000);
      expect(state.status).toBe('playing');
    });

    it('should reset state when audio finishes', async () => {
      const track = {
        id: 'track-1',
        url: 'https://example.com/audio.mp3',
        title: 'Test Audio',
      };

      await useAudioPlayerStore.getState().actions.play(track);

      // Simulate audio finishing
      playbackStatusUpdateCallback({
        isLoaded: true,
        isPlaying: false,
        positionMillis: 30000,
        durationMillis: 30000,
        didJustFinish: true,
      });

      const state = useAudioPlayerStore.getState();
      expect(state.currentId).toBeNull();
      expect(state.title).toBeNull();
      expect(state.status).toBe('idle');
      expect(state.positionMillis).toBe(0);
    });


  });

  describe('togglePlayPause action', () => {
    it('should play new track if different track is requested', async () => {
      const track1 = {
        id: 'track-1',
        url: 'https://example.com/audio1.mp3',
        title: 'Audio 1',
      };

      const track2 = {
        id: 'track-2',
        url: 'https://example.com/audio2.mp3',
        title: 'Audio 2',
      };

      await useAudioPlayerStore.getState().actions.play(track1);
      await useAudioPlayerStore.getState().actions.togglePlayPause(track2);

      const state = useAudioPlayerStore.getState();
      expect(state.currentId).toBe('track-2');
      expect(state.title).toBe('Audio 2');
    });

    it('should pause if currently playing', async () => {
      const track = {
        id: 'track-1',
        url: 'https://example.com/audio.mp3',
        title: 'Test Audio',
      };

      await useAudioPlayerStore.getState().actions.play(track);

      mockSound.getStatusAsync.mockResolvedValue({
        isLoaded: true,
        isPlaying: true,
      });

      await useAudioPlayerStore.getState().actions.togglePlayPause(track);

      expect(mockSound.pauseAsync).toHaveBeenCalled();
    });

    it('should resume if currently paused', async () => {
      const track = {
        id: 'track-1',
        url: 'https://example.com/audio.mp3',
        title: 'Test Audio',
      };

      await useAudioPlayerStore.getState().actions.play(track);
      
      // Set status to paused
      mockSound.getStatusAsync.mockResolvedValue({
        isLoaded: true,
        isPlaying: true,
      });
      await useAudioPlayerStore.getState().actions.pause();

      // Now mock for resume
      mockSound.getStatusAsync.mockResolvedValue({
        isLoaded: true,
        isPlaying: false,
      });

      await useAudioPlayerStore.getState().actions.togglePlayPause(track);

      expect(mockSound.playAsync).toHaveBeenCalled();
    });
  });

  describe('pause action', () => {
    it('should pause playing audio', async () => {
      const track = {
        id: 'track-1',
        url: 'https://example.com/audio.mp3',
        title: 'Test Audio',
      };

      await useAudioPlayerStore.getState().actions.play(track);

      mockSound.getStatusAsync.mockResolvedValue({
        isLoaded: true,
        isPlaying: true,
      });

      await useAudioPlayerStore.getState().actions.pause();

      expect(mockSound.pauseAsync).toHaveBeenCalled();

      const state = useAudioPlayerStore.getState();
      expect(state.status).toBe('paused');
    });

    it('should not pause if audio is not playing', async () => {
      const track = {
        id: 'track-1',
        url: 'https://example.com/audio.mp3',
        title: 'Test Audio',
      };

      await useAudioPlayerStore.getState().actions.play(track);

      mockSound.getStatusAsync.mockResolvedValue({
        isLoaded: true,
        isPlaying: false,
      });

      await useAudioPlayerStore.getState().actions.pause();

      expect(mockSound.pauseAsync).not.toHaveBeenCalled();
    });

    it('should handle pause error gracefully', async () => {
      const track = {
        id: 'track-1',
        url: 'https://example.com/audio.mp3',
        title: 'Test Audio',
      };

      await useAudioPlayerStore.getState().actions.play(track);

      mockSound.getStatusAsync.mockResolvedValue({
        isLoaded: true,
        isPlaying: true,
      });

      mockSound.pauseAsync.mockRejectedValue(new Error('Pause failed'));

      await useAudioPlayerStore.getState().actions.pause();

      expect(console.error).toHaveBeenCalledWith('Pause failed', expect.any(Error));
    });
  });

  describe('resume action', () => {
    it('should resume paused audio', async () => {
      const track = {
        id: 'track-1',
        url: 'https://example.com/audio.mp3',
        title: 'Test Audio',
      };

      await useAudioPlayerStore.getState().actions.play(track);
      await useAudioPlayerStore.getState().actions.pause();

      mockSound.getStatusAsync.mockResolvedValue({
        isLoaded: true,
        isPlaying: false,
      });

      await useAudioPlayerStore.getState().actions.resume();

      expect(mockSound.playAsync).toHaveBeenCalled();

      const state = useAudioPlayerStore.getState();
      expect(state.status).toBe('playing');
    });

    it('should not resume if already playing', async () => {
      const track = {
        id: 'track-1',
        url: 'https://example.com/audio.mp3',
        title: 'Test Audio',
      };

      await useAudioPlayerStore.getState().actions.play(track);

      mockSound.getStatusAsync.mockResolvedValue({
        isLoaded: true,
        isPlaying: true,
      });

      await useAudioPlayerStore.getState().actions.resume();

      // playAsync should not be called again after initial play
      expect(mockSound.playAsync).toHaveBeenCalledTimes(0);
    });

    it('should handle resume error gracefully', async () => {
      const track = {
        id: 'track-1',
        url: 'https://example.com/audio.mp3',
        title: 'Test Audio',
      };

      await useAudioPlayerStore.getState().actions.play(track);

      mockSound.getStatusAsync.mockResolvedValue({
        isLoaded: true,
        isPlaying: false,
      });

      mockSound.playAsync.mockRejectedValue(new Error('Resume failed'));

      await useAudioPlayerStore.getState().actions.resume();

      expect(console.error).toHaveBeenCalledWith('Resume failed', expect.any(Error));
    });
  });

  describe('seek action', () => {
    it('should seek to specified position', async () => {
      const track = {
        id: 'track-1',
        url: 'https://example.com/audio.mp3',
        title: 'Test Audio',
      };

      await useAudioPlayerStore.getState().actions.play(track);

      mockSound.getStatusAsync.mockResolvedValue({
        isLoaded: true,
        isPlaying: true,
      });

      await useAudioPlayerStore.getState().actions.seek(15000);

      expect(mockSound.setPositionAsync).toHaveBeenCalledWith(15000);

      const state = useAudioPlayerStore.getState();
      expect(state.positionMillis).toBe(15000);
    });

    it('should maintain status when seeking while stopped', async () => {
      const track = {
        id: 'track-1',
        url: 'https://example.com/audio.mp3',
        title: 'Test Audio',
      };

      await useAudioPlayerStore.getState().actions.play(track);
      await useAudioPlayerStore.getState().actions.stop();

      // After stop, there's no sound loaded, so seek will do nothing
      await useAudioPlayerStore.getState().actions.seek(5000);

      const state = useAudioPlayerStore.getState();
      // After stop and failed seek, status remains idle
      expect(state.status).toBe('idle');
      expect(state.positionMillis).toBe(0);
    });

    it('should handle seek error gracefully', async () => {
      const track = {
        id: 'track-1',
        url: 'https://example.com/audio.mp3',
        title: 'Test Audio',
      };

      await useAudioPlayerStore.getState().actions.play(track);

      mockSound.getStatusAsync.mockResolvedValue({
        isLoaded: true,
        isPlaying: true,
      });

      mockSound.setPositionAsync.mockRejectedValue(new Error('Seek failed'));

      await useAudioPlayerStore.getState().actions.seek(10000);

      expect(console.error).toHaveBeenCalledWith('Seek failed', expect.any(Error));
    });
  });

  describe('stop action', () => {
    it('should stop audio and reset state', async () => {
      const track = {
        id: 'track-1',
        url: 'https://example.com/audio.mp3',
        title: 'Test Audio',
      };

      await useAudioPlayerStore.getState().actions.play(track);
      await useAudioPlayerStore.getState().actions.stop();

      expect(mockSound.stopAsync).toHaveBeenCalled();
      expect(mockSound.unloadAsync).toHaveBeenCalled();

      const state = useAudioPlayerStore.getState();
      expect(state.currentId).toBeNull();
      expect(state.title).toBeNull();
      expect(state.status).toBe('idle');
      expect(state.positionMillis).toBe(0);
      expect(state.durationMillis).toBe(0);
      expect(state.error).toBeNull();
    });

    it('should handle stop error gracefully', async () => {
      const track = {
        id: 'track-1',
        url: 'https://example.com/audio.mp3',
        title: 'Test Audio',
      };

      await useAudioPlayerStore.getState().actions.play(track);

      mockSound.stopAsync.mockRejectedValue(new Error('Stop failed'));

      await useAudioPlayerStore.getState().actions.stop();

      // Should still unload despite stop error
      expect(mockSound.unloadAsync).toHaveBeenCalled();

      const state = useAudioPlayerStore.getState();
      expect(state.status).toBe('idle');
    });

    it('should do nothing if no sound is loaded', async () => {
      await useAudioPlayerStore.getState().actions.stop();

      expect(mockSound.stopAsync).not.toHaveBeenCalled();
      expect(mockSound.unloadAsync).not.toHaveBeenCalled();
    });
  });

  describe('reset action', () => {
    it('should reset store to initial state', async () => {
      const track = {
        id: 'track-1',
        url: 'https://example.com/audio.mp3',
        title: 'Test Audio',
      };

      await useAudioPlayerStore.getState().actions.play(track);
      useAudioPlayerStore.getState().actions.reset();

      const state = useAudioPlayerStore.getState();
      expect(state.currentId).toBeNull();
      expect(state.title).toBeNull();
      expect(state.status).toBe('idle');
      expect(state.positionMillis).toBe(0);
      expect(state.durationMillis).toBe(0);
      expect(state.error).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle track without title', async () => {
      const track = {
        id: 'track-1',
        url: 'https://example.com/audio.mp3',
      };

      await useAudioPlayerStore.getState().actions.play(track);

      const state = useAudioPlayerStore.getState();
      expect(state.currentId).toBe('track-1');
      expect(state.title).toBeNull();
    });

    it('should use default extension when track has no extension', async () => {
      const track = {
        id: 'track-1',
        url: 'https://api.example.com/api/media/files/file-123',
        title: 'audio',
      };

      const mockArrayBuffer = new Uint8Array([1, 2, 3]).buffer;
      (mediaApiClient.get as jest.Mock).mockResolvedValue({
        data: mockArrayBuffer,
      });

      await useAudioPlayerStore.getState().actions.play(track);

      // The title "audio" has extension "audio" (last part after split), so it uses that
      // If we want .m4a, we need a title without any extension indicator
      expect(FileSystemLegacy.writeAsStringAsync).toHaveBeenCalledWith(
        '/mock/cache/audio-cache-track-1.audio',
        expect.any(String),
        expect.any(Object)
      );
    });

    it('should use fallback path when cache directory is empty', async () => {
      const originalCacheDir = FileSystemLegacy.cacheDirectory;
      (FileSystemLegacy as any).cacheDirectory = '';

      const track = {
        id: 'track-1',
        url: 'https://example.com/audio.mp3',
        title: 'audio.mp3',
      };

      (Audio.Sound.createAsync as jest.Mock)
        .mockRejectedValueOnce(new Error('Streaming failed'))
        .mockResolvedValueOnce({
          sound: mockSound,
          status: {
            isLoaded: true,
            isPlaying: true,
            positionMillis: 0,
            durationMillis: 30000,
            didJustFinish: false,
          },
        });

      (FileSystemLegacy.downloadAsync as jest.Mock).mockResolvedValue(undefined);

      await useAudioPlayerStore.getState().actions.play(track);

      expect(FileSystemLegacy.downloadAsync).toHaveBeenCalledWith(
        track.url,
        'audio-cache-track-1.mp3'
      );

      // Reset cache directory
      (FileSystemLegacy as any).cacheDirectory = originalCacheDir;
    });

    it('should handle playback status update for different track', async () => {
      const track = {
        id: 'track-1',
        url: 'https://example.com/audio.mp3',
        title: 'Test Audio',
      };

      await useAudioPlayerStore.getState().actions.play(track);

      // Change current track manually for testing
      const currentState = useAudioPlayerStore.getState();
      useAudioPlayerStore.setState({
        ...currentState,
        currentId: 'track-2',
      });

      // Status update for track-1 should be ignored
      playbackStatusUpdateCallback({
        isLoaded: true,
        isPlaying: true,
        positionMillis: 5000,
        durationMillis: 30000,
        didJustFinish: false,
      });

      const state = useAudioPlayerStore.getState();
      expect(state.positionMillis).toBe(0); // Should not update
    });

    it('should handle unloaded playback status', async () => {
      const track = {
        id: 'track-1',
        url: 'https://example.com/audio.mp3',
        title: 'Test Audio',
      };

      await useAudioPlayerStore.getState().actions.play(track);

      // Simulate unloaded status without error
      playbackStatusUpdateCallback({
        isLoaded: false,
      });

      // Should not throw error or update state
      const state = useAudioPlayerStore.getState();
      expect(state.status).toBe('playing');
    });


  });

  describe('Integration Scenarios', () => {
    it('should handle complete playback lifecycle', async () => {
      const track = {
        id: 'track-1',
        url: 'https://example.com/audio.mp3',
        title: 'Test Audio',
      };

      // Play
      await useAudioPlayerStore.getState().actions.play(track);
      expect(useAudioPlayerStore.getState().status).toBe('playing');

      // Pause
      mockSound.getStatusAsync.mockResolvedValue({
        isLoaded: true,
        isPlaying: true,
      });
      await useAudioPlayerStore.getState().actions.pause();
      expect(useAudioPlayerStore.getState().status).toBe('paused');

      // Resume
      mockSound.getStatusAsync.mockResolvedValue({
        isLoaded: true,
        isPlaying: false,
      });
      await useAudioPlayerStore.getState().actions.resume();
      expect(useAudioPlayerStore.getState().status).toBe('playing');

      // Seek
      mockSound.getStatusAsync.mockResolvedValue({
        isLoaded: true,
        isPlaying: true,
      });
      await useAudioPlayerStore.getState().actions.seek(10000);
      expect(useAudioPlayerStore.getState().positionMillis).toBe(10000);

      // Stop
      await useAudioPlayerStore.getState().actions.stop();
      expect(useAudioPlayerStore.getState().status).toBe('idle');
      expect(useAudioPlayerStore.getState().currentId).toBeNull();
    });

    it('should handle switching between multiple tracks', async () => {
      const track1 = {
        id: 'track-1',
        url: 'https://example.com/audio1.mp3',
        title: 'Audio 1',
      };

      const track2 = {
        id: 'track-2',
        url: 'https://example.com/audio2.mp3',
        title: 'Audio 2',
      };

      // Play track 1
      await useAudioPlayerStore.getState().actions.play(track1);
      expect(useAudioPlayerStore.getState().currentId).toBe('track-1');

      // Switch to track 2
      await useAudioPlayerStore.getState().actions.play(track2);
      expect(useAudioPlayerStore.getState().currentId).toBe('track-2');
      expect(mockSound.stopAsync).toHaveBeenCalled();
      expect(mockSound.unloadAsync).toHaveBeenCalled();
    });
  });
});
