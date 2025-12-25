# 🎨 Icons System

This folder contains the centralized icon management system for the AR Mobile app.

## 📁 Structure

```
assets/icons/
├── index.ts          # Central icon registry
├── README.md         # This documentation
├── *.svg            # SVG source files (for reference)
└── (future folders)  # Organized icon categories
```

## 🔧 How to Use

### Using the Icon Component with Constants

```tsx
import { Icon, iconNames } from '@/components';

// Using constants (recommended)
<Icon name={iconNames.home} size={24} color="#000" />

// With custom size
<Icon name={iconNames.user} size={32} color="blue" />

// With all SvgProps
<Icon 
  name={iconNames.message_square} 
  size={20} 
  color="red"
  style={{ marginRight: 8 }}
/>
```

### Using Raw String Names (not recommended)

```tsx
import { Icon } from '@/components';

// Direct string usage (avoid this)
<Icon name="home" size={24} color="#000" />
```

### Using Icons Directly

```tsx
import icons from '@/assets/icons';

// Get icon component
const HomeIcon = icons.home;

// Render with custom props
<HomeIcon width={24} height={24} color="#333" />
```

### TypeScript Support

```tsx
import type { IconName } from '@/assets/icons';
import { iconNames } from '@/components';

// Type-safe icon name using constants
const iconName: IconName = iconNames.home; // ✅ Valid
const invalidIcon: IconName = 'unknown'; // ❌ TypeScript error

// In component props
interface ButtonProps {
  icon?: IconName;
}
```

## ➕ Adding New Icons

### Step 1: Create/Get SVG File

Save your SVG file in this folder for reference:
```
assets/icons/new-icon.svg
```

### Step 2: Create React Component

Create the component in `src/components/icons/`:

```tsx
// src/components/icons/new-icon.tsx
import * as React from 'react';
import type { SvgProps } from 'react-native-svg';
import Svg, { Path } from 'react-native-svg';

export function NewIcon({ color = '#000', ...props }: SvgProps) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="your-svg-path-here"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
```

### Step 3: Export from Icons Index

```tsx
// src/components/icons/index.tsx
export * from './new-icon';
```

### Step 3: Add to Icon Registry

```tsx
// assets/icons/index.ts
import NewIcon from './new-icon.svg';

// Add to iconNames object
export const iconNames = {
  // existing icons...
  new_icon: 'newIcon', // snake_case key, camelCase value
} as const;

// Add to icons object
const icons = {
  // existing icons...
  [iconNames.new_icon]: NewIcon,
} as const;
```

## 🏗️ Current Icons

| Constant | Icon Name | SVG File | Usage |
|----------|-----------|----------|-------|
| `iconNames.home` | `home` | `home.svg` | Tab bar home |
| `iconNames.list` | `list` | `list.svg` | Tab bar tasks |
| `iconNames.message_square` | `messageSquare` | `message-square.svg` | Tab bar chat |
| `iconNames.user` | `user` | `user.svg` | Tab bar profile |

## ✨ Benefits

- **Centralized Management**: All icons in one place
- **Type Safety**: TypeScript support for icon names
- **Consistent API**: Same interface as images system
- **Easy Updates**: Change icons without touching components
- **Performance**: Tree shaking and optimal bundling
- **Flexibility**: Support for all react-native-svg props

## 🔄 Migration from Old System

**Before:**
```tsx
import { Home } from '@/components/icons';
<Home width={24} height={24} color="red" />
```

**After:**
```tsx
import { Icon, iconNames } from '@/components';
<Icon name={iconNames.home} size={24} color="red" />
```

## 🎯 Key Improvements

- **No Hardcoded Strings**: Use `iconNames.home` instead of `"home"`
- **Snake Case Keys**: Use `iconNames.message_square` for better readability
- **SVG File Based**: Icons are now loaded directly from SVG files
- **Better Performance**: Direct SVG imports are more efficient
- **Easier Maintenance**: Add new icons by just adding SVG files
- **Type Safety**: Constants prevent typos and provide autocomplete

## 📝 SVG Files

The `.svg` files in this folder are for:
- Reference and documentation
- Design handoff
- Future SVG-to-component generation scripts
- Backup of original assets

They are **not** directly imported in React Native (which requires component transformation).
