import React from 'react';
import { View } from 'react-native';

import { reactNativeRender as render, screen, waitFor } from '@/lib/test-utils';

import { MapView } from './map-view';
import { createIncident } from '@/lib/mock-data-tests';

const pointAnnotationCalls: any[] = [];
let mockIncidentsState: any;

jest.mock('@rnmapbox/maps', () => {
  const React = require('react');
  const { View } = require('react-native');

  const defaultExport = {
    setAccessToken: jest.fn(),
    StyleURL: {
      Dark: 'dark-style',
      Light: 'light-style',
    },
  };

  const MockPointAnnotation = (props: any) => {
    const { children, ...rest } = props;
    pointAnnotationCalls.push(rest);
    return <View testID={`map-marker-${props.id}`}>{children}</View>;
  };

  const MockCamera = React.forwardRef((props: any, ref: any) => {
    const handle = { setCamera: jest.fn() };

    if (typeof ref === 'function') {
      ref(handle);
    } else if (ref) {
      ref.current = handle;
    }

    return <View testID="mapbox-camera" {...props} />;
  });

  return {
    __esModule: true,
    default: defaultExport,
    MapView: ({ children }: any) => (
      <View testID="mapbox-view">{children}</View>
    ),
    PointAnnotation: MockPointAnnotation,
    Camera: MockCamera,
    StyleURL: defaultExport.StyleURL,
  };
});

const authStoreModule = require('@/stores/auth');
const incidentsStoreModule = require('@/stores/incidents');
const { router } = require('expo-router');

describe('Home MapView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    pointAnnotationCalls.length = 0;

    authStoreModule.useAuthStore.mockImplementation(() => ({
      selectedTenant: { id: 'tenant-1' },
    }));

    mockIncidentsState = {
      incidents: [],
      actions: {
        fetchIncidents: jest.fn(),
        setSelectedIncident: jest.fn(),
      },
    };

    incidentsStoreModule.useIncidentsStore.mockImplementation(
      () => mockIncidentsState
    );
    
  });

  it('fetches incidents for the selected tenant on mount', async () => {
    render(<MapView />);

    await waitFor(() => {
      expect(mockIncidentsState.actions.fetchIncidents).toHaveBeenCalledWith(
        'tenant-1'
      );
    });
  });

  it('renders map markers for incidents with coordinates', async () => {
    const fetchIncidentsMock = jest.fn();
    incidentsStoreModule.useIncidentsStore.mockImplementation(() => ({
      incidents: [
        createIncident({
          id: 'incident-1',
          location: { coordinates: [12.34, 56.78] },
        }),
        createIncident({
          id: 'incident-2',
          location: { coordinates: [98.76, 54.32] },
        }),
      ],
      actions: {
        fetchIncidents: fetchIncidentsMock,
        setSelectedIncident: jest.fn(),
      },
    }));

    render(<MapView />);

    expect(await screen.findAllByTestId(/map-marker-/)).toHaveLength(2);
  });

  it('navigates to the incident detail when a marker is selected', () => {
    const fetchIncidentsMock = jest.fn();
    const setSelectedIncidentMock = jest.fn();

    incidentsStoreModule.useIncidentsStore.mockImplementation(() => ({
      incidents: [
        createIncident({
          id: 'incident-3',
          location: { coordinates: [20, 10] },
        }),
      ],
      actions: {
        fetchIncidents: fetchIncidentsMock,
        setSelectedIncident: setSelectedIncidentMock,
      },
    }));

    render(<MapView />);

    const markerProps = pointAnnotationCalls[0];
    markerProps.onSelected?.();

    expect(setSelectedIncidentMock).not.toHaveBeenCalled();
    expect(router.push).toHaveBeenCalledWith('/incidents/incident-3');
  });
});
