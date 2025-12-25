# 🎯 Icon Usage Examples

## ✅ Recommended Usage with Constants

### Tab Bar Implementation

```tsx
import { Icon, iconNames } from '@/components';

function TabBarIcon({ name, color, focused }) {
  const iconMap = {
    index: iconNames.home,
    tasks: iconNames.list,
    chat: iconNames.message_square,
    profile: iconNames.user,
  };
  
  const iconName = iconMap[name];
  return <Icon name={iconName} size={24} color={color} />;
}
```

### Button with Icon

```tsx
import { Icon, iconNames } from '@/components';

function HomeButton({ onPress }) {
  return (
    <TouchableOpacity onPress={onPress}>
      <Icon name={iconNames.home} size={20} color="#333" />
      <Text>Home</Text>
    </TouchableOpacity>
  );
}
```

### Dynamic Icon Selection

```tsx
import { Icon, iconNames } from '@/components';

function StatusIcon({ status }) {
  const statusIcons = {
    home: iconNames.home,
    profile: iconNames.user,
    messages: iconNames.message_square,
    tasks: iconNames.list,
  };
  
  return (
    <Icon 
      name={statusIcons[status]} 
      size={16} 
      color={status === 'active' ? '#1068eb' : '#666'}
    />
  );
}
```

## ❌ Avoid These Patterns

### Hardcoded Strings (Don't do this)

```tsx
// ❌ BAD: Hardcoded strings are error-prone
<Icon name="home" size={24} />
<Icon name="messagequare" size={24} /> // Typo!
```

### Mixed Patterns (Don't do this)

```tsx
// ❌ BAD: Mixing constants and strings
<Icon name={iconNames.home} size={24} />
<Icon name="user" size={24} />
```

## 🔄 Migration Examples

### Before: Individual Icon Imports

```tsx
// OLD WAY
import { Home, User, MessageSquare } from '@/components/icons';

function Navigation() {
  return (
    <View>
      <Home width={24} height={24} color="#333" />
      <User width={24} height={24} color="#333" />
      <MessageSquare width={24} height={24} color="#333" />
    </View>
  );
}
```

### After: Centralized Icon System

```tsx
// NEW WAY
import { Icon, iconNames } from '@/components';

function Navigation() {
  return (
    <View>
      <Icon name={iconNames.home} size={24} color="#333" />
      <Icon name={iconNames.user} size={24} color="#333" />
      <Icon name={iconNames.message_square} size={24} color="#333" />
    </View>
  );
}
```

## 🎨 Advanced Usage

### Conditional Icons

```tsx
import { Icon, iconNames } from '@/components';

function NotificationIcon({ hasNotifications }) {
  return (
    <View>
      <Icon 
        name={iconNames.message_square} 
        size={24} 
        color={hasNotifications ? '#1068eb' : '#666'} 
      />
      {hasNotifications && (
        <Badge count={3} />
      )}
    </View>
  );
}
```

### Icon Lists

```tsx
import { Icon, iconNames } from '@/components';

function QuickActions() {
  const actions = [
    { icon: iconNames.home, label: 'Home', action: () => {} },
    { icon: iconNames.user, label: 'Profile', action: () => {} },
    { icon: iconNames.message_square, label: 'Messages', action: () => {} },
    { icon: iconNames.list, label: 'Tasks', action: () => {} },
  ];

  return (
    <ScrollView horizontal>
      {actions.map((action, index) => (
        <TouchableOpacity key={index} onPress={action.action}>
          <Icon name={action.icon} size={32} color="#1068eb" />
          <Text>{action.label}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
```

## 🚀 Benefits Summary

- ✅ **Type Safety**: Autocomplete and compile-time error checking
- ✅ **No Typos**: Constants prevent spelling mistakes
- ✅ **Refactoring Safe**: Rename icons easily across the app
- ✅ **Performance**: Direct SVG imports, no unnecessary bundles
- ✅ **Maintainable**: Easy to add/remove/update icons
- ✅ **Consistent**: Same pattern across the entire app
