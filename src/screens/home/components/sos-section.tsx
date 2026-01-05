/**
 * SOS Section Component
 * Displays SOS button and handles immediate backup request
 */

import React, { useCallback, useEffect, useState } from "react";
import { Alert, StyleSheet, TouchableOpacity } from "react-native";

import { Button, Icon, Text, View, iconNames } from "@/components";
import { CenteredModal } from "@/components/centered-modal";
import type { Theme } from "@/theme";
import { useTheme } from "@/theme";
import { useTasksStore } from "@/stores/tasks";
import { useLocationStore } from "@/stores/location";

type ModalState = "confirm" | "success" | "cancel";

export function SosSection() {
  const theme = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalState, setModalState] = useState<ModalState>("confirm");
  const [countdown, setCountdown] = useState(5);
  const coordinates = useLocationStore((state) => state.coordinates);
  const createTask = useTasksStore((state) => state.actions.createTask);
  const styles = createStyles(theme, modalState);

  const handleConfirm = useCallback(async () => {
    if (coordinates) {
      try {
        await createTask({
          name: "Immediate Backup",
          description: "Immediate backup requested",
          type: "sos",
          priority: "urgent",
          status: "pending",
          location: {
            type: "point",
            coordinates: [
              coordinates.longitude,
              coordinates.latitude,
              coordinates.altitude || 0,
            ],
          },
        });
      } catch (error) {
        Alert.alert(
          "Error",
          error instanceof Error ? error.message : "Failed to create task"
        );
      }
    } else {
      Alert.alert("Error", "Location not found");
    }
    setModalState("success");
  }, [createTask, coordinates]);

  // Countdown timer for cancel button
  useEffect(() => {
    if (modalVisible && modalState === "confirm" && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (modalVisible && modalState === "confirm" && countdown === 0) {
      // Auto-confirm after countdown
      handleConfirm();
    }
  }, [modalVisible, modalState, countdown, handleConfirm]);

  const handleSosPress = () => {
    setModalState("confirm");
    setCountdown(5);
    setModalVisible(true);
  };

  const handleCancel = () => {
    setModalState("cancel");
  };

  const handleClose = () => {
    setModalVisible(false);
    // Reset state after a delay to allow animation
    setTimeout(() => {
      setModalState("confirm");
      setCountdown(5);
    }, 300);
  };

  const handleOkay = () => {
    handleClose();
  };

  const renderTitle = () => {
    if (modalState === "confirm") {
      return "Immediate Backup";
    } else if (modalState === "success") {
      return (
        <View style={styles.statusIconCircle}>
          <Icon
            name={iconNames.check}
            size={28}
            color={theme.colors.semantic.white}
          />
        </View>
      );
    } else if (modalState === "cancel") {
      return (
        <View style={styles.statusIconCircleError}>
          <Icon
            name={iconNames.incident}
            size={28}
            color={theme.colors.semantic.white}
          />
        </View>
      );
    }
  };

  const renderTitleAlign = () => {
    if (modalState === "confirm") {
      return "left";
    } else if (modalState === "success") {
      return "center";
    } else if (modalState === "cancel") {
      return "center";
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={handleSosPress}
        style={styles.sosButton}
      >
        <Text variant="body" style={styles.sosButtonText}>
          SOS
        </Text>
      </TouchableOpacity>

      <CenteredModal
        visible={modalVisible}
        onClose={handleClose}
        title={renderTitle()}
        titleAlign={renderTitleAlign()}
        showCloseButton={true}
      >
        {modalState === "confirm" && (
          <View style={styles.modalContent}>
            <Text variant="body" style={styles.modalText}>
              Are you sure you want to call immediate backup?
            </Text>

            <View style={styles.modalButtonWrapper}>
              <Button
                variant="solid"
                size="medium"
                title={`Cancel (${countdown}s)`}
                onPress={handleCancel}
                colorVariant="disabled"
                style={styles.cancelButton}
              />
            </View>
          </View>
        )}

        {modalState === "success" && (
          <View style={styles.modalContent}>
            <Text variant="h4" style={styles.modalTitle}>
              Immediate Backup
            </Text>
            <Text variant="bodyMedium" style={styles.modalSubtitle}>
              Backup is On the Way!
            </Text>

            <View style={styles.modalButtonContainer}>
              <Button
                variant="solid"
                size="medium"
                title="Okay"
                onPress={handleOkay}
                colorVariant="secondary"
                style={styles.okayButton}
              />
            </View>
          </View>
        )}

        {modalState === "cancel" && (
          <View style={styles.modalContent}>
            <Text variant="h4" style={styles.modalTitle}>
              Immediate Backup
            </Text>

            <Text variant="bodyMedium" style={styles.modalSubtitle}>
              Backup has been cancelled
            </Text>

            <View style={styles.modalButtonContainer}>
              <Button
                variant="solid"
                size="medium"
                title="Okay"
                onPress={handleOkay}
                colorVariant="secondary"
                style={styles.okayButtonFull}
              />
            </View>
          </View>
        )}
      </CenteredModal>
    </View>
  );
}

const createStyles = (theme: Theme, modalState: ModalState) =>
  StyleSheet.create({
    container: {
      width: "100%",
      alignItems: "center",
      justifyContent: "center",
    },
    sosButton: {
      width: "100%",
      height: 32,
      borderRadius: 2,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.colors.semantic.error,
    },
    sosButtonText: {
      color: theme.colors.semantic.white,
    },
    modalContent: {
      width: "100%",
      alignItems: "center",
      paddingTop: 8,
      paddingBottom: 8,
    },
    statusIconCircle: {
      flex: 1,
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
      backgroundColor: theme.colors.semantic.success,
    },
    statusIconCircleError: {
      flex: 1,
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
      backgroundColor: theme.colors.semantic.error,
    },
    modalText: {
      color: theme.colors.text.secondary,
    },
    modalTitle: {
      color: theme.colors.text.primary,
      fontFamily: theme.fonts.goldmanRegular,
    },
    modalSubtitle: {
      color: theme.colors.text.secondary,
      paddingVertical: 16,
    },
    modalButtonWrapper: {
      paddingTop: 24,
      alignItems: "center",
    },
    modalButtonContainer: {
      width: "100%",
      alignItems: "center",
    },
    cancelButton: {
      width: 120,
    },
    okayButton: {
      width: 100,
    },
    okayButtonFull: {
      width: "100%",
    },
  });
