import { LocationDisplay } from '@/components/location/location-display';
import { FocusAwareStatusBar, ScrollView, Text, View } from '@/components/ui';
import { translate } from '@/lib';
import useCurrentLocation from '@/lib/hooks/use-current-location';

const Home = () => {
  const { location, errorMsg } = useCurrentLocation();

  let locationText = 'Waiting...';
  if (errorMsg) {
    locationText = errorMsg;
  } else if (location) {
    locationText = '';
  }

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
