import React from 'react';

import {
  flattenStyle,
  reactNativeRender as render,
  screen,
} from '@/lib/test-utils';

import { ChatHeader } from './chat-header';
import { View } from 'react-native';

describe('ChatHeader', () => {
  it('renders the Chat title', () => {
    render(<ChatHeader />);

    expect(screen.getByText('Chat')).toBeTruthy();
  });

  it('styles the title text correctly', () => {
    render(<ChatHeader />);

    const title = screen.getByText('Chat');
    const titleStyles = flattenStyle(title.props.style);

    expect(titleStyles.fontSize).toBe(20);
    expect(titleStyles.fontWeight).toBe('600');
    expect(titleStyles.fontFamily).toBe('Manrope-SemiBold');
    expect(titleStyles.color).toBe('#111827');
  });

  it('applies theme colors and layout styles to the header container', () => {
    const { UNSAFE_getAllByType } = render(<ChatHeader />);

    const views = UNSAFE_getAllByType(require('react-native').View);
    // Find the outermost container view (the header) - it should have height: 56
    const headerView = views.find(
      (view: View) => flattenStyle(view.props.style).height === 56
    );

    expect(headerView).toBeTruthy();

    const containerStyles = flattenStyle(headerView?.props?.style);

    expect(containerStyles.backgroundColor).toBe('#ffffff');
    expect(containerStyles.borderBottomColor).toBe('#e5e7eb');
    expect(containerStyles.height).toBe(56);
    expect(containerStyles.flexDirection).toBe('row');
    expect(containerStyles.alignItems).toBe('center');
    expect(containerStyles.paddingHorizontal).toBe(16);
    expect(containerStyles.borderBottomWidth).toBe(1);
  });
});
