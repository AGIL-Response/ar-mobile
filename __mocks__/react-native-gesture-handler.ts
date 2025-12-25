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

// Gesture handlers - return chainable gesture objects
const createGestureMock = () => ({
  onBegin: jest.fn(() => createGestureMock()),
  onStart: jest.fn(() => createGestureMock()),
  onUpdate: jest.fn(() => createGestureMock()),
  onEnd: jest.fn(() => createGestureMock()),
  onFinalize: jest.fn(() => createGestureMock()),
  onTouchesDown: jest.fn(() => createGestureMock()),
  onTouchesMove: jest.fn(() => createGestureMock()),
  onTouchesUp: jest.fn(() => createGestureMock()),
  onTouchesCancelled: jest.fn(() => createGestureMock()),
  enabled: jest.fn(() => createGestureMock()),
  shouldCancelWhenOutside: jest.fn(() => createGestureMock()),
  hitSlop: jest.fn(() => createGestureMock()),
  runOnJS: jest.fn((fn) => fn),
});

const Gesture = {
  Tap: () => createGestureMock(),
  Pan: () => createGestureMock(),
  Pinch: () => createGestureMock(),
  Rotation: () => createGestureMock(),
  Fling: () => createGestureMock(),
  LongPress: () => createGestureMock(),
  ForceTouch: () => createGestureMock(),
  Native: () => createGestureMock(),
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
  Pressable: RNComponents.TouchableOpacity,
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
