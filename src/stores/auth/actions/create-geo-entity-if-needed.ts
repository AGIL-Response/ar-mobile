// Geo entity creation disabled - remove bftApi dependency
const createGeoEntityIfNeeded = (set: any, get: any) => async () => {
  console.log('Geo entity creation is disabled');
  // Skip geo entity creation to avoid bftApi dependency
  return;
};

export default createGeoEntityIfNeeded;
