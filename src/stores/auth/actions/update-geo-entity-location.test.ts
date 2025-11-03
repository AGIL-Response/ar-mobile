import updateGeoEntityLocation from './update-geo-entity-location';

describe('updateGeoEntityLocation', () => {
  let mockSet: jest.Mock;
  let mockGet: jest.Mock;
  let action: ReturnType<typeof updateGeoEntityLocation>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSet = jest.fn();
    mockGet = jest.fn();
    action = updateGeoEntityLocation(mockSet, mockGet);
  });

  it('returns early without updating location (disabled feature)', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    const result = await action(40.7128, -74.006);

    expect(result).toBeUndefined();
    expect(consoleSpy).toHaveBeenCalledWith(
      'Geo entity location update is disabled',
      { lat: 40.7128, lon: -74.006 }
    );
    expect(mockSet).not.toHaveBeenCalled();
    expect(mockGet).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
