import * as React from "react";
import {StyleSheet, View, Text} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Border from "../assets/Border.svg"
import Cap from "../assets/Cap.svg"
import Wifi from "../assets/Wifi.svg"
import Cellular from "../assets/Cellular.svg"
import Frame7 from "../assets/Frame-7.svg"
import IconsRight from "../assets/Icons-Right.svg"
import Fileuploadplaceholder from "../assets/file-upload-placeholder.svg"
import Edit05 from "../assets/edit-05.svg"
import { Color, FontFamily, Border, Padding, FontSize, Gap } from "../GlobalStyles";

const NewIncident = () => {

  return (
    <SafeAreaView style={styles.newIncident}>
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
          <View style={styles.dark}>
            <Frame7 style={styles.darkChild} width={16} height={32} />
          </View>
          <View style={styles.textContent}>
            <Text style={[styles.headline, styles.headlineTypo]}>New Incident</Text>
            <Text style={styles.supportingText}>Supporting text</Text>
          </View>
        </View>
        <View style={styles.fields}>
          <View style={styles.inputDark}>
            <Text style={styles.label}>Incident Name</Text>
            <View style={[styles.input, styles.inputBorder]}>
              <View style={[styles.iconLeftText, styles.buttonFlexBox]}>
                <Text style={styles.textTypo}>Enter Incident</Text>
              </View>
            </View>
          </View>
          <View style={styles.inputDark}>
            <Text style={styles.label}>Label</Text>
            <View style={[styles.textArea, styles.textAreaBorder]}>
              <Text style={[styles.placeholder, styles.textTypo]}>Placeholder</Text>
            </View>
            <Text style={[styles.helper, styles.helperLayout]}>Helper message</Text>
          </View>
          <View style={styles.inputDark}>
            <Text style={styles.label}>Label</Text>
            <View style={[styles.newIncidentInput, styles.inputBorder]}>
              <View style={[styles.iconLeftText, styles.buttonFlexBox]}>
                <Text style={styles.textTypo}>Select</Text>
              </View>
              <IconsRight style={styles.iconsRight} width={20} height={48} />
            </View>
          </View>
          <View style={styles.inputDark}>
            <Text style={styles.label}>Label</Text>
            <View style={[styles.uploadDark, styles.textAreaBorder]}>
              <Fileuploadplaceholder style={styles.fileUploadPlaceholderIcon} />
              <View style={[styles.button, styles.buttonFlexBox]}>
                <View style={[styles.edit05Parent, styles.buttonFlexBox]}>
                  <Edit05 style={styles.edit05Icon} width={20} height={20} />
                  <Text style={[styles.newIncidentButton, styles.helperLayout]}>Change</Text>
                </View>
              </View>
            </View>
            <Text style={[styles.helper, styles.helperLayout]}>Helper message</Text>
          </View>
        </View>
        <View style={styles.newIncidentDark}>
          <View style={[styles.iconLeftText, styles.buttonFlexBox]}>
            <Text style={styles.button2}>Create Incident</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>);
};

const styles = StyleSheet.create({
  newIncident: {
    backgroundColor: Color.colorGray200,
    flex: 1
  },
  iconLayout: {
    maxHeight: "100%",
    maxWidth: "100%",
    position: "absolute",
    overflow: "hidden"
  },
  headlineTypo: {
    fontFamily: FontFamily.manropeSemiBold,
    textAlign: "center",
    fontWeight: "600"
  },
  inputBorder: {
    justifyContent: "space-between",
    borderRadius: Border.br_8,
    alignSelf: "stretch",
    paddingVertical: 0,
    borderWidth: 1,
    borderColor: Color.colorGray100,
    borderStyle: "solid",
    paddingHorizontal: Padding.p_16,
    overflow: "hidden",
    backgroundColor: Color.colorGray200
  },
  buttonFlexBox: {
    alignItems: "center",
    flexDirection: "row"
  },
  textAreaBorder: {
    padding: Padding.p_16,
    borderRadius: Border.br_8,
    alignSelf: "stretch",
    borderWidth: 1,
    borderColor: Color.colorGray100,
    borderStyle: "solid",
    backgroundColor: Color.colorGray200
  },
  textTypo: {
    color: Color.colorDimgray,
    fontFamily: FontFamily.manropeMedium,
    textAlign: "left",
    lineHeight: 24,
    fontSize: FontSize.size_16,
    fontWeight: "500"
  },
  helperLayout: {
    lineHeight: 21,
    fontSize: FontSize.size_14
  },
  view: {
    height: 923,
    overflow: "hidden",
    width: "100%",
    backgroundColor: Color.colorGray200,
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
    fontWeight: "600",
    color: Color.colorWhite,
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
    borderWidth: 1,
    borderColor: Color.colorGray100,
    borderStyle: "solid",
    justifyContent: "center",
    height: 32,
    alignItems: "center",
    flexDirection: "row",
    overflow: "hidden",
    backgroundColor: Color.colorGray200
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
    color: Color.colorWhite,
    fontFamily: FontFamily.manropeSemiBold,
    overflow: "hidden"
  },
  supportingText: {
    width: 263,
    fontSize: 12,
    letterSpacing: 0.5,
    lineHeight: 16,
    fontFamily: FontFamily.robotoMedium,
    color: Color.colorDarkslategray,
    display: "none",
    fontWeight: "500",
    textAlign: "center",
    overflow: "hidden"
  },
  fields: {
    top: 122,
    right: 16,
    left: 16,
    gap: Gap.gap_16,
    position: "absolute"
  },
  inputDark: {
    gap: Gap.gap_8,
    alignSelf: "stretch"
  },
  label: {
    textAlign: "left",
    lineHeight: 24,
    fontSize: FontSize.size_16,
    alignSelf: "stretch",
    fontFamily: FontFamily.manropeSemiBold,
    color: Color.colorWhite,
    fontWeight: "600"
  },
  input: {
    height: 48
  },
  iconLeftText: {
    height: 48
  },
  textArea: {
    height: 120,
    flexDirection: "row",
    padding: Padding.p_16
  },
  placeholder: {
    alignSelf: "stretch",
    flex: 1
  },
  helper: {
    width: 240,
    color: Color.colorDarkgray,
    fontFamily: FontFamily.manropeMedium,
    lineHeight: 21,
    fontSize: FontSize.size_14,
    textAlign: "left",
    display: "none",
    fontWeight: "500"
  },
  newIncidentInput: {
    gap: 0,
    alignItems: "center",
    flexDirection: "row"
  },
  iconsRight: {
    width: 20,
    height: 48
  },
  uploadDark: {
    justifyContent: "flex-end",
    gap: Gap.gap_16
  },
  fileUploadPlaceholderIcon: {
    height: 218,
    alignSelf: "stretch",
    maxWidth: "100%",
    overflow: "hidden",
    width: "100%"
  },
  button: {
    justifyContent: "center",
    overflow: "hidden"
  },
  edit05Parent: {
    gap: Gap.gap_8
  },
  edit05Icon: {
    height: 20,
    width: 20
  },
  newIncidentButton: {
    color: Color.colorRoyalblue,
    fontFamily: FontFamily.manropeSemiBold,
    textAlign: "center",
    fontWeight: "600"
  },
  newIncidentDark: {
    marginLeft: -171.5,
    bottom: 40,
    left: "50%",
    backgroundColor: Color.colorRoyalblue,
    width: 343,
    minWidth: 104,
    height: 48,
    borderRadius: Border.br_8,
    paddingVertical: 0,
    justifyContent: "center",
    paddingHorizontal: Padding.p_16,
    alignItems: "center",
    flexDirection: "row",
    position: "absolute",
    overflow: "hidden"
  },
  button2: {
    lineHeight: 24,
    fontSize: FontSize.size_16,
    fontFamily: FontFamily.manropeSemiBold,
    textAlign: "center",
    color: Color.colorWhite,
    fontWeight: "600"
  }
});

export default NewIncident;


/* Fonts */
export const FontFamily = {
  manropeSemiBold: "Manrope-SemiBold",
  robotoMedium: "Roboto-Medium",
  manropeMedium: "Manrope-Medium",
  sFProText: "SF Pro Text",
};
/* Font sizes */
export const FontSize = {
  size_14: 14,
  size_16: 16,
};
/* Colors */
export const Color = {
  colorGray200: "#101213",
  colorWhite: "#fff",
  colorDarkslategray: "#49454f",
  colorRoyalblue: "#1068eb",
  colorDimgray: "#6a7178",
  colorDarkgray: "#adb5bd",
  colorGray100: "#272b30",
};
/* Gaps */
export const Gap = {
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
  br_8: 8,
};