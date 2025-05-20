import { LocationDisplay } from '@/components/location/location-display';
import { Button, FocusAwareStatusBar, ScrollView, Text, View } from "@/components/ui";
import { translate } from '@/lib';
import useCurrentLocation from '@/lib/hooks/use-current-location';
import { bftApi } from "@/api";
import useAuthStore from "@/stores/auth";

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
        <Button label={"Get Entity"} className={'self-center'} onPress={async () => {
          try{
            const userId = useAuthStore.getState().user.username;
            const response = await bftApi.queryGeoEntities({entity_id: userId});
          }catch (e) {
            console.log(
              `\x1b[31m🐣️ index exception: `,
              `${JSON.stringify(e, undefined, 2)}\x1b[0m`,
            );
          }
        }}/>
        <Button label={"Create Entity"} className={'self-center'} onPress={async () => {
          try{
            const userId = useAuthStore.getState().user.username;
            const username = useAuthStore.getState().user.username;
            const lat = location?.coords?.latitude;
            const lon = location?.coords?.longitude;
            if (lat && lon) {
              const response = await bftApi.createGeoEntity({
                entity_id: userId,
                kind: 'aircraft',
                lat: lat,
                lon: lon,
                callsign: username,
                trackable: true,
              });
            } else {
              console.log(`\x1b[31m🐣️ index lat lon not found!\x1b[0m`);
            }
          }catch (e) {
            console.log(
              `\x1b[31m🐣️ index exception: `,
              `${JSON.stringify(e, undefined, 2)}\x1b[0m`,
            );
          }
        }}/>
        <Button label={"Update Location"} className={'self-center'} onPress={async () => {
          try{
            const gisId = useAuthStore.getState().user.username;
            const latitude = location?.coords?.latitude;
            const longtiude = location?.coords?.longitude;
            if (latitude && longtiude) {
              const response = await bftApi.updatePosition(gisId, {latitude, longtiude});
            } else {
              console.log(`\x1b[31m🐣️ Update Location location not found! \x1b[0m`);
            }

          }catch (e) {
            console.log(
              `\x1b[31m🐣️ index exception: `,
              `${JSON.stringify(e, undefined, 2)}\x1b[0m`,
            );
          }
        }}/>
      </ScrollView>
    </>
  );
};

export default Home;
