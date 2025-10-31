import React from 'react';
import { I18nManager } from 'react-native';

import { getStyle, render, screen } from '@/lib/test-utils';

import { Text } from './text';

const translateMock = require('@/lib/i18n');

describe('Text component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children text', () => {
    render(<Text testID="text">Hello World</Text>);
    expect(screen.getByText('Hello World')).toBeTruthy();
  });

  it('renders text prop when provided', () => {
    render(<Text testID="text" text="Hello from prop" />);
    expect(screen.getByText('Hello from prop')).toBeTruthy();
  });

  it('prioritizes text prop over children', () => {
    render(
      <Text testID="text" text="From prop">
        From children
      </Text>
    );
    expect(screen.getByText('From prop')).toBeTruthy();
    expect(screen.queryByText('From children')).toBeNull();
  });

  it('uses translation when tx prop is provided', () => {
    render(<Text testID="text" tx="common.hello" fe />);
    expect(translateMock.translate).toHaveBeenCalledWith(
      'common.hello',
      undefined
    );
    expect(screen.getByText('translated_common.hello')).toBeTruthy();
  });

  it('passes txOptions to translate function', () => {
    const txOptions = { name: 'John' };
    render(<Text testID="text" tx="common.greeting" txOptions={txOptions} />);
    expect(translateMock.translate).toHaveBeenCalledWith(
      'common.greeting',
      txOptions
    );
  });

  it('prioritizes tx over text and children', () => {
    render(
      <Text testID="text" tx="common.hello" text="From text">
        From children
      </Text>
    );
    expect(screen.getByText('translated_common.hello')).toBeTruthy();
  });

  it('applies centered style when centered prop is true', () => {
    render(
      <Text testID="text" centered>
        Center me
      </Text>
    );
    const style = getStyle('text');
    expect(style.textAlign).toBe('center');
  });

  it('applies RTL writing direction when rtl prop is true', () => {
    render(
      <Text testID="text" rtl>
        RTL text
      </Text>
    );
    const style = getStyle('text');
    expect(style.writingDirection).toBe('rtl');
  });

  it('applies RTL when I18nManager.isRTL is true', () => {
    (I18nManager as any).isRTL = true;
    render(<Text testID="text">RTL text</Text>);
    const style = getStyle('text');
    expect(style.writingDirection).toBe('rtl');
    (I18nManager as any).isRTL = false;
  });

  it('merges user-provided style with computed styles', () => {
    render(
      <Text testID="text" style={{ opacity: 0.5 }}>
        Styled text
      </Text>
    );
    const style = getStyle('text');
    expect(style.opacity).toBe(0.5);
  });

  it('applies color prop when provided', () => {
    render(
      <Text testID="text" color="#ff0000">
        Red text
      </Text>
    );
    const style = getStyle('text');
    expect(style.color).toBe('#ff0000');
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<any>();
    render(
      <Text ref={ref} testID="text">
        Ref text
      </Text>
    );
    expect(ref.current).toBeTruthy();
  });
});
