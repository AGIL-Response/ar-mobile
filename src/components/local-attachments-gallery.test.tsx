// @ts-nocheck
import React from 'react';

import { reactNativeRender as render } from '@/lib/test-utils';

import { LocalAttachmentsGallery } from './local-attachments-gallery';

const mockLocalAttachmentPreview = jest.fn(() => null);
const mockMediaViewerModal = jest.fn(() => null);

jest.mock('@/stores/media-viewer', () => ({
  __esModule: true,
  useMediaViewerStore: jest.fn(() => ({
    isOpen: true,
    mediaItems: [
      { fileId: '1', uri: 'uri-1', mimeType: 'image/png' },
    ],
    initialIndex: 0,
    actions: {
      closeMediaViewer: jest.fn(),
    },
  })),
}));

jest.mock('./local-attachment-preview', () => ({
  LocalAttachmentPreview: (props: any) => mockLocalAttachmentPreview(props),
}));

jest.mock('./media-viewer-modal', () => ({
  MediaViewerModal: (props: any) => mockMediaViewerModal(props),
}));

describe('LocalAttachmentsGallery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders a LocalAttachmentPreview for each attachment and computes size', () => {
    const attachments = [
      { id: '1', uri: 'uri-1', mimeType: 'image/png' },
      { id: '2', uri: 'uri-2', mimeType: 'image/png' },
    ];

    render(<LocalAttachmentsGallery attachments={attachments} />);

    expect(mockLocalAttachmentPreview).toHaveBeenCalledTimes(attachments.length);
  });

  it('passes media viewer store state to MediaViewerModal', () => {
    const attachments = [{ id: '1', uri: 'uri-1', mimeType: 'image/png' }];

    render(<LocalAttachmentsGallery attachments={attachments} />);

    expect(mockMediaViewerModal).toHaveBeenCalledTimes(1);
    const props = mockMediaViewerModal.mock.calls[0][0];

    expect(props.visible).toBe(true);
    expect(props.mediaItems).toEqual([
      { fileId: '1', uri: 'uri-1', mimeType: 'image/png' },
    ]);
    expect(props.initialIndex).toBe(0);
  });
});
