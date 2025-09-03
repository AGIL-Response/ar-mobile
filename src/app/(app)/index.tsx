import { useEffect } from 'react';

import { FocusAwareStatusBar, ScrollView, Text, View } from '@/components/ui';
import { translate } from '@/lib';
import useCurrentLocation from '@/lib/hooks/use-current-location';
import useAuthStore from '@/stores/auth';

const Home = () => {
  const { location, errorMsg } = useCurrentLocation();

  let locationText = 'Waiting...';
  if (errorMsg) {
    locationText = errorMsg;
  } else if (location) {
    locationText = '';
  }

  useEffect(() => {
    const timestamp = new Date().toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    console.log(`\x1b[36m[${timestamp}] 🐣️ index location update \x1b[0m`);
    if (location?.coords?.latitude && location?.coords.longitude) {
      useAuthStore
        .getState()
        .actions.updateGeoEntityLocation(
          location?.coords.latitude,
          location?.coords.longitude
        );
    }
  }, [location]);

  return (
    <>
      <FocusAwareStatusBar />
      <ScrollView>
        <View className="flex-1 px-4 pt-4">
          <View className={'flex-row justify-between'}>
            <Text className="text-xl font-bold">
              {translate('location.title')}
            </Text>
            <Text>{locationText}</Text>
          </View>
        </View>
      </ScrollView>
    </>
  );
};

export default Home;
