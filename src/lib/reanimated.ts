import { configureReanimatedLogger } from 'react-native-reanimated';

// Disable Reanimated logs in development
configureReanimatedLogger({
  strict: false,
});
