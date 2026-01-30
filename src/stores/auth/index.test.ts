// Unmock the store to test the real implementation (must be before imports)
jest.unmock('@/stores/auth');

import { act, renderHook } from '@testing-library/react-native';

import useAuthStore, {
  ITenant,
  ITokens,
  IUser,
  useAuthStore as useAuthStoreNamed,
} from './index';

import { GeoEntity } from '@/types/geo-entity';

const locationMock = require('@/stores/location');

describe('AuthStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.getState().reset?.();
    jest.spyOn(locationMock, 'useLocationStore').mockReturnValue({
      actions: {
        stopLocationMonitoring: jest.fn(),
        disconnectFromWebSocket: jest.fn(),
      },
    });
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  describe('Initial State', () => {
    it('initializes with correct default values', () => {
      const { result } = renderHook(() => useAuthStore());

      expect(result.current.token.accessToken).toBeUndefined();
      expect(result.current.token.refreshToken).toBeUndefined();
      expect(result.current.user).toBeUndefined();
      expect(result.current.tenants).toEqual([]);
      expect(result.current.selectedTenant).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isCheckingUsername).toBe(false);
      expect(result.current.usernameError).toBeNull();
      expect(result.current.geoEntity).toBeUndefined();
    });
  });

  describe('setTokens', () => {
    it('updates token state', () => {
      const { result } = renderHook(() => useAuthStore());
      const tokens = {
        accessToken: 'token123',
        refreshToken: 'refresh123',
        expiresIn: 3600,
        idToken: 'id123',
      };

      act(() => {
        result.current.actions.setTokens(tokens);
      });

      expect(result.current.token).toEqual(tokens);
    });
  });

  describe('setUser', () => {
    it('updates user state', () => {
      const { result } = renderHook(() => useAuthStore());
      const user = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        tenantId: 'tenant-1',
        realm: 'realm',
        roles: [],
        permissions: [],
        avatarId: 'avatar-1',
        updatedAt: '2021-01-01',
      };

      act(() => {
        result.current.actions.setUser(user);
      });

      expect(result.current.user).toEqual(user);
    });
  });

  describe('setTenants', () => {
    it('updates tenants and auto-selects first tenant', () => {
      const { result } = renderHook(() => useAuthStore());
      const tenants = [
        { id: '1', name: 'Tenant 1', displayName: 'Tenant One' },
        { id: '2', name: 'Tenant 2', displayName: 'Tenant Two' },
      ];

      act(() => {
        result.current.actions.setTenants(tenants);
      });

      expect(result.current.tenants).toEqual(tenants);
      expect(result.current.selectedTenant).toEqual(tenants[0]);
    });

    it('does not auto-select if tenant already selected', () => {
      const { result } = renderHook(() => useAuthStore());
      const existingTenant = {
        id: '0',
        name: 'Existing',
        displayName: 'Existing',
      };
      const newTenants = [
        { id: '1', name: 'Tenant 1', displayName: 'Tenant One' },
      ];

      act(() => {
        result.current.actions.setSelectedTenant(existingTenant);
      });

      act(() => {
        result.current.actions.setTenants(newTenants);
      });

      expect(result.current.selectedTenant).toEqual(existingTenant);
    });
  });

  describe('setSelectedTenant', () => {
    it('updates selected tenant', () => {
      const { result } = renderHook(() => useAuthStore());
      const tenant = { id: '1', name: 'Tenant', displayName: 'Tenant' };

      act(() => {
        result.current.actions.setSelectedTenant(tenant);
      });

      expect(result.current.selectedTenant).toEqual(tenant);
    });

    it('can set tenant to null', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.actions.setSelectedTenant({
          id: '1',
          name: 'Tenant',
          displayName: 'Tenant',
        });
      });

      act(() => {
        result.current.actions.setSelectedTenant(null);
      });

      expect(result.current.selectedTenant).toBeNull();
    });
  });

  describe('setGeoEntity', () => {
    it('updates geo entity', () => {
      const { result } = renderHook(() => useAuthStore());
      const geoEntity = {
        id: '1',
        entityId: '1',
        kind: 'aircraft',
        active: true,
        callsign: 'test',
        gisId: '1',
        createdAt: '2021-01-01',
      } as GeoEntity;

      act(() => {
        result.current.actions.setGeoEntity(geoEntity);
      });

      expect(result.current.geoEntity).toEqual(geoEntity);
    });
  });

  describe('clearUsernameError', () => {
    it('clears username error', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.usernameError = 'Error message';
      });

      act(() => {
        result.current.actions.clearUsernameError();
      });

      expect(result.current.usernameError).toBeNull();
    });
  });

  describe('logout', () => {
    it('resets all auth state', () => {
      const mockLocationStore = {
        actions: {
          stopLocationMonitoring: jest.fn(),
          disconnectFromWebSocket: jest.fn(),
        },
      };
      jest
        .spyOn(locationMock, 'useLocationStore')
        .mockReturnValue(mockLocationStore);

      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.token = {
          accessToken: 'token',
          refreshToken: 'refresh',
          expiresIn: 3600,
        };
        result.current.user = { id: '1' } as IUser;
        result.current.tenants = [{ id: '1' }] as ITenant[];
        result.current.selectedTenant = { id: '1' } as ITenant;
        result.current.geoEntity = { id: '1' } as GeoEntity;
      });

      act(() => {
        result.current.actions.logout();
      });

      expect(result.current.token.accessToken).toBeUndefined();
      expect(result.current.user).toBeUndefined();
      expect(result.current.tenants).toEqual([]);
      expect(result.current.selectedTenant).toBeNull();
      expect(result.current.geoEntity).toBeUndefined();
    });

    it('handles location store errors gracefully', async () => {
      jest.spyOn(locationMock, 'useLocationStore').mockImplementation(() => {
        throw new Error('Location store error');
      });

      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.token = { accessToken: 'token' } as ITokens;
      });

      // Should not throw
      await act(async () => {
        await result.current.actions.logout();
      });

      expect(result.current.token.accessToken).toBeUndefined();
    });
  });

  describe('reset', () => {
    it('resets store to initial state', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.token = {
          accessToken: 'token',
          refreshToken: 'refresh',
          expiresIn: 3600,
          idToken: 'id123',
        } as ITokens;
        result.current.user = { id: '1' } as IUser;
        result.current.tenants = [{ id: '1' }] as ITenant[];
        result.current.selectedTenant = { id: '1' } as ITenant;
      });

      act(() => {
        result.current.reset?.();
      });

      expect(result.current.token.accessToken).toBeUndefined();
      expect(result.current.user).toBeUndefined();
      expect(result.current.tenants).toEqual([]);
      expect(result.current.selectedTenant).toBeNull();
    });
  });

  describe('Export compatibility', () => {
    it('default export works', () => {
      const { result: defaultResult } = renderHook(() => useAuthStore());
      const { result: namedResult } = renderHook(() => useAuthStoreNamed());

      expect(defaultResult.current).toEqual(namedResult.current);
    });
  });
});
