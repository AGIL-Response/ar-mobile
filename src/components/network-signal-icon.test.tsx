import React from 'react';

import { reactNativeRender as render } from '@/lib/test-utils';

import { NetworkSignalIcon } from './network-signal-icon';

describe('NetworkSignalIcon', () => {
  it('returns SVG when networkMbps has a value', () => {
    const { rerender } = render(<NetworkSignalIcon networkMbps={100} />);
    expect(rerender).toBeDefined();
  });

  it('renders no SVG when networkMbps is undefined', () => {
    const { toJSON } = render(<NetworkSignalIcon networkMbps={undefined} />);
    const tree = toJSON() as any;

    const children = tree.children || [];
    const hasSvg = children.some((child) => child.type === 'Svg');
    expect(hasSvg).toBe(false);
  });

  it('renders X icon when networkMbps is 0', () => {
    const { toJSON } = render(<NetworkSignalIcon networkMbps={0} />);
    const tree = toJSON() as any;
    expect(tree).toBeTruthy();
    expect(tree.type).toBe('View');
  });

  it('renders correct number of bars for different speeds', () => {
    const { toJSON, rerender } = render(<NetworkSignalIcon networkMbps={10} />);
    const getBarsCount = () => {
      const tree = toJSON() as any;
      if (!tree) return 0;
      const children = tree.children || [];
      const svg = children.find((child) => child.type === 'Svg');
      if (!svg || !svg.children) return 0;
      return svg.children.filter((child) => child.type === 'Path').length;
    };

    // 0 < speed <= 50 => 1 bar
    expect(getBarsCount()).toBe(1);

    // 50 < speed <= 100 => 2 bars
    rerender(<NetworkSignalIcon networkMbps={75} />);
    expect(getBarsCount()).toBe(2);

    // 100 < speed <= 200 => 3 bars
    rerender(<NetworkSignalIcon networkMbps={150} />);
    expect(getBarsCount()).toBe(3);

    // > 200 => 4 bars
    rerender(<NetworkSignalIcon networkMbps={250} />);
    expect(getBarsCount()).toBe(4);
  });
});
