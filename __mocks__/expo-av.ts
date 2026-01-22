// Mock for expo-av
const mockSound = {
  stopAsync: jest.fn().mockResolvedValue(undefined),
  unloadAsync: jest.fn().mockResolvedValue(undefined),
  pauseAsync: jest.fn().mockResolvedValue(undefined),
  playAsync: jest.fn().mockResolvedValue(undefined),
  setPositionAsync: jest.fn().mockResolvedValue(undefined),
  getStatusAsync: jest.fn().mockResolvedValue({
    isLoaded: true,
    isPlaying: false,
  }),
  setOnPlaybackStatusUpdate: jest.fn(),
};

module.exports = {
  __esModule: true,
  Audio: {
    setAudioModeAsync: jest.fn().mockResolvedValue(undefined),
    requestPermissionsAsync: jest.fn().mockResolvedValue({
      status: 'granted',
    }),
    Sound: {
      createAsync: jest.fn().mockResolvedValue({
        sound: mockSound,
        status: {
          isLoaded: true,
          isPlaying: true,
          positionMillis: 0,
          durationMillis: 30000,
          didJustFinish: false,
        },
      }),
    },
    Recording: {
      createAsync: jest.fn().mockResolvedValue({
        recording: {
          stopAndUnloadAsync: jest.fn().mockResolvedValue(undefined),
          getStatusAsync: jest.fn().mockResolvedValue({
            isRecording: true,
            canRecord: true,
            durationMillis: 0,
          }),
          getURI: jest.fn().mockReturnValue('file:///mock/recording.m4a'),
        },
        status: {
          isRecording: true,
          canRecord: true,
          durationMillis: 0,
        },
      }),
    },
    RecordingOptionsPresets: {
      HIGH_QUALITY: {
        android: {
          extension: '.m4a',
          outputFormat: 2,
          audioEncoder: 3,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          outputFormat: 'mpeg4aac',
          audioQuality: 127,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
      },
    },
  },
  Video: jest.fn(() => null),
  AVPlaybackStatus: {},
  InterruptionModeIOS: {
    MixWithOthers: 0,
    DoNotMix: 1,
    DuckOthers: 2,
  },
  InterruptionModeAndroid: {
    DoNotMix: 1,
    DuckOthers: 2,
  },
  // Export mock sound for direct access in tests
  __mockSound: mockSound,
};

