import * as React from "react";
import {StyleSheet, View, Text} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Border from "../assets/Border.svg"
import Cap from "../assets/Cap.svg"
import Wifi from "../assets/Wifi.svg"
import Cellular from "../assets/Cellular.svg"
import Frame7 from "../assets/Frame-7.svg"
import Icon1 from "../assets/Icon1.svg"
import Icon2 from "../assets/Icon2.svg"
import { Color, FontFamily, FontSize, Border, Padding, Gap } from "../GlobalStyles";

const TaskDetail = () => {

  return (
    <SafeAreaView style={styles.taskDetail}>
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
        <View style={styles.appBar}>
          <View style={[styles.dark, styles.darkBorder]}>
            <Frame7 style={styles.darkChild} width={16} height={32} />
          </View>
          <View style={styles.textContent}>
            <Text style={styles.headline}>Task Detail</Text>
            <Text style={styles.supportingText}>Supporting text</Text>
          </View>
        </View>
        <View style={styles.tasks}>
          <View style={styles.commander}>
            <Text style={styles.taskDetailHeadline} numberOfLines={2}>Secure perimeter at Sector Gamma</Text>
            <Text style={[styles.text, styles.textTypo]}>Upon arrival, establish a secure perimeter around the designated Sector Gamma. Coordinate with local law enforcement and ensure public safety is prioritized. Report any suspicious activity immediately to command. Utilize drone surveillance for initial assessment.</Text>
          </View>
          <View style={styles.content}>
            <View style={styles.commander}>
              <Text style={styles.taskDetailHeadline} numberOfLines={2}>Checklist</Text>
              <View style={[styles.matchCard, styles.matchCardLayout]}>
                <View style={[styles.checkboxDarkMode, styles.darkFlexBox]}>
                  <View style={[styles.checkbox, styles.checkboxBg]}>
                    <Icon1 style={styles.icon} width={16} height={16} />
                  </View>
                  <Text style={styles.textTypo}>Confirm arrival at Sector Gamma</Text>
                </View>
              </View>
              <View style={[styles.matchCard, styles.matchCardLayout]}>
                <View style={[styles.checkboxDarkMode, styles.darkFlexBox]}>
                  <View style={[styles.checkbox, styles.checkboxBg]}>
                    <Icon2 style={styles.icon} width={16} height={16} />
                  </View>
                  <Text style={styles.textTypo}>Establish outer cordon with barricades</Text>
                </View>
              </View>
              <View style={[styles.matchCard, styles.matchCardLayout]}>
                <View style={[styles.checkboxDarkMode, styles.darkFlexBox]}>
                  <View style={[styles.checkbox2, styles.darkBorder]} />
                  <Text style={styles.textTypo}>Deploy drone for aerial assessment</Text>
                </View>
              </View>
              <View style={[styles.matchCard, styles.matchCardLayout]}>
                <View style={[styles.checkboxDarkMode, styles.darkFlexBox]}>
                  <View style={[styles.checkbox2, styles.darkBorder]} />
                  <Text style={[styles.checkboxText3, styles.textTypo]}>Verify communication channels with command</Text>
                </View>
              </View>
              <View style={[styles.matchCard, styles.matchCardLayout]}>
                <View style={[styles.checkboxDarkMode, styles.darkFlexBox]}>
                  <View style={[styles.checkbox2, styles.darkBorder]} />
                  <Text style={styles.textTypo}>Brief on-site personnel on safety protocols</Text>
                </View>
              </View>
              <View style={[styles.matchCard, styles.matchCardLayout]}>
                <View style={[styles.checkboxDarkMode, styles.darkFlexBox]}>
                  <View style={[styles.checkbox2, styles.darkBorder]} />
                  <Text style={styles.textTypo}>Identify and secure all access points</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
        <View style={[styles.taskDetailDark, styles.buttonWrapperFlexBox]}>
          <View style={styles.buttonWrapperFlexBox}>
            <Text style={styles.button}>Acknowledge Task</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>);
};

const styles = StyleSheet.create({
  taskDetail: {
    backgroundColor: Color.colorGray300,
    flex: 1
  },
  iconLayout: {
    maxHeight: "100%",
    maxWidth: "100%",
    position: "absolute",
    overflow: "hidden"
  },
  darkBorder: {
    borderWidth: 1,
    borderStyle: "solid"
  },
  textTypo: {
    color: Color.colorLightgray,
    fontFamily: FontFamily.manropeRegular,
    lineHeight: 21,
    fontSize: FontSize.size_14,
    textAlign: "left"
  },
  matchCardLayout: {
    borderRadius: Border.br_8,
    paddingHorizontal: Padding.p_16,
    overflow: "hidden"
  },
  darkFlexBox: {
    alignItems: "center",
    flexDirection: "row"
  },
  checkboxBg: {
    backgroundColor: Color.colorRoyalblue,
    justifyContent: "center"
  },
  buttonWrapperFlexBox: {
    height: 48,
    alignItems: "center",
    flexDirection: "row"
  },
  view: {
    width: "100%",
    height: 865,
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
    gap: Gap.gap_16,
    paddingHorizontal: Padding.p_16,
    alignItems: "center",
    flexDirection: "row",
    width: 375,
    left: 0,
    position: "absolute"
  },
  dark: {
    width: 32,
    borderRadius: 100,
    paddingHorizontal: Padding.p_8,
    paddingVertical: 0,
    justifyContent: "center",
    height: 32,
    borderColor: Color.colorGray100,
    borderWidth: 1,
    borderStyle: "solid",
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
    width: 263,
    fontSize: 12,
    letterSpacing: 0.5,
    lineHeight: 16,
    fontWeight: "500",
    fontFamily: FontFamily.robotoMedium,
    color: Color.colorDarkslategray,
    display: "none",
    textAlign: "center",
    overflow: "hidden"
  },
  tasks: {
    top: 122,
    right: 16,
    left: 16,
    gap: 32,
    position: "absolute"
  },
  commander: {
    alignSelf: "stretch",
    gap: Gap.gap_16
  },
  taskDetailHeadline: {
    lineHeight: 18,
    color: Color.colorGainsboro,
    textAlign: "left",
    fontSize: FontSize.size_16,
    alignSelf: "stretch",
    fontFamily: FontFamily.manropeSemiBold,
    fontWeight: "600",
    overflow: "hidden"
  },
  text: {
    alignSelf: "stretch"
  },
  content: {
    width: 343
  },
  matchCard: {
    backgroundColor: Color.colorGray200,
    paddingVertical: Padding.p_12,
    alignSelf: "stretch",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: Color.colorGray100
  },
  checkboxDarkMode: {
    gap: Gap.gap_8,
    alignSelf: "stretch"
  },
  checkbox: {
    padding: Padding.p_4,
    borderRadius: Border.br_4,
    alignItems: "center",
    flexDirection: "row"
  },
  icon: {
    height: 16,
    width: 16
  },
  checkbox2: {
    width: 24,
    borderColor: Color.colorDimgray,
    height: 24,
    borderRadius: Border.br_4,
    borderWidth: 1,
    borderStyle: "solid",
    backgroundColor: Color.colorGray300
  },
  checkboxText3: {
    flex: 1
  },
  taskDetailDark: {
    marginLeft: -171.5,
    bottom: 40,
    left: "50%",
    minWidth: 104,
    backgroundColor: Color.colorRoyalblue,
    justifyContent: "center",
    borderRadius: Border.br_8,
    paddingHorizontal: Padding.p_16,
    overflow: "hidden",
    width: 343,
    paddingVertical: 0,
    position: "absolute"
  },
  button: {
    lineHeight: 24,
    fontSize: FontSize.size_16,
    fontFamily: FontFamily.manropeSemiBold,
    textAlign: "center",
    color: Color.colorWhite,
    fontWeight: "600"
  }
});

export default TaskDetail;


/* Fonts */
export const FontFamily = {
  manropeSemiBold: "Manrope-SemiBold",
  robotoMedium: "Roboto-Medium",
  manropeRegular: "Manrope-Regular",
  sFProText: "SF Pro Text",
};
/* Font sizes */
export const FontSize = {
  size_14: 14,
  size_16: 16,
};
/* Colors */
export const Color = {
  colorLightgray: "#ced4da",
  colorWhite: "#fff",
  colorRoyalblue: "#1068eb",
  colorGray100: "#272b30",
  colorGray200: "#1e1e1e",
  colorGray300: "#101213",
  colorGainsboro: "#dee2e6",
  colorDimgray: "#4f575e",
  colorDarkslategray: "#49454f",
};
/* Gaps */
export const Gap = {
  gap_8: 8,
  gap_16: 16,
};
/* Paddings */
export const Padding = {
  p_4: 4,
  p_8: 8,
  p_12: 12,
  p_16: 16,
};
/* border radiuses */
export const Border = {
  br_4: 4,
  br_8: 8,
};