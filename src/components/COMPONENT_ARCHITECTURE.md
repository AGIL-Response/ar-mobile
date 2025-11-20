# Component Architecture Documentation

## Overview

This document outlines the base component structure created for the design system. All components follow consistent patterns for theme integration, accessibility, and reusability.

## Base Component Structure

### Core Files

1. **`types.ts`** - TypeScript interfaces and types for all components
2. **`base-component.tsx`** - Utility functions and HOCs for theme integration
3. **`text.tsx`** - Typography component with variants
4. **`button.tsx`** - Button component with states and variants
5. **`view.tsx`** - Container component with layout utilities
6. **`index.tsx`** - Central export point

### Component Patterns

#### 1. Theme Integration

All components use the `useThemedStyles` hook for consistent theming:

```typescript
const styles = useThemedStyles(createComponentStyles, props);
```

#### 2. Accessibility

Components include standardized accessibility props:

```typescript
const accessibilityProps = createAccessibilityProps(props);
```

#### 3. Style Merging

User styles are merged with theme styles:

```typescript
const finalStyle = mergeStyles(themeStyles, userStyle);
```

#### 4. Variant System

Components support consistent variant patterns:

- **Visual variants**: `solid`, `outline`, `ghost`, `link`
- **Color variants**: `primary`, `secondary`, `success`, `warning`, `error`
- **Size variants**: `small`, `medium`, `large`

### Component Hierarchy

```
BaseComponentProps
├── BaseTextProps (extends BaseComponentProps)
├── BasePressableProps (extends BaseComponentProps + DisableableProps)
└── BaseContainerProps (extends BaseComponentProps)
```

## Components Created

### Text Component

- **Base**: `Text` with typography variants
- **Shortcuts**: `Heading1`, `Heading2`, `Heading3`, `BodyText`, `Caption`, `Label`
- **Semantic**: `ErrorText`, `SuccessText`, `WarningText`, `MutedText`

### Button Component

- **Base**: `Button` with full customization
- **Variants**: `PrimaryButton`, `SecondaryButton`, `OutlineButton`, `GhostButton`, `LinkButton`
- **Semantic**: `SuccessButton`, `WarningButton`, `ErrorButton`

### View Component

- **Base**: `View` with layout utilities
- **Layout**: `Row`, `Column`, `Center`, `Container`
- **Semantic**: `Card`, `Surface`, `Screen`

## Usage Examples

### Basic Usage

```tsx
import { Text, Button, View } from '@/components/ui';

<View gap="medium" padding="large">
  <Text variant="h1">Welcome</Text>
  <Button title="Get Started" onPress={handlePress} />
</View>;
```

### Advanced Usage

```tsx
import { Card, Heading2, PrimaryButton, Row } from '@/components/ui';

<Card>
  <Row justify="space-between" align="center">
    <Heading2>Title</Heading2>
    <PrimaryButton title="Action" size="small" />
  </Row>
</Card>;
```

## Utility Functions

### Style Creators

- `createTextStyles()` - Typography styling
- `createContainerStyles()` - Layout styling
- `createBorderStyles()` - Border styling
- `createSizeStyles()` - Component sizing

### Interaction Helpers

- `useInteractionState()` - Manages press/focus states
- `createVariantResolver()` - Handles variant selection
- `withTheme()` - HOC for theme integration

## Migration Notes

### From Nativewind

Components no longer use `className` props. Instead use:

- Theme-aware style props (`variant`, `size`, `color`)
- Direct style overrides (`style` prop)
- Layout utilities (`gap`, `padding`, `margin`)

### Legacy Support

The system maintains compatibility with existing patterns while providing a migration path to the new theme-aware components.

## Next Steps

1. **Complete remaining core components** (Input, Modal, etc.)
2. **Create compound components** (Form, Card variants, etc.)
3. **Add animations and transitions**
4. **Optimize performance** with memoization
5. **Add comprehensive testing**

## TypeScript Support

All components are fully typed with:

- Proper prop interfaces
- Generic support for customization
- Theme-aware typing
- Strict accessibility requirements

This foundation provides a solid base for building a comprehensive, maintainable component library.
