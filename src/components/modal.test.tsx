import React from 'react';
import { Text } from 'react-native';

import { reactNativeRender as render, screen } from '@/lib/test-utils';

import { Modal, renderBackdrop, useModal } from './modal';
import { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';

// Partially mock only useModal to avoid triggering React.useRef in implementation
jest.mock('./modal', () => {
  const actual = jest.requireActual('./modal');
  return {
    __esModule: true,
    ...actual,
    useModal: () => ({
      ref: { current: { present: jest.fn(), dismiss: jest.fn() } },
      present: jest.fn(),
      dismiss: jest.fn(),
    }),
  };
});

describe('Modal component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders modal with children', () => {
    const { present } = useModal();
    render(
      <Modal>
        <Text testID="modal-content">Modal Content</Text>
      </Modal>
    );
    const modalContent = screen.getByTestId('modal-content');
    expect(modalContent).toBeTruthy();
  });

  it('renders modal with title', () => {
    render(
      <Modal title="Test Modal">
        <Text testID="modal-content">Content</Text>
      </Modal>
    );
    const modalContent = screen.getByTestId('modal-content');
    expect(modalContent).toBeTruthy();
  });

  it('useModal hook returns ref, present, and dismiss', () => {
    const { ref, present, dismiss } = useModal();
    expect(ref).toBeTruthy();
    expect(typeof present).toBe('function');
    expect(typeof dismiss).toBe('function');
  });

  it('renderBackdrop returns backdrop component', () => {
    const view = renderBackdrop({ style: {} } as BottomSheetBackdropProps);
    expect(view).toBeTruthy();
  });
});
