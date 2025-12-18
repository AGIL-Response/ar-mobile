// @ts-nocheck
import React from 'react';

import { fireEvent, reactNativeRender as render, screen } from '@/lib/test-utils';

import { LocalAttachmentPreview } from './local-attachment-preview';

describe('LocalAttachmentPreview', () => {
  const baseAttachment = {
    id: '1',
    uri: 'file://local-uri',
    mimeType: 'image/png',
  };

  it('opens media viewer with all attachments when pressed', () => {
    const attachments = [
      baseAttachment,
      { id: '2', uri: 'file://2', mimeType: 'image/png' },
    ];

    const { getByTestId } = render(
      <LocalAttachmentPreview
        attachment={baseAttachment}
        allAttachments={attachments}
        currentIndex={0}
        size={100}
      />
    );

    const touchable = getByTestId('local-attachment-preview-1');
    fireEvent.press(touchable);

    const { useMediaViewerStore } = require('@/stores/media-viewer');
    const { actions } = useMediaViewerStore();

    expect(actions.openMediaViewer).toHaveBeenCalledWith(
      [
        { fileId: '1', uri: 'file://local-uri', mimeType: 'image/png' },
        { fileId: '2', uri: 'file://2', mimeType: 'image/png' },
      ],
      0
    );
  });

  it('calls onRemove when remove button is pressed', () => {
    const onRemove = jest.fn();

    render(
      <LocalAttachmentPreview
        attachment={baseAttachment}
        allAttachments={[baseAttachment]}
        currentIndex={0}
        onRemove={onRemove}
      />
    );

    const { getByTestId } = screen;
    const removeButton = getByTestId('local-attachment-preview-remove-1');
    fireEvent.press(removeButton);

    expect(onRemove).toHaveBeenCalled();
  });
});
