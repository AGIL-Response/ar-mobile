import * as React from 'react';
import { Image, ImageBackground, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Border from '../assets/Border.svg';
import Cap from '../assets/Cap.svg';
import Cellular from '../assets/Cellular.svg';
import Home05 from '../assets/home-05.svg';
import List1 from '../assets/list1.svg';
import Messagechatcircle from '../assets/message-chat-circle.svg';
import Searchmd from '../assets/search-md.svg';
import User01 from '../assets/user-01.svg';
import Wifi from '../assets/Wifi.svg';
import {
  Border,
  Color,
  FontFamily,
  FontSize,
  Gap,
  Padding,
} from '../GlobalStyles';

const Tasks = () => {
  return (
    <SafeAreaView style={styles.tasks}>
      <View style={styles.view}>
        <View style={[styles.tasks2, styles.tasksPosition]}>
          <View style={styles.content}>
            <View style={styles.commander}>
              <Text style={[styles.headline, styles.textTypo2]}>
                Pending Tasks (4)
              </Text>
              <View style={styles.matchCard}>
                <View style={[styles.section, styles.sectionFlexBox]}>
                  <View style={styles.autoAddedFrame}>
                    <View style={styles.checkboxDarkMode}>
                      <View style={[styles.checkbox, styles.iconLayout1]} />
                    </View>
                  </View>
                  <Text style={[styles.text, styles.textTypo2]}>
                    Assess Structural Damage
                  </Text>
                  <View style={[styles.badge, styles.badgeSpaceBlock]}>
                    <Text style={[styles.tasksText, styles.textTypo1]}>
                      In Progress
                    </Text>
                  </View>
                </View>
                <Text style={[styles.text2, styles.textTypo]}>
                  Conduct a rapid assessment of structural integrity in Sector
                </Text>
                <Text style={[styles.text3, styles.textTypo]}>
                  Today, 2:00 PM
                </Text>
              </View>
              <View style={styles.matchCard}>
                <View style={[styles.section, styles.sectionFlexBox]}>
                  <View style={styles.checkboxDarkMode}>
                    <View style={[styles.checkbox, styles.iconLayout1]} />
                  </View>
                  <Text style={[styles.text, styles.textTypo2]}>
                    Evacuate Sector Delta
                  </Text>
                  <View style={[styles.tasksBadge, styles.badgeSpaceBlock]}>
                    <Text style={[styles.text5, styles.textTypo1]}>
                      Not Started
                    </Text>
                  </View>
                </View>
                <Text style={[styles.text2, styles.textTypo]}>
                  Ensure all civilians are safely evacuated from Sector Delta
                </Text>
                <View style={styles.textWrapper}>
                  <Text style={[styles.text3, styles.textTypo]}>
                    Tomorrow, 9:30 PM
                  </Text>
                </View>
              </View>
              <View style={styles.matchCard}>
                <View style={[styles.section, styles.sectionFlexBox]}>
                  <View style={styles.checkboxDarkMode}>
                    <View style={[styles.checkbox, styles.iconLayout1]} />
                  </View>
                  <Text style={[styles.text, styles.textTypo2]}>
                    Assess Structural Damage
                  </Text>
                  <View style={styles.badge2}>
                    <Text style={[styles.tasksText, styles.textTypo1]}>
                      Overdue
                    </Text>
                  </View>
                </View>
                <Text style={[styles.text2, styles.textTypo]}>
                  Establish a secure perimeter around the incident site in
                </Text>
                <Text style={[styles.text3, styles.textTypo]}>
                  Mon, 9:00 AM
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.content}>
            <View style={styles.commander}>
              <Text style={[styles.headline, styles.textTypo2]}>
                Completed Tasks (2)
              </Text>
              <View style={styles.matchCard}>
                <View style={[styles.section, styles.sectionFlexBox]}>
                  <View style={styles.checkboxDarkMode}>
                    <View style={[styles.checkbox, styles.iconLayout1]} />
                  </View>
                  <Text style={[styles.text, styles.textTypo2]}>
                    Provide medical aid
                  </Text>
                  <View style={[styles.badge3, styles.badgeSpaceBlock]}>
                    <Text style={[styles.tasksText, styles.textTypo1]}>
                      Completed
                    </Text>
                  </View>
                </View>
                <Text style={[styles.text2, styles.textTypo]}>
                  Administer first aid to injured personnel at the triage point
                  in
                </Text>
                <Text style={[styles.text3, styles.textTypo]}>
                  Yesterday, 11:00 AM
                </Text>
              </View>
              <View style={styles.matchCard}>
                <View style={[styles.section, styles.sectionFlexBox]}>
                  <View style={styles.checkboxDarkMode}>
                    <View style={[styles.checkbox, styles.iconLayout1]} />
                  </View>
                  <Text style={[styles.text, styles.textTypo2]}>
                    Replenish supplies
                  </Text>
                  <View style={[styles.badge3, styles.badgeSpaceBlock]}>
                    <Text style={[styles.tasksText, styles.textTypo1]}>
                      Completed
                    </Text>
                  </View>
                </View>
                <Text style={[styles.text2, styles.textTypo]}>
                  Restock medical and communication supplies at
                </Text>
                <Text style={[styles.text3, styles.textTypo]}>
                  Yesterday, 3:00 PM
                </Text>
              </View>
            </View>
          </View>
        </View>
        <View style={[styles.statusBariphone12Mini, styles.tabLayout]}>
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
        <View style={[styles.navigateBar, styles.tabLayout]}>
          <View style={styles.navigateLayout}>
            <Home05 style={styles.iconLayout1} width={24} height={24} />
            <Text style={[styles.home, styles.tasksTypo]}>Home</Text>
          </View>
          <View style={styles.navigateLayout}>
            <List1
              style={[styles.listIcon, styles.iconLayout1]}
              width={24}
              height={24}
            />
            <Text style={[styles.tasks3, styles.tasksTypo]}>Tasks</Text>
            <View style={[styles.bagde, styles.bagdePosition]}>
              <Text style={[styles.text20, styles.timeTypo]}>1</Text>
            </View>
          </View>
          <View style={styles.navigateLayout}>
            <Messagechatcircle
              style={[styles.listIcon, styles.iconLayout1]}
              width={24}
              height={24}
            />
            <Text style={[styles.chat, styles.tasksTypo]}>Chat</Text>
            <View style={[styles.tasksBagde, styles.bagdePosition]}>
              <Text style={[styles.text20, styles.timeTypo]}>1</Text>
            </View>
          </View>
          <View style={styles.navigateLayout}>
            <User01 style={styles.iconLayout1} width={24} height={24} />
            <Text style={[styles.home, styles.tasksTypo]}>Profile</Text>
          </View>
        </View>
        <View style={styles.appBar}>
          <View style={styles.textContent}>
            <Text style={[styles.headline2, styles.timeTypo]}>Tasks</Text>
            <Text style={styles.supportingText}>Supporting text</Text>
          </View>
          <View style={[styles.trailingElements, styles.sectionFlexBox]}>
            <View style={[styles.userAvatar, styles.avatarFlexBox]}>
              <Searchmd style={styles.searchMdIcon} width={16} height={16} />
            </View>
            <View style={[styles.userAvatar, styles.avatarFlexBox]}>
              <Image
                style={styles.searchMdIcon}
                resizeMode="cover"
                source="Icon Badge/Normal.png"
              />
            </View>
            <View style={[styles.avatarStatus, styles.avatarFlexBox]}>
              <View style={[styles.avatar, styles.avatarBorder]}>
                <ImageBackground
                  style={styles.imageIcon}
                  resizeMode="cover"
                  source="Image.png"
                >
                  <View style={styles.row}>
                    <View style={styles.scaleUnit} />
                    <View
                      style={[styles.tasksScaleUnit, styles.tasksPosition]}
                    />
                  </View>
                  <View style={styles.row}>
                    <View style={styles.scaleUnit} />
                    <View
                      style={[styles.tasksScaleUnit, styles.tasksPosition]}
                    />
                  </View>
                </ImageBackground>
              </View>
              <View style={[styles.indicator, styles.avatarBorder]} />
            </View>
          </View>
        </View>
        <View style={styles.button}>
          <Image
            style={styles.buttonChild}
            resizeMode="cover"
            source="Frame 7.png"
          />
        </View>
        <View style={[styles.tab, styles.tabLayout]}>
          <View style={styles.tabHorizontalItemDark}>
            <Text style={[styles.personalDetails, styles.timeTypo]}>All</Text>
            <View style={styles.shapeSharp} />
          </View>
          <View style={styles.tabHorizontalItemDark}>
            <Text style={[styles.tasksPersonalDetails, styles.tasksTypo]}>
              Pending
            </Text>
            <View style={styles.shapeFlexBox} />
          </View>
          <View style={styles.tabHorizontalItemDark}>
            <Text style={[styles.tasksPersonalDetails, styles.tasksTypo]}>
              Completed
            </Text>
            <View style={styles.shapeFlexBox} />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  tasks: {
    backgroundColor: Color.colorGray300,
    flex: 1,
  },
  tasksPosition: {
    left: 16,
    position: 'absolute',
  },
  textTypo2: {
    textAlign: 'left',
    fontWeight: '600',
    fontFamily: FontFamily.manropeSemiBold,
  },
  sectionFlexBox: {
    gap: Gap.gap_8,
    flexDirection: 'row',
  },
  iconLayout1: {
    height: 24,
    width: 24,
  },
  badgeSpaceBlock: {
    paddingVertical: Padding.p_1,
    paddingHorizontal: Padding.p_6,
    justifyContent: 'center',
    borderRadius: Border.br_100,
    alignItems: 'center',
  },
  textTypo1: {
    fontSize: FontSize.size_12,
    lineHeight: 18,
  },
  textTypo: {
    fontFamily: FontFamily.manropeRegular,
    textAlign: 'left',
  },
  tabLayout: {
    width: 375,
    position: 'absolute',
  },
  iconLayout: {
    maxHeight: '100%',
    maxWidth: '100%',
    position: 'absolute',
    overflow: 'hidden',
  },
  timeTypo: {
    textAlign: 'center',
    color: Color.colorWhite,
    fontWeight: '600',
  },
  tasksTypo: {
    fontFamily: FontFamily.manropeMedium,
    fontWeight: '500',
    textAlign: 'center',
    alignSelf: 'stretch',
  },
  bagdePosition: {
    zIndex: 2,
    top: -4,
    height: 16,
    width: 16,
    backgroundColor: Color.colorFirebrick,
    borderRadius: Border.br_100,
    position: 'absolute',
  },
  avatarFlexBox: {
    width: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarBorder: {
    borderRadius: Border.br_64,
    borderStyle: 'solid',
  },
  view: {
    height: 1084,
    overflow: 'hidden',
    width: '100%',
    backgroundColor: Color.colorGray300,
    flex: 1,
  },
  tasks2: {
    top: 177,
    gap: 32,
    width: 343,
  },
  content: {
    width: 343,
  },
  commander: {
    gap: Gap.gap_16,
    alignSelf: 'stretch',
  },
  headline: {
    fontSize: FontSize.size_16,
    color: Color.colorGainsboro,
    lineHeight: 18,
    fontWeight: '600',
    overflow: 'hidden',
  },
  matchCard: {
    borderRadius: Border.br_8,
    backgroundColor: Color.colorGray200,
    borderColor: Color.colorGray100,
    paddingVertical: Padding.p_12,
    gap: Gap.gap_6,
    paddingHorizontal: Padding.p_16,
    borderWidth: 1,
    borderStyle: 'solid',
    alignSelf: 'stretch',
    overflow: 'hidden',
  },
  section: {
    alignSelf: 'stretch',
  },
  autoAddedFrame: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    overflow: 'hidden',
  },
  checkboxDarkMode: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  checkbox: {
    borderRadius: Border.br_4,
    borderColor: Color.colorDimgray200,
    borderWidth: 1,
    borderStyle: 'solid',
    height: 24,
    backgroundColor: Color.colorGray300,
  },
  text: {
    fontSize: FontSize.size_18,
    lineHeight: 20,
    color: Color.colorWhite,
    flex: 1,
  },
  badge: {
    backgroundColor: Color.colorOrange,
  },
  tasksText: {
    color: Color.colorWhite,
    textAlign: 'left',
    fontWeight: '600',
    fontFamily: FontFamily.manropeSemiBold,
    alignSelf: 'stretch',
  },
  text2: {
    color: Color.colorLightgray100,
    lineHeight: 21,
    fontSize: FontSize.size_14,
    alignSelf: 'stretch',
  },
  text3: {
    fontSize: FontSize.size_10,
    lineHeight: 12,
    color: Color.colorDarkgray,
  },
  tasksBadge: {
    backgroundColor: Color.colorWhitesmoke,
  },
  text5: {
    color: Color.colorGray100,
    textAlign: 'left',
    fontWeight: '600',
    fontFamily: FontFamily.manropeSemiBold,
    alignSelf: 'stretch',
  },
  textWrapper: {
    alignItems: 'center',
    flexDirection: 'row',
    alignSelf: 'stretch',
  },
  badge2: {
    backgroundColor: Color.colorFirebrick,
    paddingVertical: Padding.p_1,
    paddingHorizontal: Padding.p_6,
    justifyContent: 'center',
    borderRadius: Border.br_100,
    alignItems: 'center',
  },
  badge3: {
    backgroundColor: Color.colorForestgreen,
  },
  statusBariphone12Mini: {
    height: 50,
    left: 0,
    top: 0,
  },
  statusiphone12Mini: {
    top: 21,
    right: 11,
    width: 68,
    height: 13,
    position: 'absolute',
  },
  batteryiphone12Mini: {
    top: 1,
    right: 0,
    width: 23,
    height: 11,
    position: 'absolute',
  },
  borderIcon: {
    height: '100%',
    width: '90%',
    top: '0%',
    right: '10%',
    bottom: '0%',
    borderRadius: 3,
    opacity: 0.5,
    left: '0%',
  },
  capIcon: {
    height: '35.4%',
    width: '5.65%',
    top: '32.45%',
    right: '0.13%',
    bottom: '32.15%',
    left: '94.22%',
  },
  capacity: {
    height: '64.6%',
    width: '72.61%',
    top: '17.7%',
    right: '18.7%',
    bottom: '17.7%',
    left: '8.7%',
    borderRadius: 1,
    backgroundColor: Color.colorWhite,
    position: 'absolute',
  },
  wifiIcon: {
    width: 15,
    height: 11,
  },
  cellularIcon: {
    width: 17,
    height: 11,
  },
  time: {
    top: 19,
    left: 27,
    fontSize: 15,
    letterSpacing: -0.28,
    fontFamily: FontFamily.sFProText,
    position: 'absolute',
  },
  navigateBar: {
    marginLeft: -187.5,
    bottom: 0,
    left: '50%',
    justifyContent: 'space-between',
    paddingTop: Padding.p_8,
    paddingBottom: 24,
    gap: 0,
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: Color.colorGray300,
  },
  navigateLayout: {
    gap: Gap.gap_4,
    width: 94,
    alignItems: 'center',
  },
  home: {
    fontSize: FontSize.size_12,
    lineHeight: 18,
    color: Color.colorWhite,
  },
  listIcon: {
    zIndex: 0,
  },
  tasks3: {
    color: Color.colorRoyalblue,
    zIndex: 1,
    fontSize: FontSize.size_12,
    lineHeight: 18,
  },
  bagde: {
    left: 50,
  },
  text20: {
    marginTop: -9,
    top: '50%',
    display: 'flex',
    left: '0%',
    fontSize: FontSize.size_12,
    lineHeight: 18,
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: FontFamily.manropeSemiBold,
    textAlign: 'center',
    position: 'absolute',
    width: '100%',
  },
  chat: {
    zIndex: 1,
    fontSize: FontSize.size_12,
    lineHeight: 18,
    color: Color.colorWhite,
  },
  tasksBagde: {
    left: 51,
  },
  appBar: {
    top: 50,
    paddingVertical: Padding.p_8,
    height: 56,
    width: 375,
    left: 0,
    alignItems: 'center',
    gap: Gap.gap_8,
    flexDirection: 'row',
    paddingHorizontal: Padding.p_16,
    position: 'absolute',
  },
  textContent: {
    justifyContent: 'center',
    flex: 1,
  },
  headline2: {
    fontSize: 20,
    lineHeight: 22,
    fontFamily: FontFamily.manropeSemiBold,
    textAlign: 'center',
    overflow: 'hidden',
  },
  supportingText: {
    width: 263,
    letterSpacing: 0.5,
    lineHeight: 16,
    fontFamily: FontFamily.robotoMedium,
    color: Color.colorDarkslategray,
    display: 'none',
    fontWeight: '500',
    textAlign: 'center',
    fontSize: FontSize.size_12,
    overflow: 'hidden',
  },
  trailingElements: {
    alignItems: 'center',
  },
  userAvatar: {
    height: 32,
    borderRadius: Border.br_100,
    width: 32,
    overflow: 'hidden',
  },
  searchMdIcon: {
    height: 16,
    width: 16,
  },
  avatarStatus: {
    flexDirection: 'row',
  },
  avatar: {
    backgroundColor: Color.colorLightgray200,
    borderColor: Color.colorLightgray200,
    zIndex: 0,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    borderWidth: 1,
    overflow: 'hidden',
    flex: 1,
  },
  imageIcon: {
    flex: 1,
  },
  row: {
    opacity: 0,
    height: 16,
    alignSelf: 'stretch',
  },
  scaleUnit: {
    width: 16,
    left: 0,
    top: 0,
    position: 'absolute',
  },
  topIcon: {
    height: 8,
    opacity: 0.7,
    maxWidth: '100%',
    alignSelf: 'stretch',
    overflow: 'hidden',
    width: '100%',
  },
  tasksScaleUnit: {
    width: 16,
    top: 0,
  },
  indicator: {
    width: 11,
    right: -1,
    bottom: -1,
    backgroundColor: Color.colorMediumspringgreen,
    borderColor: Color.colorBlack,
    borderWidth: 1.3,
    zIndex: 1,
    height: 11,
    position: 'absolute',
  },
  button: {
    right: 16,
    bottom: 110,
    paddingVertical: 0,
    backgroundColor: Color.colorRoyalblue,
    height: 56,
    justifyContent: 'center',
    borderRadius: Border.br_100,
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: Padding.p_16,
    position: 'absolute',
    overflow: 'hidden',
  },
  buttonChild: {
    height: 48,
    width: 24,
  },
  tab: {
    top: 122,
    left: 0,
    alignItems: 'center',
    flexDirection: 'row',
  },
  tabHorizontalItemDark: {
    height: 39,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Gap.gap_16,
    flex: 1,
  },
  personalDetails: {
    lineHeight: 21,
    fontSize: FontSize.size_14,
    fontFamily: FontFamily.manropeSemiBold,
    textAlign: 'center',
    alignSelf: 'stretch',
  },
  shapeSharp: {
    transform: [
      {
        rotate: '90deg',
      },
    ],
    backgroundColor: Color.colorRoyalblue,
    alignSelf: 'stretch',
    flex: 1,
  },
  tasksPersonalDetails: {
    color: Color.colorDimgray100,
    lineHeight: 21,
    fontSize: FontSize.size_14,
  },
  shapeFlexBox: {
    backgroundColor: Color.colorGray100,
    transform: [
      {
        rotate: '90deg',
      },
    ],
    alignSelf: 'stretch',
    flex: 1,
  },
});

export default Tasks;

/* Fonts */
export const FontFamily = {
  sFProText: 'SF Pro Text',
  manropeMedium: 'Manrope-Medium',
  robotoMedium: 'Roboto-Medium',
  manropeSemiBold: 'Manrope-SemiBold',
  manropeRegular: 'Manrope-Regular',
};
/* Font sizes */
export const FontSize = {
  size_10: 10,
  size_12: 12,
  size_14: 14,
  size_16: 16,
  size_18: 18,
};
/* Colors */
export const Color = {
  colorGray100: '#272b30',
  colorGray200: '#1e1e1e',
  colorRoyalblue: '#1068eb',
  colorForestgreen: '#37b24d',
  colorFirebrick: '#c92a2a',
  colorGray300: '#101213',
  colorGainsboro: '#dee2e6',
  colorWhitesmoke: '#f8f9fa',
  colorBlack: '#000',
  colorDarkgray: '#adb5bd',
  colorLightgray200: 'rgba(209, 209, 209, 0.05)',
  colorLightgray100: '#ced4da',
  colorOrange: '#f59f00',
  colorMediumspringgreen: '#1ce783',
  colorDimgray200: '#4f575e',
  colorDimgray100: '#6a7178',
  colorDarkslategray: '#49454f',
  colorWhite: '#fff',
};
/* Gaps */
export const Gap = {
  gap_4: 4,
  gap_6: 6,
  gap_8: 8,
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
  br_4: 4,
  br_8: 8,
  br_64: 64,
  br_100: 100,
};
