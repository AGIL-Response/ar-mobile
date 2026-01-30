import { revokeToken } from './index';
import { handleApiError } from '../api-client';
import { KEYCLOAK_CONFIG } from '@/constants/keycloak';

jest.mock('../api-client');

describe('Keycloak API', () => {
  const mockRealm = 'test-realm';
  const mockToken = 'mock-refresh-token';
  const mockRevocationEndpoint = 'https://keycloak.test/realms/test-realm/protocol/openid-connect/revoke';

  beforeEach(() => {
    jest.clearAllMocks();
    
    (KEYCLOAK_CONFIG.getDiscovery as jest.Mock).mockReturnValue({
      revocationEndpoint: mockRevocationEndpoint,
    });
    (KEYCLOAK_CONFIG as any).clientId = 'test-client-id';
    
    // Setup handleApiError mock
    (handleApiError as jest.Mock).mockImplementation((error) => error);
  });

  describe('revokeToken', () => {
    describe('Successful Revocation', () => {
      it('should successfully revoke a refresh token', async () => {
        const mockFetch = jest.fn().mockResolvedValue({
          ok: true,
          status: 200,
        });
        global.fetch = mockFetch;

        const result = await revokeToken(mockRealm, mockToken, 'refresh_token');

        expect(result).toBe(true);
        expect(mockFetch).toHaveBeenCalledWith(
          mockRevocationEndpoint,
          expect.objectContaining({
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          })
        );

        // Verify the body contains correct parameters
        const callArgs = mockFetch.mock.calls[0];
        const body = callArgs[1].body;
        expect(body).toContain('client_id=test-client-id');
        expect(body).toContain(`token=${mockToken}`);
        expect(body).toContain('token_type_hint=refresh_token');
      });

      it('should successfully revoke an access token', async () => {
        const mockFetch = jest.fn().mockResolvedValue({
          ok: true,
          status: 200,
        });
        global.fetch = mockFetch;

        const result = await revokeToken(mockRealm, mockToken, 'access_token');

        expect(result).toBe(true);
        
        const callArgs = mockFetch.mock.calls[0];
        const body = callArgs[1].body;
        expect(body).toContain('token_type_hint=access_token');
      });

      it('should default to refresh_token when token type is not specified', async () => {
        const mockFetch = jest.fn().mockResolvedValue({
          ok: true,
          status: 200,
        });
        global.fetch = mockFetch;

        await revokeToken(mockRealm, mockToken);

        const callArgs = mockFetch.mock.calls[0];
        const body = callArgs[1].body;
        expect(body).toContain('token_type_hint=refresh_token');
      });

      it('should use the correct discovery endpoint for the given realm', async () => {
        const mockFetch = jest.fn().mockResolvedValue({
          ok: true,
          status: 200,
        });
        global.fetch = mockFetch;

        await revokeToken(mockRealm, mockToken);

        expect(KEYCLOAK_CONFIG.getDiscovery).toHaveBeenCalledWith(mockRealm);
        expect(mockFetch).toHaveBeenCalledWith(
          mockRevocationEndpoint,
          expect.any(Object)
        );
      });

      it('should log success message when token is revoked', async () => {
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
        const mockFetch = jest.fn().mockResolvedValue({
          ok: true,
          status: 200,
        });
        global.fetch = mockFetch;

        await revokeToken(mockRealm, mockToken);

        expect(consoleSpy).toHaveBeenCalledWith('✅ Token revoked successfully');
        consoleSpy.mockRestore();
      });
    });

    describe('Failed Revocation', () => {
      it('should return false when revocation fails with non-ok response', async () => {
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
        const mockFetch = jest.fn().mockResolvedValue({
          ok: false,
          status: 400,
        });
        global.fetch = mockFetch;

        const result = await revokeToken(mockRealm, mockToken);

        expect(result).toBe(false);
        expect(consoleSpy).toHaveBeenCalledWith('⚠️ Failed to revoke token:', 400);
        consoleSpy.mockRestore();
      });

      it('should return false when revocation fails with 401 unauthorized', async () => {
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
        const mockFetch = jest.fn().mockResolvedValue({
          ok: false,
          status: 401,
        });
        global.fetch = mockFetch;

        const result = await revokeToken(mockRealm, mockToken);

        expect(result).toBe(false);
        expect(consoleSpy).toHaveBeenCalledWith('⚠️ Failed to revoke token:', 401);
        consoleSpy.mockRestore();
      });

      it('should return false when revocation fails with 500 server error', async () => {
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
        const mockFetch = jest.fn().mockResolvedValue({
          ok: false,
          status: 500,
        });
        global.fetch = mockFetch;

        const result = await revokeToken(mockRealm, mockToken);

        expect(result).toBe(false);
        expect(consoleSpy).toHaveBeenCalledWith('⚠️ Failed to revoke token:', 500);
        consoleSpy.mockRestore();
      });
    });

    describe('Error Handling', () => {
      it('should throw error when fetch throws network error', async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
        const networkError = new Error('Network error');
        const mockFetch = jest.fn().mockRejectedValue(networkError);
        global.fetch = mockFetch;

        (handleApiError as jest.Mock).mockReturnValue(new Error('Handled network error'));

        await expect(revokeToken(mockRealm, mockToken)).rejects.toThrow('Handled network error');
        
        expect(consoleErrorSpy).toHaveBeenCalledWith('❌ Error revoking token:', networkError);
        expect(handleApiError).toHaveBeenCalledWith(networkError);
        consoleErrorSpy.mockRestore();
      });

      it('should throw error when KEYCLOAK_CONFIG.getDiscovery throws', async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
        const configError = new Error('Invalid realm');
        (KEYCLOAK_CONFIG.getDiscovery as jest.Mock).mockImplementation(() => {
          throw configError;
        });

        (handleApiError as jest.Mock).mockReturnValue(new Error('Handled config error'));

        await expect(revokeToken(mockRealm, mockToken)).rejects.toThrow('Handled config error');
        
        expect(consoleErrorSpy).toHaveBeenCalledWith('❌ Error revoking token:', configError);
        expect(handleApiError).toHaveBeenCalledWith(configError);
        consoleErrorSpy.mockRestore();
      });

      it('should handle fetch timeout error', async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
        const timeoutError = new Error('Request timeout');
        const mockFetch = jest.fn().mockRejectedValue(timeoutError);
        global.fetch = mockFetch;

        (handleApiError as jest.Mock).mockReturnValue(new Error('Handled timeout error'));

        await expect(revokeToken(mockRealm, mockToken)).rejects.toThrow('Handled timeout error');
        
        expect(handleApiError).toHaveBeenCalledWith(timeoutError);
        consoleErrorSpy.mockRestore();
      });
    });

    describe('Request Parameters', () => {
      it('should send request with correct content-type header', async () => {
        const mockFetch = jest.fn().mockResolvedValue({
          ok: true,
          status: 200,
        });
        global.fetch = mockFetch;

        await revokeToken(mockRealm, mockToken);

        expect(mockFetch).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          })
        );
      });

      it('should send POST request', async () => {
        const mockFetch = jest.fn().mockResolvedValue({
          ok: true,
          status: 200,
        });
        global.fetch = mockFetch;

        await revokeToken(mockRealm, mockToken);

        expect(mockFetch).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            method: 'POST',
          })
        );
      });

      it('should encode parameters correctly in URL-encoded format', async () => {
        const mockFetch = jest.fn().mockResolvedValue({
          ok: true,
          status: 200,
        });
        global.fetch = mockFetch;

        const tokenWithSpecialChars = 'token+with/special=chars';
        await revokeToken(mockRealm, tokenWithSpecialChars);

        const callArgs = mockFetch.mock.calls[0];
        const body = callArgs[1].body;
        
        // URL encoding should be applied
        expect(body).toBeTruthy();
        expect(typeof body).toBe('string');
      });
    });

    describe('Integration Scenarios', () => {
      it('should handle multiple realm configurations', async () => {
        const mockFetch = jest.fn().mockResolvedValue({
          ok: true,
          status: 200,
        });
        global.fetch = mockFetch;

        const realm1 = 'realm-1';
        const realm2 = 'realm-2';

        (KEYCLOAK_CONFIG.getDiscovery as jest.Mock)
          .mockReturnValueOnce({
            revocationEndpoint: 'https://keycloak.test/realms/realm-1/protocol/openid-connect/revoke',
          })
          .mockReturnValueOnce({
            revocationEndpoint: 'https://keycloak.test/realms/realm-2/protocol/openid-connect/revoke',
          });

        await revokeToken(realm1, 'token1');
        await revokeToken(realm2, 'token2');

        expect(KEYCLOAK_CONFIG.getDiscovery).toHaveBeenCalledWith(realm1);
        expect(KEYCLOAK_CONFIG.getDiscovery).toHaveBeenCalledWith(realm2);
        expect(mockFetch).toHaveBeenCalledTimes(2);
      });

      it('should handle empty token gracefully', async () => {
        const mockFetch = jest.fn().mockResolvedValue({
          ok: true,
          status: 200,
        });
        global.fetch = mockFetch;

        await revokeToken(mockRealm, '');

        const callArgs = mockFetch.mock.calls[0];
        const body = callArgs[1].body;
        expect(body).toContain('token=');
      });
    });
  });
});

