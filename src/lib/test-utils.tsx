import '@shopify/flash-list/jestSetup';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { NavigationContainer } from '@react-navigation/native';
import type { RenderOptions } from '@testing-library/react-native';
import { render, screen, userEvent } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import React from 'react';

const createAppWrapper = () => {
  return ({ children }: { children: React.ReactNode }) => (
    <BottomSheetModalProvider>
      <NavigationContainer>{children}</NavigationContainer>
    </BottomSheetModalProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  const Wrapper = createAppWrapper(); // make sure we have a new wrapper for each render
  return render(ui, { wrapper: Wrapper, ...options });
};

// use this if you want to test user events
export const setup = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  const Wrapper = createAppWrapper();
  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: Wrapper, ...options }),
  };
};

/**
 * Utility to extract and merge styles from a rendered component by testID.
 * Commonly used in component tests for verifying expected styles.
 */
export function getStyle(testId: string): Record<string, any> {
  const el = screen.getByTestId(testId);
  const styleProp = el.props?.style;
  if (Array.isArray(styleProp)) {
    return styleProp.reduce(
      (acc: Record<string, any>, s: any) => ({ ...acc, ...(s || {}) }),
      {}
    );
  }
  return styleProp || {};
}

export function findPressableParent(node: any) {
  let current: any = node;
  while (current && !current.props?.onPress) {
    current = current.parent;
  }
  return current;
}

export function flattenStyle(style: any): Record<string, any> {
  if (Array.isArray(style)) {
    return style.reduce<Record<string, any>>((acc, item) => {
      if (!item) {
        return acc;
      }
      return { ...acc, ...flattenStyle(item) };
    }, {});
  }

  return style ?? {};
}

export * from '@testing-library/react-native';
export { customRender as reactNativeRender };
