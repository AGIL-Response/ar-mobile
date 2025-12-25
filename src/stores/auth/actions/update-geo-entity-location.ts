// Geo entity location update disabled - remove bftApi dependency
const updateGeoEntityLocation =
  (set: any, get: any) => async (lat: number, lon: number) => {
    console.log('Geo entity location update is disabled', { lat, lon });
    // Skip location update to avoid bftApi dependency
    return;
  };

export default updateGeoEntityLocation;
