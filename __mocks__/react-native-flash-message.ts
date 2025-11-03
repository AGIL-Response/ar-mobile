// @ts-nocheck
const React = require('react');
const RNComponents = require('react-native');

const FlashMessageComponent = (props: any) => {
  return React.createElement(RNComponents.View, {
    testID: 'flash-message',
    ...props,
  });
};

module.exports = {
  __esModule: true,
  default: FlashMessageComponent,
  showMessage: jest.fn(),
  hideMessage: jest.fn(),
  FlashMessage: FlashMessageComponent,
};
