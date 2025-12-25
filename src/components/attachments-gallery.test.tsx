// @ts-nocheck
import React from 'react';
import { reactNativeRender as render } from '@/lib/test-utils';
import * as ReactNative from 'react-native';

import { useMediaViewerStore } from '@/stores/media-viewer';
import { AttachmentsGallery } from './attachments-gallery';

const mockIncidentAttachment = jest.fn(() => null);
const mockMediaViewerModal = jest.fn(() => null);

jest.mock('./incident-attachment', () => ({
  IncidentAttachment: (props: any) => mockIncidentAttachment(props),
}));

jest.mock('./media-viewer-modal', () => ({
  MediaViewerModal: (props: any) => mockMediaViewerModal(props),
}));

describe('AttachmentsGallery', () => {
  const mockCloseMediaViewer = jest.fn();
  const useMediaViewerStoreMock = useMediaViewerStore as unknown as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    (jest.spyOn(ReactNative, 'useWindowDimensions') as jest.SpyInstance).mockReturnValue({
      width: 360,
      height: 640,
      scale: 2,
      fontScale: 2,
    } as any);

    useMediaViewerStoreMock.mockReturnValue({
      isOpen: true,
      mediaItems: [
        {
          fileId: 'file-1',
          uri: 'https://example.com/1.jpg',
          mimeType: 'image/jpeg',
        },
      ],
      initialIndex: 1,
      actions: {
        openMediaViewer: jest.fn(),
        closeMediaViewer: mockCloseMediaViewer,
        reset: jest.fn(),
      },
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders an IncidentAttachment for each fileId with computed size when size is not provided', () => {
    const fileIds = ['file-1', 'file-2', 'file-3'];

    render(<AttachmentsGallery fileIds={fileIds} />);

    // Should render one IncidentAttachment per fileId
    expect(mockIncidentAttachment).toHaveBeenCalledTimes(fileIds.length);

    // Default gap is 12, itemsPerRow is 3, containerPadding is 32
    const screenWidth = 360;
    const gap = 12;
    const containerPadding = 32;
    const itemsPerRow = 3;
    const totalGaps = (itemsPerRow - 1) * gap;
    const availableWidth = screenWidth - containerPadding;
    const expectedSize = (availableWidth - totalGaps) / itemsPerRow;

    const firstCall = mockIncidentAttachment.mock.calls[0] ?? [];
    const firstCallProps = firstCall[0];

    expect(firstCallProps).toBeDefined();
    if (!firstCallProps) return;

    expect(firstCallProps.fileId).toBe('file-1');
    expect(firstCallProps.size).toBeCloseTo(expectedSize, 2);
    expect(firstCallProps.currentIndex).toBe(0);
    expect(firstCallProps.allMediaItems).toEqual([]);
    expect(typeof firstCallProps.onLoad).toBe('function');
  });

  it('uses the provided size prop instead of computed size', () => {
    const fileIds = ['file-1'];

    render(<AttachmentsGallery fileIds={fileIds} size={80} gap={20} />);

    expect(mockIncidentAttachment).toHaveBeenCalledTimes(1);
    const firstCall = mockIncidentAttachment.mock.calls[0] ?? [];
    const props = firstCall[0];

    expect(props).toBeDefined();
    if (!props) return;

    expect(props.size).toBe(80);
  });

  it('passes media viewer store state to MediaViewerModal and wires onClose', () => {
    const fileIds = ['file-1'];

    render(<AttachmentsGallery fileIds={fileIds} />);

    expect(mockMediaViewerModal).toHaveBeenCalledTimes(1);
    const firstCall = mockMediaViewerModal.mock.calls[0] ?? [];
    const props = firstCall[0];

    expect(props).toBeDefined();
    if (!props) return;

    expect(props.visible).toBe(true);
    expect(props.mediaItems).toEqual([
      {
        fileId: 'file-1',
        uri: 'https://example.com/1.jpg',
        mimeType: 'image/jpeg',
      },
    ]);
    expect(props.initialIndex).toBe(1);
    expect(typeof props.onClose).toBe('function');

    // Trigger the onClose callback and ensure it calls the store action
    props.onClose();
    expect(mockCloseMediaViewer).toHaveBeenCalled();
  });
});
