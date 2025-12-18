/**
 * Background Component
 * A wrapper component that displays an image background for dark theme or solid white for light theme
 */

import images from '@assets/images';
import React from 'react';
import { ImageBackground, StyleSheet } from 'react-native';

import { useIsDarkTheme } from '@/theme';

import type { BaseContainerProps } from './types';
import { View } from './view';

interface BackgroundProps extends Omit<BaseContainerProps, 'backgroundColor'> {
  /** Children to render on top of the background */
  children: React.ReactNode;
  /** Custom style for the container */
  style?: BaseContainerProps['style'];
  /** Flex value */
  flex?: number;
}

/**
 * Background component that wraps content with theme-aware background
 * - Dark theme: Uses bg_dark.jpg image (stretched)
 * - Light theme: Uses solid white background
 *
 * @example
 * ```tsx
 * <Background>
 *   <Text>Content here</Text>
 * </Background>
 * ```
 */
export function Background({
  children,
  style,
  flex = 1,
  ...props
}: BackgroundProps) {
  const isDarkTheme = useIsDarkTheme();

  // For dark theme, use ImageBackground with bg_dark.jpg
  if (isDarkTheme) {
    return (
      <ImageBackground
        source={images.bg_dark}
        style={[styles.container, styles.imageBackground, style]}
        resizeMode="stretch"
        testID="background-image"
        {...props}
      >
        <View style={styles.content} flex={flex}>
          {children}
        </View>
      </ImageBackground>
    );
  }

  // For light theme, use solid white background
  return (
    <View
      style={[styles.container, styles.whiteBackground, style]}
      flex={flex}
      testID="background-view"
      {...props}
    >
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  imageBackground: {
    width: '100%',
    height: '100%',
  },
  whiteBackground: {
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    zIndex: 1,
  },
});
