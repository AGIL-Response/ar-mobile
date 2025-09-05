# Font Override Example

This example shows how to use the new `font` prop to override font families in the Text component.

## Usage

```typescript
import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components';
import { FontFamily } from '@/theme';

export function FontExample() {
  return (
    <View style={{ padding: 16 }}>
      {/* Default variant with default font */}
      <Text variant="h1">Default H1 with Manrope Bold</Text>
      
      {/* Override font family while keeping variant styling */}
      <Text variant="h1" font={FontFamily.interBold}>
        H1 with Inter Bold
      </Text>
      
      {/* Body text with different font */}
      <Text variant="body" font={FontFamily.manropeMedium}>
        Body text with Manrope Medium
      </Text>
      
      {/* Caption with accent font */}
      <Text variant="caption" font={FontFamily.russoOneRegular}>
        Caption with Russo One
      </Text>
      
      {/* Button text with system font */}
      <Text variant="button" font={FontFamily.sFProText}>
        Button with SF Pro Text
      </Text>
    </View>
  );
}
```

## Available Font Families

```typescript
import { FontFamily } from '@/theme';

// Manrope family (primary)
FontFamily.manropeRegular    // 'Manrope_400Regular'
FontFamily.manropeMedium     // 'Manrope_500Medium'
FontFamily.manropeSemiBold   // 'Manrope_600SemiBold'
FontFamily.manropeBold       // 'Manrope_700Bold'

// Secondary fonts
FontFamily.interBold         // 'Inter_700Bold'
FontFamily.sFProText         // 'SF Pro Text'
FontFamily.robotoMedium      // 'Roboto_500Medium'
FontFamily.russoOneRegular   // 'RussoOne_400Regular'
```

## Benefits

- **Maintains Typography**: Keeps all other typography properties (size, weight, line height)
- **Flexible**: Allows font family override without losing design system consistency
- **Type Safe**: Uses predefined font family constants
- **Theme Aware**: Works with the existing theme system
