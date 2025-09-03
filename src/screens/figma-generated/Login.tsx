import * as React from "react";
import {Image, StyleSheet, Text, View} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Border from "../assets/Border.svg"
import Cap from "../assets/Cap.svg"
import Wifi from "../assets/Wifi.svg"
import Cellular from "../assets/Cellular.svg"
import { Color, Border, FontFamily, FontSize, Gap } from "../GlobalStyles";

const Login = () => {

  return (
    <SafeAreaView style={[styles.login, styles.viewFlexBox]}>
      <View style={[styles.view, styles.viewFlexBox]}>
        <Image style={styles.icon} resizeMode="cover" source="15898 1.png" />
        <Image style={[styles.loginIcon, styles.loginPosition]} resizeMode="cover" source="124643 1.png" />
        <View style={[styles.autoLayoutVertical, styles.loginPosition]}>
          <View style={styles.inputDark}>
            <Text style={[styles.label, styles.textFlexBox]}>User Name</Text>
            <View style={[styles.input, styles.darkLayout]}>
              <View style={[styles.content, styles.contentPosition]}>
                <View style={[styles.iconLeftText, styles.darkFlexBox]}>
                  <Text style={[styles.text, styles.textTypo]}>responder@arresponder.com</Text>
                </View>
              </View>
            </View>
          </View>
          <View style={[styles.dark, styles.darkFlexBox]}>
            <View style={[styles.buttonWrapper, styles.darkFlexBox]}>
              <Text style={[styles.button, styles.timeClr]}>Login</Text>
            </View>
          </View>
        </View>
        <View style={[styles.loginAutoLayoutVertical, styles.loginPosition]}>
          <Image style={styles.image9Icon} resizeMode="cover" source="image 9.png" />
          <Text style={[styles.arResponder, styles.timeClr]}>AR Responder</Text>
          <Text style={[styles.accessYourTactical, styles.textTypo]}>Access your tactical command center.</Text>
        </View>
        <View style={[styles.statusBariphone12Mini, styles.statusPosition]}>
          <View style={styles.statusiphone12Mini}>
            <View style={styles.batteryiphone12Mini}>
              <Border style={[styles.borderIcon, styles.iconLayout]} />
              <Cap style={[styles.capIcon, styles.iconLayout]} />
              <View style={styles.capacity} />
            </View>
            <Wifi style={styles.wifiIcon} width={15} height={11} />
            <Cellular style={styles.cellularIcon} width={17} height={11} />
          </View>
          <Text style={[styles.time, styles.timeClr]}>9:41</Text>
        </View>
        <View style={[styles.statusBar, styles.statusPosition]} />
      </View>
    </SafeAreaView>);
};

const styles = StyleSheet.create({
  login: {
    backgroundColor: Color.colorWhite
  },
  viewFlexBox: {
    flex: 1,
    backgroundColor: Color.colorWhite
  },
  loginPosition: {
    left: "50%",
    position: "absolute"
  },
  textFlexBox: {
    textAlign: "left",
    color: Color.colorWhite
  },
  darkLayout: {
    borderRadius: Border.br_8,
    height: 48,
    alignSelf: "stretch",
    overflow: "hidden"
  },
  contentPosition: {
    bottom: 0,
    top: 0,
    position: "absolute"
  },
  darkFlexBox: {
    flexDirection: "row",
    alignItems: "center"
  },
  textTypo: {
    fontFamily: FontFamily.manropeMedium,
    fontWeight: "500",
    lineHeight: 24,
    fontSize: FontSize.size_16
  },
  timeClr: {
    color: Color.colorWhite,
    textAlign: "center"
  },
  statusPosition: {
    width: 375,
    top: 0,
    left: "50%",
    position: "absolute"
  },
  iconLayout: {
    maxHeight: "100%",
    maxWidth: "100%",
    position: "absolute",
    overflow: "hidden"
  },
  view: {
    width: "100%",
    overflow: "hidden",
    height: 812,
    backgroundColor: Color.colorWhite
  },
  icon: {
    top: -16,
    left: -563,
    width: 1500,
    height: 844,
    position: "absolute"
  },
  loginIcon: {
    marginTop: -406,
    marginLeft: -617.5,
    width: 1218,
    top: "50%",
    left: "50%",
    height: 812
  },
  autoLayoutVertical: {
    marginTop: -95,
    marginLeft: -163.5,
    width: 327,
    gap: 40,
    top: "50%",
    left: "50%"
  },
  inputDark: {
    gap: Gap.gap_8,
    alignSelf: "stretch"
  },
  label: {
    fontFamily: FontFamily.manropeSemiBold,
    lineHeight: 24,
    fontSize: FontSize.size_16,
    fontWeight: "600",
    alignSelf: "stretch"
  },
  input: {
    backgroundColor: Color.colorGray200,
    borderStyle: "solid",
    borderColor: Color.colorGray100,
    borderWidth: 1,
    height: 48
  },
  content: {
    right: 16,
    left: 16,
    overflow: "hidden"
  },
  iconLeftText: {
    left: 0,
    alignItems: "center",
    bottom: 0,
    top: 0,
    position: "absolute"
  },
  text: {
    textAlign: "left",
    color: Color.colorWhite
  },
  dark: {
    backgroundColor: Color.colorRoyalblue,
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 0,
    minWidth: 104,
    alignItems: "center",
    height: 48,
    borderRadius: Border.br_8,
    alignSelf: "stretch",
    overflow: "hidden"
  },
  buttonWrapper: {
    alignItems: "center",
    height: 48
  },
  button: {
    textAlign: "center",
    fontFamily: FontFamily.manropeSemiBold,
    lineHeight: 24,
    fontSize: FontSize.size_16,
    fontWeight: "600"
  },
  loginAutoLayoutVertical: {
    marginLeft: -109.5,
    top: 131,
    width: 219,
    alignItems: "center",
    gap: Gap.gap_8
  },
  image9Icon: {
    width: 56,
    height: 56
  },
  arResponder: {
    fontSize: 28,
    lineHeight: 36,
    fontFamily: FontFamily.russoOneRegular,
    textAlign: "center",
    alignSelf: "stretch"
  },
  accessYourTactical: {
    color: Color.colorDarkgray,
    textAlign: "center"
  },
  statusBariphone12Mini: {
    marginLeft: -187.51,
    height: 50
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
    position: "absolute",
    backgroundColor: Color.colorWhite
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
    fontWeight: "600",
    color: Color.colorWhite,
    position: "absolute"
  },
  statusBar: {
    marginLeft: -187.5,
    height: 44,
    justifyContent: "space-between",
    alignItems: "center"
  }
});

export default Login;



/* Fonts */
export const FontFamily = {
  manropeMedium: "Manrope-Medium",
  manropeSemiBold: "Manrope-SemiBold",
  russoOneRegular: "RussoOne-Regular",
  sFProText: "SF Pro Text",
};
/* Font sizes */
export const FontSize = {
  size_16: 16,
};
/* Colors */
export const Color = {
  colorWhite: "#fff",
  colorRoyalblue: "#1068eb",
  colorGray200: "#101213",
  colorGray100: "#272b30",
  colorDarkgray: "#adb5bd",
};
/* Gaps */
export const Gap = {
  gap_8: 8,
};
/* border radiuses */
export const Border = {
  br_8: 8,
};