import * as React from "react";
import {StyleSheet, View, Text} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Border from "../assets/Border.svg"
import Cap from "../assets/Cap.svg"
import Wifi from "../assets/Wifi.svg"
import Cellular from "../assets/Cellular.svg"
import Frame7 from "../assets/Frame-7.svg"
import User02 from "../assets/user-02.svg"
import User021 from "../assets/user-02.svg"
import Component from "../assets/01.svg"
import Component1 from "../assets/02.svg"
import Component2 from "../assets/03.svg"
import Frame17 from "../assets/Frame-17.svg"
import Paperclip from "../assets/paperclip.svg"
import Microphone01 from "../assets/microphone-01.svg"
import { Color, Gap, FontSize, FontFamily, Padding, Border } from "../GlobalStyles";

const ChatDetail = () => {

  return (
    <SafeAreaView style={styles.chat}>
      <View style={styles.view}>
        <View style={styles.statusBariphone12Mini}>
          <View style={styles.statusiphone12Mini}>
            <View style={styles.batteryiphone12Mini}>
              <Border style={[styles.borderIcon, styles.iconLayout]} />
              <Cap style={[styles.capIcon, styles.iconLayout]} />
              <View style={styles.capacity} />
            </View>
            <Wifi style={styles.wifiIcon} width={15} height={11} />
            <Cellular style={styles.cellularIcon} width={17} height={11} />
          </View>
          <Text style={styles.time}>9:41</Text>
        </View>
        <View style={[styles.appBar, styles.rightFlexBox]}>
          <View style={styles.dark}>
            <Frame7 style={styles.darkChild} width={16} height={32} />
          </View>
          <View style={styles.textContent}>
            <Text style={styles.headline}>Team-Wide</Text>
            <Text style={styles.supportingText}>Supporting text</Text>
          </View>
        </View>
        <View style={styles.separateParent}>
          <View style={styles.separate}>
            <View style={[styles.separateChild, styles.userAvatarBorder]} />
            <Text style={styles.today}>Today</Text>
          </View>
          <View style={styles.chatFlexBox}>
            <View style={[styles.userAvatar, styles.userLayout]}>
              <Text style={[styles.jb, styles.jbTypo]}>LT</Text>
            </View>
            <View style={[styles.frameParent, styles.frameLayout]}>
              <View style={styles.lonaTranWrapper}>
                <Text style={[styles.lonaTran, styles.jbTypo]}>Lona Yu</Text>
              </View>
              <Text style={styles.jobTypo}>Hi</Text>
            </View>
            <Text style={styles.today}>11:30</Text>
          </View>
          <View style={[styles.chatChatMessageDark, styles.chatFlexBox]}>
            <Text style={styles.today}>11:33</Text>
            <View style={[styles.frameGroup, styles.frameGroupBorder]}>
              <View style={styles.lonaTranWrapper}>
                <Text style={[styles.lonaTran, styles.jbTypo]}>Commander Alex</Text>
              </View>
              <Text style={[styles.chatJobTitleValue, styles.jobTypo]}>Hi Lona Yu, please help her review that candidate AI developing skills.</Text>
            </View>
            <View style={[styles.chatUserAvatar, styles.frameGroupBorder]}>
              <User02 style={styles.user02Icon} width={20} height={20} />
            </View>
          </View>
          <View style={styles.chatFlexBox}>
            <View style={[styles.userAvatar, styles.userLayout]}>
              <User021 style={styles.user02Icon} width={20} height={20} />
            </View>
            <View style={styles.typingComponent4}>
              <Component style={styles.icon} width={8} height={8} />
              <Component1 style={styles.chatIcon} width={6} height={6} />
              <Component2 style={styles.chatIcon} width={6} height={6} />
            </View>
          </View>
        </View>
        <View style={[styles.textbar, styles.textbarBg]}>
          <View style={[styles.left, styles.leftFlexBox]}>
            <Frame17 style={styles.leftChild} width={38} height={38} />
            <Text style={styles.jobTypo}>Type here...</Text>
          </View>
          <View style={styles.rightFlexBox}>
            <Paperclip style={styles.paperclipIcon} width={18} height={18} />
            <Microphone01 style={styles.paperclipIcon} width={18} height={18} />
          </View>
        </View>
      </View>
    </SafeAreaView>);
};

const styles = StyleSheet.create({
  chat: {
    backgroundColor: Color.colorGray300,
    flex: 1
  },
  iconLayout: {
    maxHeight: "100%",
    maxWidth: "100%",
    position: "absolute",
    overflow: "hidden"
  },
  rightFlexBox: {
    gap: Gap.gap_16,
    flexDirection: "row"
  },
  userAvatarBorder: {
    borderColor: Color.colorDimgray,
    borderStyle: "solid"
  },
  userLayout: {
    height: 40,
    width: 40,
    alignItems: "center"
  },
  jbTypo: {
    lineHeight: 21,
    fontSize: FontSize.size_14,
    fontFamily: FontFamily.manropeSemiBold,
    color: Color.colorWhite,
    fontWeight: "600"
  },
  frameLayout: {
    maxWidth: 560,
    paddingHorizontal: Padding.p_12,
    borderTopRightRadius: Border.br_12,
    borderTopLeftRadius: Border.br_12,
    gap: Gap.gap_4,
    paddingVertical: Padding.p_8
  },
  chatFlexBox: {
    gap: Gap.gap_12,
    paddingVertical: Padding.p_12,
    paddingHorizontal: 0,
    alignItems: "flex-end",
    alignSelf: "stretch",
    flexDirection: "row"
  },
  frameGroupBorder: {
    borderColor: Color.colorDarkslateblue,
    backgroundColor: Color.colorGray200,
    justifyContent: "center",
    borderWidth: 1,
    borderStyle: "solid"
  },
  jobTypo: {
    color: Color.colorGainsboro,
    lineHeight: 18,
    textAlign: "left",
    fontFamily: FontFamily.manropeRegular,
    fontSize: FontSize.size_12
  },
  textbarBg: {
    backgroundColor: Color.colorGray100,
    borderRadius: Border.br_100
  },
  leftFlexBox: {
    flexDirection: "row",
    alignItems: "center"
  },
  view: {
    width: "100%",
    height: 812,
    overflow: "hidden",
    backgroundColor: Color.colorGray300,
    flex: 1
  },
  statusBariphone12Mini: {
    top: 0,
    height: 50,
    width: 375,
    left: 0,
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
    left: "0%",
    borderRadius: 3,
    opacity: 0.5
  },
  capIcon: {
    height: "35.4%",
    width: "5.65%",
    top: "32.45%",
    right: "0.13%",
    bottom: "32.15%",
    left: "94.22%"
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
  appBar: {
    top: 50,
    height: 56,
    paddingVertical: Padding.p_8,
    paddingHorizontal: Padding.p_16,
    gap: Gap.gap_16,
    alignItems: "center",
    width: 375,
    left: 0,
    position: "absolute"
  },
  dark: {
    width: 32,
    borderColor: Color.colorGray100,
    paddingHorizontal: Padding.p_8,
    paddingVertical: 0,
    borderStyle: "solid",
    justifyContent: "center",
    height: 32,
    borderWidth: 1,
    borderRadius: Border.br_100,
    alignItems: "center",
    flexDirection: "row",
    overflow: "hidden",
    backgroundColor: Color.colorGray300
  },
  darkChild: {
    width: 16,
    height: 32
  },
  textContent: {
    justifyContent: "center",
    flex: 1
  },
  headline: {
    fontSize: 20,
    lineHeight: 22,
    fontFamily: FontFamily.manropeSemiBold,
    textAlign: "center",
    color: Color.colorWhite,
    fontWeight: "600",
    overflow: "hidden"
  },
  supportingText: {
    width: 295,
    letterSpacing: 0.5,
    lineHeight: 16,
    fontWeight: "500",
    fontFamily: FontFamily.robotoMedium,
    color: Color.colorDarkslategray,
    display: "none",
    fontSize: FontSize.size_12,
    textAlign: "center",
    overflow: "hidden"
  },
  separateParent: {
    top: 114,
    gap: Gap.gap_4,
    justifyContent: "flex-end",
    paddingVertical: 0,
    paddingHorizontal: Padding.p_16,
    alignItems: "center",
    width: 375,
    left: 0,
    position: "absolute",
    overflow: "hidden"
  },
  separate: {
    gap: 13,
    alignItems: "center"
  },
  separateChild: {
    borderTopWidth: 0.4,
    height: 0,
    width: 375
  },
  today: {
    fontSize: FontSize.size_10,
    lineHeight: 12,
    color: Color.colorDarkgray,
    textAlign: "left",
    fontFamily: FontFamily.manropeRegular
  },
  userAvatar: {
    backgroundColor: Color.colorGray100,
    borderRadius: Border.br_100,
    borderColor: Color.colorDimgray,
    borderStyle: "solid",
    justifyContent: "center",
    borderWidth: 1,
    width: 40
  },
  jb: {
    display: "flex",
    height: 40,
    width: 40,
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center"
  },
  frameParent: {
    borderBottomRightRadius: Border.br_12,
    maxWidth: 560,
    backgroundColor: Color.colorGray100,
    borderColor: Color.colorDimgray,
    justifyContent: "center",
    borderWidth: 1,
    borderStyle: "solid"
  },
  lonaTranWrapper: {
    alignItems: "flex-end",
    flexDirection: "row"
  },
  lonaTran: {
    textAlign: "left"
  },
  chatChatMessageDark: {
    justifyContent: "flex-end",
    gap: Gap.gap_12,
    paddingVertical: Padding.p_12,
    paddingHorizontal: 0
  },
  frameGroup: {
    borderBottomLeftRadius: Border.br_12,
    maxWidth: 560,
    paddingHorizontal: Padding.p_12,
    borderTopRightRadius: Border.br_12,
    borderTopLeftRadius: Border.br_12,
    gap: Gap.gap_4,
    paddingVertical: Padding.p_8,
    flex: 1
  },
  chatJobTitleValue: {
    alignSelf: "stretch",
    color: Color.colorGainsboro,
    lineHeight: 18
  },
  chatUserAvatar: {
    height: 40,
    width: 40,
    alignItems: "center",
    borderRadius: Border.br_100
  },
  user02Icon: {
    width: 20,
    height: 20
  },
  typingComponent4: {
    height: 37,
    paddingHorizontal: Padding.p_12,
    borderTopRightRadius: Border.br_12,
    borderTopLeftRadius: Border.br_12,
    borderBottomRightRadius: Border.br_12,
    backgroundColor: Color.colorGray100,
    borderColor: Color.colorDimgray,
    gap: Gap.gap_4,
    justifyContent: "center",
    borderWidth: 1,
    borderStyle: "solid",
    paddingVertical: Padding.p_8,
    alignItems: "center",
    flexDirection: "row",
    overflow: "hidden"
  },
  icon: {
    width: 8,
    height: 8
  },
  chatIcon: {
    width: 6,
    height: 6
  },
  textbar: {
    marginLeft: -171.5,
    top: 726,
    left: "50%",
    width: 343,
    justifyContent: "space-between",
    paddingLeft: Padding.p_8,
    paddingTop: Padding.p_8,
    paddingRight: Padding.p_16,
    paddingBottom: Padding.p_8,
    gap: 0,
    alignItems: "center",
    flexDirection: "row",
    position: "absolute"
  },
  left: {
    gap: 14,
    alignItems: "center"
  },
  leftChild: {
    width: 38,
    height: 38,
    borderRadius: Border.br_100
  },
  paperclipIcon: {
    width: 18,
    height: 18
  }
});

export default ChatDetail;


/* Fonts */
export const FontFamily = {
  manropeRegular: "Manrope-Regular",
  robotoMedium: "Roboto-Medium",
  manropeSemiBold: "Manrope-SemiBold",
  sFProText: "SF Pro Text",
};
/* Font sizes */
export const FontSize = {
  size_10: 10,
  size_12: 12,
  size_14: 14,
};
/* Colors */
export const Color = {
  colorGray100: "#272b30",
  colorDimgray: "#4f575e",
  colorGray200: "#03152f",
  colorGray300: "#101213",
  colorGainsboro: "#dee2e6",
  colorDarkgray: "#adb5bd",
  colorWhite: "#fff",
  colorDarkslategray: "#49454f",
  colorDarkslateblue: "#083475",
};
/* Gaps */
export const Gap = {
  gap_4: 4,
  gap_12: 12,
  gap_16: 16,
};
/* Paddings */
export const Padding = {
  p_8: 8,
  p_12: 12,
  p_16: 16,
};
/* border radiuses */
export const Border = {
  br_12: 12,
  br_100: 100,
};