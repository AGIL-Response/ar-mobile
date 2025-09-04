import * as React from 'react';
import { Image, ImageBackground, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Border from '../assets/Border.svg';
import Cap from '../assets/Cap.svg';
import Cellular from '../assets/Cellular.svg';
import Ellipse1 from '../assets/Ellipse-1.svg';
import Ellipse2 from '../assets/Ellipse-2.svg';
import Ellipse11 from '../assets/Ellipse-11.svg';
import Ellipse12 from '../assets/Ellipse-12.svg';
import Ellipse13 from '../assets/Ellipse-13.svg';
import Ellipse14 from '../assets/Ellipse-14.svg';
import Ellipse15 from '../assets/Ellipse-15.svg';
import Ellipse16 from '../assets/Ellipse-16.svg';
import Ellipse21 from '../assets/Ellipse-21.svg';
import Ellipse22 from '../assets/Ellipse-22.svg';
import Frame29 from '../assets/Frame-29.svg';
import Frame30 from '../assets/Frame-30.svg';
import Frame31 from '../assets/Frame-31.svg';
import Frame32 from '../assets/Frame-32.svg';
import Frame71 from '../assets/Frame-71.svg';
import Frame72 from '../assets/Frame-72.svg';
import Frame73 from '../assets/Frame-73.svg';
import Frame74 from '../assets/Frame-74.svg';
import Home05 from '../assets/home-05.svg';
import List1 from '../assets/list1.svg';
import Messagechatcircle from '../assets/message-chat-circle.svg';
import Polygon from '../assets/polygon.svg';
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

const Homescreen = () => {
  return (
    <SafeAreaView style={styles.homescreen}>
      <View style={styles.view}>
        <View style={[styles.statusBariphone12Mini, styles.scalePosition]}>
          <View style={styles.statusiphone12Mini}>
            <View style={styles.batteryiphone12Mini}>
              <Border style={[styles.borderIcon, styles.iconLayout1]} />
              <Cap style={[styles.capIcon, styles.iconLayout1]} />
              <View style={styles.capacity} />
            </View>
            <Wifi style={styles.wifiIcon} width={15} height={11} />
            <Cellular style={styles.cellularIcon} width={17} height={11} />
          </View>
          <Text style={styles.time}>9:41</Text>
        </View>
        <View style={styles.navigateBar}>
          <View style={styles.navigateLayout}>
            <Home05 style={styles.iconLayout} width={24} height={24} />
            <Text style={[styles.home, styles.homeTypo]}>Home</Text>
          </View>
          <View style={styles.navigateLayout}>
            <List1
              style={[styles.listIcon, styles.iconLayout]}
              width={24}
              height={24}
            />
            <Text style={styles.tasks}>Tasks</Text>
            <View style={[styles.bagde, styles.bagdePosition]}>
              <Text style={[styles.text, styles.textTypo]}>1</Text>
            </View>
          </View>
          <View style={styles.navigateLayout}>
            <Messagechatcircle
              style={[styles.listIcon, styles.iconLayout]}
              width={24}
              height={24}
            />
            <Text style={styles.tasks}>Chat</Text>
            <View style={[styles.homescreenBagde, styles.bagdePosition]}>
              <Text style={[styles.text, styles.textTypo]}>1</Text>
            </View>
          </View>
          <View style={styles.navigateLayout}>
            <User01 style={styles.iconLayout} width={24} height={24} />
            <Text style={[styles.profile, styles.homeTypo]}>Profile</Text>
          </View>
        </View>
        <View style={[styles.appBar, styles.appBarFlexBox]}>
          <View style={styles.textContent}>
            <Text style={[styles.headline, styles.textTypo]}>
              Alpha-7 Task Force
            </Text>
            <Text style={styles.supportingText}>Supporting text</Text>
          </View>
          <View style={styles.appBarFlexBox}>
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
                    <View
                      style={[styles.scaleUnit, styles.scalePosition]}
                    ></View>
                    <View
                      style={[styles.homescreenScaleUnit, styles.scalePosition]}
                    ></View>
                  </View>
                  <View style={styles.row}>
                    <View
                      style={[styles.scaleUnit, styles.scalePosition]}
                    ></View>
                    <View
                      style={[styles.homescreenScaleUnit, styles.scalePosition]}
                    ></View>
                  </View>
                </ImageBackground>
              </View>
              <View style={styles.indicator} />
            </View>
          </View>
        </View>
        <View style={styles.tab}>
          <View style={styles.tabHorizontalItemDark}>
            <Text style={[styles.personalDetails, styles.personalTypo]}>
              Flat View
            </Text>
            <View style={[styles.shapeSharp, styles.shapeFlexBox]} />
          </View>
          <View style={styles.tabHorizontalItemDark}>
            <Text
              style={[styles.homescreenPersonalDetails, styles.personalTypo]}
            >
              Map View
            </Text>
            <View style={[styles.homescreenShapeSharp, styles.shapeFlexBox]} />
          </View>
        </View>
        <Image
          style={styles.image2Icon}
          resizeMode="cover"
          source="image 2.png"
        />
        <View style={[styles.button, styles.buttonSpaceBlock]}>
          <Image
            style={styles.buttonChild}
            resizeMode="cover"
            source="Frame 7.png"
          />
        </View>
        <Polygon style={styles.polygonIcon} width={417} height={501} />
        <View style={[styles.alert, styles.alertLayout1]}>
          <Ellipse1
            style={[styles.alertChild, styles.alertLayout1]}
            width={48}
            height={48}
          />
          <View style={[styles.homescreenButton, styles.homescreenPosition]}>
            <Frame71 style={styles.buttonItem} width={16} height={32} />
          </View>
        </View>
        <View style={[styles.homescreenAlert, styles.alertLayout]}>
          <Ellipse11
            style={[styles.alertItem, styles.alertLayout]}
            width={64}
            height={64}
          />
          <Ellipse2 style={styles.alertInner} width={42} height={42} />
          <View style={[styles.homescreenAvatar, styles.homescreenPosition]}>
            <ImageBackground
              style={styles.imageIcon}
              resizeMode="cover"
              source="Image.png"
            >
              <View style={styles.row}>
                <View style={[styles.scaleUnit, styles.scalePosition]}></View>
                <View
                  style={[styles.homescreenScaleUnit, styles.scalePosition]}
                ></View>
              </View>
              <View style={styles.row}>
                <View style={[styles.scaleUnit, styles.scalePosition]}></View>
                <View
                  style={[styles.homescreenScaleUnit, styles.scalePosition]}
                ></View>
              </View>
            </ImageBackground>
          </View>
        </View>
        <View style={[styles.alert2, styles.alertLayout]}>
          <Ellipse12
            style={[styles.alertItem, styles.alertLayout]}
            width={64}
            height={64}
          />
          <Ellipse21 style={styles.alertInner} width={42} height={42} />
          <View style={[styles.homescreenAvatar, styles.homescreenPosition]}>
            <ImageBackground
              style={styles.imageIcon}
              resizeMode="cover"
              source="Image.png"
            >
              <View style={styles.row}>
                <View style={[styles.scaleUnit, styles.scalePosition]}></View>
                <View
                  style={[styles.homescreenScaleUnit, styles.scalePosition]}
                ></View>
              </View>
              <View style={styles.row}>
                <View style={[styles.scaleUnit, styles.scalePosition]}></View>
                <View
                  style={[styles.homescreenScaleUnit, styles.scalePosition]}
                ></View>
              </View>
            </ImageBackground>
          </View>
        </View>
        <View style={[styles.alert3, styles.alertLayout]}>
          <Ellipse13
            style={[styles.alertItem, styles.alertLayout]}
            width={64}
            height={64}
          />
          <Ellipse22 style={styles.alertInner} width={42} height={42} />
          <View style={[styles.homescreenAvatar, styles.homescreenPosition]}>
            <ImageBackground
              style={styles.imageIcon}
              resizeMode="cover"
              source="Image.png"
            >
              <View style={styles.row}>
                <View style={[styles.scaleUnit, styles.scalePosition]}></View>
                <View
                  style={[styles.homescreenScaleUnit, styles.scalePosition]}
                ></View>
              </View>
              <View style={styles.row}>
                <View style={[styles.scaleUnit, styles.scalePosition]}></View>
                <View
                  style={[styles.homescreenScaleUnit, styles.scalePosition]}
                ></View>
              </View>
            </ImageBackground>
          </View>
        </View>
        <View style={[styles.alert4, styles.alertLayout1]}>
          <Ellipse14
            style={[styles.alertChild, styles.alertLayout1]}
            width={48}
            height={48}
          />
          <View style={[styles.homescreenButton, styles.homescreenPosition]}>
            <Frame72 style={styles.buttonItem} width={16} height={32} />
          </View>
        </View>
        <View style={[styles.alert5, styles.alertLayout1]}>
          <Ellipse15
            style={[styles.alertChild, styles.alertLayout1]}
            width={48}
            height={48}
          />
          <View style={[styles.homescreenButton, styles.homescreenPosition]}>
            <Frame73 style={styles.buttonItem} width={16} height={32} />
          </View>
        </View>
        <View style={[styles.alert6, styles.alertLayout1]}>
          <Ellipse16
            style={[styles.alertChild, styles.alertLayout1]}
            width={48}
            height={48}
          />
          <View style={[styles.homescreenButton, styles.homescreenPosition]}>
            <Frame74 style={styles.buttonItem} width={16} height={32} />
          </View>
        </View>
        <Frame29
          style={[styles.child, styles.childLayout]}
          width={30}
          height={30}
        />
        <Frame30
          style={[styles.item, styles.childLayout]}
          width={30}
          height={30}
        />
        <Frame31
          style={[styles.inner, styles.childLayout]}
          width={30}
          height={30}
        />
        <Frame32
          style={[styles.homescreenChild, styles.childLayout]}
          width={30}
          height={30}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  homescreen: {
    backgroundColor: Color.colorGray200,
    flex: 1,
  },
  scalePosition: {
    top: 0,
    position: 'absolute',
  },
  iconLayout1: {
    maxHeight: '100%',
    maxWidth: '100%',
    position: 'absolute',
    overflow: 'hidden',
  },
  homeTypo: {
    fontFamily: FontFamily.manropeMedium,
    fontWeight: '500',
  },
  iconLayout: {
    height: 24,
    width: 24,
  },
  bagdePosition: {
    zIndex: 2,
    backgroundColor: Color.colorFirebrick,
    top: -4,
    height: 16,
    borderRadius: Border.br_100,
    width: 16,
    position: 'absolute',
  },
  textTypo: {
    fontFamily: FontFamily.manropeSemiBold,
    color: Color.colorWhite,
    fontWeight: '600',
  },
  appBarFlexBox: {
    gap: Gap.gap_8,
    alignItems: 'center',
    flexDirection: 'row',
  },
  avatarFlexBox: {
    width: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarBorder: {
    borderWidth: 1,
    borderColor: Color.colorLightgray,
    backgroundColor: Color.colorLightgray,
    borderStyle: 'solid',
    borderRadius: Border.br_64,
  },
  personalTypo: {
    lineHeight: 21,
    fontSize: FontSize.size_14,
    alignSelf: 'stretch',
    textAlign: 'center',
  },
  shapeFlexBox: {
    transform: [
      {
        rotate: '90deg',
      },
    ],
    alignSelf: 'stretch',
    flex: 1,
  },
  buttonSpaceBlock: {
    paddingVertical: 0,
    borderRadius: Border.br_100,
  },
  alertLayout1: {
    width: 48,
    height: 48,
    position: 'absolute',
  },
  homescreenPosition: {
    marginLeft: -16,
    marginTop: -16,
    width: 32,
    justifyContent: 'center',
    top: '50%',
    alignItems: 'center',
    flexDirection: 'row',
    left: '50%',
    position: 'absolute',
    overflow: 'hidden',
  },
  alertLayout: {
    height: 64,
    width: 64,
    position: 'absolute',
  },
  childLayout: {
    height: 30,
    width: 30,
    borderRadius: Border.br_40,
    position: 'absolute',
  },
  view: {
    height: 812,
    overflow: 'hidden',
    width: '100%',
    backgroundColor: Color.colorGray200,
    flex: 1,
  },
  statusBariphone12Mini: {
    height: 50,
    width: 375,
    left: 0,
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
    color: Color.colorWhite,
    fontWeight: '600',
    position: 'absolute',
  },
  navigateBar: {
    marginLeft: -187.5,
    bottom: 0,
    justifyContent: 'space-between',
    paddingTop: Padding.p_8,
    paddingBottom: 24,
    gap: 0,
    alignItems: 'center',
    flexDirection: 'row',
    left: '50%',
    width: 375,
    position: 'absolute',
    backgroundColor: Color.colorGray200,
  },
  navigateLayout: {
    gap: Gap.gap_4,
    width: 94,
    alignItems: 'center',
  },
  home: {
    color: Color.colorRoyalblue,
    lineHeight: 18,
    fontSize: FontSize.size_12,
    textAlign: 'center',
    alignSelf: 'stretch',
  },
  listIcon: {
    zIndex: 0,
  },
  tasks: {
    zIndex: 1,
    fontFamily: FontFamily.manropeMedium,
    fontWeight: '500',
    lineHeight: 18,
    fontSize: FontSize.size_12,
    alignSelf: 'stretch',
    textAlign: 'center',
    color: Color.colorWhite,
  },
  bagde: {
    left: 50,
  },
  text: {
    marginTop: -9,
    display: 'flex',
    justifyContent: 'center',
    top: '50%',
    lineHeight: 18,
    fontSize: FontSize.size_12,
    textAlign: 'center',
    alignItems: 'center',
    left: '0%',
    position: 'absolute',
    width: '100%',
  },
  homescreenBagde: {
    left: 51,
  },
  profile: {
    lineHeight: 18,
    fontSize: FontSize.size_12,
    textAlign: 'center',
    alignSelf: 'stretch',
    color: Color.colorWhite,
  },
  appBar: {
    top: 50,
    paddingVertical: Padding.p_8,
    paddingHorizontal: Padding.p_16,
    height: 56,
    position: 'absolute',
    width: 375,
    left: 0,
  },
  textContent: {
    justifyContent: 'center',
    flex: 1,
  },
  headline: {
    fontSize: 20,
    lineHeight: 22,
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
    fontSize: FontSize.size_12,
    textAlign: 'center',
    overflow: 'hidden',
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
    justifyContent: 'center',
    zIndex: 0,
    alignItems: 'center',
    flexDirection: 'row',
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
  },
  topIcon: {
    height: 8,
    opacity: 0.7,
    alignSelf: 'stretch',
    maxWidth: '100%',
    overflow: 'hidden',
    width: '100%',
  },
  homescreenScaleUnit: {
    left: 16,
    width: 16,
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
  tab: {
    top: 122,
    alignItems: 'center',
    flexDirection: 'row',
    width: 375,
    left: 0,
    position: 'absolute',
  },
  tabHorizontalItemDark: {
    height: 39,
    gap: Gap.gap_16,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  personalDetails: {
    color: Color.colorDimgray,
    fontFamily: FontFamily.manropeMedium,
    fontWeight: '500',
  },
  shapeSharp: {
    backgroundColor: Color.colorGray100,
  },
  homescreenPersonalDetails: {
    fontFamily: FontFamily.manropeSemiBold,
    color: Color.colorWhite,
    fontWeight: '600',
  },
  homescreenShapeSharp: {
    backgroundColor: Color.colorRoyalblue,
  },
  image2Icon: {
    top: 161,
    height: 570,
    width: 375,
    left: 0,
    position: 'absolute',
  },
  button: {
    top: 646,
    left: 303,
    backgroundColor: Color.colorRoyalblue,
    paddingHorizontal: Padding.p_16,
    height: 56,
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  buttonChild: {
    height: 48,
    width: 24,
  },
  polygonIcon: {
    top: 182,
    left: 1,
    borderRadius: 4,
    width: 417,
    height: 501,
    position: 'absolute',
  },
  alert: {
    top: 306,
    left: 84,
  },
  alertChild: {
    marginTop: -24,
    marginLeft: -24,
    top: '50%',
    left: '50%',
  },
  homescreenButton: {
    backgroundColor: Color.colorCrimson,
    paddingHorizontal: Padding.p_8,
    paddingVertical: 0,
    borderRadius: Border.br_100,
    height: 32,
  },
  buttonItem: {
    height: 32,
    width: 16,
  },
  homescreenAlert: {
    top: 382,
    left: 84,
  },
  alertItem: {
    marginTop: -32,
    marginLeft: -32,
    top: '50%',
    left: '50%',
  },
  alertInner: {
    marginTop: -21,
    marginLeft: -21,
    width: 42,
    height: 42,
    top: '50%',
    left: '50%',
    position: 'absolute',
  },
  homescreenAvatar: {
    borderWidth: 1,
    borderColor: Color.colorLightgray,
    backgroundColor: Color.colorLightgray,
    borderStyle: 'solid',
    borderRadius: Border.br_64,
  },
  alert2: {
    top: 507,
    left: 99,
  },
  alert3: {
    top: 406,
    left: 316,
  },
  alert4: {
    top: 367,
    left: 210,
  },
  alert5: {
    top: 551,
    left: 214,
  },
  alert6: {
    top: 240,
    left: 239,
  },
  child: {
    top: 291,
    left: 29,
    width: 30,
    borderRadius: Border.br_40,
  },
  item: {
    top: 540,
    left: 29,
    width: 30,
    borderRadius: Border.br_40,
  },
  inner: {
    top: 482,
    left: 223,
  },
  homescreenChild: {
    top: 292,
    left: 324,
  },
});

export default Homescreen;

/* Fonts */
export const FontFamily = {
  manropeMedium: 'Manrope-Medium',
  manropeSemiBold: 'Manrope-SemiBold',
  robotoMedium: 'Roboto-Medium',
  sFProText: 'SF Pro Text',
};
/* Font sizes */
export const FontSize = {
  size_12: 12,
  size_14: 14,
};
/* Colors */
export const Color = {
  colorGray100: '#272b30',
  colorGray200: '#101213',
  colorBlack: '#000',
  colorMediumspringgreen: '#1ce783',
  colorLightgray: 'rgba(209, 209, 209, 0.05)',
  colorWhite: '#fff',
  colorRoyalblue: '#1068eb',
  colorDarkslategray: '#49454f',
  colorCrimson: '#dc2020',
  colorDimgray: '#6a7178',
  colorFirebrick: '#c92a2a',
};
/* Gaps */
export const Gap = {
  gap_4: 4,
  gap_8: 8,
  gap_16: 16,
};
/* Paddings */
export const Padding = {
  p_8: 8,
  p_16: 16,
};
/* border radiuses */
export const Border = {
  br_40: 40,
  br_64: 64,
  br_100: 100,
};
