import { createAuthState } from '@/lib/mock-data-tests';
import { AuthState } from '..';
import checkUsername from './check-username';

import { authApi, handleApiError } from '@/api';

describe('checkUsername', () => {
  let mockSet: jest.Mock;
  let mockGet: jest.Mock;
  let action: ReturnType<typeof checkUsername>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSet = jest.fn((fn: (state: AuthState) => void) => {
      if (typeof fn === 'function') {
        fn(mockState);
      }
    });
    mockGet = jest.fn(() => mockState);
    action = checkUsername(mockSet, mockGet);
  });

  const mockState: AuthState = createAuthState();

  describe('Input Validation', () => {
    it('returns null and sets error for empty username', async () => {
      const result = await action('');

      expect(result).toBeNull();
      expect(mockSet).toHaveBeenCalled();
      const setCall = mockSet.mock.calls[0][0];
      let stateUpdate: AuthState = {
        ...mockState,
      };
      setCall(stateUpdate);
      expect(stateUpdate.usernameError).toBe('Username is required');
    });

    it('returns null and sets error for whitespace-only username', async () => {
      const result = await action('   ');

      expect(result).toBeNull();
      expect(mockSet).toHaveBeenCalled();
    });
  });

  describe('Successful Username Check', () => {
    it('fetches tenants and sets first tenant as selected', async () => {
      const mockTenants = [
        { id: '1', name: 'tenant1', displayName: 'Tenant One' },
        { id: '2', name: 'tenant2', displayName: 'Tenant Two' },
      ];
      (authApi.getAllTenantsByUsername as jest.Mock).mockResolvedValue(
        mockTenants
      );

      const result = await action('testuser');

      expect(authApi.getAllTenantsByUsername).toHaveBeenCalledWith('testuser');
      expect(result).toBe('tenant1');

      // Check that tenants and selectedTenant were set
      const setCalls = mockSet.mock.calls;
      expect(setCalls.length).toBeGreaterThan(0);

      // Find the call that sets tenants
      const tenantsSetCall = setCalls.find((call) => {
        const testState: AuthState = { ...mockState, tenants: [] };
        call[0](testState);
        return testState.tenants.length > 0;
      });

      expect(tenantsSetCall).toBeDefined();
      const stateForTenants: AuthState = {
        ...mockState,
        tenants: [],
        selectedTenant: null,
      };
      tenantsSetCall[0](stateForTenants);
      expect(stateForTenants.tenants).toEqual(mockTenants);
      expect(stateForTenants.selectedTenant).toEqual(mockTenants[0]);
    });

    it('sets isCheckingUsername state correctly', async () => {
      (authApi.getAllTenantsByUsername as jest.Mock).mockResolvedValue([
        { id: '1', name: 'tenant1' },
      ]);

      await action('testuser');

      // Check loading state was set to true
      const loadingState: AuthState = {
        ...mockState,
        isCheckingUsername: false,
      };
      mockSet.mock.calls.find((call) => {
        call[0](loadingState);
        return loadingState.isCheckingUsername === true;
      });
      expect(loadingState.isCheckingUsername).toBe(true);

      // Check loading state was set to false in finally
      const finalCalls = mockSet.mock.calls;
      const finallyCall = finalCalls[finalCalls.length - 1];
      const finalState: AuthState = { ...mockState, isCheckingUsername: true };
      finallyCall[0](finalState);
      expect(finalState.isCheckingUsername).toBe(false);
    });
  });

  describe.only('Error Cases', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      jest.spyOn(console, 'error').mockImplementation();
      jest.spyOn(console, 'log').mockImplementation();
    });

    it('returns null when no tenants found', async () => {
      (authApi.getAllTenantsByUsername as jest.Mock).mockResolvedValue([]);

      const result = await action('testuser');

      expect(result).toBeNull();
      const errorState: AuthState = { ...mockState, usernameError: null };
      const errorCall = mockSet.mock.calls.find((call) => {
        call[0](errorState);
        return errorState.usernameError;
      });
      expect(errorCall).toBeDefined();
      expect(errorState.usernameError).toBe(
        'Username not found. Please check your username and try again.'
      );
    });

    it('handles API errors correctly', async () => {
      const apiError = new Error('Network error');
      (authApi.getAllTenantsByUsername as jest.Mock).mockRejectedValue(
        apiError
      );
      (handleApiError as jest.Mock).mockReturnValue({
        message: 'Network error',
      });

      const result = await action('testuser');

      expect(result).toBeNull();
      expect(handleApiError).toHaveBeenCalledWith(apiError);

      const errorState: AuthState = { ...mockState, usernameError: null };
      const errorCall = mockSet.mock.calls.find((call) => {
        call[0](errorState);
        return errorState.usernameError;
      });
      expect(errorCall).toBeDefined();
      expect(errorState.usernameError).toBe('Network error');
    });

    it('clears previous error before checking', async () => {
      mockState.usernameError = 'Previous error';
      (authApi.getAllTenantsByUsername as jest.Mock).mockResolvedValue([
        { id: '1', name: 'tenant1' },
      ]);

      await action('testuser');

      // Check that error was cleared
      const clearState: AuthState = {
        ...mockState,
        usernameError: 'Previous error',
      };
      const clearCall = mockSet.mock.calls.find((call) => {
        call[0](clearState);
        return clearState.usernameError === null;
      });
      expect(clearCall).toBeDefined();
    });
  });
});
