# Dependency Migration Document

## Overview
This document tracks the migration of dependencies from the old project (Expo SDK 52) to the new project (Expo SDK 54).

## Dependency Categories

### Core Libraries (State Management, API, Storage)
**Old Project:**
- `zustand`: ^4.5.5
- `immer`: ^10.1.1
- `axios`: ^1.7.5
- `react-native-mmkv`: ~3.1.0

**New Project Status:**
- Need to install: zustand, immer, axios, react-native-mmkv
- Already have: react-native-reanimated (~4.1.1), react-native-gesture-handler (~2.28.0), react-native-safe-area-context (~5.6.0)

### UI/Form Libraries
**Old Project:**
- `@shopify/flash-list`: 1.7.3
- `@gorhom/bottom-sheet`: ^5.0.5
- `react-native-flash-message`: ^0.4.2
- `react-native-keyboard-controller`: ^1.13.2
- `react-native-edge-to-edge`: ^1.1.2

**New Project Status:**
- Need to install all

### Feature Libraries (Native Modules)
**Old Project:**
- `@rnmapbox/maps`: ^10.1.42
- `expo-location`: ~18.0.10
- `expo-image-picker`: ~16.0.6
- `expo-document-picker`: ~13.0.3
- `expo-video`: ~2.0.6
- `expo-video-thumbnails`: ~9.0.3
- `expo-battery`: ~9.0.2
- `@react-native-community/netinfo`: 11.4.1
- `@react-native-community/datetimepicker`: 8.2.0
- `socket.io-client`: ^4.8.1

**New Project Status:**
- Need to install all (check Expo SDK 54 compatible versions)

### i18n Libraries
**Old Project:**
- `i18next`: ^23.14.0
- `react-i18next`: ^15.0.1
- `expo-localization`: ~16.0.1

**New Project Status:**
- Need to install all (check Expo SDK 54 compatible versions)

### Font Libraries
**Old Project:**
- `@expo-google-fonts/inter`: ^0.4.1
- `@expo-google-fonts/manrope`: ^0.4.1
- `@expo-google-fonts/roboto`: ^0.4.0
- `@expo-google-fonts/goldman`: ^0.4.2
- `@expo-google-fonts/kdam-thmor-pro`: ^0.4.1
- `@expo-google-fonts/russo-one`: ^0.4.0

**New Project Status:**
- Need to install all

### Dev Dependencies
**Old Project:**
- `react-native-svg-transformer`: ^1.5.1
- `patch-package`: ^8.0.0
- Testing libraries (jest, @testing-library/react-native, etc.)
- ESLint plugins

**New Project Status:**
- Need to install: react-native-svg-transformer, patch-package
- Testing libraries: optional (can add later)
- ESLint: already has basic setup

## Libraries NOT Needed (Verified)
- `react-hook-form` + `@hookform/resolvers` - Forms use manual validation
- `zod` - Only used in env.js (old project), new project has custom env system
- `babel-plugin-module-resolver` - New project uses TypeScript path aliases

## Version Compatibility Notes
- Expo SDK 52 → 54: Some packages may need version updates
- React Native: 0.76.9 → 0.81.5 (major version jump)
- React: 18.3.1 → 19.1.0 (major version jump)
- Check each package for Expo SDK 54 compatibility

