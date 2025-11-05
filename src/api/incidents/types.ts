import type { BaseApiResponse } from '@/types/api';

export type IncidentType = 'fire' | 'emergency' | 'maintenance' | 'security' | 'health' | 'environmental';
export type IncidentStatus = 'reported' | 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
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
  deletedBy?: string | null;
  assigneeId?: string | null;
  teamId?: string | null;
  location?: {
    type: string;
    coordinates: number[];
  };
  taskIds: string[];
  fileIds: string[];
  
  // Legacy fields for backward compatibility
  incidentAssignees?: IncidentAssignee[];
  incidentTasks?: IncidentTask[];
  
  // Additional computed fields for UI
  severity?: IncidentSeverity;
  reportedBy?: string;
}

export interface IncidentsQueryParams {
  offset?: number;
  limit?: number;
  status?: IncidentStatus;
  type?: IncidentType;
  severity?: IncidentSeverity;
  search?: string;
  sort?: string;
  count?: boolean;
}

export type IncidentsResponse = BaseApiResponse<Incident[]>;
export type IncidentResponse = BaseApiResponse<Incident>;

export interface CreateIncidentRequest {
  name: string;
  description: string;
  type: IncidentType;
  location?: {
    coordinates: number[]; // [longitude, latitude, altitude]
  };
}

export interface UpdateIncidentRequest extends Partial<CreateIncidentRequest> {
  id: string;
}
