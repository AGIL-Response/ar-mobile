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
import UserEditIcon from './user-edit.svg';
import IncidentIcon from './incident.svg';
import ChangeIcon from './change.svg';
import BatteryIcon from './battery.svg';
import MobileSignalIcon from './mobile-signal.svg';
import MessageDotsSquareIcon from './message-dots-square.svg';
import ChevronLeftIcon from './chevron-left.svg';
import CameraIcon from './camera.svg';
import UserPlusIcon from './user-plus.svg';
import CheckCircleBrokenIcon from './check-circle-broken.svg';
import HourglassIcon from './hourglass.svg';
import ClockFastForwardIcon from './clock-fast-forward.svg';
import PlayIcon from './play.svg';
import PauseIcon from './pause.svg';
import UploadIcon from './upload.svg';
import LockIcon from './lock.svg';
import LogOutIcon from './log-out.svg';
import EyeIcon from './eye.svg';
import EyeOffIcon from './eye-off.svg';
import SendIcon from './send.svg';
import { ImageGallery } from '@/components/icons/image-gallery';
import { Microphone } from '@/components/icons/microphone';
import { Camera } from '@/components/icons/camera';

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
  user_edit: 'userEdit',
  incident: 'incident',
  change: 'change',
  battery: 'battery',
  mobile_signal: 'mobileSignal',
  message_dots_square: 'messageDotsSquare',
  chevron_left: 'chevronLeft',
  camera: 'camera',
  user_plus: 'userPlus',
  check_circle_broken: 'checkCircleBroken',
  hourglass: 'hourglass',
  clock_fast_forward: 'clockFastForward',
  play: 'play',
  pause: 'pause',
  upload: 'upload',
  lock: 'lock',
  log_out: 'logOut',
  eye: 'eye',
  eye_off: 'eyeOff',
  image: 'image',
  microphone: 'microphone',
  send: 'send',
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
  [iconNames.user_edit]: UserEditIcon,
  [iconNames.incident]: IncidentIcon,
  [iconNames.change]: ChangeIcon,
  [iconNames.battery]: BatteryIcon,
  [iconNames.mobile_signal]: MobileSignalIcon,
  [iconNames.message_dots_square]: MessageDotsSquareIcon,
  [iconNames.chevron_left]: ChevronLeftIcon,
  [iconNames.camera]: Camera,
  [iconNames.user_plus]: UserPlusIcon,
  [iconNames.check_circle_broken]: CheckCircleBrokenIcon,
  [iconNames.hourglass]: HourglassIcon,
  [iconNames.clock_fast_forward]: ClockFastForwardIcon,
  [iconNames.play]: PlayIcon,
  [iconNames.pause]: PauseIcon,
  [iconNames.upload]: UploadIcon,
  [iconNames.lock]: LockIcon,
  [iconNames.log_out]: LogOutIcon,
  [iconNames.eye]: EyeIcon,
  [iconNames.eye_off]: EyeOffIcon,
  [iconNames.image]: ImageGallery,
  [iconNames.microphone]: Microphone,
  [iconNames.send]: SendIcon,
} as const;

// Export icon names as type for better TypeScript support
export type IconName = keyof typeof icons;

export default icons;
