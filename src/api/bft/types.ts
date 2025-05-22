export type GeoEntity = {
  entity_id: string;
  kind: 'aircraft' | string;
  latitude: number;
  longitude: number;
  callsign: string;
  trackable: boolean;
};

export type GeoEntityApiResponse = {
  geoResult: {
    id: string;
    entity_id: string;
    kind: string;
    active: boolean;
    gis_id: string;
    create_at: string;
    update_at: string | null;
  };
  kindResult?: string;
  coordinateResult?: {
    id: string;
    geo_id: string;
    longitude: string;
    latitude: string;
    create_at: string;
  };
};

export type Position = {
  latitude: number;
  longitude: number;
};

export type GeoSearchParams = {
  entity_id?: string;
  kind?: string;
  callsign?: string;
  trackable?: boolean;
};
