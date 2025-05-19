export type GeoEntity = {
  entity_id: string;
  kind: 'aircraft' | string;
  lat: number;
  lon: number;
  callsign: string;
  trackable: boolean;
};

export type Position = {
  latitude: number;
  longtiude: number;
};

export type GeoSearchParams = {
  entity_id?: string;
  kind?: string;
  callsign?: string;
  trackable?: boolean;
};
