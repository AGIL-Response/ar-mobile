# 🎨 Design System Implementation Roadmap

## 📋 Project Overview

Converting Figma-generated React Native screens (12 screens total) into a unified design system without Nativewind.

## 🎯 User Requirements

- ❌ **NO Nativewind** - Use native StyleSheet approach
- 🏗️ Create reusable component library
- 🎨 Unified theme system with design tokens
- 🧹 Clean up Figma-generated code issues
- 📱 Maintain dark theme design
- 🔄 Small, incremental changes per request

## 🖼️ Screen Inventory

- ✅ **Login** - Authentication screen
- ✅ **Home** - Tab "Flat View" (with Members/Incidents sections)
- ✅ **HomeMap** - Tab "Map View"
- ✅ **Incidents** - Incident list screen
- ✅ **NewIncident** - Create incident form
- ✅ **Tasks** - Tab "All" tasks
- ✅ **TasksPending** - Tab "Pending" tasks
- ✅ **TaskDetail** - Individual task details
- ✅ **Chat** - Chat/Profile screen
- ✅ **ChatDetail** - Chat conversation
- ✅ **Profile** - User profile settings
- ✅ **Members** - Team members list

## 🚨 Critical Issues Found

1. ✅ **Inconsistent GlobalStyles** - Each screen has different color values for same concepts _(RESOLVED)_
2. ✅ **40+ Missing SVG imports** - Top/Bottom pattern SVGs that don't exist _(RESOLVED - Emergency cleanup completed)_
3. **Missing assets** - References to Image.png, Frame 7.png, etc.
4. **No component reusability** - Everything hardcoded inline
5. **Inconsistent naming** - Same colors with different variable names

## 📐 Design Tokens Identified

### 🎨 Colors (Consolidated)

```
Primary: #1068eb (Royal Blue)
Backgrounds: #101213, #1e1e1e, #272b30 (Dark grays)
Status: #c92a2a (Error), #37b24d (Success), #f59f00 (Warning)
Text: #fff (White), #dee2e6 (Light), #adb5bd (Muted)
```

### 📝 Typography

```
Families: Manrope (Regular, Medium, SemiBold, Bold), Inter-Bold, SF Pro Text
Sizes: 10, 12, 14, 16, 18, 20, 22, 28px
```

### 📏 Spacing

```
Gaps: 4, 6, 8, 12, 16, 32, 40px
Padding: 1, 4, 6, 8, 12, 16, 24px
Border Radius: 3, 4, 8, 10, 64, 100px
```

## 🧩 Component Patterns Found

- **Cards** - Incident cards, task cards, member cards
- **Badges** - Status badges (High/Low priority, task status)
- **Navigation** - Bottom tabs, app bar, floating button
- **Avatars** - User avatars with online indicators
- **Forms** - Inputs, selects, text areas, upload areas
- **Lists** - Scrollable item lists with consistent spacing

## 🗺️ Implementation Phases

### Phase 1: Foundation 🏗️

- [x] **Task 1.1** - Create unified GlobalStyles/Theme file ✅
- [x] **Task 1.2** - Audit and consolidate all design tokens ✅
- [x] **Task 1.3** - Create base component structure
- [x] **Task 1.4** - Asset cleanup strategy ✅

### Phase 2: Core Components 🧱

- [x] **Task 2.1** - Text component with typography variants ✅
- [x] **Task 2.2** - Button component with all variants ✅
- [x] **Task 2.3** - Card component for incidents/tasks/members ✅
- [x] **Task 2.4** - Badge component for status indicators ✅
- [x] **Task 2.5** - Avatar component with online status ✅

### Phase 3: Layout Components 📱

- [ ] **Task 3.1** - AppBar/Header component
- [ ] **Task 3.2** - BottomNavigation component
- [ ] **Task 3.3** - TabBar component
- [ ] **Task 3.4** - FloatingActionButton component
- [ ] **Task 3.5** - StatusBar component

### Phase 4: Form Components 📝

- [ ] **Task 4.1** - Input component with variants
- [ ] **Task 4.2** - Select/Dropdown component
- [ ] **Task 4.3** - TextArea component
- [ ] **Task 4.4** - FileUpload component
- [ ] **Task 4.5** - Checkbox component

### Phase 5: Screen Refactoring 🔄

- [x] **Task 5.1** - Refactor Login screen ✅
- [ ] **Task 5.2** - Refactor Home screen
- [ ] **Task 5.3** - Refactor Tasks screens
- [ ] **Task 5.4** - Refactor Incident screens
- [ ] **Task 5.5** - Refactor Chat/Profile screens

### Phase 6: Asset Optimization 🧹

- [ ] **Task 6.1** - Remove duplicate Top/Bottom SVGs
- [ ] **Task 6.2** - Optimize icon system
- [ ] **Task 6.3** - Add missing assets
- [ ] **Task 6.4** - Create icon component library

### Phase 7: Testing & Polish ✨

- [ ] **Task 7.1** - Test component reusability
- [ ] **Task 7.2** - Verify dark theme consistency
- [ ] **Task 7.3** - Performance optimization
- [ ] **Task 7.4** - Documentation completion

## 🎯 Next Actions

1. **CURRENT:** Task 5.1 completed ✅ - Asset migration workflow documented
2. **SUGGESTED:** Continue with remaining Phase 2-4 core components or Phase 5 screen refactoring

## 📝 Notes

- Each task should be completed in a single request
- User will approve each task before moving to next
- Keep changes small and manageable
- Maintain existing functionality while improving structure
- Focus on reusability and maintainability
- **IMPORTANT:** Follow asset migration workflow (see ASSET_MIGRATION_WORKFLOW.md) for all screen conversions

## 🏁 Success Criteria

- [ ] All 12 screens use unified theme system
- [ ] 80%+ code reuse through components
- [ ] No duplicate design tokens or SVG assets
- [ ] Consistent dark theme across all screens
- [ ] Maintainable and scalable component architecture

---

**Last Updated:** Current
**Status:** Phase 2 Core Components Complete ✅
**Current Task:** Tasks 2.3-2.5 completed ✅ - Card, Badge, and Avatar components created with full variant support
