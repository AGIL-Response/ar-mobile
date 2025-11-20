import { type ViewStyle } from 'react-native';

import {
  createAccessibilityProps,
  createConditionalStyle,
  mergeStyles,
  mergeTypographyStyles,
} from './base-component';
describe('base-component utils', () => {
  it('merges styles and arrays', () => {
    expect(
      mergeStyles({ a: 1, b: 2 } as ViewStyle, { b: 3, c: 4 } as ViewStyle)
    ).toEqual({
      a: 1,
      b: 3,
      c: 4,
    });
    expect(
      mergeStyles({ a: 1, b: 2 } as ViewStyle, [
        { b: 3 } as ViewStyle,
        { c: 5 } as ViewStyle,
      ])
    ).toEqual({
      a: 1,
      b: 3,
      c: 5,
    });
  });
  it('merges typography with fontWeight correctly', () => {
    expect(
      mergeTypographyStyles(
        { fontSize: 1, fontWeight: 'bold' },
        { fontWeight: '400', color: 'black' }
      )
    ).toEqual({ fontSize: 1, color: 'black', fontWeight: '400' });
  });
  it('creates conditional styles by truthy keys', () => {
    const base = { a: 1 };
    const cond = { b: true, c: false };
    const styles = { b: { x: 2 } as ViewStyle, c: { x: 3 } as ViewStyle };
    expect(createConditionalStyle(base as ViewStyle, cond, styles)).toEqual({
      a: 1,
      x: 2,
    });
  });
  it('creates accessible props as expected', () => {
    expect(
      createAccessibilityProps({ testID: 'T', accessibilityLabel: 'X' })
    ).toEqual({ testID: 'T', accessibilityLabel: 'X', accessible: true });
    expect(createAccessibilityProps({})).toEqual({
      testID: undefined,
      accessibilityLabel: undefined,
      accessible: false,
    });
  });
});
