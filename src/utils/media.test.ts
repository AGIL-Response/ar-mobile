import {
  ALLOWED_IMAGE_EXTENSIONS,
  ALLOWED_VIDEO_EXTENSIONS,
  ALLOWED_AUDIO_EXTENSIONS,
  MAX_FILE_SIZE_MB,
  MAX_FILE_SIZE_BYTES,
  getFileExtension,
  getExtensionFromMimeType,
  ensureFileExtension,
  isImage,
  isVideo,
  isAudio,
  getMediaType,
  formatFileSize,
  isFileSizeValid,
  validateMediaFile,
  getMimeType,
  formatDuration,
  type MediaFile,
} from './media';

describe('Media utilities', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'warn').mockImplementation();
        jest.spyOn(console, 'error').mockImplementation();
    });
  describe('Constants', () => {
    it('should have correct allowed image extensions', () => {
      expect(ALLOWED_IMAGE_EXTENSIONS).toEqual(['jpg', 'jpeg', 'png', 'gif', 'webp']);
    });

    it('should have correct allowed video extensions', () => {
      expect(ALLOWED_VIDEO_EXTENSIONS).toEqual(['mp4', 'mov', 'avi', 'webm', 'mkv', 'flv', 'wmv']);
    });

    it('should have correct allowed audio extensions', () => {
      expect(ALLOWED_AUDIO_EXTENSIONS).toEqual(['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac']);
    });

    it('should have correct file size constants', () => {
      expect(MAX_FILE_SIZE_MB).toBe(100);
      expect(MAX_FILE_SIZE_BYTES).toBe(100 * 1024 * 1024);
    });
  });

  describe('getFileExtension', () => {
    it('should extract extension from filename', () => {
      expect(getFileExtension('photo.jpg')).toBe('jpg');
      expect(getFileExtension('document.pdf')).toBe('pdf');
      expect(getFileExtension('archive.tar.gz')).toBe('gz');
    });

    it('should return lowercase extension', () => {
      expect(getFileExtension('Photo.JPG')).toBe('jpg');
      expect(getFileExtension('Image.PNG')).toBe('png');
    });

    it('should return empty string for filename without extension', () => {
      expect(getFileExtension('filename')).toBe('');
      expect(getFileExtension('no-extension')).toBe('');
    });

    it('should handle empty string', () => {
      expect(getFileExtension('')).toBe('');
    });

    it('should handle filenames with multiple dots', () => {
      expect(getFileExtension('my.file.name.mp4')).toBe('mp4');
    });
  });

  describe('getExtensionFromMimeType', () => {
    it('should get extension from image mime types', () => {
      expect(getExtensionFromMimeType('image/jpeg')).toBe('jpg');
      expect(getExtensionFromMimeType('image/png')).toBe('png');
      expect(getExtensionFromMimeType('image/gif')).toBe('gif');
    });

    it('should get extension from video mime types', () => {
      expect(getExtensionFromMimeType('video/mp4')).toBe('mp4');
      expect(getExtensionFromMimeType('video/quicktime')).toBe('mov');
      expect(getExtensionFromMimeType('video/webm')).toBe('webm');
    });

    it('should get extension from audio mime types', () => {
      expect(getExtensionFromMimeType('audio/mpeg')).toBe('mp3');
      expect(getExtensionFromMimeType('audio/mp4')).toBe('m4a');
      expect(getExtensionFromMimeType('audio/wav')).toBe('wav');
    });

    it('should handle HEIC/HEIF formats', () => {
      expect(getExtensionFromMimeType('image/heic')).toBe('jpg');
      expect(getExtensionFromMimeType('image/heif')).toBe('jpg');
    });

    it('should return empty string for unknown mime type', () => {
      expect(getExtensionFromMimeType('application/unknown')).toBe('');
      expect(getExtensionFromMimeType('text/plain')).toBe('');
    });
  });

  describe('ensureFileExtension', () => {
    it('should keep filename with existing extension', () => {
      expect(ensureFileExtension('photo.jpg')).toBe('photo.jpg');
      expect(ensureFileExtension('video.mp4')).toBe('video.mp4');
    });

    it('should convert HEIC/HEIF extensions to JPG', () => {
      expect(ensureFileExtension('photo.heic')).toBe('photo.jpg');
      expect(ensureFileExtension('image.HEIF')).toBe('image.jpg');
    });

    it('should add extension from mimeType if missing', () => {
      expect(ensureFileExtension('photo', 'image/png')).toBe('photo.png');
      expect(ensureFileExtension('video', 'video/mp4')).toBe('video.mp4');
    });

    it('should fallback to jpg for files without extension or mimeType', () => {
      expect(ensureFileExtension('file')).toBe('file.jpg');
    });

    it('should handle edge cases', () => {
      expect(ensureFileExtension('file.jpg', 'image/png')).toBe('file.jpg');
      expect(ensureFileExtension('myfile', 'unknown/type')).toBe('myfile.jpg');
    });
  });

  describe('isImage', () => {
    it('should identify images by mimeType', () => {
      expect(isImage('file.jpg', 'image/jpeg')).toBe(true);
      expect(isImage('file.png', 'image/png')).toBe(true);
      expect(isImage('file.gif', 'image/gif')).toBe(true);
    });

    it('should identify images by filename extension', () => {
      expect(isImage('photo.jpg')).toBe(true);
      expect(isImage('image.png')).toBe(true);
      expect(isImage('animation.gif')).toBe(true);
    });

    it('should prioritize mimeType over filename', () => {
      expect(isImage('file.txt', 'image/jpeg')).toBe(true);
      expect(isImage('file.jpg', 'video/mp4')).toBe(false);
    });

    it('should return false for non-images', () => {
      expect(isImage('video.mp4', 'video/mp4')).toBe(false);
      expect(isImage('document.pdf')).toBe(false);
    });

    it('should handle undefined parameters', () => {
      expect(isImage()).toBe(false);
      expect(isImage(undefined, undefined)).toBe(false);
    });
  });

  describe('isVideo', () => {
    it('should identify videos by mimeType', () => {
      expect(isVideo('file.mp4', 'video/mp4')).toBe(true);
      expect(isVideo('file.mov', 'video/quicktime')).toBe(true);
    });

    it('should identify videos by filename extension', () => {
      expect(isVideo('video.mp4')).toBe(true);
      expect(isVideo('movie.mov')).toBe(true);
      expect(isVideo('clip.webm')).toBe(true);
    });

    it('should prioritize mimeType over filename', () => {
      expect(isVideo('file.txt', 'video/mp4')).toBe(true);
      expect(isVideo('file.mp4', 'image/jpeg')).toBe(false);
    });

    it('should return false for non-videos', () => {
      expect(isVideo('photo.jpg', 'image/jpeg')).toBe(false);
      expect(isVideo('audio.mp3')).toBe(false);
    });

    it('should handle undefined parameters', () => {
      expect(isVideo()).toBe(false);
    });
  });

  describe('isAudio', () => {
    it('should identify audio by mimeType', () => {
      expect(isAudio('file.mp3', 'audio/mpeg')).toBe(true);
      expect(isAudio('file.m4a', 'audio/mp4')).toBe(true);
    });

    it('should identify audio by filename extension', () => {
      expect(isAudio('song.mp3')).toBe(true);
      expect(isAudio('track.wav')).toBe(true);
      expect(isAudio('audio.m4a')).toBe(true);
    });

    it('should prioritize mimeType over filename', () => {
      expect(isAudio('file.txt', 'audio/mpeg')).toBe(true);
      expect(isAudio('file.mp3', 'video/mp4')).toBe(false);
    });

    it('should return false for non-audio', () => {
      expect(isAudio('video.mp4', 'video/mp4')).toBe(false);
      expect(isAudio('image.jpg')).toBe(false);
    });

    it('should handle undefined parameters', () => {
      expect(isAudio()).toBe(false);
    });
  });

  describe('getMediaType', () => {
    it('should return correct media type for images', () => {
      expect(getMediaType('photo.jpg', 'image/jpeg')).toBe('image');
      expect(getMediaType('image.png')).toBe('image');
    });

    it('should return correct media type for videos', () => {
      expect(getMediaType('video.mp4', 'video/mp4')).toBe('video');
      expect(getMediaType('movie.mov')).toBe('video');
    });

    it('should return correct media type for audio', () => {
      expect(getMediaType('song.mp3', 'audio/mpeg')).toBe('audio');
      expect(getMediaType('track.m4a')).toBe('audio');
    });

    it('should return "file" for unknown types', () => {
      expect(getMediaType('document.pdf')).toBe('file');
      expect(getMediaType('unknown.xyz')).toBe('file');
    });

    it('should handle undefined parameters', () => {
      expect(getMediaType()).toBe('file');
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(formatFileSize(500)).toBe('500 Bytes');
      expect(formatFileSize(1023)).toBe('1023 Bytes');
    });

    it('should format kilobytes correctly', () => {
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(2048)).toBe('2 KB');
      expect(formatFileSize(1536)).toBe('1.5 KB');
    });

    it('should format megabytes correctly', () => {
      expect(formatFileSize(1048576)).toBe('1 MB');
      expect(formatFileSize(5242880)).toBe('5 MB');
      expect(formatFileSize(1572864)).toBe('1.5 MB');
    });

    it('should format gigabytes correctly', () => {
      expect(formatFileSize(1073741824)).toBe('1 GB');
      expect(formatFileSize(2147483648)).toBe('2 GB');
    });

    it('should handle edge cases', () => {
      expect(formatFileSize(1)).toBe('1 Bytes');
      expect(formatFileSize(1025)).toBe('1 KB');
    });
  });

  describe('isFileSizeValid', () => {
    it('should validate file size within default limit', () => {
      expect(isFileSizeValid(50 * 1024 * 1024)).toBe(true); // 50MB
      expect(isFileSizeValid(100 * 1024 * 1024)).toBe(true); // 100MB
    });

    it('should invalidate file size exceeding default limit', () => {
      expect(isFileSizeValid(101 * 1024 * 1024)).toBe(false); // 101MB
      expect(isFileSizeValid(200 * 1024 * 1024)).toBe(false); // 200MB
    });

    it('should validate file size with custom limit', () => {
      expect(isFileSizeValid(5 * 1024 * 1024, 10)).toBe(true); // 5MB with 10MB limit
      expect(isFileSizeValid(15 * 1024 * 1024, 10)).toBe(false); // 15MB with 10MB limit
    });

    it('should handle zero and small file sizes', () => {
      expect(isFileSizeValid(0)).toBe(true);
      expect(isFileSizeValid(1024)).toBe(true);
    });

    it('should handle exact limit', () => {
      expect(isFileSizeValid(10 * 1024 * 1024, 10)).toBe(true); // Exactly 10MB
    });
  });

  describe('validateMediaFile', () => {
    it('should validate valid image file', () => {
      const file: MediaFile = {
        uri: 'file:///image.jpg',
        name: 'image.jpg',
        type: 'image',
        size: 1024 * 1024, // 1MB
        mimeType: 'image/jpeg',
      };
      expect(validateMediaFile(file)).toEqual({ valid: true });
    });

    it('should validate valid video file', () => {
      const file: MediaFile = {
        uri: 'file:///video.mp4',
        name: 'video.mp4',
        type: 'video',
        size: 10 * 1024 * 1024, // 10MB
        mimeType: 'video/mp4',
      };
      expect(validateMediaFile(file)).toEqual({ valid: true });
    });

    it('should invalidate oversized file', () => {
      const file: MediaFile = {
        uri: 'file:///large.mp4',
        name: 'large.mp4',
        type: 'video',
        size: 150 * 1024 * 1024, // 150MB
        mimeType: 'video/mp4',
      };
      expect(validateMediaFile(file)).toEqual({
        valid: false,
        error: 'File size exceeds 100MB limit',
      });
    });

    it('should invalidate unsupported file type', () => {
      const file: MediaFile = {
        uri: 'file:///document.pdf',
        name: 'document.pdf',
        type: 'file',
        size: 1024,
        mimeType: 'application/pdf',
      };
      expect(validateMediaFile(file)).toEqual({
        valid: false,
        error: 'Unsupported file type',
      });
    });

    it('should validate file with extension but no mimeType', () => {
      const file: MediaFile = {
        uri: 'file:///audio.mp3',
        name: 'audio.mp3',
        type: 'audio',
        size: 5 * 1024 * 1024,
      };
      expect(validateMediaFile(file)).toEqual({ valid: true });
    });
  });

  describe('getMimeType', () => {
    it('should get mime type for image files', () => {
      expect(getMimeType('photo.jpg')).toBe('image/jpeg');
      expect(getMimeType('photo.jpeg')).toBe('image/jpeg');
      expect(getMimeType('image.png')).toBe('image/png');
      expect(getMimeType('animation.gif')).toBe('image/gif');
    });

    it('should get mime type for video files', () => {
      expect(getMimeType('video.mp4')).toBe('video/mp4');
      expect(getMimeType('movie.mov')).toBe('video/quicktime');
      expect(getMimeType('clip.webm')).toBe('video/webm');
    });

    it('should get mime type for audio files', () => {
      expect(getMimeType('song.mp3')).toBe('audio/mpeg');
      expect(getMimeType('audio.m4a')).toBe('audio/mp4');
      expect(getMimeType('track.wav')).toBe('audio/wav');
    });

    it('should return default mime type for unknown extensions', () => {
      expect(getMimeType('document.pdf')).toBe('application/octet-stream');
      expect(getMimeType('unknown.xyz')).toBe('application/octet-stream');
    });

    it('should handle files without extensions', () => {
      expect(getMimeType('filename')).toBe('application/octet-stream');
    });
  });

  describe('formatDuration', () => {
    it('should format short durations correctly', () => {
      expect(formatDuration(0)).toBe('0:00');
      expect(formatDuration(5)).toBe('0:05');
      expect(formatDuration(30)).toBe('0:30');
      expect(formatDuration(59)).toBe('0:59');
    });

    it('should format minute durations correctly', () => {
      expect(formatDuration(60)).toBe('1:00');
      expect(formatDuration(90)).toBe('1:30');
      expect(formatDuration(125)).toBe('2:05');
    });

    it('should format long durations correctly', () => {
      expect(formatDuration(600)).toBe('10:00');
      expect(formatDuration(3599)).toBe('59:59');
      expect(formatDuration(3661)).toBe('61:01');
    });

    it('should pad seconds with leading zero', () => {
      expect(formatDuration(61)).toBe('1:01');
      expect(formatDuration(305)).toBe('5:05');
    });

    it('should floor fractional seconds', () => {
      expect(formatDuration(59.9)).toBe('0:59');
      expect(formatDuration(125.7)).toBe('2:05');
    });
  });

  describe('MediaFile interface', () => {
    it('should allow creating valid media file objects', () => {
      const mediaFile: MediaFile = {
        uri: 'file:///test.jpg',
        name: 'test.jpg',
        type: 'image',
        size: 1024,
        mimeType: 'image/jpeg',
      };
      expect(mediaFile.uri).toBe('file:///test.jpg');
      expect(mediaFile.name).toBe('test.jpg');
    });

    it('should allow optional mimeType and duration', () => {
      const mediaFile: MediaFile = {
        uri: 'file:///audio.mp3',
        name: 'audio.mp3',
        type: 'audio',
        size: 2048,
        duration: '4.226032',
      };
      expect(mediaFile.duration).toBe('4.226032');
      expect(mediaFile.mimeType).toBeUndefined();
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete image workflow', () => {
      const filename = 'vacation.jpg';
      const mimeType = 'image/jpeg';
      const size = 2 * 1024 * 1024; // 2MB

      expect(isImage(filename, mimeType)).toBe(true);
      expect(getMediaType(filename, mimeType)).toBe('image');
      expect(isFileSizeValid(size)).toBe(true);
      expect(formatFileSize(size)).toBe('2 MB');
      expect(getMimeType(filename)).toBe('image/jpeg');
    });

    it('should handle complete video workflow', () => {
      const filename = 'movie.mp4';
      const mimeType = 'video/mp4';
      const size = 50 * 1024 * 1024; // 50MB
      const duration = 120; // 2 minutes

      expect(isVideo(filename, mimeType)).toBe(true);
      expect(getMediaType(filename, mimeType)).toBe('video');
      expect(isFileSizeValid(size)).toBe(true);
      expect(formatFileSize(size)).toBe('50 MB');
      expect(formatDuration(duration)).toBe('2:00');
    });

    it('should handle HEIC to JPG conversion workflow', () => {
      const originalName = 'photo.heic';
      const convertedName = ensureFileExtension(originalName);
      const mimeType = getMimeType(convertedName);

      expect(convertedName).toBe('photo.jpg');
      expect(mimeType).toBe('image/jpeg');
      expect(isImage(convertedName, mimeType)).toBe(true);
    });

    it('should validate and format file info', () => {
      const file: MediaFile = {
        uri: 'file:///audio.mp3',
        name: 'audio.mp3',
        type: 'audio',
        size: 3 * 1024 * 1024, // 3MB
        mimeType: 'audio/mpeg',
        duration: '180.5',
      };

      const validation = validateMediaFile(file);
      expect(validation.valid).toBe(true);
      expect(formatFileSize(file.size)).toBe('3 MB');
      expect(formatDuration(parseFloat(file.duration!))).toBe('3:00');
    });
  });

  describe('Edge cases', () => {
    it('should handle case-insensitive mime types', () => {
      expect(isImage('file.jpg', 'IMAGE/JPEG')).toBe(true);
      expect(isVideo('file.mp4', 'VIDEO/MP4')).toBe(true);
      expect(isAudio('file.mp3', 'AUDIO/MPEG')).toBe(true);
    });

    it('should handle files with multiple dots in name', () => {
      expect(getFileExtension('my.file.name.jpg')).toBe('jpg');
      expect(getMimeType('archive.tar.gz')).toBe('application/octet-stream');
      expect(getMimeType('file.webp')).toBe('image/webp');
      expect(getMimeType('file.avi')).toBe('video/x-msvideo');
      expect(getMimeType('file.mkv')).toBe('video/x-matroska');
      expect(getMimeType('file.ogg')).toBe('audio/ogg');
      expect(getMimeType('file.aac')).toBe('audio/aac');
      expect(getMimeType('file.flac')).toBe('audio/flac');
    });

    it('should handle empty and whitespace filenames', () => {
      expect(getFileExtension('')).toBe('');
      expect(ensureFileExtension('')).toBe('.jpg');
    });

    it('should handle very large file sizes', () => {
      expect(formatFileSize(10 * 1024 * 1024 * 1024)).toBe('10 GB');
      expect(isFileSizeValid(10 * 1024 * 1024 * 1024)).toBe(false);
    });

    it('should handle zero duration', () => {
      expect(formatDuration(0)).toBe('0:00');
    });
  });
});

