import React from 'react';
import { View } from 'react-native';

import {
  findPressableParent,
  fireEvent,
  reactNativeRender as render,
  screen,
} from '@/lib/test-utils';

import { Palette } from '@/theme';

import { TabSelector } from './tab-selector';

describe('TabSelector', () => {
  it('invokes onTabChange when tabs are pressed', () => {
    const onTabChange = jest.fn();

    render(<TabSelector activeTab="flat" onTabChange={onTabChange} />);

    fireEvent.press(findPressableParent(screen.getByText('Map View')));

    expect(onTabChange).toHaveBeenCalledWith('map');

    fireEvent.press(findPressableParent(screen.getByText('Flat View')));

    expect(onTabChange).toHaveBeenCalledWith('flat');
  });

  it('shows an indicator only under the active tab', () => {
    const utils = render(
      <TabSelector activeTab="flat" onTabChange={jest.fn()} />
    );

    const getActiveIndicators = () =>
      utils.UNSAFE_getAllByType(View).filter((node: any) => {
        const style = node.props.style;
        if (Array.isArray(style)) {
          return style.some(
            (s) => s?.height === 3 && s?.backgroundColor === Palette.primary
          );
        }
        return (
          style?.height === 3 && style?.backgroundColor === Palette.primary
        );
      });

    expect(getActiveIndicators()).toHaveLength(1);

    utils.rerender(<TabSelector activeTab="map" onTabChange={jest.fn()} />);

    expect(getActiveIndicators()).toHaveLength(1);
  });
});
