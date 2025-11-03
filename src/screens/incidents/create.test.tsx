import React from 'react';

import { Alert } from 'react-native';
import type { AlertButton } from 'react-native';

import {
  act,
  findPressableParent,
  fireEvent,
  reactNativeRender as render,
  screen,
  waitFor,
} from '@/lib/test-utils';

import CreateIncidentScreen from './create';
import type { AuthState } from '@/stores/auth';
import {
  createAuthState,
  createIncidentsState,
  createUseLocationReturn,
} from '@/lib/mock-data-tests';
import type { IncidentsState } from '@/stores/incidents';
import type { UseLocationReturn } from '@/lib/hooks/use-location';

const routerModule = require('expo-router');
const authStoreModule = require('@/stores/auth');
const incidentsStoreModule = require('@/stores/incidents');
const useLocationModule = require('@/lib/hooks/use-location');

const modalModule = require('@/components/modal');

const { __backMock: backMock, __replaceMock: replaceMock } = routerModule;

const presentMock = jest.fn();
const dismissMock = jest.fn();

jest.spyOn(modalModule, 'useModal').mockImplementation(() => ({
  ref: { current: null },
  present: presentMock,
  dismiss: dismissMock,
}));

describe('CreateIncidentScreen', () => {
  const alertSpy = jest.spyOn(Alert, 'alert');

  let mockAuthState: AuthState;
  let mockIncidentsState: IncidentsState;
  let mockLocationState: UseLocationReturn;

  beforeEach(() => {
    jest.clearAllMocks();
    backMock.mockClear();
    replaceMock.mockClear();
    presentMock.mockClear();
    dismissMock.mockClear();

    mockAuthState = createAuthState({
      selectedTenant: { id: 'tenant-1', name: 'Tenant', displayName: 'Tenant' },
    });

    mockIncidentsState = createIncidentsState({
      actions: {
        createIncident: jest.fn().mockResolvedValue(undefined),
      },
    });

    mockLocationState = createUseLocationReturn({
      hasPermission: null,
      coordinates: null,
      isLoading: false,
      error: null,
      actions: {
        getCurrentLocation: jest.fn().mockResolvedValue(undefined),
        requestPermission: jest.fn().mockResolvedValue(true),
        refreshLocation: jest.fn().mockResolvedValue(undefined),
      },
    });

    authStoreModule.useAuthStore.mockImplementation(() => mockAuthState);
    incidentsStoreModule.useIncidentsStore.mockImplementation(
      () => mockIncidentsState
    );
    useLocationModule.useLocation.mockImplementation(() => mockLocationState);
  });

  afterAll(() => {
    alertSpy.mockRestore();
  });

  it('shows permission checking state while location permission is undetermined', () => {
    mockLocationState.hasPermission = null;

    render(<CreateIncidentScreen />);

    expect(screen.getByText('Checking location permissions...')).toBeTruthy();
  });

  it('renders permission screen when location access is denied', () => {
    mockLocationState.hasPermission = false;

    render(<CreateIncidentScreen />);

    fireEvent(
      findPressableParent(screen.getByText('Allow Location Access')),
      'press'
    );
    expect(mockLocationState.actions.requestPermission).toHaveBeenCalled();

    fireEvent(findPressableParent(screen.getByText('Cancel')), 'press');
    expect(backMock).toHaveBeenCalled();
  });

  const setupForm = () => {
    mockLocationState.hasPermission = true;
    mockLocationState.coordinates = [103.8198, 1.3521, 0];

    render(<CreateIncidentScreen />);
  };

  it('validates required fields before submission', async () => {
    setupForm();

    fireEvent.press(findPressableParent(screen.getByText('Create Incident')));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        'Error',
        'Incident name is required'
      );
    });

    alertSpy.mockClear();

    fireEvent.changeText(
      screen.getByPlaceholderText('Enter incident name'),
      'Fire in lab'
    );
    fireEvent.press(findPressableParent(screen.getByText('Create Incident')));

    expect(alertSpy).toHaveBeenCalledWith('Error', 'Incident type is required');
  });

  it('alerts when tenant is missing', async () => {
    mockAuthState.selectedTenant = null;
    setupForm();

    fireEvent.changeText(
      screen.getByPlaceholderText('Enter incident name'),
      'Fire in lab'
    );

    // Open select and choose an option
    fireEvent.press(
      findPressableParent(screen.getByText('Select incident type'))
    );
    fireEvent.press(screen.getByText('Emergency'));

    fireEvent.press(findPressableParent(screen.getByText('Create Incident')));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Error', 'No tenant selected');
    });
  });

  it('creates an incident successfully and navigates back', async () => {
    setupForm();

    fireEvent.changeText(
      screen.getByPlaceholderText('Enter incident name'),
      'Fire in lab'
    );
    fireEvent.changeText(
      screen.getByPlaceholderText('Describe the incident details...'),
      'Extinguisher needed'
    );

    fireEvent.press(
      findPressableParent(screen.getByText('Select incident type'))
    );
    fireEvent.press(screen.getByText('Emergency'));

    fireEvent.press(findPressableParent(screen.getByText('Create Incident')));

    await waitFor(() => {
      expect(mockIncidentsState.actions.createIncident).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        'Success',
        'Incident created successfully',
        expect.any(Array)
      );
    });

    const [[, , buttons]] = alertSpy.mock.calls; // Extract buttons from success alert
    const okButton = buttons?.find(
      (button: AlertButton) => button.text === 'OK'
    );
    act(() => {
      okButton?.onPress?.();
    });

    expect(replaceMock).toHaveBeenCalledWith('/incidents');
  });

  it('shows error alert when incident creation fails', async () => {
    const createIncidentMock = jest
      .fn()
      .mockRejectedValueOnce(new Error('Create failed'));
    mockIncidentsState = createIncidentsState({
      actions: {
        createIncident: createIncidentMock,
      },
    });
    incidentsStoreModule.useIncidentsStore.mockImplementation(
      () => mockIncidentsState
    );
    setupForm();

    fireEvent.changeText(
      screen.getByPlaceholderText('Enter incident name'),
      'Fire in lab'
    );
    fireEvent.press(
      findPressableParent(screen.getByText('Select incident type'))
    );
    fireEvent.press(screen.getByText('Emergency'));

    fireEvent.press(findPressableParent(screen.getByText('Create Incident')));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Error', 'Create failed');
    });
  });

  it('opens upload modal and handles selected image', async () => {
    setupForm();

    fireEvent.press(findPressableParent(screen.getByText('Change')));
    await waitFor(() => {
      expect(presentMock).toHaveBeenCalled();
    });

    // Trigger onImagePicked by locating modal component
    const uploadModal = screen.getByText('Take Photo').parent?.parent?.parent;
    const onImagePickedProp = (uploadModal as React.ReactElement)?.props?.children?.props
      ?.onImagePicked;

    if (onImagePickedProp) {
      act(() => {
        onImagePickedProp('mock-image');
      });
      expect(dismissMock).toHaveBeenCalled();
    }
  });
});
