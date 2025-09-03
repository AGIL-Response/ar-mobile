import * as React from "react";
import {StyleSheet, View, Text, ImageBackground} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Border from "../assets/Border.svg"
import Cap from "../assets/Cap.svg"
import Wifi from "../assets/Wifi.svg"
import Cellular from "../assets/Cellular.svg"
import Frame7 from "../assets/Frame-7.svg"
import Top from "../assets/top.svg"
import Bottom from "../assets/bottom.svg"
import Top1 from "../assets/top1.svg"
import Bottom1 from "../assets/bottom1.svg"
import Top2 from "../assets/top2.svg"
import Bottom2 from "../assets/bottom2.svg"
import Top3 from "../assets/top3.svg"
import Bottom3 from "../assets/bottom3.svg"
import Dotsvertical from "../assets/dots-vertical.svg"
import Top4 from "../assets/top4.svg"
import Bottom4 from "../assets/bottom4.svg"
import Top5 from "../assets/top5.svg"
import Bottom5 from "../assets/bottom5.svg"
import Top6 from "../assets/top6.svg"
import Bottom6 from "../assets/bottom6.svg"
import Top7 from "../assets/top7.svg"
import Bottom7 from "../assets/bottom7.svg"
import Dotsvertical1 from "../assets/dots-vertical1.svg"
import Top8 from "../assets/top8.svg"
import Bottom8 from "../assets/bottom8.svg"
import Top9 from "../assets/top9.svg"
import Bottom9 from "../assets/bottom9.svg"
import Top10 from "../assets/top10.svg"
import Bottom10 from "../assets/bottom10.svg"
import Top11 from "../assets/top11.svg"
import Bottom11 from "../assets/bottom11.svg"
import Dotsvertical2 from "../assets/dots-vertical2.svg"
import Top12 from "../assets/top12.svg"
import Bottom12 from "../assets/bottom12.svg"
import Top13 from "../assets/top13.svg"
import Bottom13 from "../assets/bottom13.svg"
import Top14 from "../assets/top14.svg"
import Bottom14 from "../assets/bottom14.svg"
import Top15 from "../assets/top15.svg"
import Bottom15 from "../assets/bottom15.svg"
import Dotsvertical3 from "../assets/dots-vertical3.svg"
import Top16 from "../assets/top16.svg"
import Bottom16 from "../assets/bottom16.svg"
import Top17 from "../assets/top17.svg"
import Bottom17 from "../assets/bottom17.svg"
import Top18 from "../assets/top18.svg"
import Bottom18 from "../assets/bottom18.svg"
import Top19 from "../assets/top19.svg"
import Bottom19 from "../assets/bottom19.svg"
import Dotsvertical4 from "../assets/dots-vertical4.svg"
import Top20 from "../assets/top20.svg"
import Bottom20 from "../assets/bottom20.svg"
import Top21 from "../assets/top21.svg"
import Bottom21 from "../assets/bottom21.svg"
import Top22 from "../assets/top22.svg"
import Bottom22 from "../assets/bottom22.svg"
import Top23 from "../assets/top23.svg"
import Bottom23 from "../assets/bottom23.svg"
import Dotsvertical5 from "../assets/dots-vertical5.svg"
import { Color, Padding, Border, Gap, FontFamily, FontSize } from "../GlobalStyles";

const Members = () => {

  return (
    <SafeAreaView style={styles.homescreen}>
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
          <View style={[styles.dark, styles.darkFlexBox]}>
            <Frame7 style={styles.darkChild} width={16} height={32} />
          </View>
          <View style={styles.textContent}>
            <Text style={styles.headline}>Members</Text>
            <Text style={styles.supportingText}>Supporting text</Text>
          </View>
        </View>
        <View style={styles.content}>
          <View style={styles.commander}>
            <Text style={[styles.homescreenHeadline, styles.headlineFlexBox]}>Commander</Text>
            <View style={[styles.cardCardItemDark, styles.cardItemBorder]}>
              <View style={[styles.frameParent, styles.frameFlexBox]}>
                <View style={[styles.avatarStatusParent, styles.avatarCardFlexBox]}>
                  <View style={[styles.avatarStatus, styles.avatarCardFlexBox]}>
                    <View style={[styles.avatar, styles.avatarLayout]}>
                      <ImageBackground style={styles.imageIcon} resizeMode="cover" source="Image.png">
                        <View style={styles.row}>
                          <View style={[styles.scaleUnit, styles.scalePosition]}>
                            <Top style={styles.topIcon} />
                            <Bottom style={styles.topIcon} />
                          </View>
                          <View style={[styles.homescreenScaleUnit, styles.scalePosition]}>
                            <Top1 style={styles.topIcon} />
                            <Bottom1 style={styles.topIcon} />
                          </View>
                        </View>
                        <View style={styles.row}>
                          <View style={[styles.scaleUnit, styles.scalePosition]}>
                            <Top2 style={styles.topIcon} />
                            <Bottom2 style={styles.topIcon} />
                          </View>
                          <View style={[styles.homescreenScaleUnit, styles.scalePosition]}>
                            <Top3 style={styles.topIcon} />
                            <Bottom3 style={styles.topIcon} />
                          </View>
                        </View>
                      </ImageBackground>
                    </View>
                    <View style={[styles.indicator, styles.indicatorPosition]} />
                  </View>
                  <View style={styles.imageIcon}>
                    <Text style={[styles.johnDoe, styles.headlineFlexBox]}>John Doe</Text>
                  </View>
                </View>
                <Dotsvertical style={styles.dotsVerticalIcon} width={16} height={16} />
              </View>
            </View>
          </View>
          <View style={styles.commander}>
            <Text style={[styles.headline2, styles.headlineFlexBox]}>Members</Text>
            <View style={[styles.homescreenCardCardItemDark, styles.cardItemBorder]}>
              <View style={[styles.frameGroup, styles.frameFlexBox]}>
                <View style={[styles.avatarStatusParent, styles.avatarCardFlexBox]}>
                  <View style={[styles.avatarStatus, styles.avatarCardFlexBox]}>
                    <View style={[styles.avatar, styles.avatarLayout]}>
                      <ImageBackground style={styles.avatarLayout} resizeMode="cover" source="Image.png">
                        <View style={styles.row}>
                          <View style={[styles.scaleUnit, styles.scalePosition]}>
                            <Top4 style={styles.topIcon} />
                            <Bottom4 style={styles.topIcon} />
                          </View>
                          <View style={[styles.homescreenScaleUnit, styles.scalePosition]}>
                            <Top5 style={styles.topIcon} />
                            <Bottom5 style={styles.topIcon} />
                          </View>
                        </View>
                        <View style={styles.row}>
                          <View style={[styles.scaleUnit, styles.scalePosition]}>
                            <Top6 style={styles.topIcon} />
                            <Bottom6 style={styles.topIcon} />
                          </View>
                          <View style={[styles.homescreenScaleUnit, styles.scalePosition]}>
                            <Top7 style={styles.topIcon} />
                            <Bottom7 style={styles.topIcon} />
                          </View>
                        </View>
                      </ImageBackground>
                    </View>
                    <View style={[styles.indicator, styles.indicatorPosition]} />
                  </View>
                  <View style={styles.imageIcon}>
                    <Text style={[styles.johnDoe, styles.headlineFlexBox]}>Laila Johnson</Text>
                  </View>
                </View>
                <Dotsvertical1 style={styles.dotsVerticalIcon} width={16} height={16} />
              </View>
              <View style={[styles.frameGroup, styles.frameFlexBox]}>
                <View style={[styles.avatarStatusParent, styles.avatarCardFlexBox]}>
                  <View style={[styles.avatarStatus, styles.avatarCardFlexBox]}>
                    <View style={[styles.avatar, styles.avatarLayout]}>
                      <ImageBackground style={styles.avatarLayout} resizeMode="cover" source="Image.png">
                        <View style={styles.row}>
                          <View style={[styles.scaleUnit, styles.scalePosition]}>
                            <Top8 style={styles.topIcon} />
                            <Bottom8 style={styles.topIcon} />
                          </View>
                          <View style={[styles.homescreenScaleUnit, styles.scalePosition]}>
                            <Top9 style={styles.topIcon} />
                            <Bottom9 style={styles.topIcon} />
                          </View>
                        </View>
                        <View style={styles.row}>
                          <View style={[styles.scaleUnit, styles.scalePosition]}>
                            <Top10 style={styles.topIcon} />
                            <Bottom10 style={styles.topIcon} />
                          </View>
                          <View style={[styles.homescreenScaleUnit, styles.scalePosition]}>
                            <Top11 style={styles.topIcon} />
                            <Bottom11 style={styles.topIcon} />
                          </View>
                        </View>
                      </ImageBackground>
                    </View>
                    <View style={[styles.indicator2, styles.indicatorPosition]} />
                  </View>
                  <View style={styles.imageIcon}>
                    <Text style={[styles.johnDoe, styles.headlineFlexBox]}>Lucas Marth</Text>
                  </View>
                </View>
                <Dotsvertical2 style={styles.dotsVerticalIcon} width={16} height={16} />
              </View>
              <View style={[styles.frameGroup, styles.frameFlexBox]}>
                <View style={[styles.avatarStatusParent, styles.avatarCardFlexBox]}>
                  <View style={[styles.avatarStatus, styles.avatarCardFlexBox]}>
                    <View style={[styles.avatar, styles.avatarLayout]}>
                      <ImageBackground style={styles.avatarLayout} resizeMode="cover" source="Image.png">
                        <View style={styles.row}>
                          <View style={[styles.scaleUnit, styles.scalePosition]}>
                            <Top12 style={styles.topIcon} />
                            <Bottom12 style={styles.topIcon} />
                          </View>
                          <View style={[styles.homescreenScaleUnit, styles.scalePosition]}>
                            <Top13 style={styles.topIcon} />
                            <Bottom13 style={styles.topIcon} />
                          </View>
                        </View>
                        <View style={styles.row}>
                          <View style={[styles.scaleUnit, styles.scalePosition]}>
                            <Top14 style={styles.topIcon} />
                            <Bottom14 style={styles.topIcon} />
                          </View>
                          <View style={[styles.homescreenScaleUnit, styles.scalePosition]}>
                            <Top15 style={styles.topIcon} />
                            <Bottom15 style={styles.topIcon} />
                          </View>
                        </View>
                      </ImageBackground>
                    </View>
                    <View style={[styles.indicator, styles.indicatorPosition]} />
                  </View>
                  <View style={styles.imageIcon}>
                    <Text style={[styles.johnDoe, styles.headlineFlexBox]}>Aiden Lu</Text>
                  </View>
                </View>
                <Dotsvertical3 style={styles.dotsVerticalIcon} width={16} height={16} />
              </View>
              <View style={[styles.frameGroup, styles.frameFlexBox]}>
                <View style={[styles.avatarStatusParent, styles.avatarCardFlexBox]}>
                  <View style={[styles.avatarStatus, styles.avatarCardFlexBox]}>
                    <View style={[styles.avatar, styles.avatarLayout]}>
                      <ImageBackground style={styles.avatarLayout} resizeMode="cover" source="Image.png">
                        <View style={styles.row}>
                          <View style={[styles.scaleUnit, styles.scalePosition]}>
                            <Top16 style={styles.topIcon} />
                            <Bottom16 style={styles.topIcon} />
                          </View>
                          <View style={[styles.homescreenScaleUnit, styles.scalePosition]}>
                            <Top17 style={styles.topIcon} />
                            <Bottom17 style={styles.topIcon} />
                          </View>
                        </View>
                        <View style={styles.row}>
                          <View style={[styles.scaleUnit, styles.scalePosition]}>
                            <Top18 style={styles.topIcon} />
                            <Bottom18 style={styles.topIcon} />
                          </View>
                          <View style={[styles.homescreenScaleUnit, styles.scalePosition]}>
                            <Top19 style={styles.topIcon} />
                            <Bottom19 style={styles.topIcon} />
                          </View>
                        </View>
                      </ImageBackground>
                    </View>
                    <View style={[styles.indicator2, styles.indicatorPosition]} />
                  </View>
                  <View style={styles.imageIcon}>
                    <Text style={[styles.johnDoe, styles.headlineFlexBox]}>Andrey Yu</Text>
                  </View>
                </View>
                <Dotsvertical4 style={styles.dotsVerticalIcon} width={16} height={16} />
              </View>
              <View style={[styles.frameGroup, styles.frameFlexBox]}>
                <View style={[styles.avatarStatusParent, styles.avatarCardFlexBox]}>
                  <View style={[styles.avatarStatus, styles.avatarCardFlexBox]}>
                    <View style={[styles.avatar, styles.avatarLayout]}>
                      <ImageBackground style={styles.avatarLayout} resizeMode="cover" source="Image.png">
                        <View style={styles.row}>
                          <View style={[styles.scaleUnit, styles.scalePosition]}>
                            <Top20 style={styles.topIcon} />
                            <Bottom20 style={styles.topIcon} />
                          </View>
                          <View style={[styles.homescreenScaleUnit, styles.scalePosition]}>
                            <Top21 style={styles.topIcon} />
                            <Bottom21 style={styles.topIcon} />
                          </View>
                        </View>
                        <View style={styles.row}>
                          <View style={[styles.scaleUnit, styles.scalePosition]}>
                            <Top22 style={styles.topIcon} />
                            <Bottom22 style={styles.topIcon} />
                          </View>
                          <View style={[styles.homescreenScaleUnit, styles.scalePosition]}>
                            <Top23 style={styles.topIcon} />
                            <Bottom23 style={styles.topIcon} />
                          </View>
                        </View>
                      </ImageBackground>
                    </View>
                    <View style={[styles.indicator, styles.indicatorPosition]} />
                  </View>
                  <View style={styles.imageIcon}>
                    <Text style={[styles.johnDoe, styles.headlineFlexBox]}>Lily Yung</Text>
                  </View>
                </View>
                <Dotsvertical5 style={styles.dotsVerticalIcon} width={16} height={16} />
              </View>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>);
};

const styles = StyleSheet.create({
  homescreen: {
    backgroundColor: Color.colorGray400,
    flex: 1
  },
  iconLayout: {
    maxHeight: "100%",
    maxWidth: "100%",
    position: "absolute",
    overflow: "hidden"
  },
  darkFlexBox: {
    borderWidth: 1,
    borderStyle: "solid",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    overflow: "hidden"
  },
  headlineFlexBox: {
    textAlign: "left",
    color: Color.colorWhite
  },
  cardItemBorder: {
    paddingVertical: Padding.p_12,
    backgroundColor: Color.colorGray300,
    borderRadius: Border.br_8,
    alignSelf: "stretch",
    borderWidth: 1,
    borderColor: Color.colorGray200,
    borderStyle: "solid",
    paddingHorizontal: Padding.p_16
  },
  frameFlexBox: {
    gap: Gap.gap_8,
    alignItems: "center",
    flexDirection: "row"
  },
  avatarCardFlexBox: {
    alignItems: "center",
    flexDirection: "row"
  },
  avatarLayout: {
    borderRadius: Border.br_64,
    flex: 1
  },
  scalePosition: {
    width: 12,
    top: 0,
    position: "absolute"
  },
  indicatorPosition: {
    zIndex: 1,
    height: 8,
    borderColor: Color.colorBlack,
    bottom: -1,
    right: -1,
    width: 8,
    borderRadius: Border.br_64,
    borderWidth: 1,
    borderStyle: "solid",
    position: "absolute"
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
    top: 0,
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
    borderColor: Color.colorGray200,
    borderWidth: 1,
    borderStyle: "solid",
    backgroundColor: Color.colorGray400
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
  content: {
    top: 122,
    left: 16,
    width: 343,
    gap: 32,
    position: "absolute"
  },
  commander: {
    gap: Gap.gap_12,
    alignSelf: "stretch"
  },
  homescreenHeadline: {
    lineHeight: 18,
    fontSize: FontSize.size_16,
    textAlign: "left",
    fontFamily: FontFamily.manropeSemiBold,
    fontWeight: "600",
    overflow: "hidden",
    alignSelf: "stretch"
  },
  cardCardItemDark: {
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row"
  },
  frameParent: {
    flex: 1
  },
  avatarStatusParent: {
    gap: Gap.gap_16,
    flex: 1
  },
  avatarStatus: {
    width: 24,
    justifyContent: "center"
  },
  avatar: {
    backgroundColor: Color.colorLightgray,
    borderColor: Color.colorLightgray,
    zIndex: 0,
    justifyContent: "center",
    borderWidth: 1,
    borderStyle: "solid",
    alignItems: "center",
    flexDirection: "row",
    overflow: "hidden",
    borderRadius: Border.br_64
  },
  imageIcon: {
    flex: 1
  },
  row: {
    height: 12,
    opacity: 0,
    alignSelf: "stretch"
  },
  scaleUnit: {
    left: 0,
    width: 12
  },
  topIcon: {
    height: 6,
    opacity: 0.7,
    alignSelf: "stretch",
    maxWidth: "100%",
    overflow: "hidden",
    width: "100%"
  },
  homescreenScaleUnit: {
    left: 12
  },
  indicator: {
    backgroundColor: Color.colorMediumspringgreen
  },
  johnDoe: {
    fontSize: FontSize.size_14,
    lineHeight: 21,
    fontFamily: FontFamily.manropeRegular
  },
  dotsVerticalIcon: {
    height: 16,
    width: 16
  },
  headline2: {
    lineHeight: 18,
    fontSize: FontSize.size_16,
    textAlign: "left",
    fontFamily: FontFamily.manropeSemiBold,
    fontWeight: "600",
    overflow: "hidden"
  },
  homescreenCardCardItemDark: {
    gap: Gap.gap_16
  },
  frameGroup: {
    alignSelf: "stretch"
  },
  indicator2: {
    backgroundColor: Color.colorGray100
  }
});

export default Members;



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
  colorBlack: "#000",
  colorMediumspringgreen: "#1ce783",
  colorGray100: "#949494",
  colorGray200: "#272b30",
  colorGray400: "#101213",
  colorGray300: "#1e1e1e",
  colorLightgray: "rgba(209, 209, 209, 0.05)",
  colorDarkslategray: "#49454f",
  colorWhite: "#fff",
};
/* Gaps */
export const Gap = {
  gap_8: 8,
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
  br_8: 8,
  br_64: 64,
};