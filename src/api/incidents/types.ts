import type { BaseApiResponse } from '@/types/api';

export enum IncidentType {
	FIRE = 'fire',
	SOS = 'sos',
	INTRUSION = 'intrusion',
	HAZARDOUS_MATERIAL = 'hazardous_material',
	NATURAL_DISASTER = 'natural_disaster',
	TECHNICAL_FAILURE = 'technical_failure',
	OTHER = 'other',
}

export enum IncidentStatus {
	REPORTED = 'reported',
	ACKNOWLEDGED = 'acknowledged',
	IN_PROGRESS = 'in_progress',
	RESOLVED = 'resolved',
	CLOSED = 'closed',
}

// Type aliases for backward compatibility (union of enum values)
export type IncidentTypeValue = 
	| IncidentType.FIRE
	| IncidentType.SOS
	| IncidentType.INTRUSION
	| IncidentType.HAZARDOUS_MATERIAL
	| IncidentType.NATURAL_DISASTER
	| IncidentType.TECHNICAL_FAILURE
	| IncidentType.OTHER;

export type IncidentStatusValue =
	| IncidentStatus.REPORTED
	| IncidentStatus.ACKNOWLEDGED
	| IncidentStatus.IN_PROGRESS
	| IncidentStatus.RESOLVED
	| IncidentStatus.CLOSED;

export type IncidentSeverity = 'high' | 'medium' | 'low';

// Incident type options
export const typeIncidentOptions = [
	{ value: 'all', label: 'All Types' },
	{ value: IncidentType.FIRE, label: 'Fire' },
	{ value: IncidentType.SOS, label: 'SOS' },
	{ value: IncidentType.INTRUSION, label: 'Intrusion' },
	{ value: IncidentType.HAZARDOUS_MATERIAL, label: 'Hazardous Material' },
	{ value: IncidentType.NATURAL_DISASTER, label: 'Natural Disaster' },
	{ value: IncidentType.TECHNICAL_FAILURE, label: 'Technical Failure' },
	{ value: IncidentType.OTHER, label: 'Other' },
];

// Incident status options
export const statusIncidentOptions = [
	{ value: 'all', label: 'All Status' },
	{ value: IncidentStatus.REPORTED, label: 'Reported' },
	{ value: IncidentStatus.ACKNOWLEDGED, label: 'Acknowledged' },
	{ value: IncidentStatus.IN_PROGRESS, label: 'In Progress' },
	{ value: IncidentStatus.RESOLVED, label: 'Resolved' },
	{ value: IncidentStatus.CLOSED, label: 'Closed' },
];

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
  type: IncidentTypeValue;
  status: IncidentStatusValue;
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
  status?: IncidentStatusValue;
  type?: IncidentTypeValue;
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
  type: IncidentTypeValue;
  location?: {
    coordinates: number[]; // [longitude, latitude, altitude]
  };
}

export interface UpdateIncidentRequest extends Partial<CreateIncidentRequest> {
  id: string;
}
