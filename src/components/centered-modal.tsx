/**
 * Centered Modal Component
 * A centered dialog modal (not a bottom sheet)
 */

import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import { Text } from './text';
import { useTheme } from '@/theme';
import { X } from './icons';

interface CenteredModalProps {
  visible: boolean;
  onClose: () => void;
  title?:  React.JSX.Element | string;
  subText?: string;
  children?: React.ReactNode;
  showCloseButton?: boolean;
  titleAlign?: 'left' | 'center' | 'right';
}

export function CenteredModal({
  visible,
  onClose,
  title,
  subText,
  children,
  showCloseButton = true,
  titleAlign = 'left',
}: CenteredModalProps) {
  const theme = useTheme();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[
            styles.modalContainer,
            { borderColor: theme.colors.surface.muted, borderWidth: 2 },
            { backgroundColor: theme.colors.background.primary },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          {showCloseButton && (
            <TouchableOpacity
              onPress={onClose}
              style={[
                styles.closeButton,
                { backgroundColor: theme.colors.button.ghost },
              ]}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X width={20} height={20} color={theme.colors.text.icon} />
            </TouchableOpacity>
          )}
          {/* Header */}
          {title && (
            <View style={[styles.header, { justifyContent: titleAlign === 'center' ? 'center' : 'flex-start' }]}>
              {title && (
                <Text
                  variant="h4"
                  style={[
                    {
                      color: theme.colors.text.primary, // Purple color for header (matching design)
                      fontFamily: theme.fonts.goldmanRegular,
                      textAlign: titleAlign,
                    },
                  ]}
                >
                  {title}
                </Text>
              )}
            </View>
          )}

          {/* Content */}
          <View style={styles.content}>
            {subText && (
              <Text
                variant="bodyMedium"
                style={{
                  color: theme.colors.text.secondary,
                  marginBottom: children ? 16 : 0,
                }}
              >
                {subText}
              </Text>
            )}
            {children}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 4,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  content: {
    width: '100%',
  },
});
