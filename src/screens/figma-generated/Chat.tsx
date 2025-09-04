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

const Chat = () => {
  return (
    <SafeAreaView style={styles.chat}>
      <View style={styles.view}>
        <View style={[styles.statusBariphone12Mini, styles.barLayout]}>
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
        <View style={[styles.navigateBar, styles.barLayout]}>
          <View style={styles.navigateLayout}>
            <Home05 style={styles.home05Icon} width={24} height={24} />
            <Text style={styles.home}>Home</Text>
          </View>
          <View style={styles.navigateLayout}>
            <List1 style={styles.listIcon} width={24} height={24} />
            <Text style={[styles.tasks, styles.tasksTypo]}>Tasks</Text>
            <View style={[styles.bagde, styles.bagdePosition]}>
              <Text style={[styles.text, styles.textTypo1]}>1</Text>
            </View>
          </View>
          <View style={styles.navigateLayout}>
            <Messagechatcircle style={styles.listIcon} width={24} height={24} />
            <Text style={[styles.chat2, styles.tasksTypo]}>Chat</Text>
            <View style={[styles.chatBagde, styles.bagdePosition]}>
              <Text style={[styles.text, styles.textTypo1]}>1</Text>
            </View>
          </View>
          <View style={styles.navigateLayout}>
            <User01 style={styles.home05Icon} width={24} height={24} />
            <Text style={styles.home}>Profile</Text>
          </View>
        </View>
        <View style={[styles.appBar, styles.appBarSpaceBlock]}>
          <View style={styles.textContent}>
            <Text style={[styles.headline, styles.textTypo1]}>Chat</Text>
            <Text style={styles.supportingText}>Supporting text</Text>
          </View>
          <View style={styles.trailingElements}>
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
                      style={[styles.chatScaleUnit, styles.chatsPosition]}
                    />
                  </View>
                  <View style={styles.row}>
                    <View style={styles.scaleUnit} />
                    <View
                      style={[styles.chatScaleUnit, styles.chatsPosition]}
                    />
                  </View>
                </ImageBackground>
              </View>
              <View style={styles.indicator} />
            </View>
          </View>
        </View>
        <View style={[styles.chats, styles.chatsPosition]}>
          <View style={[styles.matchCard, styles.avatarBorder]}>
            <View style={styles.textParent}>
              <Text style={styles.text2}>Team-Wide</Text>
              <View style={styles.bagde2}>
                <Text style={[styles.text, styles.textTypo1]}>5</Text>
              </View>
              <Text style={[styles.text4, styles.textTypo]}>5 min</Text>
            </View>
            <Text style={[styles.text5, styles.textTypo]}>
              <Text style={styles.hi}>{`Hi `}</Text>
              <Text style={styles.jacksonVo}>Jackson Vo</Text>
              <Text style={styles.hi}>
                , please help her review that candidate AI developing skills.
              </Text>
            </Text>
          </View>
          <View style={[styles.matchCard, styles.avatarBorder]}>
            <View style={styles.textParent}>
              <Text style={styles.text2}>Incident Alpha</Text>
              <View style={styles.bagde2}>
                <Text style={[styles.text, styles.textTypo1]}>5</Text>
              </View>
              <Text style={[styles.text4, styles.textTypo]}>Tue</Text>
            </View>
            <Text style={[styles.text9, styles.textTypo]}>
              Conduct a rapid assessment of structural integrity in Sector
            </Text>
          </View>
          <View style={[styles.matchCard, styles.avatarBorder]}>
            <View style={styles.textParent}>
              <Text style={styles.text2}>Incident Beta</Text>
              <Text style={[styles.text4, styles.textTypo]}>15/07/2025</Text>
            </View>
            <Text style={[styles.text9, styles.textTypo]}>
              Conduct a rapid assessment of structural integrity in Sector
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  chat: {
    backgroundColor: Color.colorGray300,
    flex: 1,
  },
  barLayout: {
    width: 375,
    position: 'absolute',
  },
  iconLayout: {
    maxHeight: '100%',
    maxWidth: '100%',
    position: 'absolute',
    overflow: 'hidden',
  },
  tasksTypo: {
    zIndex: 1,
    fontFamily: FontFamily.manropeMedium,
    fontWeight: '500',
    lineHeight: 18,
    fontSize: FontSize.size_12,
    alignSelf: 'stretch',
    textAlign: 'center',
  },
  bagdePosition: {
    zIndex: 2,
    top: -4,
    height: 16,
    backgroundColor: Color.colorFirebrick,
    borderRadius: Border.br_100,
    width: 16,
    position: 'absolute',
  },
  textTypo1: {
    fontFamily: FontFamily.manropeSemiBold,
    textAlign: 'center',
    color: Color.colorWhite,
    fontWeight: '600',
  },
  appBarSpaceBlock: {
    paddingHorizontal: Padding.p_16,
    gap: Gap.gap_8,
  },
  avatarFlexBox: {
    width: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarBorder: {
    borderWidth: 1,
    borderStyle: 'solid',
    overflow: 'hidden',
  },
  chatsPosition: {
    left: 16,
    position: 'absolute',
  },
  textTypo: {
    fontFamily: FontFamily.manropeRegular,
    textAlign: 'left',
  },
  view: {
    height: 812,
    overflow: 'hidden',
    width: '100%',
    backgroundColor: Color.colorGray300,
    flex: 1,
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
    textAlign: 'center',
    fontWeight: '600',
    color: Color.colorWhite,
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
  home05Icon: {
    height: 24,
    width: 24,
  },
  home: {
    fontFamily: FontFamily.manropeMedium,
    fontWeight: '500',
    lineHeight: 18,
    fontSize: FontSize.size_12,
    alignSelf: 'stretch',
    textAlign: 'center',
    color: Color.colorWhite,
  },
  listIcon: {
    zIndex: 0,
    height: 24,
    width: 24,
  },
  tasks: {
    color: Color.colorWhite,
    zIndex: 1,
  },
  bagde: {
    left: 50,
  },
  text: {
    marginTop: -9,
    top: '50%',
    display: 'flex',
    justifyContent: 'center',
    lineHeight: 18,
    fontSize: FontSize.size_12,
    alignItems: 'center',
    left: '0%',
    position: 'absolute',
    width: '100%',
  },
  chat2: {
    color: Color.colorRoyalblue,
  },
  chatBagde: {
    left: 51,
  },
  appBar: {
    top: 50,
    height: 56,
    paddingVertical: Padding.p_8,
    gap: Gap.gap_8,
    alignItems: 'center',
    flexDirection: 'row',
    width: 375,
    position: 'absolute',
    left: 0,
  },
  textContent: {
    justifyContent: 'center',
    flex: 1,
  },
  headline: {
    fontSize: 20,
    lineHeight: 22,
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
    fontSize: FontSize.size_12,
    textAlign: 'center',
    overflow: 'hidden',
  },
  trailingElements: {
    gap: Gap.gap_8,
    alignItems: 'center',
    flexDirection: 'row',
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
    backgroundColor: Color.colorLightgray,
    borderColor: Color.colorLightgray,
    borderRadius: Border.br_64,
    borderWidth: 1,
    justifyContent: 'center',
    zIndex: 0,
    alignItems: 'center',
    flexDirection: 'row',
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
    alignSelf: 'stretch',
    maxWidth: '100%',
    overflow: 'hidden',
    width: '100%',
  },
  chatScaleUnit: {
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
    borderStyle: 'solid',
    borderRadius: Border.br_64,
    zIndex: 1,
    height: 11,
    position: 'absolute',
  },
  chats: {
    top: 122,
    width: 343,
    gap: 16,
  },
  matchCard: {
    borderRadius: Border.br_8,
    backgroundColor: Color.colorGray200,
    borderColor: Color.colorGray100,
    paddingVertical: Padding.p_12,
    gap: Gap.gap_8,
    paddingHorizontal: Padding.p_16,
    alignSelf: 'stretch',
  },
  textParent: {
    gap: Gap.gap_8,
    alignSelf: 'stretch',
    alignItems: 'center',
    flexDirection: 'row',
  },
  text2: {
    fontSize: FontSize.size_16,
    textAlign: 'left',
    fontFamily: FontFamily.manropeSemiBold,
    lineHeight: 18,
    color: Color.colorWhite,
    fontWeight: '600',
    flex: 1,
  },
  bagde2: {
    height: 16,
    backgroundColor: Color.colorFirebrick,
    borderRadius: Border.br_100,
    width: 16,
  },
  text4: {
    fontSize: FontSize.size_10,
    lineHeight: 12,
    color: Color.colorDarkgray,
  },
  text5: {
    lineHeight: 18,
    fontSize: FontSize.size_12,
    alignSelf: 'stretch',
  },
  hi: {
    color: Color.colorDarkgray,
  },
  jacksonVo: {
    color: Color.colorRoyalblue,
  },
  text9: {
    color: Color.colorDarkgray,
    lineHeight: 18,
    fontSize: FontSize.size_12,
    alignSelf: 'stretch',
  },
});

export default Chat;

/* Fonts */
export const FontFamily = {
  manropeMedium: 'Manrope-Medium',
  manropeSemiBold: 'Manrope-SemiBold',
  robotoMedium: 'Roboto-Medium',
  manropeRegular: 'Manrope-Regular',
  sFProText: 'SF Pro Text',
};
/* Font sizes */
export const FontSize = {
  size_10: 10,
  size_12: 12,
  size_16: 16,
};
/* Colors */
export const Color = {
  colorGray300: '#101213',
  colorWhite: '#fff',
  colorLightgray: 'rgba(209, 209, 209, 0.05)',
  colorDarkslategray: '#49454f',
  colorFirebrick: '#c92a2a',
  colorRoyalblue: '#1068eb',
  colorGray100: '#272b30',
  colorBlack: '#000',
  colorGray200: '#1e1e1e',
  colorMediumspringgreen: '#1ce783',
  colorDarkgray: '#adb5bd',
};
/* Gaps */
export const Gap = {
  gap_4: 4,
  gap_8: 8,
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
  br_100: 100,
};
