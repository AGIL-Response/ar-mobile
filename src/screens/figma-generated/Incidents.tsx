import * as React from "react";
import {StyleSheet, View, Text, Image} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Border from "../assets/Border.svg"
import Cap from "../assets/Cap.svg"
import Wifi from "../assets/Wifi.svg"
import Cellular from "../assets/Cellular.svg"
import Frame7 from "../assets/Frame-7.svg"
import Useredit from "../assets/user-edit.svg"
import Markerpin01 from "../assets/marker-pin-01.svg"
import Clockfastforward from "../assets/clock-fast-forward.svg"
import Useredit1 from "../assets/user-edit1.svg"
import Markerpin011 from "../assets/marker-pin-011.svg"
import Clockfastforward1 from "../assets/clock-fast-forward1.svg"
import Useredit2 from "../assets/user-edit2.svg"
import Markerpin012 from "../assets/marker-pin-012.svg"
import Clockfastforward2 from "../assets/clock-fast-forward2.svg"
import Useredit3 from "../assets/user-edit3.svg"
import Markerpin013 from "../assets/marker-pin-013.svg"
import Clockfastforward3 from "../assets/clock-fast-forward3.svg"
import Useredit4 from "../assets/user-edit4.svg"
import Markerpin014 from "../assets/marker-pin-014.svg"
import Clockfastforward4 from "../assets/clock-fast-forward4.svg"
import Useredit5 from "../assets/user-edit5.svg"
import Markerpin015 from "../assets/marker-pin-015.svg"
import Clockfastforward5 from "../assets/clock-fast-forward5.svg"
import { Color, Gap, Border, FontFamily, Padding, FontSize } from "../GlobalStyles";

const Incidents = () => {

  return (
    <SafeAreaView style={[styles.homescreen, styles.viewFlexBox]}>
      <View style={[styles.view, styles.viewFlexBox]}>
        <View style={[styles.statusBariphone12Mini, styles.appBarLayout1]}>
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
        <View style={[styles.appBar, styles.appBarPosition]}>
          <View style={[styles.dark, styles.darkFlexBox]}>
            <Frame7 style={styles.darkChild} width={16} height={32} />
          </View>
          <View style={styles.containerFlexBox}>
            <Text style={[styles.headline, styles.headlineTypo]}>Incidents</Text>
            <Text style={styles.supportingText}>Supporting text</Text>
          </View>
        </View>
        <View style={[styles.commander, styles.appBarPosition]}>
          <View style={[styles.matchCard, styles.darkBorder]}>
            <View style={[styles.section, styles.appBarFlexBox]}>
              <Text style={[styles.text, styles.textFlexBox]}>Chemical Spill</Text>
              <View style={[styles.badge, styles.badgeSpaceBlock]}>
                <Text style={[styles.homescreenText, styles.textFlexBox]}>High</Text>
              </View>
            </View>
            <View style={styles.homescreenSection}>
              <View style={[styles.container, styles.containerFlexBox]}>
                <View style={[styles.section, styles.appBarFlexBox]}>
                  <Useredit style={styles.userEditIcon} width={16} height={16} />
                  <Text style={[styles.text2, styles.textFlexBox]}>Laila Johnson</Text>
                </View>
                <View style={[styles.section, styles.appBarFlexBox]}>
                  <Markerpin01 style={styles.userEditIcon} width={16} height={16} />
                  <Text style={[styles.text2, styles.textFlexBox]}>Industrial Zone Alpha, 123 Main St</Text>
                </View>
                <View style={[styles.section, styles.appBarFlexBox]}>
                  <Clockfastforward style={styles.userEditIcon} width={16} height={16} />
                  <Text style={[styles.text2, styles.textFlexBox]}>12 min ago</Text>
                </View>
              </View>
            </View>
          </View>
          <View style={[styles.matchCard, styles.darkBorder]}>
            <View style={[styles.section, styles.appBarFlexBox]}>
              <Text style={[styles.text, styles.textFlexBox]}>Chemical Spill</Text>
              <View style={[styles.badge, styles.badgeSpaceBlock]}>
                <Text style={[styles.homescreenText, styles.textFlexBox]}>High</Text>
              </View>
            </View>
            <View style={styles.homescreenSection}>
              <View style={[styles.container, styles.containerFlexBox]}>
                <View style={[styles.section, styles.appBarFlexBox]}>
                  <Useredit1 style={styles.userEditIcon} width={16} height={16} />
                  <Text style={[styles.text2, styles.textFlexBox]}>Laila Johnson</Text>
                </View>
                <View style={[styles.section, styles.appBarFlexBox]}>
                  <Markerpin011 style={styles.userEditIcon} width={16} height={16} />
                  <Text style={[styles.text2, styles.textFlexBox]}>Industrial Zone Alpha, 123 Main St</Text>
                </View>
                <View style={[styles.section, styles.appBarFlexBox]}>
                  <Clockfastforward1 style={styles.userEditIcon} width={16} height={16} />
                  <Text style={[styles.text2, styles.textFlexBox]}>12 min ago</Text>
                </View>
              </View>
            </View>
          </View>
          <View style={[styles.matchCard, styles.darkBorder]}>
            <View style={[styles.section, styles.appBarFlexBox]}>
              <Text style={[styles.text10, styles.textFlexBox]}>Chemical Spill</Text>
              <View style={[styles.badge2, styles.badgeSpaceBlock]}>
                <Text style={[styles.homescreenText, styles.textFlexBox]}>Low</Text>
              </View>
            </View>
            <View style={styles.homescreenSection}>
              <View style={[styles.container, styles.containerFlexBox]}>
                <View style={[styles.section, styles.appBarFlexBox]}>
                  <Useredit2 style={styles.userEditIcon} width={16} height={16} />
                  <Text style={[styles.text2, styles.textFlexBox]}>Laila Johnson</Text>
                </View>
                <View style={[styles.section, styles.appBarFlexBox]}>
                  <Markerpin012 style={styles.userEditIcon} width={16} height={16} />
                  <Text style={[styles.text2, styles.textFlexBox]}>Industrial Zone Alpha, 123 Main St</Text>
                </View>
                <View style={[styles.section, styles.appBarFlexBox]}>
                  <Clockfastforward2 style={styles.userEditIcon} width={16} height={16} />
                  <Text style={[styles.text2, styles.textFlexBox]}>12 min ago</Text>
                </View>
              </View>
            </View>
          </View>
          <View style={[styles.matchCard, styles.darkBorder]}>
            <View style={[styles.section, styles.appBarFlexBox]}>
              <Text style={[styles.text10, styles.textFlexBox]}>Chemical Spill</Text>
              <View style={[styles.badge2, styles.badgeSpaceBlock]}>
                <Text style={[styles.homescreenText, styles.textFlexBox]}>Low</Text>
              </View>
            </View>
            <View style={styles.homescreenSection}>
              <View style={[styles.container, styles.containerFlexBox]}>
                <View style={[styles.section, styles.appBarFlexBox]}>
                  <Useredit3 style={styles.userEditIcon} width={16} height={16} />
                  <Text style={[styles.text2, styles.textFlexBox]}>Laila Johnson</Text>
                </View>
                <View style={[styles.section, styles.appBarFlexBox]}>
                  <Markerpin013 style={styles.userEditIcon} width={16} height={16} />
                  <Text style={[styles.text2, styles.textFlexBox]}>Industrial Zone Alpha, 123 Main St</Text>
                </View>
                <View style={[styles.section, styles.appBarFlexBox]}>
                  <Clockfastforward3 style={styles.userEditIcon} width={16} height={16} />
                  <Text style={[styles.text2, styles.textFlexBox]}>12 min ago</Text>
                </View>
              </View>
            </View>
          </View>
          <View style={[styles.matchCard, styles.darkBorder]}>
            <View style={[styles.section, styles.appBarFlexBox]}>
              <Text style={[styles.text10, styles.textFlexBox]}>Chemical Spill</Text>
              <View style={[styles.badge2, styles.badgeSpaceBlock]}>
                <Text style={[styles.homescreenText, styles.textFlexBox]}>Low</Text>
              </View>
            </View>
            <View style={styles.homescreenSection}>
              <View style={[styles.container, styles.containerFlexBox]}>
                <View style={[styles.section, styles.appBarFlexBox]}>
                  <Useredit4 style={styles.userEditIcon} width={16} height={16} />
                  <Text style={[styles.text2, styles.textFlexBox]}>Laila Johnson</Text>
                </View>
                <View style={[styles.section, styles.appBarFlexBox]}>
                  <Markerpin014 style={styles.userEditIcon} width={16} height={16} />
                  <Text style={[styles.text2, styles.textFlexBox]}>Industrial Zone Alpha, 123 Main St</Text>
                </View>
                <View style={[styles.section, styles.appBarFlexBox]}>
                  <Clockfastforward4 style={styles.userEditIcon} width={16} height={16} />
                  <Text style={[styles.text2, styles.textFlexBox]}>12 min ago</Text>
                </View>
              </View>
            </View>
          </View>
          <View style={[styles.matchCard, styles.darkBorder]}>
            <View style={[styles.section, styles.appBarFlexBox]}>
              <Text style={[styles.text10, styles.textFlexBox]}>Chemical Spill</Text>
              <View style={[styles.badge2, styles.badgeSpaceBlock]}>
                <Text style={[styles.homescreenText, styles.textFlexBox]}>Low</Text>
              </View>
            </View>
            <View style={styles.homescreenSection}>
              <View style={[styles.container, styles.containerFlexBox]}>
                <View style={[styles.section, styles.appBarFlexBox]}>
                  <Useredit5 style={styles.userEditIcon} width={16} height={16} />
                  <Text style={[styles.text2, styles.textFlexBox]}>Laila Johnson</Text>
                </View>
                <View style={[styles.section, styles.appBarFlexBox]}>
                  <Markerpin015 style={styles.userEditIcon} width={16} height={16} />
                  <Text style={[styles.text2, styles.textFlexBox]}>Industrial Zone Alpha, 123 Main St</Text>
                </View>
                <View style={[styles.section, styles.appBarFlexBox]}>
                  <Clockfastforward5 style={styles.userEditIcon} width={16} height={16} />
                  <Text style={[styles.text2, styles.textFlexBox]}>12 min ago</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
        <View style={[styles.button, styles.darkFlexBox]}>
          <Image style={styles.buttonChild} resizeMode="cover" source="Frame 7.png" />
        </View>
      </View>
    </SafeAreaView>);
};

const styles = StyleSheet.create({
  homescreen: {
    backgroundColor: Color.colorGray300
  },
  viewFlexBox: {
    flex: 1,
    backgroundColor: Color.colorGray300
  },
  appBarLayout1: {
    width: 375,
    left: 0
  },
  iconLayout: {
    maxHeight: "100%",
    maxWidth: "100%",
    position: "absolute",
    overflow: "hidden"
  },
  appBarPosition: {
    gap: Gap.gap_16,
    position: "absolute"
  },
  darkFlexBox: {
    paddingVertical: 0,
    borderRadius: Border.br_100,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    overflow: "hidden"
  },
  headlineTypo: {
    fontFamily: FontFamily.manropeSemiBold,
    fontWeight: "600"
  },
  darkBorder: {
    borderWidth: 1,
    borderColor: Color.colorGray100,
    borderStyle: "solid"
  },
  appBarFlexBox: {
    alignItems: "center",
    flexDirection: "row"
  },
  textFlexBox: {
    textAlign: "left",
    color: Color.colorWhite
  },
  badgeSpaceBlock: {
    paddingVertical: Padding.p_1,
    paddingHorizontal: Padding.p_6,
    justifyContent: "center",
    borderRadius: Border.br_100,
    alignItems: "center"
  },
  containerFlexBox: {
    justifyContent: "center",
    flex: 1
  },
  view: {
    width: "100%",
    height: 812,
    overflow: "hidden",
    backgroundColor: Color.colorGray300
  },
  statusBariphone12Mini: {
    top: 0,
    height: 50,
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
    paddingVertical: Padding.p_8,
    paddingHorizontal: Padding.p_16,
    alignItems: "center",
    flexDirection: "row",
    height: 56,
    width: 375,
    left: 0
  },
  dark: {
    width: 32,
    paddingHorizontal: Padding.p_8,
    height: 32,
    borderWidth: 1,
    borderColor: Color.colorGray100,
    borderStyle: "solid",
    backgroundColor: Color.colorGray300
  },
  darkChild: {
    width: 16,
    height: 32
  },
  headline: {
    fontSize: 20,
    lineHeight: 22,
    fontFamily: FontFamily.manropeSemiBold,
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
  commander: {
    top: 122,
    left: 16,
    width: 343,
    height: 688
  },
  matchCard: {
    borderRadius: Border.br_8,
    backgroundColor: Color.colorGray200,
    paddingVertical: Padding.p_12,
    gap: Gap.gap_12,
    alignSelf: "stretch",
    paddingHorizontal: Padding.p_16,
    overflow: "hidden"
  },
  section: {
    gap: Gap.gap_8,
    alignSelf: "stretch"
  },
  text: {
    fontWeight: "700",
    fontFamily: FontFamily.manropeBold,
    fontSize: FontSize.size_18,
    textAlign: "left",
    lineHeight: 22,
    flex: 1
  },
  badge: {
    backgroundColor: Color.colorFirebrick
  },
  homescreenText: {
    lineHeight: 18,
    alignSelf: "stretch",
    fontSize: FontSize.size_12,
    fontFamily: FontFamily.manropeSemiBold,
    fontWeight: "600"
  },
  homescreenSection: {
    borderRadius: Border.br_10,
    backgroundColor: Color.colorDarkgray,
    padding: Padding.p_12,
    alignSelf: "stretch",
    flexDirection: "row"
  },
  container: {
    gap: Gap.gap_8
  },
  userEditIcon: {
    height: 16,
    width: 16
  },
  text2: {
    fontSize: FontSize.size_14,
    lineHeight: 21,
    fontFamily: FontFamily.manropeRegular
  },
  text10: {
    fontFamily: FontFamily.manropeMedium,
    fontSize: FontSize.size_18,
    textAlign: "left",
    lineHeight: 22,
    flex: 1,
    fontWeight: "500"
  },
  badge2: {
    backgroundColor: Color.colorOrangered
  },
  button: {
    top: 717,
    left: 303,
    backgroundColor: Color.colorRoyalblue,
    paddingHorizontal: Padding.p_16,
    height: 56,
    position: "absolute"
  },
  buttonChild: {
    width: 24,
    height: 48
  }
});

export default Incidents;


/* Fonts */
export const FontFamily = {
  manropeMedium: "Manrope-Medium",
  manropeBold: "Manrope-Bold",
  manropeRegular: "Manrope-Regular",
  robotoMedium: "Roboto-Medium",
  manropeSemiBold: "Manrope-SemiBold",
  sFProText: "SF Pro Text",
};
/* Font sizes */
export const FontSize = {
  size_12: 12,
  size_14: 14,
  size_18: 18,
};
/* Colors */
export const Color = {
  colorDarkslategray: "#49454f",
  colorGray200: "#1e1e1e",
  colorFirebrick: "#c92a2a",
  colorWhite: "#fff",
  colorGray300: "#101213",
  colorGray100: "#272b30",
  colorRoyalblue: "#1068eb",
  colorOrangered: "#f76707",
  colorDarkgray: "rgba(163, 163, 163, 0.05)",
};
/* Gaps */
export const Gap = {
  gap_8: 8,
  gap_12: 12,
  gap_16: 16,
};
/* Paddings */
export const Padding = {
  p_1: 1,
  p_6: 6,
  p_8: 8,
  p_12: 12,
  p_16: 16,
};
/* border radiuses */
export const Border = {
  br_8: 8,
  br_10: 10,
  br_100: 100,
};
