import * as React from 'react';
import type { SvgProps } from 'react-native-svg';
import Svg, { Path, Rect } from 'react-native-svg';

export function Image({ color = '#000', ...props }: SvgProps) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <Rect
        x={3}
        y={3}
        width={18}
        height={18}
        rx={2}
        ry={2}
        stroke={color}
        strokeWidth={2}
      />
      <Path
        d="M9 9a2 2 0 1 1 0-4 2 2 0 0 1 0 4ZM21 15l-5-5L5 21"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
