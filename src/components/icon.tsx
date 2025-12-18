/**
 * Icon Component
 * A reusable component for rendering icons from the centralized icons system
 */

import icons, { type IconName, iconNames } from '@assets/icons';
import React from 'react';
import type { SvgProps } from 'react-native-svg';

interface IconProps extends SvgProps {
  /** Name of the icon to render */
  name: IconName;
  /** Size of the icon (applies to both width and height) */
  size?: number;
}

export function Icon({ name, size = 24, width, height, color, fill, ...props }: IconProps) {
  const IconComponent = icons[name];

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in icons registry`);
    return null;
  }

  // Use fill if explicitly provided, otherwise use color
  // Manual components (like Camera, Microphone, ImageGallery) use color prop
  // SVG transformer components may use either color or fill
  const finalColor = fill || color;

  return (
    <IconComponent
      width={width ?? size}
      height={height ?? size}
      {...props}
      color={finalColor}
    />
  );
}

// Export types and constants for external use
export type { IconName };
export { iconNames };
