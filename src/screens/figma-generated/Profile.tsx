import * as React from "react";
import {StyleSheet, View, Text, ImageBackground} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Border from "../assets/Border.svg"
import Cap from "../assets/Cap.svg"
import Wifi from "../assets/Wifi.svg"
import Cellular from "../assets/Cellular.svg"
import Home05 from "../assets/home-05.svg"
import List1 from "../assets/list.svg"
import Messagechatcircle from "../assets/message-chat-circle.svg"
import User01 from "../assets/user-01.svg"
import Trailingelements from "../assets/Trailing-elements.svg"
import Top from "../assets/top.svg"
import Bottom from "../assets/bottom.svg"
import Top1 from "../assets/top.svg"
import Bottom1 from "../assets/bottom.svg"
import Top2 from "../assets/top.svg"
import Bottom2 from "../assets/bottom.svg"
import Top3 from "../assets/top.svg"
import Bottom3 from "../assets/bottom.svg"
import Bell03 from "../assets/bell-03.svg"
import Chevronright from "../assets/chevron-right.svg"
import Vector1 from "../assets/Vector-1.svg"
import Sun from "../assets/sun.svg"
import Chevronright1 from "../assets/chevron-right.svg"
import Vector2 from "../assets/Vector-2.svg"
import Settings01 from "../assets/settings-01.svg"
import Chevronright2 from "../assets/chevron-right.svg"
import { Color, FontFamily, FontSize, Border, Gap, Padding } from "../GlobalStyles";

const Chat = () => {

  return (
    <SafeAreaView style={styles.chat}>
      <View style={styles.view}>
        <View style={styles.statusBariphone12Mini}>
          <View style={styles.statusiphone12Mini}>
            <View style={styles.batteryiphone12Mini}>
              <Border style={[styles.borderIcon, styles.iconCardLayout]} />
              <Cap style={[styles.capIcon, styles.iconCardLayout]} />
              <View style={styles.capacity} />
            </View>
            <Wifi style={styles.wifiIcon} width={15} height={11} />
            <Cellular style={styles.cellularIcon} width={17} height={11} />
          </View>
          <Text style={styles.time}>9:41</Text>
        </View>
        <View style={[styles.navigateBar, styles.navigateBarFlexBox]}>
          <View style={styles.navigateLayout}>
            <Home05 style={[styles.home05Icon, styles.iconLayout]} width={24} height={24} />
            <Text style={[styles.home, styles.homeTypo]}>Home</Text>
          </View>
          <View style={styles.navigateLayout}>
            <List1 style={styles.listIcon} width={24} height={24} />
            <Text style={styles.tasks}>Tasks</Text>
            <View style={[styles.bagde, styles.bagdePosition]}>
              <Text style={[styles.text, styles.headlineTypo]}>1</Text>
            </View>
          </View>
          <View style={styles.navigateLayout}>
            <Messagechatcircle style={styles.listIcon} width={24} height={24} />
            <Text style={styles.tasks}>Chat</Text>
            <View style={[styles.chatBagde, styles.bagdePosition]}>
              <Text style={[styles.text, styles.headlineTypo]}>1</Text>
            </View>
          </View>
          <View style={styles.navigateLayout}>
            <User01 style={[styles.home05Icon, styles.iconLayout]} width={24} height={24} />
            <Text style={[styles.profile, styles.homeTypo]}>Profile</Text>
          </View>
        </View>
        <View style={[styles.appBar, styles.appBarFlexBox]}>
          <View style={styles.textContent}>
            <Text style={[styles.headline, styles.headlineTypo]}>Profile</Text>
            <Text style={styles.supportingText}>Supporting text</Text>
          </View>
          <Trailingelements style={[styles.trailingElementsIcon, styles.iconLayout]} width={24} height={24} />
        </View>
        <View style={[styles.avatarStatus, styles.navigateBarFlexBox]}>
          <View style={[styles.avatar, styles.cardBorder]}>
            <ImageBackground style={styles.imageIcon} resizeMode="cover" source="Image.png">
              <View style={styles.row}>
                <View style={[styles.scaleUnit, styles.scalePosition]}>
                  <Top style={styles.topIcon} />
                  <Bottom style={styles.topIcon} />
                </View>
                <View style={[styles.chatScaleUnit, styles.scalePosition]}>
                  <Top1 style={styles.topIcon} />
                  <Bottom1 style={styles.topIcon} />
                </View>
              </View>
              <View style={styles.row}>
                <View style={[styles.scaleUnit, styles.scalePosition]}>
                  <Top2 style={styles.topIcon} />
                  <Bottom2 style={styles.topIcon} />
                </View>
                <View style={[styles.chatScaleUnit, styles.scalePosition]}>
                  <Top3 style={styles.topIcon} />
                  <Bottom3 style={styles.topIcon} />
                </View>
              </View>
            </ImageBackground>
          </View>
          <View style={styles.indicator} />
        </View>
        <View style={[styles.commander, styles.johnDoe3Position]}>
          <Text style={[styles.chatHeadline, styles.headlineTypo]}>Settings</Text>
          <View style={[styles.cardCardItemDark, styles.cardBorder]}>
            <View style={[styles.bell03Parent, styles.appBarFlexBox]}>
              <Bell03 style={styles.bell03Icon} width={20} height={20} />
              <View style={[styles.frameWrapper, styles.navigateBarFlexBox]}>
                <View style={styles.imageIcon}>
                  <Text style={[styles.johnDoe, styles.johnTypo]}>Notification Preferences</Text>
                </View>
              </View>
              <Chevronright style={styles.chevronRightIcon} width={16} height={16} />
            </View>
            <Vector1 style={[styles.cardCardItemDarkChild, styles.iconCardLayout]} />
            <View style={[styles.bell03Parent, styles.appBarFlexBox]}>
              <Sun style={styles.bell03Icon} width={20} height={20} />
              <View style={[styles.frameWrapper, styles.navigateBarFlexBox]}>
                <View style={styles.imageIcon}>
                  <Text style={[styles.johnDoe, styles.johnTypo]}>Dark Mode</Text>
                </View>
              </View>
              <Chevronright1 style={styles.chevronRightIcon} width={16} height={16} />
            </View>
            <Vector2 style={[styles.cardCardItemDarkChild, styles.iconCardLayout]} />
            <View style={[styles.bell03Parent, styles.appBarFlexBox]}>
              <Settings01 style={styles.bell03Icon} width={20} height={20} />
              <View style={[styles.frameWrapper, styles.navigateBarFlexBox]}>
                <View style={styles.imageIcon}>
                  <Text style={[styles.johnDoe, styles.johnTypo]}>Account Settings</Text>
                </View>
              </View>
              <Chevronright2 style={styles.chevronRightIcon} width={16} height={16} />
            </View>
          </View>
        </View>
        <Text style={[styles.johnDoe3, styles.johnTypo]}>Team Lead, Alpha-7</Text>
        <Text style={[styles.headline2, styles.johnDoe3Position]}>Commander Alex</Text>
      </View>
    </SafeAreaView>);
};

const styles = StyleSheet.create({
  chat: {
    backgroundColor: Color.colorGray400,
    flex: 1
  },
  iconCardLayout: {
    maxHeight: "100%",
    maxWidth: "100%",
    overflow: "hidden"
  },
  navigateBarFlexBox: {
    alignItems: "center",
    flexDirection: "row"
  },
  iconLayout: {
    width: 24,
    height: 24
  },
  homeTypo: {
    fontFamily: FontFamily.manropeMedium,
    fontWeight: "500",
    lineHeight: 18,
    fontSize: FontSize.size_12,
    alignSelf: "stretch",
    textAlign: "center"
  },
  bagdePosition: {
    zIndex: 2,
    backgroundColor: Color.colorFirebrick,
    borderRadius: Border.br_100,
    top: -4,
    height: 16,
    width: 16,
    position: "absolute"
  },
  headlineTypo: {
    fontFamily: FontFamily.manropeSemiBold,
    fontWeight: "600"
  },
  appBarFlexBox: {
    gap: Gap.gap_8,
    alignItems: "center",
    flexDirection: "row"
  },
  cardBorder: {
    borderWidth: 1,
    borderStyle: "solid"
  },
  scalePosition: {
    width: 48,
    top: 0,
    position: "absolute"
  },
  johnDoe3Position: {
    left: "50%",
    position: "absolute"
  },
  johnTypo: {
    fontFamily: FontFamily.manropeRegular,
    lineHeight: 21,
    fontSize: FontSize.size_14
  },
  view: {
    height: 812,
    overflow: "hidden",
    width: "100%",
    backgroundColor: Color.colorGray400,
    flex: 1
  },
  statusBariphone12Mini: {
    height: 50,
    width: 375,
    left: 0,
    top: 0,
    position: "absolute"
  },
  statusiphone12Mini: {
    top: 21,
    right: 11,
    width: 68,
    height: 13,
    position: "absolute"
  },
  batteryiphone12Mini: {
    top: 1,
    right: 0,
    width: 23,
    height: 11,
    position: "absolute"
  },
  borderIcon: {
    height: "100%",
    width: "90%",
    top: "0%",
    right: "10%",
    bottom: "0%",
    borderRadius: 3,
    opacity: 0.5,
    left: "0%",
    maxHeight: "100%",
    position: "absolute"
  },
  capIcon: {
    height: "35.4%",
    width: "5.65%",
    top: "32.45%",
    right: "0.13%",
    bottom: "32.15%",
    left: "94.22%",
    position: "absolute"
  },
  capacity: {
    height: "64.6%",
    width: "72.61%",
    top: "17.7%",
    right: "18.7%",
    bottom: "17.7%",
    left: "8.7%",
    borderRadius: 1,
    backgroundColor: Color.colorWhite,
    position: "absolute"
  },
  wifiIcon: {
    width: 15,
    height: 11
  },
  cellularIcon: {
    width: 17,
    height: 11
  },
  time: {
    top: 19,
    left: 27,
    fontSize: 15,
    letterSpacing: -0.28,
    fontFamily: FontFamily.sFProText,
    textAlign: "center",
    color: Color.colorWhite,
    fontWeight: "600",
    position: "absolute"
  },
  navigateBar: {
    marginLeft: -187.5,
    bottom: 0,
    justifyContent: "space-between",
    paddingTop: Padding.p_8,
    paddingBottom: 24,
    gap: 0,
    left: "50%",
    position: "absolute",
    width: 375,
    backgroundColor: Color.colorGray400
  },
  navigateLayout: {
    gap: Gap.gap_4,
    width: 94,
    alignItems: "center"
  },
  home05Icon: {
    height: 24
  },
  home: {
    color: Color.colorWhite
  },
  listIcon: {
    zIndex: 0,
    height: 24,
    width: 24
  },
  tasks: {
    zIndex: 1,
    fontFamily: FontFamily.manropeMedium,
    fontWeight: "500",
    lineHeight: 18,
    fontSize: FontSize.size_12,
    alignSelf: "stretch",
    textAlign: "center",
    color: Color.colorWhite
  },
  bagde: {
    left: 50
  },
  text: {
    marginTop: -9,
    top: "50%",
    display: "flex",
    justifyContent: "center",
    lineHeight: 18,
    fontFamily: FontFamily.manropeSemiBold,
    fontSize: FontSize.size_12,
    alignItems: "center",
    textAlign: "center",
    color: Color.colorWhite,
    left: "0%",
    position: "absolute",
    width: "100%"
  },
  chatBagde: {
    left: 51
  },
  profile: {
    color: Color.colorRoyalblue
  },
  appBar: {
    top: 50,
    height: 56,
    paddingVertical: Padding.p_8,
    paddingHorizontal: Padding.p_16,
    width: 375,
    left: 0,
    position: "absolute"
  },
  textContent: {
    justifyContent: "center",
    flex: 1
  },
  headline: {
    fontSize: 20,
    lineHeight: 22,
    textAlign: "center",
    color: Color.colorWhite,
    overflow: "hidden"
  },
  supportingText: {
    width: 263,
    letterSpacing: 0.5,
    lineHeight: 16,
    fontFamily: FontFamily.robotoMedium,
    color: Color.colorDarkslategray,
    display: "none",
    fontWeight: "500",
    fontSize: FontSize.size_12,
    textAlign: "center",
    overflow: "hidden"
  },
  trailingElementsIcon: {
    height: 24
  },
  avatarStatus: {
    marginLeft: -47.5,
    top: 122,
    width: 96,
    height: 96,
    justifyContent: "center",
    left: "50%",
    position: "absolute"
  },
  avatar: {
    backgroundColor: Color.colorLightgray,
    borderColor: Color.colorLightgray,
    borderRadius: Border.br_64,
    borderWidth: 1,
    justifyContent: "center",
    zIndex: 0,
    alignItems: "center",
    flexDirection: "row",
    overflow: "hidden",
    flex: 1
  },
  imageIcon: {
    flex: 1
  },
  row: {
    height: 48,
    opacity: 0,
    alignSelf: "stretch"
  },
  scaleUnit: {
    left: 0
  },
  topIcon: {
    opacity: 0.7,
    alignSelf: "stretch",
    height: 24,
    maxWidth: "100%",
    overflow: "hidden",
    width: "100%"
  },
  chatScaleUnit: {
    left: 48
  },
  indicator: {
    right: -2,
    bottom: -2,
    backgroundColor: Color.colorGray100,
    borderColor: Color.colorBlack,
    borderWidth: 1.7,
    height: 15,
    borderStyle: "solid",
    borderRadius: Border.br_64,
    display: "none",
    zIndex: 1,
    width: 15,
    position: "absolute"
  },
  commander: {
    marginLeft: -171.5,
    top: 331,
    width: 343,
    gap: 12
  },
  chatHeadline: {
    fontSize: 16,
    color: Color.colorGainsboro,
    textAlign: "left",
    lineHeight: 18,
    fontFamily: FontFamily.manropeSemiBold,
    overflow: "hidden"
  },
  cardCardItemDark: {
    borderRadius: 8,
    backgroundColor: Color.colorGray300,
    borderColor: Color.colorGray200,
    paddingVertical: 12,
    gap: 16,
    paddingHorizontal: Padding.p_16,
    alignSelf: "stretch"
  },
  bell03Parent: {
    alignSelf: "stretch"
  },
  bell03Icon: {
    width: 20,
    height: 20
  },
  frameWrapper: {
    flex: 1
  },
  johnDoe: {
    textAlign: "left",
    color: Color.colorWhite
  },
  chevronRightIcon: {
    height: 16,
    width: 16
  },
  cardCardItemDarkChild: {
    alignSelf: "stretch",
    width: "100%"
  },
  johnDoe3: {
    marginLeft: -62.5,
    top: 270,
    color: Color.colorDarkgray,
    left: "50%",
    position: "absolute",
    textAlign: "center"
  },
  headline2: {
    marginLeft: -90.5,
    top: 238,
    fontSize: 22,
    lineHeight: 24,
    fontWeight: "700",
    fontFamily: FontFamily.manropeBold,
    textAlign: "center",
    color: Color.colorWhite,
    overflow: "hidden"
  }
});

export default Chat;


/* Fonts */
export const FontFamily = {
  sFProText: "SF Pro Text",
  manropeMedium: "Manrope-Medium",
  manropeSemiBold: "Manrope-SemiBold",
  robotoMedium: "Roboto-Medium",
  manropeRegular: "Manrope-Regular",
  manropeBold: "Manrope-Bold",
};
/* Font sizes */
export const FontSize = {
  size_12: 12,
  size_14: 14,
};
/* Colors */
export const Color = {
  colorGray200: "#272b30",
  colorGray300: "#1e1e1e",
  colorFirebrick: "#c92a2a",
  colorRoyalblue: "#1068eb",
  colorGray400: "#101213",
  colorGray100: "#949494",
  colorDarkgray: "#adb5bd",
  colorGainsboro: "#dee2e6",
  colorBlack: "#000",
  colorLightgray: "rgba(209, 209, 209, 0.05)",
  colorDarkslategray: "#49454f",
  colorWhite: "#fff",
};
/* Gaps */
export const Gap = {
  gap_4: 4,
  gap_8: 8,
};
/* Paddings */
export const Padding = {
  p_8: 8,
  p_16: 16,
};
/* border radiuses */
export const Border = {
  br_64: 64,
  br_100: 100,
};