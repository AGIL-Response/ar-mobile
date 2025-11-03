import { getCoordinate } from './index';

describe('incidents utils - getCoordinate', () => {
  it('returns null for invalid input', () => {
    expect(getCoordinate([] as any)).toBeNull();
    expect(getCoordinate('not-array' as any)).toBeNull();
  });

  it('swaps coordinates when latitude first', () => {
    expect(getCoordinate([1.3521, 103.8198])).toEqual([103.8198, 1.3521]);
  });

  it('returns original order when already longitude first', () => {
    expect(getCoordinate([103.8198, 1.3521])).toEqual([103.8198, 1.3521]);
  });
});

