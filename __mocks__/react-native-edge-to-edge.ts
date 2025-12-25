const React = require('react');
const { View } = require('react-native');

module.exports = {
  __esModule: true,
  SystemBars: ({ style, hidden }: any) => {
    return React.createElement(View, {
      testID: 'system-bars',
      'data-style': style,
      'data-hidden': hidden,
    });
  },
  enableEdgeToEdge: jest.fn(),
};

