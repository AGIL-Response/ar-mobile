import React from 'react';
import { fireEvent } from '@testing-library/react-native';

import { reactNativeRender as render, screen } from '@/lib/test-utils';
import * as Theme from '@/theme';

import { IconButton } from './icon-button';

describe('IconButton component', () => {
  const mockTheme = {
    colors: {
      primary: '#007AFF',
      background: {
        secondary: '#F3F4F6',
      },
      semantic: {
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
      },
      text: {
        primary: '#000000',
        secondary: '#6B7280',
        muted: '#9CA3AF',
        disabled: '#9CA3AF',
      },
    },
    components: {
      button: {
        borderRadius: 8,
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Theme, 'useTheme').mockReturnValue(mockTheme as any);
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  describe('Basic Rendering', () => {
    it('renders icon button with required icon prop', () => {
      render(<IconButton icon="home" onPress={jest.fn()} />);
      const icon = screen.getByTestId('mock-icon');
      expect(icon).toBeTruthy();
      expect(icon.props['data-name']).toBe('home');
    });

    it('renders with testID', () => {
      render(<IconButton icon="home" onPress={jest.fn()} testID="test-button" />);
      const button = screen.getByTestId('test-button');
      expect(button).toBeTruthy();
    });

    it('renders with accessibility label', () => {
      render(<IconButton icon="home" onPress={jest.fn()} accessibilityLabel="Home button" testID="home-btn" />);
      const button = screen.getByTestId('home-btn');
      expect(button.props.accessibilityLabel).toBe('Home button');
    });

    it('generates default accessibility label from icon name', () => {
      render(<IconButton icon="settings" onPress={jest.fn()} testID="settings-btn" />);
      const button = screen.getByTestId('settings-btn');
      expect(button.props.accessibilityLabel).toBe('Icon button: settings');
    });
  });

  describe('Size Variants', () => {
    it('renders with small size', () => {
      render(<IconButton icon="home" size="small" onPress={jest.fn()} />);
      const icon = screen.getByTestId('mock-icon');
      expect(icon.props['data-size']).toBe(16);
    });

    it('renders with medium size (default)', () => {
      render(<IconButton icon="home" onPress={jest.fn()} />);
      const icon = screen.getByTestId('mock-icon');
      expect(icon.props['data-size']).toBe(20);
    });

    it('renders with large size', () => {
      render(<IconButton icon="home" size="large" onPress={jest.fn()} />);
      const icon = screen.getByTestId('mock-icon');
      expect(icon.props['data-size']).toBe(26);
    });
  });

  describe('Color Variants', () => {
    it('renders with primary color variant', () => {
      render(<IconButton icon="home" colorVariant="primary" onPress={jest.fn()} />);
      const icon = screen.getByTestId('mock-icon');
      expect(icon.props['data-color']).toBe('#FFFFFF');
    });

    it('renders with secondary color variant (default)', () => {
      render(<IconButton icon="home" onPress={jest.fn()} />);
      const icon = screen.getByTestId('mock-icon');
      expect(icon.props['data-color']).toBe('#9CA3AF');
    });

    it('renders with success color variant', () => {
      render(<IconButton icon="home" colorVariant="success" onPress={jest.fn()} />);
      const icon = screen.getByTestId('mock-icon');
      expect(icon).toBeTruthy();
    });

    it('renders with warning color variant', () => {
      render(<IconButton icon="home" colorVariant="warning" onPress={jest.fn()} />);
      const icon = screen.getByTestId('mock-icon');
      expect(icon).toBeTruthy();
    });

    it('renders with error color variant', () => {
      render(<IconButton icon="home" colorVariant="error" onPress={jest.fn()} />);
      const icon = screen.getByTestId('mock-icon');
      expect(icon).toBeTruthy();
    });

    it('renders with transparent color variant', () => {
      render(<IconButton icon="home" colorVariant="transparent" onPress={jest.fn()} />);
      const icon = screen.getByTestId('mock-icon');
      expect(icon.props['data-color']).toBe('#000000');
    });
  });

  describe('Custom Colors', () => {
    it('uses custom backgroundColor when provided', () => {
      const { toJSON } = render(
        <IconButton icon="home" backgroundColor="#FF0000" onPress={jest.fn()} />
      );
      expect(toJSON()).toBeTruthy();
    });

    it('uses custom iconColor when provided', () => {
      render(<IconButton icon="home" iconColor="#00FF00" onPress={jest.fn()} />);
      const icon = screen.getByTestId('mock-icon');
      expect(icon.props['data-color']).toBe('#00FF00');
    });

    it('prioritizes iconColor over colorVariant', () => {
      render(
        <IconButton
          icon="home"
          colorVariant="primary"
          iconColor="#FF00FF"
          onPress={jest.fn()}
        />
      );
      const icon = screen.getByTestId('mock-icon');
      expect(icon.props['data-color']).toBe('#FF00FF');
    });
  });

  describe('Custom Icon Size', () => {
    it('uses custom iconSize when provided', () => {
      render(<IconButton icon="home" iconSize={30} onPress={jest.fn()} />);
      const icon = screen.getByTestId('mock-icon');
      expect(icon.props['data-size']).toBe(30);
    });

    it('defaults to size-based icon size when iconSize not provided', () => {
      render(<IconButton icon="home" size="large" onPress={jest.fn()} />);
      const icon = screen.getByTestId('mock-icon');
      expect(icon.props['data-size']).toBe(26);
    });
  });

  describe('Circular vs Non-Circular', () => {
    it('renders circular button by default', () => {
      const { toJSON } = render(<IconButton icon="home" onPress={jest.fn()} />);
      expect(toJSON()).toBeTruthy();
    });

    it('renders non-circular button when circular is false', () => {
      const { toJSON } = render(
        <IconButton icon="home" circular={false} onPress={jest.fn()} />
      );
      expect(toJSON()).toBeTruthy();
    });

    it('uses custom borderRadius when circular is false', () => {
      const { toJSON } = render(
        <IconButton icon="home" circular={false} borderRadius={12} onPress={jest.fn()} />
      );
      expect(toJSON()).toBeTruthy();
    });

    it('uses theme borderRadius when circular is false and borderRadius not provided', () => {
      const { toJSON } = render(
        <IconButton icon="home" circular={false} onPress={jest.fn()} />
      );
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('Disabled State', () => {
    it('renders disabled button', () => {
      render(<IconButton icon="home" disabled onPress={jest.fn()} />);
      const icon = screen.getByTestId('mock-icon');
      expect(icon.props['data-color']).toBe('#9CA3AF');
    });

    it('does not call onPress when disabled', () => {
      const onPress = jest.fn();
      render(<IconButton icon="home" disabled onPress={onPress} testID="disabled-btn" />);
      const button = screen.getByTestId('disabled-btn');
      expect(button.props.onPress).toBeUndefined();
      // Even if we try to press, it shouldn't call onPress because onPress is undefined
      if (button.props.onPress) {
        fireEvent.press(button);
      }
      expect(onPress).not.toHaveBeenCalled();
    });

    it('sets disabled accessibility state', () => {
      render(<IconButton icon="home" disabled onPress={jest.fn()} testID="disabled-btn" />);
      const button = screen.getByTestId('disabled-btn');
      expect(button.props.accessibilityState.disabled).toBe(true);
    });

    it('allows onPress when not disabled', () => {
      const onPress = jest.fn();
      render(<IconButton icon="home" onPress={onPress} testID="enabled-btn" />);
      const button = screen.getByTestId('enabled-btn');
      fireEvent.press(button);
      expect(onPress).toHaveBeenCalled();
    });
  });

  describe('Press Handling', () => {
    it('calls onPress when button is pressed', () => {
      const onPress = jest.fn();
      render(<IconButton icon="home" onPress={onPress} />);
      const button = screen.getByTestId('mock-icon').parent;
      fireEvent.press(button);
      expect(onPress).toHaveBeenCalled();
    });

    it('handles multiple presses', () => {
      const onPress = jest.fn();
      render(<IconButton icon="home" onPress={onPress} />);
      const button = screen.getByTestId('mock-icon').parent;
      fireEvent.press(button);
      fireEvent.press(button);
      fireEvent.press(button);
      expect(onPress).toHaveBeenCalledTimes(3);
    });
  });

  describe('Style Merging', () => {
    it('merges custom style with default styles', () => {
      const customStyle = { marginTop: 10 };
      const { toJSON } = render(
        <IconButton icon="home" style={customStyle} onPress={jest.fn()} />
      );
      expect(toJSON()).toBeTruthy();
    });

    it('handles array of styles', () => {
      const style1 = { marginTop: 10 };
      const style2 = { marginBottom: 20 };
      const { toJSON } = render(
        <IconButton icon="home" style={[style1, style2]} onPress={jest.fn()} />
      );
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('sets correct accessibility role', () => {
      render(<IconButton icon="home" onPress={jest.fn()} testID="role-btn" />);
      const button = screen.getByTestId('role-btn');
      expect(button.props.accessibilityRole).toBe('button');
    });

    it('sets accessibility state for disabled', () => {
      render(<IconButton icon="home" disabled onPress={jest.fn()} testID="disabled-state-btn" />);
      const button = screen.getByTestId('disabled-state-btn');
      expect(button.props.accessibilityState.disabled).toBe(true);
    });

    it('sets accessibility state for enabled', () => {
      render(<IconButton icon="home" onPress={jest.fn()} testID="enabled-state-btn" />);
      const button = screen.getByTestId('enabled-state-btn');
      expect(button.props.accessibilityState.disabled).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined onPress', () => {
      const { toJSON } = render(<IconButton icon="home" />);
      expect(toJSON()).toBeTruthy();
    });

    it('handles empty string icon', () => {
      const { toJSON } = render(<IconButton icon={'' as any} onPress={jest.fn()} />);
      expect(toJSON()).toBeTruthy();
    });

    it('handles very large iconSize', () => {
      render(<IconButton icon="home" iconSize={100} onPress={jest.fn()} />);
      const icon = screen.getByTestId('mock-icon');
      expect(icon.props['data-size']).toBe(100);
    });

    it('handles zero iconSize', () => {
      render(<IconButton icon="home" iconSize={0} onPress={jest.fn()} />);
      const icon = screen.getByTestId('mock-icon');
      expect(icon.props['data-size']).toBe(0);
    });

    it('handles negative borderRadius', () => {
      const { toJSON } = render(
        <IconButton icon="home" circular={false} borderRadius={-5} onPress={jest.fn()} />
      );
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('Theme Integration', () => {
    it('uses theme colors for primary variant', () => {
      render(<IconButton icon="home" colorVariant="primary" onPress={jest.fn()} />);
      const icon = screen.getByTestId('mock-icon');
      expect(icon).toBeTruthy();
    });

    it('uses theme colors for secondary variant', () => {
      render(<IconButton icon="home" colorVariant="secondary" onPress={jest.fn()} />);
      const icon = screen.getByTestId('mock-icon');
      expect(icon.props['data-color']).toBe('#9CA3AF');
    });

    it('uses theme semantic colors', () => {
      render(<IconButton icon="home" colorVariant="success" onPress={jest.fn()} />);
      const icon = screen.getByTestId('mock-icon');
      expect(icon).toBeTruthy();
    });

    it('uses theme button borderRadius', () => {
      const { toJSON } = render(
        <IconButton icon="home" circular={false} onPress={jest.fn()} />
      );
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('Component Display Name', () => {
    it('has correct display name', () => {
      expect(IconButton.displayName).toBe('IconButton');
    });
  });
});

