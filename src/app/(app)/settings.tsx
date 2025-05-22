/* eslint-disable react/react-in-jsx-scope */
import { Env } from '@env';
import React from 'react';
import { useEffect } from 'react';

import { Item } from '@/components/settings/item';
import { ItemsContainer } from '@/components/settings/items-container';
import { FocusAwareStatusBar, ScrollView, Text, View } from '@/components/ui';
import { translate } from '@/lib';
import useAuthStore from '@/stores/auth';

export default function Settings() {
  const authState = useAuthStore();

  return (
    <>
      <FocusAwareStatusBar />

      <ScrollView>
        <View className="flex-1 px-4 pt-16 ">
          <Text className="text-xl font-bold">
            {translate('settings.title')}
          </Text>

          <ItemsContainer title="settings.about">
            <Item text="settings.username" value={authState.user?.username} />
            <Item text="Email" value={authState.user?.email} />
            <Item text="User ID" value={authState.user?.userId} />
          </ItemsContainer>

          {authState.geoEntity && (
            <ItemsContainer title="Geo Entity">
              <Item text="ID" value={authState.geoEntity.id} />
              <Item text="Entity ID" value={authState.geoEntity.entity_id} />
              <Item text="Kind" value={authState.geoEntity.kind} />
              <Item text="Active" value={String(authState.geoEntity.active)} />
              <Item text="GIS ID" value={authState.geoEntity.gis_id} />
              <Item text="Created At" value={authState.geoEntity.create_at} />
              <Item text="Updated At" value={authState.geoEntity.update_at} />
            </ItemsContainer>
          )}

          {/*<ItemsContainer title="settings.generale">*/}
          {/*  <LanguageItem />*/}
          {/*  <ThemeItem />*/}
          {/*</ItemsContainer>*/}

          <View className={'mt-8'}>
            <ItemsContainer>
              <Item text="settings.app_name" value={Env.NAME} />
              <Item text="settings.version" value={Env.VERSION} />
            </ItemsContainer>
          </View>

          <View className="mt-8">
            <ItemsContainer>
              <Item
                text="settings.logout"
                onPress={() => authState.actions.logout()}
              />
            </ItemsContainer>
          </View>
        </View>
      </ScrollView>
    </>
  );
}
