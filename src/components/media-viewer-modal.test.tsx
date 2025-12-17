// @ts-nocheck
import React from 'react';

import { fireEvent, reactNativeRender as render, screen } from '@/lib/test-utils';

import { MediaViewerModal } from './media-viewer-modal';

describe('MediaViewerModal', () => {
  const baseProps = {
    visible: true,
    onClose: jest.fn(),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns null when there is no current media item', () => {
    const { toJSON } = render(
      <MediaViewerModal {...baseProps} mediaItems={[]} initialIndex={0} />
    ); 
    const tree = toJSON();
    expect(tree.children).toBeNull();
  });

  it('renders image content and counter for an image item', () => {
    render(
      <MediaViewerModal
        {...baseProps}
        mediaItems={[{ fileId: '1', uri: 'img://1', mimeType: 'image/png' }]}
        initialIndex={0}
      />
    );

    expect(screen.getByText('1 / 1')).toBeTruthy();
  });

  it('calls onClose when close button is pressed', () => {
    const onClose = jest.fn();

    render(
      <MediaViewerModal
        {...baseProps}
        onClose={onClose}
        mediaItems={[{ fileId: '1', uri: 'img://1', mimeType: 'image/png' }]}
        initialIndex={0}
      />
    );

    fireEvent.press(screen.getByTestId('media-viewer-close'));
    expect(onClose).toHaveBeenCalled();
  });
});
