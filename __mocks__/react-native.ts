const React = require('react');

module.exports = {
  __esModule: true,
  Platform: {
    OS: 'ios',
    Version: 15,
    select: jest.fn((obj: any) => {
      if (obj && typeof obj === 'object') {
        return obj.ios || obj.native || obj.default;
      }
      return obj;
    }),
  },
  Text: ({ children, ...props }: any) => React.createElement('Text', props, children),
  View: ({ children, ...props }: any) => React.createElement('View', props, children),
  ScrollView: ({ children, ...props }: any) => React.createElement('ScrollView', props, children),
  Image: (props: any) => React.createElement('Image', props),
  ImageBackground: ({ children, source, ...props }: any) =>
    React.createElement('ImageBackground', { ...props, source }, children),
  ActivityIndicator: (props: any) =>
    React.createElement('ActivityIndicator', props),
  Pressable: ({ children, ...props }: any) => React.createElement('Pressable', props, children),
  TouchableOpacity: ({ children, ...props }: any) => React.createElement('TouchableOpacity', props, children),
  TouchableHighlight: ({ children, ...props }: any) => React.createElement('TouchableHighlight', props, children),
  TextInput: (props: any) => React.createElement('TextInput', props),
  Modal: ({ children, visible, ...props }: any) =>
    visible ? React.createElement('Modal', props, children) : null,
  KeyboardAvoidingView: ({ children, ...props }: any) => React.createElement('KeyboardAvoidingView', props, children),
  FlatList: (props: any) => {
    const { data = [], renderItem, keyExtractor, ...rest } = props;
    let items: any[] = [];
    if (typeof renderItem === "function" && Array.isArray(data)) {
      items = data.map((item: any, index: number) => {
        const key =
          (typeof keyExtractor === "function"
            ? keyExtractor(item, index)
            : item.key) ?? index;
        return React.createElement(
          React.Fragment,
          { key },
          renderItem({ item, index })
        );
      });
    } else if (props.children) {
      items = props.children;
    }
    return React.createElement("FlatList", rest, items);
  },
  RefreshControl: ({ children, ...props }: any) => React.createElement('RefreshControl', props, children),
  StyleSheet: {
    create: (styles: any) => styles,
    flatten: (style: any) => style,
    compose: (style1: any, style2: any) => [style1, style2],
    hairlineWidth: 0.5,
    absoluteFill: { position: 'absolute', top: 0, left: 0, bottom: 0, right: 0 },
    absoluteFillObject: { position: 'absolute', top: 0, left: 0, bottom: 0, right: 0 },
  },
  Dimensions: {
    get: jest.fn(() => ({ width: 375, height: 812 })),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },
  useWindowDimensions: jest.fn(() => ({
    width: 375,
    height: 812,
    scale: 2,
    fontScale: 2,
  })),
  Alert: {
    alert: jest.fn(),
    prompt: jest.fn(),
  },
  useColorScheme: jest.fn(),
  Linking: {
    openURL: jest.fn(),
    canOpenURL: jest.fn().mockResolvedValue(true),
    openSettings: jest.fn(),
  },
  PermissionsAndroid: {
    check: jest.fn(),
    request: jest.fn(),
    PERMISSIONS: {
      POST_NOTIFICATIONS: 'android.permission.POST_NOTIFICATIONS',
    },
    RESULTS: {
      GRANTED: 'granted',
      DENIED: 'denied',
      NEVER_ASK_AGAIN: 'never_ask_again',
    },
  },
  I18nManager: {
    isRTL: false,
    allowRTL: jest.fn(),
    forceRTL: jest.fn(),
    swapLeftAndRightInRTL: jest.fn(),
  },
  NativeModules: {
    UIManager: {
      getViewManagerConfig: jest.fn(),
      hasViewManagerConfig: jest.fn(),
      createView: jest.fn(),
      updateView: jest.fn(),
      manageChildren: jest.fn(),
      setChildren: jest.fn(),
      removeSubviewsFromContainerWithID: jest.fn(),
      replaceExistingNonRootView: jest.fn(),
      measure: jest.fn(),
      measureInWindow: jest.fn(),
      measureLayout: jest.fn(),
      findSubviewIn: jest.fn(),
      dispatchViewManagerCommand: jest.fn(),
      sendAccessibilityEvent: jest.fn(),
      configureNextLayoutAnimation: jest.fn(),
      setLayoutAnimationEnabledExperimental: jest.fn(),
      getConstantsForViewManager: jest.fn(),
      lazilyLoadView: jest.fn(),
      ViewManagerAdapter_: {},
    },
  },
  UIManager: {
    getViewManagerConfig: jest.fn(),
    hasViewManagerConfig: jest.fn(),
    createView: jest.fn(),
    updateView: jest.fn(),
    manageChildren: jest.fn(),
    setChildren: jest.fn(),
    removeSubviewsFromContainerWithID: jest.fn(),
    replaceExistingNonRootView: jest.fn(),
    measure: jest.fn(),
    measureInWindow: jest.fn(),
    measureLayout: jest.fn(),
    findSubviewIn: jest.fn(),
    dispatchViewManagerCommand: jest.fn(),
    sendAccessibilityEvent: jest.fn(),
    configureNextLayoutAnimation: jest.fn(),
    setLayoutAnimationEnabledExperimental: jest.fn(),
    getConstantsForViewManager: jest.fn(),
    lazilyLoadView: jest.fn(),
    ViewManagerAdapter_: {},
  },
};