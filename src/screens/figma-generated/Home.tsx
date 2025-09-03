import * as React from "react";
import {Text, StyleSheet, View, ImageBackground, Image} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Top from "../assets/top.svg"
import Bottom from "../assets/bottom.svg"
import Top1 from "../assets/top1.svg"
import Bottom1 from "../assets/bottom1.svg"
import Top2 from "../assets/top2.svg"
import Bottom2 from "../assets/bottom2.svg"
import Top3 from "../assets/top3.svg"
import Bottom3 from "../assets/bottom3.svg"
import Top4 from "../assets/top4.svg"
import Bottom4 from "../assets/bottom4.svg"
import Top5 from "../assets/top5.svg"
import Bottom5 from "../assets/bottom5.svg"
import Top6 from "../assets/top6.svg"
import Bottom6 from "../assets/bottom6.svg"
import Top7 from "../assets/top7.svg"
import Bottom7 from "../assets/bottom7.svg"
import Top8 from "../assets/top8.svg"
import Bottom8 from "../assets/bottom8.svg"
import Top9 from "../assets/top9.svg"
import Bottom9 from "../assets/bottom9.svg"
import Top10 from "../assets/top10.svg"
import Bottom10 from "../assets/bottom10.svg"
import Top11 from "../assets/top11.svg"
import Bottom11 from "../assets/bottom11.svg"
import Top12 from "../assets/top12.svg"
import Bottom12 from "../assets/bottom12.svg"
import Top13 from "../assets/top13.svg"
import Bottom13 from "../assets/bottom13.svg"
import Top14 from "../assets/top14.svg"
import Bottom14 from "../assets/bottom14.svg"
import Top15 from "../assets/top15.svg"
import Bottom15 from "../assets/bottom15.svg"
import Top16 from "../assets/top16.svg"
import Bottom16 from "../assets/bottom16.svg"
import Top17 from "../assets/top17.svg"
import Bottom17 from "../assets/bottom17.svg"
import Top18 from "../assets/top18.svg"
import Bottom18 from "../assets/bottom18.svg"
import Top19 from "../assets/top19.svg"
import Bottom19 from "../assets/bottom19.svg"
import Useredit from "../assets/user-edit.svg"
import Markerpin01 from "../assets/marker-pin-01.svg"
import Clockfastforward from "../assets/clock-fast-forward.svg"
import Useredit1 from "../assets/user-edit1.svg"
import Markerpin011 from "../assets/marker-pin-011.svg"
import Clockfastforward1 from "../assets/clock-fast-forward1.svg"
import Useredit2 from "../assets/user-edit2.svg"
import Markerpin012 from "../assets/marker-pin-012.svg"
import Clockfastforward2 from "../assets/clock-fast-forward2.svg"
import Border from "../assets/Border.svg"
import Cap from "../assets/Cap.svg"
import Wifi from "../assets/Wifi.svg"
import Cellular from "../assets/Cellular.svg"
import Home05 from "../assets/home-05.svg"
import List1 from "../assets/list1.svg"
import Messagechatcircle from "../assets/message-chat-circle.svg"
import User01 from "../assets/user-01.svg"
import Searchmd from "../assets/search-md.svg"
import Top20 from "../assets/top20.svg"
import Bottom20 from "../assets/bottom20.svg"
import Top21 from "../assets/top21.svg"
import Bottom21 from "../assets/bottom21.svg"
import Top22 from "../assets/top22.svg"
import Bottom22 from "../assets/bottom22.svg"
import Top23 from "../assets/top23.svg"
import Bottom23 from "../assets/bottom23.svg"
import { Color, FontFamily, Border, Padding, FontSize, Gap } from "../GlobalStyles";

const Homescreen = () => {

  return (
    <SafeAreaView style={styles.homescreen}>
      <View style={styles.view}>
        <View style={styles.content}>
          <View style={styles.commander}>
            <View style={[styles.header, styles.headerFlexBox]}>
              <Text style={[styles.headline, styles.text2Typo1]}>Members</Text>
              <View style={styles.dark}>
                <View style={styles.buttonWrapper}>
                  <Text style={[styles.button, styles.timeTypo]}>View All</Text>
                </View>
              </View>
            </View>
            <View style={styles.groupAvatar}>
              <View style={styles.avatarFlexBox1}>
                <View style={styles.avatar}>
                  <ImageBackground style={styles.imageIcon} resizeMode="cover" source="Image.png">
                    <View style={[styles.row, styles.rowFlexBox]}>
                      <View style={[styles.scaleUnit, styles.scalePosition]}>
                        <Top style={[styles.topIcon, styles.topIconLayout]} />
                        <Bottom style={[styles.topIcon, styles.topIconLayout]} />
                      </View>
                      <View style={[styles.homescreenScaleUnit, styles.scalePosition]}>
                        <Top1 style={[styles.topIcon, styles.topIconLayout]} />
                        <Bottom1 style={[styles.topIcon, styles.topIconLayout]} />
                      </View>
                    </View>
                    <View style={[styles.row, styles.rowFlexBox]}>
                      <View style={[styles.scaleUnit, styles.scalePosition]}>
                        <Top2 style={[styles.topIcon, styles.topIconLayout]} />
                        <Bottom2 style={[styles.topIcon, styles.topIconLayout]} />
                      </View>
                      <View style={[styles.homescreenScaleUnit, styles.scalePosition]}>
                        <Top3 style={[styles.topIcon, styles.topIconLayout]} />
                        <Bottom3 style={[styles.topIcon, styles.topIconLayout]} />
                      </View>
                    </View>
                  </ImageBackground>
                </View>
                <View style={[styles.indicator, styles.indicatorBorder]} />
              </View>
              <View style={styles.avatarFlexBox1}>
                <View style={styles.avatar}>
                  <ImageBackground style={styles.imageIcon} resizeMode="cover" source="Image.png">
                    <View style={[styles.row, styles.rowFlexBox]}>
                      <View style={[styles.scaleUnit, styles.scalePosition]}>
                        <Top4 style={[styles.topIcon, styles.topIconLayout]} />
                        <Bottom4 style={[styles.topIcon, styles.topIconLayout]} />
                      </View>
                      <View style={[styles.homescreenScaleUnit, styles.scalePosition]}>
                        <Top5 style={[styles.topIcon, styles.topIconLayout]} />
                        <Bottom5 style={[styles.topIcon, styles.topIconLayout]} />
                      </View>
                    </View>
                    <View style={[styles.row, styles.rowFlexBox]}>
                      <View style={[styles.scaleUnit, styles.scalePosition]}>
                        <Top6 style={[styles.topIcon, styles.topIconLayout]} />
                        <Bottom6 style={[styles.topIcon, styles.topIconLayout]} />
                      </View>
                      <View style={[styles.homescreenScaleUnit, styles.scalePosition]}>
                        <Top7 style={[styles.topIcon, styles.topIconLayout]} />
                        <Bottom7 style={[styles.topIcon, styles.topIconLayout]} />
                      </View>
                    </View>
                  </ImageBackground>
                </View>
                <View style={[styles.indicator, styles.indicatorBorder]} />
              </View>
              <View style={styles.avatarFlexBox1}>
                <View style={styles.avatar}>
                  <ImageBackground style={styles.imageIcon} resizeMode="cover" source="Image.png">
                    <View style={[styles.row, styles.rowFlexBox]}>
                      <View style={[styles.scaleUnit, styles.scalePosition]}>
                        <Top8 style={[styles.topIcon, styles.topIconLayout]} />
                        <Bottom8 style={[styles.topIcon, styles.topIconLayout]} />
                      </View>
                      <View style={[styles.homescreenScaleUnit, styles.scalePosition]}>
                        <Top9 style={[styles.topIcon, styles.topIconLayout]} />
                        <Bottom9 style={[styles.topIcon, styles.topIconLayout]} />
                      </View>
                    </View>
                    <View style={[styles.row, styles.rowFlexBox]}>
                      <View style={[styles.scaleUnit, styles.scalePosition]}>
                        <Top10 style={[styles.topIcon, styles.topIconLayout]} />
                        <Bottom10 style={[styles.topIcon, styles.topIconLayout]} />
                      </View>
                      <View style={[styles.homescreenScaleUnit, styles.scalePosition]}>
                        <Top11 style={[styles.topIcon, styles.topIconLayout]} />
                        <Bottom11 style={[styles.topIcon, styles.topIconLayout]} />
                      </View>
                    </View>
                  </ImageBackground>
                </View>
                <View style={[styles.indicator, styles.indicatorBorder]} />
              </View>
              <View style={styles.avatarFlexBox1}>
                <View style={styles.avatar}>
                  <ImageBackground style={styles.imageIcon} resizeMode="cover" source="Image.png">
                    <View style={[styles.row, styles.rowFlexBox]}>
                      <View style={[styles.scaleUnit, styles.scalePosition]}>
                        <Top12 style={[styles.topIcon, styles.topIconLayout]} />
                        <Bottom12 style={[styles.topIcon, styles.topIconLayout]} />
                      </View>
                      <View style={[styles.homescreenScaleUnit, styles.scalePosition]}>
                        <Top13 style={[styles.topIcon, styles.topIconLayout]} />
                        <Bottom13 style={[styles.topIcon, styles.topIconLayout]} />
                      </View>
                    </View>
                    <View style={[styles.row, styles.rowFlexBox]}>
                      <View style={[styles.scaleUnit, styles.scalePosition]}>
                        <Top14 style={[styles.topIcon, styles.topIconLayout]} />
                        <Bottom14 style={[styles.topIcon, styles.topIconLayout]} />
                      </View>
                      <View style={[styles.homescreenScaleUnit, styles.scalePosition]}>
                        <Top15 style={[styles.topIcon, styles.topIconLayout]} />
                        <Bottom15 style={[styles.topIcon, styles.topIconLayout]} />
                      </View>
                    </View>
                  </ImageBackground>
                </View>
                <View style={[styles.indicator, styles.indicatorBorder]} />
              </View>
              <View style={styles.avatarFlexBox1}>
                <View style={[styles.avatarInitials, styles.baseLayout]}>
                  <Text style={[styles.text, styles.textFlexBox]}>+2</Text>
                  <View style={[styles.base, styles.baseLayout]}>
                    <View style={[styles.row, styles.rowFlexBox]}>
                      <View style={[styles.scaleUnit, styles.scalePosition]}>
                        <Top16 style={[styles.topIcon, styles.topIconLayout]} />
                        <Bottom16 style={[styles.topIcon, styles.topIconLayout]} />
                      </View>
                      <View style={[styles.homescreenScaleUnit, styles.scalePosition]}>
                        <Top17 style={[styles.topIcon, styles.topIconLayout]} />
                        <Bottom17 style={[styles.topIcon, styles.topIconLayout]} />
                      </View>
                    </View>
                    <View style={[styles.row, styles.rowFlexBox]}>
                      <View style={[styles.scaleUnit, styles.scalePosition]}>
                        <Top18 style={[styles.topIcon, styles.topIconLayout]} />
                        <Bottom18 style={[styles.topIcon, styles.topIconLayout]} />
                      </View>
                      <View style={[styles.homescreenScaleUnit, styles.scalePosition]}>
                        <Top19 style={[styles.topIcon, styles.topIconLayout]} />
                        <Bottom19 style={[styles.topIcon, styles.topIconLayout]} />
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>
          <View style={styles.commander}>
            <View style={[styles.header, styles.headerFlexBox]}>
              <Text style={[styles.headline, styles.text2Typo1]}>Incidents</Text>
              <View style={styles.dark}>
                <View style={styles.buttonWrapper}>
                  <Text style={[styles.button, styles.timeTypo]}>View All</Text>
                </View>
              </View>
            </View>
            <View style={styles.matchCard}>
              <View style={styles.section}>
                <Text style={[styles.homescreenText, styles.headline2Layout]}>Chemical Spill</Text>
                <View style={[styles.badge, styles.badgeSpaceBlock]}>
                  <Text style={[styles.text2, styles.text2Typo]}>High</Text>
                </View>
              </View>
              <View style={styles.homescreenSection}>
                <View style={styles.container}>
                  <View style={styles.section}>
                    <Useredit style={styles.userEditIcon} width={16} height={16} />
                    <Text style={[styles.text3, styles.personalLayout]}>Laila Johnson</Text>
                  </View>
                  <View style={styles.section}>
                    <Markerpin01 style={styles.userEditIcon} width={16} height={16} />
                    <Text style={[styles.text3, styles.personalLayout]}>Industrial Zone Alpha, 123 Main St</Text>
                  </View>
                  <View style={styles.section}>
                    <Clockfastforward style={styles.userEditIcon} width={16} height={16} />
                    <Text style={[styles.text3, styles.personalLayout]}>12 min ago</Text>
                  </View>
                </View>
              </View>
            </View>
            <View style={styles.matchCard}>
              <View style={styles.section}>
                <Text style={[styles.homescreenText, styles.headline2Layout]}>Chemical Spill</Text>
                <View style={[styles.badge, styles.badgeSpaceBlock]}>
                  <Text style={[styles.text2, styles.text2Typo]}>High</Text>
                </View>
              </View>
              <View style={styles.homescreenSection}>
                <View style={styles.container}>
                  <View style={styles.section}>
                    <Useredit1 style={styles.userEditIcon} width={16} height={16} />
                    <Text style={[styles.text3, styles.personalLayout]}>Laila Johnson</Text>
                  </View>
                  <View style={styles.section}>
                    <Markerpin011 style={styles.userEditIcon} width={16} height={16} />
                    <Text style={[styles.text3, styles.personalLayout]}>Industrial Zone Alpha, 123 Main St</Text>
                  </View>
                  <View style={styles.section}>
                    <Clockfastforward1 style={styles.userEditIcon} width={16} height={16} />
                    <Text style={[styles.text3, styles.personalLayout]}>12 min ago</Text>
                  </View>
                </View>
              </View>
            </View>
            <View style={styles.matchCard}>
              <View style={styles.section}>
                <Text style={[styles.homescreenText, styles.headline2Layout]}>Chemical Spill</Text>
                <View style={[styles.badge2, styles.badgeSpaceBlock]}>
                  <Text style={[styles.text2, styles.text2Typo]}>Low</Text>
                </View>
              </View>
              <View style={styles.homescreenSection}>
                <View style={styles.container}>
                  <View style={styles.section}>
                    <Useredit2 style={styles.userEditIcon} width={16} height={16} />
                    <Text style={[styles.text3, styles.personalLayout]}>Laila Johnson</Text>
                  </View>
                  <View style={styles.section}>
                    <Markerpin012 style={styles.userEditIcon} width={16} height={16} />
                    <Text style={[styles.text3, styles.personalLayout]}>Industrial Zone Alpha, 123 Main St</Text>
                  </View>
                  <View style={styles.section}>
                    <Clockfastforward2 style={styles.userEditIcon} width={16} height={16} />
                    <Text style={[styles.text3, styles.personalLayout]}>12 min ago</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
        <View style={[styles.statusBariphone12Mini, styles.scalePosition]}>
          <View style={styles.statusiphone12Mini}>
            <View style={styles.batteryiphone12Mini}>
              <Border style={[styles.borderIcon, styles.iconLayout]} />
              <Cap style={[styles.capIcon, styles.iconLayout]} />
              <View style={styles.capacity} />
            </View>
            <Wifi style={styles.wifiIcon} width={15} height={11} />
            <Cellular style={styles.cellularIcon} width={17} height={11} />
          </View>
          <Text style={[styles.time, styles.timeTypo]}>9:41</Text>
        </View>
        <View style={[styles.navigateBar, styles.headerFlexBox]}>
          <View style={styles.navigateLayout}>
            <Home05 style={styles.home05Icon} width={24} height={24} />
            <Text style={[styles.home, styles.homeTypo]}>Home</Text>
          </View>
          <View style={styles.navigateLayout}>
            <List1 style={styles.listIcon} width={24} height={24} />
            <Text style={[styles.tasks, styles.homeTypo]}>Tasks</Text>
            <View style={[styles.bagde, styles.bagdePosition]}>
              <Text style={[styles.text16, styles.textFlexBox]}>1</Text>
            </View>
          </View>
          <View style={styles.navigateLayout}>
            <Messagechatcircle style={styles.listIcon} width={24} height={24} />
            <Text style={[styles.tasks, styles.homeTypo]}>Chat</Text>
            <View style={[styles.homescreenBagde, styles.bagdePosition]}>
              <Text style={[styles.text16, styles.textFlexBox]}>1</Text>
            </View>
          </View>
          <View style={styles.navigateLayout}>
            <User01 style={styles.home05Icon} width={24} height={24} />
            <Text style={[styles.profile, styles.homeTypo]}>Profile</Text>
          </View>
        </View>
        <View style={[styles.appBar, styles.appBarFlexBox]}>
          <View style={styles.textContent}>
            <Text style={[styles.headline2, styles.headline2Layout]}>Alpha-7 Task Force</Text>
            <Text style={styles.supportingText}>Supporting text</Text>
          </View>
          <View style={styles.trailingElements}>
            <View style={[styles.userAvatar, styles.avatarFlexBox]}>
              <Searchmd style={styles.userEditIcon} width={16} height={16} />
            </View>
            <View style={[styles.userAvatar, styles.avatarFlexBox]}>
              <Image style={styles.userEditIcon} resizeMode="cover" source="Icon Badge/Normal.png" />
            </View>
            <View style={[styles.avatarStatus5, styles.avatarFlexBox]}>
              <View style={styles.avatar}>
                <ImageBackground style={styles.imageIcon} resizeMode="cover" source="Image.png">
                  <View style={[styles.row10, styles.rowFlexBox]}>
                    <View style={[styles.scaleUnit20, styles.scalePosition]}>
                      <Top20 style={[styles.topIcon20, styles.topIconLayout]} />
                      <Bottom20 style={[styles.topIcon20, styles.topIconLayout]} />
                    </View>
                    <View style={[styles.scaleUnit21, styles.scalePosition]}>
                      <Top21 style={[styles.topIcon20, styles.topIconLayout]} />
                      <Bottom21 style={[styles.topIcon20, styles.topIconLayout]} />
                    </View>
                  </View>
                  <View style={[styles.row10, styles.rowFlexBox]}>
                    <View style={[styles.scaleUnit20, styles.scalePosition]}>
                      <Top22 style={[styles.topIcon20, styles.topIconLayout]} />
                      <Bottom22 style={[styles.topIcon20, styles.topIconLayout]} />
                    </View>
                    <View style={[styles.scaleUnit21, styles.scalePosition]}>
                      <Top23 style={[styles.topIcon20, styles.topIconLayout]} />
                      <Bottom23 style={[styles.topIcon20, styles.topIconLayout]} />
                    </View>
                  </View>
                </ImageBackground>
              </View>
              <View style={[styles.indicator4, styles.indicatorBorder]} />
            </View>
          </View>
        </View>
        <View style={styles.tab}>
          <View style={styles.tabHorizontalItemDark}>
            <Text style={[styles.personalDetails, styles.personalLayout]}>Flat View</Text>
            <View style={[styles.shapeSharp, styles.shapeFlexBox]} />
          </View>
          <View style={styles.tabHorizontalItemDark}>
            <Text style={[styles.homescreenPersonalDetails, styles.homeTypo]}>Map View</Text>
            <View style={[styles.homescreenShapeSharp, styles.shapeFlexBox]} />
          </View>
        </View>
        <View style={[styles.button2, styles.appBarFlexBox]}>
          <Image style={styles.buttonChild} resizeMode="cover" source="Frame 7.png" />
        </View>
      </View>
    </SafeAreaView>);
};

const styles = StyleSheet.create({
  homescreen: {
    backgroundColor: Color.colorGray300,
    flex: 1
  },
  headerFlexBox: {
    gap: 0,
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row"
  },
  text2Typo1: {
    fontWeight: "600",
    textAlign: "left",
    fontFamily: FontFamily.manropeSemiBold
  },
  timeTypo: {
    textAlign: "center",
    fontWeight: "600"
  },
  rowFlexBox: {
    opacity: 0,
    alignSelf: "stretch"
  },
  scalePosition: {
    top: 0,
    position: "absolute"
  },
  topIconLayout: {
    opacity: 0.7,
    maxWidth: "100%",
    alignSelf: "stretch",
    overflow: "hidden",
    width: "100%"
  },
  indicatorBorder: {
    borderColor: Color.colorBlack,
    backgroundColor: Color.colorMediumspringgreen,
    zIndex: 1,
    borderStyle: "solid",
    borderRadius: Border.br_64,
    position: "absolute"
  },
  baseLayout: {
    borderRadius: Border.br_64,
    flex: 1
  },
  textFlexBox: {
    display: "flex",
    top: "50%",
    textAlign: "center",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute"
  },
  headline2Layout: {
    lineHeight: 22,
    color: Color.colorWhite
  },
  badgeSpaceBlock: {
    paddingVertical: Padding.p_1,
    paddingHorizontal: Padding.p_6,
    borderRadius: Border.br_100,
    justifyContent: "center",
    alignItems: "center"
  },
  text2Typo: {
    fontSize: FontSize.size_12,
    color: Color.colorWhite,
    lineHeight: 18
  },
  personalLayout: {
    lineHeight: 21,
    fontSize: FontSize.size_14
  },
  iconLayout: {
    maxHeight: "100%",
    maxWidth: "100%",
    position: "absolute",
    overflow: "hidden"
  },
  homeTypo: {
    fontFamily: FontFamily.manropeMedium,
    fontWeight: "500",
    textAlign: "center",
    alignSelf: "stretch"
  },
  bagdePosition: {
    zIndex: 2,
    top: -4,
    height: 16,
    width: 16,
    backgroundColor: Color.colorFirebrick,
    borderRadius: Border.br_100,
    position: "absolute"
  },
  appBarFlexBox: {
    height: 56,
    paddingHorizontal: Padding.p_16,
    alignItems: "center",
    flexDirection: "row",
    position: "absolute"
  },
  avatarFlexBox: {
    width: 32,
    justifyContent: "center",
    alignItems: "center"
  },
  shapeFlexBox: {
    transform: [
      {
        rotate: "90deg"
      }
    ],
    alignSelf: "stretch",
    flex: 1
  },
  view: {
    height: 812,
    overflow: "hidden",
    width: "100%",
    backgroundColor: Color.colorGray300,
    flex: 1
  },
  content: {
    top: 177,
    width: 343,
    gap: 40,
    left: 16,
    position: "absolute"
  },
  commander: {
    gap: Gap.gap_16,
    alignSelf: "stretch"
  },
  header: {
    alignSelf: "stretch"
  },
  headline: {
    color: Color.colorGainsboro,
    textAlign: "left",
    fontFamily: FontFamily.manropeSemiBold,
    lineHeight: 18,
    fontSize: FontSize.size_16,
    fontWeight: "600",
    overflow: "hidden"
  },
  dark: {
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    overflow: "hidden"
  },
  buttonWrapper: {
    alignItems: "center",
    flexDirection: "row"
  },
  button: {
    color: Color.colorRoyalblue,
    fontSize: FontSize.size_12,
    lineHeight: 18,
    fontFamily: FontFamily.manropeSemiBold
  },
  groupAvatar: {
    gap: Gap.gap_12,
    flexDirection: "row"
  },
  avatarFlexBox1: {
    width: 48,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row"
  },
  avatar: {
    backgroundColor: Color.colorLightgray,
    borderColor: Color.colorLightgray,
    zIndex: 0,
    borderWidth: 1,
    borderStyle: "solid",
    borderRadius: Border.br_64,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    overflow: "hidden",
    flex: 1
  },
  imageIcon: {
    flex: 1
  },
  row: {
    height: 24
  },
  scaleUnit: {
    width: 24,
    left: 0
  },
  topIcon: {
    height: 12
  },
  homescreenScaleUnit: {
    left: 24,
    width: 24
  },
  indicator: {
    right: -2,
    bottom: -2,
    borderWidth: 1.7,
    height: 15,
    zIndex: 1,
    width: 15
  },
  avatarInitials: {
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    overflow: "hidden"
  },
  text: {
    marginTop: -12,
    lineHeight: 24,
    fontFamily: FontFamily.interBold,
    color: Color.colorBlack,
    fontWeight: "700",
    letterSpacing: 0.5,
    display: "flex",
    top: "50%",
    zIndex: 1,
    left: 0,
    width: 48,
    fontSize: FontSize.size_16
  },
  base: {
    backgroundColor: Color.colorAliceblue,
    zIndex: 0
  },
  matchCard: {
    borderRadius: Border.br_8,
    backgroundColor: Color.colorGray200,
    borderColor: Color.colorGray100,
    paddingVertical: Padding.p_12,
    paddingHorizontal: Padding.p_16,
    borderWidth: 1,
    borderStyle: "solid",
    gap: Gap.gap_12,
    alignSelf: "stretch",
    overflow: "hidden"
  },
  section: {
    gap: Gap.gap_8,
    alignItems: "center",
    flexDirection: "row",
    alignSelf: "stretch"
  },
  homescreenText: {
    fontSize: FontSize.size_18,
    fontFamily: FontFamily.manropeBold,
    color: Color.colorWhite,
    fontWeight: "700",
    textAlign: "left",
    flex: 1
  },
  badge: {
    backgroundColor: Color.colorFirebrick,
    paddingVertical: Padding.p_1,
    paddingHorizontal: Padding.p_6
  },
  text2: {
    color: Color.colorWhite,
    textAlign: "left",
    fontFamily: FontFamily.manropeSemiBold,
    fontWeight: "600",
    alignSelf: "stretch"
  },
  homescreenSection: {
    borderRadius: Border.br_10,
    backgroundColor: Color.colorDarkgray,
    padding: Padding.p_12,
    flexDirection: "row",
    alignSelf: "stretch"
  },
  container: {
    gap: Gap.gap_8,
    justifyContent: "center",
    flex: 1
  },
  userEditIcon: {
    height: 16,
    width: 16
  },
  text3: {
    fontFamily: FontFamily.manropeRegular,
    color: Color.colorWhite,
    textAlign: "left"
  },
  badge2: {
    backgroundColor: Color.colorOrangered
  },
  statusBariphone12Mini: {
    height: 50,
    width: 375,
    left: 0
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
    left: "0%"
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
    height: 11,
    width: 15
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
    color: Color.colorWhite,
    position: "absolute"
  },
  navigateBar: {
    marginLeft: -187.5,
    bottom: 0,
    left: "50%",
    paddingTop: Padding.p_8,
    paddingBottom: 24,
    width: 375,
    position: "absolute",
    backgroundColor: Color.colorGray300
  },
  navigateLayout: {
    gap: Gap.gap_4,
    width: 94,
    alignItems: "center"
  },
  home05Icon: {
    width: 24,
    height: 24
  },
  home: {
    color: Color.colorRoyalblue,
    fontSize: FontSize.size_12,
    lineHeight: 18
  },
  listIcon: {
    width: 24,
    height: 24,
    zIndex: 0
  },
  tasks: {
    color: Color.colorWhite,
    zIndex: 1,
    fontSize: FontSize.size_12,
    lineHeight: 18
  },
  bagde: {
    left: 50
  },
  text16: {
    marginTop: -9,
    left: "0%",
    color: Color.colorWhite,
    display: "flex",
    top: "50%",
    fontSize: FontSize.size_12,
    fontFamily: FontFamily.manropeSemiBold,
    fontWeight: "600",
    lineHeight: 18,
    width: "100%"
  },
  homescreenBagde: {
    left: 51
  },
  profile: {
    color: Color.colorWhite,
    fontSize: FontSize.size_12,
    lineHeight: 18
  },
  appBar: {
    top: 50,
    paddingVertical: Padding.p_8,
    width: 375,
    gap: Gap.gap_8,
    left: 0
  },
  textContent: {
    justifyContent: "center",
    flex: 1
  },
  headline2: {
    fontSize: 20,
    color: Color.colorWhite,
    textAlign: "center",
    fontWeight: "600",
    fontFamily: FontFamily.manropeSemiBold,
    overflow: "hidden"
  },
  supportingText: {
    width: 263,
    lineHeight: 16,
    fontFamily: FontFamily.robotoMedium,
    color: Color.colorDarkslategray,
    display: "none",
    fontWeight: "500",
    letterSpacing: 0.5,
    textAlign: "center",
    fontSize: FontSize.size_12,
    overflow: "hidden"
  },
  trailingElements: {
    gap: Gap.gap_8,
    alignItems: "center",
    flexDirection: "row"
  },
  userAvatar: {
    height: 32,
    borderRadius: Border.br_100,
    overflow: "hidden"
  },
  avatarStatus5: {
    flexDirection: "row"
  },
  row10: {
    height: 16
  },
  scaleUnit20: {
    width: 16,
    left: 0
  },
  topIcon20: {
    height: 8
  },
  scaleUnit21: {
    width: 16,
    left: 16
  },
  indicator4: {
    width: 11,
    right: -1,
    bottom: -1,
    borderWidth: 1.3,
    height: 11,
    zIndex: 1
  },
  tab: {
    top: 122,
    width: 375,
    left: 0,
    alignItems: "center",
    flexDirection: "row",
    position: "absolute"
  },
  tabHorizontalItemDark: {
    height: 39,
    justifyContent: "center",
    alignItems: "center",
    gap: Gap.gap_16,
    flex: 1
  },
  personalDetails: {
    color: Color.colorWhite,
    textAlign: "center",
    fontWeight: "600",
    fontFamily: FontFamily.manropeSemiBold,
    alignSelf: "stretch"
  },
  shapeSharp: {
    backgroundColor: Color.colorRoyalblue
  },
  homescreenPersonalDetails: {
    color: Color.colorDimgray,
    lineHeight: 21,
    fontSize: FontSize.size_14
  },
  homescreenShapeSharp: {
    backgroundColor: Color.colorGray100
  },
  button2: {
    top: 646,
    left: 303,
    paddingVertical: 0,
    backgroundColor: Color.colorRoyalblue,
    borderRadius: Border.br_100,
    overflow: "hidden",
    justifyContent: "center"
  },
  buttonChild: {
    height: 48,
    width: 24
  }
});

export default Homescreen;



/* Fonts */
export const FontFamily = {
  manropeRegular: "Manrope-Regular",
  sFProText: "SF Pro Text",
  manropeMedium: "Manrope-Medium",
  robotoMedium: "Roboto-Medium",
  manropeBold: "Manrope-Bold",
  manropeSemiBold: "Manrope-SemiBold",
  interBold: "Inter-Bold",
};
/* Font sizes */
export const FontSize = {
  size_12: 12,
  size_14: 14,
  size_16: 16,
  size_18: 18,
};
/* Colors */
export const Color = {
  colorGray300: "#101213",
  colorGainsboro: "#dee2e6",
  colorDimgray: "#6a7178",
  colorDarkslategray: "#49454f",
  colorGray100: "#272b30",
  colorGray200: "#1e1e1e",
  colorMediumspringgreen: "#1ce783",
  colorOrangered: "#f76707",
  colorDarkgray: "rgba(163, 163, 163, 0.05)",
  colorFirebrick: "#c92a2a",
  colorWhite: "#fff",
  colorLightgray: "rgba(209, 209, 209, 0.05)",
  colorRoyalblue: "#1068eb",
  colorAliceblue: "#e8f0fd",
  colorBlack: "#000",
};
/* Gaps */
export const Gap = {
  gap_4: 4,
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
  br_64: 64,
  br_100: 100,
};