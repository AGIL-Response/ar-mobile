export type IncidentSeverity = 'low' | 'medium' | 'high';
export type IncidentStatus = 'open' | 'in_progress' | 'closed';
export type IncidentType = 'incident' | 'alert' | 'warning';

export type CreateIncidentRequest = {
  name: string;
  description: string;
  location: [number, number]; // [longitude, latitude]
  reported_by: string;
  date: string;
  type: IncidentType;
  severity: IncidentSeverity;
  status: IncidentStatus;
};

export type IncidentResponse = {
  success: boolean;
  incident?: {
    data: {
      id: string;
      // ... other incident fields
    };
  };
  form?: {
    valid: boolean;
    errors?: Record<string, string>;
  };
};
