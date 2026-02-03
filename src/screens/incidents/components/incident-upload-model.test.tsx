import React from 'react';

import { reactNativeRender as render, waitFor } from '@/lib/test-utils';

import type { IncidentUploadModelRef } from './incident-upload-model';
import { IncidentUploadModel } from './incident-upload-model';

jest.mock('@/lib/media-permissions', () => ({
  useCameraPermission: jest.fn(),
  useMediaLibraryPermission: jest.fn(),
}));

jest.mock('../create', () => ({
  getMimeTypeFromUri: jest.fn((uri: string) => {
    if (uri.endsWith('.jpg') || uri.endsWith('.jpeg')) return 'image/jpeg';
    if (uri.endsWith('.png')) return 'image/png';
    if (uri.endsWith('.mp4')) return 'video/mp4';
    return 'application/octet-stream';
  }),
}));

jest.mock('react-native-image-crop-picker', () => ({
  __esModule: true,
  default: {
    openCamera: jest.fn(),
    openPicker: jest.fn(),
  },
}));

const ImagePicker = require('react-native-image-crop-picker').default;
const { useCameraPermission, useMediaLibraryPermission } = require('@/lib/media-permissions');
const { getMimeTypeFromUri } = require('../create');

describe('IncidentUploadModel', () => {
  const mockVerifyCameraPermission = jest.fn();
  const mockVerifyGalleryPermission = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Default permission mocks
    mockVerifyCameraPermission.mockResolvedValue(true);
    mockVerifyGalleryPermission.mockResolvedValue(true);

    (useCameraPermission as jest.Mock).mockReturnValue(mockVerifyCameraPermission);
    (useMediaLibraryPermission as jest.Mock).mockReturnValue(mockVerifyGalleryPermission);

    // Default camera and gallery mocks
    (ImagePicker.openCamera as jest.Mock).mockResolvedValue({
      path: 'file://camera.jpg',
      mime: 'image/jpeg',
      width: 1920,
      height: 1920,
      size: 1000000,
    });

    (ImagePicker.openPicker as jest.Mock).mockResolvedValue({
      path: 'file://gallery.jpg',
      mime: 'image/jpeg',
      width: 1920,
      height: 1920,
      size: 1000000,
    });
  });

  describe('Component Rendering', () => {
    it('renders without crashing', () => {
      const onAttachmentPicked = jest.fn();
      const ref = React.createRef<IncidentUploadModelRef>();

      const { toJSON } = render(
        <IncidentUploadModel ref={ref} onAttachmentPicked={onAttachmentPicked} />
      );

      // Component returns null, but test wrapper adds View
      expect(toJSON()).toBeTruthy();
    });

    it('exposes ref methods', () => {
      const onAttachmentPicked = jest.fn();
      const ref = React.createRef<IncidentUploadModelRef>();

      render(<IncidentUploadModel ref={ref} onAttachmentPicked={onAttachmentPicked} />);

      expect(ref.current).toBeTruthy();
      expect(ref.current?.takePhoto).toBeDefined();
      expect(ref.current?.uploadPhoto).toBeDefined();
    });
  });

  describe('Take Photo (Camera)', () => {
    it('requests camera permission and launches camera when granted', async () => {
      const onAttachmentPicked = jest.fn();
      const ref = React.createRef<IncidentUploadModelRef>();

      render(<IncidentUploadModel ref={ref} onAttachmentPicked={onAttachmentPicked} />);

      await ref.current?.takePhoto();

      expect(mockVerifyCameraPermission).toHaveBeenCalled();
      expect(ImagePicker.openCamera).toHaveBeenCalledWith({
        width: 1920,
        height: 1920,
        cropping: true,
        compressImageQuality: 0.9,
        includeBase64: false,
        mediaType: 'any',
      });
    });

    it('calls onAttachmentPicked with uri and mimeType when photo taken', async () => {
      const onAttachmentPicked = jest.fn();
      const ref = React.createRef<IncidentUploadModelRef>();

      render(<IncidentUploadModel ref={ref} onAttachmentPicked={onAttachmentPicked} />);

      await ref.current?.takePhoto();

      await waitFor(() => {
        expect(onAttachmentPicked).toHaveBeenCalledWith('file://camera.jpg', 'image/jpeg');
      });
    });

    it('does not launch camera when permission denied', async () => {
      mockVerifyCameraPermission.mockResolvedValue(false);

      const onAttachmentPicked = jest.fn();
      const ref = React.createRef<IncidentUploadModelRef>();

      render(<IncidentUploadModel ref={ref} onAttachmentPicked={onAttachmentPicked} />);

      await ref.current?.takePhoto();

      expect(ImagePicker.openCamera).not.toHaveBeenCalled();
      expect(onAttachmentPicked).not.toHaveBeenCalled();
    });

    it('does not call callback when camera is cancelled', async () => {
      const cancelError = new Error('User cancelled camera');
      cancelError.message = 'User cancelled camera';
      (ImagePicker.openCamera as jest.Mock).mockRejectedValue(cancelError);

      const onAttachmentPicked = jest.fn();
      const ref = React.createRef<IncidentUploadModelRef>();

      render(<IncidentUploadModel ref={ref} onAttachmentPicked={onAttachmentPicked} />);

      await ref.current?.takePhoto();

      expect(ImagePicker.openCamera).toHaveBeenCalled();
      expect(onAttachmentPicked).not.toHaveBeenCalled();
    });

    it('uses getMimeTypeFromUri when mimeType not provided', async () => {
      (ImagePicker.openCamera as jest.Mock).mockResolvedValue({
        path: 'file://photo.png',
        mime: undefined,
        width: 1920,
        height: 1920,
        size: 1000000,
      });

      const onAttachmentPicked = jest.fn();
      const ref = React.createRef<IncidentUploadModelRef>();

      render(<IncidentUploadModel ref={ref} onAttachmentPicked={onAttachmentPicked} />);

      await ref.current?.takePhoto();

      await waitFor(() => {
        expect(getMimeTypeFromUri).toHaveBeenCalledWith('file://photo.png');
        expect(onAttachmentPicked).toHaveBeenCalledWith('file://photo.png', 'image/png');
      });
    });

    it('handles video capture', async () => {
      (ImagePicker.openCamera as jest.Mock).mockResolvedValue({
        path: 'file://video.mp4',
        mime: 'video/mp4',
        width: 1920,
        height: 1920,
        size: 5000000,
      });

      const onAttachmentPicked = jest.fn();
      const ref = React.createRef<IncidentUploadModelRef>();

      render(<IncidentUploadModel ref={ref} onAttachmentPicked={onAttachmentPicked} />);

      await ref.current?.takePhoto();

      await waitFor(() => {
        expect(onAttachmentPicked).toHaveBeenCalledWith('file://video.mp4', 'video/mp4');
      });
    });
  });

  describe('Upload Photo (Gallery)', () => {
    it('requests gallery permission and launches library when granted', async () => {
      const onAttachmentPicked = jest.fn();
      const ref = React.createRef<IncidentUploadModelRef>();

      render(<IncidentUploadModel ref={ref} onAttachmentPicked={onAttachmentPicked} />);

      await ref.current?.uploadPhoto();

      expect(mockVerifyGalleryPermission).toHaveBeenCalled();
      expect(ImagePicker.openPicker).toHaveBeenCalledWith({
        width: 1920,
        height: 1920,
        cropping: true,
        compressImageQuality: 0.9,
        includeBase64: false,
        mediaType: 'any',
      });
    });

    it('calls onAttachmentPicked with uri and mimeType when photo selected', async () => {
      const onAttachmentPicked = jest.fn();
      const ref = React.createRef<IncidentUploadModelRef>();

      render(<IncidentUploadModel ref={ref} onAttachmentPicked={onAttachmentPicked} />);

      await ref.current?.uploadPhoto();

      await waitFor(() => {
        expect(onAttachmentPicked).toHaveBeenCalledWith('file://gallery.jpg', 'image/jpeg');
      });
    });

    it('does not launch gallery when permission denied', async () => {
      mockVerifyGalleryPermission.mockResolvedValue(false);

      const onAttachmentPicked = jest.fn();
      const ref = React.createRef<IncidentUploadModelRef>();

      render(<IncidentUploadModel ref={ref} onAttachmentPicked={onAttachmentPicked} />);

      await ref.current?.uploadPhoto();

      expect(ImagePicker.openPicker).not.toHaveBeenCalled();
      expect(onAttachmentPicked).not.toHaveBeenCalled();
    });

    it('does not call callback when gallery is cancelled', async () => {
      const cancelError = new Error('User cancelled image picker');
      cancelError.message = 'User cancelled image picker';
      (ImagePicker.openPicker as jest.Mock).mockRejectedValue(cancelError);

      const onAttachmentPicked = jest.fn();
      const ref = React.createRef<IncidentUploadModelRef>();

      render(<IncidentUploadModel ref={ref} onAttachmentPicked={onAttachmentPicked} />);

      await ref.current?.uploadPhoto();

      expect(ImagePicker.openPicker).toHaveBeenCalled();
      expect(onAttachmentPicked).not.toHaveBeenCalled();
    });

    it('uses getMimeTypeFromUri when mimeType not provided', async () => {
      (ImagePicker.openPicker as jest.Mock).mockResolvedValue({
        path: 'file://image.jpeg',
        mime: undefined,
        width: 1920,
        height: 1920,
        size: 1000000,
      });

      const onAttachmentPicked = jest.fn();
      const ref = React.createRef<IncidentUploadModelRef>();

      render(<IncidentUploadModel ref={ref} onAttachmentPicked={onAttachmentPicked} />);

      await ref.current?.uploadPhoto();

      await waitFor(() => {
        expect(getMimeTypeFromUri).toHaveBeenCalledWith('file://image.jpeg');
        expect(onAttachmentPicked).toHaveBeenCalledWith('file://image.jpeg', 'image/jpeg');
      });
    });

    it('handles video selection from gallery', async () => {
      (ImagePicker.openPicker as jest.Mock).mockResolvedValue({
        path: 'file://movie.mp4',
        mime: 'video/mp4',
        width: 1920,
        height: 1920,
        size: 5000000,
      });

      const onAttachmentPicked = jest.fn();
      const ref = React.createRef<IncidentUploadModelRef>();

      render(<IncidentUploadModel ref={ref} onAttachmentPicked={onAttachmentPicked} />);

      await ref.current?.uploadPhoto();

      await waitFor(() => {
        expect(onAttachmentPicked).toHaveBeenCalledWith('file://movie.mp4', 'video/mp4');
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles missing path in result', async () => {
      (ImagePicker.openCamera as jest.Mock).mockResolvedValue({
        mime: 'image/jpeg',
        width: 1920,
        height: 1920,
        size: 1000000,
      });

      const onAttachmentPicked = jest.fn();
      const ref = React.createRef<IncidentUploadModelRef>();

      render(<IncidentUploadModel ref={ref} onAttachmentPicked={onAttachmentPicked} />);

      await ref.current?.takePhoto();

      expect(onAttachmentPicked).not.toHaveBeenCalled();
    });

    it('handles error when picking image', async () => {
      const error = new Error('Picker error');
      (ImagePicker.openPicker as jest.Mock).mockRejectedValue(error);

      const onAttachmentPicked = jest.fn();
      const ref = React.createRef<IncidentUploadModelRef>();

      render(<IncidentUploadModel ref={ref} onAttachmentPicked={onAttachmentPicked} />);

      await ref.current?.uploadPhoto();

      expect(ImagePicker.openPicker).toHaveBeenCalled();
      expect(onAttachmentPicked).not.toHaveBeenCalled();
    });

    it('handles multiple calls to takePhoto', async () => {
      const onAttachmentPicked = jest.fn();
      const ref = React.createRef<IncidentUploadModelRef>();

      render(<IncidentUploadModel ref={ref} onAttachmentPicked={onAttachmentPicked} />);

      await ref.current?.takePhoto();
      await ref.current?.takePhoto();

      expect(mockVerifyCameraPermission).toHaveBeenCalledTimes(2);
      expect(ImagePicker.openCamera).toHaveBeenCalledTimes(2);
    });

    it('handles multiple calls to uploadPhoto', async () => {
      const onAttachmentPicked = jest.fn();
      const ref = React.createRef<IncidentUploadModelRef>();

      render(<IncidentUploadModel ref={ref} onAttachmentPicked={onAttachmentPicked} />);

      await ref.current?.uploadPhoto();
      await ref.current?.uploadPhoto();

      expect(mockVerifyGalleryPermission).toHaveBeenCalledTimes(2);
      expect(ImagePicker.openPicker).toHaveBeenCalledTimes(2);
    });

    it('handles ref being null', () => {
      const onAttachmentPicked = jest.fn();

      const { toJSON } = render(
        <IncidentUploadModel ref={null} onAttachmentPicked={onAttachmentPicked} />
      );

      // Component doesn't crash with null ref
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('Permission Integration', () => {
    it('uses useCameraPermission hook', () => {
      const onAttachmentPicked = jest.fn();
      const ref = React.createRef<IncidentUploadModelRef>();

      render(<IncidentUploadModel ref={ref} onAttachmentPicked={onAttachmentPicked} />);

      expect(useCameraPermission).toHaveBeenCalled();
    });

    it('uses useMediaLibraryPermission hook', () => {
      const onAttachmentPicked = jest.fn();
      const ref = React.createRef<IncidentUploadModelRef>();

      render(<IncidentUploadModel ref={ref} onAttachmentPicked={onAttachmentPicked} />);

      expect(useMediaLibraryPermission).toHaveBeenCalled();
    });
  });
});
