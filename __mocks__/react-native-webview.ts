const React = require('react');

module.exports = {
  __esModule: true,
  WebView: ({ children, source, ref, onMessage, ...props }: any) =>
    React.createElement('View', { ...props, testID: 'mock-webview' }, children),
};

