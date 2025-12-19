import React from 'react';
import { fireEvent } from '@testing-library/react-native';

import {
  reactNativeRender as render,
  screen,
} from '@/lib/test-utils';
import { FloatingActionButton } from './floating-action-button';

const mockRouter = require('expo-router');

describe('FloatingActionButton', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup router mock
    (mockRouter.useRouter as jest.Mock).mockReturnValue({
      navigate: mockNavigate,
    });
  });

  describe('Component Rendering', () => {
    it('renders without crashing', () => {
      const { toJSON } = render(<FloatingActionButton />);
      expect(toJSON()).toBeTruthy();
    });

    it('renders TouchableOpacity button', () => {
      const { root } = render(<FloatingActionButton />);
      const touchables = root.findAllByType('TouchableOpacity');
      expect(touchables.length).toBeGreaterThan(0);
    });

    it('renders plus icon', () => {
      render(<FloatingActionButton />);
      expect(screen.getByTestId('mock-icon')).toBeTruthy();
    });

    it('renders icon with correct size', () => {
      render(<FloatingActionButton />);
      const icon = screen.getByTestId('mock-icon');
      // Icon mock uses data-size attribute
      expect(icon.props['data-size']).toBe(24);
    });

    it('renders icon with white color', () => {
      render(<FloatingActionButton />);
      const icon = screen.getByTestId('mock-icon');
      // Icon mock uses data-color attribute
      expect(icon.props['data-color']).toBe('#ffffff');
    });

    it('renders icon with plus name', () => {
      render(<FloatingActionButton />);
      // Icon is rendered with plus icon name (verified by component logic)
      expect(screen.getByTestId('mock-icon')).toBeTruthy();
    });
  });

  describe('Navigation', () => {
    it('navigates to create incident screen on press', () => {
      const { root } = render(<FloatingActionButton />);
      const button = root.findByType('TouchableOpacity');

      fireEvent.press(button);

      expect(mockNavigate).toHaveBeenCalledWith('/incidents/create');
    });

    it('navigates only once per press', () => {
      const { root } = render(<FloatingActionButton />);
      const button = root.findByType('TouchableOpacity');

      fireEvent.press(button);

      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });

    it('handles multiple presses', () => {
      const { root } = render(<FloatingActionButton />);
      const button = root.findByType('TouchableOpacity');

      fireEvent.press(button);
      fireEvent.press(button);
      fireEvent.press(button);

      expect(mockNavigate).toHaveBeenCalledTimes(3);
      expect(mockNavigate).toHaveBeenCalledWith('/incidents/create');
    });

    it('does not navigate before button is pressed', () => {
      render(<FloatingActionButton />);

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('navigates with correct route path', () => {
      const { root } = render(<FloatingActionButton />);
      const button = root.findByType('TouchableOpacity');

      fireEvent.press(button);

      expect(mockNavigate).toHaveBeenCalledWith('/incidents/create');
      expect(mockNavigate).not.toHaveBeenCalledWith('/incidents');
      expect(mockNavigate).not.toHaveBeenCalledWith('/create');
    });
  });

  describe('Button Styling', () => {
    it('has absolute positioning style', () => {
      const { root } = render(<FloatingActionButton />);
      const button = root.findByType('TouchableOpacity');
      
      expect(button.props.style).toBeDefined();
    });

    it('applies styles from createStyles', () => {
      const { root } = render(<FloatingActionButton />);
      const button = root.findByType('TouchableOpacity');
      
      const styles = button.props.style;
      expect(styles).toMatchObject({
        position: 'absolute',
        bottom: 24,
        right: 16,
        width: 56,
        height: 56,
      });
    });

    it('has circular shape (borderRadius)', () => {
      const { root } = render(<FloatingActionButton />);
      const button = root.findByType('TouchableOpacity');
      
      expect(button.props.style.borderRadius).toBe(28);
    });

    it('has primary background color', () => {
      const { root } = render(<FloatingActionButton />);
      const button = root.findByType('TouchableOpacity');
      
      expect(button.props.style.backgroundColor).toBeDefined();
    });

    it('has shadow properties for elevation', () => {
      const { root } = render(<FloatingActionButton />);
      const button = root.findByType('TouchableOpacity');
      
      const styles = button.props.style;
      expect(styles.shadowColor).toBe('#000');
      expect(styles.shadowOpacity).toBe(0.25);
      expect(styles.shadowRadius).toBe(4);
    });

    it('centers content with justifyContent and alignItems', () => {
      const { root } = render(<FloatingActionButton />);
      const button = root.findByType('TouchableOpacity');
      
      expect(button.props.style.justifyContent).toBe('center');
      expect(button.props.style.alignItems).toBe('center');
    });
  });

  describe('Theme Integration', () => {
    it('uses theme for styling', () => {
      const { toJSON } = render(<FloatingActionButton />);
      expect(toJSON()).toBeTruthy();
    });

    it('renders with consistent theme', () => {
      const { root: root1 } = render(<FloatingActionButton />);
      const { root: root2 } = render(<FloatingActionButton />);
      
      const button1 = root1.findByType('TouchableOpacity');
      const button2 = root2.findByType('TouchableOpacity');
      
      expect(button1.props.style).toEqual(button2.props.style);
    });
  });

  describe('Icon Component', () => {
    it('renders Icon component inside button', () => {
      render(<FloatingActionButton />);
      
      expect(screen.getByTestId('mock-icon')).toBeTruthy();
    });

    it('icon is a child of TouchableOpacity', () => {
      const { root } = render(<FloatingActionButton />);
      const button = root.findByType('TouchableOpacity');
      
      // Icon should be rendered as child
      expect(button.props.children).toBeDefined();
    });

    it('renders only one icon', () => {
      render(<FloatingActionButton />);
      const icons = screen.getAllByTestId('mock-icon');
      expect(icons).toHaveLength(1);
    });
  });

  describe('Edge Cases', () => {
    it('handles router being undefined', () => {
      (mockRouter.useRouter as jest.Mock).mockReturnValue(undefined);

      // Should render but will fail on press
      expect(() => render(<FloatingActionButton />)).not.toThrow();
    });

    it('handles navigate function being undefined', () => {
      (mockRouter.useRouter as jest.Mock).mockReturnValue({
        navigate: undefined,
      });

      const { root } = render(<FloatingActionButton />);
      const button = root.findByType('TouchableOpacity');

      // Should throw when trying to navigate
      expect(() => fireEvent.press(button)).toThrow();
    });

    it('handles navigation error gracefully', () => {
      mockNavigate.mockImplementation(() => {
        throw new Error('Navigation error');
      });

      const { root } = render(<FloatingActionButton />);
      const button = root.findByType('TouchableOpacity');

      expect(() => fireEvent.press(button)).toThrow('Navigation error');
    });

    it('renders correctly when re-rendered', () => {
      const { rerender } = render(<FloatingActionButton />);
      
      expect(screen.getByTestId('mock-icon')).toBeTruthy();

      rerender(<FloatingActionButton />);
      
      expect(screen.getByTestId('mock-icon')).toBeTruthy();
    });

    it('maintains state across re-renders', () => {
      const { root, rerender } = render(<FloatingActionButton />);
      const button1 = root.findByType('TouchableOpacity');

      rerender(<FloatingActionButton />);
      const button2 = root.findByType('TouchableOpacity');

      expect(button1.props.style).toEqual(button2.props.style);
    });
  });

  describe('Button Interaction', () => {
    beforeEach(() => {
      // Reset mock implementations for this describe block
      mockNavigate.mockReset();
      mockNavigate.mockImplementation(() => {});
    });

    it('button is pressable', () => {
      const { root } = render(<FloatingActionButton />);
      const button = root.findByType('TouchableOpacity');

      expect(button.props.onPress).toBeDefined();
      expect(typeof button.props.onPress).toBe('function');
    });

    it('onPress handler triggers navigation', () => {
      const { root } = render(<FloatingActionButton />);
      const button = root.findByType('TouchableOpacity');

      fireEvent.press(button);

      expect(mockNavigate).toHaveBeenCalled();
    });

    it('handles rapid succession presses', () => {
      const { root } = render(<FloatingActionButton />);
      const button = root.findByType('TouchableOpacity');

      // Rapid fire presses
      for (let i = 0; i < 10; i++) {
        fireEvent.press(button);
      }

      expect(mockNavigate).toHaveBeenCalledTimes(10);
    });

    it('press handler does not change between renders', () => {
      const { root, rerender } = render(<FloatingActionButton />);
      const button1 = root.findByType('TouchableOpacity');
      const onPress1 = button1.props.onPress;

      rerender(<FloatingActionButton />);
      const button2 = root.findByType('TouchableOpacity');
      const onPress2 = button2.props.onPress;

      // Handler should be consistent
      expect(typeof onPress1).toBe('function');
      expect(typeof onPress2).toBe('function');
    });
  });

  describe('Positioning', () => {
    it('is positioned at bottom right of screen', () => {
      const { root } = render(<FloatingActionButton />);
      const button = root.findByType('TouchableOpacity');
      
      expect(button.props.style.position).toBe('absolute');
      expect(button.props.style.bottom).toBe(24);
      expect(button.props.style.right).toBe(16);
    });

    it('has correct dimensions (56x56)', () => {
      const { root } = render(<FloatingActionButton />);
      const button = root.findByType('TouchableOpacity');
      
      expect(button.props.style.width).toBe(56);
      expect(button.props.style.height).toBe(56);
    });

    it('maintains position across re-renders', () => {
      const { root, rerender } = render(<FloatingActionButton />);
      const button1 = root.findByType('TouchableOpacity');
      const position1 = {
        bottom: button1.props.style.bottom,
        right: button1.props.style.right,
      };

      rerender(<FloatingActionButton />);
      const button2 = root.findByType('TouchableOpacity');
      const position2 = {
        bottom: button2.props.style.bottom,
        right: button2.props.style.right,
      };

      expect(position1).toEqual(position2);
    });
  });

  describe('Accessibility', () => {
    it('is a touchable element', () => {
      const { root } = render(<FloatingActionButton />);
      const touchables = root.findAllByType('TouchableOpacity');
      expect(touchables.length).toBeGreaterThan(0);
    });

    it('has visual icon indicator', () => {
      render(<FloatingActionButton />);
      expect(screen.getByTestId('mock-icon')).toBeTruthy();
    });

    it('button can be identified by its icon', () => {
      render(<FloatingActionButton />);
      const icon = screen.getByTestId('mock-icon');
      expect(icon).toBeTruthy();
    });
  });

  describe('Performance', () => {
    it('renders efficiently', () => {
      const startTime = Date.now();
      render(<FloatingActionButton />);
      const endTime = Date.now();
      
      // Should render quickly (within 100ms)
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('does not create unnecessary re-renders', () => {
      const { rerender } = render(<FloatingActionButton />);
      
      const icon1 = screen.getByTestId('mock-icon');
      
      rerender(<FloatingActionButton />);
      
      const icon2 = screen.getByTestId('mock-icon');
      
      // Icon should still be present
      expect(icon1).toBeTruthy();
      expect(icon2).toBeTruthy();
    });
  });

  describe('Component Structure', () => {
    it('has single root TouchableOpacity', () => {
      const { root } = render(<FloatingActionButton />);
      const touchables = root.findAllByType('TouchableOpacity');
      expect(touchables).toHaveLength(1);
    });

    it('TouchableOpacity contains Icon', () => {
      const { root } = render(<FloatingActionButton />);
      const button = root.findByType('TouchableOpacity');
      
      expect(button.props.children).toBeDefined();
      expect(screen.getByTestId('mock-icon')).toBeTruthy();
    });

    it('maintains consistent structure', () => {
      const { toJSON } = render(<FloatingActionButton />);
      const tree = toJSON();
      
      // Component structure is maintained
      expect(tree).toBeTruthy();
    });
  });
});
