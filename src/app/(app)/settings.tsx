/* eslint-disable react/react-in-jsx-scope */
import { Env } from "@env";

import { Item } from "@/components/settings/item";
import { ItemsContainer } from "@/components/settings/items-container";
import { FocusAwareStatusBar, ScrollView, Text, View } from "@/components/ui";
import { translate } from "@/lib";
import useAuthStore from "@/stores/auth";
import { useEffect } from "react";

export default function Settings() {
  const authState = useAuthStore();

  useEffect(() => {
    console.log(`\x1b[36m🐣️ settings \x1b[0m`);
  }, []);

  return (
    <>
      <FocusAwareStatusBar />

      <ScrollView>
        <View className="flex-1 px-4 pt-16 ">
          <Text className="text-xl font-bold">
            {translate("settings.title")}
          </Text>

          <ItemsContainer title="settings.about">
            <Item text="settings.username" value={authState.user?.username} />
          </ItemsContainer>

          {/*<ItemsContainer title="settings.generale">*/}
          {/*  <LanguageItem />*/}
          {/*  <ThemeItem />*/}
          {/*</ItemsContainer>*/}

          <View className={"mt-8"}>
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
