import React from 'react';
import { Alert, type AlertButton } from 'react-native';

import { Button } from './button';
import { CenteredModal } from './centered-modal';
import { View } from './view';
import { useTheme } from '@/theme';

type CustomAlertRequest = {
  title?: string;
  message?: string;
  buttons: AlertButton[];
};

const DEFAULT_BUTTON: AlertButton = { text: 'OK' };

const getButtonVariant = (style?: AlertButton['style']) => {
  if (style === 'destructive') {
    return { variant: 'solid' as const, colorVariant: 'error' as const };
  }

  if (style === 'cancel') {
    return { variant: 'outline' as const, colorVariant: 'secondary' as const };
  }

  return { variant: 'solid' as const, colorVariant: 'secondary' as const };
};

export function CustomAlertProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = useTheme();
  const [currentAlert, setCurrentAlert] =
    React.useState<CustomAlertRequest | null>(null);
  const alertQueue = React.useRef<CustomAlertRequest[]>([]);
  const currentAlertRef = React.useRef<CustomAlertRequest | null>(null);

  const processQueue = React.useCallback(() => {
    if (alertQueue.current.length > 0) {
      const nextAlert = alertQueue.current.shift() || null;
      setCurrentAlert(nextAlert);
    } else {
      setCurrentAlert(null);
    }
  }, []);

  React.useEffect(() => {
    currentAlertRef.current = currentAlert;
  }, [currentAlert]);

  React.useEffect(() => {
    const originalAlert = Alert.alert;

    const customAlert: typeof Alert.alert = (
      title,
      message = undefined,
      buttons,
      options,
      type
    ) => {
      const normalizedButtons =
        buttons && buttons.length > 0 ? buttons : [DEFAULT_BUTTON];
      const alertRequest: CustomAlertRequest = {
        title,
        message,
        buttons: normalizedButtons,
      };

      if (currentAlertRef.current) {
        alertQueue.current.push(alertRequest);
      } else {
        setCurrentAlert(alertRequest);
      }
    };

    // Override the native alert function
    (Alert as typeof Alert & { _custom?: boolean }).alert = customAlert;

    return () => {
      Alert.alert = originalAlert;
      alertQueue.current = [];
      currentAlertRef.current = null;
    };
  }, [processQueue]);

  const handleButtonPress = (button: AlertButton) => {
    button.onPress?.();
    processQueue();
  };

  return (
    <>
      {children}
      <CenteredModal
        visible={!!currentAlert}
        onClose={processQueue}
        title={currentAlert?.title}
        subText={currentAlert?.message}
        showCloseButton={false}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-end',
            gap: theme.spacing.gap.md,
          }}
        >
          {currentAlert?.buttons.map((button, index) => {
            const { variant, colorVariant } = getButtonVariant(button.style);
            return (
              <Button
                key={`${button.text}-${index}`}
                title={button.text || 'OK'}
                variant={variant}
                size="medium"
                colorVariant={colorVariant}
                onPress={() => handleButtonPress(button)}
                style={{ minWidth: 120 }}
              />
            );
          })}
        </View>
      </CenteredModal>
    </>
  );
}

