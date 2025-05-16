import React from 'react';
import { Text,View } from 'react-native';

import { FocusAwareStatusBar } from '@/components/ui';
import useCurrentLocation from '@/lib/hooks/use-current-location';

const Home = () => {
  const { location, errorMsg } = useCurrentLocation();

  let text = 'Waiting...';
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = JSON.stringify(location);
  }

  return (
    <View className="flex-1 ">
      <FocusAwareStatusBar />
      <Text>{text}</Text>
    </View>
  );
};

export default Home;
