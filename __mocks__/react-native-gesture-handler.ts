// @ts-nocheck
const React = require('react');
const RNComponents = require('react-native');

// GestureHandlerRootView is just a View wrapper
const GestureHandlerRootView = ({ children, style, ...props }: any) => {
  return React.createElement(RNComponents.View, { style, ...props }, children);
};

// Common gesture handler components - just pass through to React Native components
const GestureDetector = ({ children, gesture, ...props }: any) => {
  return React.createElement(RNComponents.View, props, children);
};

const Swipeable = ({ children, renderLeftActions, renderRightActions, ...props }: any) => {
  return React.createElement(RNComponents.View, props, children);
};

const DrawerLayout = ({ children, ...props }: any) => {
  return React.createElement(RNComponents.View, props, children);
};

// Gesture handlers - return empty objects/functions
const Gesture = {
  Tap: () => ({}),
  Pan: () => ({}),
  Pinch: () => ({}),
  Rotation: () => ({}),
  Fling: () => ({}),
  LongPress: () => ({}),
  ForceTouch: () => ({}),
  Native: () => ({}),
};

// Gesture utilities
const GestureHandlerRootViewComponent = GestureHandlerRootView;

module.exports = {
  __esModule: true,
  default: {
    GestureHandlerRootView,
    GestureDetector,
    Swipeable,
    DrawerLayout,
  },
  GestureHandlerRootView,
  GestureDetector,
  Swipeable,
  DrawerLayout,
  Gesture,
  // Common gesture handler hooks
  useAnimatedGestureHandler: jest.fn((handlers: any) => handlers),
  useSharedValue: jest.fn((init: any) => ({ value: init })),
  useAnimatedStyle: jest.fn((fn: any) => ({})),
  // Gesture state
  State: {
    UNDETERMINED: 0,
    FAILED: 1,
    BEGAN: 2,
    CANCELLED: 3,
    ACTIVE: 4,
    END: 5,
  },
  // Direction
  Directions: {
    RIGHT: 1,
    LEFT: 2,
    UP: 4,
    DOWN: 8,
  },
};
