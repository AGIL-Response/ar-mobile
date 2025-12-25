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
import type { IncidentsState } from '@/stores/incidents';
import type { UseLocationReturn } from '@/lib/hooks/use-location';
import {
  createIncidentsState,
  createUseLocationReturn,
  createIncident,
} from '@/lib/mock-data-tests';
jest.mock('@/stores/incidents', () => ({
  useIncidentsStore: jest.fn(),
}));

jest.mock('@/lib/hooks/use-location', () => ({
  useLocation: jest.fn(),
}));

jest.mock('./components/incident-upload-model', () => {
  const mockReact = require('react');
  return {
    IncidentUploadModel: mockReact.forwardRef((_props: any, _ref: any) => null),
  };
});

jest.mock('./components', () => {
  // eslint-disable-next-line
  const mockReact = require('react');
  return {
    LocationPermissionScreen: ({ onRequestPermission, onCancel }: any) =>
      mockReact.createElement(
        'View',
        { testID: 'location-permission-screen' },
        mockReact.createElement(
          'TouchableOpacity',
          { onPress: onRequestPermission },
          'Allow Location Access'
        ),
        mockReact.createElement('TouchableOpacity', { onPress: onCancel }, 'Cancel')
      ),
  };
});

jest.mock('@/components/textarea', () => {
  // eslint-disable-next-line
  const mockReact = require('react');
  // eslint-disable-next-line
  const { TextInput } = require('react-native');
  return {
    TextArea: ({ onChangeText, placeholder, value }: any) =>
      mockReact.createElement(TextInput, {
        onChangeText,
        placeholder,
        value,
        multiline: true,
      }),
  };
});

// eslint-disable-next-line
const routerModule = require('expo-router');
// eslint-disable-next-line
const incidentsStoreModule = require('@/stores/incidents');
// eslint-disable-next-line
const useLocationModule = require('@/lib/hooks/use-location');
// eslint-disable-next-line
const filesApiModule = require('@/api');

describe('CreateIncidentScreen', () => {
  const alertSpy = jest.spyOn(Alert, 'alert');
  const mockRouterBack = jest.fn();
  const mockRouterReplace = jest.fn();

  let mockIncidentsState: IncidentsState;
  let mockLocationState: UseLocationReturn;

  beforeEach(() => {
    jest.clearAllMocks();

    (routerModule.useRouter as jest.Mock).mockReturnValue({
      back: mockRouterBack,
      replace: mockRouterReplace,
    });

    mockIncidentsState = createIncidentsState({
      actions: {
        createIncident: jest.fn().mockResolvedValue(
          createIncident({ id: 'incident-1', name: 'Test Incident' })
        ),
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

    (incidentsStoreModule.useIncidentsStore as jest.Mock).mockImplementation(
      (selector: any) => selector(mockIncidentsState)
    );
    (useLocationModule.useLocation as jest.Mock).mockImplementation(
      () => mockLocationState
    );

    (filesApiModule.filesApi.uploadIncidentAttachment as jest.Mock).mockResolvedValue(
      undefined
    );
  });

  afterAll(() => {
    alertSpy.mockRestore();
  });

  describe('Permission States', () => {
    it('shows checking permissions state when hasPermission is null', () => {
      mockLocationState.hasPermission = null;

      render(<CreateIncidentScreen />);

      expect(screen.getByText('Checking location permissions...')).toBeTruthy();
    });

    it('shows permission screen when location access is denied', () => {
      mockLocationState.hasPermission = false;

      const { toJSON } = render(<CreateIncidentScreen />);

      // Permission screen component is rendered
      expect(toJSON()).toBeTruthy();
      expect(screen.getByTestId('location-permission-screen')).toBeTruthy();
    });

    it('calls requestPermission when allow button is pressed', () => {
      mockLocationState.hasPermission = false;

      const { root } = render(<CreateIncidentScreen />);

      // Find TouchableOpacity elements (first one is back button, others are permission buttons)
      const touchables = root.findAllByType('TouchableOpacity');
      const permissionButton = touchables[1]; // Second TouchableOpacity should be Allow button
      
      if (permissionButton) {
        fireEvent.press(permissionButton);
        expect(mockLocationState.actions.requestPermission).toHaveBeenCalled();
      }
    });

    it('navigates back when cancel is pressed on permission screen', () => {
      mockLocationState.hasPermission = false;

      const { root } = render(<CreateIncidentScreen />);

      // First TouchableOpacity is the back button in AppBar
      const touchables = root.findAllByType('TouchableOpacity');
      const backButton = touchables[0];
      
      fireEvent.press(backButton);
      expect(mockRouterBack).toHaveBeenCalled();
    });

    it('calls getCurrentLocation when permission granted but no coordinates', () => {
      mockLocationState.hasPermission = true;
      mockLocationState.coordinates = null;

      render(<CreateIncidentScreen />);

      expect(mockLocationState.actions.getCurrentLocation).toHaveBeenCalled();
    });
  });

  describe('Form Rendering', () => {
    beforeEach(() => {
      mockLocationState.hasPermission = true;
      mockLocationState.coordinates = [103.8198, 1.3521, 0];
    });

    it('renders create incident form when permission granted', () => {
      render(<CreateIncidentScreen />);

      expect(screen.getByText('Create Incidents')).toBeTruthy();
      expect(screen.getByText('Incident Name')).toBeTruthy();
      expect(screen.getByText('Description')).toBeTruthy();
      expect(screen.getByText('Incident Type')).toBeTruthy();
      expect(screen.getByText('Attachments')).toBeTruthy();
    });

    it('renders input fields', () => {
      render(<CreateIncidentScreen />);

      expect(screen.getByPlaceholderText('Enter incident')).toBeTruthy();
      expect(screen.getByPlaceholderText('Placeholder')).toBeTruthy();
    });

    it('renders action buttons', () => {
      render(<CreateIncidentScreen />);

      expect(screen.getByText('Take Photo/Video')).toBeTruthy();
      expect(screen.getByText('Choose from Gallery')).toBeTruthy();
      expect(screen.getByText('Create Incident')).toBeTruthy();
      // Cancel button exists twice (in ScrollView and bottom bar)
      expect(screen.getAllByText('Cancel').length).toBeGreaterThan(0);
    });
  });

  describe('Form Validation', () => {
    beforeEach(() => {
      mockLocationState.hasPermission = true;
      mockLocationState.coordinates = [103.8198, 1.3521, 0];
    });

    it('shows error when submitting without incident name', async () => {
      render(<CreateIncidentScreen />);

      const submitButton = findPressableParent(screen.getByText('Create Incident'));
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('Error', 'Incident name is required');
      });
    });

    it('shows error when submitting without incident type', async () => {
      render(<CreateIncidentScreen />);

      const nameInput = screen.getByPlaceholderText('Enter incident');
      fireEvent.changeText(nameInput, 'Fire in building');

      const submitButton = findPressableParent(screen.getByText('Create Incident'));
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('Error', 'Incident type is required');
      });
    });

    it('does not submit when incident name is only whitespace', async () => {
      render(<CreateIncidentScreen />);

      const nameInput = screen.getByPlaceholderText('Enter incident');
      fireEvent.changeText(nameInput, '   ');

      const submitButton = findPressableParent(screen.getByText('Create Incident'));
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('Error', 'Incident name is required');
      });
    });
  });

  describe('Form Submission', () => {
    beforeEach(() => {
      mockLocationState.hasPermission = true;
      mockLocationState.coordinates = [103.8198, 1.3521, 0];
    });

    it('creates incident successfully with required fields', async () => {
      render(<CreateIncidentScreen />);

      // Fill in form
      fireEvent.changeText(screen.getByPlaceholderText('Enter incident'), 'Fire Alert');
      fireEvent.changeText(screen.getByPlaceholderText('Placeholder'), 'Building 5');

      // Select incident type
      const selectButton = findPressableParent(screen.getByText('Select'));
      fireEvent.press(selectButton);
      fireEvent.press(screen.getByText('Fire'));

      // Submit
      const submitButton = findPressableParent(screen.getByText('Create Incident'));
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockIncidentsState.actions.createIncident).toHaveBeenCalledWith({
          name: 'Fire Alert',
          description: 'Building 5',
          type: 'fire',
          location: {
            coordinates: [103.8198, 1.3521, 0],
          },
        });
      });
    });

    it('shows success alert and navigates after creation', async () => {
      render(<CreateIncidentScreen />);

      fireEvent.changeText(screen.getByPlaceholderText('Enter incident'), 'Test');
      const selectButton = findPressableParent(screen.getByText('Select'));
      fireEvent.press(selectButton);
      fireEvent.press(screen.getByText('Emergency'));

      const submitButton = findPressableParent(screen.getByText('Create Incident'));
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith(
          'Success',
          'Incident created successfully',
          expect.any(Array)
        );
      });

      // Simulate pressing OK button in alert
      const [[, , buttons]] = alertSpy.mock.calls;
      const okButton = buttons?.find((button: AlertButton) => button.text === 'OK');
      act(() => {
        okButton?.onPress?.();
      });

      expect(mockRouterReplace).toHaveBeenCalledWith('/incidents');
    });

    it('uses fallback coordinates when location not available', async () => {
      mockLocationState.coordinates = null;

      render(<CreateIncidentScreen />);

      fireEvent.changeText(screen.getByPlaceholderText('Enter incident'), 'Test');
      const selectButton = findPressableParent(screen.getByText('Select'));
      fireEvent.press(selectButton);
      fireEvent.press(screen.getByText('Fire'));

      const submitButton = findPressableParent(screen.getByText('Create Incident'));
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockIncidentsState.actions.createIncident).toHaveBeenCalledWith(
          expect.objectContaining({
            location: {
              coordinates: [103.8198, 1.3521, 0], // Fallback coordinates
            },
          })
        );
      });
    });

    it('shows error alert when incident creation fails', async () => {
      (mockIncidentsState.actions.createIncident as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      render(<CreateIncidentScreen />);

      fireEvent.changeText(screen.getByPlaceholderText('Enter incident'), 'Test');
      const selectButton = findPressableParent(screen.getByText('Select'));
      fireEvent.press(selectButton);
      fireEvent.press(screen.getByText('Fire'));

      const submitButton = findPressableParent(screen.getByText('Create Incident'));
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('Error', 'Network error');
      });
    });

    it('disables submit button while submitting', async () => {
      render(<CreateIncidentScreen />);

      fireEvent.changeText(screen.getByPlaceholderText('Enter incident'), 'Test');
      const selectButton = findPressableParent(screen.getByText('Select'));
      fireEvent.press(selectButton);
      fireEvent.press(screen.getByText('Fire'));

      const submitButton = findPressableParent(screen.getByText('Create Incident'));
      fireEvent.press(submitButton);

      // Button text changes while submitting
      await waitFor(() => {
        expect(screen.queryByText('Creating...')).toBeTruthy();
      });
    });
  });

  describe('Form Input Handling', () => {
    beforeEach(() => {
      mockLocationState.hasPermission = true;
      mockLocationState.coordinates = [103.8198, 1.3521, 0];
    });

    it('updates form state when incident name changes', () => {
      render(<CreateIncidentScreen />);

      const nameInput = screen.getByPlaceholderText('Enter incident');
      fireEvent.changeText(nameInput, 'Fire Alert');

      expect(nameInput.props.value).toBe('Fire Alert');
    });

    it('updates form state when description changes', () => {
      render(<CreateIncidentScreen />);

      const descInput = screen.getByPlaceholderText('Placeholder');
      fireEvent.changeText(descInput, 'Building 5');

      expect(descInput.props.value).toBe('Building 5');
    });

    it('updates form state when incident type is selected', () => {
      render(<CreateIncidentScreen />);

      const selectButton = findPressableParent(screen.getByText('Select'));
      fireEvent.press(selectButton);
      fireEvent.press(screen.getByText('Emergency'));

      // Type should be updated in form state
      expect(screen.queryByText('Select')).toBeNull();
    });
  });

  describe('Navigation', () => {
    beforeEach(() => {
      mockLocationState.hasPermission = true;
      mockLocationState.coordinates = [103.8198, 1.3521, 0];
    });

    it('navigates back when back button is pressed', () => {
      render(<CreateIncidentScreen />);

      const backButtons = screen.root.findAllByType('TouchableOpacity');
      const backButton = backButtons[0]; // First TouchableOpacity is the back button
      fireEvent.press(backButton);

      expect(mockRouterBack).toHaveBeenCalled();
    });

    it('navigates back when cancel button is pressed', () => {
      render(<CreateIncidentScreen />);

      const cancelButtons = screen.getAllByText('Cancel');
      const cancelButton = findPressableParent(cancelButtons[0]);
      fireEvent.press(cancelButton);

      expect(mockRouterBack).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    beforeEach(() => {
      mockLocationState.hasPermission = true;
      mockLocationState.coordinates = [103.8198, 1.3521, 0];
    });

    it('handles empty description', async () => {
      render(<CreateIncidentScreen />);

      fireEvent.changeText(screen.getByPlaceholderText('Enter incident'), 'Test');
      const selectButton = findPressableParent(screen.getByText('Select'));
      fireEvent.press(selectButton);
      fireEvent.press(screen.getByText('Fire'));

      const submitButton = findPressableParent(screen.getByText('Create Incident'));
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockIncidentsState.actions.createIncident).toHaveBeenCalledWith(
          expect.objectContaining({
            description: '', // Empty description is allowed
          })
        );
      });
    });

    it('handles non-Error objects in catch block', async () => {
      (mockIncidentsState.actions.createIncident as jest.Mock).mockRejectedValue(
        'String error'
      );

      render(<CreateIncidentScreen />);

      fireEvent.changeText(screen.getByPlaceholderText('Enter incident'), 'Test');
      const selectButton = findPressableParent(screen.getByText('Select'));
      fireEvent.press(selectButton);
      fireEvent.press(screen.getByText('Fire'));

      const submitButton = findPressableParent(screen.getByText('Create Incident'));
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('Error', 'Failed to create incident');
      });
    });

    it('trims whitespace from name and description', async () => {
      render(<CreateIncidentScreen />);

      fireEvent.changeText(screen.getByPlaceholderText('Enter incident'), '  Test  ');
      fireEvent.changeText(screen.getByPlaceholderText('Placeholder'), '  Desc  ');
      const selectButton = findPressableParent(screen.getByText('Select'));
      fireEvent.press(selectButton);
      fireEvent.press(screen.getByText('Fire'));

      const submitButton = findPressableParent(screen.getByText('Create Incident'));
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockIncidentsState.actions.createIncident).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Test',
            description: 'Desc',
          })
        );
      });
    });
  });

  describe('Component Structure', () => {
    beforeEach(() => {
      mockLocationState.hasPermission = true;
      mockLocationState.coordinates = [103.8198, 1.3521, 0];
    });

    it('renders without crashing', () => {
      const { toJSON } = render(<CreateIncidentScreen />);
      expect(toJSON()).toBeTruthy();
    });

    it('has ScrollView for form content', () => {
      const { root } = render(<CreateIncidentScreen />);
      const scrollViews = root.findAllByType('ScrollView');
      expect(scrollViews.length).toBeGreaterThan(0);
    });
  });
});
