const React = require('react');
// Don't use jest.requireActual - it loads untransformed ES modules
// Create a complete mock instead
module.exports = {
  __esModule: true,
  NavigationContainer: ({ children }: any) =>
    React.createElement(React.Fragment, null, children),
  ThemeProvider: ({ children }: any) =>
    React.createElement(React.Fragment, null, children),
  useIsFocused: jest.fn(() => true),
  useNavigation: jest.fn(() => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    dispatch: jest.fn(),
    setOptions: jest.fn(),
    addListener: jest.fn(),
    removeListener: jest.fn(),
  })),
  useRoute: jest.fn(() => ({})),
  useFocusEffect: jest.fn((callback) => callback()),
  DefaultTheme: {
    colors: {
      primary: '#1068eb',
      background: '#ffffff',
      card: '#ffffff',
      text: '#111827',
      border: '#e5e7eb',
      notification: '#ef4444',
    },
  },
  DarkTheme: {
    colors: {
      primary: '#1068eb',
      background: '#000000',
      card: '#1a1a1a',
      text: '#ffffff',
      border: '#333333',
      notification: '#ef4444',
    },
  },
};