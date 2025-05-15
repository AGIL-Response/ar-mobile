import React from 'react';
import { View } from 'react-native';

import { FocusAwareStatusBar } from '@/components/ui';

const Home = () => {
  return (
    <View className="flex-1 ">
      <FocusAwareStatusBar />
    </View>
  );
};

export default Home;
