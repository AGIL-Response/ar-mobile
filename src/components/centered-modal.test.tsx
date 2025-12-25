import React from 'react';
import { Text } from 'react-native';

import {
  fireEvent,
  reactNativeRender as render,
  screen,
} from '@/lib/test-utils';

import { CenteredModal } from './centered-modal';

describe('CenteredModal', () => {
  it('renders title, subText and children when visible', () => {
    render(
      <CenteredModal
        visible
        onClose={jest.fn()}
        title="My Title"
        subText="This is sub text"
      >
        <Text>Child content</Text>
      </CenteredModal>
    );

    expect(screen.getByText('My Title')).toBeTruthy();
    expect(screen.getByText('This is sub text')).toBeTruthy();
    expect(screen.getByText('Child content')).toBeTruthy();
  });

  it('calls onClose when close button is pressed', () => {
    const onClose = jest.fn();

    render(
      <CenteredModal visible onClose={onClose} title="Closable modal" />
    );

    const closeButton = screen.getByTestId('centered-modal-close');
    fireEvent.press(closeButton);

    expect(onClose).toHaveBeenCalled();
  });

  it('does not render close button when showCloseButton is false', () => {
    const onClose = jest.fn();

    render(
      <CenteredModal
        visible
        onClose={onClose}
        title="No close button"
        showCloseButton={false}
      />
    );

    expect(screen.queryByTestId('centered-modal-close')).toBeNull();
  });
});
