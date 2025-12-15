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
  Pressable: ({ children, ...props }: any) => React.createElement('Pressable', props, children),
  TouchableOpacity: ({ children, ...props }: any) => React.createElement('TouchableOpacity', props, children),
  TouchableHighlight: ({ children, ...props }: any) => React.createElement('TouchableHighlight', props, children),
  TextInput: (props: any) => React.createElement('TextInput', props),
  Modal: ({ children, visible, ...props }: any) =>
    visible ? React.createElement('Modal', props, children) : null,
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
  Alert: {
    alert: jest.fn(),
    prompt: jest.fn(),
  },
  Linking: {
    openURL: jest.fn(),
    canOpenURL: jest.fn().mockResolvedValue(true),
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