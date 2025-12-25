module.exports = {
  __esModule: true,
  default: {
    createAnimatedComponent: (Component: any) => Component,
  },
  // Common animation presets
  FadeIn: { duration: jest.fn(() => ({ duration: 50 })) },
  FadeOut: { duration: jest.fn(() => ({ duration: 20 })) },
  SlideInRight: { duration: jest.fn(() => ({ duration: 300 })) },
  SlideOutRight: { duration: jest.fn(() => ({ duration: 300 })) },
  // Animation functions
  withTiming: jest.fn((value: any) => value),
  withSpring: jest.fn((value: any) => value),
  withRepeat: jest.fn((value: any) => value),
  withSequence: jest.fn((value: any) => value),
  withDelay: jest.fn((value: any) => value),
  // Hooks
  useSharedValue: jest.fn((init: any) => ({ value: init })),
  useAnimatedStyle: jest.fn((fn: any) => ({})),
  useAnimatedProps: jest.fn((fn: any) => ({})),
  useAnimatedGestureHandler: jest.fn((handlers: any) => handlers),
  useAnimatedReaction: jest.fn(),
  useDerivedValue: jest.fn((fn: any) => ({ value: fn() })),
  // Utilities
  runOnJS: jest.fn((fn: any) => fn),
  runOnUI: jest.fn((fn: any) => fn),
  configureReanimatedLogger: jest.fn(),
  View: 'View',
  Text: 'Text',
  ScrollView: 'ScrollView',
  Image: 'Image',
};
