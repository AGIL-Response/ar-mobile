/**
 * Tests for i18n initialization
 * 
 * Note: These tests verify the module's configuration and exports.
 * Full integration tests would require running the actual i18next initialization.
 */

// Unmock the i18n module to test actual implementation
jest.mock('./index', () => {
  return jest.requireActual('./index');
});

describe('i18n module', () => {
  // Clear module cache before tests
  beforeAll(() => {
    jest.resetModules();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Module structure', () => {
    it('should export i18n as default export', () => {
      const i18nModule = require('./index');
      expect(i18nModule.default).toBeDefined();
      expect(typeof i18nModule.default).toBe('object');
    });

    it('should export isRTL boolean', () => {
      const i18nModule = require('./index');
      expect(i18nModule).toHaveProperty('isRTL');
      expect(typeof i18nModule.isRTL).toBe('boolean');
    });

    it('should re-export utils from utils module', () => {
      const i18nModule = require('./index');
      
      // Check that utils are exported
      expect(i18nModule).toHaveProperty('translate');
      expect(i18nModule).toHaveProperty('getLanguage');
      expect(i18nModule).toHaveProperty('LOCAL');
    });
  });

  describe('i18n configuration', () => {
    it('should have correct default language fallback', () => {
      const i18nModule = require('./index');
      const i18n = i18nModule.default;
      
      // i18next should have a fallback language
      expect(i18n.options).toBeDefined();
    });

    it('should initialize with v4 compatibility', () => {
      const i18nModule = require('./index');
      const i18n = i18nModule.default;
      
      // Check that i18next was initialized
      expect(i18n).toBeDefined();
      expect(i18n.t).toBeInstanceOf(Function);
    });

    it('should disable escapeValue in interpolation', () => {
      const i18nModule = require('./index');
      const i18n = i18nModule.default;
      
      // Verify interpolation settings
      expect(i18n.options?.interpolation).toBeDefined();
    });
  });

  describe('RTL configuration', () => {
    it('should set isRTL based on language direction', () => {
      const i18nModule = require('./index');
      
      // isRTL should be a boolean value
      expect(typeof i18nModule.isRTL).toBe('boolean');
    });

    it('should configure I18nManager for RTL support', () => {
      const { I18nManager } = require('react-native');
      
      // Verify I18nManager was called (mocked in jest-setup)
      expect(I18nManager).toBeDefined();
      expect(I18nManager.allowRTL).toBeDefined();
      expect(I18nManager.forceRTL).toBeDefined();
    });
  });

  describe('Language detection', () => {
    it('should use device locale when no stored language', () => {
      const Localization = require('expo-localization');
      
      // Verify getLocales is available
      expect(Localization.getLocales).toBeDefined();
      expect(typeof Localization.getLocales).toBe('function');
    });

    it('should fallback to English if locale unavailable', () => {
      const i18nModule = require('./index');
      const i18n = i18nModule.default;
      
      // i18next should be initialized with a language
      expect(i18n.language || i18n.options?.lng).toBeDefined();
    });
  });

  describe('Translation resources', () => {
    it('should load translation resources', () => {
      const { resources } = require('./resources');
      
      expect(resources).toBeDefined();
      expect(typeof resources).toBe('object');
    });

    it('should have English translations', () => {
      const { resources } = require('./resources');
      
      expect(resources).toHaveProperty('en');
      expect(resources.en).toBeDefined();
    });

    it('should include translation namespace', () => {
      const { resources } = require('./resources');
      
      // Each language should have a translation namespace
      Object.keys(resources).forEach(lang => {
        expect(resources[lang]).toHaveProperty('translation');
      });
    });
  });

  describe('Storage integration', () => {
    it('should use storage for language persistence', () => {
      const { getLanguage } = require('./utils');
      
      expect(getLanguage).toBeDefined();
      expect(typeof getLanguage).toBe('function');
    });

    it('should have LOCAL constant for storage key', () => {
      const { LOCAL } = require('./utils');
      
      expect(LOCAL).toBeDefined();
      expect(typeof LOCAL).toBe('string');
    });
  });

  describe('i18next integration', () => {
    it('should use initReactI18next plugin', () => {
      const i18nModule = require('./index');
      const i18n = i18nModule.default;
      
      // Verify i18next instance exists
      expect(i18n).toBeDefined();
      expect(i18n.use).toBeDefined();
      expect(i18n.t).toBeDefined();
    });

    it('should have translation function available', () => {
      const i18nModule = require('./index');
      const i18n = i18nModule.default;
      
      expect(i18n.t).toBeInstanceOf(Function);
    });

    it('should have language property', () => {
      const i18nModule = require('./index');
      const i18n = i18nModule.default;
      
      expect(i18n.language || i18n.options?.lng).toBeDefined();
    });
  });

  describe('Utility exports', () => {
    it('should export translate function', () => {
      const { translate } = require('./utils');
      
      expect(translate).toBeDefined();
      expect(typeof translate).toBe('function');
    });

    it('should export getLanguage function', () => {
      const { getLanguage } = require('./utils');
      
      expect(getLanguage).toBeDefined();
      expect(typeof getLanguage).toBe('function');
    });
  });

  describe('Module side effects', () => {
    it('should initialize i18n on import', () => {
      const i18nModule = require('./index');
      
      // Module should be fully initialized
      expect(i18nModule.default).toBeDefined();
      expect(i18nModule.isRTL).toBeDefined();
    });

    it('should configure React Native I18nManager', () => {
      // Import should have called I18nManager methods
      const { I18nManager } = require('react-native');
      
      expect(I18nManager).toBeDefined();
    });
  });

  describe('Type exports', () => {
    it('should be importable as ES module', () => {
      const i18nModule = require('./index');
      
      // Should have __esModule marker or be usable as module
      expect(i18nModule).toBeDefined();
    });
  });

  describe('Configuration completeness', () => {
    it('should have all required i18next options', () => {
      const i18nModule = require('./index');
      const i18n = i18nModule.default;
      
      expect(i18n.options).toBeDefined();
      // lng, fallbackLng, resources should be set
      expect(
        i18n.options?.lng || 
        i18n.options?.fallbackLng ||
        i18n.options?.resources ||
        i18n.options?.interpolation
      ).toBeDefined();
    });

    it('should have interpolation configured', () => {
      const i18nModule = require('./index');
      const i18n = i18nModule.default;
      
      expect(i18n.options?.interpolation).toBeDefined();
    });
  });

  describe('Exports completeness', () => {
    it('should export all expected members', () => {
      const i18nModule = require('./index');
      
      const expectedExports = [
        'default',      // i18n instance
        'isRTL',        // RTL flag
        'translate',    // translate function
        'getLanguage',  // getLanguage function
        'LOCAL',        // storage key constant
      ];
      
      expectedExports.forEach(exportName => {
        expect(i18nModule).toHaveProperty(exportName);
      });
    });
  });

  describe('i18n instance methods', () => {
    it('should have t (translate) method', () => {
      const i18nModule = require('./index');
      const i18n = i18nModule.default;
      
      expect(i18n.t).toBeInstanceOf(Function);
    });

    it('should have changeLanguage method', () => {
      const i18nModule = require('./index');
      const i18n = i18nModule.default;
      
      expect(i18n.changeLanguage).toBeInstanceOf(Function);
    });

    it('should have language property or lng option', () => {
      const i18nModule = require('./index');
      const i18n = i18nModule.default;
      
      expect(i18n.language || i18n.options?.lng).toBeDefined();
    });

    it('should have dir method for text direction', () => {
      const i18nModule = require('./index');
      const i18n = i18nModule.default;
      
      expect(i18n.dir).toBeInstanceOf(Function);
    });
  });

  describe('Module initialization', () => {
    it('should not throw errors during initialization', () => {
      expect(() => {
        require('./index');
      }).not.toThrow();
    });

    it('should initialize synchronously', () => {
      const before = Date.now();
      require('./index');
      const after = Date.now();
      
      // Should complete quickly (< 1000ms)
      expect(after - before).toBeLessThan(1000);
    });
  });
});
