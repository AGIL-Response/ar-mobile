/**
 * Battery Icon Component
 * Renders battery icon with dynamic fill level based on battery percentage
 */

import React from 'react';
import type { SvgProps } from 'react-native-svg';
import Svg, { Path, Rect } from 'react-native-svg';
import { Icon, iconNames } from './icon';

interface BatteryIconProps extends SvgProps {
  /** Battery percentage (0-100) */
  batteryPercentage?: number;
  /** Size of the icon */
  size?: number;
  /** Color of the outline */
  outlineColor?: string;
  /** Color of the fill (optional, will be determined by percentage if not provided) */
  fillColor?: string;
}

/**
 * Get battery fill color based on percentage
 */
const getBatteryFillColor = (percentage: number): string => {
  if (percentage <= 20) {
    return '#FF3C3C'; // Red for low battery
  }

  if (percentage <= 50) {
    return '#FA8C16'; // Orange for medium battery
  }

  // percentage > 50
  return '#479DD6'; // Green for high battery
};

/**
 * Battery SVG paths
 */
const BATTERY_OUTLINE_PATH =
  'M2.66699 0.5H19.333C20.5296 0.5 21.5 1.47038 21.5 2.66699V8.66699C21.4998 9.86346 20.5295 10.833 19.333 10.833H2.66699C1.47048 10.833 0.500176 9.86346 0.5 8.66699V2.66699L0.510742 2.44531C0.621596 1.35265 1.54509 0.5 2.66699 0.5Z';

const BATTERY_TERMINAL_PATH =
  'M23 3.66669V7.66669C23.8047 7.32791 24.328 6.53982 24.328 5.66669C24.328 4.79355 23.8047 4.00546 23 3.66669Z';

// Battery fill area dimensions (from the original SVG)
const FILL_X = 2;
const FILL_Y = 2.8; // Moved up slightly
const FILL_WIDTH = 18; // 20 - 2
const FILL_HEIGHT = 5.8; // Increased height for more visible fill

export function BatteryIcon({
  batteryPercentage,
  size = 25,
  outlineColor = 'currentColor',
  fillColor,
  ...props
}: BatteryIconProps) {
  // Hide icon if undefined or null
  if (batteryPercentage === undefined || batteryPercentage === null) {
    return null;
  }

  // Show X icon when battery is 0
  if (batteryPercentage === 0) {
    return <Icon name={iconNames.x} size={size} color={outlineColor} {...props} />;
  }

  // Clamp percentage between 0 and 100
  const percentage = Math.max(0, Math.min(100, batteryPercentage));

  // Calculate fill width based on percentage
  const fillWidth = (FILL_WIDTH * percentage) / 100;

  // Determine fill color
  const finalFillColor = fillColor || getBatteryFillColor(percentage);

  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 25 12"
      fill="none"
      {...props}
    >
      {/* Battery outline */}
      <Path
        d={BATTERY_OUTLINE_PATH}
        stroke={outlineColor}
        fill="none"
        opacity={0.35}
      />

      {/* Battery terminal */}
      <Path
        d={BATTERY_TERMINAL_PATH}
        fill={outlineColor}
        opacity={0.4}
      />

      {/* Battery fill */}
      {fillWidth > 0 && (
        <Rect
          x={FILL_X}
          y={FILL_Y}
          width={fillWidth}
          height={FILL_HEIGHT}
          rx={0.33333} // Rounded corners to match the original
          fill={finalFillColor}
        />
      )}
    </Svg>
  );
}

