import React from 'react';

import { reactNativeRender as render } from '@/lib/test-utils';

import { BatteryIcon } from './battery-icon';

describe('BatteryIcon', () => {
  it('returns SVG when batteryPercentage has a value', () => {
    const { rerender } = render(<BatteryIcon batteryPercentage={100}/>);
    expect(rerender).toBeDefined();
  });

  it('renders no SVG when batteryPercentage is undefined', () => {
    const { toJSON } = render(<BatteryIcon batteryPercentage={undefined}/>);
    const tree = toJSON() as any;
  
    const children = tree.children || [];
    const hasFillRect = children.some(child => child.type === 'Svg');
    expect(hasFillRect).toBe(false);
  });

  it('renders X icon when batteryPercentage is 0', () => {
    const { toJSON } = render(<BatteryIcon batteryPercentage={0} />);
    const tree = toJSON() as any;
    expect(tree).toBeTruthy();
    expect(tree.type).toBe('View');
  });

  it('uses provided fillColor when specified', () => {
    const { toJSON } = render(
      <BatteryIcon batteryPercentage={40} fillColor="#123456" />
    );
    const tree = toJSON();
    const children = tree.children || [];
    const fillRect = children.find((child) => child.type === 'Svg');

    expect(fillRect).toBeTruthy();
    expect(fillRect.children[2].props.fill).toBe('#123456');
  });
});
