/**
 * Text Component
 * A theme-aware text component with typography variants and i18n support
 */

import React from 'react';
import type { TextProps as RNTextProps } from 'react-native';
import { I18nManager, Text as RNText } from 'react-native';

import type { TxKeyPath } from '@/lib/i18n';
import { translate } from '@/lib/i18n';
import type { Theme } from '@/theme';
import { useTheme } from '@/theme';

import {
  createAccessibilityProps,
  createTextStyles,
  mergeStyles,
  useThemedStyles,
} from './base-component';
import type { BaseTextProps } from './types';

/* ================================
   TEXT COMPONENT INTERFACE
   ================================ */

interface TextProps extends BaseTextProps {
  /** Text content (alternative to children) */
  text?: string;
  /** Translation key for i18n */
  tx?: TxKeyPath;
  /** Values to interpolate into translation */
  txOptions?: Record<string, any>;
  /** Whether to apply RTL text direction */
  rtl?: boolean;
}

/* ================================
   STYLE CREATORS
   ================================ */

const createTextComponentStyles = (theme: Theme, props: TextProps) => {
  const baseStyles = createTextStyles(theme, props);

  return {
    ...baseStyles,
    writingDirection:
      props.rtl || I18nManager.isRTL ? ('rtl' as const) : ('ltr' as const),
  };
};

/* ================================
   TEXT COMPONENT
   ================================ */

export const Text = React.forwardRef<RNText, TextProps & RNTextProps>(
  (
    {
      variant = 'body',
      color,
      centered = false,
      text,
      tx,
      txOptions,
      children,
      style: userStyle,
      rtl,
      ...props
    },
    ref
  ) => {
    // Generate themed styles
    const styles = useThemedStyles(createTextComponentStyles, {
      variant,
      color,
      centered,
      rtl,
    });

    // Merge with user-provided styles
    const finalStyle = mergeStyles(styles, userStyle);

    // Generate accessibility props
    const accessibilityProps = createAccessibilityProps(props);

    // Determine text content
    const textContent = React.useMemo(() => {
      if (tx) {
        return translate(tx, txOptions);
      }
      return text || children;
    }, [tx, txOptions, text, children]);

    return (
      <RNText ref={ref} style={finalStyle} {...accessibilityProps} {...props}>
        {textContent}
      </RNText>
    );
  }
);

Text.displayName = 'Text';

/* ================================
   TYPOGRAPHY COMPONENT VARIANTS
   ================================ */

/**
 * Pre-configured text components for common use cases
 */

export const Heading1 = React.forwardRef<
  RNText,
  Omit<TextProps, 'variant'> & RNTextProps
>((props, ref) => <Text ref={ref} variant="h1" {...props} />);
Heading1.displayName = 'Heading1';

export const Heading2 = React.forwardRef<
  RNText,
  Omit<TextProps, 'variant'> & RNTextProps
>((props, ref) => <Text ref={ref} variant="h2" {...props} />);
Heading2.displayName = 'Heading2';

export const Heading3 = React.forwardRef<
  RNText,
  Omit<TextProps, 'variant'> & RNTextProps
>((props, ref) => <Text ref={ref} variant="h3" {...props} />);
Heading3.displayName = 'Heading3';

export const BodyText = React.forwardRef<
  RNText,
  Omit<TextProps, 'variant'> & RNTextProps
>((props, ref) => <Text ref={ref} variant="body" {...props} />);
BodyText.displayName = 'BodyText';

export const Caption = React.forwardRef<
  RNText,
  Omit<TextProps, 'variant'> & RNTextProps
>((props, ref) => <Text ref={ref} variant="caption" {...props} />);
Caption.displayName = 'Caption';

export const Label = React.forwardRef<
  RNText,
  Omit<TextProps, 'variant'> & RNTextProps
>((props, ref) => <Text ref={ref} variant="label" {...props} />);
Label.displayName = 'Label';

/* ================================
   SEMANTIC TEXT COMPONENTS
   ================================ */

/**
 * Text components with semantic meaning
 */

export const ErrorText = React.forwardRef<
  RNText,
  Omit<TextProps, 'color'> & RNTextProps
>((props, ref) => {
  return <Text ref={ref} color="#ef4444" {...props} />;
});
ErrorText.displayName = 'ErrorText';

export const SuccessText = React.forwardRef<
  RNText,
  Omit<TextProps, 'color'> & RNTextProps
>((props, ref) => {
  return <Text ref={ref} color="#10b981" {...props} />;
});
SuccessText.displayName = 'SuccessText';

export const WarningText = React.forwardRef<
  RNText,
  Omit<TextProps, 'color'> & RNTextProps
>((props, ref) => {
  return <Text ref={ref} color="#f59e0b" {...props} />;
});
WarningText.displayName = 'WarningText';

export const MutedText = React.forwardRef<
  RNText,
  Omit<TextProps, 'color'> & RNTextProps
>((props, ref) => {
  const theme = useTheme();
  return <Text ref={ref} color={theme.colors.text.secondary} {...props} />;
});
MutedText.displayName = 'MutedText';
