import React from 'react';
import { Text } from 'react-native';

import { reactNativeRender as render, screen } from '@/lib/test-utils';

import BottomSheetKeyboardAwareScrollView from './modal-keyboard-aware-scroll-view';

describe('BottomSheetKeyboardAwareScrollView component', () => {
  it('renders children', () => {
    render(
      <BottomSheetKeyboardAwareScrollView>
        <Text testID="scrollable-content">Scrollable Content</Text>
      </BottomSheetKeyboardAwareScrollView>
    );
    expect(screen.getByText('Scrollable Content')).toBeTruthy();
  });

  it('has correct displayName', () => {
    expect(
      (BottomSheetKeyboardAwareScrollView as unknown as { displayName: string })
        .displayName
    ).toBe('BottomSheetKeyboardAwareScrollView');
  });
});
