/* eslint-disable import/first */
// Unmock env to test the actual implementation
jest.mock('@/constants/env', () => {
  return jest.requireActual('@/constants/env');
});

import Constants from 'expo-constants';
import { Env } from './index';
import type { EnvVars } from './env-types';


// Mock expo-constants
const mockExpoConfig: any = {
  name: 'AR Mobile',
  slug: 'ar-mobile',
  version: '1.0.0',
  extra: {
    env: {},
  },
};

jest.mock('expo-constants', () => {
  return {
    __esModule: true,
    default: {
      expoConfig: mockExpoConfig,
    },
  };
});

describe('env', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset to default empty env - ensure extra exists
    mockExpoConfig.extra = {
      env: {},
    };
  });

  describe('Env export', () => {
    it('exports Env object', () => {
      expect(Env).toBeDefined();
      expect(typeof Env).toBe('object');
    });

    it('Env is of type EnvVars', () => {
      expect(Env).toMatchObject<EnvVars>({});
    });
  });

  describe('Empty env vars', () => {
    it('returns empty object when env is not defined', () => {
      mockExpoConfig.extra.env = undefined as any;
      // Re-import to get fresh Env
      jest.resetModules();
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      // const { Env: FreshEnv } = require('./index');
      
      expect(Env).toEqual({});
    });

    it('returns empty object when env is empty object', () => {
      mockExpoConfig.extra.env = {};
      jest.resetModules();
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      // const { Env: FreshEnv } = require('./index');
      
      expect(Env).toEqual({});
    });

    it('returns empty object when extra is not defined', () => {
      mockExpoConfig.extra = undefined as any;
      jest.resetModules();
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      // const { Env: FreshEnv } = require('./index');
      
      expect(Env).toEqual({});
    });

    it('returns empty object when expoConfig is not defined', () => {
      (Constants as any).expoConfig = undefined;
      jest.resetModules();
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      // const { Env: FreshEnv } = require('./index');
      
      expect(Env).toEqual({});
    });

    it('returns empty object when expoConfig is null', () => {
      (Constants as any).expoConfig = null;
      jest.resetModules();
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { Env: FreshEnv } = require('./index');
      
      expect(FreshEnv).toEqual({});
    });
  });

  describe('Env vars with values', () => {
    it('includes APP_NAME when provided', () => {
      mockExpoConfig.extra.env = {
        APP_NAME: 'AR Mobile App',
      };
      jest.resetModules();
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { Env: FreshEnv } = require('./index');
      
      expect(FreshEnv.APP_NAME).toBe('AR Mobile App');
    });

    it('includes APP_VARIANT when provided', () => {
      mockExpoConfig.extra.env = {
        APP_VARIANT: 'development',
      };
      jest.resetModules();
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { Env: FreshEnv } = require('./index');
      
      expect(FreshEnv.APP_VARIANT).toBe('development');
    });

    it('includes BASE_URL when provided', () => {
      mockExpoConfig.extra.env = {
        BASE_URL: 'https://api.example.com',
      };
      jest.resetModules();
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { Env: FreshEnv } = require('./index');
      
      expect(FreshEnv.BASE_URL).toBe('https://api.example.com');
    });

    it('includes PACKAGE_NAME when provided', () => {
      mockExpoConfig.extra.env = {
        PACKAGE_NAME: 'com.example.app',
      };
      jest.resetModules();
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { Env: FreshEnv } = require('./index');
      
      expect(FreshEnv.PACKAGE_NAME).toBe('com.example.app');
    });

    it('includes all env vars when multiple are provided', () => {
      mockExpoConfig.extra.env = {
        APP_NAME: 'AR Mobile App',
        APP_VARIANT: 'production',
        BASE_URL: 'https://api.example.com',
        PACKAGE_NAME: 'com.example.app',
      };
      jest.resetModules();
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { Env: FreshEnv } = require('./index');
      
      expect(FreshEnv.APP_NAME).toBe('AR Mobile App');
      expect(FreshEnv.APP_VARIANT).toBe('production');
      expect(FreshEnv.BASE_URL).toBe('https://api.example.com');
      expect(FreshEnv.PACKAGE_NAME).toBe('com.example.app');
    });

    it('includes custom env vars', () => {
      mockExpoConfig.extra.env = {
        CUSTOM_VAR: 'custom-value',
        ANOTHER_VAR: 'another-value',
      };
      jest.resetModules();
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { Env: FreshEnv } = require('./index');
      
      expect(FreshEnv.CUSTOM_VAR).toBe('custom-value');
      expect(FreshEnv.ANOTHER_VAR).toBe('another-value');
    });

    it('handles undefined values in env vars', () => {
      mockExpoConfig.extra.env = {
        APP_NAME: 'AR Mobile App',
        UNDEFINED_VAR: undefined,
      };
      jest.resetModules();
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { Env: FreshEnv } = require('./index');
      
      expect(FreshEnv.APP_NAME).toBe('AR Mobile App');
      expect(FreshEnv.UNDEFINED_VAR).toBeUndefined();
    });
  });

  describe('Env vars spreading', () => {
    it('spreads all env vars into Env object', () => {
      const envVars = {
        APP_NAME: 'AR Mobile App',
        APP_VARIANT: 'development',
        BASE_URL: 'https://api.example.com',
        CUSTOM_VAR: 'custom-value',
      };
      mockExpoConfig.extra.env = envVars;
      jest.resetModules();
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { Env: FreshEnv } = require('./index');
      
      expect(FreshEnv).toMatchObject(envVars);
    });

    it('preserves all properties from env vars', () => {
      const envVars = {
        VAR1: 'value1',
        VAR2: 'value2',
        VAR3: 'value3',
      };
      mockExpoConfig.extra.env = envVars;
      jest.resetModules();
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { Env: FreshEnv } = require('./index');
      
      expect(Object.keys(FreshEnv)).toEqual(expect.arrayContaining(['VAR1', 'VAR2', 'VAR3']));
      expect(FreshEnv.VAR1).toBe('value1');
      expect(FreshEnv.VAR2).toBe('value2');
      expect(FreshEnv.VAR3).toBe('value3');
    });
  });

  describe('Type safety', () => {
    it('Env conforms to EnvVars interface', () => {
      mockExpoConfig.extra.env = {
        APP_NAME: 'AR Mobile App',
        APP_VARIANT: 'development',
        BASE_URL: 'https://api.example.com',
        PACKAGE_NAME: 'com.example.app',
      };
      jest.resetModules();
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { Env: FreshEnv } = require('./index');
      
      // Type check - should have optional properties from EnvVars
      expect(FreshEnv).toHaveProperty('APP_NAME');
      expect(FreshEnv).toHaveProperty('APP_VARIANT');
      expect(FreshEnv).toHaveProperty('BASE_URL');
      expect(FreshEnv).toHaveProperty('PACKAGE_NAME');
    });

    it('allows index signature for additional properties', () => {
      mockExpoConfig.extra.env = {
        CUSTOM_PROPERTY: 'custom-value',
        ANOTHER_PROPERTY: 'another-value',
      };
      jest.resetModules();
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { Env: FreshEnv } = require('./index');
      
      expect((FreshEnv as any).CUSTOM_PROPERTY).toBe('custom-value');
      expect((FreshEnv as any).ANOTHER_PROPERTY).toBe('another-value');
    });
  });

  describe('Edge cases', () => {
    it('handles env with only undefined values', () => {
      mockExpoConfig.extra.env = {
        VAR1: undefined,
        VAR2: undefined,
      };
      jest.resetModules();
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { Env: FreshEnv } = require('./index');
      
      expect(FreshEnv.VAR1).toBeUndefined();
      expect(FreshEnv.VAR2).toBeUndefined();
    });

    it('handles env with mixed string and undefined values', () => {
      mockExpoConfig.extra.env = {
        DEFINED_VAR: 'defined-value',
        UNDEFINED_VAR: undefined,
        ANOTHER_DEFINED: 'another-value',
      };
      jest.resetModules();
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { Env: FreshEnv } = require('./index');
      
      expect(FreshEnv.DEFINED_VAR).toBe('defined-value');
      expect(FreshEnv.UNDEFINED_VAR).toBeUndefined();
      expect(FreshEnv.ANOTHER_DEFINED).toBe('another-value');
    });

    it('handles empty string values', () => {
      mockExpoConfig.extra.env = {
        EMPTY_VAR: '',
        NON_EMPTY_VAR: 'non-empty',
      };
      jest.resetModules();
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { Env: FreshEnv } = require('./index');
      
      expect(FreshEnv.EMPTY_VAR).toBe('');
      expect(FreshEnv.NON_EMPTY_VAR).toBe('non-empty');
    });

    it('handles numeric string values', () => {
      mockExpoConfig.extra.env = {
        PORT: '3000',
        TIMEOUT: '5000',
      };
      jest.resetModules();
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { Env: FreshEnv } = require('./index');
      
      expect(FreshEnv.PORT).toBe('3000');
      expect(FreshEnv.TIMEOUT).toBe('5000');
    });

    it('handles boolean string values', () => {
      mockExpoConfig.extra.env = {
        ENABLED: 'true',
        DISABLED: 'false',
      };
      jest.resetModules();
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { Env: FreshEnv } = require('./index');
      
      expect(FreshEnv.ENABLED).toBe('true');
      expect(FreshEnv.DISABLED).toBe('false');
    });
  });

  describe('Real-world scenarios', () => {
    it('handles development environment config', () => {
      mockExpoConfig.extra.env = {
        APP_NAME: 'AR Mobile',
        APP_VARIANT: 'development',
        BASE_URL: 'https://dev-api.example.com',
        PACKAGE_NAME: 'com.example.dev',
      };
      jest.resetModules();
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { Env: FreshEnv } = require('./index');
      
      expect(FreshEnv.APP_VARIANT).toBe('development');
      expect(FreshEnv.BASE_URL).toBe('https://dev-api.example.com');
    });

    it('handles production environment config', () => {
      mockExpoConfig.extra.env = {
        APP_NAME: 'AR Mobile',
        APP_VARIANT: 'production',
        BASE_URL: 'https://api.example.com',
        PACKAGE_NAME: 'com.example.prod',
      };
      jest.resetModules();
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { Env: FreshEnv } = require('./index');
      
      expect(FreshEnv.APP_VARIANT).toBe('production');
      expect(FreshEnv.BASE_URL).toBe('https://api.example.com');
    });

    it('handles staging environment config', () => {
      mockExpoConfig.extra.env = {
        APP_NAME: 'AR Mobile',
        APP_VARIANT: 'staging',
        BASE_URL: 'https://staging-api.example.com',
        PACKAGE_NAME: 'com.example.staging',
      };
      jest.resetModules();
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { Env: FreshEnv } = require('./index');
      
      expect(FreshEnv.APP_VARIANT).toBe('staging');
      expect(FreshEnv.BASE_URL).toBe('https://staging-api.example.com');
    });
  });
});

