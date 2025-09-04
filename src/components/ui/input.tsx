import * as React from 'react';
import type {
  Control,
  FieldValues,
  Path,
  RegisterOptions,
} from 'react-hook-form';
import { useController } from 'react-hook-form';
import type { TextInputProps } from 'react-native';
import { I18nManager, StyleSheet, View } from 'react-native';
import { TextInput as NTextInput } from 'react-native';

import { type Theme, useTheme } from '@/theme';

import { Text } from './text';

const createInputStyles = (
  theme: Theme,
  options: { focused?: boolean; error?: boolean; disabled?: boolean }
) => {
  const { colors, spacing, typography, components } = theme;
  const { focused = false, error = false, disabled = false } = options;

  return StyleSheet.create({
    container: {
      marginBottom: spacing.gap.md,
    },
    label: {
      ...typography.label,
      color: error ? colors.semantic.error : colors.text.primary,
      marginBottom: spacing.gap.sm,
    },
    input: {
      height: components.input.height,
      borderRadius: components.input.borderRadius,
      borderWidth: components.input.borderWidth,
      paddingHorizontal: components.input.padding.horizontal,
      paddingVertical: components.input.padding.vertical,
      backgroundColor: disabled
        ? colors.utility.lightGray
        : colors.surface.input,
      borderColor: error
        ? colors.semantic.error
        : focused
          ? colors.primary
          : colors.surface.border,
      ...typography.body,
      color: colors.text.primary,
    },
    errorText: {
      ...typography.caption,
      color: colors.semantic.error,
      marginTop: spacing.gap.xs,
    },
  });
};

export interface NInputProps extends TextInputProps {
  label?: string;
  disabled?: boolean;
  error?: string;
}

type TRule<T extends FieldValues> =
  | Omit<
      RegisterOptions<T>,
      'disabled' | 'valueAsNumber' | 'valueAsDate' | 'setValueAs'
    >
  | undefined;

export type RuleType<T extends FieldValues> = { [name in keyof T]: TRule<T> };
export type InputControllerType<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  rules?: RuleType<T>;
};

interface ControlledInputProps<T extends FieldValues>
  extends NInputProps,
    InputControllerType<T> {}

export const Input = React.forwardRef<NTextInput, NInputProps>((props, ref) => {
  const { label, error, testID, ...inputProps } = props;
  const [isFocussed, setIsFocussed] = React.useState(false);
  const theme = useTheme();
  const onBlur = React.useCallback(() => setIsFocussed(false), []);
  const onFocus = React.useCallback(() => setIsFocussed(true), []);

  const styles = React.useMemo(
    () =>
      createInputStyles(theme, {
        error: Boolean(error),
        focused: isFocussed,
        disabled: Boolean(props.disabled),
      }),
    [theme, error, isFocussed, props.disabled]
  );

  return (
    <View style={styles.container}>
      {label && (
        <Text
          testID={testID ? `${testID}-label` : undefined}
          style={styles.label}
        >
          {label}
        </Text>
      )}
      <NTextInput
        testID={testID}
        ref={ref}
        placeholderTextColor={theme.colors.text.placeholder}
        style={StyleSheet.flatten([
          styles.input,
          { writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr' },
          { textAlign: I18nManager.isRTL ? 'right' : 'left' },
          inputProps.style,
        ])}
        onBlur={onBlur}
        onFocus={onFocus}
        {...inputProps}
      />
      {error && (
        <Text
          testID={testID ? `${testID}-error` : undefined}
          style={styles.errorText}
        >
          {error}
        </Text>
      )}
    </View>
  );
});

// only used with react-hook-form
export function ControlledInput<T extends FieldValues>(
  props: ControlledInputProps<T>
) {
  const { name, control, rules, ...inputProps } = props;

  const { field, fieldState } = useController({ control, name, rules });
  return (
    <Input
      ref={field.ref}
      autoCapitalize="none"
      onChangeText={field.onChange}
      value={(field.value as string) || ''}
      {...inputProps}
      error={fieldState.error?.message}
    />
  );
}
