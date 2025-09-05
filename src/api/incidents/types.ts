import type { BaseApiResponse } from '@/types/api';

export type IncidentType = 'emergency' | 'maintenance' | 'security' | 'health' | 'environmental';
export type IncidentStatus = 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type IncidentSeverity = 'high' | 'medium' | 'low';

export interface IncidentAssignee {
  id: string;
  userId: string;
  incidentId: string;
  assignedAt: string;
  assignedBy: string;
}

export interface IncidentTask {
  id: string;
  incidentId: string;
  name: string;
  description?: string;
  status: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Incident {
  tenantId: string;
  id: string;
  name: string;
  description: string;
  type: IncidentType;
  status: IncidentStatus;
  createdByType: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  createdBy: string;
  updatedBy?: string | null;
  deletedBy?: string;
  incidentAssignees: IncidentAssignee[];
  incidentTasks: IncidentTask[];
  
  // Additional computed fields for UI
  severity?: IncidentSeverity;
  location?: string;
  reportedBy?: string;
}

export interface IncidentsQueryParams {
  page?: number;
  limit?: number;
  status?: IncidentStatus;
  type?: IncidentType;
  severity?: IncidentSeverity;
  search?: string;
}

export type IncidentsResponse = BaseApiResponse<Incident[]>;
export type IncidentResponse = BaseApiResponse<Incident>;

export interface CreateIncidentRequest {
  name: string;
  description: string;
  type: IncidentType;
  status: IncidentStatus;
  location?: {
    coordinates: number[]; // [longitude, latitude, altitude]
  };
  severity?: IncidentSeverity;
}

export interface UpdateIncidentRequest extends Partial<CreateIncidentRequest> {
  id: string;
}
