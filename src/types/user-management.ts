export type User = {
  id: string;
  fullName: string;
  email: string;
  username: string;
  emailVerified: boolean;
  createdAt: string;
  enabled: boolean;
  updatedAt: string;
  roles: Role[];
  avatarId?: string;
  description?: string;
  location?: {
    type: string;
    coordinates: number[];
  };
  status?: string;
  attributes?: {
    networkMbps?: number;
    batteryPercentage?: number;
  };
};

export type Role = {
  id: string;
  name: string;
  displayName?: string;
  description?: string;
  composite: boolean;
  clientRole: boolean;
  containerId: string;
};

export type UserResponse = {
  id: string;
  username: string;
  email: string;
  fullName: string;
  enabled: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  attributes?: Record<string, string[]>;
  description?: string;
  avatarId?: string;
  roles: Role[];
};

export type UsersQueryParams = {
  offset?: number;
  limit?: number;
  search?: string;
  sort?: string;
};

export type UsersResponse = {
  content: UserResponse[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
};

export interface TeamMemberResponse {
  tenantId: string;
  teamId: string;
  userId: string;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
  createdBy: string;
  updatedBy: string | null;
  deletedBy: string | null;
  id: string;
  idpUserId: string;
  username: string;
  email: string;
  fullName: string;
  avatarId?: string;
  description?: string;
  roles: {
    id: string;
    name: string;
    displayName: string;
  }[];
  location?: {
    type: string;
    coordinates: number[];
  };
}

export interface ApiResponse<T> {
  data: T;
}

// Team types
export interface TeamResponse {
  tenantId: string;
  id: string;
  name: string;
  description: string;
  settings: {
    isLocationTracked: boolean;
  };
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
  createdBy: string;
  updatedBy: string | null;
  deletedBy: string | null;
  location: {
    type: string;
    coordinates: number[];
  };
}

export interface ITeam {
  tenantId: string;
  id: string;
  name: string;
  description: string;
  settings: {
    isLocationTracked: boolean;
  };
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
  createdBy: string;
  updatedBy: string | null;
  deletedBy: string | null;
  location: {
    type: string;
    coordinates: number[];
  };
}

export interface TeamsQueryParams {
  sort?: string[];           // Sort by field
  id?: string[];             // Filter by team ID
  userId?: string[];         // Filter by user ID who is a member
  isLocationTracked?: boolean; // Filter by team location tracking
  offset?: number;           // Pagination offset
  limit?: number;            // Pagination limit
  search?: string;           // Search term
  notIds?: string[];         // Exclude team IDs
  count?: boolean;           // Include count
}
