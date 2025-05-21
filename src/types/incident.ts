export type IncidentCategory =
  | 'OTHERS'
  | 'SECURITY'
  | 'OPERATIONAL'
  | 'TECHNICAL'
  | 'PERFORMANCE';

export type IncidentSeverity =
  | 'MINIMAL'
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'CRITICAL';

export type IncidentStatus = 'NEW' | 'IN_PROGRESS' | 'RESOLVED';

export type Incident = {
  id: string;
  name: string;
  description: string;
  location?: string;
  reported_by: string;
  date?: string;
  type: IncidentCategory;
  severity: IncidentSeverity;
  status: IncidentStatus;
  attributes?: Record<string, unknown> | null;
  backdated?: boolean;
  created_at: string;
  created_by: string;
  next_update?: number;
  occ_lock?: number;
  resolved_date?: string | null;
  tenant_id: string;
  updated_at: string;
  updated_by: string;
};
