// @ts-nocheck
const React = require('react');
const RNComponents = require('react-native');

module.exports = {
  __esModule: true,
  KeyboardProvider: ({ children, ...props }: any) => {
    return React.createElement(RNComponents.View, props, children);
  },
  KeyboardAwareScrollView: ({ children, ...props }: any) =>
    React.createElement(
      RNComponents.View,
      { testID: 'keyboard-aware-scroll-view', ...props },
      children
    ),
};
