export const getCoordinate = (coord: number[]): [number, number] | null => {
    if (!Array.isArray(coord) || coord.length < 2) {
        return null;
    }

    const [a, b] = coord;

    if (Math.abs(a) <= 90 && Math.abs(b) <= 180) {
        return [b, a];
    }

    return [a, b];
}