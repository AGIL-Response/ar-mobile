import { cssInterop } from 'nativewind';
import Svg from 'react-native-svg';

export * from './button';
export { default as colors } from './colors';
export * from './modal';
export * from './text';
export * from './theme-toggle';
export * from './utils';
export * from './focus-aware-status-bar';
export * from './input';

// export base components from react-native
export {
  ActivityIndicator,
  Pressable,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
export { SafeAreaView } from 'react-native-safe-area-context';

//Apply cssInterop to Svg to resolve className string into style
cssInterop(Svg, {
  className: {
    target: 'style',
  },
});
