# AppBar Component Usage Examples

The AppBar component system provides flexible header and navigation solutions for the AR Mobile app.

## 🎯 Quick Start

```typescript
import {
  AppBar,
  HeaderBar,
  BottomNavigation,
  StatusBar,
  SimpleHeader,
  NavigationItem,
} from '@/components/ui';
```

## 📱 Component Examples

### 1. Basic Header Bar

```typescript
<HeaderBar
  title="AR Responder"
  leftContent={<BackButton />}
  rightContent={<UserAvatar />}
  elevation="low"
/>
```

### 2. Bottom Navigation

```typescript
<BottomNavigation
  items={[
    {
      icon: <HomeIcon />,
      label: "Home",
      active: true,
      onPress: () => navigate('Home')
    },
    {
      icon: <TasksIcon />,
      label: "Tasks",
      badge: "3",
      onPress: () => navigate('Tasks')
    },
    {
      icon: <ChatIcon />,
      label: "Chat",
      badge: "5",
      onPress: () => navigate('Chat')
    },
    {
      icon: <ProfileIcon />,
      label: "Profile",
      onPress: () => navigate('Profile')
    }
  ]}
  activeIndex={0}
/>
```

### 3. Status Bar

```typescript
<StatusBar
  time="9:41"
  signal="cellular"
  batteryLevel={85}
  backgroundColor="transparent"
/>
```

### 4. Simple Header with Back Button

```typescript
<SimpleHeader
  title="Task Details"
  showBack={true}
  onBack={() => navigation.goBack()}
/>
```

### 5. Custom Header with Actions

```typescript
<HeaderBar
  title="Members"
  rightContent={
    <View style={{ flexDirection: 'row', gap: 8 }}>
      <Button variant="ghost" size="small">
        Add
      </Button>
      <Button variant="ghost" size="small">
        Filter
      </Button>
    </View>
  }
/>
```

## 🎨 Styling Options

### Elevation Levels

```typescript
<HeaderBar elevation="none" />     // No shadow
<HeaderBar elevation="low" />      // Subtle shadow
<HeaderBar elevation="medium" />   // Medium shadow
<HeaderBar elevation="high" />     // Strong shadow
```

### Custom Background Colors

```typescript
<HeaderBar backgroundColor="#1a1a1a" />
<BottomNavigation backgroundColor="rgba(255,255,255,0.95)" />
```

### Safe Area Control

```typescript
<HeaderBar safeArea={true} />   // Include safe area padding
<HeaderBar safeArea={false} />  // No safe area padding
```

## 🧭 Navigation Patterns

### Tab Navigation Pattern

```typescript
const TabScreen = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <View style={{ flex: 1 }}>
      <HeaderBar title="AR Responder" />

      {/* Content based on activeTab */}
      <TabContent activeTab={activeTab} />

      <BottomNavigation
        items={navigationItems}
        activeIndex={activeTab}
        onItemPress={(index) => setActiveTab(index)}
      />
    </View>
  );
};
```

### Header with Search

```typescript
<HeaderBar
  centerContent={
    <SearchInput
      placeholder="Search tasks..."
      style={{ flex: 1 }}
    />
  }
  leftContent={<MenuButton />}
  rightContent={<FilterButton />}
/>
```

### Navigation with Badges

```typescript
const navigationItems = [
  { icon: <HomeIcon />, label: "Home" },
  {
    icon: <TasksIcon />,
    label: "Tasks",
    badge: pendingTasks.length > 0 ? pendingTasks.length : undefined
  },
  {
    icon: <ChatIcon />,
    label: "Chat",
    badge: unreadMessages > 0 ? unreadMessages : undefined
  },
  { icon: <ProfileIcon />, label: "Profile" }
];
```

## 🔧 Integration with Figma Screens

### Replacing Figma Navigation Bars

**Before (Figma-generated):**

```typescript
<View style={[styles.navigateBar, styles.barLayout]}>
  <View style={styles.navigateLayout}>
    <Home05 style={styles.home05Icon} />
    <Text style={styles.home}>Home</Text>
  </View>
  // ... more navigation items
</View>
```

**After (Design System):**

```typescript
<BottomNavigation
  items={[
    { icon: <Home05 />, label: "Home", active: true },
    { icon: <List1 />, label: "Tasks", badge: "1" },
    { icon: <Messagechatcircle />, label: "Chat", badge: "2" }
  ]}
/>
```

### Benefits of Migration

✅ **Consistent Styling** - Automatic theme integration  
✅ **Reduced Code** - No manual styling required  
✅ **Type Safety** - Full TypeScript support  
✅ **Accessibility** - Built-in a11y features  
✅ **Responsive** - Automatic dark/light mode support  
✅ **Maintainable** - Single source of truth for navigation

## 🎯 Best Practices

1. **Use appropriate variants** for different contexts
2. **Include badges** for pending notifications/tasks
3. **Maintain consistent elevation** across similar components
4. **Use safe area** for proper device compatibility
5. **Test with different content lengths** for responsiveness

## 🚀 Ready for Integration

The AppBar system is ready to replace figma-generated navigation patterns throughout the app!
