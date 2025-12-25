const React = require('react');

module.exports = {
  __esModule: true,
  SafeAreaProvider: ({ children, ...props }: any) =>
    React.createElement('View', props, children),
  SafeAreaView: ({ children, ...props }: any) =>
    React.createElement('View', props, children),
  useSafeAreaInsets: jest.fn(() => ({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  })),
  useSafeAreaFrame: jest.fn(() => ({
    x: 0,
    y: 0,
    width: 375,
    height: 812,
  })),
  SafeAreaInsetsContext: React.createContext({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  }),
  SafeAreaFrameContext: React.createContext({
    x: 0,
    y: 0,
    width: 375,
    height: 812,
  }),
};
