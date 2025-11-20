export const getCoordinate = (coord: number[]): [number, number] | null => {
  if (!Array.isArray(coord) || coord.length < 2) {
    return null;
  }

  const [a, b] = coord;

  return [a, b];
};
