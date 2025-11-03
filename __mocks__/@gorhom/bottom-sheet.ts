// @ts-nocheck
const React = require('react');

// Base mock that ensures all required exports are available
const baseMock = {
  __esModule: true,
  BottomSheetModal: React.forwardRef(function BottomSheetModalMock(
    props: any,
    ref: any
  ) {
    const RNComponents = require('react-native');

    // Create an object with present and dismiss methods for ref
    React.useImperativeHandle(ref, () => ({
      present: jest.fn((data?: any) => {}),
      dismiss: jest.fn(),
      snapToIndex: jest.fn(),
      close: jest.fn(),
      expand: jest.fn(),
      collapse: jest.fn(),
      forceClose: jest.fn(),
    }));

    return React.createElement(RNComponents.View, {
      'data-testid': 'bottom-sheet-modal',
      ...props,
    });
  }),
  BottomSheetModalProvider: ({ children }: any) => {
    const RNComponents = require('react-native');
    return React.createElement(RNComponents.View, null, children);
  },
  useBottomSheet: () => ({ close: jest.fn(), snapToIndex: jest.fn() }),
  createBottomSheetScrollableComponent: jest.fn(
    (_type: any, Component: any) => Component
  ),
  SCROLLABLE_TYPE: {
    SCROLLVIEW: 'SCROLLVIEW',
  },
};

// Try to use the package's mock, but ensure required exports are always available
let packageMock;
try {
  packageMock = require('@gorhom/bottom-sheet/mock');
  // Merge package mock with our base mock to ensure all exports are available
  module.exports = {
    ...packageMock,
    ...baseMock,
    // Always ensure SCROLLABLE_TYPE exists
    SCROLLABLE_TYPE: packageMock.SCROLLABLE_TYPE || baseMock.SCROLLABLE_TYPE,
  };
} catch (e) {
  // Fallback to custom mock if package mock doesn't exist
  module.exports = baseMock;
}
