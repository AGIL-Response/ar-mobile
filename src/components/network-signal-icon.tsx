/**
 * Network Signal Icon Component
 * Renders mobile signal bars based on network speed
 */

import React from 'react';
import type { SvgProps } from 'react-native-svg';
import Svg, { Path } from 'react-native-svg';
import { X } from './icons';

interface NetworkSignalIconProps extends SvgProps {
  /** Network speed in Mbps */
  networkMbps?: number;
  /** Size of the icon */
  size?: number;
  /** Color of the icon */
  color?: string;
}

/**
 * Get the number of signal bars to display based on network speed
 */
const getSignalBars = (networkMbps?: number): number | null => {
  // Hide icon if undefined or null
  if (networkMbps === undefined || networkMbps === null) {
    return null;
  }

  if (networkMbps === 0) {
    return 0; // No signal - show X icon
  }

  if (networkMbps > 0 && networkMbps <= 50) {
    return 1;
  }

  if (networkMbps > 50 && networkMbps <= 100) {
    return 2;
  }

  if (networkMbps > 100 && networkMbps <= 200) {
    return 3;
  }

  // networkMbps > 200
  return 4;
};

/**
 * Path data for each signal bar (from left to right)
 * Each bar is a rounded rectangle
 */
const BAR_PATHS = [
  // Bar 1 (leftmost, shortest)
  'M2 6.66699C2.55228 6.66699 3 7.11471 3 7.66699V9.66699C2.99982 10.2191 2.55218 10.667 2 10.667H1C0.447824 10.667 0.000175969 10.2191 0 9.66699V7.66699C0 7.11471 0.447715 6.66699 1 6.66699H2Z',
  // Bar 2
  'M6.66699 4.66699C7.21913 4.66717 7.66699 5.11482 7.66699 5.66699V9.66699C7.66682 10.219 7.21902 10.6668 6.66699 10.667H5.66699C5.11482 10.667 4.66717 10.2191 4.66699 9.66699V5.66699C4.66699 5.11471 5.11471 4.66699 5.66699 4.66699H6.66699Z',
  // Bar 3
  'M11.333 2.33301C11.8852 2.33301 12.3328 2.78087 12.333 3.33301V9.66699C12.3328 10.2191 11.8852 10.667 11.333 10.667H10.333C9.78098 10.6668 9.33318 10.219 9.33301 9.66699V3.33301C9.33318 2.78098 9.78098 2.33318 10.333 2.33301H11.333Z',
  // Bar 4 (rightmost, tallest)
  'M16 0C16.5523 0 17 0.447715 17 1V9.66699C16.9998 10.2191 16.5522 10.667 16 10.667H15C14.4478 10.667 14.0002 10.2191 14 9.66699V1C14 0.447715 14.4477 0 15 0H16Z',
];

export function NetworkSignalIcon({
  networkMbps,
  size = 17,
  color = 'currentColor',
  ...props
}: NetworkSignalIconProps) {
  const bars = getSignalBars(networkMbps);

  // Hide icon if undefined or null
  if (bars === null) {
    return null;
  }

  // Show X icon when no signal (0)
  if (bars === 0) {
    return <X color={color} width={size} height={size} {...props} />;
  }

  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 17 11"
      fill="none"
      {...props}
    >
      {BAR_PATHS.slice(0, bars).map((path, index) => (
        <Path key={index} d={path} fill={color} />
      ))}
    </Svg>
  );
}

