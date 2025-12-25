// @ts-nocheck
import React from 'react';
import { Alert, Image, TouchableOpacity } from 'react-native';

import { fireEvent, reactNativeRender as render } from '@/lib/test-utils';

import { IncidentAttachment } from './incident-attachment';

jest.mock('./withFileSource', () => ({
  withFileSource: (Component: any) => Component,
}));

jest.mock('./use-video-thumbnail', () => ({
  useVideoThumbnail: jest.fn(() => ({ thumbnailUri: null, isGenerating: false })),
}));

describe('IncidentAttachment', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls onLoad when sourceResult is available', () => {
    const onLoad = jest.fn();

    render(
      <IncidentAttachment
        fileId="file-1"
        sourceResult={{ uri: 'uri-1' }}
        mimeType="image/png"
        isLoading={false}
        error={null}
        onLoad={onLoad}
      />
    );

    expect(onLoad).toHaveBeenCalledWith('file-1', {
      fileId: 'file-1',
      uri: 'uri-1',
      mimeType: 'image/png',
    });
  });

  it('opens media viewer with allMediaItems when pressed', () => {
    const { getByTestId } = render(
      <IncidentAttachment
        fileId="file-1"
        sourceResult={{ uri: 'uri-1' }}
        mimeType="image/png"
        allMediaItems={[
          { fileId: 'file-1', uri: 'uri-1', mimeType: 'image/png' },
          { fileId: 'file-2', uri: 'uri-2', mimeType: 'image/png' },
        ]}
        currentIndex={1}
      />
    );

    const touchable = getByTestId('incident-attachment-file-1');
    fireEvent.press(touchable);

    const { useMediaViewerStore } = require('@/stores/media-viewer');
    const { actions } = useMediaViewerStore();

    expect(actions.openMediaViewer).toHaveBeenCalledWith(
      [
        { fileId: 'file-1', uri: 'uri-1', mimeType: 'image/png' },
        { fileId: 'file-2', uri: 'uri-2', mimeType: 'image/png' },
      ],
      1
    );
  });

  it('shows alert when there is an error and pressed', () => {
    const alertSpy = jest.spyOn(Alert, 'alert');

    const { getByTestId } = render(
      <IncidentAttachment
        fileId="file-1"
        sourceResult={null}
        mimeType={null}
        isLoading={false}
        error="error"
      />
    );

    const touchable = getByTestId('incident-attachment-file-1');
    fireEvent.press(touchable);

    expect(alertSpy).toHaveBeenCalledWith('Error', 'Failed to load attachment');
  });
});
