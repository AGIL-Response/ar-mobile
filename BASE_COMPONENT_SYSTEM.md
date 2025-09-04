# Base Component System

## 🎯 Fixed TypeScript Issues & Best Practices

This document explains the improvements made to prevent recurring TypeScript issues in our design system components.

## ❌ Previous Issues

### 1. FontWeight Property Conflicts

**Problem**: FontWeight was being specified multiple times when spreading typography styles:

```typescript
// ❌ BAD - fontWeight conflict
return {
  fontWeight: '600',
  ...theme.typography.button, // This also has fontWeight!
};
```

### 2. Interface Type Mismatches

**Problem**: Style creators expected full prop interfaces but received partial objects:

```typescript
// ❌ BAD - expects full TabBarProps but gets partial object
const createTabBarStyles = (theme: Theme, props: TabBarProps) => { ... }

useThemedStyles(createTabBarStyles, { variant: 'pills' }); // ❌ Missing required props
```

## ✅ Solutions Implemented

### 1. Typography Merging Utility

**NEW**: `mergeTypographyStyles()` function handles fontWeight conflicts safely:

```typescript
// ✅ GOOD - No conflicts
const createTabTextStyles = createStyleCreator<TabItemProps>((theme, props) => {
  const baseTypography = theme.typography.label;

  return mergeTypographyStyles(baseTypography, {
    color: getTextColor(),
    fontWeight: active ? '600' : '400', // Safe override
  });
});
```

### 2. Type-Safe Style Creators

**NEW**: `createStyleCreator<T>()` utility for proper type inference:

```typescript
// ✅ GOOD - Automatically handles partial props
const createTabBarStyles = createStyleCreator<TabBarProps>((theme, props) => {
  const { variant = 'default', size = 'medium' } = props; // ✅ All optional
  // ... style logic
});

// ✅ Usage - TypeScript is happy
useThemedStyles(createTabBarStyles, { variant: 'pills' });
```

### 3. Cleaner Base Component Exports

**IMPROVED**: Only export functions that are actually used:

```typescript
// ✅ GOOD - Minimal, focused exports
export {
  useThemedStyles,
  createStyleCreator,
  mergeStyles,
  mergeTypographyStyles,
  createAccessibilityProps,
  createTextStyles,
} from './base-component';
```

## 📋 Usage Patterns for New Components

### ✅ Recommended Pattern

```typescript
import {
  createStyleCreator,
  mergeTypographyStyles,
  useThemedStyles,
} from '@/components/base-component';

// 1. Create type-safe style creators
const createComponentStyles = createStyleCreator<MyComponentProps>((theme, props) => {
  const { variant = 'default', size = 'medium' } = props;
  // ... return styles
});

const createTextStyles = createStyleCreator<MyComponentProps>((theme, props) => {
  const baseTypography = theme.typography.body;

  return mergeTypographyStyles(baseTypography, {
    color: props.active ? theme.colors.primary : theme.colors.text.secondary,
    fontWeight: props.active ? '600' : '400',
  });
});

// 2. Use in component
export const MyComponent = ({ variant, size, active, ...props }) => {
  const componentStyles = useThemedStyles(createComponentStyles, { variant, size });
  const textStyles = useThemedStyles(createTextStyles, { active });

  return (
    <View style={componentStyles}>
      <Text style={textStyles}>Content</Text>
    </View>
  );
};
```

## 🚫 Anti-Patterns to Avoid

### ❌ Don't manually pick props

```typescript
// ❌ BAD - Manual prop picking is error-prone
const createStyles = (theme: Theme, props: Pick<Props, 'variant' | 'size'>) => { ... }
```

### ❌ Don't spread typography then override fontWeight

```typescript
// ❌ BAD - fontWeight conflicts
return {
  fontWeight: '600',
  ...theme.typography.button, // This overwrites fontWeight!
};
```

### ❌ Don't pass incomplete objects to style creators

```typescript
// ❌ BAD - Incomplete prop object
useThemedStyles(createFullPropsStyler, { variant }); // Missing required props
```

## 🎯 Benefits

✅ **No More FontWeight Conflicts** - `mergeTypographyStyles()` handles safely  
✅ **No More Type Mismatches** - `createStyleCreator<T>()` handles partial props automatically  
✅ **Better Developer Experience** - Clear errors, proper IntelliSense  
✅ **Consistent Patterns** - All components follow same structure  
✅ **Future-Proof** - TypeScript will catch issues early

## 📚 Key Functions Reference

### `createStyleCreator<TProps>(styleFunction)`

- Creates type-safe style creator that accepts partial props
- Automatically handles optional properties with defaults
- Provides proper TypeScript inference

### `mergeTypographyStyles(baseTypography, overrides)`

- Safely merges typography styles without conflicts
- Handles fontWeight precedence correctly
- Ensures clean style object output

### `useThemedStyles(styleCreator, props)`

- Hook for using style creators in components
- Memoizes style objects for performance
- Works with both old and new style creator patterns

## 🎉 Result

All layout components now have:

- ✅ Zero TypeScript errors
- ✅ Clean, maintainable code
- ✅ Consistent patterns across components
- ✅ Future-proof architecture

This system prevents the recurring issues we faced and provides a solid foundation for all future components!
