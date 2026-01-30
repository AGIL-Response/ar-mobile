import {
  transformGeoEntityResponse,
  transformGeoEntityToRequest,
  type GeoEntity,
  type GeoEntityResponse,
} from './geo-entity';

describe('geo-entity', () => {
  describe('transformGeoEntityResponse', () => {
    it('transforms API response (snake_case) to app type (camelCase) with all fields', () => {
      const apiResponse: GeoEntityResponse = {
        id: 'geo-123',
        entity_id: 'entity-456',
        kind: 'aircraft',
        active: true,
        callsign: 'CALL123',
        gis_id: 'gis-789',
        create_at: '2024-01-01T00:00:00Z',
        update_at: '2024-01-02T00:00:00Z',
      };

      const result = transformGeoEntityResponse(apiResponse);

      expect(result).toEqual({
        id: 'geo-123',
        entityId: 'entity-456',
        kind: 'aircraft',
        active: true,
        callsign: 'CALL123',
        gisId: 'gis-789',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      });
    });

    it('transforms API response with null update_at to null updatedAt', () => {
      const apiResponse: GeoEntityResponse = {
        id: 'geo-123',
        entity_id: 'entity-456',
        kind: 'aircraft',
        active: false,
        callsign: 'CALL456',
        gis_id: 'gis-789',
        create_at: '2024-01-01T00:00:00Z',
        update_at: null,
      };

      const result = transformGeoEntityResponse(apiResponse);

      expect(result.updatedAt).toBeNull();
      expect(result).toEqual({
        id: 'geo-123',
        entityId: 'entity-456',
        kind: 'aircraft',
        active: false,
        callsign: 'CALL456',
        gisId: 'gis-789',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: null,
      });
    });

    it('correctly maps all snake_case fields to camelCase', () => {
      const apiResponse: GeoEntityResponse = {
        id: 'test-id',
        entity_id: 'test-entity-id',
        kind: 'aircraft',
        active: true,
        callsign: 'TEST',
        gis_id: 'test-gis-id',
        create_at: '2024-01-01T00:00:00Z',
        update_at: '2024-01-02T00:00:00Z',
      };

      const result = transformGeoEntityResponse(apiResponse);

      // Verify field name transformations
      expect(result.entityId).toBe(apiResponse.entity_id);
      expect(result.gisId).toBe(apiResponse.gis_id);
      expect(result.createdAt).toBe(apiResponse.create_at);
      expect(result.updatedAt).toBe(apiResponse.update_at);
      
      // Verify unchanged fields
      expect(result.id).toBe(apiResponse.id);
      expect(result.kind).toBe(apiResponse.kind);
      expect(result.active).toBe(apiResponse.active);
      expect(result.callsign).toBe(apiResponse.callsign);
    });

    it('preserves boolean active field', () => {
      const apiResponseActive: GeoEntityResponse = {
        id: 'geo-1',
        entity_id: 'entity-1',
        kind: 'aircraft',
        active: true,
        callsign: 'CALL1',
        gis_id: 'gis-1',
        create_at: '2024-01-01T00:00:00Z',
        update_at: null,
      };

      const apiResponseInactive: GeoEntityResponse = {
        id: 'geo-2',
        entity_id: 'entity-2',
        kind: 'aircraft',
        active: false,
        callsign: 'CALL2',
        gis_id: 'gis-2',
        create_at: '2024-01-01T00:00:00Z',
        update_at: null,
      };

      expect(transformGeoEntityResponse(apiResponseActive).active).toBe(true);
      expect(transformGeoEntityResponse(apiResponseInactive).active).toBe(false);
    });

    it('preserves kind field as aircraft', () => {
      const apiResponse: GeoEntityResponse = {
        id: 'geo-123',
        entity_id: 'entity-456',
        kind: 'aircraft',
        active: true,
        callsign: 'CALL123',
        gis_id: 'gis-789',
        create_at: '2024-01-01T00:00:00Z',
        update_at: null,
      };

      const result = transformGeoEntityResponse(apiResponse);
      expect(result.kind).toBe('aircraft');
    });
  });

  describe('transformGeoEntityToRequest', () => {
    it('transforms app type (camelCase) to API request format (snake_case) omitting id, createdAt, updatedAt', () => {
      const appEntity: Omit<GeoEntity, 'id' | 'createdAt' | 'updatedAt'> = {
        entityId: 'entity-456',
        kind: 'aircraft',
        active: true,
        callsign: 'CALL123',
        gisId: 'gis-789',
      };

      const result = transformGeoEntityToRequest(appEntity);

      expect(result).toEqual({
        entity_id: 'entity-456',
        kind: 'aircraft',
        active: true,
        callsign: 'CALL123',
        gis_id: 'gis-789',
      });

      // Verify omitted fields are not present
      expect(result).not.toHaveProperty('id');
      expect(result).not.toHaveProperty('create_at');
      expect(result).not.toHaveProperty('update_at');
      expect(result).not.toHaveProperty('entityId');
      expect(result).not.toHaveProperty('gisId');
      expect(result).not.toHaveProperty('createdAt');
      expect(result).not.toHaveProperty('updatedAt');
    });

    it('correctly maps all camelCase fields to snake_case', () => {
      const appEntity: Omit<GeoEntity, 'id' | 'createdAt' | 'updatedAt'> = {
        entityId: 'test-entity-id',
        kind: 'aircraft',
        active: false,
        callsign: 'TEST',
        gisId: 'test-gis-id',
      };

      const result = transformGeoEntityToRequest(appEntity);

      // Verify field name transformations
      expect(result.entity_id).toBe(appEntity.entityId);
      expect(result.gis_id).toBe(appEntity.gisId);
      
      // Verify unchanged fields
      expect(result.kind).toBe(appEntity.kind);
      expect(result.active).toBe(appEntity.active);
      expect(result.callsign).toBe(appEntity.callsign);
    });

    it('preserves boolean active field', () => {
      const appEntityActive: Omit<GeoEntity, 'id' | 'createdAt' | 'updatedAt'> = {
        entityId: 'entity-1',
        kind: 'aircraft',
        active: true,
        callsign: 'CALL1',
        gisId: 'gis-1',
      };

      const appEntityInactive: Omit<GeoEntity, 'id' | 'createdAt' | 'updatedAt'> = {
        entityId: 'entity-2',
        kind: 'aircraft',
        active: false,
        callsign: 'CALL2',
        gisId: 'gis-2',
      };

      expect(transformGeoEntityToRequest(appEntityActive).active).toBe(true);
      expect(transformGeoEntityToRequest(appEntityInactive).active).toBe(false);
    });

    it('preserves kind field as aircraft', () => {
      const appEntity: Omit<GeoEntity, 'id' | 'createdAt' | 'updatedAt'> = {
        entityId: 'entity-456',
        kind: 'aircraft',
        active: true,
        callsign: 'CALL123',
        gisId: 'gis-789',
      };

      const result = transformGeoEntityToRequest(appEntity);
      expect(result.kind).toBe('aircraft');
    });

    it('returns object with only required fields for API request', () => {
      const appEntity: Omit<GeoEntity, 'id' | 'createdAt' | 'updatedAt'> = {
        entityId: 'entity-123',
        kind: 'aircraft',
        active: true,
        callsign: 'CALL123',
        gisId: 'gis-123',
      };

      const result = transformGeoEntityToRequest(appEntity);

      // Should only have 5 fields
      expect(Object.keys(result)).toHaveLength(5);
      expect(Object.keys(result)).toEqual([
        'entity_id',
        'kind',
        'active',
        'callsign',
        'gis_id',
      ]);
    });
  });

  describe('Type compatibility', () => {
    it('transformGeoEntityResponse returns GeoEntity type', () => {
      const apiResponse: GeoEntityResponse = {
        id: 'geo-123',
        entity_id: 'entity-456',
        kind: 'aircraft',
        active: true,
        callsign: 'CALL123',
        gis_id: 'gis-789',
        create_at: '2024-01-01T00:00:00Z',
        update_at: null,
      };

      const result = transformGeoEntityResponse(apiResponse);
      
      // Type check - should be assignable to GeoEntity
      const geoEntity: GeoEntity = result;
      expect(geoEntity).toBeDefined();
    });

    it('transformGeoEntityToRequest accepts Omit<GeoEntity, id, createdAt, updatedAt>', () => {
      const appEntity: Omit<GeoEntity, 'id' | 'createdAt' | 'updatedAt'> = {
        entityId: 'entity-456',
        kind: 'aircraft',
        active: true,
        callsign: 'CALL123',
        gisId: 'gis-789',
      };

      const result = transformGeoEntityToRequest(appEntity);
      
      // Type check - should be assignable to Omit<GeoEntityResponse, id, create_at, update_at>
      const request: Omit<GeoEntityResponse, 'id' | 'create_at' | 'update_at'> = result;
      expect(request).toBeDefined();
    });
  });

  describe('Round-trip transformation', () => {
    it('can transform response to app type and back to request format', () => {
      const apiResponse: GeoEntityResponse = {
        id: 'geo-123',
        entity_id: 'entity-456',
        kind: 'aircraft',
        active: true,
        callsign: 'CALL123',
        gis_id: 'gis-789',
        create_at: '2024-01-01T00:00:00Z',
        update_at: '2024-01-02T00:00:00Z',
      };

      // Transform to app type
      const appEntity = transformGeoEntityResponse(apiResponse);

      // Transform back to request format (omitting id, createdAt, updatedAt)
      const request = transformGeoEntityToRequest({
        entityId: appEntity.entityId,
        kind: appEntity.kind,
        active: appEntity.active,
        callsign: appEntity.callsign,
        gisId: appEntity.gisId,
      });

      // Should match original API response fields (excluding id, timestamps)
      expect(request.entity_id).toBe(apiResponse.entity_id);
      expect(request.kind).toBe(apiResponse.kind);
      expect(request.active).toBe(apiResponse.active);
      expect(request.callsign).toBe(apiResponse.callsign);
      expect(request.gis_id).toBe(apiResponse.gis_id);
    });
  });
});

