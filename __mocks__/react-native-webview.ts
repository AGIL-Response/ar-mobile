const React = require('react');

module.exports = {
  __esModule: true,
  WebView: ({ children, ...props }: any) =>
    React.createElement('WebView', { ...props, testID: 'mock-webview' }, children),
};

