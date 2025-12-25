import { getCoordinate } from './index';

describe('incidents utils - getCoordinate', () => {
  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation();
  });

  it('returns null for invalid input', () => {
    expect(getCoordinate([] as any)).toBeNull();
    expect(getCoordinate('not-array' as any)).toBeNull();
  });


  it('returns original order when already longitude first', () => {
    expect(getCoordinate([103.8198, 1.3521])).toEqual([103.8198, 1.3521]);
  });
});

