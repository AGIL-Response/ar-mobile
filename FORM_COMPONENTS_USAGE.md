# Form Components Usage Guide

## 🎯 **Overview**

Complete documentation for all Phase 4 Form Components with examples and best practices.

---

## 📝 **Input Component**

### **Basic Usage**

```typescript
import { Input, EmailInput, PasswordInput, NumberInput } from '@/components';

// Basic input
<Input
  label="Full Name"
  placeholder="Enter your name"
  value={name}
  onChangeText={setName}
/>

// With validation
<Input
  label="Email"
  placeholder="Enter email"
  value={email}
  onChangeText={setEmail}
  error={emailError}
  required
/>
```

### **Input Variants**

```typescript
// Size variants
<Input size="small" placeholder="Small input" />
<Input size="medium" placeholder="Medium input" />
<Input size="large" placeholder="Large input" />

// Visual variants
<Input variant="default" placeholder="Default" />
<Input variant="outlined" placeholder="Outlined" />
<Input variant="filled" placeholder="Filled" />

// State variants
<Input state="error" placeholder="Error state" />
<Input state="success" placeholder="Success state" />
<Input disabled placeholder="Disabled state" />
```

### **Input with Icons**

```typescript
import { Search, User } from '@/components/icons';

<Input
  placeholder="Search..."
  leftIcon={<Search width={20} height={20} />}
/>

<Input
  placeholder="Username"
  rightIcon={<User width={20} height={20} />}
/>
```

### **Semantic Input Components**

```typescript
// Pre-configured inputs
<EmailInput
  label="Email Address"
  placeholder="Enter your email"
  value={email}
  onChangeText={setEmail}
/>

<PasswordInput
  label="Password"
  placeholder="Enter password"
  value={password}
  onChangeText={setPassword}
/>

<NumberInput
  label="Age"
  placeholder="Enter age"
  value={age}
  onChangeText={setAge}
/>

<PhoneInput
  label="Phone Number"
  placeholder="Enter phone"
  value={phone}
  onChangeText={setPhone}
/>

<SearchInput
  placeholder="Search products..."
  value={searchQuery}
  onChangeText={setSearchQuery}
/>
```

---

## 📋 **Select Component**

### **Basic Usage**

```typescript
import { Select } from '@/components';

const options = [
  { label: 'Option 1', value: '1' },
  { label: 'Option 2', value: '2' },
  { label: 'Option 3', value: '3', disabled: true },
];

<Select
  label="Choose Option"
  placeholder="Select an option"
  options={options}
  value={selectedValue}
  onValueChange={setSelectedValue}
/>
```

### **Select with Validation**

```typescript
<Select
  label="Priority Level"
  placeholder="Select priority"
  options={priorityOptions}
  value={priority}
  onValueChange={setPriority}
  error={priorityError}
  required
  helperText="Choose the incident priority level"
/>
```

### **Select Variants**

```typescript
// Size variants
<Select size="small" options={options} placeholder="Small select" />
<Select size="medium" options={options} placeholder="Medium select" />
<Select size="large" options={options} placeholder="Large select" />

// Visual variants
<Select variant="default" options={options} />
<Select variant="outlined" options={options} />
<Select variant="filled" options={options} />
```

### **Select with Icon**

```typescript
import { Location } from '@/components/icons';

<Select
  label="Location"
  options={locationOptions}
  leftIcon={<Location width={20} height={20} />}
  value={selectedLocation}
  onValueChange={setSelectedLocation}
/>
```

---

## 📄 **TextArea Component**

### **Basic Usage**

```typescript
import { TextArea, CommentTextArea, DescriptionTextArea } from '@/components';

// Basic textarea
<TextArea
  label="Description"
  placeholder="Enter description..."
  value={description}
  onChangeText={setDescription}
  rows={4}
/>
```

### **TextArea with Character Count**

```typescript
<TextArea
  label="Comments"
  placeholder="Add your comments..."
  value={comments}
  onChangeText={setComments}
  showCharacterCount
  maxLength={500}
  rows={3}
/>
```

### **Auto-Growing TextArea**

```typescript
<TextArea
  label="Notes"
  placeholder="Add notes..."
  value={notes}
  onChangeText={setNotes}
  autoGrow
  maxHeight={200}
  rows={2}
/>
```

### **TextArea Variants**

```typescript
// Size variants
<TextArea size="small" placeholder="Small textarea" rows={3} />
<TextArea size="medium" placeholder="Medium textarea" rows={4} />
<TextArea size="large" placeholder="Large textarea" rows={5} />

// Visual variants
<TextArea variant="default" placeholder="Default" />
<TextArea variant="outlined" placeholder="Outlined" />
<TextArea variant="filled" placeholder="Filled" />
```

### **Semantic TextArea Components**

```typescript
// Pre-configured textareas
<CommentTextArea
  value={comment}
  onChangeText={setComment}
  placeholder="Add a comment..."
/>

<DescriptionTextArea
  label="Incident Description"
  value={description}
  onChangeText={setDescription}
/>

<NoteTextArea
  label="Additional Notes"
  value={notes}
  onChangeText={setNotes}
/>
```

---

## 📁 **FileUpload Component**

### **Basic Usage**

```typescript
import { FileUpload, ImageUpload, DocumentUpload } from '@/components';

// Basic file upload
<FileUpload
  label="Upload Files"
  files={uploadedFiles}
  onFilesChange={setUploadedFiles}
  multiple
  maxFileSize={10 * 1024 * 1024} // 10MB
/>
```

### **Image Upload**

```typescript
<ImageUpload
  label="Upload Images"
  files={images}
  onFilesChange={setImages}
  multiple
  placeholder="Tap to select images"
  helperText="Supported formats: JPG, PNG, GIF"
/>
```

### **Document Upload**

```typescript
<DocumentUpload
  label="Upload Documents"
  files={documents}
  onFilesChange={setDocuments}
  acceptedTypes={['application/pdf', 'application/msword']}
  maxFileSize={5 * 1024 * 1024} // 5MB
/>
```

### **File Upload Variants**

```typescript
// Size variants
<FileUpload size="small" placeholder="Small upload area" />
<FileUpload size="medium" placeholder="Medium upload area" />
<FileUpload size="large" placeholder="Large upload area" />

// Visual variants
<FileUpload variant="default" />
<FileUpload variant="outlined" />
<FileUpload variant="filled" />
```

### **Single File Upload**

```typescript
<FileUpload
  label="Profile Picture"
  uploadType="image"
  multiple={false}
  files={profilePicture ? [profilePicture] : []}
  onFilesChange={(files) => setProfilePicture(files[0] || null)}
  placeholder="Tap to select profile picture"
/>
```

### **File Upload with Validation**

```typescript
<FileUpload
  label="Incident Evidence"
  files={evidenceFiles}
  onFilesChange={setEvidenceFiles}
  error={fileUploadError}
  required
  maxFileSize={20 * 1024 * 1024} // 20MB
  acceptedTypes={['image/*', 'application/pdf']}
  helperText="Upload images or PDF files as evidence"
/>
```

---

## ☑️ **Checkbox Component**

### **Basic Usage**

```typescript
import { Checkbox, CheckboxGroup } from '@/components';

// Single checkbox
<Checkbox
  label="Accept Terms and Conditions"
  checked={acceptedTerms}
  onCheckedChange={setAcceptedTerms}
  required
/>
```

### **Checkbox with Description**

```typescript
<Checkbox
  label="Enable Notifications"
  description="Receive push notifications for important updates"
  checked={notificationsEnabled}
  onCheckedChange={setNotificationsEnabled}
/>
```

### **Checkbox Variants**

```typescript
// Size variants
<Checkbox size="small" label="Small checkbox" />
<Checkbox size="medium" label="Medium checkbox" />
<Checkbox size="large" label="Large checkbox" />

// Visual variants
<Checkbox variant="default" label="Default" />
<Checkbox variant="outlined" label="Outlined" />
<Checkbox variant="filled" label="Filled" />

// Label position
<Checkbox labelPosition="left" label="Label on left" />
<Checkbox labelPosition="right" label="Label on right" />
```

### **Indeterminate Checkbox**

```typescript
<Checkbox
  label="Select All"
  checked={allSelected}
  indeterminate={someSelected && !allSelected}
  onCheckedChange={handleSelectAll}
/>
```

### **Checkbox States**

```typescript
<Checkbox
  label="Error State"
  state="error"
  error="This field is required"
  checked={errorCheckbox}
  onCheckedChange={setErrorCheckbox}
/>

<Checkbox
  label="Success State"
  state="success"
  checked={successCheckbox}
  onCheckedChange={setSuccessCheckbox}
/>

<Checkbox
  label="Disabled State"
  disabled
  checked={disabledCheckbox}
  onCheckedChange={setDisabledCheckbox}
/>
```

### **Checkbox Group**

```typescript
const permissions = [
  { label: 'Read Access', value: 'read', description: 'View content and data' },
  { label: 'Write Access', value: 'write', description: 'Create and edit content' },
  { label: 'Delete Access', value: 'delete', description: 'Remove content and data' },
  { label: 'Admin Access', value: 'admin', description: 'Full system access', disabled: true },
];

<CheckboxGroup
  label="User Permissions"
  options={permissions}
  value={selectedPermissions}
  onValueChange={setSelectedPermissions}
  helperText="Select the appropriate permissions for this user"
/>
```

### **Semantic Checkbox Components**

```typescript
// Pre-configured checkboxes
<AgreementCheckbox
  label="I agree to the Terms of Service"
  checked={agreedToTerms}
  onCheckedChange={setAgreedToTerms}
/>

<FeatureToggle
  label="Dark Mode"
  description="Enable dark theme"
  checked={darkModeEnabled}
  onCheckedChange={setDarkModeEnabled}
/>

<BulkActionCheckbox
  label="Item 1"
  checked={selectedItems.includes('item1')}
  onCheckedChange={(checked) => handleItemSelection('item1', checked)}
/>
```

---

## 🔄 **Complete Form Example**

```typescript
import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import {
  View,
  Text,
  Input,
  EmailInput,
  PasswordInput,
  Select,
  TextArea,
  FileUpload,
  Checkbox,
  CheckboxGroup,
  Button,
} from '@/components';

export function CompleteFormExample() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    bio: '',
    files: [],
    agreeToTerms: false,
    permissions: [],
  });

  const [errors, setErrors] = useState({});

  const roleOptions = [
    { label: 'Developer', value: 'developer' },
    { label: 'Designer', value: 'designer' },
    { label: 'Manager', value: 'manager' },
  ];

  const permissionOptions = [
    { label: 'Read Access', value: 'read' },
    { label: 'Write Access', value: 'write' },
    { label: 'Admin Access', value: 'admin' },
  ];

  const handleSubmit = () => {
    // Form validation and submission logic
    console.log('Form data:', formData);
  };

  return (
    <ScrollView style={{ padding: 20 }}>
      <Text variant="h2" style={{ marginBottom: 20 }}>
        User Registration Form
      </Text>

      {/* Basic Input */}
      <Input
        label="Full Name"
        placeholder="Enter your full name"
        value={formData.name}
        onChangeText={(name) => setFormData({ ...formData, name })}
        error={errors.name}
        required
      />

      {/* Email Input */}
      <EmailInput
        label="Email Address"
        placeholder="Enter your email"
        value={formData.email}
        onChangeText={(email) => setFormData({ ...formData, email })}
        error={errors.email}
        required
      />

      {/* Password Input */}
      <PasswordInput
        label="Password"
        placeholder="Create a password"
        value={formData.password}
        onChangeText={(password) => setFormData({ ...formData, password })}
        error={errors.password}
        required
      />

      {/* Select */}
      <Select
        label="Role"
        placeholder="Select your role"
        options={roleOptions}
        value={formData.role}
        onValueChange={(role) => setFormData({ ...formData, role })}
        error={errors.role}
        required
      />

      {/* TextArea */}
      <TextArea
        label="Bio"
        placeholder="Tell us about yourself..."
        value={formData.bio}
        onChangeText={(bio) => setFormData({ ...formData, bio })}
        rows={4}
        showCharacterCount
        maxLength={500}
      />

      {/* File Upload */}
      <FileUpload
        label="Profile Documents"
        files={formData.files}
        onFilesChange={(files) => setFormData({ ...formData, files })}
        uploadType="any"
        multiple
        maxFileSize={10 * 1024 * 1024}
        placeholder="Upload your documents"
      />

      {/* Checkbox Group */}
      <CheckboxGroup
        label="Permissions"
        options={permissionOptions}
        value={formData.permissions}
        onValueChange={(permissions) => setFormData({ ...formData, permissions })}
        helperText="Select the permissions you need"
      />

      {/* Agreement Checkbox */}
      <Checkbox
        label="I agree to the Terms of Service and Privacy Policy"
        checked={formData.agreeToTerms}
        onCheckedChange={(agreeToTerms) => setFormData({ ...formData, agreeToTerms })}
        required
        error={errors.agreeToTerms}
      />

      {/* Submit Button */}
      <Button
        title="Create Account"
        onPress={handleSubmit}
        disabled={!formData.agreeToTerms}
        fullWidth
        style={{ marginTop: 20 }}
      />
    </ScrollView>
  );
}
```

---

## 🎨 **Styling & Theming**

All form components automatically use the design system theme:

- **Colors**: Consistent with theme colors
- **Typography**: Uses typography scale
- **Spacing**: Follows spacing guidelines
- **Border Radius**: Consistent border radius
- **States**: Error, success, disabled states
- **Dark Mode**: Automatic theme switching

---

## ♿ **Accessibility**

All components include:

- **Screen Reader Support**: Proper accessibility labels
- **Keyboard Navigation**: Full keyboard support
- **Focus Management**: Visible focus indicators
- **ARIA Attributes**: Correct roles and states
- **High Contrast**: Works with accessibility settings

---

## 📱 **Mobile Best Practices**

- **Touch Targets**: Minimum 44px touch targets
- **Keyboard Types**: Appropriate keyboard for input type
- **Auto-Complete**: Built-in auto-complete support
- **Validation**: Real-time validation feedback
- **Error Handling**: Clear error messages
- **Loading States**: Built-in loading indicators

---

## 🚀 **Ready to Use!**

All Phase 4 Form Components are production-ready with:

✅ **Complete Functionality** - All features implemented  
✅ **Theme Integration** - Fully integrated with design system  
✅ **TypeScript Support** - Full type safety  
✅ **Accessibility** - WCAG compliant  
✅ **Mobile Optimized** - Touch-friendly and responsive  
✅ **Semantic Variants** - Pre-configured common use cases

Perfect for building any form in your React Native application! 🎯
