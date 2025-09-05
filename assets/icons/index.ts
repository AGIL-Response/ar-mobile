import type { SvgProps } from 'react-native-svg';

import HomeIcon from './home.svg';
import ListIcon from './list.svg';
import MessageSquareIcon from './message-square.svg';
import UserIcon from './user.svg';
import SearchIcon from './search.svg';
import NotificationBadgeIcon from './notification-badge.svg';
import ArrowLeftIcon from './arrow-left.svg';
import LocationIcon from './location.svg';
import ClockIcon from './clock.svg';
import PlusIcon from './plus.svg';
import SunIcon from './sun.svg';
import SettingsIcon from './settings.svg';

// Icon component type
type IconComponent = React.ComponentType<SvgProps>;

// Icon names using snake_case that matches the icon names exactly
export const iconNames = {
  home: 'home',
  list: 'list',
  message_square: 'messageSquare', // maps to message-square.svg but uses messageSquare as value
  user: 'user',
  search: 'search',
  notification_badge: 'notificationBadge',
  arrow_left: 'arrowLeft',
  location: 'location',
  clock: 'clock',
  plus: 'plus',
  sun: 'sun',
  settings: 'settings',
} as const;

// Icons object with proper typing
// To add more icons:
// 1. Add the SVG file to this folder
// 2. Import it above
// 3. Add it to iconNames object
// 4. Add it to icons object
const icons: Record<string, IconComponent> = {
  [iconNames.home]: HomeIcon,
  [iconNames.list]: ListIcon,
  [iconNames.message_square]: MessageSquareIcon,
  [iconNames.user]: UserIcon,
  [iconNames.search]: SearchIcon,
  [iconNames.notification_badge]: NotificationBadgeIcon,
  [iconNames.arrow_left]: ArrowLeftIcon,
  [iconNames.location]: LocationIcon,
  [iconNames.clock]: ClockIcon,
  [iconNames.plus]: PlusIcon,
  [iconNames.sun]: SunIcon,
  [iconNames.settings]: SettingsIcon,
} as const;

// Export icon names as type for better TypeScript support
export type IconName = keyof typeof icons;

export default icons;
