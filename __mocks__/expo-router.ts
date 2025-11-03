const pushMock = jest.fn();
const backMock = jest.fn();
const replaceMock = jest.fn();
const useLocalSearchParamsMock = jest.fn(() => ({}));
const useSegmentsMock = jest.fn(() => []);
const usePathnameMock = jest.fn(() => '/');
const useRouterMock = jest.fn(() => ({
  push: pushMock,
  back: backMock,
  replace: replaceMock,
  canGoBack: jest.fn(() => true),
  dismiss: jest.fn(),
  dismissAll: jest.fn(),
  setParams: jest.fn(),
}));

const redirectMock = jest.fn();

const LinkMock = jest.fn(({ children, href, ...props }: any) => {
  const React = require('react');
  const { Pressable, Text } = require('react-native');
  return React.createElement(
    Pressable,
    {
      ...props,
      testID: `link-${href}`,
      onPress: () => pushMock(href),
    },
    typeof children === 'string'
      ? React.createElement(Text, null, children)
      : children
  );
});

const StackMock = ({ children }: any) => {
  const React = require('react');
  return React.createElement(React.Fragment, null, children);
};

StackMock.Screen = ({ children }: any) => {
  const React = require('react');
  return React.createElement(React.Fragment, null, children);
};

const TabsMock: any = jest.fn(({ children, ...props }: any) => {
  const React = require('react');
  return React.createElement(React.Fragment, null, children);
});

TabsMock.Screen = ({ children }: any) => {
  const React = require('react');
  return React.createElement(React.Fragment, null, children);
};

const RedirectMock = ({ href }: any) => {
  // Call redirectMock when Redirect component is rendered
  redirectMock(href);
  return null;
};

module.exports = {
  __esModule: true,
  useRouter: useRouterMock,
  router: {
    push: pushMock,
    back: backMock,
    replace: replaceMock,
    canGoBack: jest.fn(() => true),
    dismiss: jest.fn(),
    dismissAll: jest.fn(),
    setParams: jest.fn(),
  },
  useLocalSearchParams: useLocalSearchParamsMock,
  useSegments: useSegmentsMock,
  usePathname: usePathnameMock,
  Link: LinkMock,
  Stack: StackMock,
  Redirect: RedirectMock,
  Slot: ({ children }: any) => {
    const React = require('react');
    return React.createElement(React.Fragment, null, children);
  },
  Tabs: TabsMock,
  ErrorBoundary: ({ children }: any) => {
    const React = require('react');
    return React.createElement(React.Fragment, null, children);
  },
  // Expose mocks for testing
  __pushMock: pushMock,
  __backMock: backMock,
  __replaceMock: replaceMock,
  __useLocalSearchParamsMock: useLocalSearchParamsMock,
  __useSegmentsMock: useSegmentsMock,
  __usePathnameMock: usePathnameMock,
  __useRouterMock: useRouterMock,
  __mockRedirect: redirectMock,
};
