import React from 'react';

import { fireEvent, reactNativeRender as render, screen } from '@/lib/test-utils';

import { TabSelector } from './tab-selector';

describe('TabSelector', () => {
  const mockOnTabChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders without crashing', () => {
      const { toJSON } = render(<TabSelector activeTab="flat" onTabChange={mockOnTabChange} />);
      expect(toJSON()).toBeTruthy();
    });

    it('renders Flat View tab', () => {
      render(<TabSelector activeTab="flat" onTabChange={mockOnTabChange} />);
      expect(screen.getByText('Flat View')).toBeTruthy();
    });

    it('renders Map View tab', () => {
      render(<TabSelector activeTab="flat" onTabChange={mockOnTabChange} />);
      expect(screen.getByText('Map View')).toBeTruthy();
    });

    it('renders both tabs simultaneously', () => {
      render(<TabSelector activeTab="flat" onTabChange={mockOnTabChange} />);
      expect(screen.getByText('Flat View')).toBeTruthy();
      expect(screen.getByText('Map View')).toBeTruthy();
    });

    it('renders with map tab active', () => {
      const { toJSON } = render(<TabSelector activeTab="map" onTabChange={mockOnTabChange} />);
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('Tab Interaction', () => {
    it('calls onTabChange with "flat" when Flat View is pressed', () => {
      const { root } = render(<TabSelector activeTab="map" onTabChange={mockOnTabChange} />);

      const touchables = root.findAllByType('TouchableOpacity');
      fireEvent.press(touchables[0]); // First touchable is Flat View

      expect(mockOnTabChange).toHaveBeenCalledWith('flat');
      expect(mockOnTabChange).toHaveBeenCalledTimes(1);
    });

    it('calls onTabChange with "map" when Map View is pressed', () => {
      const { root } = render(<TabSelector activeTab="flat" onTabChange={mockOnTabChange} />);

      const touchables = root.findAllByType('TouchableOpacity');
      fireEvent.press(touchables[1]); // Second touchable is Map View

      expect(mockOnTabChange).toHaveBeenCalledWith('map');
      expect(mockOnTabChange).toHaveBeenCalledTimes(1);
    });

    it('handles pressing already active tab', () => {
      const { root } = render(<TabSelector activeTab="flat" onTabChange={mockOnTabChange} />);

      const touchables = root.findAllByType('TouchableOpacity');
      fireEvent.press(touchables[0]); // Press already active Flat View

      expect(mockOnTabChange).toHaveBeenCalledWith('flat');
      expect(mockOnTabChange).toHaveBeenCalledTimes(1);
    });

    it('handles multiple presses correctly', () => {
      const { root } = render(<TabSelector activeTab="flat" onTabChange={mockOnTabChange} />);

      const touchables = root.findAllByType('TouchableOpacity');

      fireEvent.press(touchables[1]); // Press Map View
      fireEvent.press(touchables[0]); // Press Flat View
      fireEvent.press(touchables[1]); // Press Map View again

      expect(mockOnTabChange).toHaveBeenCalledTimes(3);
      expect(mockOnTabChange).toHaveBeenNthCalledWith(1, 'map');
      expect(mockOnTabChange).toHaveBeenNthCalledWith(2, 'flat');
      expect(mockOnTabChange).toHaveBeenNthCalledWith(3, 'map');
    });

    it('handles rapid successive presses', () => {
      const { root } = render(<TabSelector activeTab="flat" onTabChange={mockOnTabChange} />);

      const touchables = root.findAllByType('TouchableOpacity');

      fireEvent.press(touchables[1]);
      fireEvent.press(touchables[1]);
      fireEvent.press(touchables[1]);

      expect(mockOnTabChange).toHaveBeenCalledTimes(3);
      expect(mockOnTabChange).toHaveBeenCalledWith('map');
    });
  });

  describe('Active Tab State - Flat View', () => {
    it('renders with flat tab active', () => {
      render(<TabSelector activeTab="flat" onTabChange={mockOnTabChange} />);
      expect(screen.getByText('Flat View')).toBeTruthy();
      expect(screen.getByText('Map View')).toBeTruthy();
    });

    it('has both tabs visible when flat is active', () => {
      const { root } = render(<TabSelector activeTab="flat" onTabChange={mockOnTabChange} />);
      const touchables = root.findAllByType('TouchableOpacity');
      expect(touchables.length).toBe(2);
    });

    it('maintains structure with flat tab active', () => {
      const { toJSON } = render(<TabSelector activeTab="flat" onTabChange={mockOnTabChange} />);
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('Active Tab State - Map View', () => {
    it('renders with map tab active', () => {
      render(<TabSelector activeTab="map" onTabChange={mockOnTabChange} />);
      expect(screen.getByText('Flat View')).toBeTruthy();
      expect(screen.getByText('Map View')).toBeTruthy();
    });

    it('has both tabs visible when map is active', () => {
      const { root } = render(<TabSelector activeTab="map" onTabChange={mockOnTabChange} />);
      const touchables = root.findAllByType('TouchableOpacity');
      expect(touchables.length).toBe(2);
    });

    it('maintains structure with map tab active', () => {
      const { toJSON } = render(<TabSelector activeTab="map" onTabChange={mockOnTabChange} />);
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('Tab Switching', () => {
    it('switches from flat to map', () => {
      const { rerender } = render(<TabSelector activeTab="flat" onTabChange={mockOnTabChange} />);

      expect(screen.getByText('Flat View')).toBeTruthy();

      rerender(<TabSelector activeTab="map" onTabChange={mockOnTabChange} />);

      expect(screen.getByText('Map View')).toBeTruthy();
    });

    it('switches from map to flat', () => {
      const { rerender } = render(<TabSelector activeTab="map" onTabChange={mockOnTabChange} />);

      expect(screen.getByText('Map View')).toBeTruthy();

      rerender(<TabSelector activeTab="flat" onTabChange={mockOnTabChange} />);

      expect(screen.getByText('Flat View')).toBeTruthy();
    });

    it('handles multiple switches', () => {
      const { rerender } = render(<TabSelector activeTab="flat" onTabChange={mockOnTabChange} />);

      rerender(<TabSelector activeTab="map" onTabChange={mockOnTabChange} />);
      rerender(<TabSelector activeTab="flat" onTabChange={mockOnTabChange} />);
      rerender(<TabSelector activeTab="map" onTabChange={mockOnTabChange} />);

      const { toJSON } = render(<TabSelector activeTab="map" onTabChange={mockOnTabChange} />);
      expect(toJSON()).toBeTruthy();
    });

    it('maintains both tabs visible during switches', () => {
      const { rerender, root } = render(
        <TabSelector activeTab="flat" onTabChange={mockOnTabChange} />
      );

      let touchables = root.findAllByType('TouchableOpacity');
      expect(touchables.length).toBe(2);

      rerender(<TabSelector activeTab="map" onTabChange={mockOnTabChange} />);

      touchables = root.findAllByType('TouchableOpacity');
      expect(touchables.length).toBe(2);
    });
  });

  describe('Component Structure', () => {
    it('has container with correct structure', () => {
      const { toJSON } = render(<TabSelector activeTab="flat" onTabChange={mockOnTabChange} />);
      expect(toJSON()).toBeTruthy();
    });

    it('has two touchable tabs', () => {
      const { root } = render(<TabSelector activeTab="flat" onTabChange={mockOnTabChange} />);
      const touchables = root.findAllByType('TouchableOpacity');
      expect(touchables.length).toBe(2);
    });

    it('maintains consistent structure across re-renders', () => {
      const { rerender, toJSON } = render(
        <TabSelector activeTab="flat" onTabChange={mockOnTabChange} />
      );

      expect(toJSON()).toBeTruthy();

      rerender(<TabSelector activeTab="map" onTabChange={mockOnTabChange} />);

      expect(toJSON()).toBeTruthy();
    });

    it('renders indicators for both tabs', () => {
      const { root } = render(<TabSelector activeTab="flat" onTabChange={mockOnTabChange} />);
      // Each tab has an indicator View, so we should have at least 2 indicator views
      const views = root.findAllByType('View');
      expect(views.length).toBeGreaterThan(2); // Container + 2 indicators + any other views
    });
  });

  describe('Theme Integration', () => {
    it('renders with theme styles', () => {
      const { toJSON } = render(<TabSelector activeTab="flat" onTabChange={mockOnTabChange} />);
      expect(toJSON()).toBeTruthy();
    });

    it('applies theme to both tabs', () => {
      render(<TabSelector activeTab="flat" onTabChange={mockOnTabChange} />);
      expect(screen.getByText('Flat View')).toBeTruthy();
      expect(screen.getByText('Map View')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('handles onTabChange being undefined gracefully', () => {
      const { toJSON } = render(
        <TabSelector activeTab="flat" onTabChange={undefined as any} />
      );
      expect(toJSON()).toBeTruthy();
    });

    it('renders when activeTab changes externally', () => {
      const { rerender } = render(<TabSelector activeTab="flat" onTabChange={mockOnTabChange} />);

      expect(screen.getByText('Flat View')).toBeTruthy();

      rerender(<TabSelector activeTab="map" onTabChange={mockOnTabChange} />);

      expect(screen.getByText('Map View')).toBeTruthy();
    });

    it('handles rapid activeTab changes', () => {
      const { rerender } = render(<TabSelector activeTab="flat" onTabChange={mockOnTabChange} />);

      rerender(<TabSelector activeTab="map" onTabChange={mockOnTabChange} />);
      rerender(<TabSelector activeTab="flat" onTabChange={mockOnTabChange} />);
      rerender(<TabSelector activeTab="map" onTabChange={mockOnTabChange} />);
      rerender(<TabSelector activeTab="flat" onTabChange={mockOnTabChange} />);

      expect(screen.getByText('Flat View')).toBeTruthy();
      expect(screen.getByText('Map View')).toBeTruthy();
    });

    it('maintains callback reference across re-renders', () => {
      const callback = jest.fn();
      const { rerender, root } = render(<TabSelector activeTab="flat" onTabChange={callback} />);

      const touchables1 = root.findAllByType('TouchableOpacity');
      fireEvent.press(touchables1[1]);

      expect(callback).toHaveBeenCalledWith('map');
      callback.mockClear();

      rerender(<TabSelector activeTab="map" onTabChange={callback} />);

      const touchables2 = root.findAllByType('TouchableOpacity');
      fireEvent.press(touchables2[0]);

      expect(callback).toHaveBeenCalledWith('flat');
    });

    it('handles different callback functions', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      const { rerender, root } = render(
        <TabSelector activeTab="flat" onTabChange={callback1} />
      );

      const touchables1 = root.findAllByType('TouchableOpacity');
      fireEvent.press(touchables1[1]);

      expect(callback1).toHaveBeenCalledWith('map');
      expect(callback2).not.toHaveBeenCalled();

      rerender(<TabSelector activeTab="map" onTabChange={callback2} />);

      const touchables2 = root.findAllByType('TouchableOpacity');
      fireEvent.press(touchables2[0]);

      expect(callback2).toHaveBeenCalledWith('flat');
      expect(callback1).toHaveBeenCalledTimes(1); // Should still be 1 from before
    });
  });

  describe('Accessibility', () => {
    it('makes tabs pressable', () => {
      const { root } = render(<TabSelector activeTab="flat" onTabChange={mockOnTabChange} />);

      const touchables = root.findAllByType('TouchableOpacity');

      expect(touchables.length).toBe(2);
      expect(touchables[0].props.onPress).toBeDefined();
      expect(touchables[1].props.onPress).toBeDefined();
    });

    it('has text labels for both tabs', () => {
      render(<TabSelector activeTab="flat" onTabChange={mockOnTabChange} />);

      expect(screen.getByText('Flat View')).toBeTruthy();
      expect(screen.getByText('Map View')).toBeTruthy();
    });
  });

  describe('Performance', () => {
    it('handles many rapid re-renders', () => {
      const { rerender } = render(<TabSelector activeTab="flat" onTabChange={mockOnTabChange} />);

      for (let i = 0; i < 10; i++) {
        rerender(<TabSelector activeTab={i % 2 === 0 ? 'flat' : 'map'} onTabChange={mockOnTabChange} />);
      }

      expect(screen.getByText('Flat View')).toBeTruthy();
      expect(screen.getByText('Map View')).toBeTruthy();
    });

    it('handles many rapid presses', () => {
      const { root } = render(<TabSelector activeTab="flat" onTabChange={mockOnTabChange} />);

      const touchables = root.findAllByType('TouchableOpacity');

      for (let i = 0; i < 20; i++) {
        fireEvent.press(touchables[i % 2]);
      }

      expect(mockOnTabChange).toHaveBeenCalledTimes(20);
    });
  });
});
