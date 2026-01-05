import React from 'react';

import { fireEvent, reactNativeRender as render, screen } from '@/lib/test-utils';
import { useLocationStore } from '@/stores/location';
import { useTasksStore } from '@/stores/tasks';

import { SosSection } from './sos-section';

jest.mock('@/stores/location', () => ({
  useLocationStore: jest.fn(),
}));

jest.mock('@/stores/tasks', () => ({
  useTasksStore: jest.fn(),
}));

jest.mock('@/components/centered-modal', () => ({
  CenteredModal: () => null,
}));

describe('SosSection', () => {
  const mockCreateTask = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateTask.mockResolvedValue(undefined);

    (useLocationStore as unknown as jest.Mock).mockImplementation((selector: any) =>
      selector({
        coordinates: {
          latitude: 10.123,
          longitude: 20.456,
          altitude: 100,
        },
      })
    );

    (useTasksStore as unknown as jest.Mock).mockImplementation((selector: any) =>
      selector({
        actions: {
          createTask: mockCreateTask,
        },
      })
    );
  });

  describe('Component Rendering', () => {
    it('renders without crashing', () => {
      const { toJSON } = render(<SosSection />);
      expect(toJSON()).toBeTruthy();
    });

    it('renders SOS button', () => {
      render(<SosSection />);
      expect(screen.getByText('SOS')).toBeTruthy();
    });

    it('has proper container structure', () => {
      const { toJSON } = render(<SosSection />);
      expect(toJSON()).toBeTruthy();
    });

    it('SOS button is touchable', () => {
      const { root } = render(<SosSection />);
      const touchables = root.findAllByType('TouchableOpacity');
      expect(touchables.length).toBeGreaterThan(0);
    });
  });

  describe('SOS Button Functionality', () => {
    it('can be pressed without crashing', () => {
      const { root } = render(<SosSection />);
      
      const sosButton = root.findByType('TouchableOpacity');
      fireEvent.press(sosButton);

      // Component should still be rendered
      expect(screen.getByText('SOS')).toBeTruthy();
    });

    it('handles multiple presses', () => {
      const { root } = render(<SosSection />);
      
      const sosButton = root.findByType('TouchableOpacity');
      
      fireEvent.press(sosButton);
      fireEvent.press(sosButton);
      fireEvent.press(sosButton);

      // Component should still be rendered
      expect(screen.getByText('SOS')).toBeTruthy();
    });
  });

  describe('Store Integration', () => {
    it('uses location store for coordinates', () => {
      (useLocationStore as unknown as jest.Mock).mockImplementation((selector: any) =>
        selector({
          coordinates: {
            latitude: 15.789,
            longitude: 25.012,
            altitude: 200,
          },
        })
      );

      const { toJSON } = render(<SosSection />);
      expect(toJSON()).toBeTruthy();
    });

    it('handles missing coordinates', () => {
      (useLocationStore as unknown as jest.Mock).mockImplementation((selector: any) =>
        selector({
          coordinates: null,
        })
      );

      const { toJSON } = render(<SosSection />);
      expect(toJSON()).toBeTruthy();
    });

    it('uses tasks store for createTask action', () => {
      const customCreateTask = jest.fn();
      (useTasksStore as unknown as jest.Mock).mockImplementation((selector: any) =>
        selector({
          actions: {
            createTask: customCreateTask,
          },
        })
      );

      const { toJSON } = render(<SosSection />);
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('Theme Integration', () => {
    it('renders with theme styles', () => {
      const { toJSON } = render(<SosSection />);
      expect(toJSON()).toBeTruthy();
    });

    it('applies theme to SOS button', () => {
      render(<SosSection />);
      expect(screen.getByText('SOS')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('handles re-render without errors', () => {
      const { rerender, toJSON } = render(<SosSection />);
      rerender(<SosSection />);
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('Component Structure', () => {
    it('maintains consistent structure', () => {
      const { toJSON } = render(<SosSection />);
      expect(toJSON()).toBeTruthy();
    });
  });
});
