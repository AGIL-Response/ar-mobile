// @ts-nocheck
const RNComponents = require('react-native');

module.exports = {
  __esModule: true,
  SystemBars: ({ style, hidden }: any) => {
    const React = require('react');
    return React.createElement(RNComponents.View, {
      testID: 'system-bars',
      'data-style': style,
      'data-hidden': hidden,
    });
  },
  enableEdgeToEdge: jest.fn(),
};

