/**
 * SOS Section Component
 * Displays SOS button and handles immediate backup request
 */

import React, { useCallback, useEffect, useState } from "react";
import { Alert, StyleSheet, TouchableOpacity } from "react-native";

import { Button, Text, View } from "@/components";
import { CenteredModal } from "@/components/centered-modal";
import { useTheme } from "@/theme";
import { useTasksStore } from "@/stores/tasks";
import { useLocationStore } from "@/stores/location";

type ModalState = "confirm" | "success" | "cancel";

export function SosSection() {
  const theme = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalState, setModalState] = useState<ModalState>("confirm");
  const [countdown, setCountdown] = useState(5);
  const { coordinates } = useLocationStore();
  const {
    actions: { createTask },
  } = useTasksStore();
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
  }, [coordinates, createTask]);

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

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={handleSosPress}
        style={[
          styles.sosButton,
          { backgroundColor: theme.colors.semantic.error },
        ]}
      >
        <Text
          variant="body"
          style={[
            {
              color: theme.colors.semantic.white,
            },
          ]}
        >
          SOS
        </Text>
      </TouchableOpacity>

      <CenteredModal
        visible={modalVisible}
        onClose={handleClose}
        title="Immediate Backup"
        showCloseButton={true}
      >
        {modalState === "confirm" && (
          <View style={styles.modalContent}>
            <Text
              variant="body"
              style={{
                color: theme.colors.text.secondary,
              }}
            >
              Are you sure you want to call immediate backup?
            </Text>

            <View style={{ paddingTop: 24, alignItems: "center" }}>
              <Button
                variant="solid"
                size="medium"
                title={`Cancel (${countdown}s)`}
                onPress={handleCancel}
                colorVariant="disabled"
                style={{ width: 120 }}
              />
            </View>
          </View>
        )}

        {modalState === "success" && (
          <View style={styles.modalContent}>
            <Text
              variant="body"
              style={{
                color: theme.colors.text.secondary,
              }}
            >
              Backup is On the Way!
            </Text>

            <View style={{ paddingTop: 24, alignItems: "center" }}>
              <Button
                variant="solid"
                size="medium"
                title="Okay"
                onPress={handleOkay}
                colorVariant="secondary"
                style={{ width: 100 }}
              />
            </View>
          </View>
        )}

        {modalState === "cancel" && (
          <View style={styles.modalContent}>
            <Text
              variant="body"
              style={{
                color: theme.colors.text.secondary,
              }}
            >
              Backup has been cancelled
            </Text>

            <View style={{ paddingTop: 24, alignItems: "center" }}>
              <Button
                variant="solid"
                size="medium"
                title="Okay"
                onPress={handleOkay}
                colorVariant="secondary"
                style={{ width: 100 }}
              />
            </View>
          </View>
        )}
      </CenteredModal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  sosButton: {
    width: "100%",
    height: 40,
    borderRadius: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "100%",
  },
});
