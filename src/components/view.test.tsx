import React from 'react';

import { Center, Column, Row, Screen, View } from '@/components/view';
import { getStyle, reactNativeRender as render } from '@/lib/test-utils';

describe('View component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  test('defaults: flexDirection column', () => {
    render(<View testID="v" />);
    const style = getStyle('v');
    expect(style.flexDirection).toBe('column');
  });

  test('centered sets justifyContent and alignItems to center', () => {
    render(<View testID="v" centered />);
    const style = getStyle('v');
    expect(style.justifyContent).toBe('center');
    expect(style.alignItems).toBe('center');
  });

  test('gap maps to theme spacing', () => {
    render(<View testID="v" gap="md" />);
    const style = getStyle('v');
    expect(style.gap).toBe(8); // from jest-setup theme mock
  });

  test('fullWidth sets width to 100%', () => {
    render(<View testID="v" fullWidth />);
    const style = getStyle('v');
    expect(style.width).toBe('100%');
  });

  test('rounded applies borderRadius from theme', () => {
    render(<View testID="v" rounded="lg" />);
    const style = getStyle('v');
    expect(style.borderRadius).toBe(8); // from jest-setup theme mock
  });

  test('bordered sets borderWidth and default borderColor', () => {
    render(<View testID="v" bordered />);
    const style = getStyle('v');
    expect(style.borderWidth).toBe(2);
    expect(style.borderColor).toBe('#6b7280'); // theme.colors.text.secondary
  });

  test('borderColor override wins over default', () => {
    render(<View testID="v" bordered borderColor="#ff0000" />);
    const style = getStyle('v');
    expect(style.borderColor).toBe('#ff0000');
  });

  test('backgroundColor prop is respected', () => {
    render(<View testID="v" backgroundColor="#123456" />);
    const style = getStyle('v');
    expect(style.backgroundColor).toBe('#123456');
  });

  test('merges user style with computed styles', () => {
    render(<View testID="v" style={{ opacity: 0.5 }} />);
    const style = getStyle('v');
    expect(style.opacity).toBe(0.5);
  });
});

describe('View variants', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  test('Row sets flexDirection row', () => {
    render(<Row testID="row" />);
    const style = getStyle('row');
    expect(style.flexDirection).toBe('row');
  });

  test('Column sets flexDirection column', () => {
    render(<Column testID="col" />);
    const style = getStyle('col');
    expect(style.flexDirection).toBe('column');
  });

  test('Center sets centered styles', () => {
    render(<Center testID="center" />);
    const style = getStyle('center');
    expect(style.justifyContent).toBe('center');
    expect(style.alignItems).toBe('center');
  });

  test('Screen sets flex=1 and background from theme', () => {
    render(<Screen testID="screen" />);
    const style = getStyle('screen');
    expect(style.flex).toBe(1);
    expect(style.backgroundColor).toBe('#ffffff'); // theme.colors.background.primary
  });
});
