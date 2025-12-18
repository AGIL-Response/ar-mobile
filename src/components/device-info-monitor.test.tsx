// @ts-nocheck
import React from 'react';

import { reactNativeRender as render } from '@/lib/test-utils';

import { DeviceInfoMonitor } from './device-info-monitor';

const mockUseDeviceInfoStore = require('@/stores/device-info');
const { actions } = mockUseDeviceInfoStore.default.getState();

describe('DeviceInfoMonitor', () => {
  it('renders hidden WebView with generated source', () => {
    const { toJSON } = render(<DeviceInfoMonitor />);
    const tree = toJSON() as any;

    expect(tree).toBeTruthy();
    const view = tree.children.find((child: any) => child.type === 'View');
    expect(view).toBeTruthy();
    const webView = view.children.find((child: any) => child.type === 'WebView');
    expect(webView).toBeTruthy();
  });

  it('handles WebView messages and updates store', () => {
    const { toJSON } = render(<DeviceInfoMonitor />);
    const tree = toJSON() as any;
    expect(tree).toBeTruthy();
    const view = tree.children.find((child: any) => child.type === 'View');
    expect(view).toBeTruthy();
    const webView = view.children.find((child: any) => child.type === 'WebView');
    expect(webView).toBeTruthy();

    // Success message
    webView.props.onMessage({ nativeEvent: { data: JSON.stringify({ speed: 42.5 }) } });
    expect(actions.setNetworkSpeed).toHaveBeenCalledWith(42.5);

    // Error message
    webView.props.onMessage({ nativeEvent: { data: JSON.stringify({ error: 'err' }) } });
    expect(actions.setNetworkSpeedError).toHaveBeenCalledWith('err');

    // Malformed message
    webView.props.onMessage({ nativeEvent: { data: 'not-json' } });
    expect(actions.setNetworkSpeedError).toHaveBeenCalledWith(
      'Failed to parse network speed result'
    );
  });
});
