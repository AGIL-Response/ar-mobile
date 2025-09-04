# Screen Organization Pattern

## 🏗️ **Architecture Overview**

This document defines the **mandatory pattern** for organizing screens and features in this React Native/Expo project.

## 📁 **Directory Structure Pattern**

### **Global vs Screen-Specific Organization**

```
src/
├── api/              # Global API clients and endpoints
├── components/       # Global design system components
├── stores/          # GLOBAL stores only (auth, app-wide state)
├── theme/           # Global theme and design tokens
├── types/           # Global TypeScript types
├── lib/             # Global utilities, hooks, helpers
├── translations/    # Global i18n files
├── app/             # Expo Router navigation config ONLY
└── screens/         # All screen implementations
    └── {screen-name}/
        ├── components/    # Screen-specific components
        ├── hooks/        # Screen-specific hooks
        ├── stores/       # Screen-specific stores (if needed)
        ├── types/        # Screen-specific types (if needed)
        ├── utils/        # Screen-specific utilities (if needed)
        └── index.tsx     # Main screen component
```

## 🎯 **Key Principles**

### **1. Global vs Screen-Specific Separation**

**✅ Global (`src/stores/`):**

- Auth state (used across entire app)
- App configuration state
- Theme preferences
- Any state shared by multiple screens

**✅ Screen-Specific (`src/screens/{name}/stores/`):**

- Feature-specific state that only one screen uses
- Local form state management
- Screen-specific caching or temporary data

### **2. Navigation Structure**

**✅ `src/app/` - Navigation Config Only:**

```typescript
// src/app/profile.tsx
import ProfileScreen from '@/screens/profile';
export default ProfileScreen;
```

**✅ `src/screens/{name}/` - Full Implementation:**

```typescript
// src/screens/profile/index.tsx
import { ProfileForm, ProfileSettings } from './components';
import { useProfileData } from './hooks';
import { useProfileStore } from './stores'; // Screen-specific store

export default function ProfileScreen() {
  // Screen implementation here
}
```

## 📋 **Mandatory Pattern for New Screens**

### **Step 1: Create Screen Structure**

```bash
mkdir -p src/screens/{screen-name}/{components,hooks,stores,types,utils}
```

### **Step 2: Screen Component (`src/screens/{name}/index.tsx`)**

```typescript
import React from 'react';
import { View, StyleSheet } from 'react-native';

// Global UI components
import { Text, Button } from '@/components';
import { useTheme, type Theme } from '@/theme';

// Global stores (only if needed)
import useAuthStore from '@/stores/auth';

// Screen-specific imports
import { ScreenSpecificComponent } from './components';
import { useScreenLogic } from './hooks';
import { useScreenStore } from './stores'; // Only if screen needs local state

export default function ScreenNameScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);

  // Screen logic here

  return (
    <View style={styles.container}>
      {/* Screen content */}
    </View>
  );
}

const createStyles = (theme: Theme) => {
  const { colors, spacing } = theme;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.primary,
    },
  });
};
```

### **Step 3: Components (`src/screens/{name}/components/`)**

```typescript
// src/screens/{name}/components/index.ts
export { SpecificComponent } from './specific-component';
export { AnotherComponent } from './another-component';

// src/screens/{name}/components/specific-component.tsx
import React from 'react';
import { View } from 'react-native';
import { Text, Button } from '@/components'; // Use global UI components
import { useTheme } from '@/theme';

export function SpecificComponent() {
  // Component implementation
}
```

### **Step 4: Hooks (`src/screens/{name}/hooks/`)**

```typescript
// src/screens/{name}/hooks/index.ts
export { useScreenLogic } from './use-screen-logic';

// src/screens/{name}/hooks/use-screen-logic.ts
import { useState, useCallback } from 'react';
import { useScreenStore } from '../stores'; // Screen-specific store
import useAuthStore from '@/stores/auth'; // Global store

export const useScreenLogic = () => {
  // Hook implementation
  return {
    // Hook return values
  };
};
```

### **Step 5: Stores (`src/screens/{name}/stores/`) - Only if Needed**

```typescript
// src/screens/{name}/stores/index.ts
import { createStore } from '@/stores/utils';
import type IBaseState from '@/stores/interfaces/IBaseState';

interface ScreenState extends IBaseState {
  // Screen-specific state
  data: any;
  isLoading: boolean;

  actions: {
    fetchData: () => Promise<void>;
    updateData: (data: any) => void;
  };
}

const screenStore = (set: any, get: any) => ({
  // Store implementation following global store pattern
});

export const useScreenStore = createStore<ScreenState>(screenStore);
```

### **Step 6: Navigation Setup (`src/app/{name}.tsx`)**

```typescript
// src/app/{screen-name}.tsx
import ScreenNameScreen from '@/screens/{screen-name}';

export default ScreenNameScreen;
```

## 🚫 **What NOT to Do**

### **❌ Don't Put Screen Logic in `src/app/`**

```typescript
// ❌ BAD - Logic in navigation file
export default function Profile() {
  const [data, setData] = useState();
  // Don't put screen logic here
}
```

### **❌ Don't Put Global State in Screen Stores**

```typescript
// ❌ BAD - Auth state in screen store
// src/screens/profile/stores/index.ts
interface ProfileState {
  user: User; // This belongs in global auth store
  profileData: ProfileData; // This is screen-specific ✅
}
```

### **❌ Don't Create Global Components in Screen Directories**

```typescript
// ❌ BAD - This should be in src/components/
// src/screens/profile/components/button.tsx
export function Button() {
  // Reusable button component
}
```

## ✅ **Examples of Correct Organization**

### **Login Screen (Current Example)**

```
src/screens/login/
├── components/
│   ├── index.tsx
│   ├── username-step.tsx
│   └── password-step.tsx
├── hooks/
│   ├── index.ts
│   └── use-login-handlers.ts
└── index.tsx
```

_Note: Login uses global auth store because auth is app-wide_

### **Profile Screen (Hypothetical)**

```
src/screens/profile/
├── components/
│   ├── index.tsx
│   ├── profile-form.tsx
│   └── profile-settings.tsx
├── hooks/
│   ├── index.ts
│   └── use-profile-data.ts
├── stores/
│   └── index.ts              # Profile-specific state only
└── index.tsx
```

### **Incident Management Screen (Hypothetical)**

```
src/screens/incidents/
├── components/
│   ├── index.tsx
│   ├── incident-card.tsx
│   ├── incident-form.tsx
│   └── incident-filters.tsx
├── hooks/
│   ├── index.ts
│   ├── use-incident-data.ts
│   └── use-incident-filters.ts
├── stores/
│   └── index.ts              # Incident list state, filters, etc.
├── types/
│   └── index.ts              # Incident-specific types
└── index.tsx
```

## 🎯 **Decision Tree: Global vs Screen-Specific**

### **When to Use Global (`src/stores/`, `src/components/`, etc.)**

- ✅ Used by 2+ screens
- ✅ Authentication/authorization
- ✅ App-wide settings/preferences
- ✅ Shared UI components
- ✅ Common utilities/types

### **When to Use Screen-Specific (`src/screens/{name}/`)**

- ✅ Only used by one screen/feature
- ✅ Screen-specific business logic
- ✅ Local form state
- ✅ Feature-specific components
- ✅ Screen-specific data transformations

## 📝 **Implementation Checklist**

For every new screen, ensure:

- [ ] Screen directory created: `src/screens/{name}/`
- [ ] Main component: `src/screens/{name}/index.tsx`
- [ ] Navigation file: `src/app/{name}.tsx` (imports from screen)
- [ ] Components organized: `src/screens/{name}/components/`
- [ ] Hooks organized: `src/screens/{name}/hooks/`
- [ ] Only create `stores/` if screen needs local state
- [ ] Use global stores for shared state
- [ ] Use global UI components from `@/components`
- [ ] Follow TypeScript patterns
- [ ] Export pattern: `index.ts` files for clean imports

## 🚀 **Benefits of This Pattern**

1. **Clear Separation**: Global vs screen-specific concerns
2. **Scalability**: Each screen is self-contained
3. **Maintainability**: Easy to find and modify screen logic
4. **Reusability**: Global components available everywhere
5. **Consistency**: Same pattern for all screens
6. **Team Collaboration**: Clear structure for team members

## 📚 **Quick Reference**

**Remember**:

- `src/app/` = Navigation config only
- `src/screens/{name}/` = Full screen implementation
- `src/stores/` = Global state only (auth, app-wide)
- `src/components/` = Reusable components
- `src/screens/{name}/stores/` = Screen-specific state only

**Follow this pattern for ALL future screens and features!** 🎯
