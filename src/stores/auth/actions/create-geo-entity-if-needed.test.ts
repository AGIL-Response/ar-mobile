import createGeoEntityIfNeeded from './create-geo-entity-if-needed';

describe('createGeoEntityIfNeeded', () => {
  let mockSet: jest.Mock;
  let mockGet: jest.Mock;
  let action: ReturnType<typeof createGeoEntityIfNeeded>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSet = jest.fn();
    mockGet = jest.fn();
    action = createGeoEntityIfNeeded(mockSet, mockGet);
  });

  it('returns early without creating geo entity (disabled feature)', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    const result = await action();

    expect(result).toBeUndefined();
    expect(consoleSpy).toHaveBeenCalledWith('Geo entity creation is disabled');
    expect(mockSet).not.toHaveBeenCalled();
    expect(mockGet).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
