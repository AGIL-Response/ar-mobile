/**
 * Modal
 * Dependencies:
 * - @gorhom/bottom-sheet.
 *
 * Props:
 * - All `BottomSheetModalProps` props.
 * - `title` (string | undefined): Optional title for the modal header.
 *
 * Usage Example:
 * import { Modal, useModal } from '@gorhom/bottom-sheet';
 *
 * function DisplayModal() {
 *   const { ref, present, dismiss } = useModal();
 *
 *   return (
 *     <View>
 *       <Modal
 *         snapPoints={['60%']} // optional
 *         title="Modal Title"
 *         ref={ref}
 *       >
 *         Modal Content
 *       </Modal>
 *     </View>
 *   );
 * }
 *
 */

import type {
  BottomSheetBackdropProps,
  BottomSheetModalProps,
} from '@gorhom/bottom-sheet';
import { BottomSheetModal, useBottomSheet } from '@gorhom/bottom-sheet';
import * as React from 'react';
import { Pressable, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Path, Svg } from 'react-native-svg';

import { Palette, type Theme } from '@/theme';

import { createStyleCreator, useThemedStyles } from './base-component';
import { Text } from './text';
import { Icon, iconNames } from './icon';
import { FontFamilies } from '@/lib/fonts';

type ModalProps = BottomSheetModalProps & {
  title?: string;
  overlayColor?: string;
  contentColor?: string;
  titleColor?: string;
  /** Show a stylized pull handle at the top of the sheet */
  showPullHandle?: boolean;
};

type ModalRef = React.ForwardedRef<BottomSheetModal>;

type ModalHeaderProps = {
  title?: string;
  dismiss: () => void;
  styles: ReturnType<typeof createModalStyles>;
  showPullHandle?: boolean;
};

const createModalStyles = createStyleCreator<ModalProps>(
  (theme: Theme, props) => {
    return {
      modal: {
        backgroundColor: props.overlayColor || theme.colors.background.secondary,
      },
      content: {
        backgroundColor: props.contentColor || theme.colors.background.secondary,
      },
      title: {
        color: props.titleColor || theme.colors.text.primary,
        fontFamily: FontFamilies.goldmanRegular,
      },
      iconColor: {
        color: theme.colors.text.icon,
      },
      pullHandleOuter: {
        alignSelf: 'center' as const,
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
      },
      pullHandleInner: {
        width: 48,
        height: 4,
        borderRadius: 2,
        backgroundColor: Palette.brown50,
      },
    };
  }
);

export const useModal = () => {
  const ref = React.useRef<BottomSheetModal>(null);
  const present = React.useCallback((data?: any) => {
    ref.current?.present(data);
  }, []);
  const dismiss = React.useCallback(() => {
    ref.current?.dismiss();
  }, []);
  return { ref, present, dismiss };
};

export const Modal = React.forwardRef(
  (
    {
      snapPoints: _snapPoints = ['60%'],
      title,
      detached = false,
      overlayColor,
      contentColor,
      titleColor,
      showPullHandle = true,
      ...props
    }: ModalProps,
    ref: ModalRef
  ) => {
    const styles = useThemedStyles(createModalStyles, {
      overlayColor,
      contentColor,
      titleColor,
    });
    const detachedProps = React.useMemo(
      () => getDetachedProps(detached),
      [detached]
    );
    const modal = useModal();
    const snapPoints = React.useMemo(() => _snapPoints, [_snapPoints]);

    React.useImperativeHandle(
      ref,
      () => (modal.ref.current as BottomSheetModal) || null
    );

    const renderHandleComponent = React.useCallback(
      () => (
        <>
          {title ? (
            <ModalHeader
              title={title}
              dismiss={modal.dismiss}
              styles={styles}
              showPullHandle={showPullHandle}
            />
          ) : null}
        </>
      ),
      [title, modal.dismiss, styles, showPullHandle]
    );

    return (
      <BottomSheetModal
        {...props}
        {...detachedProps}
        ref={modal.ref}
        index={0}
        snapPoints={snapPoints}
        backdropComponent={props.backdropComponent || renderBackdrop}
        enableDynamicSizing={false}
        handleComponent={renderHandleComponent}
        handleStyle={{ height: title ? undefined : 0, padding: 0, margin: 0 }}
        backgroundStyle={{ backgroundColor: styles.modal.backgroundColor }}
      />
    );
  }
);

/**
 * Custom Backdrop
 */

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const CustomBackdrop = ({ style }: BottomSheetBackdropProps) => {
  const { close } = useBottomSheet();
  return (
    <AnimatedPressable
      onPress={() => close()}
      entering={FadeIn.duration(50)}
      exiting={FadeOut.duration(20)}
      style={[style, { backgroundColor: 'rgba(0, 0, 0, 0.4)' }]}
    />
  );
};

export const renderBackdrop = (props: BottomSheetBackdropProps) => (
  <CustomBackdrop {...props} />
);

/**
 *
 * @param detached
 * @returns
 *
 * @description
 * In case the modal is detached, we need to add some extra props to the modal to make it look like a detached modal.
 */

const getDetachedProps = (detached: boolean) => {
  if (detached) {
    return {
      detached: true,
      bottomInset: 46,
      style: { marginHorizontal: 16, overflow: 'hidden' },
    } as Partial<BottomSheetModalProps>;
  }
  return {} as Partial<BottomSheetModalProps>;
};

/**
 * ModalHeader
 */

const ModalHeader = React.memo(
  ({ title, dismiss, styles, showPullHandle }: ModalHeaderProps) => {
    if (!title) {
      return <CloseButton close={dismiss} />;
    }
    return (
      <View style={{ paddingHorizontal: 0, paddingVertical: 4 }}>
        {showPullHandle ? (
          <View style={styles.pullHandleOuter}>
            <View style={styles.pullHandleInner} />
          </View>
        ) : null}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            height: 48,
          }}
        >
          <Text variant="h4" style={styles.title}>{title}</Text>
          <Pressable onPress={dismiss}>
            <Icon name={iconNames.x} size={20} color={styles.iconColor.color} />
          </Pressable>
        </View>
      </View>
    );
  }
);

const CloseButton = ({ close }: { close: () => void }) => {
  return (
    <Pressable
      onPress={close}
      className="absolute right-3 top-3 size-[24px] items-center justify-center "
      hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
      accessibilityLabel="close modal"
      accessibilityRole="button"
      accessibilityHint="closes the modal"
    >
      <Svg
        className="fill-neutral-300 dark:fill-white"
        width={24}
        height={24}
        fill="none"
        viewBox="0 0 24 24"
      >
        <Path d="M18.707 6.707a1 1 0 0 0-1.414-1.414L12 10.586 6.707 5.293a1 1 0 0 0-1.414 1.414L10.586 12l-5.293 5.293a1 1 0 1 0 1.414 1.414L12 13.414l5.293 5.293a1 1 0 0 0 1.414-1.414L13.414 12l5.293-5.293Z" />
      </Svg>
    </Pressable>
  );
};
