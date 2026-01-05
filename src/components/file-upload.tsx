import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import React, { forwardRef, useState } from 'react';
import { Alert, Pressable, type View as RNView } from 'react-native';

import {
  createAccessibilityProps,
  createStyleCreator,
  mergeStyles,
  useThemedStyles,
} from './base-component';
import { Icon, iconNames } from './icon';
import { ErrorText, Text } from './text';
import type { BaseComponentProps } from './types';
import { View } from './view';

/* ================================
   TYPES & INTERFACES
   ================================ */

export interface UploadedFile {
  uri: string;
  name: string;
  size: number;
  type: string;
}

export interface FileUploadProps extends BaseComponentProps {
  /** FileUpload label */
  label?: string;
  /** Error message to display */
  error?: string | null;
  /** Helper text to display below upload area */
  helperText?: string;
  /** FileUpload size variant */
  size?: 'small' | 'medium' | 'large';
  /** FileUpload visual variant */
  variant?: 'default' | 'outlined' | 'filled';
  /** FileUpload state */
  state?: 'default' | 'error' | 'success' | 'disabled';
  /** Whether file upload is disabled */
  disabled?: boolean;
  /** Whether file upload is required */
  required?: boolean;
  /** Upload type */
  uploadType?: 'image' | 'document' | 'any';
  /** Allow multiple file selection */
  multiple?: boolean;
  /** Maximum file size in bytes */
  maxFileSize?: number;
  /** Accepted file types (MIME types) */
  acceptedTypes?: string[];
  /** Currently uploaded files */
  files?: UploadedFile[];
  /** Callback when files are selected */
  onFilesChange?: (files: UploadedFile[]) => void;
  /** Callback when a file is removed */
  onFileRemove?: (fileIndex: number) => void;
  /** Upload area placeholder text */
  placeholder?: string;
  /** Custom container style */
  containerStyle?: any;
  /** Custom upload area style */
  uploadAreaStyle?: any;
}

/* ================================
   STYLE CREATORS
   ================================ */

const createFileUploadContainerStyles = createStyleCreator<FileUploadProps>(
  (theme, props) => {
    const { spacing } = theme;

    return {
      marginBottom: spacing.gap.lg,
    };
  }
);

const createUploadAreaStyles = createStyleCreator<FileUploadProps>(
  (theme, props) => {
    const {
      size = 'medium',
      variant = 'default',
      state = 'default',
      disabled = false,
    } = props;
    const { colors, spacing, borderRadius } = theme;

    // Size variants
    const sizeStyles = {
      small: {
        minHeight: 80,
        padding: spacing.padding.md,
      },
      medium: {
        minHeight: 120,
        padding: spacing.padding.lg,
      },
      large: {
        minHeight: 160,
        padding: spacing.padding.xl,
      },
    };

    // Visual variants
    const variantStyles = {
      default: {
        backgroundColor: colors.surface.input,
        borderWidth: 2,
        borderColor: colors.surface.border,
        borderStyle: 'dashed',
      },
      outlined: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: colors.surface.border,
        borderStyle: 'dashed',
      },
      filled: {
        backgroundColor: colors.surface.card,
        borderWidth: 1,
        borderColor: colors.surface.border,
        borderStyle: 'solid',
      },
    };

    // State variants
    const stateStyles = {
      default: {},
      error: {
        borderColor: colors.semantic.error,
      },
      success: {
        borderColor: colors.semantic.success,
      },
      disabled: {
        backgroundColor: colors.surface.disabled || colors.utility.lightGray,
        borderColor: colors.surface.border,
        opacity: 0.6,
      },
    };

    return {
      borderRadius: borderRadius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...stateStyles[disabled ? 'disabled' : state],
    };
  }
);

const createUploadIconStyles = createStyleCreator<FileUploadProps>(
  (theme, props) => {
    const { size = 'medium', disabled = false } = props;
    const { colors, spacing } = theme;

    const iconSizes = {
      small: 24,
      medium: 32,
      large: 40,
    };

    return {
      marginBottom: spacing.gap.sm,
      opacity: disabled ? 0.5 : 1,
      color: colors.text.secondary,
    };
  }
);

const createUploadTextStyles = createStyleCreator<FileUploadProps>(
  (theme, props) => {
    const { size = 'medium', disabled = false } = props;
    const { colors, typography } = theme;

    const typographyVariants = {
      small: typography.caption,
      medium: typography.body,
      large: typography.h4,
    };

    return {
      textAlign: 'center',
      color: disabled ? colors.text.muted : colors.text.secondary,
      ...typographyVariants[size],
    };
  }
);

const createFileListStyles = createStyleCreator<FileUploadProps>(
  (theme, props) => {
    const { spacing } = theme;

    return {
      marginTop: spacing.gap.md,
    };
  }
);

const createFileItemStyles = createStyleCreator<FileUploadProps>(
  (theme, props) => {
    const { colors, spacing, borderRadius } = theme;

    return {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface.card,
      padding: spacing.padding.md,
      borderRadius: borderRadius.md,
      marginBottom: spacing.gap.sm,
    };
  }
);

const createFileInfoStyles = createStyleCreator<FileUploadProps>(
  (theme, props) => {
    return {
      flex: 1,
      marginLeft: 12,
    };
  }
);

const createFileNameStyles = createStyleCreator<FileUploadProps>(
  (theme, props) => {
    const { colors, typography } = theme;

    return {
      ...typography.body,
      color: colors.text.primary,
      fontWeight: '500',
    };
  }
);

const createFileSizeStyles = createStyleCreator<FileUploadProps>(
  (theme, props) => {
    const { colors, typography } = theme;

    return {
      ...typography.caption,
      color: colors.text.secondary,
      marginTop: 2,
    };
  }
);

const createRemoveButtonStyles = createStyleCreator<FileUploadProps>(
  (theme, props) => {
    const { colors, spacing } = theme;

    return {
      padding: spacing.padding.xs,
      marginLeft: spacing.gap.sm,
    };
  }
);

const createLabelStyles = createStyleCreator<FileUploadProps>(
  (theme, props) => {
    const { spacing } = theme;

    return {
      marginBottom: spacing.gap.xs,
    };
  }
);

const createHelperTextStyles = createStyleCreator<FileUploadProps>(
  (theme, props) => {
    const { state = 'default' } = props;
    const { colors, spacing } = theme;

    const stateColors = {
      default: colors.text.secondary,
      error: colors.semantic.error,
      success: colors.semantic.success,
      disabled: colors.text.muted,
    };

    return {
      marginTop: spacing.gap.xs,
      color: stateColors[state],
    };
  }
);

/* ================================
   HELPER FUNCTIONS
   ================================ */

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFileIcon = (type: string, size: number = 24) => {
  if (type.startsWith('image/')) {
    return <Icon name={iconNames.image_icon} size={size} />;
  }
  return <Icon name={iconNames.file} size={size} />;
};

/* ================================
   FILEUPLOAD COMPONENT
   ================================ */

export const FileUpload = forwardRef<RNView, FileUploadProps>(
  (
    {
      label,
      error,
      helperText,
      size = 'medium',
      variant = 'default',
      state = 'default',
      disabled = false,
      required = false,
      uploadType = 'any',
      multiple = false,
      maxFileSize = 10 * 1024 * 1024, // 10MB default
      acceptedTypes,
      files = [],
      onFilesChange,
      onFileRemove,
      placeholder,
      containerStyle,
      uploadAreaStyle,
      testID,
      accessible = true,
      accessibilityLabel,
      accessibilityHint,
      ...props
    },
    ref
  ) => {
    const [isUploading, setIsUploading] = useState(false);

    // Determine actual state based on error and disabled
    const actualState = error ? 'error' : disabled ? 'disabled' : state;

    // Default placeholder text
    const defaultPlaceholder =
      uploadType === 'image'
        ? 'Tap to select images'
        : uploadType === 'document'
          ? 'Tap to select documents'
          : 'Tap to select files';

    // Generate themed styles
    const containerStyles = useThemedStyles(
      createFileUploadContainerStyles,
      {}
    );
    const uploadAreaStyles = useThemedStyles(createUploadAreaStyles, {
      size,
      variant,
      state: actualState,
      disabled,
    });
    const uploadIconStyles = useThemedStyles(createUploadIconStyles, {
      size,
      disabled,
    });
    const uploadTextStyles = useThemedStyles(createUploadTextStyles, {
      size,
      disabled,
    });
    const fileListStyles = useThemedStyles(createFileListStyles, {});
    const labelStyles = useThemedStyles(createLabelStyles, {});
    const helperStyles = useThemedStyles(createHelperTextStyles, {
      state: actualState,
    });

    // Create accessibility props
    const accessibilityProps = createAccessibilityProps({
      testID,
      accessible,
      accessibilityLabel: accessibilityLabel || label || defaultPlaceholder,
      accessibilityHint,
      accessibilityRole: 'button',
      accessibilityState: { disabled },
    });

    // Handle file selection
    const handleFileSelection = async () => {
      if (disabled || isUploading) return;

      setIsUploading(true);

      try {
        let result;

        if (uploadType === 'image') {
          // Use ImagePicker for images
          result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: multiple,
            quality: 0.8,
          });
        } else {
          // Use DocumentPicker for documents or any files
          result = await DocumentPicker.getDocumentAsync({
            type: acceptedTypes || '*/*',
            multiple,
          });
        }

        if (result.canceled) {
          setIsUploading(false);
          return;
        }

        // Process selected files
        const selectedFiles: UploadedFile[] = [];
        const resultAssets = 'assets' in result ? result.assets : [result];

        for (const asset of resultAssets) {
          // Check file size
          if (asset.size && asset.size > maxFileSize) {
            Alert.alert(
              'File Too Large',
              `${asset.name} is too large. Maximum file size is ${formatFileSize(maxFileSize)}.`
            );
            continue;
          }

          selectedFiles.push({
            uri: asset.uri,
            name: asset.name || 'Unknown',
            size: asset.size || 0,
            type: asset.mimeType || 'application/octet-stream',
          });
        }

        if (selectedFiles.length > 0) {
          const newFiles = multiple
            ? [...files, ...selectedFiles]
            : selectedFiles;
          onFilesChange?.(newFiles);
        }
      } catch (error) {
        console.error('File selection error:', error);
        Alert.alert('Error', 'Failed to select files. Please try again.');
      } finally {
        setIsUploading(false);
      }
    };

    // Handle file removal
    const handleFileRemove = (index: number) => {
      onFileRemove?.(index);
      const newFiles = files.filter((_, i) => i !== index);
      onFilesChange?.(newFiles);
    };

    // Merge styles
    const finalContainerStyle = mergeStyles(containerStyles, containerStyle);
    const finalUploadAreaStyle = mergeStyles(uploadAreaStyles, uploadAreaStyle);

    return (
      <View style={finalContainerStyle} ref={ref} {...props}>
        {/* Label */}
        {label && (
          <Text variant="label" style={labelStyles}>
            {label}
            {required && <Text color="error"> *</Text>}
          </Text>
        )}

        {/* Upload Area */}
        <Pressable
          style={finalUploadAreaStyle}
          onPress={handleFileSelection}
          disabled={disabled || isUploading}
          {...accessibilityProps}
        >
          <Icon name={iconNames.upload} size={32} style={uploadIconStyles} />
          <Text style={uploadTextStyles}>
            {isUploading
              ? 'Selecting files...'
              : placeholder || defaultPlaceholder}
          </Text>
          {helperText && !error && (
            <Text
              variant="caption"
              style={[uploadTextStyles, { marginTop: 4 }]}
            >
              {helperText}
            </Text>
          )}
        </Pressable>

        {/* File List */}
        {files.length > 0 && (
          <View style={fileListStyles}>
            {files.map((file, index) => {
              const fileItemStyles = useThemedStyles(createFileItemStyles, {});
              const fileInfoStyles = useThemedStyles(createFileInfoStyles, {});
              const fileNameStyles = useThemedStyles(createFileNameStyles, {});
              const fileSizeStyles = useThemedStyles(createFileSizeStyles, {});
              const removeButtonStyles = useThemedStyles(
                createRemoveButtonStyles,
                {}
              );

              return (
                <View key={`${file.uri}-${index}`} style={fileItemStyles}>
                  {getFileIcon(file.type, 24)}
                  <View style={fileInfoStyles}>
                    <Text style={fileNameStyles}>{file.name}</Text>
                    <Text style={fileSizeStyles}>
                      {formatFileSize(file.size)}
                    </Text>
                  </View>
                  <Pressable
                    style={removeButtonStyles}
                    onPress={() => handleFileRemove(index)}
                    accessibilityLabel={`Remove ${file.name}`}
                    accessibilityRole="button"
                    testID={`remove-${file.name}`}
                  >
                    <Icon name={iconNames.x} size={20} />
                  </Pressable>
                </View>
              );
            })}
          </View>
        )}

        {/* Error Message */}
        {error && (
          <ErrorText variant="caption" style={helperStyles}>
            {error}
          </ErrorText>
        )}
      </View>
    );
  }
);

FileUpload.displayName = 'FileUpload';

/* ================================
   SEMANTIC COMPONENTS
   ================================ */

export const ImageUpload = forwardRef<
  RNView,
  Omit<FileUploadProps, 'uploadType'>
>((props, ref) => (
  <FileUpload
    ref={ref}
    uploadType="image"
    acceptedTypes={['image/*']}
    placeholder="Tap to select images"
    {...props}
  />
));

export const DocumentUpload = forwardRef<
  RNView,
  Omit<FileUploadProps, 'uploadType'>
>((props, ref) => (
  <FileUpload
    ref={ref}
    uploadType="document"
    acceptedTypes={[
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ]}
    placeholder="Tap to select documents"
    {...props}
  />
));

export const MultiFileUpload = forwardRef<
  RNView,
  Omit<FileUploadProps, 'multiple'>
>((props, ref) => (
  <FileUpload
    ref={ref}
    multiple={true}
    placeholder="Tap to select multiple files"
    {...props}
  />
));

/* ================================
   EXPORTS
   ================================ */

export default FileUpload;
