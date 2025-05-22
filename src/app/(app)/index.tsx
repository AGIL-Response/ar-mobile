import { LocationDisplay } from '@/components/location/location-display';
import { FocusAwareStatusBar, ScrollView, Text, View } from '@/components/ui';
import { translate } from '@/lib';
import useCurrentLocation from '@/lib/hooks/use-current-location';
import useAuthStore from '@/stores/auth';
import { useEffect } from 'react';

const Home = () => {
  const { location, errorMsg } = useCurrentLocation();

  let locationText = 'Waiting...';
  if (errorMsg) {
    locationText = errorMsg;
  } else if (location) {
    locationText = '';
  }

  useEffect(() => {
    console.log(`\x1b[36m🐣️ index location update \x1b[0m`);
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
          {location && <LocationDisplay locationData={location} />}
        </View>
      </ScrollView>
    </>
  );
};

export default Home;
