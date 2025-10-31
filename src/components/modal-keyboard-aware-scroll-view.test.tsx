import React from 'react';
import { Text } from 'react-native';

import { render, screen } from '@/lib/test-utils';

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
    expect((BottomSheetKeyboardAwareScrollView as any).displayName).toBe(
      'BottomSheetKeyboardAwareScrollView'
    );
  });
});
