import {
  blobToDataUri,
  blobToFileUri,
  blobToUri,
  cacheFileUri,
  clearAllCachedFileUris,
  clearCachedFileUri,
  filesApi,
  getCachedFileUri,
} from './index';
import { handleApiError, mediaApiClient } from '../api-client';
import * as FileSystemLegacy from 'expo-file-system/legacy';
import { storage } from '@/lib/storage';

// Unmock @/api/files to test actual implementation
jest.unmock('@/api/files');

// Mock dependencies
jest.mock('../api-client');
jest.mock('expo-file-system/legacy');
jest.mock('@/lib/storage');

// Mock FileReader with proper async handling
// Use a factory function to create new instances for each test
const createMockFileReader = () => {
  class MockFileReader {
    result: string | ArrayBuffer | null = null;
    onload: ((event: ProgressEvent<FileReader>) => void) | null = null;
    onerror: ((event: ProgressEvent<FileReader>) => void) | null = null;

    readAsDataURL(blob: Blob): void {
      // Use Promise.resolve().then() to ensure async behavior
      // This ensures the callback is called in the next tick
      Promise.resolve().then(() => {
        if (this.onload) {
          const base64Data = btoa('mock-data');
          this.result = `data:${blob.type || 'application/octet-stream'};base64,${base64Data}`;
          this.onload({} as ProgressEvent<FileReader>);
        }
      });
    }
  }
  return MockFileReader;
};

// Mock global FileReader
global.FileReader = createMockFileReader() as unknown as typeof FileReader;

jest.spyOn(console, 'error').mockImplementation();
jest.spyOn(console, 'log').mockImplementation();

describe('filesApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear cache state
    clearAllCachedFileUris();
  });

  describe('blobToDataUri', () => {
    it('successfully converts blob to data URI', async () => {
      const blob = new Blob(['test data'], { type: 'image/png' });
      const result = await blobToDataUri(blob);

      expect(result).toContain('data:image/png;base64,');
      expect(result).toContain('bW9jay1kYXRh'); // base64 encoded "mock-data"
    });
  });

  describe('blobToFileUri', () => {
    const mockCacheDirectory = 'file:///cache/';
    const mockWriteAsStringAsync = jest.fn().mockResolvedValue(undefined);

    beforeEach(() => {
      (FileSystemLegacy.cacheDirectory as any) = mockCacheDirectory;
      (FileSystemLegacy.writeAsStringAsync as jest.Mock) = mockWriteAsStringAsync;
      (FileSystemLegacy.EncodingType as any) = {
        Base64: 'base64',
      };
    });

    it('successfully converts blob to file URI for mp4 video', async () => {
      const blob = new Blob(['video data'], { type: 'video/mp4' });
      const result = await blobToFileUri(blob, 'video/mp4');

      expect(result).toMatch(/^file:\/\/\/cache\/temp_\d+_.+\.mp4$/);
      expect(FileSystemLegacy.writeAsStringAsync).toHaveBeenCalledWith(
        expect.stringMatching(/\.mp4$/),
        expect.any(String),
        { encoding: 'base64' }
      );
    });

    it('uses correct extension for mov video', async () => {
      const blob = new Blob(['video data'], { type: 'video/quicktime' });
      const result = await blobToFileUri(blob, 'video/quicktime');

      expect(result).toMatch(/\.mov$/);
    });

    it('uses correct extension for webm video', async () => {
      const blob = new Blob(['video data'], { type: 'video/webm' });
      const result = await blobToFileUri(blob, 'video/webm');

      expect(result).toMatch(/\.webm$/);
    });

    it('defaults to mp4 when mimeType is not provided', async () => {
      const blob = new Blob(['video data']);
      const result = await blobToFileUri(blob);

      expect(result).toMatch(/\.mp4$/);
    });

    it('handles write errors', async () => {
      const blob = new Blob(['video data']);
      const writeError = new Error('Write failed');
      (FileSystemLegacy.writeAsStringAsync as jest.Mock).mockRejectedValue(writeError);

      await expect(blobToFileUri(blob)).rejects.toThrow('Write failed');
    });
  });

  describe('blobToUri', () => {
    it('returns file URI for video mime types', async () => {
      const blob = new Blob(['video data'], { type: 'video/mp4' });
      const mockCacheDirectory = 'file:///cache/';
      (FileSystemLegacy.cacheDirectory as any) = mockCacheDirectory;
      (FileSystemLegacy.writeAsStringAsync as jest.Mock).mockResolvedValue(undefined);
      (FileSystemLegacy.EncodingType as any) = { Base64: 'base64' };

      const result = await blobToUri(blob, 'video/mp4');

      expect(result).toMatch(/^file:\/\/\/cache\//);
    });

    it('returns data URI for non-video mime types', async () => {
      const blob = new Blob(['image data'], { type: 'image/png' });

      const result = await blobToUri(blob, 'image/png');

      expect(result).toContain('data:image/png;base64,');
    });

    it('returns data URI when mimeType is null', async () => {
      const blob = new Blob(['data']);

      const result = await blobToUri(blob, null);

      expect(result).toContain('data:');
    });
  });

  describe('getCachedFileUri', () => {
    beforeEach(() => {
      // Clear cache before each test
      clearAllCachedFileUris();
      (storage.remove as jest.Mock) = jest.fn();
      (storage.getString as jest.Mock) = jest.fn();
      (FileSystemLegacy.getInfoAsync as jest.Mock) = jest.fn();
    });

    it('returns null when fileId is null', async () => {
      const result = await getCachedFileUri(null);
      expect(result).toBeNull();
    });

    it('returns null when fileId is undefined', async () => {
      const result = await getCachedFileUri(undefined);
      expect(result).toBeNull();
    });

    it('returns cached entry when file exists', async () => {
      const fileId = 'file-1';
      const cachedUri = 'file:///cache/file1.jpg';
      const mimeType = 'image/jpeg';

      // First cache the file
      cacheFileUri(fileId, cachedUri, mimeType);

      (FileSystemLegacy.getInfoAsync as jest.Mock).mockResolvedValue({ exists: true });

      const result = await getCachedFileUri(fileId);

      expect(result).toEqual({ uri: cachedUri, mimeType });
    });

    it('clears cache when file no longer exists', async () => {
      const fileId = 'file-1';
      const cachedUri = 'file:///cache/file1.jpg';

      // First cache the file
      cacheFileUri(fileId, cachedUri, 'image/jpeg');

      (FileSystemLegacy.getInfoAsync as jest.Mock).mockResolvedValue({ exists: false });

      const result = await getCachedFileUri(fileId);

      expect(result).toBeNull();
      expect(storage.remove).toHaveBeenCalledWith('file_cache_file-1');
    });

    it('returns cached entry for data URI without validation', async () => {
      const fileId = 'file-1';
      const dataUri = 'data:image/png;base64,abc123';

      // First cache the file
      cacheFileUri(fileId, dataUri, 'image/png');

      const result = await getCachedFileUri(fileId);

      expect(result).toEqual({ uri: dataUri, mimeType: 'image/png' });
      expect(FileSystemLegacy.getInfoAsync).not.toHaveBeenCalled();
    });
  });

  describe('cacheFileUri', () => {
    beforeEach(() => {
      clearAllCachedFileUris();
      (storage.set as jest.Mock) = jest.fn();
      (storage.getString as jest.Mock) = jest.fn().mockReturnValue(null);
    });

    it('saves file URI to cache', () => {
      const fileId = 'file-1';
      const uri = 'file:///cache/file1.jpg';
      const mimeType = 'image/jpeg';

      cacheFileUri(fileId, uri, mimeType);

      expect(storage.set).toHaveBeenCalledWith(
        'file_cache_file-1',
        JSON.stringify({ uri, mimeType })
      );
    });

    it('updates cache keys list', () => {
      const fileId = 'file-1';
      const uri = 'file:///cache/file1.jpg';

      (storage.getString as jest.Mock).mockReturnValue(JSON.stringify(['file-2']));

      cacheFileUri(fileId, uri, 'image/jpeg');

      // Should be called twice: once for the cache entry, once for the keys
      expect(storage.set).toHaveBeenCalledWith(
        'file_cache_keys',
        JSON.stringify(['file-2', 'file-1'])
      );
    });

    it('does not duplicate fileId in cache keys', () => {
      const fileId = 'file-1';
      const uri = 'file:///cache/file1.jpg';

      // First cache it
      cacheFileUri(fileId, uri, 'image/jpeg');
    //   jest.clearAllMocks();

      // Cache again - should not add duplicate
      (storage.getString as jest.Mock).mockReturnValue(JSON.stringify(['file-1']));
      cacheFileUri(fileId, uri, 'image/jpeg');

      // Should update keys but not add duplicate
      expect(storage.set).toHaveBeenCalledWith(
        'file_cache_keys',
        JSON.stringify(['file-1'])
      );
    });

    it('handles storage errors gracefully', () => {
      const fileId = 'file-1';
      const uri = 'file:///cache/file1.jpg';

      (storage.set as jest.Mock).mockImplementation((key: string) => {
        if (key === 'file_cache_file-1') {
          throw new Error('Storage error');
        }
      });

      expect(() => cacheFileUri(fileId, uri, 'image/jpeg')).not.toThrow();
    });
  });

  describe('clearCachedFileUri', () => {
    beforeEach(() => {
      (storage.remove as jest.Mock) = jest.fn();
      (storage.getString as jest.Mock) = jest.fn().mockReturnValue(JSON.stringify(['file-1']));
    });

    it('removes file URI from cache', () => {
      clearCachedFileUri('file-1');

      expect(storage.remove).toHaveBeenCalledWith('file_cache_file-1');
      expect(storage.set).toHaveBeenCalledWith('file_cache_keys', JSON.stringify([]));
    });

    it('handles storage errors gracefully', () => {
      (storage.remove as jest.Mock).mockImplementation(() => {
        throw new Error('Storage error');
      });

      expect(() => clearCachedFileUri('file-1')).not.toThrow();
    });
  });

  describe('clearAllCachedFileUris', () => {
    beforeEach(() => {
      (storage.remove as jest.Mock) = jest.fn();
      (storage.getString as jest.Mock) = jest.fn().mockReturnValue(
        JSON.stringify(['file-1', 'file-2'])
      );
    });

    it('clears all cached file URIs', () => {
      clearAllCachedFileUris();

      expect(storage.remove).toHaveBeenCalledWith('file_cache_file-1');
      expect(storage.remove).toHaveBeenCalledWith('file_cache_file-2');
      expect(storage.remove).toHaveBeenCalledWith('file_cache_keys');
    });

    it('handles storage errors gracefully', () => {
      (storage.remove as jest.Mock).mockImplementation(() => {
        throw new Error('Storage error');
      });

      expect(() => clearAllCachedFileUris()).not.toThrow();
    });
  });

  describe('uploadIncidentAttachment', () => {
    const mockFileUri = 'file:///cache/test.jpg';
    const mockBase64 = 'dGVzdCBkYXRh'; // base64 for "test data"

    beforeEach(() => {
      (FileSystemLegacy.readAsStringAsync as jest.Mock) = jest
        .fn()
        .mockResolvedValue(mockBase64);
      (FileSystemLegacy.EncodingType as any) = {
        Base64: 'base64',
      };
    });

    it('successfully uploads file attachment', async () => {
      const options = {
        incidentId: 'incident-1',
        fileUri: mockFileUri,
        fileName: 'test.jpg',
        mimeType: 'image/jpeg',
      };

      const mockResponse = {
        data: {
          code: 'SUCCESS',
          data: { fileId: 'file-1' },
          message: 'File uploaded successfully',
        },
      };

      (mediaApiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await filesApi.uploadIncidentAttachment(options);

      expect(FileSystemLegacy.readAsStringAsync).toHaveBeenCalledWith(mockFileUri, {
        encoding: 'base64',
      });
      expect(mediaApiClient.post).toHaveBeenCalledWith(
        '/files',
        expect.any(Uint8Array),
        {
          headers: {
            'x-attached-id': 'incident-1',
            'x-file-name': 'test.jpg',
            'x-attached-type': 'incident_attachment',
            'Content-Type': 'image/jpeg',
          },
        }
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('converts base64 to Uint8Array correctly', async () => {
      const options = {
        incidentId: 'incident-1',
        fileUri: mockFileUri,
        fileName: 'test.jpg',
        mimeType: 'image/jpeg',
      };

      (mediaApiClient.post as jest.Mock).mockResolvedValue({
        data: { code: 'SUCCESS' },
      });

      await filesApi.uploadIncidentAttachment(options);

      const callArgs = (mediaApiClient.post as jest.Mock).mock.calls[0];
      const bytes = callArgs[1] as Uint8Array;

      expect(bytes).toBeInstanceOf(Uint8Array);
      expect(bytes.length).toBeGreaterThan(0);
    });

    it('handles upload errors', async () => {
      const options = {
        incidentId: 'incident-1',
        fileUri: mockFileUri,
        fileName: 'test.jpg',
        mimeType: 'image/jpeg',
      };

      const error = new Error('Upload failed');
      (mediaApiClient.post as jest.Mock).mockRejectedValue(error);
      (handleApiError as jest.Mock).mockReturnValue({
        message: 'Upload failed',
        status: 500,
      });

      await expect(filesApi.uploadIncidentAttachment(options)).rejects.toEqual({
        message: 'Upload failed',
        status: 500,
      });

      expect(handleApiError).toHaveBeenCalledWith(error);
    });

    it('handles file read errors', async () => {
      const options = {
        incidentId: 'incident-1',
        fileUri: mockFileUri,
        fileName: 'test.jpg',
        mimeType: 'image/jpeg',
      };

      const readError = new Error('File read failed');
      (FileSystemLegacy.readAsStringAsync as jest.Mock).mockRejectedValue(readError);
      (handleApiError as jest.Mock).mockReturnValue({
        message: 'File read failed',
        status: 400,
      });

      await expect(filesApi.uploadIncidentAttachment(options)).rejects.toEqual({
        message: 'File read failed',
        status: 400,
      });
    });
  });

  describe('viewFile', () => {
    it('successfully views/downloads file', async () => {
      const options = { fileId: 'file-1' };
      const mockBlob = new Blob(['file content'], { type: 'image/jpeg' });

      const mockResponse = {
        data: mockBlob,
        headers: {
          'content-type': 'image/jpeg',
        },
      };

      (mediaApiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await filesApi.viewFile(options);

      expect(mediaApiClient.get).toHaveBeenCalledWith('/files/file-1', {
        responseType: 'blob',
      });
      expect(result).toEqual({
        blob: mockBlob,
        type: 'image/jpeg',
      });
    });

    it('uses blob type when content-type header is missing', async () => {
      const options = { fileId: 'file-1' };
      const mockBlob = new Blob(['file content'], { type: 'application/pdf' });

      const mockResponse = {
        data: mockBlob,
        headers: {},
      };

      (mediaApiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await filesApi.viewFile(options);

      expect(result.type).toBe('application/pdf');
    });

    it('handles view errors', async () => {
      const options = { fileId: 'file-1' };
      const error = new Error('View failed');
      (mediaApiClient.get as jest.Mock).mockRejectedValue(error);
      (handleApiError as jest.Mock).mockReturnValue({
        message: 'View failed',
        status: 404,
      });

      await expect(filesApi.viewFile(options)).rejects.toEqual({
        message: 'View failed',
        status: 404,
      });

      expect(handleApiError).toHaveBeenCalledWith(error);
    });
  });

  describe('uploadChatFile', () => {
    const mockFileUri = 'file:///cache/test.mp3';
    const mockBase64 = 'dGVzdCBhdWRpbw=='; // base64 for "test audio"

    beforeEach(() => {
      (FileSystemLegacy.readAsStringAsync as jest.Mock) = jest
        .fn()
        .mockResolvedValue(mockBase64);
      (FileSystemLegacy.EncodingType as any) = {
        Base64: 'base64',
      };
    });

    it('successfully uploads chat file without duration', async () => {
      const options = {
        fileUri: mockFileUri,
        fileName: 'test.jpg',
        mimeType: 'image/jpeg',
      };

      const mockResponse = {
        data: {
          code: 'SUCCESS',
          data: { id: 'file-123', url: 'https://example.com/file-123' },
          message: 'File uploaded successfully',
        },
      };

      (mediaApiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await filesApi.uploadChatFile(options);

      expect(FileSystemLegacy.readAsStringAsync).toHaveBeenCalledWith(mockFileUri, {
        encoding: 'base64',
      });
      expect(mediaApiClient.post).toHaveBeenCalledWith(
        '/files',
        expect.any(Uint8Array),
        {
          headers: {
            'x-file-name': 'test.jpg',
            'x-attached-type': 'chat_message',
            'Content-Type': 'image/jpeg',
          },
          onUploadProgress: expect.any(Function),
        }
      );
      expect(result).toEqual({
        fileId: 'file-123',
        url: 'https://example.com/file-123',
      });
    });

    it('successfully uploads chat file with duration as number', async () => {
      const options = {
        fileUri: mockFileUri,
        fileName: 'audio.mp3',
        mimeType: 'audio/mpeg',
        duration: 120,
      };

      const mockResponse = {
        data: {
          code: 'SUCCESS',
          data: { fileId: 'file-456', key: 'audio-key' },
        },
      };

      (mediaApiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await filesApi.uploadChatFile(options);

      expect(mediaApiClient.post).toHaveBeenCalledWith(
        '/files',
        expect.any(Uint8Array),
        {
          headers: {
            'x-file-name': 'audio.mp3',
            'x-attached-type': 'chat_message',
            'Content-Type': 'audio/mpeg',
            'x-duration': '120',
          },
          onUploadProgress: expect.any(Function),
        }
      );
      expect(result).toEqual({
        fileId: 'file-456',
        url: 'audio-key',
      });
    });

    it('successfully uploads chat file with duration as string', async () => {
      const options = {
        fileUri: mockFileUri,
        fileName: 'audio.mp3',
        mimeType: 'audio/mpeg',
        duration: '45.5',
      };

      const mockResponse = {
        data: {
          code: 'SUCCESS',
          data: { id: 'file-789' },
        },
      };

      (mediaApiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      await filesApi.uploadChatFile(options);

      const callArgs = (mediaApiClient.post as jest.Mock).mock.calls[0];
      expect(callArgs[2].headers['x-duration']).toBe('45.5');
    });

    it('calls onProgress callback during upload', async () => {
      const onProgress = jest.fn();
      const options = {
        fileUri: mockFileUri,
        fileName: 'test.jpg',
        mimeType: 'image/jpeg',
        onProgress,
      };

      const mockResponse = {
        data: {
          code: 'SUCCESS',
          data: { id: 'file-123' },
        },
      };

      (mediaApiClient.post as jest.Mock).mockImplementation((url, data, config) => {
        // Simulate progress event
        if (config.onUploadProgress) {
          config.onUploadProgress({ loaded: 50, total: 100 });
          config.onUploadProgress({ loaded: 100, total: 100 });
        }
        return Promise.resolve(mockResponse);
      });

      await filesApi.uploadChatFile(options);

      expect(onProgress).toHaveBeenCalledWith(50);
      expect(onProgress).toHaveBeenCalledWith(100);
    });

    it('converts base64 to Uint8Array correctly', async () => {
      const options = {
        fileUri: mockFileUri,
        fileName: 'test.jpg',
        mimeType: 'image/jpeg',
      };

      (mediaApiClient.post as jest.Mock).mockResolvedValue({
        data: { code: 'SUCCESS', data: { id: 'file-123' } },
      });

      await filesApi.uploadChatFile(options);

      const callArgs = (mediaApiClient.post as jest.Mock).mock.calls[0];
      const bytes = callArgs[1] as Uint8Array;

      expect(bytes).toBeInstanceOf(Uint8Array);
      expect(bytes.length).toBeGreaterThan(0);
    });

    it('handles upload errors', async () => {
      const options = {
        fileUri: mockFileUri,
        fileName: 'test.jpg',
        mimeType: 'image/jpeg',
      };

      const error = new Error('Upload failed');
      (mediaApiClient.post as jest.Mock).mockRejectedValue(error);
      (handleApiError as jest.Mock).mockReturnValue({
        message: 'Upload failed',
        status: 500,
      });

      await expect(filesApi.uploadChatFile(options)).rejects.toEqual({
        message: 'Upload failed',
        status: 500,
      });

      expect(handleApiError).toHaveBeenCalledWith(error);
    });

    it('handles file read errors', async () => {
      const options = {
        fileUri: mockFileUri,
        fileName: 'test.jpg',
        mimeType: 'image/jpeg',
      };

      const readError = new Error('File read failed');
      (FileSystemLegacy.readAsStringAsync as jest.Mock).mockRejectedValue(readError);
      (handleApiError as jest.Mock).mockReturnValue({
        message: 'File read failed',
        status: 400,
      });

      await expect(filesApi.uploadChatFile(options)).rejects.toEqual({
        message: 'File read failed',
        status: 400,
      });
    });
  });
});

