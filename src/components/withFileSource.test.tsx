// @ts-nocheck
import React from 'react';

import { reactNativeRender as render, waitFor } from '@/lib/test-utils';

import { withFileSource } from './withFileSource';

describe('withFileSource HOC', () => {
  const BaseComponent = jest.fn(() => null);
  const Wrapped = withFileSource(BaseComponent, { autoLoad: true, logErrors: false });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('loads file on mount and passes source props', async () => {
    render(<Wrapped fileId="file-1" testID="wrapped" /> as any);

    await waitFor(() => {
      expect(BaseComponent).toHaveBeenCalled();
    });

    const props = (BaseComponent as jest.Mock).mock.calls[BaseComponent.mock.calls.length - 1][0];

    expect(props.fileId).toBe('file-1');
    expect(props.isLoading).toBe(false);
    expect(props.error).toBeNull();
    expect(props.sourceResult).toEqual({ uri: 'data:image/png;base64,mock' });
    expect(props.mimeType).toBe('image/png');
  });
});
