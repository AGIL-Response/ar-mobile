/**
 * Home Screen
 * Simple greeting screen demonstrating the new component system
 */

import React from 'react';

import {
  BodyText,
  Button,
  Card,
  Center,
  Column,
  GhostButton,
  Heading1,
  Heading2,
  OutlineButton,
  PrimaryButton,
  Row,
  Screen,
  ThemeToggle,
  View,
} from '@/components/ui';
import useAuthStore from '@/stores/auth';

export default function HomeScreen() {
  const authState = useAuthStore();

  const handleLogout = () => {
    authState.actions.logout();
  };

  return (
    <Screen>
      <Column gap="xl" padding="xxl">
        {/* Header */}
        <Row justify="space-between" align="center">
          <Heading1>Welcome Home!</Heading1>
          <ThemeToggle />
        </Row>

        {/* Greeting Card */}
        <Card>
          <Column gap="lg" align="center">
            <Heading2 centered>Hello, User!</Heading2>
            <BodyText centered>
              This is your new home screen built with our custom design system
              components.
            </BodyText>
          </Column>
        </Card>

        {/* Demo Components */}
        <Card>
          <Column gap="lg">
            <Heading2>Component Demo</Heading2>

            <Column gap="sm">
              <BodyText>Button Variants:</BodyText>
              <PrimaryButton
                title="Primary Button"
                onPress={() => console.log('Primary pressed')}
              />
              <OutlineButton
                title="Outline Button"
                onPress={() => console.log('Outline pressed')}
              />
              <GhostButton
                title="Ghost Button"
                onPress={() => console.log('Ghost pressed')}
              />
            </Column>

            <Column gap="sm">
              <BodyText>Button Sizes:</BodyText>
              <Row gap="sm" justify="space-between">
                <View flex={1}>
                  <Button title="Small" size="small" fullWidth />
                </View>
                <View flex={1}>
                  <Button title="Medium" size="medium" fullWidth />
                </View>
                <View flex={1}>
                  <Button title="Large" size="large" fullWidth />
                </View>
              </Row>
            </Column>
          </Column>
        </Card>

        {/* Logout Section */}
        <Center>
          <Button
            title="Logout"
            colorVariant="error"
            variant="outline"
            onPress={handleLogout}
          />
        </Center>
      </Column>
    </Screen>
  );
}
