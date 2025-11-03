import React from 'react';

import {
  fireEvent,
  reactNativeRender as render,
  screen,
  waitFor,
} from '@/lib/test-utils';

import { IncidentUploadModel } from './incident-upload-model';

const expoImagePickerModule = require('expo-image-picker');

const {
  __requestCameraPermissionMock: requestCameraPermissionMock,
  __requestGalleryPermissionMock: requestGalleryPermissionMock,
  __launchCameraAsyncMock: launchCameraAsyncMock,
  __launchImageLibraryAsyncMock: launchImageLibraryAsyncMock,
} = expoImagePickerModule;

describe('IncidentUploadModel', () => {
  beforeEach(() => {
    requestCameraPermissionMock.mockResolvedValue({ granted: true });
    requestGalleryPermissionMock.mockResolvedValue({ granted: true });
    launchCameraAsyncMock.mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'camera-uri' }],
    });
    launchImageLibraryAsyncMock.mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'gallery-uri' }],
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('requests camera permission and returns image when granted', async () => {
    const onImagePicked = jest.fn();
    const ref = React.createRef();

    render(<IncidentUploadModel ref={ref} onImagePicked={onImagePicked} />);

    fireEvent.press(screen.getByText('Take Photo'));

    await waitFor(() => {
      expect(requestCameraPermissionMock).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(launchCameraAsyncMock).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(onImagePicked).toHaveBeenCalledWith('camera-uri');
    });
  });

  it('does not invoke callback when camera launch is cancelled', async () => {
    launchCameraAsyncMock.mockResolvedValueOnce({ canceled: true });
    const onImagePicked = jest.fn();

    render(
      <IncidentUploadModel
        ref={React.createRef()}
        onImagePicked={onImagePicked}
      />
    );

    fireEvent.press(screen.getByText('Take Photo'));

    expect(onImagePicked).not.toHaveBeenCalled();
  });

  it('requests gallery permission and returns image when granted', async () => {
    const onImagePicked = jest.fn();

    render(
      <IncidentUploadModel
        ref={React.createRef()}
        onImagePicked={onImagePicked}
      />
    );

    fireEvent.press(screen.getByText('Choose from Gallery'));

    await waitFor(() => {
      expect(requestGalleryPermissionMock).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(launchImageLibraryAsyncMock).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(onImagePicked).toHaveBeenCalledWith('gallery-uri');
    });
  });
});
