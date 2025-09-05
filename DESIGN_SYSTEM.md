# Design System Documentation

This document outlines the comprehensive design system for the AR Mobile application, including typography, colors, spacing, and component specifications.

## Table of Contents

- [Typography](#typography)
- [Colors](#colors)
- [Spacing](#spacing)
- [Border Radius](#border-radius)
- [Shadows & Elevation](#shadows--elevation)
- [Component Specifications](#component-specifications)
- [Usage Guidelines](#usage-guidelines)

---

## Typography

### Font Families

Our design system uses **Manrope** as the primary font family with **Inter** as a secondary option.

```typescript
FontFamily = {
  // Primary fonts (Manrope)
  manropeRegular: 'Manrope_400Regular',
  manropeMedium: 'Manrope_500Medium', 
  manropeSemiBold: 'Manrope_600SemiBold',
  manropeBold: 'Manrope_700Bold',

  // Secondary fonts
  interBold: 'Inter_700Bold',
  sFProText: 'SF Pro Text', // iOS system font fallback
  robotoMedium: 'Roboto_500Medium',
  russoOneRegular: 'RussoOne_400Regular',
}
```

### Text Variants

Use these predefined text variants instead of hardcoding font properties:

#### Headings
```typescript
// Large headings
<Text variant="h1">Main Page Title</Text>        // 28px, Bold, 36px line height
<Text variant="h2">Section Title</Text>          // 22px, Bold, 24px line height
<Text variant="h3">Subsection Title</Text>       // 20px, SemiBold, 22px line height
<Text variant="h4">Card Title</Text>             // 18px, SemiBold, 18px line height
```

#### Body Text
```typescript
// Regular content
<Text variant="body">Main content text</Text>           // 16px, Regular, 20px line height
<Text variant="bodyMedium">Secondary content</Text>     // 14px, Regular, 18px line height
<Text variant="bodySmall">Small content</Text>          // 12px, Regular, 16px line height
```

#### UI Elements
```typescript
// Labels and UI text
<Text variant="label">Form labels</Text>         // 14px, Medium, 18px line height
<Text variant="caption">Captions & metadata</Text> // 12px, Regular, 16px line height
<Text variant="overline">Small labels</Text>     // 10px, Medium, 12px line height
```

#### Interactive Elements
```typescript
// Buttons and links
<Text variant="button">Button text</Text>        // 16px, SemiBold, 20px line height
<Text variant="link">Link text</Text>            // 14px, Medium, 18px line height
```

#### Font Family Override

You can override the font family for any text variant using the `font` prop:

```typescript
import { FontFamily } from '@/theme';

// Override font family while keeping variant styling
<Text variant="h1" font={FontFamily.interBold}>Title with Inter Bold</Text>
<Text variant="body" font={FontFamily.manropeMedium}>Body with Manrope Medium</Text>
<Text variant="caption" font={FontFamily.russoOneRegular}>Caption with Russo One</Text>

// Available font families
FontFamily.manropeRegular    // 'Manrope_400Regular'
FontFamily.manropeMedium     // 'Manrope_500Medium'
FontFamily.manropeSemiBold   // 'Manrope_600SemiBold'
FontFamily.manropeBold       // 'Manrope_700Bold'
FontFamily.interBold         // 'Inter_700Bold'
FontFamily.sFProText         // 'SF Pro Text'
FontFamily.robotoMedium      // 'Roboto_500Medium'
FontFamily.russoOneRegular   // 'RussoOne_400Regular'
```

### Semantic Text Components

For common use cases, use these semantic components:

```typescript
import { ErrorText, SuccessText, WarningText, MutedText } from '@/components';

<ErrorText>Error message</ErrorText>      // Red error text
<SuccessText>Success message</SuccessText> // Green success text  
<WarningText>Warning message</WarningText> // Orange warning text
<MutedText>Secondary information</MutedText> // Muted secondary text
```

---

## Colors

### Primary Colors

```typescript
// Brand colors
primary: '#1068eb'           // Royal blue - main brand color
primaryLight: '#e8f0fd'      // Light blue variant
```

### Background Colors

```typescript
// Background hierarchy
background: {
  primary: '#101213' | '#ffffff',    // Main background (dark/light)
  secondary: '#1e1e1e' | '#fafafa',  // Secondary background
  tertiary: '#272b30' | '#f5f5f5',   // Tertiary background
  overlay: 'rgba(163, 163, 163, 0.05)' | 'rgba(0, 0, 0, 0.05)',
}
```

### Text Colors

```typescript
// Text hierarchy
text: {
  primary: '#ffffff' | '#101213',     // Main text (light/dark)
  secondary: '#dee2e6' | '#616161',   // Secondary text
  muted: '#adb5bd' | '#757575',       // Muted text
  disabled: '#6a7178' | '#9e9e9e',    // Disabled text
  placeholder: '#4f575e' | '#9e9e9e', // Placeholder text
  inverse: '#101213' | '#ffffff',     // Inverse text
  accent: '#1068eb',                  // Accent/highlighted text
}
```

### Surface Colors

```typescript
// Surface elements (cards, inputs, etc.)
surface: {
  card: '#1e1e1e' | '#ffffff',        // Card backgrounds
  input: '#101213' | '#ffffff',       // Input backgrounds
  border: '#272b30' | '#e0e0e0',      // Borders
  divider: '#4f575e' | '#e0e0e0',     // Dividers
  disabled: '#383838' | '#f5f5f5',    // Disabled surfaces
}
```

### Status Colors

```typescript
// Status indicators
status: {
  success: '#37b24d',                 // Success state
  successAlt: '#1ce783',              // Alternative success (status indicators)
  warning: '#f59f00',                 // Warning state
  warningAlt: '#f76707',              // Alternative warning
  error: '#c92a2a',                   // Error state
  errorAlt: '#dc2020',                // Alternative error
}

// Semantic colors (same across themes)
semantic: {
  success: '#10b981',                 // Semantic success
  warning: '#f59e0b',                 // Semantic warning
  error: '#ef4444',                   // Semantic error
  errorBackground: 'rgba(239, 68, 68, 0.1)',
  errorBorder: 'rgba(239, 68, 68, 0.2)',
}
```

### Interactive Colors

```typescript
// Interactive states
interactive: {
  hover: '#0f5bd1',                   // Hover state
  pressed: '#0d4fb5',                 // Pressed state
  disabled: '#949494' | '#9e9e9e',    // Disabled state
}
```

### Complete Color Palette

Here's the complete color palette available in the design system with visual color swatches:

#### Visual Color Swatches

**Primary Brand Colors**
- <span style="background-color: #1068eb; color: white; padding: 4px 8px; border-radius: 4px; margin-right: 8px;">#1068eb</span> Primary Blue
- <span style="background-color: #e8f0fd; color: #1068eb; padding: 4px 8px; border-radius: 4px; margin-right: 8px; border: 1px solid #ddd;">#e8f0fd</span> Primary Light

**Gray Scale**
- <span style="background-color: #fafafa; color: #333; padding: 4px 8px; border-radius: 4px; margin-right: 8px; border: 1px solid #ddd;">#fafafa</span> Gray 50
- <span style="background-color: #f5f5f5; color: #333; padding: 4px 8px; border-radius: 4px; margin-right: 8px; border: 1px solid #ddd;">#f5f5f5</span> Gray 100
- <span style="background-color: #eeeeee; color: #333; padding: 4px 8px; border-radius: 4px; margin-right: 8px; border: 1px solid #ddd;">#eeeeee</span> Gray 200
- <span style="background-color: #e0e0e0; color: #333; padding: 4px 8px; border-radius: 4px; margin-right: 8px; border: 1px solid #ddd;">#e0e0e0</span> Gray 300
- <span style="background-color: #bdbdbd; color: #333; padding: 4px 8px; border-radius: 4px; margin-right: 8px; border: 1px solid #ddd;">#bdbdbd</span> Gray 400
- <span style="background-color: #9e9e9e; color: white; padding: 4px 8px; border-radius: 4px; margin-right: 8px;">#9e9e9e</span> Gray 500
- <span style="background-color: #757575; color: white; padding: 4px 8px; border-radius: 4px; margin-right: 8px;">#757575</span> Gray 600
- <span style="background-color: #616161; color: white; padding: 4px 8px; border-radius: 4px; margin-right: 8px;">#616161</span> Gray 700
- <span style="background-color: #424242; color: white; padding: 4px 8px; border-radius: 4px; margin-right: 8px;">#424242</span> Gray 800
- <span style="background-color: #212121; color: white; padding: 4px 8px; border-radius: 4px; margin-right: 8px;">#212121</span> Gray 900

**Dark Theme Charcoal Scale**
- <span style="background-color: #f2f2f2; color: #333; padding: 4px 8px; border-radius: 4px; margin-right: 8px; border: 1px solid #ddd;">#f2f2f2</span> Charcoal 50
- <span style="background-color: #e5e5e5; color: #333; padding: 4px 8px; border-radius: 4px; margin-right: 8px; border: 1px solid #ddd;">#e5e5e5</span> Charcoal 100
- <span style="background-color: #c9c9c9; color: #333; padding: 4px 8px; border-radius: 4px; margin-right: 8px; border: 1px solid #ddd;">#c9c9c9</span> Charcoal 200
- <span style="background-color: #b0b0b0; color: #333; padding: 4px 8px; border-radius: 4px; margin-right: 8px; border: 1px solid #ddd;">#b0b0b0</span> Charcoal 300
- <span style="background-color: #969696; color: #333; padding: 4px 8px; border-radius: 4px; margin-right: 8px; border: 1px solid #ddd;">#969696</span> Charcoal 400
- <span style="background-color: #7d7d7d; color: white; padding: 4px 8px; border-radius: 4px; margin-right: 8px;">#7d7d7d</span> Charcoal 500
- <span style="background-color: #616161; color: white; padding: 4px 8px; border-radius: 4px; margin-right: 8px;">#616161</span> Charcoal 600
- <span style="background-color: #474747; color: white; padding: 4px 8px; border-radius: 4px; margin-right: 8px;">#474747</span> Charcoal 700
- <span style="background-color: #383838; color: white; padding: 4px 8px; border-radius: 4px; margin-right: 8px;">#383838</span> Charcoal 800
- <span style="background-color: #2e2e2e; color: white; padding: 4px 8px; border-radius: 4px; margin-right: 8px;">#2e2e2e</span> Charcoal 850
- <span style="background-color: #1e1e1e; color: white; padding: 4px 8px; border-radius: 4px; margin-right: 8px;">#1e1e1e</span> Charcoal 900
- <span style="background-color: #101213; color: white; padding: 4px 8px; border-radius: 4px; margin-right: 8px;">#101213</span> Charcoal 950

**Status Colors**
- <span style="background-color: #37b24d; color: white; padding: 4px 8px; border-radius: 4px; margin-right: 8px;">#37b24d</span> Success
- <span style="background-color: #1ce783; color: #000; padding: 4px 8px; border-radius: 4px; margin-right: 8px;">#1ce783</span> Success Alt
- <span style="background-color: #f59f00; color: white; padding: 4px 8px; border-radius: 4px; margin-right: 8px;">#f59f00</span> Warning
- <span style="background-color: #f76707; color: white; padding: 4px 8px; border-radius: 4px; margin-right: 8px;">#f76707</span> Warning Alt
- <span style="background-color: #c92a2a; color: white; padding: 4px 8px; border-radius: 4px; margin-right: 8px;">#c92a2a</span> Error
- <span style="background-color: #dc2020; color: white; padding: 4px 8px; border-radius: 4px; margin-right: 8px;">#dc2020</span> Error Alt

**Semantic Colors**
- <span style="background-color: #10b981; color: white; padding: 4px 8px; border-radius: 4px; margin-right: 8px;">#10b981</span> Semantic Success
- <span style="background-color: #f59e0b; color: white; padding: 4px 8px; border-radius: 4px; margin-right: 8px;">#f59e0b</span> Semantic Warning
- <span style="background-color: #ef4444; color: white; padding: 4px 8px; border-radius: 4px; margin-right: 8px;">#ef4444</span> Semantic Error

**Additional Design Colors**
- <span style="background-color: #dee2e6; color: #333; padding: 4px 8px; border-radius: 4px; margin-right: 8px; border: 1px solid #ddd;">#dee2e6</span> Gainsboro
- <span style="background-color: #ced4da; color: #333; padding: 4px 8px; border-radius: 4px; margin-right: 8px; border: 1px solid #ddd;">#ced4da</span> Light Gray
- <span style="background-color: #adb5bd; color: #333; padding: 4px 8px; border-radius: 4px; margin-right: 8px; border: 1px solid #ddd;">#adb5bd</span> Dark Gray
- <span style="background-color: #6a7178; color: white; padding: 4px 8px; border-radius: 4px; margin-right: 8px;">#6a7178</span> Medium Gray
- <span style="background-color: #4f575e; color: white; padding: 4px 8px; border-radius: 4px; margin-right: 8px;">#4f575e</span> Dim Gray
- <span style="background-color: #49454f; color: white; padding: 4px 8px; border-radius: 4px; margin-right: 8px;">#49454f</span> Dark Slate Gray
- <span style="background-color: #f8f9fa; color: #333; padding: 4px 8px; border-radius: 4px; margin-right: 8px; border: 1px solid #ddd;">#f8f9fa</span> White Smoke
- <span style="background-color: #e8f0fd; color: #1068eb; padding: 4px 8px; border-radius: 4px; margin-right: 8px; border: 1px solid #ddd;">#e8f0fd</span> Alice Blue

**Interactive Colors**
- <span style="background-color: #0f5bd1; color: white; padding: 4px 8px; border-radius: 4px; margin-right: 8px;">#0f5bd1</span> Hover
- <span style="background-color: #0d4fb5; color: white; padding: 4px 8px; border-radius: 4px; margin-right: 8px;">#0d4fb5</span> Pressed
- <span style="background-color: #949494; color: white; padding: 4px 8px; border-radius: 4px; margin-right: 8px;">#949494</span> Disabled (Dark)
- <span style="background-color: #9e9e9e; color: white; padding: 4px 8px; border-radius: 4px; margin-right: 8px;">#9e9e9e</span> Disabled (Light)

#### Theme-Specific Color Variations

**Background Colors (Dark vs Light Theme)**
- <span style="background-color: #101213; color: white; padding: 4px 8px; border-radius: 4px; margin-right: 8px;">#101213</span> Primary (Dark) | <span style="background-color: #ffffff; color: #333; padding: 4px 8px; border-radius: 4px; margin-right: 8px; border: 1px solid #ddd;">#ffffff</span> Primary (Light)
- <span style="background-color: #1e1e1e; color: white; padding: 4px 8px; border-radius: 4px; margin-right: 8px;">#1e1e1e</span> Secondary (Dark) | <span style="background-color: #fafafa; color: #333; padding: 4px 8px; border-radius: 4px; margin-right: 8px; border: 1px solid #ddd;">#fafafa</span> Secondary (Light)
- <span style="background-color: #272b30; color: white; padding: 4px 8px; border-radius: 4px; margin-right: 8px;">#272b30</span> Tertiary (Dark) | <span style="background-color: #f5f5f5; color: #333; padding: 4px 8px; border-radius: 4px; margin-right: 8px; border: 1px solid #ddd;">#f5f5f5</span> Tertiary (Light)

**Text Colors (Dark vs Light Theme)**
- <span style="background-color: #ffffff; color: #101213; padding: 4px 8px; border-radius: 4px; margin-right: 8px; border: 1px solid #ddd;">#ffffff</span> Primary (Dark) | <span style="background-color: #101213; color: white; padding: 4px 8px; border-radius: 4px; margin-right: 8px;">#101213</span> Primary (Light)
- <span style="background-color: #dee2e6; color: #333; padding: 4px 8px; border-radius: 4px; margin-right: 8px; border: 1px solid #ddd;">#dee2e6</span> Secondary (Dark) | <span style="background-color: #616161; color: white; padding: 4px 8px; border-radius: 4px; margin-right: 8px;">#616161</span> Secondary (Light)
- <span style="background-color: #adb5bd; color: #333; padding: 4px 8px; border-radius: 4px; margin-right: 8px; border: 1px solid #ddd;">#adb5bd</span> Muted (Dark) | <span style="background-color: #757575; color: white; padding: 4px 8px; border-radius: 4px; margin-right: 8px;">#757575</span> Muted (Light)
- <span style="background-color: #6a7178; color: white; padding: 4px 8px; border-radius: 4px; margin-right: 8px;">#6a7178</span> Disabled (Dark) | <span style="background-color: #9e9e9e; color: white; padding: 4px 8px; border-radius: 4px; margin-right: 8px;">#9e9e9e</span> Disabled (Light)
- <span style="background-color: #4f575e; color: white; padding: 4px 8px; border-radius: 4px; margin-right: 8px;">#4f575e</span> Placeholder (Dark) | <span style="background-color: #9e9e9e; color: white; padding: 4px 8px; border-radius: 4px; margin-right: 8px;">#9e9e9e</span> Placeholder (Light)

**Surface Colors (Dark vs Light Theme)**
- <span style="background-color: #1e1e1e; color: white; padding: 4px 8px; border-radius: 4px; margin-right: 8px;">#1e1e1e</span> Card (Dark) | <span style="background-color: #ffffff; color: #333; padding: 4px 8px; border-radius: 4px; margin-right: 8px; border: 1px solid #ddd;">#ffffff</span> Card (Light)
- <span style="background-color: #101213; color: white; padding: 4px 8px; border-radius: 4px; margin-right: 8px;">#101213</span> Input (Dark) | <span style="background-color: #ffffff; color: #333; padding: 4px 8px; border-radius: 4px; margin-right: 8px; border: 1px solid #ddd;">#ffffff</span> Input (Light)
- <span style="background-color: #272b30; color: white; padding: 4px 8px; border-radius: 4px; margin-right: 8px;">#272b30</span> Border (Dark) | <span style="background-color: #e0e0e0; color: #333; padding: 4px 8px; border-radius: 4px; margin-right: 8px; border: 1px solid #ddd;">#e0e0e0</span> Border (Light)
- <span style="background-color: #4f575e; color: white; padding: 4px 8px; border-radius: 4px; margin-right: 8px;">#4f575e</span> Divider (Dark) | <span style="background-color: #e0e0e0; color: #333; padding: 4px 8px; border-radius: 4px; margin-right: 8px; border: 1px solid #ddd;">#e0e0e0</span> Divider (Light)
- <span style="background-color: #383838; color: white; padding: 4px 8px; border-radius: 4px; margin-right: 8px;">#383838</span> Disabled (Dark) | <span style="background-color: #f5f5f5; color: #333; padding: 4px 8px; border-radius: 4px; margin-right: 8px; border: 1px solid #ddd;">#f5f5f5</span> Disabled (Light)

**Utility Colors (Dark vs Light Theme)**
- <span style="background-color: #ced4da; color: #333; padding: 4px 8px; border-radius: 4px; margin-right: 8px; border: 1px solid #ddd;">#ced4da</span> Light Gray (Dark) | <span style="background-color: #e0e0e0; color: #333; padding: 4px 8px; border-radius: 4px; margin-right: 8px; border: 1px solid #ddd;">#e0e0e0</span> Light Gray (Light)
- <span style="background-color: #6a7178; color: white; padding: 4px 8px; border-radius: 4px; margin-right: 8px;">#6a7178</span> Medium Gray (Dark) | <span style="background-color: #757575; color: white; padding: 4px 8px; border-radius: 4px; margin-right: 8px;">#757575</span> Medium Gray (Light)
- <span style="background-color: #49454f; color: white; padding: 4px 8px; border-radius: 4px; margin-right: 8px;">#49454f</span> Dark Gray (Dark) | <span style="background-color: #616161; color: white; padding: 4px 8px; border-radius: 4px; margin-right: 8px;">#616161</span> Dark Gray (Light)

#### Raw Palette Colors
```typescript
Palette = {
  // Primary brand colors
  primary: '#1068eb',                 // Royal blue
  primaryLight: '#e8f0fd',            // Light blue variant

  // Grays for dark theme
  gray50: '#fafafa',
  gray100: '#f5f5f5',
  gray200: '#eeeeee',
  gray300: '#e0e0e0',
  gray400: '#bdbdbd',
  gray500: '#9e9e9e',
  gray600: '#757575',
  gray700: '#616161',
  gray800: '#424242',
  gray900: '#212121',

  // Dark theme specific grays
  charcoal50: '#f2f2f2',
  charcoal100: '#e5e5e5',
  charcoal200: '#c9c9c9',
  charcoal300: '#b0b0b0',
  charcoal400: '#969696',
  charcoal500: '#7d7d7d',
  charcoal600: '#616161',
  charcoal700: '#474747',
  charcoal800: '#383838',
  charcoal850: '#2e2e2e',
  charcoal900: '#1e1e1e',
  charcoal950: '#101213',             // Main dark background

  // Status colors
  success: '#37b24d',
  successAlt: '#1ce783',
  mediumSpringGreen: '#1ce783',       // Figma design status indicator
  warning: '#f59f00',
  warningAlt: '#f76707',
  error: '#c92a2a',
  errorAlt: '#dc2020',

  // Semantic
  white: '#ffffff',
  black: '#000000',
  transparent: 'rgba(0, 0, 0, 0)',

  // Additional colors from designs
  gainsboro: '#dee2e6',
  lightGray: '#ced4da', 
  lightGrayOpacity: 'rgba(209, 209, 209, 0.05)', // Figma design avatar background
  darkGray: '#adb5bd',
  mediumGray: '#6a7178',
  dimGray: '#4f575e',
  darkSlateGray: '#49454f',
  whiteSmoke: '#f8f9fa',
  aliceBlue: '#e8f0fd',
}
```

#### Utility Colors
```typescript
// Additional utility colors
utility: {
  lightGray: '#ced4da' | '#e0e0e0',        // Dark/Light theme
  mediumGray: '#6a7178' | '#757575',       // Dark/Light theme
  darkGray: '#49454f' | '#616161',         // Dark/Light theme
  whitesmoke: '#f8f9fa',
  gainsboro: '#dee2e6',
  aliceblue: '#e8f0fd',
  overlay: 'rgba(209, 209, 209, 0.05)' | 'rgba(0, 0, 0, 0.1)', // Dark/Light theme
}
```

#### Color Usage Examples
```typescript
// Theme-aware color usage
const theme = useTheme();

// Background colors
backgroundColor: theme.colors.background.primary    // Main background
backgroundColor: theme.colors.background.secondary  // Secondary background
backgroundColor: theme.colors.background.tertiary   // Tertiary background

// Text colors
color: theme.colors.text.primary      // Main text
color: theme.colors.text.secondary    // Secondary text
color: theme.colors.text.muted        // Muted text
color: theme.colors.text.disabled     // Disabled text
color: theme.colors.text.placeholder  // Placeholder text
color: theme.colors.text.inverse      // Inverse text
color: theme.colors.text.accent       // Accent text

// Surface colors
backgroundColor: theme.colors.surface.card      // Card backgrounds
backgroundColor: theme.colors.surface.input     // Input backgrounds
borderColor: theme.colors.surface.border        // Borders
borderColor: theme.colors.surface.divider       // Dividers
backgroundColor: theme.colors.surface.disabled  // Disabled surfaces

// Status colors
color: theme.colors.status.success              // Success state
color: theme.colors.status.successAlt           // Alternative success
color: theme.colors.status.warning              // Warning state
color: theme.colors.status.warningAlt           // Alternative warning
color: theme.colors.status.error                // Error state
color: theme.colors.status.errorAlt             // Alternative error

// Semantic colors
color: theme.colors.semantic.success            // Semantic success
color: theme.colors.semantic.warning            // Semantic warning
color: theme.colors.semantic.error              // Semantic error
backgroundColor: theme.colors.semantic.errorBackground  // Error background
borderColor: theme.colors.semantic.errorBorder  // Error border

// Interactive colors
color: theme.colors.interactive.hover           // Hover state
color: theme.colors.interactive.pressed         // Pressed state
color: theme.colors.interactive.disabled        // Disabled state

// Primary colors
color: theme.colors.primary                     // Primary brand color
backgroundColor: theme.colors.primaryLight      // Light primary variant
```

#### Theme-Aware Color Usage Examples

**Background Colors**
```typescript
// These automatically adapt to dark/light theme
backgroundColor: theme.colors.background.primary    // #101213 (dark) | #ffffff (light)
backgroundColor: theme.colors.background.secondary  // #1e1e1e (dark) | #fafafa (light)
backgroundColor: theme.colors.background.tertiary   // #272b30 (dark) | #f5f5f5 (light)
```

**Text Colors**
```typescript
// Text colors automatically invert between themes
color: theme.colors.text.primary      // #ffffff (dark) | #101213 (light)
color: theme.colors.text.secondary    // #dee2e6 (dark) | #616161 (light)
color: theme.colors.text.muted        // #adb5bd (dark) | #757575 (light)
color: theme.colors.text.disabled     // #6a7178 (dark) | #9e9e9e (light)
color: theme.colors.text.placeholder  // #4f575e (dark) | #9e9e9e (light)
```

**Surface Colors**
```typescript
// Surface colors adapt to theme
backgroundColor: theme.colors.surface.card      // #1e1e1e (dark) | #ffffff (light)
backgroundColor: theme.colors.surface.input     // #101213 (dark) | #ffffff (light)
borderColor: theme.colors.surface.border        // #272b30 (dark) | #e0e0e0 (light)
borderColor: theme.colors.surface.divider       // #4f575e (dark) | #e0e0e0 (light)
backgroundColor: theme.colors.surface.disabled  // #383838 (dark) | #f5f5f5 (light)
```

**Complete Theme Example**
```typescript
import { useTheme } from '@/theme';
import { StyleSheet } from 'react-native';

function MyComponent() {
  const theme = useTheme();
  
  const styles = StyleSheet.create({
    container: {
      // Background adapts to theme
      backgroundColor: theme.colors.background.primary,    // Dark: #101213, Light: #ffffff
      padding: 16,
    },
    card: {
      // Surface colors adapt to theme
      backgroundColor: theme.colors.surface.card,          // Dark: #1e1e1e, Light: #ffffff
      borderColor: theme.colors.surface.border,            // Dark: #272b30, Light: #e0e0e0
      borderWidth: 1,
      borderRadius: 8,
      padding: 16,
    },
    title: {
      // Text colors automatically invert
      color: theme.colors.text.primary,                    // Dark: #ffffff, Light: #101213
      fontSize: 18,
      fontWeight: '600',
    },
    subtitle: {
      color: theme.colors.text.secondary,                  // Dark: #dee2e6, Light: #616161
      fontSize: 14,
    },
    button: {
      backgroundColor: theme.colors.primary,               // Always #1068eb
      color: theme.colors.text.inverse,                    // Dark: #101213, Light: #ffffff
    },
  });
  
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Title</Text>
        <Text style={styles.subtitle}>Subtitle</Text>
      </View>
    </View>
  );
}
```

**Theme Switching Behavior**
```typescript
// When theme changes from dark to light:
// - Background colors: Dark → Light
// - Text colors: Light → Dark  
// - Surface colors: Dark → Light
// - Border colors: Dark → Light
// - Primary colors: Stay the same (#1068eb)
// - Status colors: Stay the same
```

---

## Spacing

### Gap (Flexbox Gap)

```typescript
Gap = {
  none: 0,
  xs: 4,      // Small gaps
  sm: 6,      // Small-medium gaps
  md: 8,      // Medium gaps
  lg: 12,     // Large gaps
  xl: 16,     // Extra large gaps
  xxl: 32,    // Section gaps
  xxxl: 40,   // Screen section gaps
}
```

### Padding

```typescript
Padding = {
  none: 0,
  xs: 1,      // Badge padding
  sm: 4,      // Small elements
  md: 6,      // Badge horizontal
  lg: 8,      // Default spacing
  xl: 12,     // Card content
  xxl: 16,    // Main containers
  xxxl: 24,   // Large spacing
}
```

### Margin

```typescript
Margin = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
}
```

---

## Border Radius

```typescript
BorderRadius = {
  none: 0,
  xs: 1,      // Battery capacity
  sm: 3,      // Battery border
  md: 4,      // Small elements
  lg: 8,      // Cards, inputs
  xl: 10,     // Larger cards
  round: 64,  // Avatars
  full: 100,  // Badges, buttons, FAB
}
```

---

## Shadows & Elevation

```typescript
// Shadow presets
shadows: {
  none: { shadowColor: 'transparent', elevation: 0 },
  sm: { shadowOffset: { width: 0, height: 1 }, shadowRadius: 2, elevation: 2 },
  md: { shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 4 },
  lg: { shadowOffset: { width: 0, height: 4 }, shadowRadius: 8, elevation: 8 },
}
```

---

## Component Specifications

### Buttons

```typescript
button: {
  height: {
    small: 32,
    medium: 48,
    large: 56,
  },
  borderRadius: 8,
  padding: { horizontal: 16, vertical: 8 },
  minWidth: 104,
}
```

### Inputs

```typescript
input: {
  height: 48,
  borderRadius: 8,
  borderWidth: 1,
  padding: { horizontal: 16, vertical: 12 },
}
```

### Cards

```typescript
card: {
  borderRadius: 8,
  borderWidth: 1,
  padding: {
    small: 12,
    medium: 16,
    large: 18,
  },
  gap: 16,
}
```

### Avatars

```typescript
avatar: {
  size: {
    small: 32,
    medium: 48,
    large: 96,
    xl: 120,
  },
  borderRadius: 64,
  borderWidth: 1,
}
```

### Badges

```typescript
badge: {
  borderRadius: 100,
  padding: { horizontal: 6, vertical: 1 },
  minHeight: 24,
}
```

---

## Usage Guidelines

### ✅ Do's

1. **Use Text Variants**: Always use predefined text variants instead of hardcoding font properties
   ```typescript
   // ✅ Good
   <Text variant="h3" style={{ color: theme.colors.text.primary }}>Title</Text>
   
   // ❌ Bad
   <Text style={{ fontSize: 20, fontWeight: '600', color: '#ffffff' }}>Title</Text>
   ```

2. **Use Theme Colors**: Always reference colors from the theme system
   ```typescript
   // ✅ Good
   style={{ backgroundColor: theme.colors.surface.card }}
   
   // ❌ Bad
   style={{ backgroundColor: '#1e1e1e' }}
   ```

3. **Use StyleSheet.create()**: Always use StyleSheet for styling
   ```typescript
   // ✅ Good
   const styles = StyleSheet.create({
     container: { padding: 16 }
   });
   
   // ❌ Bad
   <View style={{ padding: 16 }}>
   ```

4. **Use Spacing Tokens**: Use predefined spacing values
   ```typescript
   // ✅ Good
   gap: theme.spacing.gap.lg  // 12px
   
   // ❌ Bad
   gap: 12
   ```

5. **Use Font Override**: Override font family when needed
   ```typescript
   // ✅ Good
   <Text variant="h1" font={FontFamily.interBold}>Title</Text>
   
   // ❌ Bad
   <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 28 }}>Title</Text>
   ```

### ❌ Don'ts

1. **No Tailwind/className**: This project doesn't use Tailwind CSS
   ```typescript
   // ❌ Bad
   <View className="flex-row items-center">
   ```

2. **No Inline Styles**: Avoid inline style objects
   ```typescript
   // ❌ Bad
   <View style={{ padding: 16, backgroundColor: '#fff' }}>
   ```

3. **No Hardcoded Colors**: Don't hardcode color values
   ```typescript
   // ❌ Bad
   color: '#1068eb'
   ```

4. **No Hardcoded Typography**: Don't hardcode font properties
   ```typescript
   // ❌ Bad
   fontSize: 16, fontWeight: '600'
   ```

### Theme Usage

```typescript
import { useTheme } from '@/theme';

function MyComponent() {
  const theme = useTheme();
  
  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background.primary,
      padding: theme.spacing.padding.xxl,
    },
    title: {
      color: theme.colors.text.primary,
    },
  });
  
  return (
    <View style={styles.container}>
      <Text variant="h3" style={styles.title}>Title</Text>
    </View>
  );
}
```

### Dark/Light Mode Support

The theme system automatically handles dark and light mode switching:

```typescript
// Colors automatically adapt to theme
theme.colors.background.primary  // '#101213' in dark, '#ffffff' in light
theme.colors.text.primary        // '#ffffff' in dark, '#101213' in light
```

---

## Migration Guide

When updating existing components:

1. Replace hardcoded colors with theme references
2. Replace hardcoded typography with text variants
3. Replace className props with StyleSheet styles
4. Replace inline styles with StyleSheet.create()
5. Use spacing tokens instead of magic numbers

This design system ensures consistency, maintainability, and proper theming support across the entire application.
