import { AudioRecorder } from './audioRecorder';
import * as AudioModule from 'expo-av';
import * as FileSystemModule from 'expo-file-system/legacy';

describe('AudioRecorder', () => {
  let mockRecording: any;
  let requestPermissionsSpy: jest.SpyInstance;
  let setAudioModeSpy: jest.SpyInstance;
  let createRecordingSpy: jest.SpyInstance;
  let getInfoAsyncSpy: jest.SpyInstance;
  let deleteAsyncSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();

    // Mock recording instance
    mockRecording = {
      stopAndUnloadAsync: jest.fn().mockResolvedValue(undefined),
      getStatusAsync: jest.fn().mockResolvedValue({
        isRecording: true,
        canRecord: true,
        durationMillis: 5000,
        isDoneRecording: false,
      }),
      getURI: jest.fn().mockReturnValue('file:///mock/recording.m4a'),
    };

    // Create spies for Audio methods
    requestPermissionsSpy = jest.spyOn(AudioModule.Audio, 'requestPermissionsAsync');
    setAudioModeSpy = jest.spyOn(AudioModule.Audio, 'setAudioModeAsync');
    createRecordingSpy = jest.spyOn(AudioModule.Audio.Recording, 'createAsync');

    // Mock Audio.Recording.createAsync
    createRecordingSpy.mockImplementation(() => {
      return Promise.resolve({
        recording: mockRecording,
        status: {
          isRecording: true,
          canRecord: true,
          durationMillis: 0,
        },
      });
    });

    // Mock Audio permissions - default to granted
    requestPermissionsSpy.mockResolvedValue({
      status: 'granted',
    });

    // Mock Audio.setAudioModeAsync
    setAudioModeSpy.mockResolvedValue(undefined);

    // Create spies for FileSystem methods
    getInfoAsyncSpy = jest.spyOn(FileSystemModule, 'getInfoAsync');
    deleteAsyncSpy = jest.spyOn(FileSystemModule, 'deleteAsync');

    // Mock FileSystemLegacy
    getInfoAsyncSpy.mockResolvedValue({
      exists: true,
      uri: 'file:///mock/recording.m4a',
      size: 1024,
      isDirectory: false,
    });

    deleteAsyncSpy.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Constructor', () => {
    it('should create instance with default options', () => {
      const recorder = new AudioRecorder();
      expect(recorder).toBeInstanceOf(AudioRecorder);
      expect(recorder.isRecording()).toBe(false);
    });

    it('should create instance with custom options', () => {
      const onStop = jest.fn();
      const onError = jest.fn();
      const recorder = new AudioRecorder({ onStop, onError });
      expect(recorder).toBeInstanceOf(AudioRecorder);
    });
  });

  describe('isSupported', () => {
    beforeEach(() => {
      requestPermissionsSpy.mockClear();
    });
    
    it('should return true when permission is granted', async () => {
      requestPermissionsSpy.mockResolvedValue({
        status: 'granted',
      });

      const isSupported = await AudioRecorder.isSupported();
      expect(isSupported).toBe(true);
    });

    it('should return false when permission is denied', async () => {
      requestPermissionsSpy.mockResolvedValue({
        status: 'denied',
      });

      const isSupported = await AudioRecorder.isSupported();
      expect(isSupported).toBe(false);
    });
  });

  describe('start', () => {
    it('should start recording successfully', async () => {
      const recorder = new AudioRecorder();

      await recorder.start();

      expect(requestPermissionsSpy).toHaveBeenCalled();
      expect(setAudioModeSpy).toHaveBeenCalled();
      expect(createRecordingSpy).toHaveBeenCalled();
      expect(recorder.isRecording()).toBe(true);
    });

    it('should throw error if permission is not granted', async () => {
      requestPermissionsSpy.mockResolvedValue({
        status: 'denied',
      });

      const recorder = new AudioRecorder();
      await expect(recorder.start()).rejects.toThrow(
        'Audio recording permission not granted'
      );
    });
  });

  describe('stop', () => {
    it('should stop recording successfully', async () => {
      const onStop = jest.fn();
      const recorder = new AudioRecorder({ onStop });

      await recorder.start();
      jest.advanceTimersByTime(100);

      await recorder.stop();

      expect(mockRecording.stopAndUnloadAsync).toHaveBeenCalled();
      expect(onStop).toHaveBeenCalledWith(
        expect.objectContaining({
          uri: 'file:///mock/recording.m4a',
          type: 'audio',
          mimeType: 'audio/mp4',
        })
      );
      expect(recorder.isRecording()).toBe(false);
    });

    it('should warn if no active recording to stop', async () => {
      const recorder = new AudioRecorder();

      await recorder.stop();

      expect(console.warn).toHaveBeenCalledWith('No active recording to stop');
    });
  });

  describe('cancel', () => {
    it('should cancel recording and delete file', async () => {
      const recorder = new AudioRecorder();

      await recorder.start();
      jest.advanceTimersByTime(100);

      await recorder.cancel();

      expect(mockRecording.stopAndUnloadAsync).toHaveBeenCalled();
      expect(deleteAsyncSpy).toHaveBeenCalledWith(
        'file:///mock/recording.m4a',
        { idempotent: true }
      );
      expect(recorder.isRecording()).toBe(false);
    });

    it('should do nothing if no recording exists', async () => {
      const recorder = new AudioRecorder();

      await recorder.cancel();

      expect(mockRecording.stopAndUnloadAsync).not.toHaveBeenCalled();
    });
  });

  describe('isRecording', () => {
    it('should return false initially', () => {
      const recorder = new AudioRecorder();
      expect(recorder.isRecording()).toBe(false);
    });

    it('should return true while recording', async () => {
      const recorder = new AudioRecorder();

      await recorder.start();
      jest.advanceTimersByTime(100);

      expect(recorder.isRecording()).toBe(true);
    });
  });

  describe('getDuration', () => {
    let dateNowSpy: jest.SpyInstance;
    let startTime: number;

    beforeEach(() => {
      startTime = 1000000000000; // Base time
      dateNowSpy = jest.spyOn(Date, 'now').mockReturnValue(startTime);
    });

    afterEach(() => {
      dateNowSpy.mockRestore();
    });

    it('should return 0 initially', () => {
      const recorder = new AudioRecorder();
      expect(recorder.getDuration()).toBe(0);
    });

    it('should return duration in seconds while recording', async () => {
      const recorder = new AudioRecorder();

      // Set Date.now() to return start time when recording starts
      dateNowSpy.mockReturnValue(startTime);
      await recorder.start();
      
      // Advance past the setTimeout in start() method
      jest.advanceTimersByTime(100);

      // Advance 5 seconds and update Date.now() to reflect the elapsed time
      dateNowSpy.mockReturnValue(startTime + 5000);
      jest.advanceTimersByTime(5000);

      const duration = recorder.getDuration();
      expect(duration).toBe(5);
    });
  });

  describe('destroy', () => {
    it('should cancel recording and cleanup', async () => {
      const recorder = new AudioRecorder();

      await recorder.start();
      jest.advanceTimersByTime(100);

      await recorder.destroy();

      expect(recorder.isRecording()).toBe(false);
      expect(mockRecording.stopAndUnloadAsync).toHaveBeenCalled();
    });

    it('should work even if no recording exists', async () => {
      const recorder = new AudioRecorder();

      await expect(recorder.destroy()).resolves.not.toThrow();
    });
  });
});
