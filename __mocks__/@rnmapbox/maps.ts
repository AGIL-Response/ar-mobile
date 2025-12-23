const mockReact = require('react');
module.exports = {
__esModule: true,
default: {
    setAccessToken: jest.fn(),
    StyleURL: {
    Dark: 'mapbox://styles/mapbox/dark-v10',
    Light: 'mapbox://styles/mapbox/light-v10',
    },
},
MapView: ({ children, onDidFinishLoadingMap, styleURL }: any) => {
    mockReact.useEffect(() => {
    if (onDidFinishLoadingMap) {
        onDidFinishLoadingMap();
    }
    }, []);
    return mockReact.createElement('View', { testID: 'mapbox-mapview', 'data-style': styleURL }, children);
},
Camera: mockReact.forwardRef((props: any, ref: any) =>
    mockReact.createElement('View', { testID: 'mapbox-camera', ref })
),
MarkerView: ({ children, coordinate }: any) =>
    mockReact.createElement(
    'View',
    { testID: 'mapbox-marker', 'data-coordinate': JSON.stringify(coordinate) },
    children
    ),
};