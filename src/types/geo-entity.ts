// API Response Type (snake_case)
export type GeoEntityResponse = {
  id: string;
  entity_id: string;
  kind: 'aircraft';
  active: boolean;
  callsign: string;
  gis_id: string;
  create_at: string;
  update_at: string | null;
};

// App Usage Type (camelCase)
export type GeoEntity = {
  id: string;
  entityId: string;
  kind: 'aircraft';
  active: boolean;
  callsign: string;
  gisId: string;
  createdAt: string;
  updatedAt: string | null;
};

// Transformation function from API response to app type
export function transformGeoEntityResponse(
  response: GeoEntityResponse
): GeoEntity {
  return {
    id: response.id,
    entityId: response.entity_id,
    kind: response.kind,
    active: response.active,
    callsign: response.callsign,
    gisId: response.gis_id,
    createdAt: response.create_at,
    updatedAt: response.update_at,
  };
}

// Transformation function from app type to API request
export function transformGeoEntityToRequest(
  entity: Omit<GeoEntity, 'id' | 'createdAt' | 'updatedAt'>
): Omit<GeoEntityResponse, 'id' | 'create_at' | 'update_at'> {
  return {
    entity_id: entity.entityId,
    kind: entity.kind,
    active: entity.active,
    callsign: entity.callsign,
    gis_id: entity.gisId,
  };
}
