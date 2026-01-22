import { generateUUID, generateClientId } from './uuid';

describe('UUID utility functions', () => {
  describe('generateUUID', () => {
    it('should generate a valid UUID v4 format', () => {
      const uuid = generateUUID();
      
      // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      
      expect(uuid).toMatch(uuidRegex);
    });

    it('should have correct structure with hyphens', () => {
      const uuid = generateUUID();
      const parts = uuid.split('-');
      
      expect(parts).toHaveLength(5);
      expect(parts[0]).toHaveLength(8);
      expect(parts[1]).toHaveLength(4);
      expect(parts[2]).toHaveLength(4);
      expect(parts[3]).toHaveLength(4);
      expect(parts[4]).toHaveLength(12);
    });

    it('should have "4" as first character of third section (version)', () => {
      const uuid = generateUUID();
      const parts = uuid.split('-');
      
      expect(parts[2][0]).toBe('4');
    });

    it('should have valid variant bits in fourth section', () => {
      const uuid = generateUUID();
      const parts = uuid.split('-');
      
      // First character of fourth section should be 8, 9, a, or b
      const firstChar = parts[3][0].toLowerCase();
      expect(['8', '9', 'a', 'b']).toContain(firstChar);
    });

    it('should generate unique UUIDs', () => {
      const uuid1 = generateUUID();
      const uuid2 = generateUUID();
      const uuid3 = generateUUID();
      
      expect(uuid1).not.toBe(uuid2);
      expect(uuid2).not.toBe(uuid3);
      expect(uuid1).not.toBe(uuid3);
    });

    it('should only contain hexadecimal characters and hyphens', () => {
      const uuid = generateUUID();
      const withoutHyphens = uuid.replace(/-/g, '');
      
      expect(withoutHyphens).toMatch(/^[0-9a-f]+$/i);
    });

    it('should be lowercase', () => {
      const uuid = generateUUID();
      
      expect(uuid).toBe(uuid.toLowerCase());
    });

    it('should have total length of 36 characters', () => {
      const uuid = generateUUID();
      
      expect(uuid).toHaveLength(36);
    });

    it('should generate different UUIDs on consecutive calls', () => {
      const uuids: string[] = [];
      
      for (let i = 0; i < 10; i++) {
        uuids.push(generateUUID());
      }
      
      const uniqueUuids = new Set(uuids);
      expect(uniqueUuids.size).toBe(10);
    });

    it('should conform to RFC 4122 version 4 format', () => {
      const uuid = generateUUID();
      
      // Check format
      expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });

    it('should handle rapid successive calls', () => {
      const uuids = Array.from({ length: 1000 }, () => generateUUID());
      const uniqueUuids = new Set(uuids);
      
      expect(uniqueUuids.size).toBe(1000);
    });
  });
  describe('generateClientId', () => {
    it('should generate client ID with correct prefix', () => {
      const clientId = generateClientId();
      
      expect(clientId).toMatch(/^client-\d+-[a-z0-9]+$/);
    });

    it('should start with "client-"', () => {
      const clientId = generateClientId();
      
      expect(clientId.startsWith('client-')).toBe(true);
    });

    it('should contain timestamp', () => {
      const beforeTimestamp = Date.now();
      const clientId = generateClientId();
      const afterTimestamp = Date.now();
      
      const parts = clientId.split('-');
      const timestamp = parseInt(parts[1], 10);
      
      expect(timestamp).toBeGreaterThanOrEqual(beforeTimestamp);
      expect(timestamp).toBeLessThanOrEqual(afterTimestamp);
    });

    it('should have three parts separated by hyphens', () => {
      const clientId = generateClientId();
      const parts = clientId.split('-');
      
      expect(parts.length).toBeGreaterThanOrEqual(3);
      expect(parts[0]).toBe('client');
      expect(parts[1]).toMatch(/^\d+$/); // timestamp
      expect(parts[2]).toMatch(/^[a-z0-9]+$/); // random string
    });

    it('should generate unique client IDs', () => {
      const clientId1 = generateClientId();
      const clientId2 = generateClientId();
      const clientId3 = generateClientId();
      
      expect(clientId1).not.toBe(clientId2);
      expect(clientId2).not.toBe(clientId3);
      expect(clientId1).not.toBe(clientId3);
    });

    it('should include random component of 9 characters', () => {
      const clientId = generateClientId();
      const parts = clientId.split('-');
      const randomPart = parts[2];
      
      expect(randomPart).toHaveLength(9);
      expect(randomPart).toMatch(/^[a-z0-9]+$/);
    });

    it('should generate 100 unique client IDs', () => {
      const clientIds = new Set<string>();
      
      for (let i = 0; i < 100; i++) {
        clientIds.add(generateClientId());
      }
      
      expect(clientIds.size).toBe(100);
    });

    it('should have increasing timestamps for sequential calls', () => {
      const clientId1 = generateClientId();
      const clientId2 = generateClientId();
      
      const timestamp1 = parseInt(clientId1.split('-')[1], 10);
      const timestamp2 = parseInt(clientId2.split('-')[1], 10);
      
      expect(timestamp2).toBeGreaterThanOrEqual(timestamp1);
    });

    it('should only contain alphanumeric characters and hyphens', () => {
      const clientId = generateClientId();
      
      expect(clientId).toMatch(/^[a-z0-9-]+$/);
    });

    it('should be suitable for tracking message status', () => {
      const clientId = generateClientId();
      
      // Should be a string
      expect(typeof clientId).toBe('string');
      
      // Should not be empty
      expect(clientId.length).toBeGreaterThan(0);
      
      // Should be unique
      const clientId2 = generateClientId();
      expect(clientId).not.toBe(clientId2);
    });

    it('should handle rapid successive calls', () => {
      const clientIds = Array.from({ length: 100 }, () => generateClientId());
      const uniqueClientIds = new Set(clientIds);
      
      expect(uniqueClientIds.size).toBe(100);
    });

    it('should have different random parts even with same timestamp', () => {
      // Mock Date.now to return same timestamp
      const originalDateNow = Date.now;
      const fixedTimestamp = 1234567890000;
      Date.now = jest.fn(() => fixedTimestamp);
      
      const clientId1 = generateClientId();
      const clientId2 = generateClientId();
      
      // Restore original Date.now
      Date.now = originalDateNow;
      
      // Same timestamp but different random parts
      const parts1 = clientId1.split('-');
      const parts2 = clientId2.split('-');
      
      expect(parts1[1]).toBe(parts2[1]); // Same timestamp
      expect(parts1[2]).not.toBe(parts2[2]); // Different random parts
    });
  });
});

