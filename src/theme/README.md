# 🎨 Theme System Usage Guide

## Overview

This theme system supports both light and dark modes without Nativewind, using native React Native StyleSheet.

## Basic Usage

### 1. Using the Theme Hook

```typescript
import { useTheme, useThemeColors } from '@/theme';

function MyComponent() {
  const theme = useTheme(); // Full theme object
  const colors = useThemeColors(); // Just colors (most common)

  return (
    <View style={{
      backgroundColor: colors.background.primary,
      padding: theme.spacing.padding.lg,
    }}>
      <Text style={{
        color: colors.text.primary,
        fontSize: theme.fontSizes.size_16,
        fontFamily: theme.fonts.manropeSemiBold,
      }}>
        Hello World
      </Text>
    </View>
  );
}
```

### 2. Creating Themed Styles

```typescript
import { StyleSheet } from 'react-native';
import { useTheme } from '@/theme';

function MyComponent() {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Title</Text>
    </View>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background.primary,
    padding: theme.spacing.padding.lg,
    borderRadius: theme.borderRadius.lg,
  },
  title: {
    color: theme.colors.text.primary,
    fontSize: theme.fontSizes.size_18,
    fontFamily: theme.fonts.manropeSemiBold,
  },
});
```

### 3. Theme Selection

```typescript
import { useThemeSelection } from '@/theme';

function SettingsScreen() {
  const { selectedTheme, setTheme, effectiveTheme } = useThemeSelection();

  return (
    <View>
      <Button
        title="Dark Mode"
        onPress={() => setTheme('dark')}
      />
      <Button
        title="Light Mode"
        onPress={() => setTheme('light')}
      />
      <Button
        title="System"
        onPress={() => setTheme('system')}
      />
      <Text>Current: {effectiveTheme}</Text>
    </View>
  );
}
```

## Theme Structure

### Colors

```typescript
theme.colors.primary; // Brand primary
theme.colors.background.primary; // Main background
theme.colors.background.secondary; // Card backgrounds
theme.colors.text.primary; // Main text
theme.colors.text.secondary; // Muted text
theme.colors.status.success; // Success green
theme.colors.status.error; // Error red
```

### Spacing

```typescript
theme.spacing.gap.xs; // 4px
theme.spacing.gap.sm; // 6px
theme.spacing.gap.md; // 8px
theme.spacing.padding.lg; // 8px
theme.spacing.padding.xl; // 12px
```

### Typography

```typescript
theme.fonts.manropeRegular; // Font family
theme.fontSizes.size_16; // Font size
theme.lineHeights.loose; // Line height
```

## Migration from Figma Code

### Before (Figma generated)

```typescript
import { Color, FontFamily, FontSize } from '../GlobalStyles';

const styles = StyleSheet.create({
  text: {
    color: Color.colorWhite,
    fontFamily: FontFamily.manropeSemiBold,
    fontSize: FontSize.size_16,
  },
});
```

### After (New theme system)

```typescript
import { useThemeColors, FontFamily, FontSize } from '@/theme';

function MyComponent() {
  const colors = useThemeColors();

  const styles = StyleSheet.create({
    text: {
      color: colors.text.primary,
      fontFamily: FontFamily.manropeSemiBold,
      fontSize: FontSize.size_16,
    },
  });
}
```

## Benefits

1. **Light/Dark Mode Support** - Automatic theme switching
2. **Type Safety** - Full TypeScript support
3. **Performance** - No runtime CSS processing
4. **Consistency** - Single source of truth for all design tokens
5. **Migration Path** - Legacy exports for gradual transition
