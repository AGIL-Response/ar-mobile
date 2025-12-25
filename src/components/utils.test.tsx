import { Dimensions, Platform } from 'react-native';
import { showMessage } from 'react-native-flash-message';

import {
  extractError,
  HEIGHT,
  IS_IOS,
  showError,
  showErrorMessage,
  showSuccess,
  WIDTH,
} from './utils';

jest.mock('@/components/utils', () => jest.requireActual('./utils'));
const showMessageMock = require('react-native-flash-message');
jest.mock('react-native-flash-message');

// Mock console.log to avoid noisy output
const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

describe('utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    showMessageMock.showMessage.mockClear();
  });

  afterAll(() => {
    consoleLogSpy.mockRestore();
  });

  describe('Constants', () => {
    it('IS_IOS reflects Platform.OS', () => {
      expect(IS_IOS).toBe(Platform.OS === 'ios');
    });

    it('WIDTH and HEIGHT reflect screen dimensions', () => {
      const { width, height } = Dimensions.get('screen');
      expect(WIDTH).toBe(width);
      expect(HEIGHT).toBe(height);
    });
  });

  describe('extractError', () => {
    it('returns string as-is', () => {
      expect(extractError('Simple error message')).toBe('Simple error message');
    });

    it('returns default message for null', () => {
      expect(extractError(null)).toBe('Something went wrong ');
    });

    it('returns default message for undefined', () => {
      expect(extractError(undefined)).toBe('Something went wrong ');
    });

    it('handles array of strings', () => {
      const result = extractError(['Error 1', 'Error 2', 'Error 3']);
      expect(result).toContain('Error 1');
      expect(result).toContain('Error 2');
      expect(result).toContain('Error 3');
    });

    it('handles array of mixed types', () => {
      const result = extractError(['Error 1', { field: 'Error 2' }]);
      expect(result).toContain('Error 1');
      expect(result).toContain('field');
      expect(result).toContain('Error 2');
    });

    it('handles object with string values', () => {
      const result = extractError({
        field1: 'Error in field 1',
        field2: 'Error in field 2',
      });
      expect(result).toContain('field1');
      expect(result).toContain('Error in field 1');
      expect(result).toContain('field2');
      expect(result).toContain('Error in field 2');
    });

    it('handles nested objects', () => {
      const result = extractError({
        errors: {
          email: 'Invalid email',
          password: 'Too short',
        },
      });
      expect(result).toContain('errors');
      expect(result).toContain('email');
      expect(result).toContain('Invalid email');
      expect(result).toContain('password');
      expect(result).toContain('Too short');
    });

    it('handles object with array values', () => {
      const result = extractError({
        errors: ['Error 1', 'Error 2'],
      });
      expect(result).toContain('errors');
      expect(result).toContain('Error 1');
      expect(result).toContain('Error 2');
      // Should use ':\n ' separator for arrays
      expect(result).toContain(':\n');
    });

    it('handles mixed nested structures', () => {
      const result = extractError({
        message: 'Top level error',
        errors: {
          field1: 'Field error',
          field2: ['Array error 1', 'Array error 2'],
        },
      });
      expect(result).toContain('message');
      expect(result).toContain('Top level error');
      expect(result).toContain('field1');
      expect(result).toContain('Field error');
      expect(result).toContain('Array error 1');
      expect(result).toContain('Array error 2');
    });

    it('handles empty array', () => {
      const result = extractError([]);
      expect(result).toBe('');
    });

    it('handles empty object', () => {
      const result = extractError({});
      expect(result).toBe(' ');
    });
  });

  describe('showError', () => {
    it('shows error with response.data when available', () => {
      const error = {
        response: {
          data: 'Error from server',
        },
      };
      showError(error);
      expect(showMessageMock.showMessage).toHaveBeenCalledWith({
        message: 'Error',
        description: 'Error from server',
        type: 'danger',
        duration: 4000,
        icon: 'danger',
      });
      expect(consoleLogSpy).toHaveBeenCalledWith(
        JSON.stringify('Error from server')
      );
    });

    it('prioritizes error.message over response.data', () => {
      const error = {
        message: 'Error message takes priority',
        response: {
          data: 'Error from server',
        },
      };
      showError(error);
      expect(showMessageMock.showMessage).toHaveBeenCalledWith({
        message: 'Error',
        description: 'Error message takes priority',
        type: 'danger',
        duration: 4000,
        icon: 'danger',
      });
    });

    it('handles error with object response.data', () => {
      const error = {
        response: {
          data: {
            errors: {
              email: 'Invalid email',
            },
          },
        },
      };
      showError(error);
      expect(showMessageMock.showMessage).toHaveBeenCalledWith({
        message: 'Error',
        description: expect.stringContaining('email'),
        type: 'danger',
        duration: 4000,
        icon: 'danger',
      });
    });

    it('handles error with array response.data', () => {
      const error = {
        response: {
          data: ['Error 1', 'Error 2'],
        },
      };
      showError(error);
      expect(showMessageMock.showMessage).toHaveBeenCalledWith({
        message: 'Error',
        description: expect.stringContaining('Error 1'),
        type: 'danger',
        duration: 4000,
        icon: 'danger',
      });
    });

    it('handles error without response', () => {
      const error = {
        message: 'Network error',
      };
      showError(error);
      expect(showMessage).toHaveBeenCalledWith({
        message: 'Error',
        description: 'Network error',
        type: 'danger',
        duration: 4000,
        icon: 'danger',
      });
    });

    it('handles error with null response.data', () => {
      const error = {
        response: {
          data: null,
        },
      };
      showError(error);
      expect(showMessage).toHaveBeenCalledWith({
        message: 'Error',
        description: 'Something went wrong',
        type: 'danger',
        duration: 4000,
        icon: 'danger',
      });
    });

    it('trims trailing whitespace from extracted error', () => {
      const error = {
        response: {
          data: 'Error message with trailing spaces   ',
        },
      };
      showError(error);
      expect(showMessage).toHaveBeenCalledWith({
        message: 'Error',
        description: 'Error message with trailing spaces',
        type: 'danger',
        duration: 4000,
        icon: 'danger',
      });
    });
  });

  describe('showErrorMessage', () => {
    it('shows error message with custom text', () => {
      showErrorMessage('Custom error message');
      expect(showMessage).toHaveBeenCalledWith({
        message: 'Custom error message',
        type: 'danger',
        duration: 4000,
      });
    });

    it('shows default message when no argument provided', () => {
      showErrorMessage();
      expect(showMessage).toHaveBeenCalledWith({
        message: 'Something went wrong ',
        type: 'danger',
        duration: 4000,
      });
    });
  });

  describe('showSuccess', () => {
    it('shows success message', () => {
      showSuccess('Operation completed successfully');
      expect(showMessage).toHaveBeenCalledWith({
        message: 'Operation completed successfully',
        type: 'success',
        duration: 4000,
        icon: 'success',
      });
    });

    it('handles empty success message', () => {
      showSuccess('');
      expect(showMessage).toHaveBeenCalledWith({
        message: '',
        type: 'success',
        duration: 4000,
        icon: 'success',
      });
    });
  });
});
