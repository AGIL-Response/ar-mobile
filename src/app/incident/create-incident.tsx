import { Stack } from 'expo-router';
import * as React from 'react';
import { View } from 'react-native';

import { CreateIncidentForm } from '@/components/incident/create-incident-form';
import { Text } from '@/components/ui';
import useCurrentLocation from '@/lib/hooks/use-current-location';
import { translate } from '@/lib/i18n';

export default function CreateIncidentScreen() {
  const { location, errorMsg } = useCurrentLocation();

  return (
    <View className="flex-1">
      <Stack.Screen
        options={{
          title: translate('incident.create'),
        }}
      />
      {errorMsg ? (
        <View className="flex-1 items-center justify-center p-4">
          <Text className="text-center text-red-500">{errorMsg}</Text>
        </View>
      ) : !location ? (
        <View className="flex-1 items-center justify-center p-4">
          <Text className="text-center text-gray-500">
            {translate('location.waiting')}
          </Text>
        </View>
      ) : (
        <CreateIncidentForm
          initialLocation={[
            location.coords.longitude,
            location.coords.latitude,
          ]}
        />
      )}
    </View>
  );
}
