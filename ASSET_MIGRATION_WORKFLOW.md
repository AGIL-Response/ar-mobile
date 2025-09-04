# 🖼️ Asset Migration Workflow

## 📋 Overview

When converting Figma-generated screens to the design system, follow this standardized workflow for handling image assets.

## 🔄 Asset Migration Process

### Step 1: Identify Assets in Figma Code

Look for image sources in the original Figma-generated files:

```tsx
// Example from Login.tsx
<Image style={styles.loginIcon} source="124643 1.png" />
<Image style={styles.image9Icon} source="image 9.png" />
```

### Step 2: Copy Assets to `assets/images/`

Copy the actual image files from `screens/assets/` to `assets/images/` with semantic names:

```
screens/assets/124643 1.png → assets/images/img_login_background.png
screens/assets/image 9.png → assets/images/img_login_logo.png
```

### Step 3: Update `assets/images/index.ts`

Add the new assets to the index file for centralized imports:

```typescript
const images = {
  img_login_logo: require('./img_login_logo.png'),
  img_login_background: require('./img_login_background.png'),
  // Add new assets here...
};

export default images;
```

### Step 4: Update Component Code

Replace string sources with imported assets:

```tsx
// Before (Figma-generated)
<Image source="124643 1.png" />
<Image source="image 9.png" />

// After (Design System)
import images from '@/assets/images';

<Image source={images.img_login_background} />
<Image source={images.img_login_logo} />
```

## 📝 Naming Convention

### Image File Names

- Use `img_` prefix for all images
- Use descriptive, semantic names
- Use snake_case format
- Include screen context when helpful

Examples:

- `img_login_background.png`
- `img_login_logo.png`
- `img_home_hero.png`
- `img_profile_placeholder.png`

### Export Names

Match the file name exactly in the index.ts exports:

```typescript
img_login_background: require('./img_login_background.png');
```

## 🗂️ Directory Structure

```
assets/
├── images/
│   ├── index.ts           # Central export file
│   ├── img_login_logo.png
│   ├── img_login_background.png
│   └── [other images...]
└── [other asset types...]

screens/
└── assets/               # Original Figma assets (source)
    ├── 124643 1.png
    ├── image 9.png
    └── [other figma assets...]
```

## ✅ Checklist for Each Screen Conversion

- [ ] Identify all image sources in Figma code
- [ ] Copy assets from `screens/assets/` to `assets/images/`
- [ ] Rename with semantic names following convention
- [ ] Add exports to `assets/images/index.ts`
- [ ] Update component imports to use centralized assets
- [ ] Test that all images load correctly
- [ ] Remove references to old string-based sources

## 🎯 Benefits

1. **Centralized Management** - All assets in one location
2. **Type Safety** - TypeScript can validate asset imports
3. **Better Organization** - Semantic names instead of Figma IDs
4. **Easier Maintenance** - Change assets in one place
5. **Performance** - Proper bundling and optimization

---

**Note:** This workflow should be followed for every screen conversion task in the design system implementation.
